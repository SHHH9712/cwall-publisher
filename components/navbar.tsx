import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { Settings2 } from "lucide-react";

export const Navbar = () => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <div>
          <Link href="/">
            <h1 className="text-3xl">CWALL</h1>
          </Link>
        </div>
        <div className="flex flex-row gap-5 mt-auto">
          <Link href="/settings">
            <Settings2 size={30} strokeWidth={0.5} />
          </Link>
          <UserButton />
        </div>
      </div>
      <Separator />
    </div>
  );
};
