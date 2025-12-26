import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FraudDashboard from '../components/admin/FraudDashboard'
import CardManagement from '../components/admin/CardManagement'
import VendorAnalytics from '../components/admin/VendorAnalytics'
import OfferManagement from '../components/admin/OfferManagement'
import CountryRules from '../components/admin/CountryRules'
import NFCTestInterface from '../components/admin/NFCTestInterface'
import AuditLogs from '../components/admin/AuditLogs'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('fraud')
  const navigate = useNavigate()

  const tabs = [
    { id: 'fraud', label: 'Fraud Monitoring', icon: '🛡️' },
    { id: 'cards', label: 'Card Management', icon: '💳' },
    { id: 'vendors', label: 'Vendor Analytics', icon: '📊' },
    { id: 'offers', label: 'Offer Management', icon: '🎁' },
    { id: 'rules', label: 'Country Rules', icon: '🌍' },
    { id: 'nfc-test', label: 'NFC Test', icon: '📱' },
    { id: 'audit', label: 'Audit Logs', icon: '📝' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'fraud':
        return <FraudDashboard />
      case 'cards':
        return <CardManagement />
      case 'vendors':
        return <VendorAnalytics />
      case 'offers':
        return <OfferManagement />
      case 'rules':
        return <CountryRules />
      case 'nfc-test':
        return <NFCTestInterface />
      case 'audit':
        return <AuditLogs />
      default:
        return <FraudDashboard />
    }
  }

  return (
    <div className="admin-dashboard">
      <Header />
      <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Wish Waves Club</p>
          </div>
          <nav className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="admin-footer">
            <button 
              className="back-to-home"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
          </div>
        </div>
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AdminDashboard


