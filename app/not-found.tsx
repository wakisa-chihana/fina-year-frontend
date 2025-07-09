"use client";

import { useRouter } from "next/navigation";
import { FiAlertTriangle, FiArrowLeft, FiHome } from "react-icons/fi";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#1a1a1a] via-[#232323] to-[#111112]">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-yellow-400 mb-10 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span className="font-medium">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl shadow-2xl border border-[#2e2e2e] bg-[#18181b]/80 p-10 flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.88, rotate: -6, opacity: 0.8 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}
            className="bg-yellow-500/10 rounded-full p-6 mb-4 border-4 border-yellow-400 shadow-xl"
          >
            <FiAlertTriangle className="w-20 h-20 text-yellow-400" />
          </motion.div>
          <h1 className="text-7xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-300 text-lg text-center max-w-xl mb-8">
            Sorry, the page you are looking for does not exist, was removed, or is temporarily unavailable.
            <br />
            <span className="inline-block mt-2 text-yellow-300 font-semibold">
              Check the URL or let us know if you think this is a mistake.
            </span>
          </p>

          <div className="flex flex-col items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-yellow-400 text-black rounded-lg font-semibold shadow-lg hover:bg-yellow-500 hover:text-black transition text-lg w-full max-w-xs"
            >
              <FiHome className="w-6 h-6" />
              Go to Home
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#232323] text-white border border-gray-700 rounded-lg font-semibold hover:bg-[#353535] hover:text-yellow-300 transition w-full max-w-xs"
            >
              <FiArrowLeft className="w-5 h-5" />
              Previous Page
            </button>
          </div>

          <div className="mt-10 text-center text-gray-500 text-xs">
            If you continue having trouble, please&nbsp;
            <a
              href="/help-support"
              className="underline text-yellow-300 hover:text-yellow-400 transition"
            >
              visit our Help & Support page
            </a>
            .
          </div>
        </motion.div>
      </div>
    </div>
  );
}