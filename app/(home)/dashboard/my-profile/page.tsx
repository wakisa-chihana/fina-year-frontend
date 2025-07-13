"use client";

import { baseUrl } from "@/constants/baseUrl";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState, useRef, useCallback } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/userProfile/ConfirmationModal";
import { FaEye, FaEyeSlash, FaCheck, FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEdit2, FiKey, FiTrash2, FiInfo } from "react-icons/fi";

const Profile = () => {
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [editMode, setEditMode] = useState<"info" | "password" | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const passwordRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Password requirements
  const hasMinLength = passwordData.new_password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(passwordData.new_password);
  const hasNumber = /\d/.test(passwordData.new_password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new_password);
  const passwordsMatch = passwordData.new_password === passwordData.confirmPassword;

  const router = useRouter();
  const userId = Cookies.get("x-user-id");
  const userRole = Cookies.get("x-user-role");

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/users/${userId}`, {
        withCredentials: true,
      });
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setErrorMessage("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.patch(`${baseUrl}/users/update-info`, {
        user_id: userId,
        name: formData.name,
        email: formData.email
      }, { withCredentials: true });
      
      setProfile({ ...profile, ...formData });
      setEditMode(null);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (!hasMinLength || !hasLetter || !hasNumber) {
        throw new Error("Password must be at least 8 characters with uppercase, lowercase, and number");
      }

      if (!passwordsMatch) {
        throw new Error("Passwords don&apos;t match");
      }

      const response = await axios.patch(`${baseUrl}/users/update-password`, {
        user_id: userId,
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, { withCredentials: true });

      if (response.data.success) {
        setPasswordData({
          current_password: "",
          new_password: "",
          confirmPassword: ""
        });
        setEditMode(null);
        toast.success("Password updated successfully!");
      }
    } catch (error: any) {
      let errorMessage = "Failed to update password";
      
      if (error.response) {
        if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ');
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${baseUrl}/team_players/remove_by_email`, {
        data: { email: profile.email },
        withCredentials: true
      });
      
      Cookies.remove("x-user-id");
      Cookies.remove("sport_analytics");
      Cookies.remove("x-access-token");
      toast.success("Account deleted successfully. Redirecting...");
      
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "new_password") {
      setShowPasswordRequirements(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (passwordData.new_password.length > 0) {
          setShowPasswordRequirements(false);
        }
      }, 3000);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passwordRef.current && !passwordRef.current.contains(event.target as Node)) {
        setShowPasswordRequirements(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [userId, fetchProfile]);

  return (
    <div className="relative w-full min-h-screen mt-20 px-4 md:px-8 lg:px-16 py-8 bg-[#f7f9f9]">
      <h1 className="ml-2 text-[#0f1419] text-center text-opacity-80 text-xl mb-2 font-extrabold">my profile</h1>
      <Toaster position="top-center" />
      
      {isLoading && <LoadingAnimation />}
      
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 mx-auto max-w-4xl"
          >
            <div className="flex items-center gap-2">
              <FaExclamationCircle />
              <span>{errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e7e7e8]"
        >
          <div className="bg-[#f7f9f9] p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-full border-4 border-white bg-[#1d9bf0] flex items-center justify-center shadow-lg"
              >
                <span className="text-3xl font-bold text-white">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </motion.div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-[#0f1419]">{profile?.name || "User"}</h1>
                <p className="text-[#1d9bf0] font-medium">{userRole}</p>
                <p className="text-[#536471] mt-1">{profile?.email}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {editMode ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditMode(null)}
                    className="bg-[#eff3f4] text-[#0f1419] px-4 py-2 rounded-full font-medium hover:bg-[#e7e7e8] transition flex items-center gap-2"
                  >
                    <span>Cancel</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditMode("info")}
                      className="bg-[#e8f5fd] text-[#1d9bf0] px-4 py-2 rounded-full font-medium hover:bg-[#d1ebfc] transition flex items-center gap-2"
                    >
                      <FiEdit2 />
                      <span>Edit Profile</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditMode("password")}
                      className="bg-[#f7f9f9] text-[#0f1419] px-4 py-2 rounded-full font-medium hover:bg-[#e7e7e8] transition flex items-center gap-2"
                    >
                      <FiKey />
                      <span>Change Password</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-[#f7e9e9] text-[#f4212e] px-4 py-2 rounded-full font-medium hover:bg-[#f7d7d7] transition flex items-center gap-2"
                    >
                      <FiTrash2 />
                      <span>Delete Account</span>
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Section Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e7e7e8]"
        >
          <div className="p-6">
            {editMode === "info" ? (
              <motion.form
                onSubmit={handleUpdateInfo}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#0f1419] font-medium mb-2">Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-[#536471]" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-[#e7e7e8] rounded-lg text-[#0f1419] focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#0f1419] font-medium mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-[#536471]" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-[#e7e7e8] rounded-lg text-[#0f1419] focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditMode(null)}
                    className="px-5 py-2.5 border border-[#e7e7e8] rounded-full text-[#0f1419] hover:bg-[#f7f9f9] transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-[#0f1419] text-white rounded-full hover:bg-[#272c30] flex items-center justify-center min-w-[140px] transition"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </motion.button>
                </div>
              </motion.form>
            ) : editMode === "password" ? (
              <motion.form
                onSubmit={handleUpdatePassword}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#0f1419] font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-[#536471]" />
                      </div>
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border border-[#e7e7e8] rounded-lg text-[#0f1419] focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#536471] hover:text-[#0f1419]"
                      >
                        {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div ref={passwordRef}>
                    <label className="block text-[#0f1419] font-medium mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-[#536471]" />
                      </div>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        onFocus={() => setShowPasswordRequirements(true)}
                        className="w-full pl-10 pr-10 py-3 border border-[#e7e7e8] rounded-lg text-[#0f1419] focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#536471] hover:text-[#0f1419]"
                      >
                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {showPasswordRequirements && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 bg-[#e8f5fd] p-3 rounded-lg"
                        >
                          <h4 className="text-sm font-medium text-[#0f1419] mb-2">Password Requirements:</h4>
                          <ul className="space-y-1 text-sm">
                            <li className={`flex items-center gap-2 ${hasMinLength ? 'text-[#00ba7c]' : 'text-[#536471]'}`}>
                              {hasMinLength ? <FaCheck className="text-[#00ba7c]" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>At least 8 characters</span>
                            </li>
                            <li className={`flex items-center gap-2 ${hasLetter ? 'text-[#00ba7c]' : 'text-[#536471]'}`}>
                              {hasLetter ? <FaCheck className="text-[#00ba7c]" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>Contains letters</span>
                            </li>
                            <li className={`flex items-center gap-2 ${hasNumber ? 'text-[#00ba7c]' : 'text-[#536471]'}`}>
                              {hasNumber ? <FaCheck className="text-[#00ba7c]" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>Contains numbers</span>
                            </li>
                            <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-[#00ba7c]' : 'text-[#536471]'}`}>
                              {hasSpecialChar ? <FaCheck className="text-[#00ba7c]" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>Contains special characters (optional)</span>
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-[#0f1419] font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-[#536471]" />
                      </div>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border border-[#e7e7e8] rounded-lg text-[#0f1419] focus:ring-2 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#536471] hover:text-[#0f1419]"
                      >
                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {passwordData.new_password && passwordData.confirmPassword && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`mt-2 text-sm flex items-center gap-2 ${passwordsMatch ? 'text-[#00ba7c]' : 'text-[#f4212e]'}`}
                        >
                          {passwordsMatch ? (
                            <>
                              <FaCheck className="text-[#00ba7c]" />
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <FaExclamationCircle />
                              <span>Passwords don&apos;t match</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditMode(null)}
                    className="px-5 py-2.5 border border-[#e7e7e8] rounded-full text-[#0f1419] hover:bg-[#f7f9f9] transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-[#0f1419] text-white rounded-full hover:bg-[#272c30] flex items-center justify-center min-w-[160px] transition"
                    disabled={isUpdating || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch}
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                        <span></span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <div className="space-y-8">
                {/* About Section */}
                <div className="border-b border-[#e7e7e8] pb-6">
                  <h2 className="text-xl font-semibold text-[#0f1419] mb-4 flex items-center gap-2">
                    <FiInfo className="text-[#1d9bf0]" />
                    <span>About</span>
                  </h2>
                  <p className="text-[#0f1419]">
                    {profile?.bio || "No bio provided. You can add a bio to tell others more about yourself."}
                  </p>
                </div>

                {/* Two-column info section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-[#0f1419] mb-4 flex items-center gap-2">
                      <FiMail className="text-[#1d9bf0]" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="font-medium text-[#0f1419] min-w-[80px]">Email:</span>
                        <span className="text-[#536471]">{profile?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div>
                    <h3 className="font-semibold text-[#0f1419] mb-4 flex items-center gap-2">
                      <FiUser className="text-[#1d9bf0]" />
                      <span>Account Details</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="font-medium text-[#0f1419] min-w-[80px]">Role:</span>
                        <span className="text-[#536471] capitalize">{userRole}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-[#0f1419] min-w-[80px]">Joined:</span>
                        <span className="text-[#536471]">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Information (if applicable) */}
                {profile?.team_id && (
                  <div className="border-t border-[#e7e7e8] pt-6">
                    <h3 className="font-semibold text-[#0f1419] mb-4">Team Information</h3>
                    <div className="flex items-start">
                      <span className="font-medium text-[#0f1419] min-w-[80px]">Team ID:</span>
                      <span className="text-[#536471]">{profile.team_id}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isProcessing={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default Profile;