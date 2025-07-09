'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { baseUrl } from '@/constants/baseUrl';
import { motion, AnimatePresence } from "framer-motion";
import { FaUserAlt, FaRegLightbulb, FaTimes } from "react-icons/fa";

// Enhanced attribute display mapping with categories
const attributeDisplayName: Record<string, { name: string; category: string }> = {
  short_passing: { name: "Short Passing", category: "Technical" },
  stamina: { name: "Stamina", category: "Physical" },
  vision: { name: "Vision", category: "Mental" },
  dribbling: { name: "Dribbling", category: "Technical" },
  strength: { name: "Strength", category: "Physical" },
  positioning: { name: "Positioning", category: "Mental" },
  finishing: { name: "Finishing", category: "Technical" },
  agility: { name: "Agility", category: "Physical" },
  balance: { name: "Balance", category: "Physical" },
  shot_power: { name: "Shot Power", category: "Technical" },
  marking: { name: "Marking", category: "Defensive" },
  ball_control: { name: "Ball Control", category: "Technical" },
  long_passing: { name: "Long Passing", category: "Technical" },
  acceleration: { name: "Acceleration", category: "Physical" },
  sprint_speed: { name: "Sprint Speed", category: "Physical" },
  reactions: { name: "Reactions", category: "Mental" },
  composure: { name: "Composure", category: "Mental" },
  standing_tackle: { name: "Standing Tackle", category: "Defensive" },
  sliding_tackle: { name: "Sliding Tackle", category: "Defensive" }
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
    const category = attributeDisplayName[attr]?.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ attr, diff });
    return acc;
  }, {} as Record<string, { attr: string; diff: string }[]>);

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
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-[#f9fafb] to-[#e0f2fe] rounded-t-3xl">
            <div className="flex items-center gap-4">
              <FaRegLightbulb className="text-2xl text-[#28809A]" />
              <h2 className="text-2xl font-bold text-[#28809A]">Training Recommendation</h2>
            </div>
            <button onClick={onClose} className="text-gray-700 text-2xl hover:text-red-500">
              <FaTimes />
            </button>
          </div>
          <div className="p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#28809A]/10 rounded-full flex items-center justify-center">
                <FaUserAlt className="text-2xl text-[#28809A]" />
              </div>
              <div>
                <div className="font-bold text-lg text-[#28809A]">{player.name}</div>
                <div className="text-xs text-gray-500">{player.email}</div>
                <div className="text-xs text-gray-700 mt-1">Performance: <span className="font-bold">{player.overall_performance}</span></div>
              </div>
            </div>
            <p className="text-base text-gray-800 font-semibold rounded bg-[#e0f2fe] p-3 mb-2">
              {player.recommendation_text}
            </p>
            {Object.keys(player.recommendations).length > 0 && (
              <div className="space-y-6">
                {sortedCategories.map(category => (
                  <div key={category}>
                    <div className="font-bold text-[#28809A] mb-2">{category} Skills:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedAttributes[category]
                        .sort((a, b) => {
                          // Sort by absolute difference (descending)
                          return Math.abs(parseInt(b.diff)) - Math.abs(parseInt(a.diff));
                        })
                        .map(({ attr, diff }) => (
                          <div
                            key={attr}
                            className="rounded-xl border border-[#A7F3D0] shadow flex items-center justify-between px-4 py-2 bg-[#f8fafc]"
                          >
                            <span className="font-medium text-gray-700">
                              {attributeDisplayName[attr]?.name || attr}
                            </span>
                            <span className={`font-bold text-sm ${
                              parseInt(diff) < 0 ? 'text-red-500' : 'text-[#28809A]'
                            }`}>
                              {diff}
                            </span>
                          </div>
                        ))}
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
  <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-3 h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="mt-2 space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="mt-2 h-3 bg-gray-200 rounded w-1/4"></div>
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
          // For demo purposes - if no players, add Diogo Jota example
          const demoPlayers = data.underperforming_players.length > 0 
            ? data.underperforming_players 
            : [{
                player_id: 1,
                name: "Diogo Jota",
                email: "jota@example.com",
                team_id: 1,
                overall_performance: 78,
                recommendations: {
                  short_passing: "-5",
                  stamina: "-3",
                  vision: "-4",
                  dribbling: "-2",
                  strength: "-3",
                  positioning: "-4",
                  finishing: "-1",
                  agility: "-2",
                  balance: "-3",
                  shot_power: "-2",
                  marking: "-5",
                  ball_control: "-3",
                  long_passing: "-4",
                  acceleration: "-2",
                  sprint_speed: "-3",
                  reactions: "-1",
                  composure: "-2",
                  standing_tackle: "-5",
                  sliding_tackle: "-5"
                },
                recommendation_text: "Player Diogo Jota should focus on improving these attributes to enhance overall performance."
              }];
          
          setRecommendations(demoPlayers);
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
    <div className='w-[45%] h-[390px] border border-opacity-10 shadow-lg rounded-xl p-4 bg-white flex flex-col'>
      <p className='text-dark font-bold text-xl mb-4'>Recommended formation</p>
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="w-full h-full max-h-[330px] overflow-y-auto"><SkeletonLoader /></div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
            <div className="text-red-500 font-semibold mb-2">{error}</div>
            <p className="text-gray-500 text-sm">No recommendations available at this time</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
            <FaRegLightbulb className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No recommendations found</p>
            <p className="text-gray-400 text-sm mt-1">All players are performing well</p>
          </div>
        ) : (
          <div className="h-full max-h-[330px] overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map(player => (
                <motion.div
                  key={player.player_id}
                  whileHover={{ scale: 1.02, boxShadow: "0 6px 16px 0 #A7F3D0" }}
                  className="cursor-pointer bg-gradient-to-br from-[#e0f2fe] to-[#f8fafc] border border-[#A7F3D0] shadow rounded-lg p-4 flex flex-col gap-2 transition"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#28809A]/10 rounded-full flex items-center justify-center">
                      <FaUserAlt className="text-[#28809A]" />
                    </div>
                    <div>
                      <div className="font-bold text-[#28809A]">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.email}</div>
                    </div>
                  </div>
                  <div className="mt-1 text-gray-700 text-sm">
                    <span className="font-bold">Performance:</span> {player.overall_performance}
                  </div>
                  <div className="font-semibold text-gray-800 mt-1 truncate-2-lines">
                    {player.recommendation_text}
                  </div>
                  <div className="text-xs text-[#28809A] font-semibold mt-1">Click for full recommendation</div>
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