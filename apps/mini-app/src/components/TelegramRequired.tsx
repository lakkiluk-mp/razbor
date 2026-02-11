const BOT_URL = "https://t.me/razbor_s_bot";
import Image from "../assets/IMG_5784.PNG";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.8, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[70rem] md:h-[90rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-[320px] md:max-w-[380px] -mt-12 mx-auto h-[650px] md:h-[800px] w-full border-[8px] md:border-[12px] border-[#1a1a1a] p-1 bg-[#09090b] rounded-[48px] md:rounded-[60px] shadow-2xl relative"
    >
      {/* iPhone Notch/Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 md:w-32 md:h-8 bg-[#1a1a1a] rounded-b-2xl z-20" />

      <div className="h-full w-full overflow-hidden rounded-[38px] md:rounded-[50px] bg-zinc-900">
        {children}
      </div>
    </motion.div>
  );
};

export function TelegramRequired() {
  return (
    <div className="flex flex-col bg-zinc-950">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center justify-center px-6 text-center mb-10">
            <h1 className="mb-3 text-3xl md:text-5xl text-white font-rimma">
              В разборе
            </h1>
            <h2 className="mb-3 text-3xl md:text-5xl font-bold text-white">
              Откройте в Telegram
            </h2>
            <p className="text-base md:text-lg text-zinc-400 max-w-md">
              Это приложение доступно только через официальный бот Razbor
            </p>
          </div>
        }
      >
        <div className="relative h-full w-full">
          <img
            src={Image}
            alt="hero"
            className="mx-auto rounded-none object-cover h-full w-full object-top blur-[6px]"
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <a
              href={BOT_URL}
              className="rounded-xl bg-[#2AABEE] px-8 py-4 font-bold text-white transition-all hover:bg-[#229ED9] active:scale-95 shadow-2xl shadow-black/50 z-30"
            >
              Открыть в Telegram
            </a>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
