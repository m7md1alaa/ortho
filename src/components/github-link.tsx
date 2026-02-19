import { Github } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function GitHubLink() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <a
          className="flex items-center gap-2 text-zinc-500 transition-colors duration-300 hover:text-[#2d6b6b]"
          href="https://github.com/m7md1alaa/ortho"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Github className="h-4 w-4" />
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>View on GitHub</p>
      </TooltipContent>
    </Tooltip>
  );
}
