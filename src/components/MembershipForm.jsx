import React, { useState } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import './MembershipForm.css'

function MembershipForm() {
  const [sectionRef, isSectionVisible] = useScrollAnimation({ threshold: 0.1 })
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    gender: '',
    passportId: '',
    idFiles: null,
    
    // Contact Details
    mobileNumber: '',
    email: '',
    street: '',
    city: '',
    country: '',
    
    // Membership Selection
    membershipType: '',
    referralCode: '',
    referredBy: '',
    renewalPreference: '',
    
    // Professional Information
    occupation: '',
    companyName: '',
    industry: '',
    businessEmail: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyMobile: '',
    
    // Payment Details
    paymentMethod: '',
    transactionId: '',
    paymentReceipt: null,
    
    // Policies
    confirmAccuracy: false,
    confirmNonRefundable: false,
    acceptPolicies: false,
    agreeToCommunications: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      })
    } else if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Send form data to backend
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'info@wishgroup.ae',
          subject: `Membership Application from ${formData.fullName}`,
          text: JSON.stringify(formData, null, 2),
          html: `
            <h2>New Membership Application</h2>
            <pre>${JSON.stringify(formData, null, 2)}</pre>
          `
        })
      })

      if (response.ok) {
        setMessage('Thank you! Your membership application has been submitted successfully.')
        // Reset form
        setFormData({
          fullName: '', dateOfBirth: '', nationality: '', gender: '', passportId: '', idFiles: null,
          mobileNumber: '', email: '', street: '', city: '', country: '',
          membershipType: '', referralCode: '', referredBy: '', renewalPreference: '',
          occupation: '', companyName: '', industry: '', businessEmail: '',
          emergencyName: '', emergencyRelationship: '', emergencyMobile: '',
          paymentMethod: '', transactionId: '', paymentReceipt: null,
          confirmAccuracy: false, confirmNonRefundable: false, acceptPolicies: false, agreeToCommunications: false
        })
      } else {
        throw new Error('Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setMessage('Please email us directly at info@wishgroup.ae with your application.')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  return (
    <div 
      ref={sectionRef}
      className="membership-form-section"
      id="membership-form"
    >
      <div className="container">
        <div className="membership-form-wrapper glass-effect">
          <div className="form-header">
            <h1 className="form-main-title">Begin Your Journey Beyond the Waves</h1>
            <h2 className="form-subtitle">Membership Application Form</h2>
          </div>

          <form className="membership-form" onSubmit={handleSubmit}>
            {message && (
              <div className={`form-message ${message.includes('error') || message.includes('Please email') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            {/* Personal Information */}
            <section className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nationality">Nationality *</label>
                  <select
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Nationality</option>
                    <option value="UAE">UAE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender (Optional)</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="passportId">Passport / Emirates ID Number *</label>
                  <input
                    type="text"
                    id="passportId"
                    name="passportId"
                    value={formData.passportId}
                    onChange={handleChange}
                    required
                    placeholder="Enter ID number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="idFiles">Upload ID (Front & Back) *</label>
                  <input
                    type="file"
                    id="idFiles"
                    name="idFiles"
                    onChange={handleChange}
                    required
                    accept="image/*,.pdf"
                    multiple
                  />
                </div>
              </div>
            </section>

            {/* Contact Details */}
            <section className="form-section">
              <h3 className="section-title">Contact Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mobileNumber">Mobile Number (WhatsApp Enabled) *</label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="street">Residential Address - Street *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  placeholder="Enter street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="UAE">UAE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Membership Selection */}
            <section className="form-section">
              <h3 className="section-title">Membership Selection</h3>
              
              <div className="form-group">
                <label>Choose Your Membership Type *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="membershipType"
                      value="Lifetime"
                      checked={formData.membershipType === 'Lifetime'}
                      onChange={handleChange}
                      required
                    />
                    <span>Lifetime Membership</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="membershipType"
                      value="Annual"
                      checked={formData.membershipType === 'Annual'}
                      onChange={handleChange}
                      required
                    />
                    <span>Annual Membership</span>
                  </label>
                </div>
              </div>

              {formData.membershipType === 'Annual' && (
                <div className="form-group">
                  <label>Renewal Preference</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="renewalPreference"
                        value="Auto-Renew"
                        checked={formData.renewalPreference === 'Auto-Renew'}
                        onChange={handleChange}
                      />
                      <span>Auto-Renew</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="renewalPreference"
                        value="Manual Renewal"
                        checked={formData.renewalPreference === 'Manual Renewal'}
                        onChange={handleChange}
                      />
                      <span>Manual Renewal</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="referralCode">Referral Code (Optional)</label>
                  <input
                    type="text"
                    id="referralCode"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="Enter referral code"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="referredBy">Referred By (Optional)</label>
                  <input
                    type="text"
                    id="referredBy"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                    placeholder="Enter referrer name"
                  />
                </div>
              </div>
            </section>

            {/* Professional Information */}
            <section className="form-section">
              <h3 className="section-title">Professional Information (Optional)</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="occupation">Occupation / Job Title</label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Enter occupation"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Enter industry"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="businessEmail">Business Email</label>
                  <input
                    type="email"
                    id="businessEmail"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    placeholder="Enter business email"
                  />
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="form-section">
              <h3 className="section-title">Emergency Contact</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyName">Full Name *</label>
                  <input
                    type="text"
                    id="emergencyName"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    required
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyRelationship">Relationship *</label>
                  <input
                    type="text"
                    id="emergencyRelationship"
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleChange}
                    required
                    placeholder="Enter relationship"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="emergencyMobile">Mobile Number *</label>
                <input
                  type="tel"
                  id="emergencyMobile"
                  name="emergencyMobile"
                  value={formData.emergencyMobile}
                  onChange={handleChange}
                  required
                  placeholder="Enter emergency contact mobile"
                />
              </div>
            </section>

            {/* Payment Details */}
            <section className="form-section">
              <h3 className="section-title">Payment Details</h3>
              
              <div className="form-group">
                <label>Select Payment Method *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={formData.paymentMethod === 'Card'}
                      onChange={handleChange}
                      required
                    />
                    <span>Card</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Bank Transfer"
                      checked={formData.paymentMethod === 'Bank Transfer'}
                      onChange={handleChange}
                      required
                    />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Payment Link"
                      checked={formData.paymentMethod === 'Payment Link'}
                      onChange={handleChange}
                      required
                    />
                    <span>Payment Link</span>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="transactionId">Transaction ID / Reference Number *</label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    required
                    placeholder="Enter transaction ID"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentReceipt">Upload Payment Receipt *</label>
                  <input
                    type="file"
                    id="paymentReceipt"
                    name="paymentReceipt"
                    onChange={handleChange}
                    required
                    accept="image/*,.pdf"
                  />
                </div>
              </div>
            </section>

            {/* Policies & Agreements */}
            <section className="form-section">
              <h3 className="section-title">Policies & Agreements</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="confirmAccuracy"
                    checked={formData.confirmAccuracy}
                    onChange={handleChange}
                    required
                  />
                  <span>I confirm that all information provided is accurate and true. *</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="confirmNonRefundable"
                    checked={formData.confirmNonRefundable}
                    onChange={handleChange}
                    required
                  />
                  <span>I understand that membership fees are non-refundable. *</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptPolicies"
                    checked={formData.acceptPolicies}
                    onChange={handleChange}
                    required
                  />
                  <span>I accept the Wish Waves Club Policies and Membership Terms. *</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToCommunications"
                    checked={formData.agreeToCommunications}
                    onChange={handleChange}
                    required
                  />
                  <span>I agree to receive updates, notifications, and event communications. *</span>
                </label>
              </div>
            </section>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MembershipForm

