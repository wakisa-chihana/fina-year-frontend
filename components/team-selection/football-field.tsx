'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { baseUrl } from '@/constants/baseUrl';
import { FaTimes, FaFutbol, FaBolt, FaShoePrints, FaRulerVertical, FaWeight, FaBirthdayCake } from "react-icons/fa";
import { Radar, Bar, PolarArea } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
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

type FormationKey = '4-3-3' | '4-4-2' | '3-5-2' | '3-4-3';

interface Player {
  player_id: number;
  name: string;
  position: string;
  overall_performance: number;
  [key: string]: any;
}

interface Goalkeeper extends Player {}

interface PlayerPosition {
  x: number;
  y: number;
  label?: string;
  player?: Player | null;
}

interface Formation {
  defenders: PlayerPosition[];
  midfielders: PlayerPosition[];
  forwards: PlayerPosition[];
  goalkeeper: PlayerPosition;
  description: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: ('Possession Play' | 'Counter Attacks' | 'Wing Play' | 'High Press' | 'Defensive Solidity')[];
}

interface ApiResponse {
  success: boolean;
  coach_id: number;
  formation_requested: string;
  available_counts: {
    Defenders: number;
    Midfielders: number;
    Forwards: number;
  };
  selected_players: {
    Defenders: Player[];
    Midfielders: Player[];
    Forwards: Player[];
  };
}

interface GoalkeeperResponse {
  success: boolean;
  coach_id: number;
  top_goalkeepers: Goalkeeper[];
}

function getPreferredFoot(val: number | undefined) {
  if (val === undefined) return "Unknown";
  return val === 1 ? "Right" : "Left";
}

