import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useNotification } from '../../hooks/useNotification'
import './VendorAnalytics.css'

const VendorAnalytics = () => {
  const [analytics, setAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState('')
  const { success, error, NotificationComponent } = useNotification()

  useEffect(() => {
    loadAnalytics()
  }, [selectedVendor])

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const data = await adminAPI.getVendorAnalytics(selectedVendor || null)
      setAnalytics(data.data || [])
      if (isRefresh) {
        success('Analytics refreshed successfully')
      }
    } catch (err) {
      console.error('Error loading vendor analytics:', err)
      error('Error loading analytics: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading vendor analytics...</div>
  }

  return (
    <div className="vendor-analytics">
      {NotificationComponent}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Vendor Analytics</h1>
            <p>Vendor usage statistics and performance metrics</p>
          </div>
          <button 
            className="refresh-button" 
            onClick={() => loadAnalytics(true)}
            disabled={refreshing || loading}
            title="Refresh analytics"
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {analytics.length === 0 ? (
          <div className="no-data">No vendor data available</div>
        ) : (
          analytics.map((vendor) => (
            <div key={vendor.id || vendor._id} className="vendor-card">
              <div className="vendor-header">
                <h3>{vendor.vendor_name}</h3>
                <span className="vendor-code">{vendor.vendor_code}</span>
              </div>
              <div className="vendor-location">
                <span className="location-badge">{vendor.city}, {vendor.country}</span>
              </div>
              <div className="vendor-stats">
                <div className="stat-item">
                  <div className="stat-value">{vendor.unique_members || 0}</div>
                  <div className="stat-label">Unique Members</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{vendor.total_taps || 0}</div>
                  <div className="stat-label">Total Taps</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{vendor.approved_taps || 0}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{vendor.offers_applied || 0}</div>
                  <div className="stat-label">Offers Applied</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {vendor.avg_fraud_score ? parseFloat(vendor.avg_fraud_score).toFixed(1) : '0.0'}
                  </div>
                  <div className="stat-label">Avg Fraud Score</div>
                </div>
              </div>
              <div className="vendor-metrics">
                <div className="metric">
                  <span className="metric-label">Approval Rate:</span>
                  <span className="metric-value">
                    {vendor.total_taps > 0
                      ? ((vendor.approved_taps / vendor.total_taps) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Offer Usage:</span>
                  <span className="metric-value">
                    {vendor.total_taps > 0
                      ? ((vendor.offers_applied / vendor.total_taps) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VendorAnalytics


