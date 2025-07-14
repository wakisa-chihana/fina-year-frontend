"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import notificationService from "@/services/notificationService";

import PlayerCard from "@/components/player-profile-comp/PlayerCard";
import PlayerModal from "@/components/player-profile-comp/PlayerModal";
import InvitePlayerModal from "@/components/player-profile-comp/InvitePlayerModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import PlayerSkeleton from "@/components/player-profile-comp/PlayerSkeleton";

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

const POSITIONS = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const DEFAULT_PLAYER_VALUES = {
  overall_performance: 0,
  last_5_performances: [70, 75, 80, 82, 85],
  joined_date: new Date().toISOString().split("T")[0],
  status: "accepted" as const,
};

function getLimitForScreen() {
  if (typeof window === "undefined") return 10;
  const width = window.innerWidth;
  if (width < 640) return 6;
  if (width < 1024) return 12;
  return 20;
}

const PlayerProfile = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");

  // Form state
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

  // Loading states
  const [loading, setLoading] = useState({
    initial: true,
    fetch: true,
    submit: false,
    teamFetch: true,
    more: false,
  });

  // Data state
  const [coachId, setCoachId] = useState<number>(0);
  const [teamId, setTeamId] = useState<number>(0);

  // Infinite scroll state
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(getLimitForScreen());
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive limit adjustment
  useEffect(() => {
    const handleResize = () => setLimit(getLimitForScreen());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Player fetching with pagination
  const fetchPlayers = useCallback(async (
    tId: number,
    cId: number,
    offsetValue: number,
    limitValue: number,
    replace = false
  ) => {
    if (!replace && offsetValue === 0) {
      setLoading(prev => ({ ...prev, more: true }));
    } else if (!replace) {
      setLoading(prev => ({ ...prev, more: true }));
    }
    
    try {
      const response = await axios.get<ApiResponse>(
        `${baseUrl}/team_players/team/${tId}/coach/${cId}?limit=${limitValue}&offset=${offsetValue}`
      );

      if (response.data.success) {
        const playersWithStatus = response.data.players.map((player) => ({
          ...player,
          ...DEFAULT_PLAYER_VALUES,
          status: player.status || DEFAULT_PLAYER_VALUES.status,
          overall_performance: player.overall_performance || DEFAULT_PLAYER_VALUES.overall_performance,
        }));

        setPlayers(prev =>
          replace ? playersWithStatus : [...prev, ...playersWithStatus]
        );
        setHasMore(playersWithStatus.length === limitValue);
        if (!replace) {
          setOffset(offsetValue + limitValue);
        }
      }
    } catch (error) {
      handleFetchError(error, "players");
    } finally {
      setLoading(prev => ({ ...prev, more: false }));
    }
  }, []); // Remove dependencies to prevent unnecessary re-renders

  // Main data fetching logic
  const fetchData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
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

      setOffset(0);
      setPlayers([]);
      setHasMore(true);
      await fetchPlayers(tId, cId, 0, limit, true);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false, teamFetch: false, initial: false }));
    }
  }, [limit, fetchPlayers]); // Add fetchPlayers dependency

  // Error handling utility
  const handleFetchError = (error: unknown, context = "data") => {
    console.error(`Error fetching ${context}:`, error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        toast.error("API endpoint not found - please check backend routes");
      } else {
        toast.error(error.response?.data?.message || `Failed to load ${context}`);
      }
    } else {
      toast.error(`An unexpected error occurred while fetching ${context}`);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtering logic
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

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading.more || !hasMore || loading.fetch) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollHeight - scrollTop - clientHeight < 120) {
        // Show skeleton immediately on scroll event
        fetchPlayers(teamId, coachId, offset, limit);
      }
    };

    const div = containerRef.current;
    if (div && teamId && coachId) {
      div.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (div) div.removeEventListener("scroll", handleScroll);
    };
  }, [loading.more, hasMore, offset, limit, teamId, coachId, loading.fetch, fetchPlayers]); // Add fetchPlayers dependency

  // Form handling
  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
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
        
        // Send notification to coach about successful invitation
        try {
          await notificationService.sendNotification({
            user_id: coachId,
            message: `You have successfully invited ${formData.player_name} (${formData.player_email}) to join your team as a ${formData.position}.`
          });
        } catch (notifError) {
          console.warn('Failed to send notification:', notifError);
        }
        
        setOffset(0);
        setHasMore(true);
        await fetchPlayers(teamId, coachId, 0, limit, true);
        setFormData({ player_name: "", player_email: "", position: "" });
        setShowModal(false);
      }
    } catch (error) {
      handleFormError(error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleFormError = (error: unknown) => {
    console.error("Invite error:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        setFormErrors(prev => ({
          ...prev,
          general: "API endpoint not found - please check the URL",
        }));
      } else if (error.response?.data?.errors) {
        setFormErrors(prev => ({
          ...prev,
          ...error.response?.data?.errors,
        }));
      } else if (error.response?.data?.detail) {
        setFormErrors(prev => ({
          ...prev,
          general:
            error.response?.data?.detail ||
            error.response?.data?.message ||
            "An unexpected error occurred",
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          general: "Failed to invite player",
        }));
      }
    } else {
      setFormErrors(prev => ({
        ...prev,
        general: "An unexpected error occurred",
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors(prev => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  if (loading.fetch) {
    return <LoadingAnimation />;
  }

  return (
    <div
      className="w-full flex flex-col bg-gray-50 min-h-screen p-3 md:p-8 hide-scrollbar"
      ref={containerRef}
      style={{
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          {/* Title Section */}
          <div className="flex items-center gap-3 mb-4">
            <GiSoccerField className="text-3xl md:text-4xl text-[#28809A]" />
            <h1 className="text-lg md:text-xl font-extrabold text-gray-700 tracking-tight">
              Players
            </h1>
          </div>

          {/* Search and Controls Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search players..."
                className="pl-10 pr-4 py-2 md:py-2.5 text-gray-700 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#28809A] focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 md:p-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="text-sm" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-dark text-white flex items-center gap-1.5 md:gap-2 hover:bg-[#1e6a80] transition-colors text-sm font-medium flex-shrink-0"
                onClick={() => setShowModal(true)}
              >
                <FaPlus className="text-sm" />
                <span className="hidden xs:inline sm:hidden md:inline">Add Player</span>
                <span className="xs:hidden sm:inline md:hidden">Add</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 md:mb-6 overflow-hidden"
            >
              <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2 md:mb-3 text-sm md:text-base">
                  Filter by Position
                </h3>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <button
                    onClick={() => setFilterPosition("all")}
                    className={`px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                      filterPosition === "all"
                        ? "bg-[#28809A] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Positions
                  </button>
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setFilterPosition(pos)}
                      className={`px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium capitalize ${
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

        {/* Players Grid */}
        {loading.initial ? (
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <PlayerSkeleton count={getLimitForScreen()} />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 md:py-16 border-2 border-gray-200 rounded-xl shadow-sm bg-white mx-1 md:mx-0"
          >
            <GiSoccerKick className="mx-auto text-5xl md:text-6xl text-gray-300 mb-3 md:mb-4" />
            <p className="text-lg md:text-xl text-gray-600 font-medium mb-2 px-4">
              No players found
            </p>
            <p className="text-gray-500 mb-4 md:mb-6 px-4 text-sm md:text-base">
              Try adjusting your search or filters
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 md:px-6 py-2 bg-[#28809A] text-white rounded-lg font-medium hover:bg-[#1e6a80] transition-colors flex items-center gap-2 mx-auto text-sm md:text-base"
              onClick={() => setShowModal(true)}
            >
              <FaCirclePlus />
              <span>Invite New Player</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={`${player.player_id}-${index}`}
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
              {/* Loading skeleton appears at the end while new players are loading */}
              {loading.more && <PlayerSkeleton count={Math.min(4, limit)} />}
              {!hasMore && (
                <div className="col-span-full text-center py-3 md:py-4 text-gray-400 text-sm md:text-base">
                  No more players
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Modals */}
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
              onPlayerDeleted={() => {
                setOffset(0);
                setHasMore(true);
                fetchPlayers(teamId, coachId, 0, limit, true);
              }}
            />
          )}
        </AnimatePresence>

        <Tooltip id="stats-tooltip" />
        <Tooltip id="expand-tooltip" />
      </div>
    </div>
  );
};

export default PlayerProfile;