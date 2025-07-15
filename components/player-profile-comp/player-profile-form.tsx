'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFutbol, FaRunning, FaBrain, FaChartLine, FaUser, FaShoePrints, FaTimes, FaCheck } from 'react-icons/fa';
import { GiSoccerBall, GiSoccerKick, GiSoccerField, GiStrong, GiFootprint } from 'react-icons/gi';
import { IoMdSpeedometer } from 'react-icons/io';
import { BiTargetLock } from 'react-icons/bi';
import { JSX } from 'react/jsx-runtime';
import { baseUrl } from '@/constants/baseUrl';

interface PlayerDataEntryFormProps {
  playerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const skillIcons: Record<string, JSX.Element> = {
  crossing: <GiSoccerBall className="text-blue-500" />,
  finishing: <GiSoccerKick className="text-red-500" />,
  heading_accuracy: <GiSoccerField className="text-green-500" />,
  short_passing: <FaFutbol className="text-yellow-500" />,
  volleys: <GiSoccerKick className="text-purple-500" />,
  dribbling: <GiFootprint className="text-indigo-500" />,
  curve: <FaChartLine className="text-pink-500" />,
  freekick_accuracy: <BiTargetLock className="text-orange-500" />,
  long_passing: <FaFutbol className="text-teal-500" />,
  ball_control: <GiSoccerBall className="text-amber-500" />,
  acceleration: <IoMdSpeedometer className="text-red-500" />,
  sprint_speed: <FaRunning className="text-blue-500" />,
  agility: <FaRunning className="text-green-500" />,
  reactions: <FaBrain className="text-purple-500" />,
  balance: <GiStrong className="text-indigo-500" />,
  shot_power: <GiSoccerKick className="text-pink-500" />,
  jumping: <FaRunning className="text-orange-500" />,
  stamina: <FaRunning className="text-teal-500" />,
  strength: <GiStrong className="text-amber-500" />,
  long_shots: <BiTargetLock className="text-red-500" />,
  aggression: <GiStrong className="text-blue-500" />,
  interceptions: <FaBrain className="text-green-500" />,
  positioning: <BiTargetLock className="text-purple-500" />,
  vision: <FaBrain className="text-indigo-500" />,
  penalties: <GiSoccerKick className="text-pink-500" />,
  composure: <FaBrain className="text-orange-500" />,
  marking: <BiTargetLock className="text-teal-500" />,
  standing_tackle: <GiStrong className="text-amber-500" />,
  sliding_tackle: <GiStrong className="text-red-500" />,
  work_rate_encoded: <FaRunning className="text-blue-500" />,
};

const workRateOptions = [
  { value: '4', label: 'High / High' },
  { value: '3.5', label: 'High / Medium' },
  { value: '3', label: 'High / Low' },
  { value: '3.5', label: 'Medium / High' },
  { value: '3', label: 'Medium / Medium' },
  { value: '2.5', label: 'Medium / Low' },
  { value: '3', label: 'Low / High' },
  { value: '2.5', label: 'Low / Medium' },
  { value: '2', label: 'Low / Low' },
];

const sectionVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -24, scale: 0.98 },
};

