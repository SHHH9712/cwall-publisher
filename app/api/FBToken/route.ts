import prismadb from "@/lib/prismadb";
import { auth, useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const response = await prismadb.user.findUnique({
    where: { userId },
    select: {
      longLiveFBAccessToken: true,
    },
  });

  return new NextResponse(
    JSON.stringify({
      longLiveFBAccessToken: response?.longLiveFBAccessToken || "",
    })
  );
}
