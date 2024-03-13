import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const Footer = () => {
  return (
    <div className="text-secondary-foreground flex flex-row justify-end text-sm">
      project by{" "}
      <span className="underline ml-1">
        <a href="https://github.com/SHHH9712/cwall-publisher">@sha</a>
      </span>
    </div>
  );
};
