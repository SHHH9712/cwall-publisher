"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [token, setToken] = useState<string>("");
  const [gettingQuota, setGettingQuota] = useState(false);
  const [quota, setQuota] = useState(-2);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files) {
      setUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      try {
        const response = await axios.post("/api/googleDrive", formData);
        console.log("Upload response:", response.data.files);
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Error",
          description: "Failed to upload images",
          variant: "destructive",
        });
      }
      setUploading(false);
    }
  };

  const handlePushToInstagram = async () => {
    try {
      setPushing(true);
      const response = await axios.post("/api/instagram", {
        token,
        images,
      });
      console.log("Push to Instagram response:", response.data);
    } catch (error) {
      console.error("Push to Instagram error:", error);
      toast({
        title: "Error",
        description: "Failed to push images to Instagram",
        variant: "destructive",
      });
    } finally {
      setPushing(false);
      router.refresh();
      toast({
        title: "Success",
        description: "Images pushed to Instagram",
        variant: "default",
      });
    }
  };

  const fetchQuota = async () => {
    console.log(token);
    if (token === "test") {
      setQuota(-999);
      return;
    }
    try {
      setGettingQuota(true);
      const response = await axios.post("/api/quota", {
        token: token,
      });
      console.log("Quota response:", response.data.data[0].quota_usage);
      setQuota(50 - response.data.data[0].quota_usage);
    } catch (error) {
      setQuota(-1);
    } finally {
      setGettingQuota(false);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("/api/images");
        setImages(response.data.images);
      } catch (error) {
        console.error("List images error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch images",
          variant: "destructive",
        });
      }
    };
    fetchImages();

    const fetchFBToken = async () => {
      try {
        const tokenRes = await axios.get("/api/FBToken");
        console.log("FBToken response:", tokenRes.data);
        setToken(tokenRes.data.longLiveFBAccessToken);
        const quotaRes = await axios.post("/api/quota", {
          token: tokenRes.data.longLiveFBAccessToken,
        });
        console.log("Quota response:", quotaRes.data.data[0].quota_usage);
        setQuota(quotaRes.data.data[0].quota_usage);
      } catch (error) {
        console.error("FBToken error:", error);
        setQuota(-1);
        toast({
          title: "Error",
          description: "Failed to fetch FBToken",
          variant: "destructive",
        });
      }
    };
    fetchFBToken();
  }, [uploading, pushing, toast]);

  return (
    <>
      <div className="flex-grow min-h-60">
        <h2 className="text-xl font-thin mb-5">Pending Images:</h2>
        <div className="grid grid-cols-3 lg:grid-cols-5 items-center justify-center gap-5">
          {images.map((image: any) => (
            <div key={image.id} className="overflow-clip">
              <Image
                width={300}
                height={300}
                src={`https://drive.google.com/thumbnail?id=${image.googleId}&sz=w300`}
                alt={image.name}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-5">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col justify-center items-center gap-5">
            <Input
              id="images_upload"
              type="file"
              multiple
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            <Button type="submit" disabled={uploading} className="w-full h-10">
              1. Upload to Google Drive
            </Button>
          </div>
        </form>
        <Input
          type="text"
          placeholder="You need to setup the token in settings"
          className="w-full h-10"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
          }}
        />
        <Button className="w-full h-10" onClick={fetchQuota}>
          2. Validate Token
        </Button>
        <div className="text-center">
          {quota === -1 ? (
            <h1>🔴 The token is invalid or has expired</h1>
          ) : quota === -2 ? (
            <h1>🟠 Please test your token</h1>
          ) : quota === -999 ? (
            <h1>🟢 Test token</h1>
          ) : (
            <h1>🟢 Available uploads remaining: {50 - quota}</h1>
          )}
        </div>
        <Button
          className="w-full h-10"
          onClick={handlePushToInstagram}
          disabled={pushing || quota == -1 || quota == -2 || quota == 0}
        >
          3. Push to Instagram
        </Button>
      </div>
    </>
  );
}
