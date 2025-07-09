"use client";

import { useRouter } from "next/navigation";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-black hover:text-gray-700 mb-8 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span className="font-medium">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 flex flex-col items-center"
        >
          <div className="flex flex-col items-center mb-6">
            <FiSettings className="w-14 h-14 text-black mb-2" />
            <h1 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
              Settings
            </h1>
            <p className="text-gray-500 text-lg text-center max-w-xs">
              There are currently no settings available.
            </p>
          </div>

          <div className="w-full my-6">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 flex flex-col items-center">
              <span className="text-gray-400 text-6xl mb-3">⚙️</span>
              <p className="text-black text-lg font-semibold mb-2">
                No settings to configure yet
              </p>
              <p className="text-gray-500 text-sm text-center">
                As the platform evolves, settings and preferences will appear here.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}