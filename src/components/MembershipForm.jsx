import React, { useState } from 'react'
import { paymentAPI, authAPI } from '../services/api'
import CreditCard from './CreditCard'
import BankTransfer from './BankTransfer'
import './MembershipForm.css'

const MEMBERSHIP_PLANS = {
  annual: {
    name: 'Annual Membership',
    price: 1000,
    period: 'per year',
    features: [
      'Access to all member benefits',
      'Exclusive events and experiences',
      'Premium partner discounts',
      'Priority customer support'
    ]
  },
  lifetime: {
    name: 'Lifetime Membership',
    price: 5000,
    period: 'one-time',
    features: [
      'All annual benefits',
      'Lifetime access',
      'No renewal fees',
      'VIP status and priority booking',
      'Exclusive lifetime member events'
    ]
  }
}

function MembershipForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    firstName: '',
    lastName: '',
    address: '',
    country: '',
    phoneNumber: '',
    email: '',
    idNumber: '',
    idType: 'emirates_id', // 'emirates_id' or 'passport'
    
    // Step 2: Membership Selection
    membershipType: 'annual', // 'annual' or 'lifetime'
    
    // Step 3: Payment (handled by CC Avenue)
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [userId, setUserId] = useState(null)
  const [receiptFile, setReceiptFile] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required'
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = `${formData.idType === 'emirates_id' ? 'Emirates ID' : 'Passport'} number is required`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        // Save personal information to database
        try {
          setIsSubmitting(true)
          const personalInfo = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            country: formData.country,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            idNumber: formData.idNumber,
            idType: formData.idType,
          }

          const result = await authAPI.savePersonalInfo(personalInfo)
          
          if (result.success) {
            setUserId(result.userId)
            setCurrentStep(2)
          } else {
            setErrors({ general: result.error || 'Failed to save personal information. Please try again.' })
          }
        } catch (error) {
          console.error('Error saving personal info:', error)
          setErrors({ general: error.message || 'Failed to save personal information. Please try again.' })
        } finally {
          setIsSubmitting(false)
        }
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
      handlePayment()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBankTransferReceipt = (file) => {
    setReceiptFile(file)
  }

  const handleBankTransferPayment = async (file) => {
    setIsSubmitting(true)
    setErrors({})

    try {
      const selectedPlan = MEMBERSHIP_PLANS[formData.membershipType]
      const fullName = `${formData.firstName} ${formData.lastName}`

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('receipt', file)
      formDataToSend.append('membershipType', formData.membershipType)
      formDataToSend.append('amount', selectedPlan.price.toString())
      formDataToSend.append('firstName', formData.firstName)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('fullName', fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phoneNumber', formData.phoneNumber)
      formDataToSend.append('mobileNumber', formData.phoneNumber)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('country', formData.country)
      formDataToSend.append('idNumber', formData.idNumber)
      formDataToSend.append('idType', formData.idType)
      formDataToSend.append('userId', userId || '')

      const result = await paymentAPI.submitBankTransfer(formDataToSend)

      if (result.success) {
        // Redirect to success page
        window.location.href = '/payment/success?payment_method=bank_transfer&order_id=' + result.orderId
      } else {
        setErrors({ payment: result.error || 'Failed to submit payment. Please try again.' })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Bank transfer payment error:', error)
      setErrors({ payment: error.message || 'An error occurred. Please try again.' })
      setIsSubmitting(false)
    }
  }

  // CC Avenue payment handler (temporarily disabled)
  const handlePayment = async () => {
    // CC Avenue payment is temporarily disabled
    setErrors({ payment: 'CC Avenue payment is temporarily disabled. Please use Bank Transfer option.' })
  }

  const selectedPlan = MEMBERSHIP_PLANS[formData.membershipType]

  return (
    <div className="membership-form-container">
      {/* Progress Steps */}
      <div className="form-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Personal Info</div>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Membership</div>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div className="form-step">
          <h2 className="step-title">Personal Information</h2>
          <p className="step-subtitle">Please provide your basic details to get started</p>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter your full address"
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select Country</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SA">Saudi Arabia</option>
                <option value="KW">Kuwait</option>
                <option value="QA">Qatar</option>
                <option value="BH">Bahrain</option>
                <option value="OM">Oman</option>
                <option value="Other">Other</option>
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={errors.phoneNumber ? 'error' : ''}
                placeholder="+971 XX XXX XXXX"
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="idType">ID Type *</label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
              >
                <option value="emirates_id">Emirates ID</option>
                <option value="passport">Passport</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">
                {formData.idType === 'emirates_id' ? 'Emirates ID' : 'Passport'} Number *
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                className={errors.idNumber ? 'error' : ''}
                placeholder={`Enter your ${formData.idType === 'emirates_id' ? 'Emirates ID' : 'Passport'} number`}
              />
              {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
            </div>
          </div>

          {errors.general && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6.66667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{errors.general}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Continue to Membership Selection'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Membership Selection */}
      {currentStep === 2 && (
        <div className="form-step">
          <h2 className="step-title">Choose Your Membership</h2>
          <p className="step-subtitle">Select the membership plan that suits you best</p>

          {/* Membership Type Toggle */}
          <div className="membership-toggle">
            <button
              type="button"
              className={`toggle-option ${formData.membershipType === 'annual' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, membershipType: 'annual' })}
            >
              Annual
            </button>
            <button
              type="button"
              className={`toggle-option ${formData.membershipType === 'lifetime' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, membershipType: 'lifetime' })}
            >
              Lifetime
            </button>
          </div>

          {/* Membership Card */}
          <div className={`membership-card ${formData.membershipType === 'lifetime' ? 'featured' : ''}`}>
            <div className="membership-card-content">
              <div className="membership-card-info">
                <div className="membership-card-header">
                  <h3>{selectedPlan.name}</h3>
                  <div className="membership-price">
                    <span className="price-amount">AED {selectedPlan.price.toLocaleString()}</span>
                    <span className="price-period">/{selectedPlan.period}</span>
                  </div>
                </div>
                <ul className="membership-features">
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="membership-card-image-wrapper">
                <CreditCard
                  frontImage={formData.membershipType === 'annual' 
                    ? "/assets/3d/Images/anual_front.png" 
                    : "/assets/3d/Images/card_fronts.png"}
                  backImage={formData.membershipType === 'annual'
                    ? "/assets/3d/Images/anual_back.png"
                    : "/assets/3d/Images/card_back.png"}
                  flipBackImage={false}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleBack}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={handleNext}>
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment - Bank Transfer */}
      {currentStep === 3 && (
        <div className="form-step">
          {errors.payment && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6.66667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{errors.payment}</span>
            </div>
          )}

          <BankTransfer
            membershipType={formData.membershipType}
            amount={selectedPlan.price}
            onReceiptUpload={handleBankTransferReceipt}
            onProceed={handleBankTransferPayment}
            isSubmitting={isSubmitting}
          />

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={handleBack} disabled={isSubmitting}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MembershipForm
