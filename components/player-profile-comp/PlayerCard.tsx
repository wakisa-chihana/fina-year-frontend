import { FaUserAlt, FaRegClock, FaCheck, FaTimes, FaRunning, FaFutbol, FaStar, FaArrowRight, FaSpinner } from "react-icons/fa";
import { GiSoccerBall, GiSoccerKick, GiGoalKeeper } from "react-icons/gi";
import { IoShirtOutline, IoMailOutline, IoFootsteps } from "react-icons/io5";
import { MdOutlineSportsScore } from "react-icons/md";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    status: 'pending' | 'accepted' | 'rejected';
    position: string;
    email: string;
    matches_played?: number;
    goals?: number;
    assists?: number;
    overall_performance?: number;
  };
  onClick: () => void;
  index: number;
}

const positionThemes: Record<'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'default', { icon: JSX.Element; gradient: string; bg: string; text: string }> = {
  'Goalkeeper': { 
    icon: <GiGoalKeeper size={12} />, 
    gradient: 'from-blue-500 via-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700'
  },
  'Defender': { 
    icon: <IoShirtOutline size={12} />, 
    gradient: 'from-emerald-500 via-emerald-400 to-emerald-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700'
  },
  'Midfielder': { 
    icon: <GiSoccerKick size={12} />, 
    gradient: 'from-amber-500 via-amber-400 to-amber-600',
    bg: 'bg-amber-50',
    text: 'text-amber-700'
  },
  'Forward': { 
    icon: <FaRunning size={12} />, 
    gradient: 'from-rose-500 via-rose-400 to-rose-600',
    bg: 'bg-rose-50',
    text: 'text-rose-700'
  },
 
  'default': { 
    icon: <FaFutbol size={12} />, 
    gradient: 'from-gray-500 via-gray-400 to-gray-600',
    bg: 'bg-gray-50',
    text: 'text-gray-700'
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    pending: { color: 'text-yellow-600', icon: <FaRegClock size={12} /> },
    accepted: { color: 'text-green-600', icon: <FaCheck size={12} /> },
    rejected: { color: 'text-red-600', icon: <FaTimes size={12} /> }
  }[status] || { color: 'text-gray-600', icon: <FaUserAlt size={12} /> };

  return (
    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 ${statusStyles.color}`}>
      {statusStyles.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PlayerCard = ({ player, onClick, index }: PlayerCardProps) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const positionData = positionThemes[player.position as keyof typeof positionThemes] || positionThemes['default'];
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const performancePercentage = player.overall_performance || 0;

  const handleViewProfile = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from firing
    setIsNavigating(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/dashboard/player-profile/${player.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  };

  const getPerformanceTheme = (percentage: number) => {
    if (percentage >= 85) return {
      gradient: 'from-teal-400 via-emerald-400 to-green-500',
      text: 'text-emerald-600',
      pulse: 'shadow-[0_0_12px_-3px_rgba(20,184,166,0.5)]'
    };
    if (percentage >= 70) return {
      gradient: 'from-cyan-400 via-sky-400 to-blue-500',
      text: 'text-blue-600',
      pulse: 'shadow-[0_0_12px_-3px_rgba(56,182,255,0.5)]'
    };
    if (percentage >= 50) return {
      gradient: 'from-amber-400 via-orange-400 to-amber-500',
      text: 'text-amber-600',
      pulse: 'shadow-[0_0_12px_-3px_rgba(245,158,11,0.5)]'
    };
    return {
      gradient: 'from-rose-400 via-red-400 to-rose-500',
      text: 'text-rose-600',
      pulse: 'shadow-[0_0_12px_-3px_rgba(244,63,94,0.5)]'
    };
  };

  const performanceTheme = getPerformanceTheme(performancePercentage);

  useEffect(() => {
    if (performancePercentage > 0) {
      animate(performancePercentage, performancePercentage, {
        duration: 1.5,
        ease: "easeOut"
      });
    }
  }, [performancePercentage]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: index * 0.05
      }}
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
      }}
      onMouseMove={handleMouseMove}
      className="relative p-3 md:p-4 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group isolate"
      onClick={onClick}
      style={{
        boxShadow: useMotionTemplate`
          0 8px 16px -5px rgba(0, 0, 0, 0.05),
          0 4px 6px -3px rgba(0, 0, 0, 0.03),
          0 0 0 1px rgba(0, 0, 0, 0.02)
        `,
        minWidth: '240px'
      }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.1), transparent 80%)`
        }}
      />

      <div className={`absolute top-0 left-0 w-1.5 h-full ${positionData.gradient} bg-gradient-to-b`}></div>

      <div className="flex items-start justify-between mb-2 md:mb-3 relative z-10">
        <motion.div 
          className="relative"
          whileHover={{ y: -1 }}
        >
          <div className={`absolute -inset-0.5 rounded-full ${positionData.gradient} bg-gradient-to-r opacity-75 group-hover:opacity-100 transition-all duration-300 blur-sm group-hover:blur`}></div>
          <div className={`relative p-1.5 md:p-2 ${positionData.bg} rounded-full flex items-center justify-center backdrop-blur-sm`}>
            <div className={`text-base md:text-lg ${positionData.text}`}>
              {positionData.icon}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 + 0.1 }}
        >
          <StatusBadge status={player.status} />
        </motion.div>
      </div>

      <div className="relative z-10">
        <motion.h2 
          className="text-sm md:text-base font-bold text-gray-900 mb-1.5 md:mb-2 tracking-tight"
          whileHover={{ color: "#28809A", x: 1 }}
          transition={{ duration: 0.2 }}
        >
          {player.name}
        </motion.h2>

        <div className="inline-block mb-2 md:mb-3">
          <motion.span 
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${positionData.bg} ${positionData.text}`}
            whileHover={{ scale: 1.03 }}
          >
            {player.position}
          </motion.span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-600 my-2 md:my-3">
          <IoMailOutline size={12} className="flex-shrink-0 opacity-80 md:hidden" />
          <IoMailOutline size={14} className="flex-shrink-0 opacity-80 hidden md:block" />
          <span className="truncate font-medium text-xs md:text-sm">{player.email}</span>
        </div>

        <div className="mb-3 md:mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ rotate: [0, 15, -10, 5, 0], scale: [1, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
              >
                <FaStar size={12} className={`md:hidden ${performanceTheme.text}`} />
                <FaStar size={14} className={`hidden md:block ${performanceTheme.text}`} />
              </motion.div>
              <span className={`text-xs font-semibold ${performanceTheme.text}`}>
                Performance
              </span>
            </div>
            <motion.span 
              className={`text-xs md:text-sm font-bold ${performanceTheme.text}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {performancePercentage}%
            </motion.span>
          </div>

          <div className="relative">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${performanceTheme.gradient} bg-gradient-to-r ${performancePercentage > 80 ? performanceTheme.pulse : ''}`}
                initial={{ width: 0 }}
                animate={{ width: `${performancePercentage}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              />
            </div>

            <div className="flex justify-between text-[9px] md:text-[10px] text-gray-500 mt-1">
              {[0, 25, 50, 75, 100].map((mark) => (
                <span key={mark}>{mark}%</span>
              ))}
            </div>
          </div>
        </div>

        {/* View Full button */}
        <motion.button
          onClick={handleViewProfile}
          disabled={isNavigating}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(40, 128, 154, 0.05)" }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 pt-2 md:pt-3 mt-2 md:mt-3 border-t border-gray-100 transition-all duration-200 rounded-b-xl ${
            isNavigating 
              ? 'cursor-not-allowed opacity-60' 
              : 'cursor-pointer hover:bg-gray-50'
          }`}
        >
          {isNavigating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FaSpinner className="text-[#28809A] text-xs" />
              </motion.div>
              <span className="text-xs text-[#28809A] font-medium">Loading...</span>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-600 font-medium">View Full</span>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaArrowRight className="text-gray-600 text-xs" />
              </motion.div>
            </>
          )}
        </motion.button>
      </div>

    </motion.div>
  );
};

export default PlayerCard;