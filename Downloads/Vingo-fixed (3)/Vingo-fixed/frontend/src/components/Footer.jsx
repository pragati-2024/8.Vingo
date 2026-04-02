import React from 'react'
import { motion } from 'framer-motion'
import { FaInstagram, FaFacebookF, FaTwitter, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function Footer() {
    const navigate = useNavigate()

    const socialIcons = [
        { Icon: FaInstagram, link: "#", color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
        { Icon: FaFacebookF, link: "#", color: "hover:bg-[#1877F2]" },
        { Icon: FaTwitter, link: "#", color: "hover:bg-[#1DA1F2]" }
    ]

    const quickLinks = [
        { name: "Home", path: "/" },
        { name: "Orders", path: "/my-orders" },
        { name: "Cart", path: "/cart" },
        { name: "About Us", path: "/about" }
    ]

    return (
        <footer className='w-full bg-[#1a1a18] text-gray-300 pt-10 pb-6 px-4'>
            <div className='max-w-6xl mx-auto'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10'>
                    {/* Brand Section */}
                    <div className='space-y-4'>
                        <h2 className='text-3xl font-black text-white'>Vingo</h2>
                        <p className='text-xs leading-relaxed text-gray-400'>
                            Delivering happiness at your doorstep 🍔. Experience the best food from top-rated restaurants in your city with ultra-fast delivery.
                        </p>
                        <div className='flex gap-4'>
                            {socialIcons.map(({ Icon, link, color }, index) => (
                                <motion.a 
                                    key={index}
                                    href={link}
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className={`w-9 h-9 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 ${color} hover:text-white`}
                                >
                                    <Icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-base font-bold text-white mb-4 border-b border-white/10 pb-1 w-fit'>Quick Links</h3>
                        <ul className='space-y-2'>
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <motion.button 
                                        onClick={() => link.path !== "#" && navigate(link.path)}
                                        whileHover={{ x: 5 }}
                                        className='text-xs hover:text-[#ff4d2d] transition-colors cursor-pointer'
                                    >
                                        {link.name}
                                    </motion.button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className='text-base font-bold text-white mb-4 border-b border-white/10 pb-1 w-fit'>Contact Us</h3>
                        <ul className='space-y-3'>
                            <li className='flex items-center gap-3 group cursor-pointer'>
                                <div className='w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#ff4d2d]/20 group-hover:text-[#ff4d2d] transition-all'>
                                    <FaPhoneAlt size={12} />
                                </div>
                                <span className='text-xs'>+91 9508753740</span>
                            </li>
                            <li className='flex items-center gap-3 group cursor-pointer'>
                                <div className='w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#ff4d2d]/20 group-hover:text-[#ff4d2d] transition-all'>
                                    <FaEnvelope size={12} />
                                </div>
                                <span className='text-xs'>support@vingo.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Office Address */}
                    <div>
                        <h3 className='text-base font-bold text-white mb-4 border-b border-white/10 pb-1 w-fit'>Office Address</h3>
                        <div className='flex items-start gap-3'>
                            <div className='w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#ff4d2d]'>
                                <FaMapMarkerAlt size={12} />
                            </div>
                            <p className='text-xs leading-relaxed'>
                                Sector 12, Connaught Place,<br />
                                New Delhi - 110001,<br />
                                India
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4'>
                    <p className='text-xs text-gray-500 font-medium uppercase tracking-widest'>
                        © 2026 VINGO FOODS. ALL RIGHTS RESERVED.
                    </p>
                    <div className='flex gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest'>
                        <a href="#" className='hover:text-white transition-colors'>Privacy Policy</a>
                        <a href="#" className='hover:text-white transition-colors'>Terms of Service</a>
                        <a href="#" className='hover:text-white transition-colors'>Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
