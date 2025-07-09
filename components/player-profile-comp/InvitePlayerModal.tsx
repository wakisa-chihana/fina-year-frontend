import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { IoClose, IoMailOutline } from "react-icons/io5";
import { GiSoccerBall } from "react-icons/gi";
import { motion } from "framer-motion";

interface InvitePlayerModalProps {
  show: boolean;
  onClose: () => void;
  formData: {
    player_name: string;
    player_email: string;
    position: string;
  };
  formErrors: {
    player_name: string;
    player_email: string;
    position: string;
    general: string;
  };
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const InvitePlayerModal = ({
  show,
  onClose,
  formData,
  formErrors,
  loading,
  onSubmit,
  onInputChange
}: InvitePlayerModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!show) return null;

  return (
    <motion.div 
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="bg-gray-50 rounded-3xl p-8 w-[95%] max-w-md shadow-2xl relative border-2 border-gray-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"
        >
          <IoClose size={24} />
        </motion.button>
        
        <div className="mb-6 text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3"
          >
            <GiSoccerBall className="text-blue-600 text-2xl" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold text-black tracking-wide"
          >
            Invite New Player
          </motion.h2>
          <p className="text-gray-600 mt-2 font-medium">
            Fill in the player details
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {formErrors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center">
              <FaTimes className="mr-2" />
              {formErrors.general}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <label htmlFor="player_name" className="block text-sm font-medium text-gray-700 mb-1">
              Player Name
            </label>
            <input
              id="player_name"
              name="player_name"
              type="text"
              placeholder="Enter player name"
              value={formData.player_name}
              onChange={onInputChange}
              required
              className={`text-sm font-bold flex flex-row justify-between rounded-md w-full shadow-md shadow-blue-300 bg-gray-200 h-11 hover:shadow-blue-600 px-4 bg-transparent focus:outline-none focus:shadow-blue-600 text-gray-600 ${
                formErrors.player_name ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {formErrors.player_name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaTimes className="mr-1 text-xs" />
                {formErrors.player_name}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <label htmlFor="player_email" className="block text-sm font-medium text-gray-700 mb-1">
              Player Email
            </label>
            <input
              id="player_email"
              name="player_email"
              type="email"
              placeholder="Enter player email"
              value={formData.player_email}
              onChange={onInputChange}
              required
              className={`text-sm font-bold flex flex-row justify-between rounded-md w-full shadow-md shadow-blue-300 bg-gray-200 h-11 hover:shadow-blue-600 px-4 bg-transparent focus:outline-none focus:shadow-blue-600 text-gray-600 ${
                formErrors.player_email ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {formErrors.player_email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaTimes className="mr-1 text-xs" />
                {formErrors.player_email}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={onInputChange}
              required
              className={`text-sm font-bold flex flex-row justify-between rounded-md w-full shadow-md shadow-blue-300 bg-gray-200 h-11 hover:shadow-blue-600 px-4 bg-transparent focus:outline-none focus:shadow-blue-600 text-gray-800 ${
                formErrors.position ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
            >
              <option value="">Select position</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </select>
            {formErrors.position && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaTimes className="mr-1 text-xs" />
                {formErrors.position}
              </p>
            )}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-[#28809A] hover:opacity-70"
            }`}
          >
            {loading ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full"
                />
                <span>Sending Invite...</span>
              </>
            ) : (
              <>
                <IoMailOutline />
                <span>Send Invitation</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default InvitePlayerModal;
