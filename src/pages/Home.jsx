import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import ThreePillars from '../components/ThreePillars'
import Events from '../components/Events'
import Memberships from '../components/Memberships'
import Features from '../components/Features'
import ValueProgram from '../components/ValueProgram'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import FloatingButton from '../components/FloatingButton'
import './Home.css'

function Home() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Intro />
      <ThreePillars />
      <Events />
      <Memberships />
      <Features />
      <ValueProgram />
      <Testimonials />
      <Footer />
      <FloatingButton />
    </div>
  )
}

export default Home

