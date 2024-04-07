"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { set } from "react-hook-form";
import { Separator } from "@radix-ui/react-separator";

interface Image {
  id: number;
  name: string;
  fileName: string;
  uploadedAt: string;
  googleId: string;
  toGoogle: boolean;
  toFacebook: boolean;
  status: string;
}

export default function ImageManagement() {
  const { userId } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imagesPerPage] = useState(10);
  const [filterToGoogle, setFilterToGoogle] = useState(true);
  const [filterToFacebook, setFilterToFacebook] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [currentPage, filterToGoogle, filterToFacebook]);

  const fetchImages = async () => {
    const response = await axios.get(
      `/api/images?page=${currentPage}&toGoogle=${filterToGoogle}&toFacebook=${filterToFacebook}`
    );
    setTotalPages(response.data.totalPages);
    setImages(response.data.images);
  };

  const deleteImage = async (imageId: number) => {
    await axios.delete(`/api/images/${imageId}`);
    fetchImages();
  };

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col w-full md:w-5/12 ml-auto mr-auto h-full">
      <div className="mb-4 flex gap-5">
        {/* <Toggle
          pressed={filterToGoogle}
          onPressedChange={(pressed) => setFilterToGoogle(pressed)}
        >
          toGoogle
        </Toggle> */}
        <Toggle
          pressed={filterToFacebook}
          onPressedChange={(pressed) => setFilterToFacebook(pressed)}
        >
          already uploaded
        </Toggle>
      </div>
      <div className="flex-1 w-full">
        <table className="table-auto w-full gap-5">
          <thead>
            <tr className="text-center">
              <th>ID</th>
              <th>Image</th>
              <th>Time</th>
              <th>Delete</th>
            </tr>
          </thead>
          {images.length === 0 && (
            <tbody className="text-center">
              <tr>
                <td colSpan={4}>No images found</td>
              </tr>
            </tbody>
          )}
          <tbody className="text-center">
            {images.map((image: Image) => (
              <tr key={image.id}>
                <td>{image.id}</td>
                <td>
                  <Image
                    width={150}
                    height={150}
                    src={`https://drive.google.com/thumbnail?id=${image.googleId}&sz=w300`}
                    alt={`Image: ${image.name}`}
                    className="ml-1 mr-1"
                  />
                </td>
                <td className="w-24">
                  {new Date(image.uploadedAt).toLocaleString("en-US")}
                </td>
                <td>
                  <Button
                    onClick={() => deleteImage(image.id)}
                    variant="destructive"
                  >
                    X
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row justify-left gap-2 mt-5 overflow-scroll">
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            onClick={() => paginate(index + 1)}
            variant={index + 1 === currentPage ? "default" : "secondary"}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
