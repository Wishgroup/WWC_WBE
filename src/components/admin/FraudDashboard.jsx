import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import './FraudDashboard.css'

const FraudDashboard = () => {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    severity: '',
    resolved: '',
    limit: 50,
  })

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, logsData] = await Promise.all([
        adminAPI.getFraudStats(),
        adminAPI.getFraudLogs(filters),
      ])
      setStats(statsData.data)
      setLogs(logsData.data || [])
    } catch (error) {
      console.error('Error loading fraud data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (eventId) => {
    try {
      await adminAPI.resolveFraudEvent(eventId, 'Resolved by admin')
      loadData()
    } catch (error) {
      alert('Error resolving event: ' + error.message)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'low': return '#28a745'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return <div className="loading">Loading fraud data...</div>
  }

  return (
    <div className="fraud-dashboard">
      <div className="dashboard-header">
        <h1>Fraud Monitoring Dashboard</h1>
        <p>Real-time fraud detection and monitoring</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_events || 0}</div>
            <div className="stat-label">Total Events</div>
            <div className="stat-period">Last 30 days</div>
          </div>
          <div className="stat-card high-severity">
            <div className="stat-value">{stats.high_severity || 0}</div>
            <div className="stat-label">High Severity</div>
            <div className="stat-period">Requires immediate action</div>
          </div>
          <div className="stat-card medium-severity">
            <div className="stat-value">{stats.medium_severity || 0}</div>
            <div className="stat-label">Medium Severity</div>
            <div className="stat-period">Monitor closely</div>
          </div>
          <div className="stat-card low-severity">
            <div className="stat-value">{stats.low_severity || 0}</div>
            <div className="stat-label">Low Severity</div>
            <div className="stat-period">Logged for review</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.unresolved || 0}</div>
            <div className="stat-label">Unresolved</div>
            <div className="stat-period">Pending review</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avg_fraud_score ? parseFloat(stats.avg_fraud_score).toFixed(1) : '0.0'}</div>
            <div className="stat-label">Avg Fraud Score</div>
            <div className="stat-period">0-100 scale</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters">
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filters.resolved}
            onChange={(e) => setFilters({ ...filters, resolved: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
          <button onClick={loadData} className="refresh-btn">Refresh</button>
        </div>
      </div>

      {/* Fraud Events Table */}
      <div className="fraud-events-section">
        <h3>Fraud Events</h3>
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event Type</th>
                <th>Severity</th>
                <th>Fraud Score</th>
                <th>Member ID</th>
                <th>Card UID</th>
                <th>Action Taken</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No fraud events found</td>
                </tr>
              ) : (
                logs.map((event) => (
                  <tr key={event.id || event._id}>
                    <td>{new Date(event.created_at).toLocaleString()}</td>
                    <td>
                      <span className="event-type">{event.event_type}</span>
                    </td>
                    <td>
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(event.severity) }}
                      >
                        {event.severity}
                      </span>
                    </td>
                    <td>
                      <span className="fraud-score">{event.fraud_score}</span>
                    </td>
                    <td>{event.member_id ? String(event.member_id).substring(0, 8) + '...' : 'N/A'}</td>
                    <td>{event.card_uid || 'N/A'}</td>
                    <td>{event.action_taken || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${event.resolved ? 'resolved' : 'unresolved'}`}>
                        {event.resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </td>
                    <td>
                      {!event.resolved && (
                        <button
                          className="resolve-btn"
                          onClick={() => handleResolve(event.id || event._id)}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FraudDashboard


