import prisma from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const images = await prisma.image.findMany({
    where: {
      userId,
      toGoogle: true,
      toFacebook: false,
    }
  });
  console.log("images:", images)

  return new NextResponse(JSON.stringify({ images }));
}