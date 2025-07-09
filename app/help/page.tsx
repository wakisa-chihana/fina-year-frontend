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
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const faqs = [
  {
    question: "How do I use the Football Formation Visualizer?",
    answer:
      "Select your preferred formation from the dropdown, and the best players for each role will be auto-assigned. Click on a player to view detailed stats and analytics.",
  },
  {
    question: "How can I change the goalkeeper?",
    answer:
      "Click the goalkeeper on the field to open the swap modal. Select your preferred goalkeeper from the list.",
  },
  {
    question: "What do the formations mean?",
    answer:
      "Formations like 4-3-3, 4-4-2 etc. represent the number of defenders, midfielders, and forwards. Each has unique strengths and weaknesses.",
  },
  {
    question: "Why does the page show a loading spinner?",
    answer:
      "Whenever a new formation is selected or data is being fetched, a loading animation appears to ensure the experience is smooth and uninterrupted.",
  },
  {
    question: "How do I get support or report a bug?",
    answer:
      "Fill out the contact form below, or email directly at wakisachihana422@gmail.com. You can also open issues on the GitHub repository.",
  },
];

const supportContacts = [
  {
    icon: <FiMail className="h-5 w-5 text-blue-600" />,
    label: 'Email',
    value: 'wakisachihana422@gmail.com',
    href: 'mailto:wakisachihana422@gmail.com',
  },
  {
    icon: <FiPhone className="h-5 w-5 text-blue-600" />,
    label: 'Phone',
    value: '+265 998 117 212',
    href: 'tel:+265998117212',
  },
  {
    icon: <FiMapPin className="h-5 w-5 text-blue-600" />,
    label: 'Location',
    value: 'Lilongwe, Malawi',
    href: 'https://maps.google.com/?q=Lilongwe, Malawi',
  },
];

const HelpSupportPage = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-black hover:text-blue-800 mb-8 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center mb-2">
            <FiHelpCircle className="w-10 h-10 text-blue-600 mr-2" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Help &amp; Support
            </h1>
          </div>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions, learn how to use features, or get in touch if you need assistance.
          </p>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
            <FiBookOpen className="mr-2" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-100 rounded-xl p-4"
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  aria-expanded={expanded === idx}
                >
                  <span className="text-lg font-semibold text-gray-900 flex-1">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 transition-transform duration-200 ${expanded === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-gray-700 text-base"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Support Contact Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-5 flex items-center">
            <FiUser className="mr-2" /> Need More Help?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {supportContacts.map((contact, idx) => (
              <a
                key={idx}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex flex-col items-center bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-3">{contact.icon}</div>
                <div className="font-semibold text-gray-800 mb-1">{contact.label}</div>
                <div className="text-gray-600 text-sm text-center break-all">{contact.value}</div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Quick Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="max-w-2xl mx-auto bg-blue-50 border border-blue-100 rounded-xl p-8 shadow"
        >
          <h2 className="text-2xl font-bold text-blue-700 mb-7 flex items-center">
            <FiMessageSquare className="mr-2" /> Quick Support Message
          </h2>
          <p className="text-gray-700 mb-4">
            For further assistance, please use our main <span className="text-blue-600 font-semibold">Contact</span> page, or send a quick message below.
          </p>
          <a
            href="/contact"
            className="inline-block mb-6 px-6 py-2 bg-black text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition"
          >
            Go to Contact Page
          </a>
          <SupportMiniForm />
        </motion.div>
      </div>
    </div>
  );
};

// Minimal support form for quick messages
const SupportMiniForm = () => {
  const [form, setForm] = useState({ email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const validateEmail = (email: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) {
      setError('Please fill in all fields.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    // Simulate submission
    setSent(true);
    setForm({ email: '', message: '' });
    setTimeout(() => setSent(false), 2500);
  };

  return sent ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
    >
      Message sent! We'll get back to you shortly.
    </motion.div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="mini-email" className="block text-sm font-medium text-dark mb-1">
          Your Email
        </label>
        <input
          id="mini-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-400 focus:border-blue-500"
          placeholder="your@email.com"
          required
        />
      </div>
      <div>
        <label htmlFor="mini-message" className="block text-sm font-medium text-dark mb-1">
          Message
        </label>
        <textarea
          id="mini-message"
          name="message"
          rows={3}
          value={form.message}
          onChange={handleChange}
          className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-black focus:border-blue-500"
          placeholder="How can we help you?"
          required
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-blue-400 transition"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default HelpSupportPage;