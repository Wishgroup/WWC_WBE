import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { useNotification } from '../../hooks/useNotification'
import './EventManagement.css'

const DEFAULT_FORM = {
  event_name: '',
  event_code: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  max_capacity: '',
  image_url: '',
  is_active: true,
}

const EventManagement = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [checkinsEventId, setCheckinsEventId] = useState(null)
  const [checkins, setCheckins] = useState([])
  const { success, error, NotificationComponent } = useNotification()

  const loadEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const res = await adminAPI.getEvents()
      setEvents(res.data || [])
      if (isRefresh) success('Events refreshed')
    } catch (err) {
      console.error('Error loading events:', err)
      error('Failed to load events: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const formatDateTime = (d) => {
    if (!d) return '—'
    const dt = new Date(d)
    return dt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({
      ...DEFAULT_FORM,
      start_time: new Date().toISOString().slice(0, 16),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    })
    setShowForm(true)
  }

  const openEdit = (e) => {
    setEditingId(e.id)
    setForm({
      event_name: e.event_name || '',
      event_code: e.event_code || '',
      description: e.description || '',
      start_time: e.start_time ? new Date(e.start_time).toISOString().slice(0, 16) : '',
      end_time: e.end_time ? new Date(e.end_time).toISOString().slice(0, 16) : '',
      location: e.location || '',
      max_capacity: e.max_capacity != null ? String(e.max_capacity) : '',
      image_url: e.image_url || '',
      is_active: e.is_active !== false,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(DEFAULT_FORM)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        event_name: form.event_name.trim(),
        event_code: form.event_code.trim().toUpperCase().replace(/\s/g, '_'),
        description: form.description.trim() || null,
        start_time: form.start_time ? new Date(form.start_time).toISOString().slice(0, 19).replace('T', ' ') : null,
        end_time: form.end_time ? new Date(form.end_time).toISOString().slice(0, 19).replace('T', ' ') : null,
        location: form.location.trim() || null,
        max_capacity: form.max_capacity ? parseInt(form.max_capacity, 10) : null,
        image_url: form.image_url.trim() || null,
      }
      if (editingId) {
        payload.is_active = form.is_active
        await adminAPI.updateEvent(editingId, payload)
        success('Event updated. Events page will show active events.')
      } else {
        await adminAPI.createEvent(payload)
        success('Event created. It will appear on the public Events page.')
      }
      closeForm()
      loadEvents(true)
    } catch (err) {
      error(err.message || 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (ev) => {
    if (!window.confirm(`Mark "${ev.event_name}" as ${ev.is_active ? 'inactive' : 'active'}?`)) return
    try {
      await adminAPI.updateEvent(ev.id, { is_active: !ev.is_active })
      success('Event status updated')
      loadEvents(true)
    } catch (err) {
      error(err.message || 'Failed to update status')
    }
  }

  const openCheckins = async (eventId) => {
    setCheckinsEventId(eventId)
    try {
      const res = await adminAPI.getEventCheckins(eventId)
      setCheckins(res.data || [])
    } catch (err) {
      error('Failed to load check-ins')
      setCheckins([])
    }
  }

  if (loading) {
    return (
      <div className="event-management">
        <div className="em-loading">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="event-management">
      {NotificationComponent}
      <div className="em-header">
        <div>
          <h2>Upcoming Events</h2>
          <p>Events you create or update here are shown on the public <strong>Events</strong> page. Only active events are visible to visitors.</p>
        </div>
        <div className="em-actions">
          <button type="button" className="em-btn em-btn-refresh" onClick={() => loadEvents(true)} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : '⟳ Refresh'}
          </button>
          <button type="button" className="em-btn em-btn-primary" onClick={openAdd}>
            + Add Event
          </button>
        </div>
      </div>

      <div className="em-table-wrap">
        {events.length === 0 ? (
          <div className="em-empty">
            <p>No events yet. Click <strong>Add Event</strong> to post your first upcoming event.</p>
          </div>
        ) : (
          <table className="em-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td><strong>{ev.event_name}</strong></td>
                  <td><code>{ev.event_code}</code></td>
                  <td>{formatDateTime(ev.start_time)}</td>
                  <td>{formatDateTime(ev.end_time)}</td>
                  <td>{ev.location || '—'}</td>
                  <td>
                    <span className={`em-badge ${ev.is_active ? 'em-badge-active' : 'em-badge-inactive'}`}>
                      {ev.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="em-btn em-btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                    <button type="button" className="em-btn em-btn-sm" onClick={() => handleToggleActive(ev)}>
                      {ev.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className="em-btn em-btn-sm" onClick={() => openCheckins(ev.id)}>Check-ins</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="em-modal-overlay" onClick={closeForm}>
          <div className="em-modal" onClick={(e) => e.stopPropagation()}>
            <div className="em-modal-header">
              <h3>{editingId ? 'Edit Event' : 'Add Event'}</h3>
              <button type="button" className="em-modal-close" onClick={closeForm} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="em-form">
              <div className="em-form-row">
                <label>Event name *</label>
                <input
                  type="text"
                  value={form.event_name}
                  onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                  placeholder="e.g. Lifestyle Wellness Retreat"
                  required
                />
              </div>
              <div className="em-form-row">
                <label>Event code * (unique, e.g. WELLNESS_2026)</label>
                <input
                  type="text"
                  value={form.event_code}
                  onChange={(e) => setForm({ ...form, event_code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  placeholder="WELLNESS_2026"
                  required
                  disabled={!!editingId}
                />
                {editingId && <span className="em-hint">Code cannot be changed after creation.</span>}
              </div>
              <div className="em-form-row">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description for the event"
                  rows={3}
                />
              </div>
              <div className="em-form-row em-form-row-2">
                <div>
                  <label>Start date & time *</label>
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>End date & time *</label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="em-form-row">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Dubai, UAE"
                />
              </div>
              <div className="em-form-row">
                <label>Max capacity (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_capacity}
                  onChange={(e) => setForm({ ...form, max_capacity: e.target.value })}
                  placeholder="e.g. 100"
                />
              </div>
              <div className="em-form-row">
                <label>Image URL (optional – cover on Events page)</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              {editingId && (
                <div className="em-form-row em-form-row-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    {' '}Active (visible on public Events page)
                  </label>
                </div>
              )}
              <div className="em-form-actions">
                <button type="button" className="em-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="em-btn em-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkinsEventId !== null && (
        <div className="em-modal-overlay" onClick={() => setCheckinsEventId(null)}>
          <div className="em-modal em-modal-checkins" onClick={(e) => e.stopPropagation()}>
            <div className="em-modal-header">
              <h3>Event Check-ins</h3>
              <button type="button" className="em-modal-close" onClick={() => setCheckinsEventId(null)} aria-label="Close">×</button>
            </div>
            <div className="em-checkins-list">
              {checkins.length === 0 ? (
                <p>No check-ins yet.</p>
              ) : (
                <table className="em-table">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Tier</th>
                      <th>Check-in time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkins.map((c) => (
                      <tr key={c.id}>
                        <td>{c.member_id}</td>
                        <td>{c.tier || '—'}</td>
                        <td>{formatDateTime(c.checkin_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventManagement
