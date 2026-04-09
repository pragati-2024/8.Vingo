import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaCheckCircle } from 'react-icons/fa'

const reviews = [
    {
        id: 1,
        name: "Rahul Sharma",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 5,
        comment: "Amazing food and fast delivery! Vingo has become my go-to app for every meal.",
        location: "Patna, Bihar"
    },
    {
        id: 2,
        name: "Priya Singh",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        rating: 5,
        comment: "Loved the quality 😍. The packaging was neat and the food was still hot when it arrived!",
        location: "Delhi, India"
    },
    {
        id: 3,
        name: "Amit Verma",
        image: "https://randomuser.me/api/portraits/men/85.jpg",
        rating: 4,
        comment: "Best food app in Patna! Great variety of restaurants and very reliable service.",
        location: "Patna, Bihar"
    },
    {
        id: 4,
        name: "Sneha Kapoor",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        rating: 5,
        comment: "The real-time tracking feature is awesome. I always know exactly where my pizza is!",
        location: "Mumbai, Maharashtra"
    },
    {
        id: 5,
        name: "Vikram Rathore",
        image: "https://randomuser.me/api/portraits/men/22.jpg",
        rating: 5,
        comment: "Excellent service! The delivery boy was very polite and reached before time.",
        location: "Bangalore, Karnataka"
    },
    {
        id: 6,
        name: "Anjali Gupta",
        image: "https://randomuser.me/api/portraits/women/26.jpg",
        rating: 4,
        comment: "So many options to choose from. Vingo makes weekend dinners so much easier!",
        location: "Patna, Bihar"
    },
    {
        id: 7,
        name: "Deepak Jha",
        image: "https://randomuser.me/api/portraits/men/41.jpg",
        rating: 5,
        comment: "Highly recommended for anyone looking for fresh food and quick delivery. Top notch!",
        location: "Pune, Maharashtra"
    },
    {
        id: 8,
        name: "Megha Roy",
        image: "https://randomuser.me/api/portraits/women/17.jpg",
        rating: 5,
        comment: "The discounts on Vingo are unbeatable. Great food at even better prices! 🍔",
        location: "Kolkata, West Bengal"
    }
]

function TrustSection() {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 50 
        },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    }

    return (
        <section className='w-full pt-16 pb-10 subtle-star-pattern px-4 bg-white/95 backdrop-blur-[2px]'>
            <div className='max-w-6xl mx-auto'>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className='text-center mb-16'
                >
                    <h2 className='text-3xl md:text-5xl font-black text-gray-900 mb-4'>
                        Trusted by <span className='text-[#ff4d2d]'>10,000+</span> Happy Customers ❤️
                    </h2>
                    <div className='w-24 h-1.5 bg-[#ff4d2d] mx-auto rounded-full'></div>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                >
                    {reviews.map((review) => (
                        <motion.div 
                            key={review.id}
                            variants={cardVariants}
                            whileHover={{ scale: 1.03, translateY: -5 }}
                            className='bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-orange-50 hover:shadow-[0_20px_50px_rgba(255,77,45,0.1)] transition-all duration-300'
                        >
                            <div className='flex items-center gap-4 mb-4'>
                                <div className='relative'>
                                    <img 
                                        src={review.image} 
                                        alt={review.name} 
                                        className='w-12 h-12 rounded-full border-2 border-orange-100 object-cover'
                                    />
                                    <div className='absolute -bottom-1 -right-1 bg-white rounded-full'>
                                        <FaCheckCircle className='text-blue-500' size={14} />
                                    </div>
                                </div>
                                <div>
                                    <div className='flex items-center gap-1'>
                                        <h4 className='font-bold text-gray-800 text-sm'>{review.name}</h4>
                                        <span className='bg-blue-50 text-blue-600 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter'>Verified</span>
                                    </div>
                                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>{review.location}</p>
                                </div>
                            </div>
                            
                            <div className='flex gap-1 mb-3'>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                        key={i} 
                                        size={12} 
                                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}
                                    />
                                ))}
                            </div>

                            <p className='text-gray-600 text-sm italic leading-relaxed'>
                                "{review.comment}"
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className='mt-20 text-center'
                >
                    <p className='text-xl md:text-2xl font-bold text-gray-700'>
                        Join thousands of food lovers who trust <span className='text-[#ff4d2d] font-black'>Vingo</span> every day!
                    </p>
                    <div className='mt-8 flex justify-center gap-4 flex-wrap'>
                        <div className='flex -space-x-3'>
                            {[1,2,3,4,5].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className='w-10 h-10 rounded-full border-2 border-white' alt="" />
                            ))}
                            <div className='w-10 h-10 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[#ff4d2d] text-xs font-bold'>+10k</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default TrustSection
