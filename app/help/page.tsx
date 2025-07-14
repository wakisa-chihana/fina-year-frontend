"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiHelpCircle,
  FiBookOpen,
  FiMail,
  FiPhone,
  FiUser,
  FiMessageSquare,
  FiMapPin,
  FiClock,
  FiArrowLeft,
  FiPlay,
  FiUsers,
  FiBarChart,
  FiSettings,
  FiTarget,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiSearch,
  FiEdit3,
  FiPlusCircle,
  FiCheckCircle,
  FiActivity,
  FiStar,
  FiMonitor,
  FiSmartphone,
  FiTablet
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const systemFeatures = [
  {
    icon: <FiUsers className="w-6 h-6" />,
    title: "Team Management",
    description: "Add, edit, and manage your team players with comprehensive profile data including stats, positions, and performance metrics.",
    steps: [
      "Navigate to Dashboard",
      "Click 'Add Player' to register new team members",
      "Fill in player details: name, position, physical stats",
      "Set player attributes and skills",
      "Save and view player in team roster"
    ]
  },
  {
    icon: <FiTarget className="w-6 h-6" />,
    title: "Formation Builder",
    description: "Create and visualize different tactical formations with AI-powered automatic player positioning based on their ML-generated ratings and position compatibility.",
    steps: [
      "Go to Team Formation page",
      "Select formation type (4-3-3, 4-4-2, 3-5-2, etc.)",
      "AI system auto-assigns best players to positions",
      "Click on any position to swap players",
      "Save formation for future use"
    ]
  },
  {
    icon: <FiBarChart className="w-6 h-6" />,
    title: "Performance Analytics",
    description: "Track player performance over time with detailed charts, statistics, and comparative analysis tools.",
    steps: [
      "Access Player Profile page",
      "View performance history charts",
      "Compare player stats across categories",
      "Monitor improvement trends",
      "Export performance reports"
    ]
  },
  {
    icon: <FiActivity className="w-6 h-6" />,
    title: "Player Profiles",
    description: "Detailed individual player pages with comprehensive stats, radar charts, and performance tracking.",
    steps: [
      "Click on any player card",
      "View detailed statistics breakdown",
      "Check physical, technical, and mental attributes",
      "Review performance history",
      "Edit player information as needed"
    ]
  },
  {
    icon: <FiZap className="w-6 h-6" />,
    title: "AI-Powered Ratings",
    description: "Advanced machine learning model trained on professional player data to generate accurate ratings and performance predictions.",
    steps: [
      "System automatically calculates player ratings",
      "ML model analyzes all player attributes",
      "Generates overall performance scores",
      "Provides position-specific ratings",
      "Updates ratings based on performance data"
    ]
  }
];

const quickGuide = [
  {
    step: "1",
    title: "Get Started",
    description: "Sign up and create your coach account to access the dashboard",
    icon: <FiPlay className="w-5 h-5" />
  },
  {
    step: "2",
    title: "Add Players",
    description: "Register your team members with their positions and basic info",
    icon: <FiPlusCircle className="w-5 h-5" />
  },
  {
    step: "3",
    title: "Build Formation",
    description: "Use the formation builder to create your tactical setup",
    icon: <FiTarget className="w-5 h-5" />
  },
  {
    step: "4",
    title: "Monitor Performance",
    description: "Track player progress and team analytics over time",
    icon: <FiTrendingUp className="w-5 h-5" />
  }
];

