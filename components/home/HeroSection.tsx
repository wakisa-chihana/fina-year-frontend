import Image from "next/image";
import React from "react";
import { RiArrowRightUpLine } from "react-icons/ri";

const HeroSection = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row justify-between py-4 relative">
      
      <div className="h-[100px] w-full md:w-auto flex items-center justify-center md:justify-start mt-40 px-4 mb-4 md:absolute md:top-4 md:left-4">
        <div className="flex w-[150px] md:w-[200px] rounded-3xl 
                        animate-[fadeIn_1s_ease-in-out,float_6s_ease-in-out_infinite] 
                        hover:animate-pulse hover:scale-105 transition-all duration-300
                        ">
          <Image
            src="/sports_analytics_logo.png"
            alt="Player"
            width={200}
            height={200}
            className="rounded-3xl w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Left Content - Pushed down on mobile (unchanged) */}
      <div className="w-full md:w-[50%] relative md:mt-[30%] mt-[15%] px-4 md:px-0">
        <div>
          <p className="md:mt-20 text-gray-600 animated slideInDown text-center md:text-left">
            Your roadmap to team success
          </p>
          <p className="text-dark text-4xl md:text-6xl animated fadeIn text-center md:text-left leading-tight mt-4">
            Performance Analytics for players
          </p>
          <div className="flex justify-center md:justify-start">
            <button className="mt-8 border-2 py-2 px-6 rounded-full text-sm text-dark border-dark hover:scale-110 relative animated slideInUp">
              Get Started
              <div className="p-1 bg-blue-200 absolute -right-[10%] rounded-full top-[20%]">
                <RiArrowRightUpLine color="white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Right Image - Below content on mobile (unchanged) */}
      <div className="w-full md:w-[40%] rounded-3xl animated fadeIn mt-8 md:mt-0 h-[40vh] md:h-auto md:mb-10">
        <Image
          src="/player2.jpeg"
          alt="Player"
          width={1000}
          height={1000}
          className="rounded-3xl w-full h-full object-cover mb-10"
          priority
        />
      </div>
    </div>
  );
};

export default HeroSection;