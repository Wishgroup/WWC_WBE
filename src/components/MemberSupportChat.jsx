import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supportAPI } from '../services/api'
import { trackSupportTicket } from '../utils/analytics'
import './MemberSupportChat.css'

const MemberSupportChat = () => {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
  })
  const messagesEndRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  useEffect(() => {
    if (user && user.role === 'member') {
      loadTickets()
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedTicket) {
      loadMessages()
      // Poll for new messages every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadMessages()
      }, 5000)
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
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
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

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!formData.subject || !formData.description) {
      alert('Please fill in both subject and description')
      return
    }

    setLoading(true)
    try {
      const data = await supportAPI.createTicket(formData.subject, formData.description)
      if (data.success) {
        // Track support ticket creation
        trackSupportTicket('general')
        setFormData({ subject: '', description: '' })
        setShowForm(false)
        await loadTickets()
        // Open the newly created ticket
        setSelectedTicket(data.ticket)
        await loadMessages()
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert(error.message || 'Failed to create ticket. Please try again.')
    } finally {
      setLoading(false)
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
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.message || 'Failed to send message. Please try again.')
      setNewMessage(messageText) // Restore message on error
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

  if (!user || user.role !== 'member') {
    return null
  }

  return (
    <div className="member-support-chat">
      <div className="support-chat-header">
        <h2>Member Support</h2>
        <p>Get help with your membership, account, or NFC card issues</p>
      </div>

      {!selectedTicket && !showForm && (
        <div className="support-chat-actions">
          <button
            className="btn-create-ticket"
            onClick={() => setShowForm(true)}
          >
            + Create New Support Ticket
          </button>

          {tickets.length > 0 && (
            <div className="tickets-list">
              <h3>Your Support Tickets</h3>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="ticket-item"
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setShowForm(false)
                  }}
                >
                  <div className="ticket-header">
                    <span className="ticket-number">{ticket.ticket_number}</span>
                    <span
                      className="ticket-status"
                      style={{ color: getStatusColor(ticket.status) }}
                    >
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="ticket-subject">{ticket.subject}</div>
                  <div className="ticket-meta">
                    Created: {formatDate(ticket.created_at)}
                    {ticket.unread_admin_messages > 0 && (
                      <span className="unread-badge">
                        {ticket.unread_admin_messages} new message(s)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && !selectedTicket && (
        <div className="support-ticket-form">
          <h3>Create Support Ticket</h3>
          <form onSubmit={handleCreateTicket}>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Please provide details about your issue..."
                rows="6"
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ subject: '', description: '' })
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedTicket && (
        <div className="support-chat-container">
          <div className="chat-header">
            <div className="chat-header-info">
              <button
                className="btn-back"
                onClick={() => {
                  setSelectedTicket(null)
                  setMessages([])
                  loadTickets()
                }}
              >
                ← Back
              </button>
              <div>
                <h3>{selectedTicket.subject}</h3>
                <div className="chat-meta">
                  <span className="ticket-number">{selectedTicket.ticket_number}</span>
                  <span
                    className="ticket-status"
                    style={{ color: getStatusColor(selectedTicket.status) }}
                  >
                    {selectedTicket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-messages" ref={messagesEndRef}>
            {messages.length === 0 ? (
              <div className="no-messages">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender_type === 'member' ? 'message-sent' : 'message-received'}`}
                >
                  <div className="message-content">
                    <div className="message-text">{message.message}</div>
                    <div className="message-meta">
                      <span className="message-sender">
                        {message.sender_type === 'member' ? 'You' : message.sender_name || 'Admin'}
                      </span>
                      <span className="message-time">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedTicket.status !== 'closed' && (
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <textarea
                className="chat-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows="2"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn-send"
                disabled={!newMessage.trim() || loading}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}

          {selectedTicket.status === 'closed' && (
            <div className="chat-closed-notice">
              This ticket has been closed. Please create a new ticket if you need further assistance.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MemberSupportChat

