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
      })
    );
  }

  return new NextResponse(
    JSON.stringify({
      igUserId: response.igUserId,
      googleFolderId: response.googleFolderId,
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

    const existingdata = await prismadb.user.findUnique({
      where: {
        userId,
      },
    });

    if (!existingdata) {
      await prismadb.user.create({
        data: {
          userId,
          igUserId: body.igUserId,
          googleFolderId: body.googleFolderId,
        },
      });
    } else {
      await prismadb.user.update({
        where: {
          userId,
        },
        data: {
          igUserId: body.igUserId,
          googleFolderId: body.googleFolderId,
        },
      });
    }

    return new NextResponse("Success");
  } catch (e) {
    console.error(e);
    return new NextResponse("Error saving settings", { status: 500 });
  }
}
