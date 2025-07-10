"use client";

import {
  AreaChart,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { baseUrl } from "@/constants/baseUrl";
import { FaRegSadTear } from "react-icons/fa";

// Helper function to get a cookie value by name
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface PerformanceData {
  player_id: number;
  player_name: string;
  current_overall_performance: number;
  performance_history: {
    overall_performance: number;
    recorded_at: string | null;
  }[];
}

export default function RatingChart() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get coach ID from cookie named x-user-id
        const userIdCookie = getCookie('x-user-id');
        if (!userIdCookie) throw new Error("Coach ID not found in cookies (x-user-id missing)");
        const coachId = Number(userIdCookie);
        if (isNaN(coachId)) throw new Error("Invalid coach ID in cookie");

        const response = await fetch(
          `${baseUrl}/performance/top-player/history/${coachId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-[20%] bg-transparent p-4 rounded-xl">
        <div className="animate-pulse">
          <div className="h-5 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="w-full h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }



if (error) {
  return (
    <div className="w-[20%] bg-transparent p-4 rounded-xl text-dark text-sm flex flex-col items-center">
      <FaRegSadTear className="text-2xl mb-2" />
      <span>No graph available</span>
    </div>
  );
}


  if (!data) {
    return (
      <div className="w-[20%] bg-transparent p-4 rounded-xl text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  const chartData = data.performance_history.map((item) => {
    // If recorded_at is null, show as "Now"
    let label: string;
    if (item.recorded_at) {
      const date = new Date(item.recorded_at);
      label = date.toLocaleString('default', { month: 'short' }) + " " + date.getFullYear();
    } else {
      label = "Now";
    }
    return {
      month: label,
      rating: item.overall_performance,
      fullDate: item.recorded_at,
    };
  });

  return (
    <div className="w-[20%] bg-transparent p-4 rounded-xl text-black">
      <div className="flex justify-between items-center mb-2">
        <p className="text-black font-bold">
          {data.player_name}&apos;s performance
        </p>
        <div className="flex space-x-1">
          <button 
            onClick={() => setChartType("area")}
            className={`px-2 py-1 text-xs rounded ${chartType === "area" ? "bg-black text-white" : "bg-gray-200"}`}
          >
            Area
          </button>
          <button 
            onClick={() => setChartType("bar")}
            className={`px-2 py-1 text-xs rounded ${chartType === "bar" ? "bg-black text-white" : "bg-gray-200"}`}
          >
            Bar
          </button>
        </div>
      </div>
      
      <div className="w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#000000', fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']} 
                tick={{ fill: '#000000', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#000000", fontWeight: "bold", fontSize: 12 }}
                itemStyle={{ color: "#000000", fontSize: 12 }}
                formatter={(value: number) => [`Rating: ${value.toFixed(1)}`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#000000"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRating)"
                activeDot={{ r: 6, fill: "#000000", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#000000', fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']} 
                tick={{ fill: '#000000', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#000000", fontWeight: "bold", fontSize: 12 }}
                itemStyle={{ color: "#000000", fontSize: 12 }}
                formatter={(value: number) => [`Rating: ${value.toFixed(1)}`, '']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar
                dataKey="rating"
                fill="#000000"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}