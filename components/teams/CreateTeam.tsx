"use client";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { baseUrl } from "@/constants/baseUrl";
import Image from "next/image";

interface CreateTeamProps {
  toggleCreateTeam: boolean;
  setHandleToggleCreateTeam: (toggle: boolean) => void;
  coachId: number;
  callBack: () => void;
}

const CreateTeam = ({
  toggleCreateTeam,
  setHandleToggleCreateTeam,
  coachId,
  callBack,
}: CreateTeamProps) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isAddingTeam, setIsAddingTeam] = useState<boolean>(false);
  const [team, setTeam] = useState<string>("");

  // Function to capitalize each word in the team name
  const capitalizeTeamName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingTeam(true);
    setErrorMessage(""); // Clear old error
    setSuccessMessage(""); // Clear old success message

    try {
      const res = await axios.post(
        `${baseUrl}/team_management/add_team`,
        {
          name: team, // This must match backend field `name`
          coach_id: coachId,
        },
        { withCredentials: true }
      );

      // Display success message
      setSuccessMessage("Team created successfully!");

      // Wait for 3 seconds, then close modal and reset form
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message
        setHandleToggleCreateTeam(false); // Close modal
        setTeam(""); // Clear input field
        callBack(); // Call the callback function
      }, 3000); // 3 seconds delay
    } catch (error: any) {
      console.error(error);
      const errorDetail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setErrorMessage(errorDetail);

      // Wait for 3 seconds, then clear error message
      setTimeout(() => {
        setErrorMessage(""); // Clear error message
      }, 3000); // 3 seconds delay
    } finally {
      setIsAddingTeam(false);
    }
  };

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedTeamName = capitalizeTeamName(e.target.value);
    setTeam(formattedTeamName);
  };

  return (
    <>
      {toggleCreateTeam && (
        <div
          className="fixed inset-0 w-full h-screen bg-black bg-opacity-90 z-[9999]"
          onClick={() => setHandleToggleCreateTeam(false)}
        >
          <div className="w-full flex flex-row items-end justify-end mt-2 px-6">
            <button
              type="button"
              onClick={() => setHandleToggleCreateTeam(false)}
              aria-label="Close Create Team Modal"
            >
              <IoClose
                size={35}
                className="hover:scale-110 text-white hover:text-red-600"
              />
            </button>
          </div>
          <div className="w-full flex flex-col items-center justify-center">
            <div
              className="z-10 flex flex-col items-center justify-center md:mt-4 no-scrollbar w-full min-h-[70vh] max-h-[85vh] rounded-xl md:w-[30%] overflow-auto pb-4 animated fadeInUp bg-white px-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-[35%] rounded-3xl shadow-md mb-6">
                <Image
                  src="/sports_analytics_logo.png"
                  alt="Player"
                  width={1000}
                  height={1000}
                  className="rounded-3xl w-full h-full"
                />
              </div>
              <h2 className="text-center text-primary-500 md:text-black font-black text-3xl">
                Create Team
              </h2>

              {/* Display error message */}
              {errorMessage && (
                <div className="w-[85%] md:w-[80%] mt-4 rounded-lg p-3 bg-red-100 border border-red-400 text-red-700 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Display success message */}
              {successMessage && (
                <div className="w-[85%] md:w-[80%] mt-4 rounded-lg p-3 bg-green-100 border border-green-400 text-green-700 text-sm font-medium">
                  {successMessage}
                </div>
              )}

              <form className="w-full p-8 md:p-0" onSubmit={handleAddTeam}>
                <div className="w-full mb-4 mt-4">
                  <label
                    className="text-lg font-semibold text-gray-700"
                    htmlFor="team"
                  >
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="team"
                    className="mt-3 text-sm font-bold flex flex-row justify-between rounded-md w-full shadow-md shadow-blue-300 bg-gray-100 h-11 hover:shadow-blue-600 px-4 bg-transparent focus:outline-none focus:shadow-blue-600 text-gray-600"
                    placeholder="Enter team name"
                    value={team}
                    onChange={handleChangeText}
                    required
                  />
                </div>
                <button
                  disabled={isAddingTeam}
                  type="submit"
                  className="w-full px-4 py-2 font-semibold text-white bg-black rounded-md focus:outline-none hover:scale-105 shadow-md focus:ring-offset-2 mt-8 flex items-center justify-center"
                >
                  {isAddingTeam ? (
                    <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                  ) : (
                    <p>Create team</p>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTeam;
