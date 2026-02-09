import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supportAPI } from '../services/api'
import './SupportWidget.css'

const SupportWidget = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeTickets: 0,
    unreadMessages: 0,
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const data = await supportAPI.getTickets()
      if (data.success) {
        const allTickets = data.tickets || []
        setTickets(allTickets)
        
        // Calculate stats
        const activeTickets = allTickets.filter(
          t => t.status === 'open' || t.status === 'in_progress'
        ).length
        const unreadMessages = allTickets.reduce((sum, ticket) => {
          return sum + (ticket.unread_admin_messages || 0)
        }, 0)
        
        setStats({
          activeTickets,
          unreadMessages,
        })
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#ff9800'
      case 'in_progress':
        return '#2196f3'
      case 'resolved':
        return '#4caf50'
      case 'closed':
        return '#9e9e9e'
      case 'not_resolved':
        return '#f44336'
      default:
        return '#666'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="support-widget">
        <div className="support-widget-header">
          <h3>Support</h3>
        </div>
        <div className="support-widget-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="support-widget">
      <div className="support-widget-header">
        <h3>Support</h3>
        <Link to="/support" className="view-all-link">
          View All →
        </Link>
      </div>

      <div className="support-widget-stats">
        <div className="support-stat-item">
          <span className="stat-value">{stats.activeTickets}</span>
          <span className="stat-label">Active Tickets</span>
        </div>
        <div className="support-stat-item">
          <span className="stat-value">{stats.unreadMessages}</span>
          <span className="stat-label">Unread Messages</span>
        </div>
      </div>

      <div className="support-widget-actions">
        <button
          className="support-action-btn primary"
          onClick={() => navigate('/support')}
        >
          + Create Support Ticket
        </button>
        <button
          className="support-action-btn secondary"
          onClick={() => navigate('/support')}
        >
          View All Tickets
        </button>
      </div>

      {tickets.length > 0 && (
        <div className="support-widget-tickets">
          <h4>Recent Tickets</h4>
          <div className="tickets-list">
            {tickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                className="ticket-item"
                onClick={() => navigate('/support')}
              >
                <div className="ticket-item-header">
                  <span className="ticket-number">{ticket.ticket_number}</span>
                  <span
                    className="ticket-status-badge"
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-meta">
                  {formatDate(ticket.created_at)}
                  {ticket.unread_admin_messages > 0 && (
                    <span className="unread-badge">
                      {ticket.unread_admin_messages} new
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tickets.length === 0 && (
        <div className="support-widget-empty">
          <p>No support tickets yet</p>
          <p className="empty-hint">Create a ticket if you need help</p>
        </div>
      )}

      <div className="support-widget-quick-links">
        <h4>Quick Links</h4>
        <div className="quick-links-grid">
          <Link to="/support" className="quick-link">
            <span className="quick-link-icon">💬</span>
            <span>Live Chat</span>
          </Link>
          <Link to="/member/dashboard" className="quick-link">
            <span className="quick-link-icon">💳</span>
            <span>Card Management</span>
          </Link>
          <Link to="/member/dashboard" className="quick-link">
            <span className="quick-link-icon">📄</span>
            <span>Order Status</span>
          </Link>
          <Link to="/support" className="quick-link">
            <span className="quick-link-icon">❓</span>
            <span>FAQ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SupportWidget



