import prisma from "@/lib/prismadb";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth, clerkClient } from "@clerk/nextjs";
import { toNodeReadable } from "web-streams-node";
import prismadb from "@/lib/prismadb";

export async function POST(request: Request) {
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
          return new NextResponse(
            JSON.stringify({ error: `Error uploading file ${file.name}` }),
            { status: 500 }
          );
        }

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
        console.error(`Error processing or uploading file ${file.name}:`, err);
        return new NextResponse(
          JSON.stringify({
            error: `Error processing or uploading file ${file.name}`,
          }),
          { status: 500 }
        );
      }
    }
  }

  return new NextResponse(JSON.stringify({ files: uploadedFiles }));
}

async function uploadFile2GoogleDrive(file: File, folderId: string) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [OAuthAccessToken] = await clerkClient.users.getUserOauthAccessToken(
    userId!,
    "oauth_google"
  );
  const { token } = OAuthAccessToken;

  if (!token) {
    return new NextResponse("Error getting Google OAuth token", {
      status: 500,
    });
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

  try {
    const response = await service.files.create({
      requestBody,
      media: media,
    });
    return response.data.id;
  } catch (err) {
    throw err;
  }
}
