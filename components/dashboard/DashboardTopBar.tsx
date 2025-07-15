'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Cookie from "js-cookie";
import { GiSoccerBall } from "react-icons/gi";
import { FiMenu, FiX, FiUser, FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { navTabs } from "@/constants/navTabs";
import { baseUrl } from "@/constants/baseUrl";
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11"
};

const fadeSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
};

const NotificationIcon = memo(function NotificationIcon() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: 0.1
      }}
      className="relative flex items-center justify-center"
    >
      <NotificationDropdown />
    </motion.div>
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
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase();
  const imageSize = 43;

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-[#1d9bf0] bg-gradient-to-br from-[#e8f5fd] to-[#d1ebfc] flex items-center justify-center relative`}
      whileHover={{ scale: 1.08, boxShadow: "0 2px 12px #1d9bf055" }}
      whileTap={{ scale: 0.95 }}
      transition={fadeSpring}
    >
      {imageUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={fadeSpring}
        >
          <Image
            src={imageUrl}
            alt="Profile"
            width={imageSize}
            height={imageSize}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </motion.div>
      ) : (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-semibold text-[#1d9bf0] text-base"
        >
          {initials || "U"}
        </motion.span>
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
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 320,
        damping: 32
      }
    },
    closed: {
      opacity: 0,
      y: -14,
      scale: 0.98,
      transition: {
        duration: 0.17
      }
    }
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-2 focus:outline-none"
        onClick={toggle}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={isOpen}
        aria-label="User profile menu"
        transition={fadeSpring}
      >
        <UserProfileAvatar
          imageUrl={userData?.image}
          name={userData?.name}
          size={loading ? "md" : "md"}
        />
        <motion.div
          className="hidden md:flex flex-col items-start"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={fadeSpring}
        >
          {loading ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-3.5 h-3.5 border border-[#e7e7e8] border-t-[#1d9bf0] rounded-full animate-spin"></div>
              <span className="text-[0.7rem] text-[#536471]">Loading...</span>
            </motion.div>
          ) : (
            <>
              <motion.p
                className="text-[0.7rem] font-medium text-[#536471] truncate max-w-[108px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28 }}
              >
                {userData?.role || "Guest"}
              </motion.p>
              <motion.p
                className="text-sm font-semibold text-[#0f1419] truncate max-w-[108px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              >
                {userData?.name || "Welcome"}
              </motion.p>
            </>
          )}
        </motion.div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={fadeSpring}
        >
          <IoIosArrowDown size={14} className="text-[#536471] transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute right-0 mt-2 w-50 bg-white rounded-lg shadow-xl py-1 z-50 border border-[#e7e7e8]"
          >
            <motion.div
              className="px-3 py-2 border-b border-[#f7f9f9]"
              initial={{ opacity: 0, y: -7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fadeSpring}
            >
              <p className="text-sm font-medium text-[#0f1419] truncate">
                {userData?.name || "User"}
              </p>
              <p className="text-[0.7rem] text-[#536471] truncate">
                {userData?.email || "No email"}
              </p>
            </motion.div>

            {/* Added Go to Home link */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0, type: "spring" as const, stiffness: 300, damping: 30 }}
            >
              <Link
                href="/"
                className="flex items-center px-3 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </span>
                Go to Home
              </Link>
            </motion.div>

            {[
              { href: "/dashboard/my-profile", text: "Your Profile", icon: <FiUser size={16} className="text-[#536471]" /> },
              { href: "/settings", text: "Settings", icon: <FiSettings size={16} className="text-[#536471]" /> },
              { href: "/help", text: "Help & Support", icon: <FiHelpCircle size={16} className="text-[#536471]" /> },
            ].map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * (idx + 1), type: "spring" as const, stiffness: 300, damping: 30 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center px-3 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, type: "spring" as const, stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center px-3 py-2.5 text-sm text-[#0f1419] hover:bg-[#f7f9f9] border-t border-[#f7f9f9] mt-1"
              >
                <FiLogOut size={16} className="text-[#536471] mr-2" />
                Sign out
              </button>
            </motion.div>
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
    const user_id = Cookie.get("x-user-id");
    
    // Clear cached user data
    if (user_id) {
      localStorage.removeItem(`userData_${user_id}`);
    }
    
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
    
    if (user_id) {
      // Check if we have cached user data
      const cachedUserData = localStorage.getItem(`userData_${user_id}`);
      
      if (cachedUserData && !userData) {
        // Use cached data immediately to prevent loading state
        try {
          const parsedData = JSON.parse(cachedUserData);
          setUserData(parsedData);
          setLoading(false);
        } catch (error) {
          console.error('Error parsing cached user data:', error);
        }
      }
      
      // Only fetch if we don't have userData (including cached data)
      if (!userData && !cachedUserData) {
        setLoading(true);
        fetch(`${baseUrl}/users/${user_id}`)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch user data');
            return res.json();
          })
          .then((data) => {
            setUserData(data);
            // Cache the user data
            localStorage.setItem(`userData_${user_id}`, JSON.stringify(data));
          })
          .catch(() => {
            const guestData = { name: "Guest User", role: "Guest" };
            setUserData(guestData);
            localStorage.setItem(`userData_${user_id}`, JSON.stringify(guestData));
          })
          .finally(() => setLoading(false));
      }
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
    hover: { y: -2, scale: 1.03 },
    tap: { y: 0 }
  };

  const mobileMenuVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.25 }
    }
  };

  return (
    <header className="fixed z-30 top-0 left-0 w-full flex justify-between items-center h-[58px] md:h-[72px] px-3 md:px-7 bg-white shadow-sm border-b border-[#e7e7e8]">
      <div className="flex items-center gap-3">
        <motion.button
          className="md:hidden text-[#536471] focus:outline-none"
          onClick={toggleMobileMenu}
          animate={controls}
          whileHover={{ scale: 1.13, rotate: 8 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Toggle menu"
          transition={fadeSpring}
        >
          {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </motion.button>

        <Link href="/dashboard" passHref>
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            whileTap="tap"
            className="flex items-center gap-1 cursor-pointer"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-7 h-7 md:w-9 md:h-9 bg-[#e8f5fd] rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.07, rotate: -6 }}
            >
              <GiSoccerBall className="text-xl md:text-xl text-[#1d9bf0]" />
            </motion.div>
            <motion.h1
              className="font-bold text-lg md:text-xl text-dark tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={fadeSpring}
            >
              SPORTS ANALYTICS
            </motion.h1>
          </motion.div>
        </Link>
      </div>

      <nav className="hidden md:flex">
        <ul className="flex items-center gap-1">
          {navTabs.map((tab, idx) => (
            <motion.li
              key={tab.route}
              className="relative"
              variants={navItemVariants}
              whileTap="tap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * idx, ...fadeSpring }}
            >
              <Link
                href={tab.route}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                  isActiveRoute(tab.route)
                    ? "text-[#1d9bf0] bg-[#e8f5fd] font-semibold"
                    : "text-[#536471] hover:bg-[#f7f9f9]"
                }`}
                passHref
              >
                <motion.div whileTap={{ scale: 0.95 }}>
                  {tab.icon({
                    color: isActiveRoute(tab.route) ? "#1d9bf0" : "currentColor"
                  })}
                </motion.div>
                <span className="text-sm">{tab.name}</span>
              </Link>
              {isActiveRoute(tab.route) && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d9bf0]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        <NotificationIcon />

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
              transition={fadeSpring}
            />
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 left-0 w-56 z-20 bg-white shadow-xl md:hidden"
            >
              <motion.div
                className="p-3 border-b border-[#e7e7e8] h-[58px] flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={fadeSpring}
              >
                <UserProfileAvatar
                  imageUrl={userData?.image}
                  name={userData?.name}
                  size="lg"
                />
                <motion.div
                  className="ml-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={fadeSpring}
                >
                  <p className="font-semibold text-sm text-[#0f1419] truncate max-w-[144px]">
                    {userData?.name || "User"}
                  </p>
                  <p className="text-[0.7rem] text-[#536471] truncate max-w-[144px]">
                    {userData?.role || "Guest"}
                  </p>
                </motion.div>
              </motion.div>
              <ul className="py-2 overflow-y-auto h-[calc(100%-3rem)]">
                {navTabs.map((tab, idx) => (
                  <motion.li
                    key={tab.route}
                    initial={{ opacity: 0, x: -22 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, ...fadeSpring }}
                  >
                    <Link
                      href={tab.route}
                      className={`flex items-center gap-2 px-3 py-2 ${
                        isActiveRoute(tab.route)
                          ? "bg-[#e8f5fd] text-[#1d9bf0]"
                          : "text-[#0f1419] hover:bg-[#f7f9f9]"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {tab.icon({
                        color: isActiveRoute(tab.route) ? "#1d9bf0" : "currentColor"
                      })}
                      <span className="text-sm">{tab.name}</span>
                    </Link>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: -22 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18, ...fadeSpring }}
                >
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-[#0f1419] hover:bg-[#f7f9f9] border-t border-[#e7e7e8] mt-2"
                  >
                    <FiLogOut size={16} className="text-[#536471]" />
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