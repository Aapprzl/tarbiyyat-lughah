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
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          {/* Mobile: Simple static gradient (no animation, no blur) */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-br from-teal-100 via-teal-50 to-amber-50 dark:from-teal-950 dark:via-zinc-900 dark:to-amber-950 opacity-60"></div>
          
          {/* Desktop: Full Aurora animation */}
          <div
            className={cn(
              `hidden md:block
            [--white-gradient:radial-gradient(at_0%_0%,#ffffff_0%,transparent_50%)]
            [--dark-gradient:radial-gradient(at_0%_0%,#000000_0%,transparent_50%)]
            [--aurora:repeating-linear-gradient(100deg,#0e7065_10%,#14b8a6_15%,#cca352_20%,#0e7065_25%,#095048_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
