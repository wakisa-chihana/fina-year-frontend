"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { 
  MdLocationOn, 
  MdPeople, 
  MdSportsSoccer, 
  MdStadium,
  MdEdit,
  MdMoreVert
} from "react-icons/md";
import Cookies from "js-cookie";
import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";

interface CoachData {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

interface TeamData {
  id: number;
  name: string;
  location: string;
  founded_year?: number;
  player_count?: number;
  stadium_count?: number;
  logo?: string;
  primary_color?: string;
  secondary_color?: string;
}

const TeamDetails = () => {
  const [teamData, setTeamData] = useState<TeamData>({
    id: 0,
    name: "Unknown Team",
    location: "Malawi",
    player_count: 0,
    stadium_count: 0,
    primary_color: "#3b82f6", // blue-500 as default
    secondary_color: "#93c5fd" // blue-300 as default
  });
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCoachBio, setShowCoachBio] = useState<boolean>(false);

  const fetchTeamData = useCallback(async () => {
    const coachId = Cookies.get("x-user-id") ? parseInt(Cookies.get("x-user-id")!) : null;
    if (!coachId) {
      setError("Coach ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [userRes, teamRes] = await Promise.all([
        axios.get<CoachData>(`${baseUrl}/users/${coachId}`),
        axios.get<{success: boolean; teams: TeamData[]}>(`${baseUrl}/team_management/get_coach_teams?coach_id=${coachId}`)
      ]);

      setCoachData({
        ...userRes.data,
        bio: userRes.data.bio || "No bio available"
      });
      
      if (teamRes.data.success && teamRes.data.teams.length > 0) {
        const team = teamRes.data.teams[0];
        setTeamData({
          id: team.id,
          name: team.name || "Unknown Team",
          location: team.location || "Malawi",
          founded_year: team.founded_year,
          player_count: team.player_count || 0,
          stadium_count: team.stadium_count || 0,
          logo: team.logo || "/club_logo.png",
          primary_color: team.primary_color || "#3b82f6",
          secondary_color: team.secondary_color || "#93c5fd"
        });
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load team data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const stats = [
   
    { 
      value: "1", 
      label: "coaches", 
      icon: <MdSportsSoccer size={20} />,
      color: "text-amber-500"
    },
    { 
      value: teamData.stadium_count?.toString() || "0", 
      label: "stadiums", 
      icon: <MdStadium size={20} />,
      color: "text-emerald-500"
    }
  ];

  if (loading) {
    return (
      <div className="w-full md:w-[48%] p-3 bg-white rounded-xl flex flex-col mt-2 justify-between shadow-sm min-h-[200px]">
        <div className="w-full flex justify-between animate-pulse">
          <div className="rounded-3xl w-24 h-24 bg-gray-300"></div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-lg p-2 w-12 h-12"></div>
            ))}
          </div>
        </div>
        
        <div className="w-full mt-4 animate-pulse">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center h-5 w-32 bg-gray-300 rounded"></div>
              <div className="h-12 w-64 bg-gray-300 rounded mt-2"></div>
            </div>
            <div>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="mt-2 space-y-1">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:w-[48%] p-4 bg-white rounded-xl mt-2 flex flex-col justify-between shadow-lg">
        <div className="text-red-500 font-medium text-center py-8">
          {error}
          <button 
            onClick={fetchTeamData}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[48%] p-4 bg-white rounded-xl flex flex-col justify-between shadow-lg transition-all hover:shadow-xl mt-2 relative group">
      {/* Edit button (top-right corner) */}
      <button className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
        <MdMoreVert className="text-gray-600" />
      </button>

      {/* Header Section */}
      <div className="w-full flex justify-between">
        <div className="relative">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 blur-sm"></div>
          <Image
            src={teamData.logo || "/club_logo.png"}
            alt="Team logo"
            width={100}
            height={100}
            className="relative rounded-3xl w-24 h-24 object-cover border-2 border-white shadow-md"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/club_logo.png";
            }}
          />
          {teamData.founded_year && (
            <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
              Est. {teamData.founded_year}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {stats.map((item, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center justify-center bg-white bg-opacity-80 p-2 rounded-lg min-w-[60px] hover:bg-opacity-100 transition-all hover:scale-105 ${item.color}`}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-1 font-bold">{item.value}</span>
              </div>
              <p className="text-xs font-bold text-center mt-1 text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="w-full mt-4">
        <div className="w-full flex justify-between items-end">
          <div>
            <div className="text-sm text-gray-700 flex items-center">
              <MdLocationOn size={18} className="text-primary-500" />
              <span className="ml-1">{teamData.location}</span>
            </div>
            <h1 
              className="text-gray-900 font-bold text-2xl md:text-3xl lg:text-4xl truncate max-w-[500px] md:max-w-[600px]"
              style={{
                background: `linear-gradient(90deg, ${teamData.primary_color}, ${teamData.secondary_color})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
              title={teamData.name}
            >
              {teamData.name}
            </h1>
          </div>
          <div className="text-right relative">
            <div 
              className="w-10 h-10 border-2 rounded-full border-white shadow-md overflow-hidden inline-block cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowCoachBio(!showCoachBio)}
            >
              <Image
                src={coachData?.avatar || "/profile.png"}
                width={40}
                height={40}
                alt="Coach profile"
                className="w-full h-full rounded-full object-cover"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/profile.png";
                }}
              />
            </div>
            <div className="mt-2">
              <p className="uppercase font-bold text-xs text-gray-600">COACH</p>
              <p 
                className="text-sm font-medium truncate max-w-[120px] text-gray-800 hover:text-primary-500 transition-colors cursor-pointer"
                title={coachData?.name}
                onClick={() => setShowCoachBio(!showCoachBio)}
              >
                {coachData?.name || "Unknown"}
              </p>
            </div>
            
            {/* Coach Bio Popup */}
            {showCoachBio && (
              <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{coachData?.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">Head Coach</p>
                  </div>
                  <button 
                    onClick={() => setShowCoachBio(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-700 mt-2">{coachData?.bio}</p>
                <button className="mt-3 w-full flex items-center justify-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors">
                  <MdEdit size={14} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TeamDetails);