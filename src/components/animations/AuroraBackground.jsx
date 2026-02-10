"use client";
import { cn } from "../../utils/cn";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-[var(--color-bg-main)] text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          {/* Clean Background - Aurora Removed as per user request */}
          <div className="absolute inset-0 bg-[var(--color-bg-main)] opacity-100"></div>
        </div>
        {children}
      </div>
    </main>
  );
};
