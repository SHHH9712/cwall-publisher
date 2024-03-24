import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col md:flex-row h-full text-left items-center justify-evenly overflow-hidden">
      <div className="text-5xl">
        <h1>Build your Instagram account using: </h1>
        <h1>
          <span className="underline">cwall-publisher</span>
        </h1>
      </div>
      <div className="origin-center scale-90 md:scale-100">
        <SignIn />
      </div>
    </div>
  );
}
