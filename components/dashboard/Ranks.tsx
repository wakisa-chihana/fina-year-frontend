"use client";
import { useState, useEffect } from 'react';
import { 
  FaArrowRight, FaUserAlt, FaTrophy, FaStar, FaFutbol, 
  FaRunning, FaHandsHelping, FaChartLine, FaTimes, 
  FaBirthdayCake, FaRulerVertical, FaWeight, FaShoePrints, 
  FaCrosshairs, FaBrain, FaShieldAlt, FaBolt, FaFistRaised 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Bar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';
import { baseUrl } from '@/constants/baseUrl';

ChartJS.register(
  RadialLinearScale,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

interface PlayerAttributes {
  player_id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  user_created_at: string;
  position: string;
  id: number;
  age: number;
  height_cm: number;
  weight_kgs: number;
  preferred_foot_encoded: number;
  weak_foot: number;
  skill_moves: number;
  crossing: number;
  finishing: number;
  heading_accuracy: number;
  short_passing: number;
  volleys: number;
  dribbling: number;
  curve: number;
  freekick_accuracy: number;
  long_passing: number;
  ball_control: number;
  acceleration: number;
  sprint_speed: number;
  agility: number;
  reactions: number;
  balance: number;
  shot_power: number;
  jumping: number;
  stamina: number;
  strength: number;
  long_shots: number;
  aggression: number;
  interceptions: number;
  positioning: number;
  vision: number;
  penalties: number;
  composure: number;
  marking: number;
  standing_tackle: number;
  sliding_tackle: number;
  overall_performance: number;
  work_rate_encoded: number;
  rank: number;
}

interface ApiResponse {
  success: boolean;
  coach_id: number;
  total_players: number;
  players_ranked: PlayerAttributes[];
}

const calculateStrokeProperties = (rating: number) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rating / 100) * circumference;
  return { radius, circumference, strokeDashoffset };
};

const getPreferredFoot = (encodedValue: number) => {
  return encodedValue === 1 ? 'Right' : 'Left';
};

const getWorkRate = (encodedValue: number) => {
  const rates = ['Low', 'Medium', 'High'];
  return rates[encodedValue - 1] || 'Unknown';
};

