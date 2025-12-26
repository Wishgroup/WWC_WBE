import React, { useState, useEffect } from 'react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { paymentAPI } from '../services/api'
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
    paymentMethod: 'Card',
    
    // Policies
    confirmAccuracy: false,
    confirmNonRefundable: false,
    acceptPolicies: false,
    agreeToCommunications: false
  })

  // Validation states
  const [isBasicInfoValid, setIsBasicInfoValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Validate all required fields up to Emergency Contact
  const validateBasicInfo = () => {
    const requiredFields = {
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      passportId: formData.passportId.trim(),
      idFiles: formData.idFiles,
      mobileNumber: formData.mobileNumber.trim(),
      email: formData.email.trim(),
      street: formData.street.trim(),
      city: formData.city.trim(),
      country: formData.country,
      membershipType: formData.membershipType,
      emergencyName: formData.emergencyName.trim(),
      emergencyRelationship: formData.emergencyRelationship.trim(),
      emergencyMobile: formData.emergencyMobile.trim(),
    }

    // Check if all required fields are filled
    const allFieldsFilled = Object.values(requiredFields).every(value => {
      if (value === null) return false
      if (typeof value === 'string') return value.length > 0
      if (value instanceof FileList) return value.length > 0
      return true
    })

    // Validate email format
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

    return allFieldsFilled && emailValid
  }

  // Check validation whenever form data changes
  useEffect(() => {
    setIsBasicInfoValid(validateBasicInfo())
  }, [formData])

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
    
    // Final validation checks
    if (!isBasicInfoValid) {
      setMessage('Please fill in all required fields up to Emergency Contact')
      return
    }

    if (!formData.confirmAccuracy || !formData.confirmNonRefundable || 
        !formData.acceptPolicies || !formData.agreeToCommunications) {
      setMessage('Please accept all policies and agreements')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // Calculate membership amount
      const membershipPrices = {
        'Lifetime': 5000, // AED
        'Annual': 1000,   // AED
      }
      const amount = membershipPrices[formData.membershipType] || membershipPrices['Annual']

      // Prepare billing details
      const billingDetails = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobileNumber,
        address: formData.street,
        city: formData.city,
        state: '',
        zip: '',
        country: formData.country || 'AE',
      }

      // Initiate CC Avenue payment (card details will be collected by CC Avenue)
      // Data will be saved to database only after successful payment
      const paymentResult = await paymentAPI.initiateCCAvenuePayment({
        membershipType: formData.membershipType.toLowerCase(),
        amount,
        billingDetails,
        formData,
      })

      if (paymentResult && paymentResult.success) {
        // Create a form to submit to CC Avenue
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = paymentResult.paymentUrl

        // Add hidden fields
        const fields = {
          encRequest: paymentResult.encryptedData,
          access_code: paymentResult.accessCode,
        }

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      } else {
        const errorMsg = paymentResult?.error || paymentResult?.message || 'Failed to initiate payment'
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      
      // Better error handling
      let errorMessage = 'Failed to process payment. Please try again.'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Could not connect to server. Please check your internet connection and try again.'
      }
      
      setMessage(errorMessage)
      setIsSubmitting(false)
    }
  }

  // Membership prices
  const membershipPrices = {
    'Lifetime': 5000,
    'Annual': 1000,
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
              <div className={`form-message ${message.includes('error') || message.includes('Failed') || message.includes('Please') ? 'error' : 'success'}`}>
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
                    <span>Lifetime Membership - AED {membershipPrices['Lifetime']?.toLocaleString()}</span>
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
                    <span>Annual Membership - AED {membershipPrices['Annual']?.toLocaleString()}</span>
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

            {/* Policies & Agreements - Show after basic info is validated */}
            {isBasicInfoValid && (
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
            )}

            {!isBasicInfoValid && (
              <div className="form-message info">
                Please fill in all required fields up to Emergency Contact to proceed with payment.
              </div>
            )}

            <button 
              type="submit" 
              className="submit-button" 
              disabled={isSubmitting || !isBasicInfoValid || 
                       !formData.confirmAccuracy || !formData.confirmNonRefundable || 
                       !formData.acceptPolicies || !formData.agreeToCommunications}
            >
              {isSubmitting ? 'Redirecting to Payment Gateway...' : 'Proceed to Payment Gateway'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MembershipForm
