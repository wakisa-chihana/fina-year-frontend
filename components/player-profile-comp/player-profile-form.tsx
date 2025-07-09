'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
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
  { value: '4.0', label: 'High / High' },
  { value: '3.5', label: 'High / Medium' },
  { value: '3.0', label: 'High / Low' },
  { value: '2.5', label: 'Medium / Medium' },
  { value: '2.0', label: 'Medium / Low' },
  { value: '1.5', label: 'Low / Medium' },
  { value: '1.0', label: 'Low / Low' },
];

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
    work_rate_encoded: '3.0'
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
    if (value === '' || name === 'work_rate_encoded') return '';
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
      // Convert all fields to numbers before sending
      const numericData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, Number(value)])
      );
      // --- Prediction API call ---
      const predictionResponse = await fetch(`${baseUrl}/predict_rating/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: Number(playerId),
          features: { ...numericData }
        })
      });
      if (!predictionResponse.ok) {
        const errorData = await predictionResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `Prediction failed with status ${predictionResponse.status}`);
      }
      const predictionResult = await predictionResponse.json();
      const predictedRating = predictionResult.predicted_rating || 0;
      // --- Update API call ---
      const updateResponse = await fetch(`${baseUrl}/player_profile/update_profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...numericData,
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
      className="mb-4 relative text-gray-600 text-opacity-60"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-medium text-gray-800 mb-1 items-center">
        {skillIcons[name] || <FaChartLine className="text-gray-500 mr-2" />}
        <span className="ml-2">{label}</span>
        <span className="ml-auto text-xs text-gray-600">({min}-{max})</span>
      </label>
      <div className="relative">
        <input
          type="number"
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          min={min}
          max={max}
          required={requiredFields.includes(name)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-600 focus:ring-[#28809A] focus:border-[#28809A] ${
            validationErrors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {['weak_foot', 'skill_moves'].includes(name) && (
          <div className="absolute right-3 top-2 flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xs ${Number(formData[name as keyof typeof formData]) >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>
      {validationErrors[name] && (
        <motion.p 
          className="mt-1 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {validationErrors[name]}
        </motion.p>
      )}
    </motion.div>
  );

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-6">
        <FaFutbol className="text-3xl text-[#28809A] mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Player Data Entry</h2>
      </div>

      {formMessage && (
        <motion.div 
          className={`mb-6 p-4 rounded flex items-center ${
            formMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {formMessage.type === 'success' ? (
            <FaCheck className="mr-2 text-green-600" />
          ) : (
            <FaTimes className="mr-2 text-red-600" />
          )}
          {formMessage.text}
        </motion.div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveSection('personal')}
            className={`px-4 py-2 rounded-full flex items-center transition-colors ${
              activeSection === 'personal' 
                ? 'bg-[#28809A] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaUser className="mr-2" />
            Personal
          </button>
          <button
            onClick={() => setActiveSection('technical')}
            className={`px-4 py-2 rounded-full flex items-center transition-colors ${
              activeSection === 'technical' 
                ? 'bg-[#28809A] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <GiSoccerBall className="mr-2" />
            Technical
          </button>
          <button
            onClick={() => setActiveSection('physical')}
            className={`px-4 py-2 rounded-full flex items-center transition-colors ${
              activeSection === 'physical' 
                ? 'bg-[#28809A] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaRunning className="mr-2" />
            Physical
          </button>
          <button
            onClick={() => setActiveSection('mental')}
            className={`px-4 py-2 rounded-full flex items-center transition-colors ${
              activeSection === 'mental' 
                ? 'bg-[#28809A] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaBrain className="mr-2" />
            Mental
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <motion.div 
            className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 ${activeSection !== 'personal' ? 'hidden' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2 flex items-center">
              <FaUser className="mr-2 text-[#28809A]" />
              Personal Information
            </h3>
            {renderInputField('age', 'Age', 70, 16)}
            {renderInputField('height_cm', 'Height (cm)', 250, 150)}
            {renderInputField('weight_kgs', 'Weight (kg)', 150, 50)}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1 items-center">
                <FaShoePrints className="text-gray-500 mr-2" />
                Preferred Foot
              </label>
              <select
                name="preferred_foot_encoded"
                value={formData.preferred_foot_encoded}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-800 focus:ring-[#28809A] focus:border-[#28809A]"
              >
                <option value="1">Right</option>
                <option value="0">Left</option>
              </select>
            </div>

            {renderInputField('weak_foot', 'Weak Foot', 5, 1)}
            {renderInputField('skill_moves', 'Skill Moves', 5, 1)}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1 items-center">
                <FaRunning className="text-gray-500 mr-2" />
                Work Rate
              </label>
              <select
                name="work_rate_encoded"
                value={formData.work_rate_encoded}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-800 focus:ring-[#28809A] focus:border-[#28809A]"
              >
                {workRateOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.div 
            className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 ${activeSection !== 'technical' ? 'hidden' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2 flex items-center">
              <GiSoccerBall className="mr-2 text-[#28809A]" />
              Technical Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <motion.div 
            className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 ${activeSection !== 'physical' ? 'hidden' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2 flex items-center">
              <FaRunning className="mr-2 text-[#28809A]" />
              Physical Attributes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <motion.div 
            className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 ${activeSection !== 'mental' ? 'hidden' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2 flex items-center">
              <FaBrain className="mr-2 text-[#28809A]" />
              Mental Attributes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <motion.button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTimes className="mr-2" />
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#28809A] text-white rounded-md hover:bg-[#1c6b82] disabled:opacity-50 transition-colors flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className=" -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              </span>
            ) : (
              <>
                <FaCheck className="mr-2" />
                predict & save
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}