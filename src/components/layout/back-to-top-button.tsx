"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

export const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Retour en haut"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border/80 bg-card/92 text-foreground shadow-[0_22px_55px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-card dark:shadow-[0_22px_55px_-30px_rgba(2,6,23,0.82)]",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};
