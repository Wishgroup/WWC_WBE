import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useNotification } from '../../hooks/useNotification'
import './WorkQueue.css'

const WorkQueue = () => {
  const [workQueue, setWorkQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('applications')
  const [refreshing, setRefreshing] = useState(false)
  const { success, error, NotificationComponent } = useNotification()

  useEffect(() => {
    loadWorkQueue()
  }, [])

  const loadWorkQueue = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const data = await adminAPI.getWorkQueue()
      setWorkQueue(data.data)
      if (isRefresh) {
        success('Work queue refreshed successfully')
      }
    } catch (err) {
      console.error('Error loading work queue:', err)
      error('Error loading work queue: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleApprove = async (id, applicationType) => {
    if (!window.confirm(`Are you sure you want to approve this ${applicationType} application?`)) {
      return
    }

    try {
      await adminAPI.approveApplication(id, applicationType)
      success('Application approved successfully!')
      loadWorkQueue(true)
    } catch (err) {
      error('Error approving application: ' + (err.message || 'Unknown error'))
    }
  }

  const handleReject = async (id, applicationType) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled

    try {
      await adminAPI.rejectApplication(id, applicationType, reason || '')
      success('Application rejected')
      loadWorkQueue(true)
    } catch (err) {
      error('Error rejecting application: ' + (err.message || 'Unknown error'))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="work-queue">
        <div className="loading">Loading work queue...</div>
      </div>
    )
  }

  if (!workQueue) {
    return (
      <div className="work-queue">
        <div className="error">Failed to load work queue</div>
      </div>
    )
  }

  const totalPending = (workQueue.applications?.total || 0) + 
                      (workQueue.cardIssuance?.length || 0) + 
                      (workQueue.bankTransfers?.length || 0)

  return (
    <div className="work-queue">
      {NotificationComponent}
      <div className="work-queue-header">
        <div className="header-content">
          <div>
            <h2>Work Queue</h2>
            <p>Manage pending applications, card issuance, and bank transfers</p>
          </div>
          <button 
            className="refresh-button" 
            onClick={() => loadWorkQueue(true)}
            disabled={refreshing || loading}
            title="Refresh work queue"
          >
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
        <div className="work-queue-stats">
          <div className="stat-card">
            <div className="stat-value">{workQueue.applications?.total || 0}</div>
            <div className="stat-label">Pending Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{workQueue.cardIssuance?.length || 0}</div>
            <div className="stat-label">Card Issuance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{workQueue.bankTransfers?.length || 0}</div>
            <div className="stat-label">Bank Transfers</div>
          </div>
          <div className="stat-card total">
            <div className="stat-value">{totalPending}</div>
            <div className="stat-label">Total Pending</div>
          </div>
        </div>
      </div>

      <div className="work-queue-tabs">
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications ({workQueue.applications?.total || 0})
        </button>
        <button
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Card Issuance ({workQueue.cardIssuance?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          Bank Transfers ({workQueue.bankTransfers?.length || 0})
        </button>
      </div>

      <div className="work-queue-content">
        {activeTab === 'applications' && (
          <div className="applications-section">
            <h3>Member Applications</h3>
            {workQueue.applications?.members?.length > 0 ? (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workQueue.applications.members.map((app) => (
                    <tr key={app.id}>
                      <td>{app.name}</td>
                      <td>{app.email}</td>
                      <td>{app.membership_type || 'N/A'}</td>
                      <td>{app.amount ? `AED ${app.amount}` : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${app.payment_status}`}>
                          {app.payment_status || 'pending'}
                        </span>
                      </td>
                      <td>{formatDate(app.created_at)}</td>
                      <td className="actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(app.id, 'member')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(app.id, 'member')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No pending member applications</p>
            )}

            <h3>Vendor Applications</h3>
            {workQueue.applications?.vendors?.length > 0 ? (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workQueue.applications.vendors.map((app) => (
                    <tr key={app.id}>
                      <td>{app.name}</td>
                      <td>{app.email}</td>
                      <td>{app.membership_type || 'N/A'}</td>
                      <td>{app.amount ? `AED ${app.amount}` : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${app.payment_status}`}>
                          {app.payment_status || 'pending'}
                        </span>
                      </td>
                      <td>{formatDate(app.created_at)}</td>
                      <td className="actions">
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(app.id, 'vendor')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(app.id, 'vendor')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No pending vendor applications</p>
            )}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="cards-section">
            {workQueue.cardIssuance?.length > 0 ? (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Card Public ID</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {workQueue.cardIssuance.map((card) => (
                    <tr key={card.session_id}>
                      <td>{card.full_name}</td>
                      <td>{card.email}</td>
                      <td>{card.card_public_id || 'N/A'}</td>
                      <td>
                        <span className="status-badge prepared">{card.status}</span>
                      </td>
                      <td>{formatDate(card.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No pending card issuance</p>
            )}
          </div>
        )}

        {activeTab === 'transfers' && (
          <div className="transfers-section">
            {workQueue.bankTransfers?.length > 0 ? (
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {workQueue.bankTransfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td>{transfer.order_id}</td>
                      <td>{transfer.email}</td>
                      <td>{transfer.amount ? `AED ${transfer.amount}` : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${transfer.payment_status}`}>
                          {transfer.payment_status}
                        </span>
                      </td>
                      <td>{formatDate(transfer.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No pending bank transfers</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkQueue



