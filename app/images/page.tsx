"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import prisma from "@/lib/prismadb";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { set } from "react-hook-form";

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
    console.log(response);
    setTotalPages(response.data.totalPages);
    setImages(response.data.images);
    console.log(images.length);
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
        <table className="table-auto w-full">
          <thead>
            <tr className="text-center">
              <th>ID</th>
              <th>Image</th>
              <th>Time</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {images.map((image: Image) => (
              <tr key={image.id}>
                <td>{image.id}</td>
                <td>
                  <Image
                    width={150}
                    height={150}
                    src={`https://drive.google.com/thumbnail?id=${image.googleId}&sz=w300`}
                    alt={image.name}
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
      <div className="flex flex-row justify-center gap-2 mt-5">
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
