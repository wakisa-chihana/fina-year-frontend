"use client";
import React, { useState, useEffect } from "react";
import { GiSoccerBall, GiSoccerField, GiSoccerKick } from "react-icons/gi";
import { FaPlus, FaFutbol, FaRunning, FaSearch } from "react-icons/fa";
import { FaCirclePlus, FaFilter } from "react-icons/fa6";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseUrl } from "@/constants/baseUrl";

import PlayerCard from "@/components/player-profile-comp/PlayerCard";
import PlayerModal from "@/components/player-profile-comp/PlayerModal";
import InvitePlayerModal from "@/components/player-profile-comp/InvitePlayerModal";
import LoadingAnimation from "@/components/LoadingAnimation";

interface Player {
  player_id: number;
  player_name: string;
  player_email: string;
  position: string;
  age?: number | null;
  height_cm?: number | null;
  weight_kgs?: number | null;
  status?: "pending" | "accepted" | "rejected";
  overall_performance?: number | null;
  last_5_performances?: number[];
  joined_date?: string;
}

interface Team {
  id: number;
  name: string;
}

interface ApiResponse {
  success: boolean;
  team_id: number;
  coach_id: number;
  players: Player[];
}

const PlayerProfile = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    player_name: "",
    player_email: "",
    position: "",
  });
  const [formErrors, setFormErrors] = useState({
    player_name: "",
    player_email: "",
    position: "",
    general: "",
  });
  const [loading, setLoading] = useState({
    fetch: true,
    submit: false,
    teamFetch: true,
  });
  const [coachId, setCoachId] = useState<number>(0);
  const [teamId, setTeamId] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchPlayers = async (tId: number, cId: number) => {
    try {
      const playersResponse = await axios.get<ApiResponse>(
        `${baseUrl}/team_players/team/${tId}/coach/${cId}`
      );

      if (playersResponse.data.success) {
        const playersWithStatus = playersResponse.data.players.map(
          (player) => ({
            ...player,
            status: "accepted" as const,
            overall_performance: player.overall_performance || 0,
            last_5_performances: player.last_5_performances || [
              70, 75, 80, 82, 85,
            ],
            joined_date:
              player.joined_date || new Date().toISOString().split("T")[0],
          })
        );
        setPlayers(playersWithStatus);
        setFilteredPlayers(playersWithStatus);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to load players");
      } else {
        toast.error("An unexpected error occurred while fetching players");
      }
    }
  };

  const fetchData = async () => {
    try {
      const cId = Number(Cookies.get("x-user-id"));
      if (!cId) {
        toast.error("Coach ID not found in cookies");
        return;
      }
      setCoachId(cId);

      const teamResponse = await axios.get<{
        success: boolean;
        teams: Team[];
      }>(`${baseUrl}/team_management/get_coach_teams?coach_id=${cId}`);

      if (!teamResponse.data.success || !teamResponse.data.teams.length) {
        throw new Error("No teams found for this coach");
      }

      const tId = teamResponse.data.teams[0].id;
      setTeamId(tId);

      await fetchPlayers(tId, cId);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error("API endpoint not found - please check backend routes");
        } else {
          toast.error(error.response?.data?.message || "Failed to load data");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false, teamFetch: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = players.filter((player) => {
      const matchesSearch =
        player.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.player_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition =
        filterPosition === "all" ||
        player.position.toLowerCase() === filterPosition.toLowerCase();
      return matchesSearch && matchesPosition;
    });
    setFilteredPlayers(filtered);
  }, [searchTerm, filterPosition, players]);

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));
    setFormErrors({
      player_name: "",
      player_email: "",
      position: "",
      general: "",
    });

    try {
      const response = await axios.post(
        `${baseUrl}/player_management/invite-player`,
        {
          coach_id: coachId,
          player_name: formData.player_name,
          player_email: formData.player_email,
          team_id: teamId,
          position: formData.position,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Player invited successfully!");
        // Instead of adding locally, refresh the entire list
        await fetchPlayers(teamId, coachId);
        setFormData({ player_name: "", player_email: "", position: "" });
        setShowModal(false);
      }
    } catch (error) {
      console.error("Invite error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setFormErrors((prev) => ({
            ...prev,
            general: "API endpoint not found - please check the URL",
          }));
        } else if (error.response?.data?.errors) {
          setFormErrors((prev) => ({
            ...prev,
            ...error.response?.data?.errors,
          }));
        } else if (error.response?.data?.detail) {
          setFormErrors((prev) => ({
            ...prev,
            general:
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "An unexpected error occurred",
          }));
        } else {
          setFormErrors((prev) => ({
            ...prev,
            general: "Failed to invite player",
          }));
        }
      } else {
        setFormErrors((prev) => ({
          ...prev,
          general: "An unexpected error occurred",
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const positions = [
    "Forward",
    "Midfielder",
    "Defender",
    "Goalkeeper",
    
  ];

  if (loading.fetch) {
    return (
        <LoadingAnimation />
    );
  }

  return (
    <div className="w-full flex flex-col bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-4">
            <GiSoccerField className="text-4xl text-[#28809A]" />
            <h1 className="text-xl md:text-xl font-extrabold text-gray-700 tracking-tight">
              Players
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search players..."
                className="pl-10 pr-4 py-2 text-gray-700 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#28809A] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-dark text-white flex items-center gap-2 hover:bg-[#1e6a80] transition-colors"
              onClick={() => setShowModal(true)}
            >
              <FaPlus />
              <span className="hidden md:inline">Add Player</span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">
                  Filter by Position
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterPosition("all")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filterPosition === "all"
                        ? "bg-[#28809A] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Positions
                  </button>
                  {positions.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setFilterPosition(pos)}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        filterPosition === pos
                          ? "bg-[#28809A] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredPlayers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 border-2 border-gray-200 rounded-xl shadow-sm bg-white"
          >
            <GiSoccerKick className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 font-medium mb-2">
              No players found
            </p>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-[#28809A] text-white rounded-lg font-medium hover:bg-[#1e6a80] transition-colors flex items-center gap-2 mx-auto"
              onClick={() => setShowModal(true)}
            >
              <FaCirclePlus />
              <span>Invite New Player</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.player_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <PlayerCard
                    player={{
                      id: player.player_id,
                      name: player.player_name,
                      email: player.player_email,
                      position: player.position,
                      status: player.status || "accepted",
                      overall_performance: player.overall_performance || 0,
                    }}
                    onClick={() => setSelectedPlayer(player)}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <InvitePlayerModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setFormData({ player_name: "", player_email: "", position: "" });
            setFormErrors({
              player_name: "",
              player_email: "",
              position: "",
              general: "",
            });
          }}
          formData={formData}
          formErrors={formErrors}
          loading={loading.submit}
          onSubmit={handleInvitePlayer}
          onInputChange={handleInputChange}
        />

        <AnimatePresence>
          {selectedPlayer && (
            <PlayerModal
              player={{
                id: selectedPlayer.player_id,
                name: selectedPlayer.player_name,
                email: selectedPlayer.player_email,
                position: selectedPlayer.position,
                team_id: teamId,
                status: selectedPlayer.status || "accepted",
                overall_performance: selectedPlayer.overall_performance || 0,
              }}
              onClose={() => setSelectedPlayer(null)}
              onPlayerDeleted={() => fetchPlayers(teamId, coachId)} // Add this prop
            />
          )}
        </AnimatePresence>

        <Tooltip id="stats-tooltip" />
      </div>
    </div>
  );
};

export default PlayerProfile;