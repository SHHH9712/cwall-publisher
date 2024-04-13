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
import { useAuth, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/upload");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex flex-col justify-around h-full">
      <div className="flex flex-col gap-10">
        <h1 className="text-5xl text-center">
          Welcome to <span className="text-primary">CWALL.cc</span>
        </h1>
        <p className="text-lg">
          This is a tool that help you batch upload images to your instagram
          account. It is currently in Alpha test so please contact me to gain
          access.
        </p>
      </div>
      <div className="flex flex-col gap-5">
        <Button variant={"secondary"}>
          <Link href="mailto:contact@cwall.cc">contact@cwall.cc</Link>
        </Button>
        <Button onClick={() => router.push("/sign-in")}>Signin</Button>
      </div>
    </div>
  );
}
