import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import axios from "axios";

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const response = await prismadb.user.findUnique({
      where: { userId },
    });
    const igUserId = response?.igUserId;
    const token = response?.longLiveFBAccessToken;
    console.log(
      "Instagram API: quota getting igUserId:",
      igUserId,
      "token:",
      token
    );

    if (!igUserId) {
      console.error(
        "Instagram API: Instagram user not found for userId:",
        userId
      );
      return new Response("Instagram user not found", { status: 404 });
    }
    if (!token) {
      console.error("Instagram API: Token not found for userId:", userId);
      return new Response("Token not found, please set token in settings.", {
        status: 404,
      });
    }
    if (token === "test") {
      return new Response(
        JSON.stringify({
          data: [{ quota_usage: 999 }],
          is_test: true,
        }),
        {
          status: 200,
        }
      );
    }

    const header = {
      Authorization: `Bearer ${token}`,
    };

    const quota = await axios.get(
      `https://graph.facebook.com/v18.0/${igUserId}/content_publishing_limit`,
      { headers: header }
    );
    console.log("Instagram API: got quota:", quota.data);

    return new Response(
      JSON.stringify({
        data: [quota.data.data[0]],
        is_test: false,
      }),
      {
        status: 200,
      }
    );
  } catch (e) {
    console.error("Instagram API: Error getting quota:", (e as Error).message);
    return new Response("Error getting quota", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { images } = await request.json();
    const { userId } = auth();

    if (!userId) {
      console.error("Instagram API: Unauthorized access attempt");
      return new Response("Unauthorized", { status: 401 });
    }

    const userResponse = await prismadb.user.findUnique({
      where: { userId },
    });

    const token = userResponse?.longLiveFBAccessToken;
    const igUserId = userResponse?.igUserId;
    if (!token) {
      console.error("Instagram API: Token not found for userId:", userId);
      return new Response("Token not found, please set token in settings.", {
        status: 404,
      });
    }
    if (!igUserId) {
      console.error(
        "Instagram API: Instagram user not found for userId:",
        userId
      );
      return new Response("Instagram user not found", { status: 404 });
    }

    // Test mode
    if (token === "test") {
      await Promise.all(
        images.map((image: { googleId: any; id: any }) => {
          console.log(
            "Instagram API: Test submit for image",
            image.id,
            image.googleId
          );
          return prismadb.image.update({
            where: { userId, id: image.id },
            data: { toFacebook: true, status: "test", uploadedAt: new Date() },
          });
        })
      );
      console.log(
        "Instagram API: Test submit executed for",
        images.length,
        "images."
      );
      return new Response("Test Submit Executed", { status: 200 });
    }

    await Promise.all(
      images.map(async (image: { googleId: any; id: any }) => {
        const image_url = `https://drive.google.com/uc?id=${image.googleId}`;
        const header = {
          Authorization: `Bearer ${token}`,
        };

        try {
          const response = await axios.post(
            `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${image_url}`,
            {},
            { headers: header }
          );
          const creationId = response.data.id;
          const publishResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}`,
            {},
            { headers: header }
          );
          console.log(
            "Instagram API: Publish response for image",
            image.id,
            ":",
            publishResponse.data
          );
          await prismadb.image.update({
            where: { userId, id: image.id },
            data: {
              toFacebook: true,
              status: "published to Instagram",
              uploadedAt: new Date(),
            },
          });
        } catch (error) {
          console.error(
            "Instagram API: Push to Instagram error for image",
            image.id,
            ":",
            error
          );
        }
      })
    );

    console.log(
      "Instagram API: Pushed to Instagram completed for",
      images.length,
      "images."
    );
    return new Response("Pushed to Instagram");
  } catch (error) {
    console.error("Instagram API: Unexpected error in POST function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
