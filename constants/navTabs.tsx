import { GiSoccerField } from "react-icons/gi";  // Best for formations
import { IoIosPerson } from "react-icons/io";
import { RiDashboardFill } from "react-icons/ri";


export const navTabs = [
  {
    name: "Dashboard",
    icon: ({ color = "white" }) => <RiDashboardFill size={20} color={color} />,
    route: "/dashboard",
  },
  {
    name: "Formation",
    icon: ({ color = "white" }) => <GiSoccerField size={20} color={color} />,
    route: "/dashboard/team-formation",
  },
  {
    name: "Player profile",
    icon: ({ color = "white" }) => <IoIosPerson size={20} color={color} />,
    route: "/dashboard/player-profile", // Base route without ID
    matchPattern: (path: string) => path.startsWith('/dashboard/player-profile') 
  },
];