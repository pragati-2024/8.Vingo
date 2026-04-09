import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCode, FaUsers, FaChartLine, FaUtensils, FaTruck, FaSmile, FaLayerGroup, FaDatabase, FaPalette, FaRocket, FaCogs, FaCheckCircle, FaInstagram, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'
import { MdOutlineFastfood, MdSettingsSuggest, MdDeliveryDining } from 'react-icons/md'
import { RxCross2 } from "react-icons/rx"
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import princeImg from '../assets/my img.jpeg'
import pragatiImg from '../assets/cat.jpeg'

const teams = [
    {
        id: 1,
        title: "Tech Team",
        
        description: "The backbone of Vingo. Responsible for frontend, backend, database, and system performance.",
        icon: <FaCode className="text-2xl text-orange-500" />
    },
    {
        id: 2,
        title: "UI/UX Design Team",
        description: "Focuses on creating a smooth, modern, and user-friendly experience across the platform.",
        icon: <FaPalette className="text-2xl text-blue-500" />
    },
    {
        id: 3,
        title: "Backend & Database Team",
        description: "Handles APIs, authentication, data management, and server-side logic.",
        icon: <FaDatabase className="text-2xl text-green-500" />
    },
    {
        id: 4,
        title: "Operations Team",
        description: "Manages order flow, restaurant coordination, and logistics in real-time.",
        icon: <FaCogs className="text-2xl text-purple-500" />
    },
    {
        id: 5,
        title: "Delivery Team",
        description: "Ensures fast and reliable delivery from restaurants to customers.",
        icon: <FaTruck className="text-2xl text-red-500" />
    },
    {
        id: 6,
        title: "Marketing & Growth Team",
        description: "Drives branding, user acquisition, and engagement through campaigns.",
        icon: <FaChartLine className="text-2xl text-indigo-500" />
    }
]

const genericBio = "A dedicated and motivated professional contributing to the development and success of the Vingo platform. Focused on innovation, teamwork, and delivering high-quality solutions."
const genericReasons = "Projects are designed to improve efficiency, enhance user experience, and solve real-world challenges using technology and creative problem-solving."
const genericWhy = "Vingo was selected as a platform to build a reliable and scalable system that connects customers and service providers efficiently."
const genericAbout = "Vingo is a technology-driven platform focused on simplifying delivery services, improving operational efficiency, and providing seamless user experiences."
const genericContact = {
    email: "example@email.com",
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/in/",
    github: "https://github.com/"
}

const founders = [
    {
        id: 1,
        name: "Prince Pandey",
        role: "Co-Founder & Backend / Full Stack Lead",
        image: princeImg,
        bio: "Prince Pandey is a passionate Full Stack Developer specializing in backend architecture, API development, and scalable web applications. He has strong experience in Node.js, Express, MongoDB, and modern frontend frameworks. Prince focuses on building efficient systems that solve real-world problems and improve user experience. He leads the technical development of the Vingo platform and ensures system reliability, performance, and security.",
        reasons: "The main motivation behind each project was to solve real-life problems using technology. Projects were designed to improve delivery efficiency, automate workflows, and create user-friendly digital platforms. The goal was to gain practical experience while building solutions that could scale in real-world environments.",
        whyVingo: "We chose to build Vingo because the delivery and service industry requires faster, smarter, and more reliable platforms. Vingo was created to connect customers, vendors, and delivery partners in one unified system. The vision was to simplify logistics, improve tracking, and provide better earning opportunities for delivery partners.",
        aboutVingo: "Vingo is a modern delivery and service management platform designed to connect users with vendors and delivery partners in real time. It focuses on fast order processing, route optimization, and efficient communication between stakeholders. The platform aims to improve delivery speed, reduce operational costs, and enhance customer satisfaction through technology-driven solutions.",
        contact: {
            email: "princepandey@example.com",
            instagram: "https://instagram.com/princepandey",
            linkedin: "https://linkedin.com/in/princepandey",
            github: "https://github.com/princepandey"
        }
    },
    {
        id: 2,
        name: "Pragati Bansal",
        role: "Founder & Frontend / UI-UX Lead",
        image: pragatiImg,
        bio: genericBio,
        reasons: genericReasons,
        whyVingo: genericWhy,
        aboutVingo: genericAbout,
        contact: genericContact
    },
    {
        id: 3,
        name: "Ragini Sahu",
        role: "Database Engineer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ragini",
        bio: genericBio,
        reasons: genericReasons,
        whyVingo: genericWhy,
        aboutVingo: genericAbout,
        contact: genericContact
    },
    {
        id: 4,
        name: "Priyanshu Dhakre",
        role: "Product Operations",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Piyush",
        bio: genericBio,
        reasons: genericReasons,
        whyVingo: genericWhy,
        aboutVingo: genericAbout,
        contact: genericContact
    },
    {
        id: 5,
        name: "Parwati Saraswat",
        role: "Frontend Engineer",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parwati",
        bio: genericBio,
        reasons: genericReasons,
        whyVingo: genericWhy,
        aboutVingo: genericAbout,
        contact: genericContact
    }
]

