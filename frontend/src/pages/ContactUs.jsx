import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPhoneAlt, FaArrowLeft, FaPaperPlane, FaRobot, FaUserCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

import princeImg from '../assets/my img.jpeg'
import pragatiImg from '../assets/cat.jpeg'

const teamContacts = [
    {
        id: 1,
        name: "Prince Pandey",
        role: "Co-Founder & Backend / Full Stack Lead",
        phone: "+91 9508753740",
        image: princeImg
    },
    {
        id: 2,
        name: "Pragati Bansal",
        role: "Founder & Frontend / UI-UX Lead",
        phone: "+91 9000000001",
        image: pragatiImg
    },
    {
        id: 3,
        name: "Ragini Sahu",
        role: "Database Engineer",
        phone: "+91 9000000002",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ragini"
    },
    {
        id: 4,
        name: "Priyanshu Dhakre",
        role: "Product Operations",
        phone: "+91 9000000003",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Piyush"
    },
    {
        id: 5,
        name: "Parwati Saraswat",
        role: "Frontend Engineer",
        phone: "+91 9000000004",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parwati"
    }
]

// Mock AI Logic Mapping
const getAiResponse = (userInput) => {
    const text = userInput.toLowerCase()
    if (text.includes('status') || text.includes('track')) {
        return "You can track your order status live in the 'My Orders' section of your dashboard. Is there a specific order ID you need help with?"
    }
    if (text.includes('delay') || text.includes('late')) {
        return "I apologize for the delay. Sometimes traffic or restaurant preparation times cause slight delays. Please provide your order ID so I can investigate immediately."
    }
    if (text.includes('payment') || text.includes('pay') || text.includes('money')) {
        return "If you are facing payment issues, please try using a different payment method. If money was deducted but the order failed, the refund will automatically initiate within 24 hours."
    }
    if (text.includes('refund')) {
        return "Refunds typically process within 3-5 business days depending on your bank. Can you provide the associated order ID so I can check its refund status?"
    }
    if (text.includes('login') || text.includes('account')) {
        return "If you are having trouble logging in, please try resetting your password using the 'Forgot Password' link on the sign-in page."
    }
    if (text.includes('hello') || text.includes('hi')) {
        return "Hi there! How can I assist you with your Vingo experience today?"
    }
    
    return "Thank you for reaching out! A support ticket has been created, and our human agents will get back to you shortly. Meanwhile, could you elaborate on your issue?"
}

function ContactUs() {
    const navigate = useNavigate()
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hello! I'm Vingo Support AI. How can I help you today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const userMsg = { sender: 'user', text: inputValue, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setIsTyping(true)

        setTimeout(() => {
            const aiMsg = { sender: 'ai', text: getAiResponse(userMsg.text), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage()
    }

    return (
        <div className="min-h-screen bg-[#fff9f6] flex flex-col font-['Outfit'] pb-20">
            <Nav />
            
            {/* Page Header */}
            <div className="pt-32 pb-12 px-4 text-center relative max-w-5xl mx-auto w-full">
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute left-4 md:left-0 top-32 bg-white flex items-center justify-center w-10 h-10 rounded-full shadow-md text-gray-500 hover:text-[#ff4d2d] hover:shadow-lg transition-all"
                >
                    <FaArrowLeft />
                </button>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase"
                >
                    Contact Our <span className="text-[#ff4d2d]">Team</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 font-bold uppercase tracking-widest text-sm"
                >
                    We're here to help you anytime.
                </motion.p>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 flex flex-col gap-12">
                
                {/* SECTION 2: Team Contact Numbers (Grid) */}
                <section>
                    <h2 className="text-2xl font-black text-gray-900 mb-6 border-l-4 border-[#ff4d2d] pl-4 uppercase tracking-tighter">Direct Contacts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamContacts.map((contact, index) => (
                            <motion.div 
                                key={contact.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-5 group hover:border-[#ff4d2d]/30 transition-all hover:shadow-[0_8px_30px_rgba(255,77,45,0.08)]"
                            >
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#ff4d2d] transition-colors shrink-0">
                                    <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-gray-900 truncate">{contact.name}</h3>
                                    <p className="text-[10px] text-[#ff4d2d] font-bold uppercase tracking-widest truncate mb-2 leading-none">{contact.role}</p>
                                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-900 transition-colors">
                                        <FaPhoneAlt size={12} className="text-gray-300 group-hover:text-[#ff4d2d] transition-colors" />
                                        <span className="text-sm font-semibold tracking-wider">{contact.phone}</span>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} 
                                    className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                    title="Call Now"
                                >
                                    <FaPhoneAlt size={14} />
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3: AI Chat Support */}
                <section>
                    <h2 className="text-2xl font-black text-gray-900 mb-6 border-l-4 border-blue-500 pl-4 uppercase tracking-tighter">AI Support Chat</h2>
                    
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                        {/* Chat Header */}
                        <div className="h-16 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center px-6 gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm relative">
                                <FaRobot size={20} />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="text-white font-black leading-none">Vingo Support AI</h3>
                                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1">Online</p>
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 bg-gray-50/50 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
                            <AnimatePresence>
                                {messages.map((msg, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-[#ff4d2d] text-white' : 'bg-gray-900 text-white'}`}>
                                            {msg.sender === 'user' ? <FaUserCircle size={18} /> : <FaRobot size={16} />}
                                        </div>
                                        <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-4 rounded-2xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-[#ff4d2d] text-white rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'}`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider px-1">{msg.timestamp}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 self-start max-w-[85%]"
                                >
                                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                        <FaRobot size={16} />
                                    </div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[52px]">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Area */}
                        <div className="h-20 bg-white border-t border-gray-100 p-4 flex items-center gap-3">
                            <input 
                                type="text"
                                placeholder="Type your issue here (e.g. refund, order delay)..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#ff4d2d] focus:bg-white transition-all shadow-inner"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isTyping}
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isTyping}
                                className="w-12 h-12 bg-gradient-to-r from-[#ff4d2d] to-[#ff7d2d] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg disabled:opacity-50 hover:scale-105 transition-all"
                            >
                                <FaPaperPlane size={14} className="ml-[-2px]" />
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}

export default ContactUs
