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
  }, [uploading, pushing]);

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

  const onTokenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    if (token === "test") {
      setQuota(-999);
      return;
    }
    try {
      const response = await axios.post("/api/quota", {
        token: e.target.value,
      });
      console.log("Quota response:", response.data.data[0].quota_usage);
      setQuota(50 - response.data.data[0].quota_usage);
    } catch (error) {
      setQuota(-1);
    }
  };

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
          placeholder="your token"
          onChange={onTokenChange}
          className="w-full h-10"
        />
        <Link href="https://developers.facebook.com/tools/explorer/">
          <Button
            className="w-full h-10"
            onClick={() =>
              router.push("https://developers.facebook.com/tools/explorer/")
            }
          >
            2. Get Facebook Access Token
          </Button>
        </Link>
        <div className="text-center">
          {quota === -1 ? (
            <h1>🔴 The token is invalid or has expired</h1>
          ) : quota === -2 ? (
            <h1>🟠 Enter a valid token</h1>
          ) : quota === -999 ? (
            <h1>🟢 Test token</h1>
          ) : (
            <h1>🟢 Available quota remaining: {quota}</h1>
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
