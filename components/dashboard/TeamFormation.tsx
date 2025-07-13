'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { baseUrl } from '@/constants/baseUrl';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUserAlt, 
  FaRegLightbulb, 
  FaTimes, 
  FaStar,
  FaBolt,
  FaFutbol,
  FaRunning,
  FaCrosshairs,
  FaBrain,
  FaShieldAlt,
  FaChartLine
} from "react-icons/fa";

// Enhanced attribute display mapping with categories and icons
const attributeDisplayInfo: Record<string, { name: string; category: string; icon: React.ReactNode }> = {
  short_passing: { name: "Short Passing", category: "Technical", icon: <FaFutbol className="mr-1" /> },
  stamina: { name: "Stamina", category: "Physical", icon: <FaRunning className="mr-1" /> },
  vision: { name: "Vision", category: "Mental", icon: <FaBrain className="mr-1" /> },
  dribbling: { name: "Dribbling", category: "Technical", icon: <FaFutbol className="mr-1" /> },
  strength: { name: "Strength", category: "Physical", icon: <FaBolt className="mr-1" /> },
  positioning: { name: "Positioning", category: "Mental", icon: <FaCrosshairs className="mr-1" /> },
  finishing: { name: "Finishing", category: "Technical", icon: <FaCrosshairs className="mr-1" /> },
  agility: { name: "Agility", category: "Physical", icon: <FaRunning className="mr-1" /> },
  balance: { name: "Balance", category: "Physical", icon: <FaBolt className="mr-1" /> },
  shot_power: { name: "Shot Power", category: "Technical", icon: <FaBolt className="mr-1" /> },
  marking: { name: "Marking", category: "Defensive", icon: <FaShieldAlt className="mr-1" /> },
  ball_control: { name: "Ball Control", category: "Technical", icon: <FaFutbol className="mr-1" /> },
  long_passing: { name: "Long Passing", category: "Technical", icon: <FaFutbol className="mr-1" /> },
  acceleration: { name: "Acceleration", category: "Physical", icon: <FaBolt className="mr-1" /> },
  sprint_speed: { name: "Sprint Speed", category: "Physical", icon: <FaRunning className="mr-1" /> },
  reactions: { name: "Reactions", category: "Mental", icon: <FaBrain className="mr-1" /> },
  composure: { name: "Composure", category: "Mental", icon: <FaBrain className="mr-1" /> },
  standing_tackle: { name: "Standing Tackle", category: "Defensive", icon: <FaShieldAlt className="mr-1" /> },
  sliding_tackle: { name: "Sliding Tackle", category: "Defensive", icon: <FaShieldAlt className="mr-1" /> }
};

interface Recommendation {
  player_id: number;
  name: string;
  email: string;
  team_id: number;
  overall_performance: number;
  recommendations: Record<string, string>;
  recommendation_text: string;
}

interface BackendResponse {
  success: boolean;
  coach_id: number;
  top_performer: {
    player_id: number;
    name: string;
    overall_performance: number;
  };
  underperforming_players: Recommendation[];
  message?: string;
}

