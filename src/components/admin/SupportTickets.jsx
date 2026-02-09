import React, { useState, useEffect, useRef } from 'react'
import { supportAPI } from '../../services/api'
import './SupportTickets.css'

const SupportTickets = () => {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all') // all, open, in_progress, resolved, closed, not_resolved
  const messagesEndRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  useEffect(() => {
    loadTickets()
    loadStats()
  }, [filter])

  useEffect(() => {
    if (selectedTicket) {
      loadMessages()
      // Poll for new messages every 3 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages()
      }, 3000)
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [selectedTicket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadTickets = async () => {
    try {
      const data = await supportAPI.getTickets()
      if (data.success) {
        let filteredTickets = data.tickets || []
        if (filter !== 'all') {
          filteredTickets = filteredTickets.filter(t => t.status === filter)
        }
        setTickets(filteredTickets)
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    }
  }

  const loadStats = async () => {
    try {
      const data = await supportAPI.getStats()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadMessages = async () => {
    if (!selectedTicket) return
    try {
      const data = await supportAPI.getTicket(selectedTicket.id)
      if (data.success) {
        setMessages(data.messages || [])
        setSelectedTicket(data.ticket)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedTicket) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    try {
      const data = await supportAPI.sendMessage(selectedTicket.id, messageText)
      if (data.success) {
        await loadMessages()
        await loadTickets()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.message || 'Failed to send message. Please try again.')
      setNewMessage(messageText)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    if (!selectedTicket) return

    setLoading(true)
    try {
      const data = await supportAPI.updateTicketStatus(
        selectedTicket.id,
        status,
        statusNotes.trim() || undefined
      )
      if (data.success) {
        setStatusNotes('')
        await loadMessages()
        await loadTickets()
        await loadStats()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert(error.message || 'Failed to update status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="support-tickets-admin">
      <div className="support-tickets-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Manage member support requests and live chat</p>
        </div>
        {stats && (
          <div className="support-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total_tickets}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item open">
              <span className="stat-value">{stats.open_tickets}</span>
              <span className="stat-label">Open</span>
            </div>
            <div className="stat-item in-progress">
              <span className="stat-value">{stats.in_progress_tickets}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item resolved">
              <span className="stat-value">{stats.resolved_tickets}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        )}
      </div>

      <div className="support-tickets-content">
        <div className="tickets-sidebar">
          <div className="filter-section">
            <h3>Filter by Status</h3>
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'open' ? 'active' : ''}
                onClick={() => setFilter('open')}
              >
                Open
              </button>
              <button
                className={filter === 'in_progress' ? 'active' : ''}
                onClick={() => setFilter('in_progress')}
              >
                In Progress
              </button>
              <button
                className={filter === 'resolved' ? 'active' : ''}
                onClick={() => setFilter('resolved')}
              >
                Resolved
              </button>
              <button
                className={filter === 'closed' ? 'active' : ''}
                onClick={() => setFilter('closed')}
              >
                Closed
              </button>
              <button
                className={filter === 'not_resolved' ? 'active' : ''}
                onClick={() => setFilter('not_resolved')}
              >
                Not Resolved
              </button>
            </div>
          </div>

          <div className="tickets-list">
            <h3>Tickets ({tickets.length})</h3>
            {tickets.length === 0 ? (
              <div className="no-tickets">No tickets found</div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''} ${
                    ticket.unread_member_messages > 0 ? 'has-unread' : ''
                  }`}
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setMessages([])
                  }}
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
                    <div className="ticket-member">
                      {ticket.member_name || ticket.member_email}
                    </div>
                    <div className="ticket-time">{getTimeAgo(ticket.created_at)}</div>
                  </div>
                  {ticket.unread_member_messages > 0 && (
                    <div className="unread-indicator">
                      {ticket.unread_member_messages} new
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ticket-detail">
          {!selectedTicket ? (
            <div className="no-ticket-selected">
              <p>Select a ticket to view details and respond</p>
            </div>
          ) : (
            <>
              <div className="ticket-detail-header">
                <div>
                  <h2>{selectedTicket.subject}</h2>
                  <div className="ticket-detail-meta">
                    <span className="ticket-number">{selectedTicket.ticket_number}</span>
                    <span
                      className="ticket-status"
                      style={{ color: getStatusColor(selectedTicket.status) }}
                    >
                      {selectedTicket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {selectedTicket.member_name && (
                      <span className="ticket-member">
                        Member: {selectedTicket.member_name} ({selectedTicket.member_email})
                      </span>
                    )}
                    {selectedTicket.assigned_admin_name && (
                      <span className="ticket-assigned">
                        Assigned to: {selectedTicket.assigned_admin_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ticket-description">
                <strong>Initial Request:</strong>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="chat-messages" ref={messagesEndRef}>
                {messages.length === 0 ? (
                  <div className="no-messages">No messages yet</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.sender_type === 'admin' ? 'message-sent' : 'message-received'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.message}</div>
                        <div className="message-meta">
                          <span className="message-sender">
                            {message.sender_type === 'admin'
                              ? message.sender_name || 'You'
                              : message.sender_name || 'Member'}
                          </span>
                          <span className="message-time">{formatDate(message.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedTicket.status !== 'closed' && (
                <>
                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <textarea
                      className="chat-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      rows="3"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      className="btn-send"
                      disabled={!newMessage.trim() || loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>

                  <div className="ticket-actions">
                    <h3>Update Ticket Status</h3>
                    <div className="status-actions">
                      <button
                        className="btn-status resolved"
                        onClick={() => handleUpdateStatus('resolved')}
                        disabled={loading}
                      >
                        ✓ Mark as Resolved
                      </button>
                      <button
                        className="btn-status not-resolved"
                        onClick={() => handleUpdateStatus('not_resolved')}
                        disabled={loading}
                      >
                        ✗ Mark as Not Resolved
                      </button>
                      <button
                        className="btn-status closed"
                        onClick={() => handleUpdateStatus('closed')}
                        disabled={loading}
                      >
                        Close Ticket
                      </button>
                    </div>
                    <div className="status-notes">
                      <label htmlFor="status-notes">Add notes (optional):</label>
                      <textarea
                        id="status-notes"
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Add any additional notes or instructions..."
                        rows="2"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedTicket.status === 'closed' && (
                <div className="chat-closed-notice">
                  This ticket has been closed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportTickets


