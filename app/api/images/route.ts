import prisma from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let whereClause: {
    userId: string;
    toGoogle?: boolean;
    toFacebook?: boolean;
  } = { userId };

  if (searchParams.get("toGoogle") == "true") {
    whereClause.toGoogle = true;
  }
  if (searchParams.get("toGoogle") == "false") {
    whereClause.toGoogle = false;
  }
  if (searchParams.get("toFacebook") == "true") {
    whereClause.toFacebook = true;
  }
  if (searchParams.get("toFacebook") == "false") {
    whereClause.toFacebook = false;
  }

  const pageNumber = searchParams.get("page");

  if (!pageNumber) {
    const images = await prisma.image.findMany({ where: whereClause });
    console.log("Image Service: list Images:", images.length);
    return new NextResponse(JSON.stringify({ images }));
  }

  const page = parseInt(pageNumber || "1");
  const perPage = 10; // Number of images per page

  const totalImages = await prisma.image.count({ where: whereClause });
  const totalPages = Math.ceil(totalImages / perPage);

  const images = await prisma.image.findMany({
    where: whereClause,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { uploadedAt: "desc" },
  });

  console.log("Image Service: list Images:", images.length);

  return new NextResponse(
    JSON.stringify({
      images,
      currentPage: page,
      totalPages,
    })
  );
}
