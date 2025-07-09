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
    <div className="relative w-full min-h-screen mt-20 px-4 md:px-8 lg:px-16 py-8 bg-slate-100">
      <h1 className="ml-2 text-dark text-center text-opacity-20 text-xl mb-2 font-extrabold">my profile</h1>
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
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100"
        >
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-full border-4 border-white bg-blue-200 flex items-center justify-center shadow-lg"
              >
                <span className="text-3xl font-bold text-blue-700">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </motion.div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">{profile?.name || "User"}</h1>
                <p className="text-blue-600 font-medium">{userRole}</p>
                <p className="text-gray-600 mt-1">{profile?.email}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {editMode ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditMode(null)}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <span>Cancel</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditMode("info")}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition flex items-center gap-2"
                    >
                      <FiEdit2 />
                      <span>Edit Profile</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditMode("password")}
                      className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition flex items-center gap-2"
                    >
                      <FiKey />
                      <span>Change Password</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition flex items-center gap-2"
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
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 shadow-blue-200"
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
                    <label className="block text-gray-700 font-medium mb-2">Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gradient-to-t from-gray-600 to-dark flex items-center justify-center min-w-[140px] transition"
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
                    <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div ref={passwordRef}>
                    <label className="block text-gray-700 font-medium mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        onFocus={() => setShowPasswordRequirements(true)}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
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
                          className="mt-3 bg-blue-50 p-3 rounded-lg"
                        >
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                          <ul className="space-y-1 text-sm">
                            <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                              {hasMinLength ? <FaCheck className="text-green-500" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>At least 8 characters</span>
                            </li>
                            <li className={`flex items-center gap-2 ${hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                              {hasLetter ? <FaCheck className="text-green-500" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>Contains letters</span>
                            </li>
                            <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                              {hasNumber ? <FaCheck className="text-green-500" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>Contains numbers</span>
                            </li>
                            <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                              {hasSpecialChar ? <FaCheck className="text-green-500" /> : <span className="w-4 h-4 inline-block"></span>}
                              <span>Contains special characters (optional)</span>
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
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
                          className={`mt-2 text-sm flex items-center gap-2 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {passwordsMatch ? (
                            <>
                              <FaCheck className="text-green-500" />
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
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gradient-to-tr from-gray-600 to-darkflex items-center justify-center min-w-[160px] transition"
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
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiInfo className="text-blue-600" />
                    <span>About</span>
                  </h2>
                  <p className="text-gray-700">
                    {profile?.bio || "No bio provided. You can add a bio to tell others more about yourself."}
                  </p>
                </div>

                {/* Two-column info section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiMail className="text-blue-600" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-[80px]">Email:</span>
                        <span className="text-gray-600">{profile?.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FiUser className="text-blue-600" />
                      <span>Account Details</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-[80px]">Role:</span>
                        <span className="text-gray-600 capitalize">{userRole}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 min-w-[80px]">Joined:</span>
                        <span className="text-gray-600">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Information (if applicable) */}
                {profile?.team_id && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Team Information</h3>
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 min-w-[80px]">Team ID:</span>
                      <span className="text-gray-600">{profile.team_id}</span>
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