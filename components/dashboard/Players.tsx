'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../constants/baseUrl";
import Cookie from "js-cookie";

interface PlayerStats {
  success: boolean;
  coach_id: number;
  stats: {
    "Total Players": number;
    "Goalkeepers": number;
    "Defenders": number;
    "Midfielders": number;
    "Forwards": number;
  };
}

interface PlayersProps {
  coachId?: string;
  initialData?: PlayerStats;
}

const CACHE_DURATION = 300000; // 5 minutes in milliseconds

const Players: React.FC<PlayersProps> = ({ coachId: propCoachId, initialData }) => {
  const [stats, setStats] = useState<PlayerStats | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      const coachId = propCoachId || Cookie.get("x-user-id");
      if (!coachId) {
        setError("Coach ID not found");
        setLoading(false);
        return;
      }

      const cacheKey = `playerStats-${coachId}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      // Use cached data if it exists and isn't expired
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setStats(data);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        const response = await axios.get<PlayerStats>(
          `${baseUrl}/team_players_stats/coach/${coachId}/stats`
        );
        
        if (!response.data.success) {
          throw new Error("Failed to fetch player statistics");
        }
        
        // Update cache with fresh data
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
        
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        
        // Fall back to cached data if available (even if stale)
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setStats(data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchPlayerStats();
    }
  }, [propCoachId, initialData]);

  if (loading) return (
    <div className="w-full md:w-1/4 grid bg-white gap-4 grid-cols-2 min-h-[25vh] p-2">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="h-full rounded-xl bg-gray-200 animate-pulse p-4 transition-opacity duration-300 ease-in-out"
          style={{ gridColumn: i === 0 ? 'span 2' : '' }}
        >
          <div className="h-6 w-3/4 bg-gray-300 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded mx-auto animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="w-full md:w-1/4 p-4 bg-red-50 border border-red-100 rounded-lg animate-fade-in">
      <p className="text-red-500 text-center">{error}</p>
    </div>
  );

  if (!stats) return (
    <div className="w-full md:w-1/4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
      <p className="text-gray-500 text-center">No statistics available</p>
    </div>
  );

  const statItems = [
    { title: "Players", value: stats.stats["Total Players"], color: "bg-blue-50 text-blue-600" },
    { title: "Goalkeepers", value: stats.stats["Goalkeepers"], color: "bg-green-50 text-green-600" },
    { title: "Defenders", value: stats.stats["Defenders"], color: "bg-purple-50 text-purple-600" },
    { title: "Midfielders", value: stats.stats["Midfielders"], color: "bg-yellow-50 text-yellow-600" },
    { title: "Forwards", value: stats.stats["Forwards"], color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="w-full md:w-1/4 grid gap-4 grid-cols-2 min-h-[25vh] max-h-[35vh] p-2">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className={`
            w-full rounded-xl bg-white p-3 shadow border border-opacity-10 
            cursor-pointer ${stat.color}
            transition-all duration-700 ease-out
            hover:scale-105 hover:shadow-dark_blue
            transform-gpu will-change-transform
            animate-enter-stat shadow-lg shadow-blue-200
            ${index === 0 ? 'col-span-2' : ''}
          `}
          style={{ 
            animationDelay: `${index * 50}ms`,
            transitionProperty: 'transform, box-shadow ' 
          }}
        >
          <p className="text-center font-bold text-2xl mb-1 transition-colors duration-200">
            {stat.value}
          </p>
          <p className="text-center text-xs font-medium uppercase tracking-wider opacity-80 transition-colors duration-200">
            {stat.title}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Players;