import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import axios from "axios";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await prismadb.user.findUnique({
      where: { userId },
    });
    const igUserId = response?.igUserId;

    const header = {
      Authorization: `Bearer ${body.token}`,
    };

    const quota = await axios.get(
      `https://graph.facebook.com/v18.0/${igUserId}/content_publishing_limit`,
      { headers: header }
    );
    console.log("quota:", quota.data);

    return new Response(JSON.stringify(quota.data), { status: 200 });
  } catch (e) {
    return new Response("Error getting quota", { status: 500 });
  }
}