export default function PlayerDataEntryForm({ onSuccess, onCancel, playerId }: PlayerDataEntryFormProps) {
  const [formData, setFormData] = useState({
    age: '',
    height_cm: '',
    weight_kgs: '',
    preferred_foot_encoded: '1',
    weak_foot: '',
    skill_moves: '',
    crossing: '',
    finishing: '',
    heading_accuracy: '',
    short_passing: '',
    volleys: '',
    dribbling: '',
    curve: '',
    freekick_accuracy: '',
    long_passing: '',
    ball_control: '',
    acceleration: '',
    sprint_speed: '',
    agility: '',
    reactions: '',
    balance: '',
    shot_power: '',
    jumping: '',
    stamina: '',
    strength: '',
    long_shots: '',
    aggression: '',
    interceptions: '',
    positioning: '',
    vision: '',
    penalties: '',
    composure: '',
    marking: '',
    standing_tackle: '',
    sliding_tackle: '',
    work_rate_encoded: '3'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('personal');

  const requiredFields = [
    'age', 'height_cm', 'weight_kgs', 'weak_foot', 'skill_moves',
    'crossing', 'finishing', 'heading_accuracy', 'short_passing', 'volleys',
    'dribbling', 'curve', 'freekick_accuracy', 'long_passing', 'ball_control',
    'acceleration', 'sprint_speed', 'agility', 'reactions', 'balance',
    'shot_power', 'jumping', 'stamina', 'strength', 'long_shots',
    'aggression', 'interceptions', 'positioning', 'vision', 'penalties',
    'composure', 'marking', 'standing_tackle', 'sliding_tackle', 'work_rate_encoded'
  ];

  const validateField = (name: string, value: string) => {
    if (requiredFields.includes(name) && value === '') {
      return 'This field is required';
    }
    if (value === '') return '';
    
    // Skip validation for work_rate_encoded as it's a select field with predefined values
    if (name === 'work_rate_encoded') return '';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return 'Must be a number';
    if (['weak_foot', 'skill_moves'].includes(name)) {
      if (numValue < 1) return 'Minimum value is 1';
      if (numValue > 5) return 'Maximum value is 5';
    } else if (['age', 'height_cm', 'weight_kgs'].includes(name)) {
      if (name === 'age' && (numValue < 16 || numValue > 70)) return 'Age must be between 16-70';
      if (name === 'height_cm' && (numValue < 150 || numValue > 250)) return 'Height must be between 150-250cm';
      if (name === 'weight_kgs' && (numValue < 50 || numValue > 150)) return 'Weight must be between 50-150kg';
    } else {
      if (numValue < 1) return 'Minimum value is 1';
      if (numValue > 100) return 'Maximum value is 100';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name !== 'work_rate_encoded') {
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;
    requiredFields.forEach((name) => {
      const value = formData[name as keyof typeof formData];
      const error = validateField(name, value);
      if (error) {
        errors[name] = error;
        isValid = false;
      }
    });
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields and fix any errors');
      return;
    }
    setIsSubmitting(true);
    setFormMessage(null);
    try {
      // Prepare data for model prediction (work_rate_encoded as float, others as integers)
      const modelData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => {
          if (key === 'work_rate_encoded') {
            return [key, parseFloat(value)];
          }
          return [key, parseInt(value, 10)];
        })
      );

      // Prepare data for database insertion (all as integers)
      const dbData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, parseInt(value, 10)])
      );

      const predictionResponse = await fetch(`${baseUrl}/predict_rating/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: Number(playerId),
          features: { ...modelData }
        })
      });
      if (!predictionResponse.ok) {
        const errorData = await predictionResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Prediction failed with status ${predictionResponse.status}`);
      }
      const predictionResult = await predictionResponse.json();
      const predictedRating = predictionResult.predicted_rating || 0;
      
      const updateResponse = await fetch(`${baseUrl}/player_profile/update_profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dbData,
          player_id: Number(playerId),
          overall_performance: predictedRating
        })
      });
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Update failed with status ${updateResponse.status}`);
      }
      setFormMessage({ type: 'success', text: 'Player data updated successfully!' });
      toast.success('Player data updated!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error during submission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setFormMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (name: string, label: string, max = 100, min = 1) => (
    <motion.div 
      className="mb-4 relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.04, boxShadow: '0 2px 10px rgba(59,130,246,.06)' }}
      whileTap={{ scale: 0.98 }}
    >
      <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
        <motion.div
          className="flex items-center"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <span className="mr-2">
            {skillIcons[name] || <FaChartLine className="text-gray-500" />}
          </span>
          <span>{label}</span>
        </motion.div>
        <span className="text-xs text-gray-400 font-normal">({min}-{max})</span>
      </label>
      <div className="relative">
        <motion.input
          type="number"
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          min={min}
          max={max}
          required={requiredFields.includes(name)}
          className={`w-full px-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 text-gray-700 bg-white/90 backdrop-blur-sm transition-all duration-200 ${
            validationErrors[name] 
              ? 'border-red-400 focus:ring-red-100 focus:border-red-500' 
              : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300'
          }`}
          whileFocus={{ scale: 1.03, boxShadow: '0 4px 12px rgba(59,130,246,.07)' }}
        />
        {['weak_foot', 'skill_moves'].includes(name) && (
          <motion.div
            className="absolute right-3 top-2.5 flex space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xs ${Number(formData[name as keyof typeof formData]) >= star ? 'text-yellow-500' : 'text-gray-200'}`}
              >
                ★
              </span>
            ))}
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {validationErrors[name] && (
          <motion.p 
            className="mt-1 text-xs text-red-500 flex items-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationErrors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
        initial={{ opacity: 0, scale: 0.95, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 32 }}
        transition={{ duration: 0.33, type: 'spring' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-blue-400 p-2 rounded-lg shadow-md mr-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <FaFutbol className="text-2xl text-white" />
              </motion.div>
              <motion.h2
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                Player Data Entry
              </motion.h2>
            </motion.div>
            <motion.button 
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.15, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="text-lg" />
            </motion.button>
          </div>

          <AnimatePresence>
            {formMessage && (
              <motion.div 
                className={`mb-6 p-4 rounded-lg flex items-center shadow-sm ${
                  formMessage.type === 'success' 
                    ? 'bg-green-50/90 text-green-800 border border-green-200' 
                    : 'bg-red-50/90 text-red-800 border border-red-200'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {formMessage.type === 'success' ? (
                  <div className="bg-green-100 p-1.5 rounded-full mr-3">
                    <FaCheck className="text-green-600 text-sm" />
                  </div>
                ) : (
                  <div className="bg-red-100 p-1.5 rounded-full mr-3">
                    <FaTimes className="text-red-600 text-sm" />
                  </div>
                )}
                <span className="font-medium">{formMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'personal', icon: <FaUser />, label: 'Personal' },
                { id: 'technical', icon: <GiSoccerBall />, label: 'Technical' },
                { id: 'physical', icon: <FaRunning />, label: 'Physical' },
                { id: 'mental', icon: <FaBrain />, label: 'Mental' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-4 py-2 rounded-xl flex items-center transition-all text-sm font-medium ${
                    activeSection === tab.id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {activeSection === 'personal' && (
                  <motion.div
                    key="personal"
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FaUser className="text-blue-600" />
                      </div>
                      <span>Personal Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInputField('age', 'Age', 70, 16)}
                      {renderInputField('height_cm', 'Height (cm)', 250, 150)}
                      {renderInputField('weight_kgs', 'Weight (kg)', 150, 50)}
                      
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <div className="bg-gray-100 p-1.5 rounded-lg mr-2">
                            <FaShoePrints className="text-gray-500" />
                          </div>
                          Preferred Foot
                        </label>
                        <select
                          name="preferred_foot_encoded"
                          value={formData.preferred_foot_encoded}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 text-gray-700 bg-white/90 backdrop-blur-sm focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        >
                          <option value="1">Right</option>
                          <option value="0">Left</option>
                        </select>
                      </motion.div>

                      {renderInputField('weak_foot', 'Weak Foot', 5, 1)}
                      {renderInputField('skill_moves', 'Skill Moves', 5, 1)}

                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 }}
                      >
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <div className="bg-gray-100 p-1.5 rounded-lg mr-2">
                            <FaRunning className="text-gray-500" />
                          </div>
                          Work Rate
                        </label>
                        <select
                          name="work_rate_encoded"
                          value={formData.work_rate_encoded}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 text-gray-700 bg-white/90 backdrop-blur-sm focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                        >
                          {workRateOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                {activeSection === 'technical' && (
                  <motion.div
                    key="technical"
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <GiSoccerBall className="text-blue-600" />
                      </div>
                      <span>Technical Skills</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInputField('crossing', 'Crossing')}
                      {renderInputField('finishing', 'Finishing')}
                      {renderInputField('heading_accuracy', 'Heading Accuracy')}
                      {renderInputField('short_passing', 'Short Passing')}
                      {renderInputField('volleys', 'Volleys')}
                      {renderInputField('dribbling', 'Dribbling')}
                      {renderInputField('curve', 'Curve')}
                      {renderInputField('freekick_accuracy', 'Free Kick Accuracy')}
                      {renderInputField('long_passing', 'Long Passing')}
                      {renderInputField('ball_control', 'Ball Control')}
                    </div>
                  </motion.div>
                )}
                {activeSection === 'physical' && (
                  <motion.div
                    key="physical"
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FaRunning className="text-blue-600" />
                      </div>
                      <span>Physical Attributes</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInputField('acceleration', 'Acceleration')}
                      {renderInputField('sprint_speed', 'Sprint Speed')}
                      {renderInputField('agility', 'Agility')}
                      {renderInputField('balance', 'Balance')}
                      {renderInputField('shot_power', 'Shot Power')}
                      {renderInputField('jumping', 'Jumping')}
                      {renderInputField('stamina', 'Stamina')}
                      {renderInputField('strength', 'Strength')}
                    </div>
                  </motion.div>
                )}
                {activeSection === 'mental' && (
                  <motion.div
                    key="mental"
                    className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <FaBrain className="text-blue-600" />
                      </div>
                      <span>Mental Attributes</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInputField('reactions', 'Reactions')}
                      {renderInputField('aggression', 'Aggression')}
                      {renderInputField('interceptions', 'Interceptions')}
                      {renderInputField('positioning', 'Positioning')}
                      {renderInputField('vision', 'Vision')}
                      {renderInputField('penalties', 'Penalties')}
                      {renderInputField('composure', 'Composure')}
                      {renderInputField('marking', 'Marking')}
                      {renderInputField('standing_tackle', 'Standing Tackle')}
                      {renderInputField('sliding_tackle', 'Sliding Tackle')}
                      {renderInputField('long_shots', 'Long Shots')}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end mt-8 space-x-3">
              <motion.button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center font-medium border border-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaTimes className="mr-2" />
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 transition-all flex items-center font-medium shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </motion.svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Predict & Save
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
        <style jsx global>{`
          .max-w-4xl.max-h-[90vh].overflow-y-auto::-webkit-scrollbar {
            width: 10px;
            background: transparent;
          }
          .max-w-4xl.max-h-[90vh].overflow-y-auto::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #3b82f6 30%, #60a5fa 100%);
            border-radius: 6px;
            border: 2px solid rgba(255, 255, 255, 0.8);
          }
          .max-w-4xl.max-h-[90vh].overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(226, 232, 240, 0.5);
            border-radius: 6px;
            margin: 4px;
          }
          .max-w-4xl.max-h-[90vh].overflow-y-auto {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #e2e8f0;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}