const faqs = [
  {
    question: "How do I add a new player to my team?",
    answer: "Go to the Dashboard, click the 'Add Player' button, fill in the player's information including name, position, age, and stats. The system will automatically calculate their overall rating based on the attributes you provide."
  },
  {
    question: "Can I change formations after creating them?",
    answer: "Yes, you can modify formations at any time. Go to Team Formation, select a different formation type, and the system will automatically reassign players based on their positions and ratings."
  },
  {
    question: "How are player ratings calculated?",
    answer: "Player ratings are calculated using an advanced machine learning model trained on extensive player data. The AI model analyzes physical attributes (speed, strength, stamina), technical skills (passing, shooting, dribbling), and mental attributes (positioning, vision, composure) to generate accurate overall ratings that reflect real-world player performance patterns."
  },
  {
    question: "What makes the AI rating system accurate?",
    answer: "Our machine learning model has been trained on thousands of professional player profiles and performance data. The AI continuously learns from player statistics, match performance, and attribute correlations to provide highly accurate ratings that mirror real-world football analytics used by professional clubs."
  },
  {
    question: "Can I export player or team data?",
    answer: "Currently, you can view and print player profiles and performance charts. Data export features are planned for future updates."
  },
  {
    question: "Is the system mobile-friendly?",
    answer: "Yes, the entire platform is fully responsive and optimized for mobile devices, tablets, and desktop computers."
  },
  {
    question: "How do I track player improvement over time?",
    answer: "Each player profile includes performance history charts that show rating changes over time. You can update player stats regularly to track their development. The AI model will automatically recalculate ratings based on the new data, providing insights into player progress and potential."
  },
  {
    question: "Can the AI predict player potential?",
    answer: "Yes, our machine learning model not only calculates current ratings but also analyzes player development patterns to predict future performance potential. This helps coaches make informed decisions about player development and strategic planning."
  }
];

const systemRequirements = [
  {
    icon: <FiMonitor className="w-5 h-5 text-blue-600" />,
    category: "Desktop",
    requirements: "Modern browser (Chrome, Firefox, Safari, Edge), 1024x768 minimum resolution"
  },
  {
    icon: <FiTablet className="w-5 h-5 text-green-600" />,
    category: "Tablet",
    requirements: "iOS 12+ or Android 7+, responsive design optimized for touch"
  },
  {
    icon: <FiSmartphone className="w-5 h-5 text-purple-600" />,
    category: "Mobile",
    requirements: "iOS 12+ or Android 7+, mobile-optimized interface"
  }
];

const supportContacts = [
  {
    icon: <FiMail className="h-5 w-5 text-blue-600" />,
    label: 'Email Support',
    value: 'wakisachihana422@gmail.com',
    href: 'mailto:wakisachihana422@gmail.com',
    description: 'Get help via email within 24 hours'
  },
  {
    icon: <FiPhone className="h-5 w-5 text-green-600" />,
    label: 'Phone Support',
    value: '+265 998 117 212',
    href: 'tel:+265998117212',
    description: 'Direct phone support available'
  },
  {
    icon: <FiMapPin className="h-5 w-5 text-purple-600" />,
    label: 'Location',
    value: 'Lilongwe, Malawi',
    href: 'https://maps.google.com/?q=Lilongwe, Malawi',
    description: 'Based in Lilongwe, Malawi'
  }
];

const HelpSupportPage = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiHelpCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Help Center
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete guide to using the AI-powered Football Team Management System. Learn how to manage players, create formations, track performance, and leverage machine learning insights for optimal team strategy.
          </p>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Start Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickGuide.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                    {item.step}
                  </div>
                  <div className="text-blue-600">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            System Features
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {systemFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                onClick={() => setActiveFeature(activeFeature === idx ? null : idx)}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                {activeFeature === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-4"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">How to use:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {feature.steps.map((step, stepIdx) => (
                        <li key={stepIdx}>{step}</li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * idx }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  aria-expanded={expanded === idx}
                >
                  <span className="text-lg font-semibold text-gray-900 flex-1 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: expanded === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            System Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemRequirements.map((req, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {req.icon}
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">
                    {req.category}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {req.requirements}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Need Additional Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {supportContacts.map((contact, idx) => (
              <motion.a
                key={idx}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-center group"
              >
                <div className="mb-4 flex justify-center">
                  {contact.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {contact.label}
                </h3>
                <p className="text-gray-900 font-medium mb-2">
                  {contact.value}
                </p>
                <p className="text-gray-600 text-sm">
                  {contact.description}
                </p>
              </motion.a>
            ))}
          </div>
          
          <div className="text-center">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
            >
              <FiMessageSquare className="mr-2" />
              Visit Full Contact Page
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpSupportPage;