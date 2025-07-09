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

  const coachId = Cookies.get("x-user-id") ? parseInt(Cookies.get("x-user-id")!) : null;

  const fetchTeam = useCallback(async () => {
    if (!coachId) {
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
    fetchTeam();
  }, [fetchTeam]);

  if (!hasLoaded) {
    return <LoadingAnimation />;
  }

  return (
    <div className="w-full">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <>
          <section className="px-4 md:px-16 w-full mt-4 md:mt-0">
            <div className="w-full mt-[70px] flex flex-col md:flex-row gap-4 md:justify-between py-4">
              <TopPlayer />
              <TeamDetails />
              <TeamPerformance />
            </div>
          </section>
          <section className="px-16 w-full">
            <div className="w-full flex lg:flex-row flex-col gap-4 justify-between py-4">
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