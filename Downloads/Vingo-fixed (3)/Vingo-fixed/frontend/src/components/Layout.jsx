import React from 'react'
import Footer from './Footer'
import Nav from './Nav'
import AnimatedStarBackground from './AnimatedStarBackground'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <AnimatedStarBackground />
      <Nav />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
