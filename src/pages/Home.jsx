import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Intro from '../components/Intro'
import ThreePillars from '../components/ThreePillars'
import Memberships from '../components/Memberships'
import Features from '../components/Features'
import ValueProgram from '../components/ValueProgram'
import Footer from '../components/Footer'
import './Home.css'

function Home() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Intro />
      <ThreePillars />
      <Memberships />
      <Features />
      <ValueProgram />
      <Footer />
    </div>
  )
}

export default Home

