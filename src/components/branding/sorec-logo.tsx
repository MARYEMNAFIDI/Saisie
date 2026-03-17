import Image from "next/image";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: {
    image: "h-8 w-auto",
    width: 137,
    height: 32,
  },
  md: {
    image: "h-10 w-auto",
    width: 172,
    height: 40,
  },
  lg: {
    image: "h-14 w-auto",
    width: 241,
    height: 56,
  },
} as const;

export const SorecLogo = ({
  tone = "dark",
  size = "md",
  className,
}: {
  tone?: "dark" | "light";
  size?: keyof typeof sizeClasses;
  className?: string;
}) => {
  const frameClassName =
    tone === "light"
      ? "rounded-[1.15rem] border border-slate-200/60 bg-slate-100/90 px-3 py-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
      : "";

  return (
    <span
      className={cn("inline-flex shrink-0 items-center", frameClassName, className)}
      aria-label="Logo SOREC"
    >
      <Image
        src="/branding/sorec-logo.svg"
        alt="SOREC"
        width={sizeClasses[size].width}
        height={sizeClasses[size].height}
        className={cn("block", sizeClasses[size].image)}
        priority={size === "lg"}
      />
    </span>
  );
};
