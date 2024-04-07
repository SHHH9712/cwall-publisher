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
  const { toast } = useToast();
  const router = useRouter();

  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [gettingQuota, setGettingQuota] = useState(false);
  const [quota, setQuota] = useState(50);
  const [quota_message, setQuotaMessage] = useState("...");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUploadToGoogle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files) {
      setUploading(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      let response;
      try {
        response = await axios.post("/api/googleDrive", formData);
      } catch (error) {
        // console.error("Upload error:", error);
        toast({
          title: "Error",
          description: "Failed to upload images",
          variant: "destructive",
        });
      } finally {
        toast({
          title: "Success",
          description: `${
            response!.data.files.length
          } images uploaded to Google Drive`,
          variant: "default",
        });
        router.refresh();
        setFiles(null);
      }
      setUploading(false);
    }
  };

  const handlePushToInstagram = async () => {
    try {
      setPushing(true);
      const response = await axios.post("/api/instagram", {
        images,
      });
      // console.log("Push to Instagram response:", response.data);
    } catch (error) {
      // console.error("Push to Instagram error:", error);
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

  const handleGetQuota = async () => {
    try {
      setGettingQuota(true);
      const response = await axios.get("/api/instagram");
      const quota_usage = response.data.data[0].quota_usage;
      const isTest = response.data.is_test;
      const message = response.data.quota_message;
      // console.log(`Quota usage: ${quota_usage}, isTest: ${isTest}`);

      setQuotaMessage(isTest ? "🚧 Testing" : "🟢 Quota Remaining");
      setQuota(isTest ? 50 - 666 : quota_usage);
    } catch (error) {
      // console.log(error);
      setQuotaMessage(
        "🔴 Error getting quota, Please confirm token & igUserId"
      );
      setQuota(50);
    } finally {
      setGettingQuota(false);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("/api/images", {
          params: {
            toGoogle: true,
            toFacebook: false,
          },
        });
        console.log("List images response:", response);
        setImages(response.data.images);
      } catch (error) {
        // console.error("List images error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch images",
          variant: "destructive",
        });
      }
    };
    fetchImages();

    handleGetQuota();
  }, [uploading, pushing, toast]);

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex-grow">
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
        <form onSubmit={handleUploadToGoogle}>
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
        <Button
          className="w-full h-10"
          onClick={handleGetQuota}
          disabled={gettingQuota}
        >
          2. Validate Token and Refresh Quota
        </Button>
        <div className="text-center">
          <h1>{`
            ${quota_message}: ${50 - quota}
          `}</h1>
        </div>
        <Button
          className="w-full h-10"
          onClick={handlePushToInstagram}
          disabled={pushing || quota == -1 || quota == -2 || quota == 0}
        >
          3. Push to Instagram
        </Button>
      </div>
    </div>
  );
}
