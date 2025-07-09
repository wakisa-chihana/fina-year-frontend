'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  FaUserAlt, FaFutbol, FaRunning, FaShieldAlt, FaCross, 
  FaShoePrints, FaTachometerAlt, FaBolt, FaStopwatch, 
  FaDumbbell, FaBullseye, FaEye, FaBrain, FaFistRaised,
  FaPlus, FaFire, FaClock, FaMedal, FaChevronLeft
} from 'react-icons/fa';
import { GiSoccerBall, GiSoccerKick, GiSoccerField, GiStrong } from 'react-icons/gi';
import { IoMdSend } from 'react-icons/io';
import { RiSwordFill } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Bar, Pie } from 'react-chartjs-2';
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

// FIX: Use string keys for workRateMap and convert lookup to string for robustness
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
  const [performanceHistory, setPerformanceHistory] = useState<
    { overall_performance: number; recorded_at: string | null }[]
  >([]);

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
    const iconClass = "text-2xl mr-2";
    if (position.includes('forward')) {
      return <GiSoccerKick className={`${iconClass} text-red-500`} />;
    } else if (position.includes('midfielder')) {
      return <GiSoccerBall className={`${iconClass} text-blue-500`} />;
    } else if (position.includes('defender')) {
      return <FaShieldAlt className={`${iconClass} text-green-500`} />;
    } else if (position.includes('goalkeeper')) {
      return <FaCross className={`${iconClass} text-purple-500`} />;
    }
    return <FaUserAlt className={`${iconClass} text-gray-500`} />;
  };

  const getPreferredFoot = () => {
    if (playerData?.preferred_foot_encoded === null) return 'Unknown';
    return playerData?.preferred_foot_encoded === 1 ? 'Right' : 'Left';
  };

  // FIX: Always convert work_rate_encoded to string for lookup
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
        <div className="h-64 flex items-center justify-center">
          <Pie
            data={{
              labels,
              datasets: [
                {
                  label: chartLabel,
                  data,
                  backgroundColor: colorList,
                  borderColor: "#fff",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: "right" as const,
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
    const colorsPhysical = [
      "#28809A", "#4FD1C5", "#A0AEC0", "#63B3ED", "#F6E05E", "#FC8181", "#B794F4", "#F687B3", "#2C5282"
    ];
    const colorsTechnical = [
      "#38B2AC", "#4299E1", "#BEE3F8", "#805AD5", "#68D391", "#F56565", "#ECC94B", "#D69E2E", "#ED8936", "#718096", "#A0AEC0", "#E53E3E"
    ];
    const colorsMental = [
      "#B794F4", "#F6E05E", "#A0AEC0", "#FC8181", "#28809A"
    ];
    const colorsDefensive = [
      "#2C5282", "#38B2AC", "#BEE3F8", "#F56565"
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
        {renderPieChart(physical, "Physical Attributes", colorsPhysical)}
        {renderPieChart(technical, "Technical Skills", colorsTechnical)}
        {renderPieChart(mental, "Mental Attributes", colorsMental)}
        {renderPieChart(defensive, "Defensive Skills", colorsDefensive)}
      </div>
    );
  };

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
          backgroundColor: 'rgba(40, 128, 154, 0.15)',
          borderColor: 'rgba(40, 128, 154, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(40, 128, 154, 1)',
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
        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
      >
        <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
          <FaMedal className="text-yellow-400" /> Attribute Averages
        </h3>
        <div className="h-72">
          <Radar data={data} options={options} />
        </div>
      </motion.div>
    );
  };

  // Performance chart (Bar)
  const renderPerformanceChart = () => {
    if (!performanceHistory || performanceHistory.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
        >
          <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
            <FaBolt /> Performance Over Time
          </h3>
          <p>No performance data available.</p>
        </motion.div>
      );
    }
    const labels = performanceHistory.map((item, idx) =>
      item.recorded_at
        ? new Date(item.recorded_at).toLocaleDateString(undefined, { year: '2-digit', month: 'short', day: '2-digit' })
        : `Current`
    );
    const dataPoints = performanceHistory.map(item => item.overall_performance);
    const performanceData = {
      labels,
      datasets: [
        {
          label: 'Overall Performance',
          data: dataPoints,
          backgroundColor: 'rgba(40, 128, 154, 0.7)',
          borderColor: 'rgba(40, 128, 154, 1)',
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    };
    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          min: Math.max(Math.min(...dataPoints) - 5, 0),
          max: Math.max(...dataPoints) + 5,
          grid: { color: 'rgba(200, 200, 200, 0.1)' },
          ticks: { stepSize: 10 }
        },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    };
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
      >
        <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
          <FaBolt /> Performance Over Time
        </h3>
        <div className="h-72">
          <Bar data={performanceData} options={options} />
        </div>
      </motion.div>
    );
  };

  const renderStatCard = (icon: JSX.Element, title: string, value: number | null) => {
    if (value === null || value === undefined) return null;
    return (
      <motion.div 
        whileHover={{ scale: 1.04 }}
        className="bg-white p-4 rounded-xl shadow border border-gray-100 flex items-center gap-3 transition-all"
      >
        <div className="text-[#28809A] text-xl">{icon}</div>
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
    <div className="min-h-screen ">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#28809A] to-[#0c2830] p-8 text-white shadow-lg rounded-b-3xl border-b-8   top-0 z-30"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="bg-white/20 hover:bg-white/40 rounded-full p-2 transition"
              onClick={() => window.history.back()}
              title="Back"
            >
              <FaChevronLeft size={20} />
            </button>
            <GiSoccerBall className="text-4xl" />
            <h1 className="text-3xl font-extrabold tracking-widest drop-shadow-lg">Player Profile</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full px-5 py-2 text-base font-bold tracking-wide">
              ID: {playerData.player_id}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-[#0c2830] hover:bg-slate-50 px-6 py-2 rounded-xl font-bold shadow-md transition"
            >
              <FaPlus className="mr-1" />
              Enter New Data
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Player Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-10 border border-gray-100"
        >
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-b from-[#28809A] to-[#1e6a80] p-7 text-white flex flex-col items-center justify-center">
              <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 ">
                <FaUserAlt className="text-7xl" />
              </div>
              <h2 className="text-3xl font-extrabold text-center drop-shadow-lg">{playerData.player_name}</h2>
              <div className="flex items-center mt-4">
                {getPositionIcon()}
                <span className="text-xl font-bold">{playerData.position}</span>
              </div>
              <div className="mt-6 text-center">
                <p className="text-base opacity-80">Overall</p>
                <div className="text-5xl font-extrabold drop-shadow-lg">
                  {playerData.overall_performance || 'N/A'}
                </div>
              </div>
            </div>

            <div className="md:w-2/3 p-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#28809A] mb-4">Personal Info</h3>
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
                  <h3 className="text-xl font-bold text-[#28809A] mb-4">Key Attributes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<FaBolt />, 'Speed', 
                      Math.round(((playerData.acceleration || 0) + (playerData.sprint_speed || 0)) / 2))}
                    {renderStatCard(<GiSoccerBall />, 'Dribbling', playerData.dribbling)}
                    {renderStatCard(<GiSoccerKick />, 'Shooting', 
                      Math.round(((playerData.finishing || 0) + (playerData.long_shots || 0) + (playerData.shot_power || 0)) / 3))}
                    {renderStatCard(<FaShieldAlt />, 'Defense', 
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
                  ? 'text-[#28809A] border-[#28809A] bg-[#e0f2fe]' 
                  : 'text-gray-700 border-transparent hover:text-[#28809A] hover:bg-[#f8fafc]'
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              {renderRadarChart()}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
              >
                <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
                  <FaMedal className="text-yellow-400" /> Attribute Summary
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">Physical</span>
                      <span className="text-sm font-bold text-[#28809A]">
                        {calculateAttributeAverages()?.physical || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#28809A] to-[#A7F3D0] h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateAttributeAverages()?.physical || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">Technical</span>
                      <span className="text-sm font-bold text-[#28809A]">
                        {calculateAttributeAverages()?.technical || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#28809A] to-[#A7F3D0] h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateAttributeAverages()?.technical || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">Mental</span>
                      <span className="text-sm font-bold text-[#28809A]">
                        {calculateAttributeAverages()?.mental || 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#28809A] to-[#A7F3D0] h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateAttributeAverages()?.mental || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  {(playerData.position.toLowerCase().includes('defender') || 
                    playerData.position.toLowerCase().includes('midfielder')) && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">Defensive</span>
                        <span className="text-sm font-bold text-[#28809A]">
                          {calculateAttributeAverages()?.defensive || 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-[#28809A] to-[#A7F3D0] h-3 rounded-full transition-all duration-500" 
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-[#28809A]">Physical Attributes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<IoMdSend />, 'Acceleration', playerData.acceleration)}
                    {renderStatCard(<FaBolt />, 'Sprint Speed', playerData.sprint_speed)}
                    {renderStatCard(<FaRunning />, 'Agility', playerData.agility)}
                    {renderStatCard(<FaStopwatch />, 'Reactions', playerData.reactions)}
                    {renderStatCard(<FaDumbbell />, 'Strength', playerData.strength)}
                    {renderStatCard(<GiStrong />, 'Stamina', playerData.stamina)}
                    {renderStatCard(<FaBullseye />, 'Jumping', playerData.jumping)}
                    {renderStatCard(<RiSwordFill />, 'Aggression', playerData.aggression)}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-[#28809A]">Technical Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<GiSoccerBall />, 'Ball Control', playerData.ball_control)}
                    {renderStatCard(<FaFutbol />, 'Dribbling', playerData.dribbling)}
                    {renderStatCard(<GiSoccerKick />, 'Finishing', playerData.finishing)}
                    {renderStatCard(<GiSoccerField />, 'Long Shots', playerData.long_shots)}
                    {renderStatCard(<FaCross />, 'Crossing', playerData.crossing)}
                    {renderStatCard(<FaShoePrints />, 'Short Passing', playerData.short_passing)}
                    {renderStatCard(<FaTachometerAlt />, 'Long Passing', playerData.long_passing)}
                    {renderStatCard(<FaFistRaised />, 'Shot Power', playerData.shot_power)}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-[#28809A]">Mental & Defensive</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<FaEye />, 'Positioning', playerData.positioning)}
                    {renderStatCard(<FaBrain />, 'Vision', playerData.vision)}
                    {renderStatCard(<FaShieldAlt />, 'Composure', playerData.composure)}
                    {renderStatCard(<FaBullseye />, 'Penalties', playerData.penalties)}
                    {renderStatCard(<FaShieldAlt />, 'Interceptions', playerData.interceptions)}
                    {renderStatCard(<FaShieldAlt />, 'Marking', playerData.marking)}
                    {renderStatCard(<FaShieldAlt />, 'Stand Tackle', playerData.standing_tackle)}
                    {renderStatCard(<FaShieldAlt />, 'Slide Tackle', playerData.sliding_tackle)}
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
                >
                  <h3 className="text-lg font-bold mb-4 text-[#28809A]">Other Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {renderStatCard(<FaShoePrints />, 'Weak Foot', playerData.weak_foot)}
                    {renderStatCard(<FaFutbol />, 'Skill Moves', playerData.skill_moves)}
                    {renderStatCard(<GiSoccerKick />, 'Free Kick Accuracy', playerData.freekick_accuracy)}
                    {renderStatCard(<FaCross />, 'Curve', playerData.curve)}
                    {renderStatCard(<FaBullseye />, 'Heading Accuracy', playerData.heading_accuracy)}
                    {renderStatCard(<GiSoccerBall />, 'Volleys', playerData.volleys)}
                    {renderStatCard(<FaFire />, 'Work Rate', playerData.work_rate_encoded)}
                    {renderStatCard(<FaClock />, 'Balance', playerData.balance)}
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
                <h3 className="text-lg font-bold mb-4 text-[#28809A] flex items-center gap-2">
                  <GiSoccerBall /> Recent performance
                </h3>
                <div className="space-y-4">
                  {performanceHistory.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#e0f2fe] to-[#f8fafc] border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#28809A]/10 flex items-center justify-center shadow">
                          <GiSoccerBall className="text-[#28809A]" size={22} />
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
                        <span className="font-extrabold text-lg text-[#28809A]">{item.overall_performance}</span>
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
                  <h2 className="text-2xl font-bold text-[#28809A]">Update Player Data</h2>
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