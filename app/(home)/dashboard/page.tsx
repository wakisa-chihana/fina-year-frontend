"use client";

import Players from "@/components/dashboard/Players";
import Ranks from "@/components/dashboard/Ranks";
import TeamDetails from "@/components/dashboard/TeamDetails";
import TeamFormation from "@/components/dashboard/TeamFormation";
import TeamPerformance from "@/components/dashboard/TeamPerformance";
import TopPlayer from "@/components/dashboard/TopPlayer";
import LoadingAnimation from "@/components/LoadingAnimation";
import CreateTeam from "@/components/teams/CreateTeam";
import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";

const Page = () => {
  const [toggleCreateTeam, setToggleCreateTeam] = useState<boolean>(false);
  const [team, setTeam] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const coachId = Cookies.get("x-user-id") ? parseInt(Cookies.get("x-user-id")!) : null;

  const fetchTeam = useCallback(async () => {
    if (!coachId) {
      // Refresh the page after a short delay if user cookie is not available
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      setIsLoading(false);
      setHasLoaded(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/team_management/get_coach_teams?coach_id=${coachId}`,
        { withCredentials: true }
      );
      if (!res.data?.teams?.length) {
        setToggleCreateTeam(true);
      } else {
        setTeam(res.data?.teams[0]);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
      setErrorMessage("Failed to load team data. Please try again later.");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [coachId]);

  useEffect(() => {
    // Check if this is the first load (not a navigation)
    const isFirstLoad = !sessionStorage.getItem('dashboardInitialized');
    
    if (isFirstLoad) {
      // Initial 3-second delay for page and tab bar to load on first visit
      const initialTimer = setTimeout(() => {
        setInitialLoading(false);
        sessionStorage.setItem('dashboardInitialized', 'true');
      }, 3000);
      
      return () => clearTimeout(initialTimer);
    } else {
      // Skip delay for subsequent navigations
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchTeam();
    }
  }, [fetchTeam, initialLoading]);

  if (initialLoading || !hasLoaded) {
    return <LoadingAnimation />;
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-[70px]">
          {errorMessage}
        </div>
      )}
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <>
          {/* Top Section - Maintains original PC layout */}
          <section className="hidden md:block px-16 w-full mt-[70px]">
            <div className="w-full flex flex-row gap-4 justify-between py-4">
              <TopPlayer />
              <TeamDetails />
              <TeamPerformance />
            </div>
          </section>

          {/* Bottom Section - Maintains original PC layout */}
          <section className="hidden md:block px-16 w-full">
            <div className="w-full flex flex-row gap-4 justify-between py-4">
              <Ranks />
              <TeamFormation />
              <Players />
            </div>
          </section>

          {/* Mobile Responsive Version */}
          <section className="md:hidden px-4 w-full mt-[70px]">
            <div className="w-full flex flex-col gap-4 py-4">
              <TopPlayer />
              <TeamDetails />
              <TeamPerformance />
              <Ranks />
              <TeamFormation />
              <Players />
            </div>
          </section>

          {toggleCreateTeam && (
            <CreateTeam
              callBack={fetchTeam}
              coachId={coachId as number}
              toggleCreateTeam={toggleCreateTeam}
              setHandleToggleCreateTeam={setToggleCreateTeam}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Page;