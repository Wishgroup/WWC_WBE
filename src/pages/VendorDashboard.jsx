import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './VendorDashboard.css'

const VendorDashboard = () => {
  const { user, logout } = useAuth()
  const [vendorData, setVendorData] = useState({
    vendorName: '',
    vendorCode: '',
    location: '',
    currency: '',
    status: 'active',
    totalTaps: 0,
    approvedTaps: 0,
    rejectedTaps: 0,
    offersApplied: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    recentTransactions: [],
    topMembers: [],
    performanceMetrics: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorData()
  }, [user])

  const fetchVendorData = async () => {
    try {
      setLoading(true)
      // In a real app, this would call an API endpoint
      // For now, using mock data
      setVendorData({
        vendorName: user?.fullName || 'Vendor',
        vendorCode: 'VENDOR_TEST_001',
        location: 'Dubai, UAE',
        currency: 'AED',
        status: 'active',
        totalTaps: 156,
        approvedTaps: 142,
        rejectedTaps: 14,
        offersApplied: 89,
        totalRevenue: 12500,
        todayRevenue: 850,
        recentTransactions: [
          { id: 1, cardUid: 'CARD123456789', memberName: 'John Member', amount: 125.00, offer: '10% Off', status: 'approved', timestamp: '2 hours ago' },
          { id: 2, cardUid: 'CARD987654321', memberName: 'Sarah Member', amount: 89.50, offer: null, status: 'approved', timestamp: '5 hours ago' },
          { id: 3, cardUid: 'CARD456789123', memberName: 'Mike Member', amount: 200.00, offer: '15% Off', status: 'approved', timestamp: '1 day ago' },
          { id: 4, cardUid: 'CARD789123456', memberName: 'Lisa Member', amount: 45.00, offer: null, status: 'rejected', timestamp: '1 day ago' },
        ],
        topMembers: [
          { name: 'John Member', visits: 12, totalSpent: 1250.00 },
          { name: 'Sarah Member', visits: 8, totalSpent: 890.50 },
          { name: 'Mike Member', visits: 6, totalSpent: 1200.00 },
        ],
        performanceMetrics: {
          approvalRate: 91.0,
          averageTransaction: 87.96,
          offerUsageRate: 57.1,
        },
      })
    } catch (error) {
      console.error('Error fetching vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(vendorData.vendorCode)
    alert('API Key copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <Header />
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="vendor-dashboard">
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Vendor Dashboard</h1>
            <p className="dashboard-subtitle">Welcome, {vendorData.vendorName}</p>
          </div>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>

        {/* Vendor Information Card */}
        <div className="vendor-info-card">
          <div className="vendor-info-header">
            <h2>Vendor Information</h2>
            <span className={`status-badge ${vendorData.status}`}>
              {vendorData.status.charAt(0).toUpperCase() + vendorData.status.slice(1)}
            </span>
          </div>
          <div className="vendor-info-grid">
            <div className="info-item">
              <span className="info-label">Vendor Name:</span>
              <span className="info-value">{vendorData.vendorName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Vendor Code:</span>
              <span className="info-value code">{vendorData.vendorCode}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location:</span>
              <span className="info-value">{vendorData.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Currency:</span>
              <span className="info-value">{vendorData.currency}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{vendorData.totalTaps}</div>
              <div className="stat-label">Total Taps</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <div className="stat-value">{vendorData.approvedTaps}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">✗</div>
            <div className="stat-content">
              <div className="stat-value">{vendorData.rejectedTaps}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-content">
              <div className="stat-value">{vendorData.offersApplied}</div>
              <div className="stat-label">Offers Applied</div>
            </div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{vendorData.currency} {vendorData.totalRevenue.toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{vendorData.currency} {vendorData.todayRevenue}</div>
              <div className="stat-label">Today's Revenue</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="metrics-section">
          <h2>Performance Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{vendorData.performanceMetrics.approvalRate}%</div>
              <div className="metric-label">Approval Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{vendorData.currency} {vendorData.performanceMetrics.averageTransaction.toFixed(2)}</div>
              <div className="metric-label">Average Transaction</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{vendorData.performanceMetrics.offerUsageRate}%</div>
              <div className="metric-label">Offer Usage Rate</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="section-header-row">
          <h2>Recent Transactions</h2>
        </div>
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Member</th>
                <th>Card UID</th>
                <th>Amount</th>
                <th>Offer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendorData.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.timestamp}</td>
                  <td>{transaction.memberName}</td>
                  <td><code className="card-code">{transaction.cardUid}</code></td>
                  <td>{vendorData.currency} {transaction.amount.toFixed(2)}</td>
                  <td>{transaction.offer || '-'}</td>
                  <td>
                    <span className={`status-badge-small ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Members */}
        <div className="section-header-row">
          <h2>Top Members</h2>
        </div>
        <div className="top-members-grid">
          {vendorData.topMembers.map((member, index) => (
            <div key={index} className="member-card">
              <div className="member-rank">#{index + 1}</div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-stats">
                  <span>{member.visits} visits</span>
                  <span>{vendorData.currency} {member.totalSpent.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Integration */}
        <div className="api-section">
          <h2>API Integration</h2>
          <div className="api-card">
            <p className="api-description">Use your Vendor API Key to integrate with your POS system for NFC validation.</p>
            <div className="api-key-display">
              <code>{vendorData.vendorCode}</code>
              <button className="copy-button" onClick={copyApiKey}>
                Copy
              </button>
            </div>
            <div className="api-docs">
              <p><strong>API Endpoint:</strong> POST /api/nfc/validate</p>
              <p><strong>Header:</strong> X-Vendor-API-Key: {vendorData.vendorCode}</p>
              <p><strong>Body:</strong> {`{ "cardUid": "...", "posReaderId": "...", "transactionAmount": 100.00 }`}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default VendorDashboard
