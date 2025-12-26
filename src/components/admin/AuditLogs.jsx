import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import './AuditLogs.css'

const AuditLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    user_type: '',
    action: '',
    limit: 100,
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await adminAPI.getAuditLogs(filters)
      setLogs(data.data || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
      alert('Error loading audit logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading audit logs...</div>
  }

  return (
    <div className="audit-logs">
      <div className="dashboard-header">
        <h1>Audit Logs</h1>
        <p>Complete system audit trail for compliance and security</p>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters">
          <select
            value={filters.user_type}
            onChange={(e) => setFilters({ ...filters, user_type: e.target.value })}
          >
            <option value="">All User Types</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
            <option value="api">API</option>
          </select>
          <button onClick={loadLogs} className="refresh-btn">Refresh</button>
        </div>
      </div>

      <div className="logs-section">
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Type</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id || log._id || index}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>
                      <span className="user-type-badge">{log.user_type || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="action-badge">{log.action}</span>
                    </td>
                    <td>
                      {log.resource_type && (
                        <span>
                          {log.resource_type}
                          {log.resource_id && ` #${String(log.resource_id).substring(0, 8)}`}
                        </span>
                      )}
                    </td>
                    <td>
                      <details className="details-tag">
                        <summary>View</summary>
                        <pre>{JSON.stringify(log.details || {}, null, 2)}</pre>
                      </details>
                    </td>
                    <td>{log.ip_address || 'N/A'}</td>
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

export default AuditLogs


