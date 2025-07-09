"use client";
import {
  FaTimes,
  FaUserAlt,
  FaCheck,
  FaFutbol,
  FaRunning,
} from "react-icons/fa";
import { IoClose, IoStatsChart } from "react-icons/io5";
import { MdOutlineEmojiEvents } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { GiSoccerBall } from "react-icons/gi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/constants/baseUrl";

interface Player {
  id: number;
  name: string;
  email: string;
  position: string;
  team_id: number;
  status: "pending" | "accepted" | "rejected";
  overall_performance: number;
}

interface PlayerModalProps {
  player: Player;
  onClose: () => void;
  onPlayerUpdated?: () => void;
  onPlayerDeleted?: (email: string) => void;
}

const PlayerModal = ({
  player,
  onClose,
  onPlayerUpdated,
  onPlayerDeleted,
}: PlayerModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleViewProfile = () => {
    router.push(`/dashboard/player-profile/${player.id}`);
  };

  const handleDeletePlayer = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `${baseUrl}/team_players/remove_by_email`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: player.email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete player");
      }

      if (onPlayerDeleted) {
        onPlayerDeleted(player.email);
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-500 text-sm"
          >
            <FaCheck />
          </motion.div>
        );
      case "rejected":
        return (
          <motion.div
            initial={{ rotate: 180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            className="text-red-500 text-sm"
          >
            <FaTimes />
          </motion.div>
        );
      default:
        return (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-500 text-xs"
          >
            PENDING
          </motion.span>
        );
    }
  };

  const getPositionIcon = (position: string) => {
    const iconProps = {
      initial: { scale: 0 },
      animate: { scale: 1 },
      transition: { type: "spring" as const, stiffness: 500, damping: 15 },
      className: "text-sm",
    };

    switch (position.toLowerCase()) {
      case "forward":
        return (
          <motion.div {...iconProps} className="text-red-500">
            <FaFutbol />
          </motion.div>
        );
      case "midfielder":
        return (
          <motion.div {...iconProps} className="text-blue-500">
            <GiSoccerBall />
          </motion.div>
        );
      case "defender":
        return (
          <motion.div {...iconProps} className="text-green-500">
            <FaRunning />
          </motion.div>
        );
      case "goalkeeper":
        return (
          <motion.div {...iconProps} className="text-purple-500">
            <FaCheck />
          </motion.div>
        );
      default:
        return (
          <motion.div {...iconProps} className="text-gray-500">
            <FaUserAlt />
          </motion.div>
        );
    }
  };

  const getPerformanceColor = (performance: number | null) => {
    if (performance === null) return "text-gray-500";
    if (performance >= 80) return "text-green-600";
    if (performance >= 60) return "text-blue-600";
    return "text-orange-600";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 20,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 w-full max-w-md shadow-2xl relative border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <IoClose size={20} />
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-5"
          >
            <motion.div
              variants={itemVariants}
              className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <FaUserAlt className="text-blue-500 text-2xl" />
              </motion.div>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-xl font-bold text-gray-800"
            >
              {player.name}
            </motion.h2>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-1.5 mt-1"
            >
              {getPositionIcon(player.position)}
              <span className="text-gray-600 text-sm">{player.position}</span>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-1 text-gray-500 text-xs break-all"
            >
              {player.email}
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
            >
              <motion.div className="flex items-center gap-1.5 text-gray-600 mb-1.5 text-sm">
                <IoStatsChart size={14} />
                <span className="font-medium">Stats</span>
              </motion.div>
              <motion.div className="space-y-1.5 text-xs">
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-between"
                >
                  <span className="text-gray-500">Performance:</span>
                  <span
                    className={`font-medium ${getPerformanceColor(
                      player.overall_performance
                    )}`}
                  >
                    {player.overall_performance ?? "N/A"}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex justify-between"
                >
                  <span className="text-gray-500">Team ID:</span>
                  <span className="font-medium">{player.team_id}</span>
                </motion.div>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-between"
                >
                  <span className="text-gray-500">Player ID:</span>
                  <span className="font-medium">{player.id}</span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
            >
              <motion.div className="flex items-center gap-1.5 text-gray-600 mb-1.5 text-sm">
                <MdOutlineEmojiEvents size={14} />
                <span className="font-medium">Status</span>
              </motion.div>
              <motion.div className="space-y-1.5 text-xs">
                <motion.div
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-500">Invitation:</span>
                  {getStatusIcon(player.status)}
                </motion.div>
                <motion.div
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex justify-between"
                >
                  <span className="text-gray-500">Account:</span>
                  <span className="font-medium text-green-500">Active</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="p-2 bg-red-50 text-red-600 rounded text-center text-xs border border-red-100">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-2"
          >
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewProfile}
              className="w-full bg-gradient-to-t from-black to-[#28809A] hover:bg-[#28809A] hover:opacity-80 text-white py-2 rounded-lg transition-colors"
            >
              View Profile
            </motion.button>
            
            <div className="flex gap-2">
              <motion.button
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
                onClick={onClose}
              >
                Close
              </motion.button>
              <motion.button
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 2px 8px rgba(220,38,38,0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 justify-items-start px-3 py-1.5 bg-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                onClick={handleDeletePlayer}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="ml-14 w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                  </motion.span>
                ) : (
                  "Remove"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerModal;