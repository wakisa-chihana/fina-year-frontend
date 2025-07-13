"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { baseUrl } from '@/constants/baseUrl';
import axios from 'axios';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface TeamData {
  id: number;
  name: string;
}

interface PreloadedData {
  userData: UserData | null;
  teamData: TeamData[] | null;
  playersData: any[] | null;
}

interface DataPreloadContextType {
  preloadedData: PreloadedData;
  isPreloading: boolean;
  preloadDashboardData: (userId: number) => Promise<void>;
  clearPreloadedData: () => void;
  getPreloadedUserData: () => UserData | null;
}

const DataPreloadContext = createContext<DataPreloadContextType | undefined>(undefined);

export const useDataPreload = () => {
  const context = useContext(DataPreloadContext);
  if (!context) {
    throw new Error('useDataPreload must be used within a DataPreloadProvider');
  }
  return context;
};

export const DataPreloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preloadedData, setPreloadedData] = useState<PreloadedData>({
    userData: null,
    teamData: null,
    playersData: null,
  });
  const [isPreloading, setIsPreloading] = useState(false);

  const preloadDashboardData = useCallback(async (userId: number) => {
    setIsPreloading(true);
    try {
      // Fetch user data
      const userResponse = await axios.get(`${baseUrl}/users/${userId}`);
      const userData = userResponse.data;

      // Fetch team data
      const teamResponse = await axios.get(
        `${baseUrl}/team_management/get_coach_teams?coach_id=${userId}`
      );
      const teamData = teamResponse.data.teams || [];

      // If there are teams, fetch initial players data
      let playersData = null;
      if (teamData.length > 0) {
        try {
          const playersResponse = await axios.get(
            `${baseUrl}/team_players/team/${teamData[0].id}/coach/${userId}?limit=10&offset=0`
          );
          playersData = playersResponse.data.players || [];
        } catch (error) {
          console.warn('Failed to preload players data:', error);
        }
      }

      setPreloadedData({
        userData,
        teamData,
        playersData,
      });
    } catch (error) {
      console.error('Failed to preload dashboard data:', error);
      // Set default user data if fetch fails
      setPreloadedData({
        userData: { id: userId, name: "Guest User", email: "", role: "Guest" },
        teamData: [],
        playersData: [],
      });
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const clearPreloadedData = useCallback(() => {
    setPreloadedData({
      userData: null,
      teamData: null,
      playersData: null,
    });
  }, []);

  const getPreloadedUserData = useCallback(() => {
    return preloadedData.userData;
  }, [preloadedData.userData]);

  return (
    <DataPreloadContext.Provider
      value={{
        preloadedData,
        isPreloading,
        preloadDashboardData,
        clearPreloadedData,
        getPreloadedUserData,
      }}
    >
      {children}
    </DataPreloadContext.Provider>
  );
};
