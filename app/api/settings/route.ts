import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const response = await prismadb.user.findUnique({
    where: { userId },
  });

  if (!response) {
    return new NextResponse(
      JSON.stringify({
        igUserId: "",
        googleFolderId: "",
        longLiveFBAccessToken: "",
      })
    );
  }

  return new NextResponse(
    JSON.stringify({
      igUserId: response.igUserId
        ? response.igUserId === "test"
          ? "test"
          : "*****"
        : "",
      googleFolderId: response.googleFolderId ? "*****" : "",
      longLiveFBAccessToken: response.longLiveFBAccessToken
        ? response.longLiveFBAccessToken === "test"
          ? "test"
          : "*****"
        : "",
    })
  );
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const existingData = await prismadb.user.findUnique({
      where: { userId },
    });

    const updateData: any = {};

    if (body.igUserId !== "*****") {
      updateData.igUserId = body.igUserId;
    }
    if (body.googleFolderId !== "*****") {
      updateData.googleFolderId = body.googleFolderId;
    }
    if (body.longLiveFBAccessToken !== "*****") {
      updateData.longLiveFBAccessToken = body.longLiveFBAccessToken;
    }

    if (!existingData) {
      await prismadb.user.create({
        data: {
          userId,
          ...updateData,
        },
      });
    } else {
      await prismadb.user.update({
        where: { userId },
        data: updateData,
      });
    }

    return new NextResponse("Success");
  } catch (e) {
    console.error(e);
    return new NextResponse("Error saving settings", { status: 500 });
  }
}
