import Image from "next/image";
import React from "react";
import { RiArrowRightUpLine } from "react-icons/ri";

const HeroSection = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-between py-4 relative px-4 sm:px-6">
      {/* Logo */}
      <div className="w-full md:w-auto flex items-center justify-center md:justify-start mt-20 md:mt-40 px-0 mb-6 md:absolute md:top-4 md:left-4">
        <div className="flex w-[120px] sm:w-[150px] md:w-[200px] rounded-3xl 
                        animate-[fadeIn_1s_ease-in-out,float_6s_ease-in-out_infinite] 
                        hover:animate-pulse hover:scale-105 transition-all duration-300">
          <Image
            src="/sports_analytics_logo.png"
            alt="Player"
            width={200}
            height={200}
            className="rounded-3xl w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full md:w-[50%] relative md:mt-[30%] mt-[5%] px-0 md:px-0">
        <div>
          <p className="md:mt-20 text-gray-600 text-sm sm:text-base animated slideInDown text-center md:text-left">
            Your roadmap to team success
          </p>
          <p className="text-dark text-3xl sm:text-4xl md:text-6xl animated fadeIn text-center md:text-left leading-tight mt-3 sm:mt-4">
            Performance Analytics <span className="block sm:inline">for players</span>
          </p>
          <div className="flex justify-center md:justify-start">
            <button className="mt-6 sm:mt-8 border-2 py-2 px-6 rounded-full text-sm text-dark border-dark hover:scale-110 relative animated slideInUp">
              Get Started
              <div className="p-1 bg-blue-500 absolute -right-[10%] rounded-full top-[20%]">
                <RiArrowRightUpLine color="white" size={14} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Image - Enhanced for mobile */}
      <div className="w-full md:w-[40%] rounded-3xl animated fadeIn mt-6 sm:mt-8 md:mt-0 h-[50vh] min-h-[300px] sm:h-[40vh] md:h-auto md:mb-10 relative">
        <Image
          src="/player2.jpeg"
          alt="Basketball player in action"
          fill
          className="rounded-3xl object-cover object-center"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          quality={90}
        />
      </div>
    </div>
  );
};

export default HeroSection;