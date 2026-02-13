"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () => window.innerWidth <= 768,
  );
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export const LampContainer = ({
  children,
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) => {
  const isMobile = useIsMobile();

  const conicWidth = isMobile ? "20rem" : "30rem";
  const conicInitialWidth = isMobile ? "10rem" : "15rem";
  const lineWidth = isMobile ? "20rem" : "30rem";
  const lineInitialWidth = isMobile ? "10rem" : "15rem";
  const glowWidth = isMobile ? "12rem" : "16rem";
  const glowInitialWidth = isMobile ? "6rem" : "8rem";

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 w-full z-0",
        className,
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: conicInitialWidth }}
          whileInView={{ opacity: 1, width: conicWidth }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, #f59e0b, transparent, transparent)`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible text-white"
        >
          <div className="absolute w-[100%] left-0 bg-neutral-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-neutral-950 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: conicInitialWidth }}
          whileInView={{ opacity: 1, width: conicWidth }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, #f59e0b)`,
          }}
          className="absolute inset-auto left-1/2 h-56 text-white"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-neutral-950 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-neutral-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-neutral-950 blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-36 w-[28rem] max-w-[80vw] -translate-y-1/2 rounded-full bg-amber-500 opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: glowInitialWidth }}
          whileInView={{ width: glowWidth }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 -translate-y-[6rem] rounded-full bg-amber-400 blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: lineInitialWidth }}
          whileInView={{ width: lineWidth }}
          viewport={{ once: true }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 -translate-y-[7rem] bg-amber-400"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-neutral-950"></div>
      </div>

      <div
        className={cn(
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};
