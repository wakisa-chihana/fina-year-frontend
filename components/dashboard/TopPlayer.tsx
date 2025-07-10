import { useState, useEffect } from 'react';
import { 
  FaUserAlt, FaTrophy, FaStar, FaFutbol, FaRunning, 
  FaHandsHelping, FaChartLine, FaTimes, FaBirthdayCake, 
  FaRulerVertical, FaWeight, FaShoePrints, FaCrosshairs,
  FaBrain, FaShieldAlt, FaBolt, FaFistRaised,
  FaExclamationTriangle
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
}

interface ApiResponse {
  success: boolean;
  top_player: PlayerAttributes;
}

const CACHE_KEY = 'topPlayerData';
const CACHE_EXPIRY_DAYS = 1;

const getPreferredFoot = (encodedValue: number) => {
  return encodedValue === 1 ? 'Right' : 'Left';
};

const getWorkRate = (encodedValue: number) => {
  const rates = ['Low', 'Medium', 'High'];
  return rates[encodedValue - 1] || 'Unknown';
};

const TopPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerAttributes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const isCacheValid = (cachedData: any) => {
    if (!cachedData || !cachedData.timestamp) return false;
    const now = new Date().getTime();
    return now - cachedData.timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  };

  const getCachedData = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    
    try {
      const parsedData = JSON.parse(cachedData);
      return isCacheValid(parsedData) ? parsedData.data : null;
    } catch (e) {
      return null;
    }
  };

  const setCachedData = (data: PlayerAttributes) => {
    const cacheObject = {
      data,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchTopPlayer = async () => {
    setIsLoading(true);
    setError(null);

    const cachedData = getCachedData();
    if (cachedData && !isOnline) {
      setPlayerData(cachedData);
      setIsLoading(false);
      return;
    }

    try {
      const coachId = document.cookie.split('; ').find(row => row.startsWith('x-user-id='))?.split('=')[1];
      if (!coachId) {
        throw new Error('Coach ID not found in cookies');
      }

      const response = await fetch(`${baseUrl}/top_player/${coachId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch player data');
      }
      
      const data: ApiResponse = await response.json();
      if (data.success && data.top_player) {
        setPlayerData(data.top_player);
        setCachedData(data.top_player);
      } else {
        throw new Error('No player data available');
      }
    } catch (err) {
      console.error('Error fetching top player:', err);
      const cachedData = getCachedData();
      if (cachedData) {
        // Only use cached data if it matches the current coachId
        const coachId = document.cookie.split('; ').find(row => row.startsWith('x-user-id='))?.split('=')[1];
        if (cachedData && String(cachedData.player_id) === coachId) {
          setPlayerData(cachedData);
          setError('Using cached data. ' + (err instanceof Error ? err.message : 'Network error'));
        } else {
          setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPlayer();
  }, []);

  const handleCardClick = () => {
    if (!isLoading) {
      setIsExpanded(!isExpanded);
    }
  };

  const prepareAttributeGroups = () => {
    if (!playerData) return {};

    return {
      physical: [
        { attribute: 'Acceleration', value: playerData.acceleration, icon: <FaBolt className="mr-1" /> },
        { attribute: 'Sprint Speed', value: playerData.sprint_speed, icon: <FaRunning className="mr-1" /> },
        { attribute: 'Agility', value: playerData.agility, icon: <FaFistRaised className="mr-1" /> },
        { attribute: 'Balance', value: playerData.balance, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Jumping', value: playerData.jumping, icon: <FaFistRaised className="mr-1" /> },
        { attribute: 'Stamina', value: playerData.stamina, icon: <FaRunning className="mr-1" /> },
        { attribute: 'Strength', value: playerData.strength, icon: <FaFistRaised className="mr-1" /> },
      ],
      technical: [
        { attribute: 'Ball Control', value: playerData.ball_control, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Dribbling', value: playerData.dribbling, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Short Pass', value: playerData.short_passing, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Long Pass', value: playerData.long_passing, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Crossing', value: playerData.crossing, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Curve', value: playerData.curve, icon: <FaFutbol className="mr-1" /> },
      ],
      mental: [
        { attribute: 'Reactions', value: playerData.reactions, icon: <FaBrain className="mr-1" /> },
        { attribute: 'Positioning', value: playerData.positioning, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Vision', value: playerData.vision, icon: <FaBrain className="mr-1" /> },
        { attribute: 'Composure', value: playerData.composure, icon: <FaBrain className="mr-1" /> },
        { attribute: 'Interceptions', value: playerData.interceptions, icon: <FaShieldAlt className="mr-1" /> },
        { attribute: 'Aggression', value: playerData.aggression, icon: <FaFistRaised className="mr-1" /> },
      ],
      shooting: [
        { attribute: 'Finishing', value: playerData.finishing, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Volleys', value: playerData.volleys, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Long Shots', value: playerData.long_shots, icon: <FaCrosshairs className="mr-1" /> },
        { attribute: 'Shot Power', value: playerData.shot_power, icon: <FaFistRaised className="mr-1" /> },
        { attribute: 'Heading', value: playerData.heading_accuracy, icon: <FaFutbol className="mr-1" /> },
        { attribute: 'Penalties', value: playerData.penalties, icon: <FaCrosshairs className="mr-1" /> },
      ],
      defensive: [
        { attribute: 'Marking', value: playerData.marking, icon: <FaShieldAlt className="mr-1" /> },
        { attribute: 'Stand Tackle', value: playerData.standing_tackle, icon: <FaShieldAlt className="mr-1" /> },
        { attribute: 'Slide Tackle', value: playerData.sliding_tackle, icon: <FaShieldAlt className="mr-1" /> },
      ]
    };
  };

  const attributeGroups = prepareAttributeGroups();

  const physicalRadarData = {
    labels: attributeGroups.physical?.map(attr => attr.attribute) || [],
    datasets: [
      {
        label: 'Physical Attributes',
        data: attributeGroups.physical?.map(attr => attr.value) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const technicalBarData = {
    labels: attributeGroups.technical?.map(attr => attr.attribute) || [],
    datasets: [
      {
        label: 'Technical Skills',
        data: attributeGroups.technical?.map(attr => attr.value) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
    ],
  };

  const footPolarData = {
    labels: ['Preferred Foot', 'Weak Foot'],
    datasets: [
      {
        data: playerData ? [
          playerData.preferred_foot_encoded * 50, 
          playerData.weak_foot * 20
        ] : [0, 0],
        backgroundColor: [
          'rgba(99, 102, 241, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
      },
    ],
  };

 

if (error) {
  return (
    <div className="p-4 rounded-lg bg-white border ">
      <div className="flex items-start">
        <FaExclamationTriangle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0 text-dark" />
        <div>
          {error.includes('') ? (
            <>
              <span className="font-medium text-dark">No top player available currently</span>
              
            </>
          ) : error.includes('No players found') ? (
            "No players are currently registered in the system."
          ) : (
            `Error loading player data: ${error}`
          )}
        </div>
      </div>
    </div>
  );
}

  return (
    <>
      <motion.div 
        className={`w-full ${isExpanded ? 'fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4' : 'md:w-[25%] p-2 h-[360px] group cursor-pointer'}`}
        onClick={handleCardClick}
        whileHover={{ scale: isLoading ? 1 : 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {isExpanded ? (
          <motion.div 
            className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-3">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg">
                      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                      {i === 1 ? (
                        <div className="h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                      ) : (
                        <div className="space-y-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : playerData ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{playerData.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Overall: {playerData.overall_performance.toFixed(1)}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Age: {playerData.age}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="text-gray-600 text-xl" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                      <FaBolt className="mr-2 text-blue-500" /> Physical Attributes
                    </h3>
                    <div className="h-64">
                      <Radar 
                        data={physicalRadarData}
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

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                      <FaFutbol className="mr-2 text-green-500" /> Technical Skills
                    </h3>
                    <div className="h-64">
                      <Bar 
                        data={technicalBarData}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                      <FaShoePrints className="mr-2 text-purple-500" /> Foot Attributes
                    </h3>
                    <div className="h-48">
                      <PolarArea 
                        data={footPolarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-xs text-purple-700 font-medium">Preferred Foot</p>
                        <p className="font-bold text-gray-800">{getPreferredFoot(playerData.preferred_foot_encoded)}</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs text-red-700 font-medium">Weak Foot</p>
                        <p className="font-bold text-gray-800">{playerData.weak_foot}/5</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Physical Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                          <FaRulerVertical />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Height</p>
                          <p className="font-bold text-gray-800">{playerData.height_cm} cm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                          <FaWeight />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Weight</p>
                          <p className="font-bold text-gray-800">{playerData.weight_kgs} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                          <FaBirthdayCake />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Age</p>
                          <p className="font-bold text-gray-800">{playerData.age} years</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Skill Ratings</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-gray-700">
                          <span>Skill Moves</span>
                          <span>{playerData.skill_moves}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${playerData.skill_moves * 20}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-gray-700">
                          <span>Weak Foot</span>
                          <span>{playerData.weak_foot}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${playerData.weak_foot * 20}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-gray-700">
                          <span>Work Rate</span>
                          <span>{getWorkRate(playerData.work_rate_encoded)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(playerData.work_rate_encoded / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Attribute Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Best Attribute', value: 'Long Shots', score: playerData.long_shots },
                      { name: 'Defensive Strength', value: 'Sliding Tackle', score: playerData.sliding_tackle },
                      { name: 'Mental Strength', value: 'Composure', score: playerData.composure },
                      { name: 'Technical Strength', value: 'Dribbling', score: playerData.dribbling },
                    ].map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-600 font-medium">{item.name}</p>
                        <p className="font-bold text-gray-800">{item.value}</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{item.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : (
          <div className="w-full h-full relative rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200">
            {isLoading ? (
              <div className="h-full w-full p-4 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-6"></div>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-8"></div>
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : playerData ? (
              <>
                {/* Performance Header */}
                <div className="w-full h-28 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between px-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4 border-2 border-white border-opacity-30">
                      <FaUserAlt className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">{playerData.name}</h3>
                      <p className="text-white text-opacity-90 text-sm">
                        {playerData.age} years • {playerData.height_cm}cm • {getPreferredFoot(playerData.preferred_foot_encoded)} foot
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-white text-opacity-90 text-sm mb-1">OVERALL RATING</div>
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-white border-opacity-30 flex items-center justify-center bg-white bg-opacity-10">
                        <div className="text-white font-bold text-3xl">
                          {playerData.overall_performance.toFixed(0)}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                        <FaStar className="text-white text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 pt-4 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-sm">
                      <FaFutbol className="text-blue-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">SKILL MOVES</p>
                    <div className="flex justify-center items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${playerData.skill_moves * 20}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{playerData.skill_moves}/5</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-2 shadow-sm">
                      <FaShoePrints className="text-green-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">WEAK FOOT</p>
                    <div className="flex justify-center items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${playerData.weak_foot * 20}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{playerData.weak_foot}/5</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 shadow-sm">
                      <FaBolt className="text-purple-500 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">WORK RATE</p>
                    <p className="text-sm font-bold text-gray-800 mt-2">
                      {getWorkRate(playerData.work_rate_encoded)}
                    </p>
                  </div>
                </div>

                {/* Attribute Highlights */}
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">TOP ATTRIBUTES</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-blue-600 font-medium">DRIBBLING</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${playerData.dribbling}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{playerData.dribbling}</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-green-600 font-medium">SPEED</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${playerData.sprint_speed}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{playerData.sprint_speed}</span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-yellow-600 font-medium">SHOOTING</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-yellow-500 h-1.5 rounded-full" 
                              style={{ width: `${playerData.finishing}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{playerData.finishing}</span>
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-red-600 font-medium">STRENGTH</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full" 
                              style={{ width: `${playerData.strength}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{playerData.strength}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top player badge */}
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-md flex items-center">
                    <FaTrophy className="mr-1" />
                    TOP PLAYER
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default TopPlayer;