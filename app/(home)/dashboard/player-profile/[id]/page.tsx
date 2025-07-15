'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  FaUserAlt, FaFutbol, FaRunning, FaShieldAlt, FaCross, 
  FaShoePrints, FaTachometerAlt, FaBolt, FaStopwatch, 
  FaDumbbell, FaBullseye, FaEye, FaBrain, FaFistRaised,
  FaPlus, FaFire, FaClock, FaMedal, FaChevronLeft, FaRegSadTear
} from 'react-icons/fa';
import { GiSoccerBall, GiSoccerKick, GiSoccerField, GiStrong } from 'react-icons/gi';
import { IoMdSend } from 'react-icons/io';
import { RiSwordFill } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
} from 'chart.js';
import { JSX } from 'react/jsx-runtime';
import PlayerProfileForm from '@/components/player-profile-comp/player-profile-form';
import LoadingAnimation from '@/components/LoadingAnimation';
import { baseUrl } from '@/constants/baseUrl';
import {
  AreaChart,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
);

const colorPalette = {
  blue: "#3B82F6",
  indigo: "#6366F1",
  green: "#10B981",
  amber: "#F59E42",
  yellow: "#FBBF24",
  purple: "#A78BFA",
  red: "#EF4444",
  gray: "#E5E7EB",
  white: "#FFFFFF",
};

const chartColors = {
  physical: [
    colorPalette.blue,
    colorPalette.indigo,
    colorPalette.green,
    colorPalette.amber,
    colorPalette.yellow,
    colorPalette.purple,
    colorPalette.red,
    colorPalette.gray,
    colorPalette.green
  ],
  technical: [
    colorPalette.green,
    colorPalette.blue,
    colorPalette.indigo,
    colorPalette.amber,
    colorPalette.yellow,
    colorPalette.purple,
    colorPalette.red,
    colorPalette.gray,
    colorPalette.yellow,
    colorPalette.purple,
    colorPalette.blue,
    colorPalette.green,
  ],
  mental: [
    colorPalette.purple,
    colorPalette.amber,
    colorPalette.red,
    colorPalette.green,
    colorPalette.indigo
  ],
  defensive: [
    colorPalette.blue,
    colorPalette.green,
    colorPalette.red,
    colorPalette.indigo
  ],
};

const chartSizes = {
  mobile: {
    pieHeight: "h-40",
    radarHeight: "h-44",
    barHeight: "h-40",
    icon: "text-xl mr-2",
    avatar: "w-24 h-24 mb-4",
    avatarIcon: "text-4xl",
    title: "text-xl",
    overall: "text-3xl",
    headerIcon: "text-2xl"
  },
  desktop: {
    pieHeight: "h-64",
    radarHeight: "h-72",
    barHeight: "h-72",
    icon: "text-2xl mr-2",
    avatar: "w-40 h-40 mb-6",
    avatarIcon: "text-7xl",
    title: "text-3xl",
    overall: "text-5xl",
    headerIcon: "text-4xl"
  }
};

interface PlayerData {
  player_id: number;
  player_name: string;
  player_email: string;
  position: string;
  age: number | null;
  height_cm: number | null;
  weight_kgs: number | null;
  preferred_foot_encoded: number | null;
  weak_foot: number | null;
  skill_moves: number | null;
  work_rate_encoded: number | null;
  crossing: number | null;
  finishing: number | null;
  heading_accuracy: number | null;
  short_passing: number | null;
  volleys: number | null;
  dribbling: number | null;
  curve: number | null;
  freekick_accuracy: number | null;
  long_passing: number | null;
  ball_control: number | null;
  acceleration: number | null;
  sprint_speed: number | null;
  agility: number | null;
  reactions: number | null;
  balance: number | null;
  shot_power: number | null;
  jumping: number | null;
  stamina: number | null;
  strength: number | null;
  long_shots: number | null;
  aggression: number | null;
  interceptions: number | null;
  positioning: number | null;
  vision: number | null;
  penalties: number | null;
  composure: number | null;
  marking: number | null;
  standing_tackle: number | null;
  sliding_tackle: number | null;
  overall_performance: number | null;
}

type PerformanceHistoryItem = {
  overall_performance: number;
  recorded_at: string | null;
};

const workRateMap: Record<string, string> = {
  "4": 'High / High',
  "3.5": 'High / Medium',
  "3": 'High / Low',
  "2.5": 'Medium / Medium',
  "2": 'Medium / Low',
  "1.5": 'Low / Medium',
  "1": 'Low / Low'
};

