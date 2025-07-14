"use client";

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMail, FiPhone, FiUser, FiMessageSquare, FiMapPin, FiClock, FiLinkedin, FiGithub, FiArrowLeft, FiStar, FiCode, FiBook } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Memoized constants to prevent re-creation on every render
const SOCIALS = [
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/wakisa-chihana/',
    icon: FiLinkedin,
  },
  {
    label: 'GitHub',
    url: 'https://github.com/wakisa-chihana',
    icon: FiGithub,
  },
] as const;

const LOCATION = {
  address: 'Lilongwe, Malawi',
  mapUrl: 'https://maps.google.com/?q=Lilongwe, Malawi',
} as const;

// Animation variants - defined once to avoid recreation
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
};

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

// Enhanced team member component with better design
const TeamMember = memo(({ 
  name, 
  role, 
  description, 
  email, 
  phone, 
  imageSrc, 
  accentColor = 'blue',
  skills = [],
  delay = 0 
}: {
  name: string;
  role: string;
  description: string;
  email: string;
  phone?: string;
  imageSrc: string;
  accentColor?: 'blue' | 'green' | 'purple' | 'orange';
  skills?: string[];
  delay?: number;
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          ring: 'ring-blue-50',
          text: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          gradient: 'from-blue-600 to-blue-700',
          hover: 'hover:from-blue-700 hover:to-blue-800'
        };
      case 'green':
        return {
          ring: 'ring-green-50',
          text: 'text-green-700',
          bg: 'bg-green-50',
          border: 'border-green-200',
          gradient: 'from-green-600 to-green-700',
          hover: 'hover:from-green-700 hover:to-green-800'
        };
      case 'purple':
        return {
          ring: 'ring-purple-50',
          text: 'text-purple-700',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          gradient: 'from-purple-600 to-purple-700',
          hover: 'hover:from-purple-700 hover:to-purple-800'
        };
      case 'orange':
        return {
          ring: 'ring-orange-50',
          text: 'text-orange-700',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          gradient: 'from-orange-600 to-orange-700',
          hover: 'hover:from-orange-700 hover:to-orange-800'
        };
      default:
        return {
          ring: 'ring-gray-50',
          text: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          gradient: 'from-gray-600 to-gray-700',
          hover: 'hover:from-gray-700 hover:to-gray-800'
        };
    }
  };

  const colors = getColorClasses(accentColor);

  return (
    <motion.div
      initial={scaleIn.initial}
      animate={scaleIn.animate}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 120 }}
      className="text-center"
    >
      {/* Professional image container */}
      <div className="relative mx-auto mb-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="relative w-24 h-24 mx-auto"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 shadow-lg">
            <Image
              src={imageSrc}
              alt={name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
              quality={95}
            />
          </div>
          
          {/* Status indicator */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Name and role */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border mb-3`}>
        <span>{role}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact information */}
      <div className="space-y-2">
        <motion.a
          href={`mailto:${email}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-800 text-sm"
        >
          <FiMail className="w-4 h-4 mr-2" />
          <span className="truncate">{email}</span>
        </motion.a>
        
        {phone && (
          <motion.a
            href={`tel:${phone}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 text-sm"
          >
            <FiPhone className="w-4 h-4 mr-2" />
            <span>{phone}</span>
          </motion.a>
        )}
      </div>
    </motion.div>
  );
});

TeamMember.displayName = 'TeamMember';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Memoized handlers to prevent recreation on every render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  }, []);

  const validateEmail = useCallback((email: string) => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill out all required fields.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please provide a valid email address.');
      return;
    }
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  }, [formData, validateEmail]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Professional background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Professional Back Button */}
          <motion.button
            initial={fadeInLeft.initial}
            animate={fadeInLeft.animate}
            transition={{ duration: 0.5 }}
            onClick={handleBack}
            className="group inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-all duration-200 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>

          {/* Professional Header */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-xl mb-6 shadow-lg">
              <FiMail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Contact Our Team
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get in touch with our development team for support, inquiries, or collaboration opportunities.
            </p>
          </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Professional Team Section */}
          <motion.div
            initial={fadeInLeft.initial}
            animate={fadeInLeft.animate}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiStar className="w-5 h-5 mr-2 text-gray-600" />
                  Development Team
                </h2>
              </div>
              
              <div className="p-6 space-y-8">
                <TeamMember
                  name="Wakisa Chihana"
                  role="Lead Developer & Data Scientist"
                  description="Specializes in machine learning algorithms and full-stack development for sports analytics systems."
                  email="wakisachihana422@gmail.com"
                  phone="+265 998 117 212"
                  imageSrc="/wakisa.jpg"
                  accentColor="blue"
                  skills={["Machine Learning", "Full Stack", "Data Science", "Python", "React"]}
                  delay={0.3}
                />

                <div className="border-t border-gray-200 pt-8">
                  <TeamMember
                    name="Aureen Blessing Harazie"
                    role="Co-Developer & UI/UX Designer"
                    description="Focuses on creating intuitive user experiences and responsive frontend solutions."
                    email="aureenblessingharazie@gmail.com"
                    imageSrc="/aureen.jpg"
                    accentColor="green"
                    skills={["UI/UX Design", "Frontend", "React", "Tailwind CSS", "Figma"]}
                    delay={0.4}
                  />
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiMapPin className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <a
                          href={LOCATION.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {LOCATION.address}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiClock className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Business Hours</p>
                        <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                        <p className="text-sm text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-6">
                    {SOCIALS.map((social) => {
                      const IconComponent = social.icon;
                      return (
                        <motion.a
                          key={social.label}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Contact Form */}
          <motion.div
            initial={fadeInRight.initial}
            animate={fadeInRight.animate}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Available now</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="text-center py-12"
                  >
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <FiMessageSquare className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="message"
                          id="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all resize-none"
                          placeholder="Tell us about your project, questions, or how we can help..."
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
                      >
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-4 sm:mb-0 flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        Response within 24 hours
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 font-medium"
                      >
                        Send Message
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Bottom CTA Section */}
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-12 rounded-3xl shadow-2xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <FiCode className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Experience the power of AI-driven football team management. Let&apos;s build something amazing together 
                and transform how you analyze and optimize your team&apos;s performance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.a
                  href="/help"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  <FiBook className="w-5 h-5 inline mr-2" />
                  View Documentation
                </motion.a>
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-blue-800 text-white rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl border-2 border-blue-700"
                >
                  <FiCode className="w-5 h-5 inline mr-2" />
                  Go to Dashboard
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;