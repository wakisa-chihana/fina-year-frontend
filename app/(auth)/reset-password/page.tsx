"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { baseUrl } from "@/constants/baseUrl";
import { toast, Toaster } from "react-hot-toast";
import LoadingAnimation from "@/components/LoadingAnimation";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { GiSoccerBall } from "react-icons/gi";

// Wrap the component with Suspense to handle useSearchParams
function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [showRequirements, setShowRequirements] = useState(false);
  const passwordRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  // Handle token loading from URL
  useEffect(() => {
    if (token) {
      setTokenReady(true);
    }
  }, [token]);

  // Handle clicks outside the password field
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        passwordRef.current &&
        !passwordRef.current.contains(event.target as Node)
      ) {
        setShowRequirements(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setShowRequirements(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to hide requirements after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (password.length > 0) {
        setShowRequirements(false);
      }
    }, 3000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill out both fields.");
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      toast.error("Password must meet all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/users/reset-password`, {
        token,
        new_password: password,
      });

      toast.success("Password reset successful! Redirecting...");
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-row bg-white h-screen justify-center gap-8 relative">
      {/* Loading overlay */}
      {!tokenReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-90">
          <LoadingAnimation />
        </div>
      )}

      <Toaster position="top-center" />

      <div className="hidden md:flex flex-col w-[40%] h-full relative justify-center px-4 overflow-hidden">
        <div className="w-[40%] rounded-3xl shadow-md mb-6">
          <Image
            src="/sports_analytics_logo.png"
            alt="Player"
            width={1000}
            height={1000}
            className="rounded-3xl w-full h-full"
            priority
          />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-black">RESET ACCESS</h2>
        <p className="text-black">
          Enter a new password to regain access and continue tracking your
          progress.
        </p>
      </div>

      <div className="z-10 flex flex-col items-center justify-center md:mt-4 w-full md:w-[35%] overflow-hidden pb-4">
        <div className="w-full border-2 px-8 py-14 rounded-3xl border-gray-300 shadow shadow-blue-300 bg-white flex flex-col items-center justify-center">
          {/* Spinning ball logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <GiSoccerBall className="text-5xl md:text-6xl text-dark" />
          </motion.div>
          <h2 className="text-center text-black font-black text-2xl mt-8">
            SET NEW PASSWORD
          </h2>

          <form onSubmit={handleReset} className="w-full p-8 md:p-0 mt-4">
            {/* Password Input with Eye Icon */}
            <div className="mt-4 w-full" ref={passwordRef}>
              <label className="block text-sm font-bold text-gray-700">
                New Password
              </label>
              <div
                className={`flex flex-row justify-between rounded-md w-full shadow-blue-200 shadow-md bg-gray-100 h-11 hover:shadow-blue-300`}
              >
                <input
                  type={hidePassword ? "password" : "text"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setShowRequirements(true)}
                  className="w-[85%] px-4 bg-transparent focus:outline-none shadow-blue-200 focus:shadow-blue-600 text-gray-600"
                  placeholder="••••••••••••"
                />
                <div
                  className="h-full w-[15%] flex items-center justify-center cursor-pointer"
                  onClick={() => setHidePassword(!hidePassword)}
                >
                  {hidePassword ? (
                    <FaEye className="text-black" size={20} />
                  ) : (
                    <FaEyeSlash className="text-black" size={20} />
                  )}
                </div>
              </div>

              {/* Password requirements - shown only when focused or typing */}
              {showRequirements && (
                <div className="mt-2 text-xs text-gray-600">
                  <div
                    className={`flex items-center gap-1 ${
                      hasMinLength ? "text-green-500" : ""
                    }`}
                  >
                    {hasMinLength && <FaCheck className="text-green-500" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      hasLetter ? "text-green-500" : ""
                    }`}
                  >
                    {hasLetter && <FaCheck className="text-green-500" />}
                    <span>Contains letters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      hasNumber ? "text-green-500" : ""
                    }`}
                  >
                    {hasNumber && <FaCheck className="text-green-500" />}
                    <span>Contains numbers</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input with Eye Icon */}
            <div className="mt-4 w-full">
              <label className="block text-sm font-bold text-gray-700">
                Confirm Password
              </label>
              <div
                className={`flex flex-row justify-between rounded-md w-full shadow-blue-200 shadow-md bg-gray-100 h-11 hover:shadow-blue-300`}
              >
                <input
                  type={hideConfirmPassword ? "password" : "text"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-[85%] px-4 bg-transparent focus:outline-none focus:shadow-blue-600 text-gray-600"
                  placeholder="••••••••••••"
                />
                <div
                  className="h-full w-[15%] flex items-center justify-center cursor-pointer"
                  onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
                >
                  {hideConfirmPassword ? (
                    <FaEye className="text-black" size={20} />
                  ) : (
                    <FaEyeSlash className="text-black" size={20} />
                  )}
                </div>
              </div>
              {/* Match indicator */}
              {password && confirmPassword && (
                <div className="mt-1 text-xs flex items-center gap-1">
                  {password === confirmPassword ? (
                    <>
                      <FaCheck className="text-green-500" />
                      <span className="text-green-500">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-red-500">Passwords don&apos;t match</span>
                  )}
                </div>
              )}
            </div>

            <button
              disabled={
                isLoading ||
                !hasMinLength ||
                !hasLetter ||
                !hasNumber ||
                password !== confirmPassword
              }
              type="submit"
              className={`w-full px-4 py-3 font-semibold text-white bg-black rounded-lg mt-8 flex items-center hover:bg-gradient-to-tr from-gray-950 to-dark cursor-pointer justify-center transition-all duration-300 ${
                isLoading
                  ? "cursor-not-allowed opacity-70"
                  : !hasMinLength ||
                    !hasLetter ||
                    !hasNumber ||
                    password !== confirmPassword
                  ? ""
                  : "hover:opacity-80 hover:shadow-md"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2" />
                  <span className="tracking-wide">Processing...</span>
                </>
              ) : (
                <span className="tracking-wide">Reset Password</span>
              )}
            </button>

            <p className="mt-6 text-center text-gray-600 text-base font-medium">
              Know your password?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 font-semibold hover:underline hover:text-blue-800"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;