const tabList = [
  { key: 'overview', label: 'Overview', icon: <FaMedal /> },
  { key: 'stats', label: 'Detailed Stats', icon: <FaFutbol /> },
  { key: 'performance', label: 'Performance', icon: <FaBolt /> }
];

export default function PlayerProfilePage() {
  const params = useParams<{ id: string }>();
  const playerId = params?.id || '';
  const coachId = Cookies.get("x-user-id") || '';
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryItem[]>([]);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Responsive: UseEffect to set mobile state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sizes = isMobile ? chartSizes.mobile : chartSizes.desktop;

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        if (!playerId || !coachId) {
          throw new Error('Missing player ID or coach ID');
        }

        setLoading(true);
        setError(null);

        // Fetch player profile
        const response = await fetch(
          `${baseUrl}/team_players/player/${playerId}/coach/${coachId}`,
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('x-access-token')}`,
              'Content-Type': 'application/json'
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch player data: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.player) {
          setPlayerData(data.player);
        } else {
          throw new Error(data.message || 'Invalid player data received');
        }

        // Fetch performance history
        const perfResponse = await fetch(
          `${baseUrl}/performance/player/history/${coachId}/${playerId}`,
          {
            headers: {
              'Authorization': `Bearer ${Cookies.get('x-access-token')}`,
              'Content-Type': 'application/json'
            },
          }
        );
        if (perfResponse.ok) {
          const perfData = await perfResponse.json();
          setPerformanceHistory(perfData.performance_history || []);
        } else {
          setPerformanceHistory([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId, coachId]);

  const getPositionIcon = () => {
    if (!playerData) return null;
    const position = playerData.position.toLowerCase();
    if (position.includes('forward')) {
      return <GiSoccerKick className={`${sizes.icon} text-red-500`} />;
    } else if (position.includes('midfielder')) {
      return <GiSoccerBall className={`${sizes.icon} text-blue-500`} />;
    } else if (position.includes('defender')) {
      return <FaShieldAlt className={`${sizes.icon} text-green-500`} />;
    } else if (position.includes('goalkeeper')) {
      return <FaCross className={`${sizes.icon} text-purple-500`} />;
    }
    return <FaUserAlt className={`${sizes.icon} text-gray-500`} />;
  };

  const getPreferredFoot = () => {
    if (playerData?.preferred_foot_encoded === null) return 'Unknown';
    return playerData?.preferred_foot_encoded === 1 ? 'Right' : 'Left';
  };

  const getWorkRate = () => {
    if (!playerData || playerData.work_rate_encoded === null) return 'Unknown';
    return workRateMap[String(playerData.work_rate_encoded)] || 'Unknown';
  };

  const calculateAttributeAverages = () => {
    if (!playerData) return null;

    const categories = {
      physical: ['acceleration', 'sprint_speed', 'agility', 'reactions', 'strength', 'stamina', 'jumping', 'aggression'],
      technical: ['ball_control', 'dribbling', 'finishing', 'long_shots', 'crossing', 'short_passing', 'long_passing', 'shot_power'],
      mental: ['positioning', 'vision', 'composure', 'penalties'],
      defensive: ['interceptions', 'marking', 'standing_tackle', 'sliding_tackle']
    };

    const averages: Record<string, number> = {};
    Object.entries(categories).forEach(([category, attributes]) => {
      const validAttributes = attributes.filter(attr => 
        playerData[attr as keyof PlayerData] !== null
      );
      if (validAttributes.length > 0) {
        const sum = validAttributes.reduce((acc, attr) => 
          acc + (playerData[attr as keyof PlayerData] as number), 0
        );
        averages[category] = Math.round(sum / validAttributes.length);
      }
    });

    return averages;
  };

  // PIE CHARTS FOR DETAILED STATS
  const renderPieChart = (
    featureGroup: { [label: string]: number | null },
    chartLabel: string,
    colorList: string[]
  ) => {
    const labels = Object.keys(featureGroup);
    const data = labels.map(label => featureGroup[label] ?? 0);
    if (data.every(val => val === 0)) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100"
      >
        <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
          <FaMedal className="text-yellow-400" /> {chartLabel}
        </h3>
        <div className={sizes.pieHeight + " flex items-center justify-center"}>
          <Pie
            data={{
              labels,
              datasets: [
                {
                  label: chartLabel,
                  data,
                  backgroundColor: colorList,
                  borderColor: colorPalette.white,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: isMobile ? "bottom" : "right",
                  labels: { boxWidth: 16, padding: 16 }
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: function(context: any) {
                      return `${context.label}: ${context.parsed}`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>
    );
  };

  const renderDetailedStatsCharts = () => {
    if (!playerData) return null;
    const physical = {
      Acceleration: playerData.acceleration,
      SprintSpeed: playerData.sprint_speed,
      Agility: playerData.agility,
      Reactions: playerData.reactions,
      Strength: playerData.strength,
      Stamina: playerData.stamina,
      Jumping: playerData.jumping,
      Aggression: playerData.aggression,
      Balance: playerData.balance,
    };
    const technical = {
      BallControl: playerData.ball_control,
      Dribbling: playerData.dribbling,
      Finishing: playerData.finishing,
      LongShots: playerData.long_shots,
      Crossing: playerData.crossing,
      ShortPassing: playerData.short_passing,
      LongPassing: playerData.long_passing,
      ShotPower: playerData.shot_power,
      SkillMoves: playerData.skill_moves,
      Volleys: playerData.volleys,
      Curve: playerData.curve,
      FreeKickAccuracy: playerData.freekick_accuracy,
      HeadingAccuracy: playerData.heading_accuracy,
    };
    const mental = {
      Positioning: playerData.positioning,
      Vision: playerData.vision,
      Composure: playerData.composure,
      Penalties: playerData.penalties,
      WorkRate: playerData.work_rate_encoded,
    };
    const defensive = {
      Interceptions: playerData.interceptions,
      Marking: playerData.marking,
      StandTackle: playerData.standing_tackle,
      SlideTackle: playerData.sliding_tackle,
    };
    return (
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 xl:grid-cols-4'} gap-8 mb-8`}>
        {renderPieChart(physical, "Physical Attributes", chartColors.physical)}
        {renderPieChart(technical, "Technical Skills", chartColors.technical)}
        {renderPieChart(mental, "Mental Attributes", chartColors.mental)}
        {renderPieChart(defensive, "Defensive Skills", chartColors.defensive)}
      </div>
    );
  };

  // Radar chart with improved position and size
  const renderRadarChart = () => {
    const averages = calculateAttributeAverages();
    if (!averages) return null;
    const data = {
      labels: Object.keys(averages).map(label => 
        label.charAt(0).toUpperCase() + label.slice(1)
      ),
      datasets: [
        {
          label: 'Attribute Averages',
          data: Object.values(averages),
          backgroundColor: 'rgba(59, 130, 246, 0.15)', // blue-500 15%
          borderColor: colorPalette.blue,
          borderWidth: 3,
          pointBackgroundColor: colorPalette.blue,
          pointRadius: 5
        }
      ]
    };
    const options = {
      scales: {
        r: {
          angleLines: { display: true, color: 'rgba(200, 200, 200, 0.2)' },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { stepSize: 20, backdropColor: 'transparent' },
          grid: { color: 'rgba(200, 200, 200, 0.1)' },
          pointLabels: {
            font: { size: 14, weight: 'bold' as const },
            color: '#28809A'
          }
        }
      },
      plugins: { legend: { display: false } }
    };
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center`}
        style={{
          minHeight: isMobile ? 260 : 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
          <FaMedal className="text-yellow-400" /> Attribute Averages
        </h3>
        <div className={sizes.radarHeight + " w-full flex items-center justify-center"}>
          <Radar data={data} options={options} />
        </div>
      </motion.div>
    );
  };

  // Enhanced Performance Over Time using recharts
  const renderPerformanceChart = () => {
    if (loading) {
      return (
        <div className="w-full p-4 rounded-xl">
          <div className="animate-pulse">
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="w-full p-4 rounded-xl text-black text-sm flex flex-col items-center justify-center border border-gray-200">
          <FaRegSadTear className="text-2xl mb-2" />
          <span>No graph available</span>
        </div>
      );
    }
    if (!performanceHistory || performanceHistory.length === 0) {
      return (
        <div className="w-full p-4 rounded-xl text-gray-500 text-sm border border-gray-200">
          No data available
        </div>
      );
    }

    const chartData = performanceHistory.map((item) => {
      let label: string;
      if (item.recorded_at) {
        const date = new Date(item.recorded_at);
        label = date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();
      } else {
        label = "Current";
      }
      return {
        month: label,
        rating: item.overall_performance,
        fullDate: item.recorded_at,
      };
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
          <h3 className="text-lg font-bold text-[#28809A] flex items-center gap-2 mb-2">
            <FaBolt /> Performance Over Time
          </h3>
          <div className="flex space-x-1 self-end md:self-auto">
            <button 
              onClick={() => setChartType("area")}
              className={`px-2 py-1 text-xs rounded ${chartType === "area" ? "bg-black text-white" : "bg-gray-200"}`}
            >
              Area
            </button>
            <button 
              onClick={() => setChartType("bar")}
              className={`px-2 py-1 text-xs rounded ${chartType === "bar" ? "bg-black text-white" : "bg-gray-200"}`}
            >
              Bar
            </button>
          </div>
        </div>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#0c2830', fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']} 
                  tick={{ fill: '#0c2830', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "#3B82F6", fontWeight: "bold", fontSize: 14 }}
                  itemStyle={{ color: "#0c2830", fontSize: 13 }}
                  formatter={(value: number) => [`Rating: ${value.toFixed(1)}`, '']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRating)"
                  activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#0c2830', fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']} 
                  tick={{ fill: '#0c2830', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "#3B82F6", fontWeight: "bold", fontSize: 14 }}
                  itemStyle={{ color: "#0c2830", fontSize: 13 }}
                  formatter={(value: number) => [`Rating: ${value.toFixed(1)}`, '']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar
                  dataKey="rating"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  const renderStatCard = (icon: JSX.Element, title: string, value: number | null) => {
    if (value === null || value === undefined) return null;
    return (
      <motion.div 
        whileHover={{ scale: 1.04 }}
        className={`bg-white p-4 rounded-xl shadow border border-gray-100 flex items-center gap-3 transition-all ${isMobile ? "text-sm" : ""}`}
      >
        <div className="text-blue-500 text-xl">{icon}</div>
        <div>
          <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </motion.div>
    );
  };

  const handleFormSubmitSuccess = () => {
    setShowForm(false);
    window.location.reload();
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-200"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Player Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#28809A] text-white rounded-xl font-medium shadow-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-yellow-200"
        >
          <div className="text-yellow-500 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Player Not Found</h2>
          <p className="text-gray-600 mb-4">No player data available for ID: {playerId}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-blue-500 to-indigo-600 ${isMobile ? "p-4" : "p-8"} text-white shadow-lg rounded-b-3xl border-b-8 top-0 z-30`}
      >
        <div className={`mx-auto ${isMobile ? "space-y-4" : "flex items-center justify-between max-w-7xl"}`}>
          {/* Title Section */}
          <div className={`flex items-center ${isMobile ? "justify-center" : "gap-4"}`}>
            <button
              className="bg-white/20 hover:bg-white/40 rounded-full p-2 transition"
              onClick={() => window.history.back()}
              title="Back"
            >
              <FaChevronLeft size={20} />
            </button>
            <div className={`flex items-center gap-2 ${isMobile ? "ml-2" : "ml-0"}`}>
              <GiSoccerBall className={sizes.headerIcon} />
              <h1 className={`${sizes.title} font-extrabold tracking-wide drop-shadow-lg`}>
                {isMobile ? "Profile" : "Player Profile"}
              </h1>
            </div>
          </div>
          
          {/* Controls Section */}
          <div className={`flex items-center justify-between ${isMobile ? "gap-3" : "space-x-4"}`}>
            <div className={`bg-white/20 rounded-xl ${isMobile ? "px-3 py-2" : "px-5 py-2"} ${isMobile ? "text-sm" : "text-base"} font-bold tracking-wide flex items-center gap-2`}>
              <span className="text-white/80">ID:</span>
              <span className="text-white">{playerData.player_id}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className={`flex items-center gap-2 bg-white text-[#0c2830] hover:bg-slate-50 ${isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"} rounded-xl font-bold shadow-md transition`}
            >
              <FaPlus className={isMobile ? "text-xs" : "mr-1"} />
              <span>{isMobile ? "Add Data" : "Enter New Data"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`mx-auto ${isMobile ? "px-2 py-4" : "max-w-7xl px-4 py-8"}`}>
        {/* Player Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-3xl shadow-2xl overflow-hidden mb-10 border border-gray-100`}
        >
          <div className={`${isMobile ? "" : "md:flex"}`}>
            <div className={`${isMobile ? "p-4" : "md:w-1/3 p-7"} bg-gradient-to-b from-blue-500 to-indigo-600 text-white flex flex-col items-center justify-center`}>
              <div className={`${sizes.avatar} bg-white/20 rounded-full flex items-center justify-center shadow-lg border-4`}>
                <FaUserAlt className={sizes.avatarIcon} />
              </div>
              <h2 className={`${sizes.title} font-extrabold text-center drop-shadow-lg`}>{playerData.player_name}</h2>
              <div className="flex items-center mt-4">
                {getPositionIcon()}
                <span className={`${isMobile ? "text-base" : "text-xl"} font-bold`}>{playerData.position}</span>
              </div>
              <div className="mt-6 text-center">
                <p className="text-base opacity-80">Overall</p>
                <div className={`${sizes.overall} font-extrabold drop-shadow-lg`}>
                  {playerData.overall_performance || 'N/A'}
                </div>
              </div>
            </div>

            <div className={`${isMobile ? "p-4" : "md:w-2/3 p-8"} bg-white`}>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-8`}>
                <div>
                  <h3 className="text-xl font-bold text-blue-500 mb-4">Personal Info</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-900">Email</p>
                      <p className="text-gray-600 font-bold break-all">{playerData.player_email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">Age</p>
                        <p className="text-gray-600 font-bold">{playerData.age ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Preferred Foot</p>
                        <p className="text-gray-600 font-bold">{getPreferredFoot()}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">Height</p>
                        <p className="text-gray-600 font-bold">
                          {playerData.height_cm ? `${playerData.height_cm} cm` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Weight</p>
                        <p className="text-gray-600 font-bold">
                          {playerData.weight_kgs ? `${playerData.weight_kgs} kg` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">Work Rate</p>
                        <p className="text-gray-600 font-bold">
                          {getWorkRate()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Weak Foot</p>
                        <p className="text-gray-600 font-bold">
                          {playerData.weak_foot ? `${playerData.weak_foot}/5` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-blue-500 mb-4">Key Attributes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<FaBolt className="text-blue-500" />, 'Speed', 
                      Math.round(((playerData.acceleration || 0) + (playerData.sprint_speed || 0)) / 2))}
                    {renderStatCard(<GiSoccerBall className="text-blue-500" />, 'Dribbling', playerData.dribbling)}
                    {renderStatCard(<GiSoccerKick className="text-yellow-500" />, 'Shooting', 
                      Math.round(((playerData.finishing || 0) + (playerData.long_shots || 0) + (playerData.shot_power || 0)) / 3))}
                    {renderStatCard(<FaShieldAlt className="text-green-500" />, 'Defense', 
                      Math.round(((playerData.marking || 0) + (playerData.standing_tackle || 0) + (playerData.interceptions || 0)) / 3))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 rounded-lg overflow-x-auto bg-white shadow">
          {tabList.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition border-b-4 ${
                activeTab === tab.key 
                  ? 'text-blue-500 border-blue-500 bg-blue-50' 
                  : 'text-gray-700 border-transparent hover:text-blue-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-10`}
            >
              {renderRadarChart()}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-4 text-blue-500 flex items-center gap-2">
                  <FaMedal className="text-yellow-400" /> Attribute Summary
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">Physical</span>
                      <span className="text-sm font-bold text-blue-500">
                        {calculateAttributeAverages()?.physical || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-200 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateAttributeAverages()?.physical || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">Technical</span>
                      <span className="text-sm font-bold text-blue-500">
                        {calculateAttributeAverages()?.technical || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-200 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateAttributeAverages()?.technical || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">Mental</span>
                      <span className="text-sm font-bold text-blue-500">
                        {calculateAttributeAverages()?.mental || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-200 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateAttributeAverages()?.mental || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  {(playerData.position.toLowerCase().includes('defender') || 
                    playerData.position.toLowerCase().includes('midfielder')) && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">Defensive</span>
                        <span className="text-sm font-bold text-blue-500">
                          {calculateAttributeAverages()?.defensive || 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-200 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${calculateAttributeAverages()?.defensive || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {renderDetailedStatsCharts()}
              <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-8`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-blue-500">Physical Attributes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<IoMdSend className="text-blue-500" />, 'Acceleration', playerData.acceleration)}
                    {renderStatCard(<FaBolt className="text-blue-500" />, 'Sprint Speed', playerData.sprint_speed)}
                    {renderStatCard(<FaRunning className="text-green-500" />, 'Agility', playerData.agility)}
                    {renderStatCard(<FaStopwatch className="text-yellow-500" />, 'Reactions', playerData.reactions)}
                    {renderStatCard(<FaDumbbell className="text-purple-500" />, 'Strength', playerData.strength)}
                    {renderStatCard(<GiStrong className="text-green-500" />, 'Stamina', playerData.stamina)}
                    {renderStatCard(<FaBullseye className="text-blue-500" />, 'Jumping', playerData.jumping)}
                    {renderStatCard(<RiSwordFill className="text-red-500" />, 'Aggression', playerData.aggression)}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-green-500">Technical Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<GiSoccerBall className="text-blue-500" />, 'Ball Control', playerData.ball_control)}
                    {renderStatCard(<FaFutbol className="text-green-500" />, 'Dribbling', playerData.dribbling)}
                    {renderStatCard(<GiSoccerKick className="text-yellow-500" />, 'Finishing', playerData.finishing)}
                    {renderStatCard(<GiSoccerField className="text-amber-500" />, 'Long Shots', playerData.long_shots)}
                    {renderStatCard(<FaCross className="text-purple-500" />, 'Crossing', playerData.crossing)}
                    {renderStatCard(<FaShoePrints className="text-purple-500" />, 'Short Passing', playerData.short_passing)}
                    {renderStatCard(<FaTachometerAlt className="text-indigo-500" />, 'Long Passing', playerData.long_passing)}
                    {renderStatCard(<FaFistRaised className="text-red-500" />, 'Shot Power', playerData.shot_power)}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-purple-500">Mental & Defensive</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<FaEye className="text-green-500" />, 'Positioning', playerData.positioning)}
                    {renderStatCard(<FaBrain className="text-purple-500" />, 'Vision', playerData.vision)}
                    {renderStatCard(<FaShieldAlt className="text-blue-500" />, 'Composure', playerData.composure)}
                    {renderStatCard(<FaBullseye className="text-yellow-500" />, 'Penalties', playerData.penalties)}
                    {renderStatCard(<FaShieldAlt className="text-blue-500" />, 'Interceptions', playerData.interceptions)}
                    {renderStatCard(<FaShieldAlt className="text-green-500" />, 'Marking', playerData.marking)}
                    {renderStatCard(<FaShieldAlt className="text-purple-500" />, 'Stand Tackle', playerData.standing_tackle)}
                    {renderStatCard(<FaShieldAlt className="text-red-500" />, 'Slide Tackle', playerData.sliding_tackle)}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-yellow-500">Other Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<FaShoePrints className="text-green-500" />, 'Weak Foot', playerData.weak_foot)}
                    {renderStatCard(<FaFutbol className="text-blue-500" />, 'Skill Moves', playerData.skill_moves)}
                    {renderStatCard(<GiSoccerKick className="text-yellow-500" />, 'Free Kick Accuracy', playerData.freekick_accuracy)}
                    {renderStatCard(<FaCross className="text-purple-500" />, 'Curve', playerData.curve)}
                    {renderStatCard(<FaBullseye className="text-blue-500" />, 'Heading Accuracy', playerData.heading_accuracy)}
                    {renderStatCard(<GiSoccerBall className="text-green-500" />, 'Volleys', playerData.volleys)}
                    {renderStatCard(<FaFire className="text-red-500" />, 'Work Rate', playerData.work_rate_encoded)}
                    {renderStatCard(<FaClock className="text-indigo-500" />, 'Balance', playerData.balance)}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-10"
            >
              {renderPerformanceChart()}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-4 text-blue-500 flex items-center gap-2">
                  <GiSoccerBall /> Recent performance
                </h3>
                <div className="space-y-4">
                  {performanceHistory.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-gray-50 border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shadow">
                          <GiSoccerBall className="text-blue-500" size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">overall {idx + 1}</p>
                          <p className="text-xs text-gray-700">
                            {item.recorded_at
                              ? new Date(item.recorded_at).toLocaleDateString(undefined, { year: '2-digit', month: 'short', day: '2-digit' })
                              : "Current"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-blue-500">{item.overall_performance}</span>
                        <div className={`w-4 h-4 rounded-full ${
                          item.overall_performance >= 80 ? 'bg-green-400' :
                          item.overall_performance >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                    </motion.div>
                  ))}
                  {performanceHistory.length === 0 && (
                    <div className="text-center text-gray-500">No match data available.</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popup Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-500">Update Player Data</h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-700 text-2xl hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
                <PlayerProfileForm 
                  playerId={playerId} 
                  onSuccess={handleFormSubmitSuccess} 
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}