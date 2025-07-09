"use client";

import React, { useState, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const HomeTopBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  useEffect(() => {
    const userId = Cookies.get("x-user-id");
    setIsLoggedIn(!!userId);
  }, []);

  const handleButtonClick = (buttonName: string, route?: string) => {
    setActiveButton(buttonName);
    
    if (route) {
      setTimeout(() => {
        router.push(route);
      }, 150);
    } else {
      setIsMenuOpen(!isMenuOpen);
    }

    setTimeout(() => {
      setActiveButton(null);
    }, 150);
  };

  const handleMenuClick = (route: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      router.push(route);
    }, 150);
  };

  // Button animation classes
  const getButtonClass = (buttonName: string, baseClasses: string) => {
    return `${baseClasses} ${
      activeButton === buttonName ? "transform scale-90" : ""
    }`;
  };

  // Menu item animation classes
  const menuItemClasses = "px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded transition-all duration-150 text-sm active:scale-95";

  return (
    <>
      <div className="w-full flex flex-row h-[48px] items-center justify-between fixed top-0 left-0 px-4 sm:px-8 md:px-16 py-1 z-50 bg-white/70 backdrop-blur-sm">
        {/* Left Side - Auth Buttons or Dashboard Button */}
        <div className="w-[110px] sm:w-[140px] md:w-[16%] flex flex-row items-center relative animated fadeIn">
          {isLoggedIn ? (
            <button
              className={getButtonClass(
                "dashboard",
                "w-full scale-70 hover:scale-85 border-2 border-dark text-dark py-1.5 rounded-full font-medium transition-all duration-200 hover:bg-gradient-to-tr from-gray-950 to-dark hover:opacity-90 hover:text-white text-xs sm:text-sm"
              )}
              onClick={() => handleButtonClick("dashboard", "/dashboard")}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                className={getButtonClass(
                  "signIn",
                  "w-[60%] scale-70 hover:scale-85 border-2 border-dark text-dark py-1.5 rounded-full font-medium transition-all duration-200 hover:bg-gradient-to-tr from-gray-950 to-dark hover:opacity-90 hover:text-white text-xs sm:text-sm"
                )}
                onClick={() => handleButtonClick("signIn", "/sign-in")}
              >
                Sign In
              </button>
              <button
                className={getButtonClass(
                  "signUp",
                  "absolute scale-70 hover:scale-85 right-0 w-[55%] z-10 hover:bg-opacity-50 rounded-full bg-gradient-to-tr from-dark_gray to-dark hover:bg-gray-900 text-white h-full animated2 slideInLeft font-medium transition-all duration-200 text-xs sm:text-sm"
                )}
                onClick={() => handleButtonClick("signUp", "/sign-up")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Right Side - Compact Menu Button */}
        <div className="w-[90px] sm:w-[100px] md:w-[10%] flex flex-row items-center relative animated fadeIn">
          <button 
            className={getButtonClass(
              "menuIcon",
              "w-[50%] hover:scale-105 border-2 border-black text-black py-1.5 rounded-full shadow flex items-center justify-center px-2 sm:px-3 transition-all duration-200 hover:bg-white hover:bg-opacity-10"
            )}
            onClick={() => handleButtonClick("menuIcon")}
          >
            {isMenuOpen ? (
              <FiX color="black" size={14} className="sm:size-[18px]" />
            ) : (
              <RxHamburgerMenu color="black" size={14} className="sm:size-[18px]" />
            )}
          </button>
          <button 
            className={getButtonClass(
              "menuText",
              "absolute hover:scale-110 right-0 w-[65%] shadow z-10 rounded-full bg-gradient-to-tr from-sky-200 to-blue-600 text-dark h-full animated2 slideInLeft font-medium transition-all duration-200 hover:bg-opacity-90 text-xs sm:text-sm"
            )}
            onClick={() => handleButtonClick("menuText")}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Compact Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="fixed top-[48px] right-4 sm:right-8 md:right-16 w-[180px] backdrop-blur-xl bg-white bg-opacity-80 rounded-t-2xl shadow-lg rounded-b-lg z-40 border border-gray-200 animated fadeIn">
          <div className="flex flex-col p-1.5">
           
            <button
              className={menuItemClasses}
              onClick={() => handleMenuClick("/contact")}
            >
              Contact
            </button>
            {isLoggedIn && (
              <button
                className={menuItemClasses}
                onClick={() => handleMenuClick("/dashboard")}
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HomeTopBar;