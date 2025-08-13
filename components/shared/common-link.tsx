import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface LinkData {
  href?: string;
  text?: string;
}

const CommonLink = ({ href = "#", text = "View All" }: LinkData) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-blue-600 dark:text-blue-500 hover:text-blue-400 text-sm"
    >
      {text}
      <ChevronRight width={16} height={16} />
    </Link>
  );
};

export default CommonLink;
