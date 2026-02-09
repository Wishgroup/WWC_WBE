import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './EventDetail.css'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await eventsAPI.getEvent(id)
      if (res.success) {
        setEvent(res.data)
      } else {
        setError(res.error || 'Event not found')
      }
    } catch (err) {
      console.error('Error fetching event:', err)
      setError(err.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!isAuthenticated || user?.role !== 'member') {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }

    try {
      setRegistering(true)
      const res = await eventsAPI.register(id)
      if (res.success) {
        setRegistered(true)
        alert('Successfully registered for this event!')
      } else {
        alert(res.error || 'Failed to register for event')
      }
    } catch (err) {
      console.error('Registration error:', err)
      alert(err.message || 'Failed to register for event')
    } finally {
      setRegistering(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="event-detail-page">
        <Header />
        <div className="loading-container">
          <div className="loading">Loading event...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <Header />
        <div className="error-container">
          <h2>Event Not Found</h2>
          <p>{error || 'The event you are looking for does not exist or is no longer available.'}</p>
          <button onClick={() => navigate('/events')} className="back-button">
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="event-detail-page">
      <Header />
      <div className="event-detail-container">
        <button onClick={() => navigate('/events')} className="back-button">
          ← Back to Events
        </button>

        <div className="event-detail-content">
          <div className="event-detail-header">
            {event.image_url && (
              <div className="event-image">
                <img src={event.image_url} alt={event.event_name} />
              </div>
            )}
            <div className="event-info">
              <h1>{event.event_name}</h1>
              <div className="event-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>{formatDate(event.start_time)}</span>
                </div>
                {event.end_time && (
                  <div className="meta-item">
                    <span className="meta-icon">⏰</span>
                    <span>Ends: {formatDate(event.end_time)}</span>
                  </div>
                )}
                {event.location && (
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                {event.max_capacity && (
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span>Capacity: {event.max_capacity} attendees</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <div className="event-description">
              <h2>About This Event</h2>
              <p>{event.description}</p>
            </div>
          )}

          <div className="event-actions">
            {isAuthenticated && user?.role === 'member' ? (
              registered ? (
                <div className="registered-badge">
                  ✓ You are registered for this event
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="register-button"
                >
                  {registering ? 'Registering...' : 'Register for Event'}
                </button>
              )
            ) : (
              <button
                onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}
                className="register-button"
              >
                Login to Register
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default EventDetail

