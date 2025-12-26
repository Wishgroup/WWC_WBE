import React from 'react'
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
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import FloatingButton from './components/FloatingButton'
import './App.css'

function AppRoutes() {
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
  return (
    <Router>
      <AppRoutes />
      <FloatingButton />
    </Router>
  )
}

export default App

