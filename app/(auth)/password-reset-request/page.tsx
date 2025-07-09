"use client";

import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { baseUrl } from "@/constants/baseUrl";
import { motion, AnimatePresence } from "framer-motion";
import { GiSoccerBall } from "react-icons/gi";
import { FaEnvelope, FaArrowLeft, FaShieldAlt, FaLock, FaClock, FaHome } from "react-icons/fa";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <RequestResetPassword />
    </Suspense>
  );
}

function RequestResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPanel((prev) => (prev + 1) % 2);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${baseUrl}/users/request-password-reset`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
          timeout: 10000
        }
      );
      setSuccessMessage("Password reset link sent! Please check your email.");
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          setErrorMessage("We couldn&apos;t find an account with that email address. Please check your spelling.");
        } 
        else if (error.response.data?.detail) {
          const errorMap: Record<string, string> = {
            "Email configuration missing in environment variables.": "Our email service is currently unavailable. Please try again later.",
            "Email service authentication failed. Check your email credentials.": "We&apos;re having trouble sending emails right now. Please try again shortly.",
            "Failed to send password reset email. Please try again later.": "We couldn&apos;t send the reset email. Please try again.",
            "An error occurred while processing your request": "Something went wrong on our end. Please try again later."
          };
          setErrorMessage(errorMap[error.response.data.detail] || "Failed to send reset link. Please try again later.");
        }
        else if (error.response.status === 500) {
          setErrorMessage("Our servers are temporarily unavailable. Please try again shortly.");
        }
      } 
      else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        setErrorMessage("The request is taking longer than expected. Please check your connection and try again.");
      } 
      else if (error.message === "Network Error") {
        setErrorMessage("No response from server. Please check your connection.");
      } 
      else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const panelContents = [
    <div key="welcome" className="w-full">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[40%] rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <Image
          src="/sports_analytics_logo.png"
          alt="Sports Analytics Logo"
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
        NEED A RESET?
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-black leading-relaxed text-base font-medium"
      >
        Request a password reset to regain access to your account. We&apos;ll send you a secure link to create a new password.
      </motion.p>
    </div>,

    <div key="security" className="w-full space-y-6">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-extrabold text-black tracking-wide"
      >
        SECURITY TIPS
      </motion.h2>
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-start"
        >
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaShieldAlt className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Check Your Inbox</h3>
            <p className="text-gray-600">If you don&apos;t see our email, please check your spam folder.</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-start"
        >
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaClock className="text-green-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Act Quickly</h3>
            <p className="text-gray-600">The reset link expires in 30 minutes for security.</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-start"
        >
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <FaLock className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Keep It Secure</h3>
            <p className="text-gray-600">Never share your reset link with anyone.</p>
          </div>
        </motion.div>
      </div>
    </div>
  ];

  return (
    <div className="relative w-full flex flex-row bg-white h-screen justify-center gap-8">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[url('/pattern.png')] bg-repeat bg-[length:300px]"></div>
      </div>

      {/* Stylish Home Button */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 right-6 z-20 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Home"
      >
        <FaHome className="text-gray-600 text-xl group-hover:text-blue-600 transition-colors" />
        <span className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Home
        </span>
      </button>

      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-black transition-colors duration-200 z-20"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>

      {/* Content Panel */}
      <div className="hidden md:flex ml-16 flex-col w-[40%] h-full relative justify-center px-4 overflow-hidden">
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

      {/* Form Panel */}
      <div className="z-10 flex flex-col items-center justify-center md:mt-4 no-scrollbar w-full md:w-[35%] overflow-scroll pb-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md border-2 px-8 py-12 rounded-3xl border-gray-300 shadow-xl bg-white flex flex-col items-center justify-center hover:shadow-2xl transition-shadow duration-300"
        >
          {/* Spinning ball logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center shadow-inner"
          >
            <GiSoccerBall className="text-5xl md:text-6xl text-dark hover:text-primary transition-colors duration-300" />
          </motion.div>

          <h2 className="text-center text-black font-black text-2xl mt-8">
            RESET PASSWORD
          </h2>

          <motion.div 
            className={`w-[85%] ${errorMessage || successMessage ? "min-h-[48px]" : "h-0"} transition-all duration-200 mt-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: errorMessage || successMessage ? 1 : 0 }}
          >
            {errorMessage && (
              <div className="w-full rounded-lg p-3 bg-red-500 text-sm text-white font-medium flex items-center justify-center shadow-sm">
                <p dangerouslySetInnerHTML={{ __html: errorMessage }} />
              </div>
            )}
            {successMessage && (
              <div className="w-full rounded-lg p-3 bg-green-500 text-sm text-white font-medium flex items-center justify-center shadow-sm">
                <p>{successMessage}</p>
              </div>
            )}
          </motion.div>

          <form onSubmit={handleSubmit} className="w-full p-4 md:p-0 mt-4">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10 text-sm font-bold flex flex-row justify-between rounded-md w-full shadow-md shadow-blue-300 bg-gray-100 h-11 hover:shadow-blue-600 px-4 bg-transparent focus:outline-none focus:shadow-blue-600 text-gray-600"
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className={`w-full px-4 py-3 font-semibold text-white bg-black rounded-lg mt-2 flex items-center justify-center transition-all duration-300 ${
                isLoading
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-gradient-to-tr from-gray-950 to-dark hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2" />
                  <span>Sending...</span>
                </div>
              ) : (
                <span className="tracking-wide">Send Reset Link</span>
              )}
            </button>

            <p className="mt-6 text-center text-gray-600 text-sm font-medium">
              Remembered your password?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}