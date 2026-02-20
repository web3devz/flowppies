"use client";

import { useState, useEffect } from "react";
import Navbar from "../navbar";
import BlurText from "./BlurText";
import Image from "next/image";

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundImage: `url('/back.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    >
      <Navbar />

      {/* Main Text Centered */}
      <div className="font-pixelify absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 space-y-4">
        {isMounted && (
          <>
            <div className="backdrop-blur-md p-4 rounded-lg inline-block">
              <BlurText
                text="Flowppies"
                delay={300}
                animateBy="words"
                direction="top"
                onAnimationComplete={() => console.log("Animation completed!")}
                className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg tracking-wide"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              {["/generate", "/showcase", "/leaderboard"].map((href, i) => (
                <button
                  key={i}
                  onClick={() => (window.location.href = href)}
                  className="px-12 py-3 text-white border-2 border-white font-pixelify rounded-md shadow-md hover:bg-[#6a994e] transition"
                >
                  {href === "/generate" && "Mint Your Own Pet"}
                  {href === "/showcase" && "Showcase"}
                  {href === "/leaderboard" && "Leaderboard"}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cat - Bottom Left */}
      <div className="absolute bottom-0 left-4 z-10">
        {isMounted && (
          <Image
            src="/cat.gif"
            alt="Cat"
            width={280}
            height={280}
            style={{ objectFit: "contain" }}
          />
        )}
      </div>

      {/* Dog - Bottom Right */}
      <div className="absolute bottom-0 right-4 z-10">
        {isMounted && (
          <Image
            src="/dog.gif"
            alt="Dog"
            width={280}
            height={280}
            style={{ objectFit: "contain" }}
          />
        )}
      </div>
    </div>
  );
}