const FootballFormationVisualizer = () => {
  const [formation, setFormation] = useState<FormationKey>('4-3-3');
  const [isAnimating, setIsAnimating] = useState(false);
  const [players, setPlayers] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Goalkeeper modal state
  const [goalkeepers, setGoalkeepers] = useState<Goalkeeper[]>([]);
  const [showGoalkeeperModal, setShowGoalkeeperModal] = useState(false);
  const [goalkeeperLoading, setGoalkeeperLoading] = useState(false);
  const [selectedGoalkeeper, setSelectedGoalkeeper] = useState<Goalkeeper | null>(null);

  useEffect(() => {
    const xUserId = document.cookie.split('; ').find(row => row.startsWith('x-user-id='))?.split('=')[1];
    setUserId(xUserId || null);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPlayers(formation);
      fetchGoalkeepers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formation, userId]);

  const fetchPlayers = async (formation: FormationKey) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(
        `${baseUrl}/formation_players/${userId}?formation=${formation}`
      );
      setPlayers(response.data);
    } catch (err) {
      setError('Failed to fetch players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalkeepers = async () => {
    setGoalkeeperLoading(true);
    try {
      const response = await axios.get<GoalkeeperResponse>(
        `${baseUrl}/top_goalkeepers/${userId}`
      );
      setGoalkeepers(response.data.top_goalkeepers);
      if (response.data.top_goalkeepers.length > 0) {
        setSelectedGoalkeeper(response.data.top_goalkeepers[0]);
      }
    } catch (err) {
      setError('Failed to fetch goalkeepers. Please try again.');
    } finally {
      setGoalkeeperLoading(false);
    }
  };

  const selectGoalkeeper = (gk: Goalkeeper) => {
    setSelectedGoalkeeper(gk);
    setShowGoalkeeperModal(false);
  };

  const calculateGoalkeeperRating = (gk: Goalkeeper) => {
    const weights = {
      reactions: 0.2,
      positioning: 0.15,
      jumping: 0.1,
      strength: 0.1,
      composure: 0.1,
      agility: 0.1,
      speed: (gk.acceleration + gk.sprint_speed) / 2 * 0.05,
      handling: (gk.ball_control + gk.strength) / 2 * 0.1,
      distribution: (gk.short_passing + gk.long_passing) / 2 * 0.1
    };
    return (
      (gk.reactions * weights.reactions) +
      (gk.positioning * weights.positioning) +
      (gk.jumping * weights.jumping) +
      (gk.strength * weights.strength) +
      (gk.composure * weights.composure) +
      (gk.agility * weights.agility) +
      (weights.speed) +
      (weights.handling) +
      (weights.distribution)
    ).toFixed(1);
  };

  const formations: Record<FormationKey, Formation> = useMemo(() => ({
    '4-3-3': {
      defenders: [
        { x: 15, y: 25, label: 'LB' },
        { x: 15, y: 50, label: 'LCB' },
        { x: 15, y: 75, label: 'RCB' },
        { x: 15, y: 95, label: 'RB' }
      ],
      midfielders: [
        { x: 35, y: 35, label: 'LCM' },
        { x: 35, y: 60, label: 'CM' },
        { x: 35, y: 85, label: 'RCM' }
      ],
      forwards: [
        { x: 60, y: 25, label: 'LW' },
        { x: 60, y: 60, label: 'ST' },
        { x: 60, y: 95, label: 'RW' }
      ],
      goalkeeper: { x: 3, y: 60, label: 'GK' },
      description: 'A balanced formation that provides strong wing play and midfield control',
      strengths: ['Width in attack', 'Midfield stability', 'Flexibility in transition'],
      weaknesses: ['Can be vulnerable to counterattacks', 'Requires disciplined full-backs'],
      bestFor: ['Possession Play', 'Wing Play', 'High Press']
    },
    '4-4-2': {
      defenders: [
        { x: 15, y: 25, label: 'LB' },
        { x: 15, y: 50, label: 'LCB' },
        { x: 15, y: 75, label: 'RCB' },
        { x: 15, y: 95, label: 'RB' }
      ],
      midfielders: [
        { x: 35, y: 15, label: 'LM' },
        { x: 35, y: 40, label: 'LCM' },
        { x: 35, y: 80, label: 'RCM' },
        { x: 35, y: 105, label: 'RM' }
      ],
      forwards: [
        { x: 60, y: 40, label: 'LS' },
        { x: 60, y: 80, label: 'RS' }
      ],
      goalkeeper: { x: 3, y: 60, label: 'GK' },
      description: 'The classic formation featuring two strikers and wide midfielders',
      strengths: ['Solid defensive structure', 'Direct attacking options', 'Simple organization'],
      weaknesses: ['Can be outnumbered in midfield', 'Requires hard-working wingers'],
      bestFor: ['Counter Attacks', 'Defensive Solidity']
    },
    '3-5-2': {
      defenders: [
        { x: 15, y: 35, label: 'LCB' },
        { x: 15, y: 60, label: 'CB' },
        { x: 15, y: 85, label: 'RCB' }
      ],
      midfielders: [
        { x: 30, y: 15, label: 'LWB' },
        { x: 30, y: 40, label: 'LCM' },
        { x: 30, y: 60, label: 'CM' },
        { x: 30, y: 80, label: 'RCM' },
        { x: 30, y: 105, label: 'RWB' }
      ],
      forwards: [
        { x: 55, y: 40, label: 'LS' },
        { x: 55, y: 80, label: 'RS' }
      ],
      goalkeeper: { x: 3, y: 60, label: 'GK' },
      description: 'An offensive setup with wing-backs providing width and attacking options',
      strengths: ['Numerical superiority in midfield', 'Flexible attacking options', 'Strong central presence'],
      weaknesses: ['Vulnerable on the flanks', 'Requires extremely fit wing-backs'],
      bestFor: ['Wing Play', 'High Press']
    },
    '3-4-3': {
      defenders: [
        { x: 15, y: 35, label: 'LCB' },
        { x: 15, y: 60, label: 'CB' },
        { x: 15, y: 85, label: 'RCB' }
      ],
      midfielders: [
        { x: 35, y: 25, label: 'LWB' },
        { x: 35, y: 60, label: 'CM1' },
        { x: 35, y: 95, label: 'RWB' },
        { x: 45, y: 60, label: 'CM2' }
      ],
      forwards: [
        { x: 65, y: 25, label: 'LW' },
        { x: 65, y: 60, label: 'ST' },
        { x: 65, y: 95, label: 'RW' }
      ],
      goalkeeper: { x: 3, y: 60, label: 'GK' },
      description: 'An aggressive formation with wing-backs and three forwards for maximum attacking pressure',
      strengths: ['Strong attacking presence', 'Width in attack', 'Numerous attacking options'],
      weaknesses: ['Defensive vulnerability', 'Requires exceptional fitness from wing-backs'],
      bestFor: ['Wing Play', 'High Press']
    }
  }), []);

  const currentFormation = useMemo(() => {
    if (!players) return formations[formation];

    const formationWithPlayers = JSON.parse(JSON.stringify(formations[formation])) as Formation;

    if (selectedGoalkeeper) {
      formationWithPlayers.goalkeeper.player = selectedGoalkeeper;
    }

    if (players.selected_players.Defenders) {
      players.selected_players.Defenders.forEach((player, index) => {
        if (index < formationWithPlayers.defenders.length) {
          formationWithPlayers.defenders[index].player = player;
        }
      });
    }
    if (players.selected_players.Midfielders) {
      players.selected_players.Midfielders.forEach((player, index) => {
        if (index < formationWithPlayers.midfielders.length) {
          formationWithPlayers.midfielders[index].player = player;
        }
      });
    }
    if (players.selected_players.Forwards) {
      players.selected_players.Forwards.forEach((player, index) => {
        if (index < formationWithPlayers.forwards.length) {
          formationWithPlayers.forwards[index].player = player;
        }
      });
    }
    return formationWithPlayers;
  }, [formation, players, formations, selectedGoalkeeper]);

  const handleFormationChange = (newFormation: FormationKey) => {
    setIsAnimating(true);
    setFormation(newFormation);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const renderPlayerModal = () => {
    if (!showModal || !selectedPlayer) return null;

    // Radar/Bar/Polar data
    const physical = [
      { label: "Acceleration", value: selectedPlayer.acceleration, icon: <FaBolt /> },
      { label: "Sprint Speed", value: selectedPlayer.sprint_speed, icon: <FaBolt /> },
      { label: "Agility", value: selectedPlayer.agility, icon: <FaBolt /> },
      { label: "Stamina", value: selectedPlayer.stamina, icon: <FaBolt /> },
      { label: "Strength", value: selectedPlayer.strength, icon: <FaBolt /> },
    ].filter(a => typeof a.value === "number");

    const technical = [
      { label: "Ball Control", value: selectedPlayer.ball_control, icon: <FaFutbol /> },
      { label: "Dribbling", value: selectedPlayer.dribbling, icon: <FaFutbol /> },
      { label: "Short Passing", value: selectedPlayer.short_passing, icon: <FaFutbol /> },
      { label: "Long Passing", value: selectedPlayer.long_passing, icon: <FaFutbol /> },
      { label: "Finishing", value: selectedPlayer.finishing, icon: <FaFutbol /> },
      { label: "Crossing", value: selectedPlayer.crossing, icon: <FaFutbol /> },
    ].filter(a => typeof a.value === "number");

    const radarData = {
      labels: physical.map(a => a.label),
      datasets: [{
        label: "Physical",
        data: physical.map(a => a.value),
        backgroundColor: "rgba(59,130,246,0.2)",
        borderColor: "rgba(59,130,246,1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59,130,246,1)",
      }],
    };

    const barData = {
      labels: technical.map(a => a.label),
      datasets: [{
        label: "Technical",
        data: technical.map(a => a.value),
        backgroundColor: "rgba(16,185,129,0.6)",
      }],
    };

    const polarData = {
      labels: ["Preferred Foot", "Weak Foot"],
      datasets: [{
        data: [
          selectedPlayer.preferred_foot_encoded ? selectedPlayer.preferred_foot_encoded * 50 : 0, 
          selectedPlayer.weak_foot ? selectedPlayer.weak_foot * 20 : 0
        ],
        backgroundColor: [
          "rgba(99,102,241,0.6)",
          "rgba(239,68,68,0.6)"
        ],
      }],
    };

    return (
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-100"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-800">{selectedPlayer.name}</h2>
                  <p className="text-lg text-blue-400 font-bold tracking-wider">{selectedPlayer.position}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-blue-700">
                  <FaTimes className="w-8 h-8" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-semibold mb-3 flex items-center text-blue-700">
                    <FaBolt className="mr-2" /> Physical Attributes
                  </h3>
                  <div className="h-64">
                    <Radar data={radarData} options={{
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
                    }}/>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h3 className="text-xl font-semibold mb-3 flex items-center text-green-700">
                    <FaFutbol className="mr-2" /> Technical Skills
                  </h3>
                  <div className="h-64">
                    <Bar data={barData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true, max: 100 } }
                    }}/>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-purple-700">
                    <FaShoePrints className="mr-2" /> Foot Attributes
                  </h3>
                  <div className="h-48">
                    <PolarArea data={polarData} options={{
                      responsive: true,
                      maintainAspectRatio: false
                    }}/>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-purple-100 p-2 rounded text-purple-800">
                      Preferred: {getPreferredFoot(selectedPlayer.preferred_foot_encoded)}
                    </div>
                    <div className="bg-red-100 p-2 rounded text-red-800">
                      Weak: {selectedPlayer.weak_foot ? selectedPlayer.weak_foot + "/5" : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">Physical Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <FaRulerVertical />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Height</p>
                        <p className="font-bold text-gray-800">{selectedPlayer.height_cm} cm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full text-green-600">
                        <FaWeight />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Weight</p>
                        <p className="font-bold text-gray-800">{selectedPlayer.weight_kgs} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                        <FaBirthdayCake />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Age</p>
                        <p className="font-bold text-gray-800">{selectedPlayer.age} years</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-700">Skill Ratings</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700">
                        <span>Skill Moves</span>
                        <span>{selectedPlayer.skill_moves}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(selectedPlayer.skill_moves ?? 0) * 20}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700">
                        <span>Weak Foot</span>
                        <span>{selectedPlayer.weak_foot}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(selectedPlayer.weak_foot ?? 0) * 20}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderPlayer = (position: PlayerPosition, role: string, index?: number) => {
    const playerName = position.player 
      ? `${position.player.name} (${position.player.overall_performance.toFixed(1)})` 
      : position.label || 
        (role === 'goalkeeper' ? 'GK' : 
        role === 'defender' ? `D${index! + 1}` : 
        role === 'midfielder' ? `M${index! + 1}` : 
        `F${index! + 1}`);

    return (
      <div 
        key={`${role}-${position.label || index}`}
        className={`
          absolute w-10 h-10 rounded-full flex items-center justify-center 
          text-white text-xs font-bold transform -translate-x-1/2 -translate-y-1/2
          cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10
          ${
            role === 'goalkeeper' ? 'bg-gradient-to-br from-gray-800 to-green-700 border-2 border-white' : 
            role === 'defender' ? 'bg-gradient-to-br from-blue-600 to-blue-300 border-2 border-white' : 
            role === 'midfielder' ? 'bg-gradient-to-br from-green-600 to-green-300 border-2 border-white' : 
            'bg-gradient-to-br from-red-600 to-red-300 border-2 border-white'
          }
          ${isAnimating ? 'animate-pulse' : ''}
          ${!position.player ? 'opacity-80' : ''}
        `}
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}
        title={`${playerName}\n${position.player?.position || role}`}
        onClick={() => 
          role === 'goalkeeper' 
            ? setShowGoalkeeperModal(true) 
            : position.player && handlePlayerClick(position.player)
        }
      >
        {position.player 
          ? position.player.name.split(' ').map(n => n[0]).join('')
          : position.label || (role === 'goalkeeper' ? 'GK' : 
            role === 'defender' ? `D${index! + 1}` : 
            role === 'midfielder' ? `M${index! + 1}` : 
            `F${index! + 1}`)}
      </div>
    );
  };

  const renderSelectedPlayersPanel = () => {
    if (!players) return null;
    const allPlayers: Player[] = [
      ...(selectedGoalkeeper ? [selectedGoalkeeper] : []),
      ...(players.selected_players.Defenders || []),
      ...(players.selected_players.Midfielders || []),
      ...(players.selected_players.Forwards || []),
    ];

    return (
      <div className="w-full max-w-7xl mb-12">
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-8 rounded-2xl shadow-xl border border-blue-200">
          <h2 className="text-2xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 drop-shadow">
            <span className="inline-flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4" /></svg>
              All Selected Players
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {allPlayers.map((player) => (
              <div
                key={player.player_id}
                className="relative group bg-white hover:bg-blue-100 border-2 border-transparent hover:border-blue-500 rounded-xl p-4 shadow-md cursor-pointer flex flex-col items-center transition-all duration-200"
                onClick={() => handlePlayerClick(player)}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 via-blue-400 to-blue-500 flex items-center justify-center text-3xl font-extrabold text-white mb-3 shadow-xl border-4 border-white ring-2 ring-blue-300 group-hover:ring-blue-500`}>
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-800 text-lg">{player.name}</div>
                  <div className="text-xs text-blue-400 font-semibold mb-1 tracking-wide">{player.position}</div>
                  <div className="mt-1 text-sm">
                    <span className="inline-block px-2 py-0.5 rounded bg-gradient-to-r from-blue-400 to-blue-700 text-white font-bold shadow ring-1 ring-blue-100">
                      {player.overall_performance?.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-700 text-white text-xs font-medium shadow">View</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-blue-500 text-xs">Click on a player to explore their full profile and stats.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center p-4  min-h-screen">
      

      <div className="w-full max-w-7xl mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="formation" className="block text-sm font-semibold text-gray-700 mb-2">
                Select Formation:
              </label>
              <select
                id="formation"
                value={formation}
                onChange={(e) => handleFormationChange(e.target.value as FormationKey)}
                className="w-full px-4 py-2 text-slate-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                disabled={loading}
              >
                {(Object.keys(formations) as FormationKey[]).map((key) => (
                  <option key={key} value={key}>
                    {key} Formation
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-3 rounded-lg border border-blue-200 shadow">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-blue-700">Current:</span>
                <span className="px-3 py-1 bg-blue-800 text-white text-sm font-bold rounded-full">
                  {formation}
                </span>
                <span className="text-xs text-blue-400">
                  ({currentFormation.defenders.length}-{currentFormation.midfielders.length}-{currentFormation.forwards.length})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="w-full max-w-7xl mb-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="w-full max-w-7xl mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {players && (
        <>
          <div className="relative w-full max-w-7xl h-[35rem] bg-gradient-to-b from-[#4fbb6b] to-[#257341] border-4 border-white rounded-[2.5rem] shadow-2xl overflow-hidden mb-8"
            style={{
              boxShadow: '0 6px 36px 0 rgba(0,0,0,0.18)'
            }}
          >
            {/* FOOTBALL FIELD LINES (ENHANCED) */}
            <div className="absolute inset-0 z-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"></div>
            <div className="absolute inset-0 border-2 border-white rounded-2xl m-2"></div>
            {/* Center line */}
            <div className="absolute left-1/2 top-0 w-1 h-full bg-white opacity-90 z-10 transform -translate-x-1/2"></div>
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Penalty boxes and goals */}
            {/* Left penalty box */}
            <div className="absolute left-0 top-1/2 w-28 h-48 border-2 border-white rounded-tr-2xl rounded-br-2xl transform -translate-y-1/2"></div>
            {/* Right penalty box */}
            <div className="absolute right-0 top-1/2 w-28 h-48 border-2 border-white rounded-tl-2xl rounded-bl-2xl transform -translate-y-1/2"></div>
            {/* Left goal box */}
            <div className="absolute left-0 top-1/2 w-12 h-24 border-2 border-white rounded-tr-lg rounded-br-lg transform -translate-y-1/2"></div>
            {/* Right goal box */}
            <div className="absolute right-0 top-1/2 w-12 h-24 border-2 border-white rounded-tl-lg rounded-bl-lg transform -translate-y-1/2"></div>
            {/* Top arcs */}
            <div className="absolute left-0 top-[22%] w-10 h-10 border-l-2 border-t-2 border-white rounded-tl-full"></div>
            <div className="absolute right-0 top-[22%] w-10 h-10 border-r-2 border-t-2 border-white rounded-tr-full"></div>
            {/* Bottom arcs */}
            <div className="absolute left-0 bottom-[22%] w-10 h-10 border-l-2 border-b-2 border-white rounded-bl-full"></div>
            <div className="absolute right-0 bottom-[22%] w-10 h-10 border-r-2 border-b-2 border-white rounded-br-full"></div>
            {/* Goals (squared at each end) */}
            <div className="absolute left-[-10px] top-1/2 w-2 h-16 bg-white rounded transform -translate-y-1/2"></div>
            <div className="absolute right-[-10px] top-1/2 w-2 h-16 bg-white rounded transform -translate-y-1/2"></div>

            {/* PLAYERS */}
            {renderPlayer(currentFormation.goalkeeper, 'goalkeeper')}
            {currentFormation.defenders.map((pos, index) => 
              renderPlayer(pos, 'defender', index)
            )}
            {currentFormation.midfielders.map((pos, index) => 
              renderPlayer(pos, 'midfielder', index)
            )}
            {currentFormation.forwards.map((pos, index) => 
              renderPlayer(pos, 'forward', index)
            )}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-1 rounded-full text-lg font-extrabold shadow-xl tracking-wider pointer-events-none">
              {formation} Formation
            </div>
          </div>

          <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border-2 border-blue-100">
            <div className="p-6 border-b border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-700">
                    {formation} Formation Analysis
                  </h2>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-lg">
                      {currentFormation.defenders.length}-{currentFormation.midfielders.length}-{currentFormation.forwards.length}
                    </span>
                  </div>
                </div>
                <div className="mt-2 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Best Suited For:</h3>
                  <div className="flex flex-wrap gap-1">
                    {currentFormation.bestFor.map((tactic) => {
                      let bgColor = 'bg-blue-100';
                      let textColor = 'text-blue-800';
                      if (tactic === 'Counter Attacks') {
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                      } else if (tactic === 'Wing Play') {
                        bgColor = 'bg-purple-100';
                        textColor = 'text-purple-800';
                      } else if (tactic === 'High Press') {
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                      } else if (tactic === 'Defensive Solidity') {
                        bgColor = 'bg-gray-100';
                        textColor = 'text-gray-800';
                      }
                      return (
                        <span key={tactic} className={`px-2 py-0.5 ${bgColor} ${textColor} rounded-full text-xs`}>
                          {tactic}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="text-gray-800 text-base leading-relaxed mb-4 font-medium">
                {currentFormation.description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Strengths</h3>
                <ul className="space-y-2">
                  {currentFormation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center mr-2 mt-0.5 text-xs">
                        ✓
                      </span>
                      <span className="text-gray-800 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">Weaknesses</h3>
                <ul className="space-y-2">
                  {currentFormation.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center mr-2 mt-0.5 text-xs">
                        ✗
                      </span>
                      <span className="text-gray-800 text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-blue-50">
              <FormationSection 
                title="Defenders" 
                count={players.available_counts.Defenders} 
                color="blue" 
                players={currentFormation.defenders}
              />
              <FormationSection 
                title="Midfielders" 
                count={players.available_counts.Midfielders} 
                color="green" 
                players={currentFormation.midfielders}
              />
              <FormationSection 
                title="Forwards" 
                count={players.available_counts.Forwards} 
                color="red" 
                players={currentFormation.forwards}
              />
            </div>
          </div>
          {/* Selected Players Section */}
          {renderSelectedPlayersPanel()}
        </>
      )}

      {/* Goalkeeper swap modal */}
      {showGoalkeeperModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-100">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Select Goalkeeper</h2>
                <button 
                  onClick={() => setShowGoalkeeperModal(false)}
                  className="text-gray-500 hover:text-blue-700"
                >
                  <FaTimes className="w-8 h-8" />
                </button>
              </div>
              {goalkeeperLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {goalkeepers.map((gk) => (
                    <div 
                      key={gk.player_id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedGoalkeeper?.player_id === gk.player_id 
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => selectGoalkeeper(gk)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{gk.name}</h3>
                          <p className="text-sm text-gray-600">
                            Age: {gk.age} | Height: {gk.height_cm}cm | Rating: {calculateGoalkeeperRating(gk)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gray-800 text-white text-sm font-medium rounded-full">
                            GK
                          </span>
                          <span className="text-lg font-bold text-gray-700">
                            {gk.overall_performance.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Reactions:</span> {gk.reactions}
                        </div>
                        <div>
                          <span className="text-gray-600">Positioning:</span> {gk.positioning}
                        </div>
                        <div>
                          <span className="text-gray-600">Jumping:</span> {gk.jumping}
                        </div>
                        <div>
                          <span className="text-gray-600">Composure:</span> {gk.composure}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Player Modal */}
      {renderPlayerModal()}
    </div>
  );
};

const FormationSection = ({ 
  title, 
  count, 
  color, 
  players 
}: {
  title: string;
  count: number;
  color: 'blue' | 'green' | 'red';
  players: PlayerPosition[];
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-800',
      bullet: 'bg-blue-600'
    },
    green: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-800',
      bullet: 'bg-green-600'
    },
    red: {
      bg: 'from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-800',
      bullet: 'bg-red-600'
    }
  };
  
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color].bg} p-4 rounded-lg border ${colorClasses[color].border} shadow-sm h-full`}>
      <h3 className={`font-bold ${colorClasses[color].text} text-base mb-2 flex items-center`}>
        <span className={`w-3 h-3 ${colorClasses[color].bullet} rounded-full mr-2`}></span>
        {title} ({count} available)
      </h3>
      <ul className="space-y-1">
        {players.map((player, i) => (
          <li key={i} className={`flex items-center ${colorClasses[color].text} text-sm`}>
            <span className={`w-6 h-6 flex items-center justify-center ${colorClasses[color].bullet} text-white rounded-full mr-2 font-medium text-xs`}>
              {player.label?.charAt(player.label.length-1) || i+1}
            </span>
            {player.player 
              ? `${player.player.name} (${player.player.overall_performance.toFixed(1)})`
              : player.label || `${title.slice(0, -1)} ${i+1}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FootballFormationVisualizer;