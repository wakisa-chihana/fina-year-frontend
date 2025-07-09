import FootballField from "@/components/team-selection/football-field";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-0 mt-20">
        <div className="w-full h-full">
          <FootballField />
        </div>
      </main>
    </>
  );
}