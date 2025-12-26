import React, { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import './CountryRules.css'

const CountryRules = () => {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    country_code: '',
    country_name: '',
    allowed_membership_types: ['annual', 'lifetime'],
    max_discount_percentage: 25,
    currency: 'AED',
    tax_rules: { vat_rate: 5.0 },
    compliance_restrictions: {},
    blackout_periods: {},
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateCountryRules(formData)
      alert('Country rules updated successfully')
      setShowForm(false)
      // Reload rules
    } catch (error) {
      alert('Error updating rules: ' + error.message)
    }
  }

  return (
    <div className="country-rules">
      <div className="dashboard-header">
        <h1>Country Rules Management</h1>
        <p>Configure country-specific business rules and restrictions</p>
      </div>

      <div className="rules-section">
        <div className="section-header">
          <h3>Country Rules</h3>
          <button className="create-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add/Update Rule'}
          </button>
        </div>

        {showForm && (
          <form className="rules-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Country Code (ISO)</label>
                <input
                  type="text"
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
                  placeholder="AE, US, GB, etc."
                  required
                />
              </div>
              <div className="form-group">
                <label>Country Name</label>
                <input
                  type="text"
                  value={formData.country_name}
                  onChange={(e) => setFormData({ ...formData, country_name: e.target.value })}
                  placeholder="United Arab Emirates"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  placeholder="AED"
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Discount %</label>
                <input
                  type="number"
                  value={formData.max_discount_percentage}
                  onChange={(e) => setFormData({ ...formData, max_discount_percentage: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Allowed Membership Types</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allowed_membership_types.includes('annual')}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.allowed_membership_types, 'annual']
                        : formData.allowed_membership_types.filter(t => t !== 'annual')
                      setFormData({ ...formData, allowed_membership_types: types })
                    }}
                  />
                  Annual
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allowed_membership_types.includes('lifetime')}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.allowed_membership_types, 'lifetime']
                        : formData.allowed_membership_types.filter(t => t !== 'lifetime')
                      setFormData({ ...formData, allowed_membership_types: types })
                    }}
                  />
                  Lifetime
                </label>
              </div>
            </div>
            <button type="submit" className="submit-btn">Save Rules</button>
          </form>
        )}

        <div className="rules-info">
          <p>Country rules are config-driven and editable via this interface. Changes take effect immediately.</p>
        </div>
      </div>
    </div>
  )
}

export default CountryRules


