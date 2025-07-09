import { cardData } from "@/constants/cardData";
import Image from "next/image";
import React from "react";
import { FaUsers, FaChartBar, FaFutbol } from "react-icons/fa";
import { GiSoccerKick, GiSoccerField } from "react-icons/gi";

const Objectives = () => {
  return (
    <div className="min-h-screen py-12 md:py-20 w-full px-4 sm:px-8">
      <p className="text-center text-3xl sm:text-5xl text-dark mb-4 sm:mb-6">Our Objectives</p>
      
      <div className="flex flex-col md:flex-row items-center gap-6 justify-center mt-8 sm:mt-10">
        {cardData?.map((card: any, index: number) => (
          <div
            className="bg-gray-50 p-4 rounded-3xl hover:shadow-lg hover:shadow-dark_blue hover:scale-105 transition-transform duration-300 w-full max-w-sm sm:w-auto"
            key={index?.toString()}
          >
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
              {/* First icon remains unchanged */}
              <div className="h-12 sm:h-14 w-12 sm:w-14 rounded-full border border-opacity-50 shadow-sm flex items-center justify-center">
                <Image
                  src={card?.icons[0]}
                  alt="Analytics"
                  width={100}
                  height={100}
                  className="rounded-full w-full h-full object-contain"
                />
              </div>
              
              {/* Center icon - changed for second and third objectives */}
              <div className="h-32 sm:h-[150px] w-32 sm:w-[150px] rounded-full border border-opacity-50 shadow-lg flex items-center justify-center bg-white">
                {index === 0 ? (
                  <Image
                    src={card?.icons[1]}
                    alt="Analytics"
                    width={100}
                    height={100}
                    className="rounded-full w-full h-full object-contain"
                  />
                ) : index === 1 ? (
                  <GiSoccerKick className="text-blue-600" size={60} />
                ) : (
                  <GiSoccerField className="text-blue-600" size={60} />
                )}
              </div>
              
              {/* Right icon - changed for second and third objectives */}
              <div className="h-12 sm:h-14 w-12 sm:w-14 rounded-full border border-opacity-50 shadow-sm flex items-center justify-center bg-white">
                {index === 0 ? (
                  <Image
                    src={card?.icons[2]}
                    alt="Analytics"
                    width={100}
                    height={100}
                    className="rounded-full w-full h-full object-contain"
                  />
                ) : index === 1 ? (
                  <FaChartBar className="text-blue-500" size={24} />
                ) : (
                  <FaUsers className="text-blue-500" size={24} />
                )}
              </div>
            </div>
            
            <div className="text-dark mt-4">
              <p className="text-lg sm:text-xl text-dark_blue font-medium">{card?.title}</p>
              <p className="text-xs sm:text-sm mt-2">{card?.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Objectives;