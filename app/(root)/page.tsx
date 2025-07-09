import HeroSection from "@/components/home/HeroSection";
import HomeTopBar from "@/components/home/HomeTopBar";
import Objectives from "@/components/home/Objectives";
import React from "react";
import { motion } from "framer-motion"; // For animations

const HomePage = () => {


  return (
    <main
      
      className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto "
    >
      <div  className="w-full mb-8 md:mb-14">
        <HomeTopBar />
      </div>

      <div  className="w-full my-8 md:my-12">
        <HeroSection />
      </div>

      <div className="w-full my-8 md:my-16">
        <Objectives />
      </div>
    </main>
  );
};

export default HomePage;