function AboutUs() {
    const navigate = useNavigate();
    const [selectedMember, setSelectedMember] = useState(null);

    return (
        <div className="min-h-screen bg-[#fff9f6] overflow-x-hidden">
            <Nav />
            
            {/* SECTION 1: HERO */}
            <div className="pt-32 pb-20 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
                        About <span className="text-[#ff4d2d]">Vingo</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-gray-600 mb-8 uppercase tracking-[0.2em]">
                        Delivering happiness at your doorstep
                    </p>
                    <div className="w-20 h-1.5 bg-[#ff4d2d] mx-auto rounded-full mb-10"></div>
                    <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-medium">
                        Vingo is a modern food delivery platform built to simplify the way people order food. 
                        Our goal is to create a seamless connection between users, restaurants, and delivery 
                        partners through a fast, reliable, and efficient system.
                    </p>
                </motion.div>
            </div>

            {/* NEW SECTION: HOW VINGO WORKS */}
            <div className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">How Vingo Works</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Real-time coordination across three core portals</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-[#fff9f6] p-8 rounded-[2.5rem] border border-orange-50 relative">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 text-[#ff4d2d]">
                                <FaUsers size={20} />
                            </div>
                            <h3 className="text-xl font-black mb-3">User Portal</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Explore restaurants, browse menus, place orders, make secure payments, and track orders live.</p>
                        </div>
                        <div className="bg-[#fff9f6] p-8 rounded-[2.5rem] border border-orange-50 relative">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 text-blue-500">
                                <FaLayerGroup size={20} />
                            </div>
                            <h3 className="text-xl font-black mb-3">Restaurant Portal</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Restaurants receive orders, prepare meals, and update status to ensure smooth operations.</p>
                        </div>
                        <div className="bg-[#fff9f6] p-8 rounded-[2.5rem] border border-orange-50 relative">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6 text-green-500">
                                <MdDeliveryDining size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-3">Delivery Portal</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Partners receive assigned orders, pick them up, and deliver them quickly to customers.</p>
                        </div>
                    </div>

                    {/* Workflow Visualization */}
                    <div className="bg-gray-900 p-8 md:p-12 rounded-[3rem] text-center text-white shadow-2xl">
                        <h3 className="text-2xl font-black mb-10 uppercase tracking-widest">Complete Workflow</h3>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-[#ff4d2d]">
                                    <MdOutlineFastfood size={24} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest">Place Order</p>
                            </div>
                            <div className="hidden md:block w-12 h-0.5 bg-white/20"></div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-blue-400">
                                    <MdSettingsSuggest size={24} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest">Prepare Food</p>
                            </div>
                            <div className="hidden md:block w-12 h-0.5 bg-white/20"></div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-green-400">
                                    <MdDeliveryDining size={24} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest">Pick Up</p>
                            </div>
                            <div className="hidden md:block w-12 h-0.5 bg-white/20"></div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-[#ff4d2d] rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <FaCheckCircle size={20} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest">Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: WHY VINGO STANDS OUT */}
            <div className="py-20 bg-[#fff9f6]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Why Vingo Stands Out</h2>
                        <div className="w-16 h-1 bg-[#ff4d2d] mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 rounded-[2rem] bg-white text-center border border-orange-50 shadow-sm"
                        >
                            <div className="w-14 h-14 bg-[#fff9f6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FaTruck className="text-xl text-[#ff4d2d]" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Fast & Reliable</h3>
                            <p className="text-gray-500 text-xs font-medium">Optimized delivery system for speed.</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 rounded-[2rem] bg-white text-center border border-orange-50 shadow-sm"
                        >
                            <div className="w-14 h-14 bg-[#fff9f6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FaChartLine className="text-xl text-blue-500" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Real-time Tracking</h3>
                            <p className="text-gray-500 text-xs font-medium">Know exactly where your food is.</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 rounded-[2rem] bg-white text-center border border-orange-50 shadow-sm"
                        >
                            <div className="w-14 h-14 bg-[#fff9f6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FaSmile className="text-xl text-green-500" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">User-Friendly</h3>
                            <p className="text-gray-500 text-xs font-medium">Smooth experience for everyone.</p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="p-8 rounded-[2rem] bg-white text-center border border-orange-50 shadow-sm"
                        >
                            <div className="w-14 h-14 bg-[#fff9f6] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FaLayerGroup className="text-xl text-purple-500" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Coordinated Portals</h3>
                            <p className="text-gray-500 text-xs font-medium">Seamless interaction between apps.</p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* NEW SECTION: OUR VISION */}
            <div className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-[#ff4d2d]">
                        <FaRocket size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 uppercase tracking-tight">Our Vision</h2>
                    <p className="text-lg text-gray-500 leading-relaxed font-medium">
                        We aim to revolutionize food delivery by building a platform that is not only fast and efficient 
                        but also scalable and user-centric. Vingo is built to grow and adapt, always keeping 
                        the quality of service at its core.
                    </p>
                </div>
            </div>

            {/* SECTION 3: OUR TEAMS */}
            <div className="py-24 px-4 bg-[#fff9f6]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-widest">Our Teams</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-sm">Our strength lies in collaboration and seamless coordination across all teams.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {teams.map((team) => (
                            <motion.div
                                key={team.id}
                                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(255,77,45,0.08)" }}
                                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group transition-all"
                            >
                                <div className="mb-6 w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#fff9f6] transition-colors">
                                    {team.icon}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-4">{team.title}</h3>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed">{team.description}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-20 text-center">
                        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                            Together, these teams power Vingo to deliver a fast, reliable, and delightful food experience.
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 4: FOUNDERS */}
            <div className="py-16 bg-gray-900 text-white rounded-t-[4rem] md:rounded-t-[6rem]">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-widest">Our Team</h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Passionate developers and innovators behind Vingo.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {founders.map((founder) => (
                            <motion.div
                                key={founder.id}
                                whileHover={{ y: -10 }}
                                onClick={() => setSelectedMember(founder)}
                                className="bg-gray-800/50 cursor-pointer backdrop-blur-xl p-6 rounded-[2.5rem] border border-gray-700/50 text-center hover:shadow-[0_20px_50px_rgba(255,77,45,0.1)] hover:border-[#ff4d2d]/30 transition-all group"
                            >
                                <div className="relative mb-5">
                                    <div className="w-28 h-28 rounded-full mx-auto border-4 border-[#ff4d2d] overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                        <img src={founder.image} alt={founder.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute bottom-0 right-1/2 translate-x-10 translate-y-2 w-6 h-6 bg-[#ff4d2d] rounded-full flex items-center justify-center shadow-lg">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                    </div>
                                </div>
                                <h4 className="text-lg font-black mb-1.5 truncate px-1">{founder.name}</h4>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
                                    {founder.role}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* TEAM MEMBER PROFILE MODAL */}
            <AnimatePresence>
                {selectedMember && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex flex-col justify-end md:justify-center items-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
                        onClick={() => setSelectedMember(null)}
                    >
                        <motion.div 
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-4xl h-[90vh] md:h-[85vh] rounded-t-[2.5rem] md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative"
                        >
                            {/* Modal Header / Cover */}
                            <div className="h-32 md:h-48 bg-gradient-to-r from-gray-900 to-gray-800 relative pl-8 md:pl-48">
                                <button 
                                    onClick={() => setSelectedMember(null)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all z-20"
                                >
                                    <RxCross2 size={24} />
                                </button>
                                
                                {/* Floating Avatar */}
                                <div className="absolute -bottom-16 left-8 w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-8 border-white overflow-hidden shadow-2xl bg-white">
                                    <img src={selectedMember.image} className="w-full h-full object-cover" alt={selectedMember.name} />
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto pt-20 px-8 pb-12 custom-scrollbar">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">{selectedMember.name}</h2>
                                        <p className="text-[#ff4d2d] font-bold uppercase tracking-widest text-sm">{selectedMember.role}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={selectedMember.contact.email} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-[#ff4d2d] hover:text-white transition-all"><FaEnvelope size={18} /></a>
                                        <a href={selectedMember.contact.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><FaLinkedin size={18} /></a>
                                        <a href={selectedMember.contact.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all"><FaGithub size={18} /></a>
                                        <a href={selectedMember.contact.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all"><FaInstagram size={18} /></a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#ff4d2d]"></span>
                                            Professional Summary
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed font-medium text-sm">{selectedMember.bio}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            Goals & Motivation
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed font-medium text-sm">{selectedMember.reasons}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Why We Chose Vingo
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed font-medium text-sm">{selectedMember.whyVingo}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                            About Vingo
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed font-medium text-sm">{selectedMember.aboutVingo}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CALL TO ACTION: CONTACT US */}
            <div className="w-full bg-gray-900 pb-20 pt-8 flex justify-center">
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255, 77, 45, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contact')}
                    className="bg-gradient-to-r from-[#ff4d2d] to-[#ff7d2d] text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-xl flex items-center gap-3 transition-all"
                >
                    Contact Us
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </motion.button>
            </div>

        </div>
    )
}

export default AboutUs
