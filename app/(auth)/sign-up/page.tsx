"use client";

import FormField from "@/components/FormField";
import { signUpFields } from "@/constants/authFields";
import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { GiSoccerBall } from "react-icons/gi";
import LoadingAnimation from "@/components/LoadingAnimation";
import { FaGoogle, FaFacebook, FaChartLine, FaUsers, FaClipboardList } from "react-icons/fa";

interface FormValues {
  fullName: string;
  email: string;
  password: string;
}

interface FocusedValues {
  fullName: boolean;
  email: boolean;
  password: boolean;
}

const SignUp = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const [formValues, setFormValues] = useState<FormValues>({
    fullName: "",
    email: "",
    password: "",
  });

  const [focusedValues, setFocusedValues] = useState<FocusedValues>({
    fullName: false,
    email: false,
    password: false,
  });

  const [hidePassword, setHidePassword] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentPanel((prev) => (prev + 1) % 2);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (formValues.password.length < 8) {
      setErrorMessage("Passwords must be 8 characters or more");
      return;
    }

    setIsSigningUp(true);

    try {
      const payload = {
        email: formValues.email,
        password: formValues.password,
        name: formValues.fullName,
        role: "coach",
      };

      const res = await axios.post(`${baseUrl}/users/register`, payload, {
        withCredentials: true,
      });

      if (res.data?.access_token) {
        Cookies.set("sport_analytics", res.data.access_token, {
          expires: 3,
          path: "/",
        });

        setRedirecting(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMessage(res.data.detail || "Something went wrong!");
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Something went wrong! Please try again."
      );
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `${baseUrl}/auth/${provider}`;
  };

  const panelContents = [
    <div key="welcome" className="w-full">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[40%] rounded-3xl animated fadeIn shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <Image
          src="/sports_analytics_logo.png"
          alt="Player"
          width={1000}
          height={1000}
          priority
          className="rounded-3xl w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-extrabold mt-6 mb-4 text-black tracking-wide"
      >
        JOIN OUR COMMUNITY
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-black leading-relaxed text-base font-medium"
      >
        Sign up to track player stats, get match insights, and optimize team
        performance with data-driven analysis. Access your personalized dashboard
        and take your team to the next level.
      </motion.p>
    </div>,

    <div key="features" className="w-full space-y-8">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-extrabold text-black tracking-wide"
      >
        KEY FEATURES
      </motion.h2>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-start"
        >
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaChartLine className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Advanced Analytics</h3>
            <p className="text-gray-600">Real-time performance metrics and detailed match analysis.</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-start"
        >
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaUsers className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Team Management</h3>
            <p className="text-gray-600">Manage your squad, track player development, and optimize lineups.</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-start"
        >
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <FaClipboardList className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Custom Reports</h3>
            <p className="text-gray-600">Generate detailed reports tailored to your coaching needs.</p>
          </div>
        </motion.div>
      </div>
    </div>,
  ];

  return (
    <div className="relative w-full flex bg-white h-screen justify-center gap-8">
      {redirecting && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-90 flex items-center justify-center">
          <LoadingAnimation />
        </div>
      )}

      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[url('/pattern.png')] bg-repeat bg-[length:300px]"></div>
      </div>

      {/* Content Panel (now on the left) */}
      <div className="hidden md:flex ml-16 flex-col w-[40%] h-full relative justify-center px-4 overflow-hidden animated fadeInLeft">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPanel}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {panelContents[currentPanel]}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentPanel(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                currentPanel === index ? "bg-black" : "bg-gray-300"
              }`}
              aria-label={`Go to panel ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Form Panel (now on the right) */}
      <div className="z-10 flex flex-col items-center justify-center md:mt-4 no-scrollbar w-full md:w-[35%] overflow-scroll pb-4 animated fadeInUp">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full border-2 px-8 py-8 rounded-3xl border-gray-300 shadow-xl bg-white flex flex-col items-center min-h-[520px] justify-center hover:shadow-2xl transition-shadow duration-300"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center shadow-inner"
          >
            <GiSoccerBall className="text-5xl md:text-6xl text-dark hover:text-primary transition-colors duration-300" />
          </motion.div>
          <h2 className="text-center text-black font-black text-2xl mt-4">
            SIGN UP
          </h2>

          <motion.div 
            className={`w-[85%] ${errorMessage ? "min-h-[48px]" : "h-0"} transition-all duration-200 mt-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: errorMessage ? 1 : 0 }}
          >
            {errorMessage && (
              <div className="w-full rounded-lg p-3 bg-red-500 text-sm text-white font-medium flex items-center justify-center shadow-sm">
                <p>{errorMessage}</p>
              </div>
            )}
          </motion.div>

          <form onSubmit={handleSignUp} className="w-full p-4 md:p-0 mt-2">
            {signUpFields.map((item, index) => (
              <FormField
                key={index}
                item={item}
                focuedValues={focusedValues}
                hidePassword={hidePassword}
                setFocusedValues={setFocusedValues}
                setFormValues={setFormValues}
                formValues={formValues}
                setHidePassword={setHidePassword}
              />
            ))}

            <button
              disabled={isSigningUp}
              type="submit"
              className={`w-full px-4 py-2 font-semibold text-white bg-black rounded-lg focus:outline-none mt-6 flex items-center justify-center transition-all duration-300 ${
                isSigningUp
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-gradient-to-tr from-gray-950 to-dark hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {isSigningUp ? (
                <div className="flex items-center">
                  <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2" />
                  <span>Signing up...</span>
                </div>
              ) : (
                <span className="tracking-wide">Sign Up</span>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <FaGoogle className="text-red-500 mr-2" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <FaFacebook className="text-blue-600 mr-2" />
                Facebook
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm font-medium">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;