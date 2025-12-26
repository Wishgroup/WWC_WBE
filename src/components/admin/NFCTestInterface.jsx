import React, { useState } from 'react'
import { nfcAPI } from '../../services/api'
import './NFCTestInterface.css'

const NFCTestInterface = () => {
  const [formData, setFormData] = useState({
    cardUid: 'CARD123456789',
    posReaderId: 'POS001',
    vendorApiKey: 'VENDOR001',
    latitude: 25.2048,
    longitude: 55.2708,
    transactionAmount: 100.00,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await nfcAPI.validate(
        formData.cardUid,
        formData.posReaderId,
        formData.vendorApiKey,
        {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          transactionAmount: parseFloat(formData.transactionAmount),
        }
      )
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nfc-test-interface">
      <div className="dashboard-header">
        <h1>NFC Validation Test Interface</h1>
        <p>Test NFC card validation with real-time fraud detection and offer calculation</p>
      </div>

      <div className="test-container">
        <div className="test-form-section">
          <h3>Test Parameters</h3>
          <form onSubmit={handleTest} className="test-form">
            <div className="form-group">
              <label>Card UID</label>
              <input
                type="text"
                value={formData.cardUid}
                onChange={(e) => setFormData({ ...formData, cardUid: e.target.value })}
                placeholder="CARD123456789"
                required
              />
            </div>
            <div className="form-group">
              <label>POS Reader ID</label>
              <input
                type="text"
                value={formData.posReaderId}
                onChange={(e) => setFormData({ ...formData, posReaderId: e.target.value })}
                placeholder="POS001"
                required
              />
            </div>
            <div className="form-group">
              <label>Vendor API Key</label>
              <input
                type="text"
                value={formData.vendorApiKey}
                onChange={(e) => setFormData({ ...formData, vendorApiKey: e.target.value })}
                placeholder="VENDOR001"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="25.2048"
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="55.2708"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Transaction Amount (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.transactionAmount}
                onChange={(e) => setFormData({ ...formData, transactionAmount: e.target.value })}
                placeholder="100.00"
              />
            </div>
            <button type="submit" className="test-btn" disabled={loading}>
              {loading ? 'Validating...' : 'Validate NFC Tap'}
            </button>
          </form>
        </div>

        <div className="test-result-section">
          <h3>Validation Result</h3>
          {result ? (
            <div className={`result-card ${result.approved ? 'approved' : 'rejected'}`}>
              <div className="result-header">
                <span className="result-status">
                  {result.approved ? '✅ APPROVED' : '❌ REJECTED'}
                </span>
              </div>
              <div className="result-details">
                {result.approved ? (
                  <>
                    <div className="detail-row">
                      <span className="label">Member ID:</span>
                      <span className="value">{result.memberId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Membership Type:</span>
                      <span className="value">{result.membershipType}</span>
                    </div>
                    {result.offer && (
                      <div className="offer-section">
                        <h4>🎁 Offer Applied</h4>
                        <div className="detail-row">
                          <span className="label">Offer Code:</span>
                          <span className="value">{result.offer.offerCode}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Discount:</span>
                          <span className="value">
                            {result.offer.discountPercentage
                              ? `${result.offer.discountPercentage}%`
                              : `$${result.offer.discountAmount}`}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Currency:</span>
                      <span className="value">{result.currency}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Timestamp:</span>
                      <span className="value">
                        {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-row">
                      <span className="label">Reason:</span>
                      <span className="value error">{result.reason || result.error}</span>
                    </div>
                    {result.fraudScore !== undefined && (
                      <div className="detail-row">
                        <span className="label">Fraud Score:</span>
                        <span className="value">{result.fraudScore}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="no-result">
              <p>Enter test parameters and click "Validate NFC Tap" to test</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NFCTestInterface