const getPositionColor = (position: string) => {
  switch(position.toLowerCase()) {
    case 'goalkeeper':
      return 'bg-red-100 text-red-800';
    case 'defender':
      return 'bg-blue-100 text-blue-800';
    case 'midfielder':
      return 'bg-green-100 text-green-800';
    case 'forward':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Ranks = () => {
  const [players, setPlayers] = useState<PlayerAttributes[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerAttributes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankedPlayers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coachId = document.cookie.split('; ').find(row => row.startsWith('x-user-id='))?.split('=')[1];
      if (!coachId) {
        throw new Error('Coach ID not found in cookies');
      }

      const response = await fetch(`${baseUrl}/rank_players/${coachId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch player rankings');
      }
      
      const data: ApiResponse = await response.json();
      if (data.success && data.players_ranked) {
        setPlayers(data.players_ranked);
      } else {
        throw new Error('No player data available');
      }
    } catch (err) {
      console.error('Error fetching player rankings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankedPlayers();
  }, []);

  const handlePlayerClick = (player: PlayerAttributes) => {
    setSelectedPlayer(player);
  };

  const prepareAttributeGroups = (player: PlayerAttributes) => {
    return {
      physical: [
        { attribute: 'Acceleration', value: player.acceleration, icon: <FaBolt className="mr-1" /> },
        { attribute: 'Sprint Speed', value: player.sprint_speed, icon: <FaRunning className="mr-1" /> },
        { attribute: 'Agility', value: player.agility, icon: <FaFistRaised className="mr-1" /> },
        { attribute: 'Balance', value: player.balance, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Jumping', value: player.jumping, icon: <FaFistRaised className="mr-1" /> },
        { attribute: 'Stamina', value: player.stamina, icon: <FaRunning className="mr-1" /> },
        { attribute: 'Strength', value: player.strength, icon: <FaFistRaised className="mr-1" /> },
      ],
      technical: [
        { attribute: 'Ball Control', value: player.ball_control, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Dribbling', value: player.dribbling, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Short Pass', value: player.short_passing, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Long Pass', value: player.long_passing, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Crossing', value: player.crossing, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Curve', value: player.curve, icon: <FaFutbol className="mr-1" /> },
      ],
      mental: [
        { attribute: 'Reactions', value: player.reactions, icon: <FaBrain className="mr-1" /> },
        { attribute: 'Positioning', value: player.positioning, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Vision', value: player.vision, icon: <FaBrain className="mr-1" /> },
        { attribute: 'Composure', value: player.composure, icon: <FaBrain className="mr-1" /> },
        { attribute: 'Interceptions', value: player.interceptions, icon: <FaShieldAlt className="mr-1" /> },
        { attribute: 'Aggression', value: player.aggression, icon: <FaFistRaised className="mr-1" /> },
      ],
      shooting: [
        { attribute: 'Finishing', value: player.finishing, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Volleys', value: player.volleys, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Long Shots', value: player.long_shots, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Shot Power', value: player.shot_power, icon: <FaFistRaised className="mr-1" /> },
        { attribute: 'Heading', value: player.heading_accuracy, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Penalties', value: player.penalties, icon: <FaCrosshairs className="mr-1" /> },
      ],
      defensive: [
        { attribute: 'Marking', value: player.marking, icon: <FaShieldAlt className="mr-1" /> },
        { attribute: 'Stand Tackle', value: player.standing_tackle, icon: <FaShieldAlt className="mr-1" /> },
        { attribute: 'Slide Tackle', value: player.sliding_tackle, icon: <FaShieldAlt className="mr-1" /> },
      ]
    };
  };

  if (error) {
    return (
      <div className="w-full md:w-[30%] shadow-lg border border-opacity-10 rounded-xl p-4 bg-white">
        <div className="text-dark font-bold text-lg">Ranks</div>
        <div className="flex-1 flex flex-col items-center justify-center text-center h-full">
            
            <p className="text-gray-500 text-sm">No player available at this time</p>
          </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[30%] shadow-lg border border-opacity-10 rounded-xl p-4 bg-white">
      <div className="w-full flex flex-row justify-between items-center">
        <p className="text-dark font-bold">Ranks</p>
        <FaArrowRight className="text-dark_blue hover:scale-125" />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 mt-4 overflow-auto max-h-[50vh] pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full flex flex-row gap-2 items-center h-16">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 h-full flex flex-col justify-center">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-[50vh] pb-2 pr-2 custom-scrollbar">
          {players.map((player) => (
            <div 
              key={player.player_id} 
              className="w-full flex flex-row gap-2 items-center h-16 cursor-pointer hover:bg-gray-100 p-2 rounded relative bg-white"
              onClick={() => handlePlayerClick(player)}
            >
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-500">
                #{player.rank}
              </div>
              <div className="relative ml-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center">
                  <FaUserAlt className="text-xl text-white" />
                </div>
              </div>
              <div className="text-dark flex-1">
                <p className="font-bold text-sm">{player.name}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">Overall: {player.overall_performance.toFixed(1)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-xs font-bold">{player.skill_moves}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Details Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto mx-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="p-4 md:p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                      {selectedPlayer.name} <span className="text-blue-600">#{selectedPlayer.rank}</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs md:text-sm font-medium ${getPositionColor(selectedPlayer.position)}`}>
                        {selectedPlayer.position}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm font-medium">
                        Overall: {selectedPlayer.overall_performance.toFixed(1)}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs md:text-sm font-medium">
                        Age: {selectedPlayer.age}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs md:text-sm font-medium">
                        {getPreferredFoot(selectedPlayer.preferred_foot_encoded)} footed
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPlayer(null)}
                    className="p-1 md:p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="text-gray-500 text-lg md:text-xl" />
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  {/* Physical Attributes Radar */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center text-gray-900">
                      <FaBolt className="mr-2 text-blue-500" /> Physical Attributes
                    </h3>
                    <div className="h-48 md:h-64">
                      <Radar 
                        data={{
                          labels: prepareAttributeGroups(selectedPlayer).physical.map(attr => attr.attribute),
                          datasets: [{
                            label: 'Physical',
                            data: prepareAttributeGroups(selectedPlayer).physical.map(attr => attr.value),
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              angleLines: { display: true },
                              suggestedMin: 0,
                              suggestedMax: 100,
                              ticks: { stepSize: 20 }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Technical Skills Bar */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center text-gray-900">
                      <FaFutbol className="mr-2 text-green-500" /> Technical Skills
                    </h3>
                    <div className="h-48 md:h-64">
                      <Bar 
                        data={{
                          labels: prepareAttributeGroups(selectedPlayer).technical.map(attr => attr.attribute),
                          datasets: [{
                            label: 'Technical',
                            data: prepareAttributeGroups(selectedPlayer).technical.map(attr => attr.value),
                            backgroundColor: 'rgba(16, 185, 129, 0.6)',
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: { beginAtZero: true, max: 100 }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                  {/* Foot Preference */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center text-gray-900">
                      <FaShoePrints className="mr-2 text-purple-500" /> Foot Attributes
                    </h3>
                    <div className="h-40 md:h-48">
                      <PolarArea 
                        data={{
                          labels: ['Preferred Foot', 'Weak Foot', 'Skill Moves'],
                          datasets: [{
                            data: [
                              selectedPlayer.preferred_foot_encoded * 50,
                              selectedPlayer.weak_foot * 20,
                              selectedPlayer.skill_moves * 20
                            ],
                            backgroundColor: [
                              'rgba(99, 102, 241, 0.6)',
                              'rgba(239, 68, 68, 0.6)',
                              'rgba(234, 179, 8, 0.6)'
                            ]
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                    <div className="mt-3 md:mt-4 grid grid-cols-3 gap-1 md:gap-2">
                      <div className="bg-purple-50 p-1 md:p-2 rounded">
                        <p className="text-xs text-purple-600 font-bold">Preferred Foot</p>
                        <p className="font-bold text-base md:text-lg">{getPreferredFoot(selectedPlayer.preferred_foot_encoded)}</p>
                      </div>
                      <div className="bg-red-50 p-1 md:p-2 rounded">
                        <p className="text-xs text-red-600 font-bold">Weak Foot</p>
                        <p className="font-bold text-base md:text-lg">{selectedPlayer.weak_foot}/5</p>
                      </div>
                      <div className="bg-yellow-50 p-1 md:p-2 rounded">
                        <p className="text-xs text-yellow-600 font-bold">Skill Moves</p>
                        <p className="font-bold text-base md:text-lg">{selectedPlayer.skill_moves}/5</p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Stats */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Physical Stats</h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1 md:p-2 bg-blue-100 rounded-full text-blue-600">
                          <FaRulerVertical className="text-sm md:text-base" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-900 font-semibold">Height</p>
                          <p className="font-bold text-base text-gray-600 md:text-lg ">{selectedPlayer.height_cm} cm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1 md:p-2 bg-green-100 rounded-full text-green-600">
                          <FaWeight className="text-sm md:text-base" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-900 font-semibold">Weight</p>
                          <p className="font-bold text-base text-gray-600  md:text-lg">{selectedPlayer.weight_kgs} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1 md:p-2 bg-yellow-100 rounded-full text-yellow-600">
                          <FaBirthdayCake className="text-sm md:text-base" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-900 font-semibold">Age</p>
                          <p className="font-bold text-base text-gray-600  md:text-lg">{selectedPlayer.age} years</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skill Ratings */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Skill Ratings</h3>
                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <div className="flex justify-between text-xs md:text-sm mb-1 text-gray-600 ">
                          <span className="font-semibold ">Skill Moves</span>
                          <span className="font-bold">{selectedPlayer.skill_moves}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 ">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full text-gray-600 " 
                            style={{ width: `${selectedPlayer.skill_moves * 20}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs md:text-sm mb-1 text-gray-600 ">
                          <span className="font-semibold">Weak Foot</span>
                          <span className="font-bold">{selectedPlayer.weak_foot}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full text-gray-600 " 
                            style={{ width: `${selectedPlayer.weak_foot * 20}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs md:text-sm mb-1 text-gray-600 ">
                          <span className="font-semibold">Work Rate</span>
                          <span className="font-bold">{getWorkRate(selectedPlayer.work_rate_encoded)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(selectedPlayer.work_rate_encoded / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attribute Highlights */}
                <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Attribute Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-gray-500 ">
                    {[
                      { name: 'Best Attribute', value: 'Long Shots', score: selectedPlayer.long_shots },
                      { name: 'Defensive Strength', value: 'Sliding Tackle', score: selectedPlayer.sliding_tackle },
                      { name: 'Mental Strength', value: 'Composure', score: selectedPlayer.composure },
                      { name: 'Technical Strength', value: 'Dribbling', score: selectedPlayer.dribbling },
                    ].map((item, index) => (
                      <div key={index} className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold">{item.name}</p>
                        <p className="font-bold text-base md:text-lg">{item.value}</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{item.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Ranks;