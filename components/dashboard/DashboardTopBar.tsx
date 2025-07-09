'dashboard/team-formation'

'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Cookie from "js-cookie";
import { GiSoccerBall, GiSoccerField } from "react-icons/gi";
import { FiMenu, FiX } from "react-icons/fi";
import { IoIosArrowDown, IoIosPerson } from "react-icons/io";
import { RiNotification3Line, RiDashboardFill } from "react-icons/ri";
import { navTabs } from "@/constants/navTabs";
import { baseUrl } from "@/constants/baseUrl";

const NotificationIcon = memo(function NotificationIcon() {
  const [hasUnread, setHasUnread] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHasUnread(prev => Math.random() > 0.5);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <RiNotification3Line size={20} className="text-gray-500 hover:text-gray-700 transition-colors" />
      {hasUnread && (
        <motion.span 
          className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
});

const UserProfileAvatar = memo(function UserProfileAvatar({
  imageUrl,
  name,
  size = "md"
}: {
  imageUrl: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-[#28809A] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Profile"
          width={48}
          height={48}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="font-semibold text-[#28809A] text-lg">
          {initials || "U"}
        </span>
      )}
    </motion.div>
  );
});

const UserProfileDropdown = memo(function UserProfileDropdown({
  userData,
  loading,
  onSignOut
}: {
  userData: any;
  loading: boolean;
  onSignOut: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  const toggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    controls.start(newState ? 'open' : 'closed');
  }, [isOpen, controls]);

  const dropdownVariants = {
    open: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      opacity: 0, 
      y: -10,
      transition: { 
        duration: 0.2 
      }
    }
  };

  return (
    <div className="relative">
      <motion.button 
        className="flex items-center gap-2 focus:outline-none"
        onClick={toggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={isOpen}
        aria-label="User profile menu"
      >
        <UserProfileAvatar 
          imageUrl={userData?.image} 
          name={userData?.name}
          size={loading ? "md" : "md"}
        />
        <div className="hidden md:flex flex-col items-start">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#28809A] rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-gray-600 truncate max-w-[120px]">
                {userData?.role || "Guest"}
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                {userData?.name || "Welcome"}
              </p>
            </>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <IoIosArrowDown size={16} className="text-gray-500 transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userData?.email || "No email"}
              </p>
            </div>
            {[
              { href: "/dashboard/my-profile", text: "Your Profile", icon: "👤" },
              { href: "/settings", text: "Settings", icon: "⚙️" },
              { href: "/help", text: "Help & Support", icon: "❓" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.text}
              </Link>
            ))}
            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 mt-1"
            >
              <span className="mr-2">👋</span>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const DashboardTopBar = memo(function DashboardTopBar() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const controls = useAnimation();
  const currentRoute = usePathname();
  const router = useRouter();

  const handleSignOut = useCallback(() => {
    Cookie.remove('sport_analytics');
    Cookie.remove('x-user-id');
    router.push('/');
  }, [router]);

  const isActiveRoute = useCallback((route: string) => {
    if (route === '/dashboard/player-profile') {
      return currentRoute?.startsWith('/dashboard/player-profile') ?? false;
    }
    return currentRoute === route;
  }, [currentRoute]);

  useEffect(() => {
    const user_id = Cookie.get("x-user-id");
    if (user_id && !userData) {
      setLoading(true);
      fetch(`${baseUrl}/users/${user_id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user data');
          return res.json();
        })
        .then((data) => setUserData(data))
        .catch(() => {
          setUserData({ name: "Guest User", role: "Guest" });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userData]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(o => !o);
    controls.start({ rotate: mobileMenuOpen ? 0 : 180 });
  }, [controls, mobileMenuOpen]);

  const logoVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const navItemVariants = {
    hover: { y: -2 },
    tap: { y: 0 }
  };

  const mobileMenuVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  return (
    <header className="fixed z-30 top-0 left-0 w-full flex justify-between items-center h-16 md:h-20 px-4 md:px-8 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-4">
        <motion.button 
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={toggleMobileMenu}
          animate={controls}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </motion.button>
        
        <Link href="/dashboard" passHref>
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex items-center gap-2 cursor-pointer"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-full flex items-center justify-center"
            >
              <GiSoccerBall className="text-xl md:text-2xl text-[#28809A]" />
            </motion.div>
            <h1 className="font-bold text-lg md:text-xl text-gray-900 tracking-tight">
              SPORTS ANALYTICS
            </h1>
          </motion.div>
        </Link>
      </div>

      <nav className="hidden md:flex">
        <ul className="flex items-center gap-1">
          {navTabs.map((tab) => (
            <motion.li 
              key={tab.route} 
              className="relative"
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href={tab.route}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActiveRoute(tab.route)
                    ? "text-[#28809A] bg-blue-50 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                passHref
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  {tab.icon({
                    color: isActiveRoute(tab.route) ? "#28809A" : "currentColor"
                  })}
                </motion.div>
                <span className="text-sm">{tab.name}</span>
              </Link>
              {isActiveRoute(tab.route) && (
                <motion.div 
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#28809A]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <motion.button 
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Notifications"
        >
          <NotificationIcon />
        </motion.button>
        
        <UserProfileDropdown 
          userData={userData} 
          loading={loading} 
          onSignOut={handleSignOut} 
        />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-10 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 left-0 w-64 z-20 bg-white shadow-xl md:hidden"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 border-b border-gray-200 h-16 flex items-center">
                <UserProfileAvatar 
                  imageUrl={userData?.image} 
                  name={userData?.name}
                  size="lg"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-900 truncate max-w-[160px]">
                    {userData?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">
                    {userData?.role || "Guest"}
                  </p>
                </div>
              </div>
              <ul className="py-2 overflow-y-auto h-[calc(100%-4rem)]">
                {navTabs.map((tab, index) => (
                  <motion.li
                    key={tab.route}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.1 + index * 0.05 }
                    }}
                  >
                    <Link
                      href={tab.route}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        isActiveRoute(tab.route)
                          ? "bg-blue-50 text-[#28809A]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {tab.icon({
                        color: isActiveRoute(tab.route) ? "#28809A" : "currentColor",
                      })}
                      <span>{tab.name}</span>
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 0.1 + navTabs.length * 0.05 }
                  }}
                >
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-gray-50 border-t border-gray-100 mt-2"
                  >
                    <FiX className="text-gray-500" />
                    <span>Sign out</span>
                  </button>
                </motion.li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
});

export default DashboardTopBar;