function RecommendationsPopup({ player, onClose }: { player: Recommendation; onClose: () => void }) {
  // Group attributes by category
  const groupedAttributes = Object.entries(player.recommendations).reduce((acc, [attr, diff]) => {
    const info = attributeDisplayInfo[attr] || { category: "Other", name: attr, icon: <FaChartLine className="mr-1" /> };
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push({ attr, diff, icon: info.icon, name: info.name });
    return acc;
  }, {} as Record<string, { attr: string; diff: string; icon: React.ReactNode; name: string }[]>);

  // Sort categories by importance (most attributes first)
  const sortedCategories = Object.keys(groupedAttributes).sort(
    (a, b) => groupedAttributes[b].length - groupedAttributes[a].length
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaRegLightbulb className="text-2xl text-white" />
                <h2 className="text-2xl font-bold text-white">Training Recommendations</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium">
                  Performance: {player.overall_performance.toFixed(1)}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Player Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-4 border-blue-100">
                <FaUserAlt className="text-3xl text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                <p className="text-gray-600">{player.email}</p>
                <div className="flex items-center mt-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                    <FaStar className="text-yellow-500" />
                  </div>
                  <div className="relative w-full max-w-[200px]">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${player.overall_performance}%` }}
                      />
                    </div>
                    <div className="absolute -bottom-5 left-0 text-xs font-bold text-gray-700">
                      {player.overall_performance.toFixed(1)}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Text */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-600 mb-2">COACH&apos;S RECOMMENDATION</h4>
              <p className="text-gray-800">{player.recommendation_text}</p>
            </div>

            {/* Attributes by Category */}
            {Object.keys(player.recommendations).length > 0 && (
              <div className="space-y-6">
                {sortedCategories.map(category => (
                  <div key={category} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      {category === "Physical" && <FaRunning className="mr-2 text-blue-500" />}
                      {category === "Technical" && <FaFutbol className="mr-2 text-green-500" />}
                      {category === "Mental" && <FaBrain className="mr-2 text-purple-500" />}
                      {category === "Defensive" && <FaShieldAlt className="mr-2 text-red-500" />}
                      {category} Skills
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedAttributes[category]
                        .sort((a, b) => Math.abs(parseInt(b.diff)) - Math.abs(parseInt(a.diff)))
                        .map(
                          ({
                            attr,
                            diff,
                            icon,
                            name,
                          }: {
                            attr: string;
                            diff: string;
                            icon: React.ReactNode;
                            name: string;
                          }) => (
                            <div
                              key={attr}
                              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <span className="text-blue-500 mr-2">{icon}</span>
                                <span className="font-medium text-gray-800">{name}</span>
                              </div>
                              <span
                                className={`font-bold ${
                                  parseInt(diff) < 0 ? "text-red-500" : "text-green-500"
                                }`}
                              >
                                {diff}
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const SkeletonLoader = () => (
  <div className="w-full h-full flex flex-col gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        {/* Removed unused topPerformer state */}
        <div className="mt-1 space-y-1">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ))}
  </div>
);

const TeamFormation: React.FC = () => {
  const coachId = Cookies.get("x-user-id") || "";
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [topPerformer, setTopPerformer] = useState<{ name: string, overall_performance: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Recommendation | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/training_recommendations/${coachId}`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('x-access-token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        
        const data: BackendResponse = await res.json();

        if (!data.underperforming_players || data.underperforming_players.length === 0) {
          setRecommendations([]);
          setError(data.message || "No underperforming players found.");
        } else {
          setRecommendations(data.underperforming_players);
          setTopPerformer(data.top_performer || null);
        }
      } catch (e: any) {
        setError(e?.message ?? "An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    
    if (coachId) fetchRecommendations();
  }, [coachId]);

  return (
    <div className='w-full md:w-[45%] h-[390px] border border-gray-200 rounded-xl p-4 bg-white flex flex-col shadow-sm'>
      <p className='text-black font-bold text-lg mb-3'>Player Recommendations</p>
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="w-full h-full"><SkeletonLoader /></div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full p-4">
            <FaRegLightbulb className="text-3xl text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full p-4">
            <FaRegLightbulb className="text-3xl text-gray-300 mb-2" />
            <p className="text-gray-500 font-medium">No recommendations found</p>
            <p className="text-gray-400 text-sm mt-1">All players are performing well</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-3">
              {recommendations.map(player => (
                <motion.div
                  key={player.player_id}
                  whileHover={{ scale: 1.01 }}
                  className="cursor-pointer bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-1 shadow-sm hover:shadow-md transition-all"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaUserAlt className="text-black" />
                    </div>
                    <div>
                      <div className="font-bold text-black text-sm">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-xs font-semibold text-gray-700">
                      Performance: {player.overall_performance}
                    </span>
                  </div>
                  <div className="text-gray-900 text-sm mt-1 line-clamp-2">
                    {player.recommendation_text}
                  </div>
                  <div className="text-xs text-black font-medium mt-1">View details →</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedPlayer && (
        <RecommendationsPopup player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
};

export default TeamFormation;