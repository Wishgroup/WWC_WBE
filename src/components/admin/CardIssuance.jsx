import React, { useState } from 'react'
import { adminAPI } from '../../services/api'
import './CardIssuance.css'

const CardIssuance = () => {
  const [memberId, setMemberId] = useState('')
  const [prepareResult, setPrepareResult] = useState(null)
  const [confirmCardUid, setConfirmCardUid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handlePrepare = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setPrepareResult(null)
    if (!memberId.trim()) {
      setError('Enter member ID')
      return
    }
    setLoading(true)
    try {
      const res = await adminAPI.cardsPrepare(memberId.trim())
      if (res.success) {
        setPrepareResult(res)
        setMessage('Credential prepared. Write to card then confirm below.')
      } else {
        setError(res.error || 'Prepare failed')
      }
    } catch (err) {
      setError(err.message || 'Prepare failed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!prepareResult?.issueSessionId || !prepareResult?.card_public_id) {
      setError('Prepare first')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await adminAPI.cardsConfirm(
        prepareResult.issueSessionId,
        prepareResult.card_public_id,
        confirmCardUid.trim() || undefined
      )
      if (res.success) {
        setMessage('Card issuance confirmed.')
        setPrepareResult(null)
        setConfirmCardUid('')
      } else {
        setError(res.error || 'Confirm failed')
      }
    } catch (err) {
      setError(err.message || 'Confirm failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-issuance">
      <h2>Card issuance (DESFire EV2)</h2>
      <p>Prepare credential for a member, then confirm after writing to card.</p>

      <form onSubmit={handlePrepare} className="card-issuance-form">
        <label>Member ID</label>
        <input
          type="text"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="e.g. 1"
          disabled={!!prepareResult}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Preparing…' : 'Prepare'}
        </button>
      </form>

      {prepareResult && (
        <div className="card-issuance-prepared">
          <p><strong>Session:</strong> {prepareResult.issueSessionId}</p>
          <p><strong>Card public ID:</strong> {prepareResult.card_public_id}</p>
          <p>Write payload + signature to card, then confirm below.</p>
          <form onSubmit={handleConfirm} className="card-issuance-form">
            <label>Card UID (optional, audit only)</label>
            <input
              type="text"
              value={confirmCardUid}
              onChange={(e) => setConfirmCardUid(e.target.value)}
              placeholder="optional"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Confirming…' : 'Confirm issuance'}
            </button>
          </form>
        </div>
      )}

      {message && <div className="card-issuance-message">{message}</div>}
      {error && <div className="card-issuance-error">{error}</div>}
    </div>
  )
}

export default CardIssuance
