import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import axios from "axios";

export async function POST(request: Request) {
  const { token, images } = await request.json();
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const igUserId = await prismadb.user.findUnique({
    where: { userId },
    select: { igUserId: true },
  });

  if (!igUserId) {
    return new Response("Instagram user not found", { status: 404 });
  }

  images.forEach(async (image: any) => {
    try {
      const image_url = `https://drive.google.com/uc?id=${image.googleId}`;
      const header = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${image_url}`,
        {},
        { headers: header }
      );
      console.log("response:", response.data);
      const creationId = response.data.id;
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}`,
        {},
        { headers: header }
      );
      console.log("publishResponse:", publishResponse.data);
      await prismadb.image.update({
        where: { userId, id: image.id },
        data: { toFacebook: true },
      });
    } catch (error) {
      console.error("Push to Instagram error:", error);
      return new Response("Push to Instagram error", { status: 500 });
    }
  });

  return new Response("Pushed to Instagram");
}
