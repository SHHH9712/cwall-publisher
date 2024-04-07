import { auth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { imageId: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  console.log("Image Service: delete Image:", params.imageId);

  const image = await prisma.image.findFirst({
    where: { id: parseInt(params.imageId), userId },
  });

  if (!image) {
    return new NextResponse("Not Found", { status: 404 });
  }

  await prisma.image.delete({ where: { id: image.id } });

  return new NextResponse("Deleted", { status: 200 });
}
