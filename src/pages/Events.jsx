import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { eventsAPI } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Events.css'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=500&fit=crop',
]

const formatEventDate = (start, end) => {
  if (!start) return ''
  const s = new Date(start)
  const e = end ? new Date(end) : null
  const opts = { month: 'short', day: 'numeric', year: 'numeric' }
  const timeOpts = { hour: '2-digit', minute: '2-digit' }
  const dateStr = s.toLocaleDateString('en-US', opts)
  const timeStr = s.toLocaleTimeString('en-US', timeOpts)
  if (e && (e.getTime() !== s.getTime())) {
    const endTime = e.toLocaleTimeString('en-US', timeOpts)
    return `${dateStr} · ${timeStr} – ${endTime}`
  }
  return `${dateStr} · ${timeStr}`
}

const Events = () => {
  const navigate = useNavigate()
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await eventsAPI.getUpcoming()
        if (!cancelled && res?.success && Array.isArray(res.data)) {
          setEvents(res.data)
        } else if (!cancelled) {
          setEvents([])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Events load error:', err)
          setError(err.message || 'Failed to load events')
          setEvents([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="events-page">
      <Header />

      <section className="events-section" ref={sectionRef}>
        <div className="events-container">
          <div className="events-hero">
            <h1 className="events-title">Upcoming Events</h1>
            <p className="events-subtitle">
              Exclusive experiences for Wish Waves Club members. Check back for new events posted by our team.
            </p>
          </div>

          {loading ? (
            <div className="events-loading">
              <p>Loading events...</p>
            </div>
          ) : error ? (
            <div className="events-error">
              <p>{error}</p>
              <p className="events-error-hint">Events are updated from the admin panel. Please try again later.</p>
            </div>
          ) : events.length === 0 ? (
            <div className="events-empty">
              <p>No upcoming events at the moment.</p>
              <p className="events-empty-hint">New events will appear here when posted. Join WWC to get access to member-only events.</p>
              <button
                type="button"
                className="join-now-button smooth-hover"
                onClick={() => navigate('/join')}
              >
                JOIN NOW
              </button>
            </div>
          ) : (
            <div className="events-grid events-grid-dynamic">
              {events.map((ev, index) => (
                <div
                  key={ev.id}
                  className={`event-card event-image-card normal ${isSectionVisible ? 'scale-in' : 'animate-on-scroll'} stagger-${(index % 6) + 1} smooth-hover`}
                  style={{
                    backgroundImage: `url(${ev.image_url || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]})`,
                  }}
                >
                  <div className="card-overlay" />
                  <div className="card-content">
                    <h3 className="card-name">{ev.event_name}</h3>
                    <p className="card-role">{formatEventDate(ev.start_time, ev.end_time)}</p>
                    {ev.location && (
                      <p className="card-location">{ev.location}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="card-button plus-button"
                    onClick={() => navigate(`/events/${ev.id}`)}
                    aria-label={`View ${ev.event_name}`}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={`events-cta ${isSectionVisible ? 'fade-in-up' : 'animate-on-scroll'}`}>
            <button
              type="button"
              className="join-now-button smooth-hover"
              onClick={() => navigate('/register')}
            >
              JOIN NOW
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Events
