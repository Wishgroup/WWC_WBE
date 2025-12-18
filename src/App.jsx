import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Memberships from './components/Memberships'
import Features from './components/Features'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import FloatingButton from './components/FloatingButton'
import './App.css'

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Memberships />
      <Features />
      <Testimonials />
      <Footer />
      <FloatingButton />
    </div>
  )
}

export default App

