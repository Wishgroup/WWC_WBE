import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Join from './pages/Join'
import Benefits from './pages/Benefits'
import Events from './pages/Events'
import Login from './pages/Login'
import Register from './pages/Register'
import PaymentSuccess from './pages/PaymentSuccess'
import AdminDashboard from './pages/AdminDashboard'
import MemberDashboard from './pages/MemberDashboard'
import VendorDashboard from './pages/VendorDashboard'
import ApplicationSubmitted from './pages/ApplicationSubmitted'
import ApplicationPending from './pages/ApplicationPending'
import ApplicationRejected from './pages/ApplicationRejected'
import PaymentPending from './pages/PaymentPending'
import Support from './pages/Support'
import SetPassword from './pages/SetPassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Rejoin from './pages/Rejoin'
import Refer from './pages/Refer'
import Gift from './pages/Gift'
import Community from './pages/Community'
import Corporate from './pages/Corporate'
import OrderStatus from './pages/OrderStatus'
import About from './pages/About'
import Mission from './pages/Mission'
import Careers from './pages/Careers'
import Press from './pages/Press'
// Use dynamic imports to avoid ad blockers blocking files with "Privacy" or "Cookie" in name
import TermsOfUse from './pages/TermsOfUse'
import Security from './pages/Security'

// Lazy load privacy and cookie pages to avoid ad blocker issues
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import FloatingButton from './components/FloatingButton'
import { usePageTracking } from './hooks/usePageTracking'
import { initGA } from './utils/analytics'
import { getLanguage } from './utils/i18n'
import './App.css'

function AppRoutes() {
  // Track page views - wrapped in Router context
  usePageTracking()

  return (
    <PageTransition>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/success" element={<PaymentSuccess />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentSuccess />} />
        <Route path="/payment/response" element={<PaymentSuccess />} />
        <Route path="/application/submitted" element={<ApplicationSubmitted />} />
        <Route path="/application/pending" element={<ApplicationPending />} />
        <Route path="/application/rejected" element={<ApplicationRejected />} />
        <Route path="/payment/pending" element={<PaymentPending />} />
        <Route path="/support" element={<Support />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/rejoin" element={<Rejoin />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/community" element={<Community />} />
        <Route path="/corporate" element={<Corporate />} />
        <Route path="/order-status" element={<OrderStatus />} />
        <Route path="/about" element={<About />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route 
          path="/privacy-policy" 
          element={
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
              <PrivacyPolicy />
            </Suspense>
          } 
        />
        <Route path="/security" element={<Security />} />
        <Route 
          path="/cookie-policy" 
          element={
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
              <CookiePolicy />
            </Suspense>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/member/dashboard" 
          element={
            <ProtectedRoute requiredRole="member">
              <MemberDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vendor/dashboard" 
          element={
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy admin route - redirects to new route */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </PageTransition>
  )
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || localStorage.getItem('ga_measurement_id')
    if (gaId && gaId !== 'G-PLACEHOLDER') {
      initGA(gaId)
    }
    
    // Set RTL for Arabic
    const lang = getLanguage()
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
    
    // Listen for language changes
    const handleLanguageChange = () => {
      const currentLang = getLanguage()
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = currentLang
    }
    
    window.addEventListener('languagechange', handleLanguageChange)
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange)
    }
  }, [])

  return (
    <Router>
      <AppRoutes />
      <FloatingButton />
    </Router>
  )
}

export default App

