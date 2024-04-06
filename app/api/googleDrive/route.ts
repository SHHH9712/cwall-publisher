import prisma from "@/lib/prismadb";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth, clerkClient } from "@clerk/nextjs";
import { toNodeReadable } from "web-streams-node";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const uploadedFiles = [];

    for (const file of files) {
      if (file instanceof File) {
        try {
          // Process the image using Sharp
          const modifiedImageBuffer = await sharp(await file.arrayBuffer())
            .resize({
              width: 800,
              height: 800,
              fit: "contain",
              background: { r: 0, g: 0, b: 0, alpha: 1 },
            })
            .toFormat("jpeg")
            .toBuffer();

          // Create a new File object with the modified image buffer
          const modifiedImageFile = new File(
            [modifiedImageBuffer],
            file.name.split(".")[0] + ".jpeg",
            { type: "image/jpeg" }
          );

          const user = await prismadb.user.findUnique({
            where: { userId },
            select: { googleFolderId: true },
          });

          if (!user || typeof user.googleFolderId !== "string") {
            console.error(
              "GoogleDrive Service: Google Drive folder not found for user:",
              userId
            );
            return new NextResponse(
              JSON.stringify({ error: "Google Drive folder not found" }),
              { status: 404 }
            );
          }

          const fileId = await uploadFile2GoogleDrive(
            modifiedImageFile,
            user.googleFolderId
          );

          if (!fileId || typeof fileId !== "string") {
            console.error(
              `GoogleDrive Service: Error uploading file ${file.name} for user:`,
              userId
            );
            return new NextResponse(
              JSON.stringify({ error: `Error uploading file ${file.name}` }),
              { status: 500 }
            );
          }

          console.log(
            `GoogleDrive Service: Pushed to Google Drive: ${modifiedImageFile.name} with ID: ${fileId}`
          );

          // Create a new entry in the Image table
          await prisma.image.create({
            data: {
              fileName: modifiedImageFile.name,
              googleId: fileId,
              status: "uploaded to google drive",
              toGoogle: true,
              userId: userId,
            },
          });

          uploadedFiles.push({ name: file.name, id: fileId });
        } catch (err) {
          console.error(
            `GoogleDrive Service: Error processing or uploading file ${file.name}:`,
            err
          );
          return new NextResponse(
            JSON.stringify({
              error: `Error processing or uploading file ${file.name}`,
            }),
            { status: 500 }
          );
        }
      }
    }
    console.log(
      `GoogleDrive Service: Uploaded ${uploadedFiles.length} files to Google Drive`
    );

    return new NextResponse(JSON.stringify({ files: uploadedFiles }));
  } catch (err) {
    console.error(
      "GoogleDrive Service: Unexpected error in POST handler:",
      err
    );
    return new NextResponse(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500 }
    );
  }
}

async function uploadFile2GoogleDrive(file: File, folderId: string) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const [OAuthAccessToken] = await clerkClient.users.getUserOauthAccessToken(
      userId!,
      "oauth_google"
    );
    const { token } = OAuthAccessToken;
    if (!token) {
      throw new Error("Error getting Google OAuth token");
    }

    const service = google.drive({
      version: "v3",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const requestBody = {
      name: file.name,
      fields: "id",
      parents: [folderId],
    };

    // Convert the file to a Node.js ReadableStream
    const fileStream = await toNodeReadable(file.stream());
    const media = {
      mimeType: file.type,
      body: fileStream,
    };

    const response = await service.files.create({
      requestBody,
      media: media,
    });

    return response.data.id;
  } catch (err) {
    console.error(
      "GoogleDrive Service: Error uploading file to Google Drive:",
      err
    );
    throw err;
  }
}
