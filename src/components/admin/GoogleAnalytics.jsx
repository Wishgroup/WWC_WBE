import React, { useState, useEffect } from 'react'
import { initGA } from '../../utils/analytics'
import './GoogleAnalytics.css'

const GoogleAnalytics = () => {
  const [gaMeasurementId, setGaMeasurementId] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [dateRange, setDateRange] = useState('7d') // 7d, 30d, 90d, custom

  useEffect(() => {
    // Get GA Measurement ID - default to the one in index.html
    const defaultId = 'G-3P4J56LFXP'
    const storedId = localStorage.getItem('ga_measurement_id') || 
                    import.meta.env.VITE_GA_MEASUREMENT_ID || 
                    defaultId
    setGaMeasurementId(storedId)
    
    // Load analytics data if ID is available
    if (storedId) {
      loadAnalyticsData(storedId)
    }
  }, [dateRange])

  const loadAnalyticsData = async (measurementId) => {
    setLoading(true)
    try {
      // Note: To get real-time data, you would need to use Google Analytics Reporting API
      // For now, we'll show instructions and embed Google Analytics dashboard
      // In production, you would call your backend API which uses GA Reporting API
      
      // Simulated data structure (replace with actual API call)
      const mockData = {
        visitors: {
          today: 1245,
          yesterday: 1189,
          change: 4.7,
        },
        pageViews: {
          today: 3421,
          yesterday: 3156,
          change: 8.4,
        },
        conversions: {
          today: 23,
          yesterday: 19,
          change: 21.1,
        },
        conversionRate: {
          today: 1.84,
          yesterday: 1.60,
          change: 15.0,
        },
        topPages: [
          { path: '/', views: 1245, title: 'Home' },
          { path: '/join', views: 856, title: 'Join' },
          { path: '/benefits', views: 623, title: 'Benefits' },
          { path: '/events', views: 412, title: 'Events' },
          { path: '/login', views: 285, title: 'Login' },
        ],
        trafficSources: [
          { source: 'Direct', visitors: 1245, percentage: 45.2 },
          { source: 'Organic Search', visitors: 856, percentage: 31.1 },
          { source: 'Social Media', visitors: 412, percentage: 15.0 },
          { source: 'Referral', visitors: 234, percentage: 8.5 },
          { source: 'Email', visitors: 8, percentage: 0.3 },
        ],
        devices: [
          { device: 'Desktop', visitors: 1245, percentage: 45.2 },
          { device: 'Mobile', visitors: 1234, percentage: 44.8 },
          { device: 'Tablet', visitors: 278, percentage: 10.1 },
        ],
        countries: [
          { country: 'United Arab Emirates', visitors: 1856, percentage: 67.4 },
          { country: 'Saudi Arabia', visitors: 456, percentage: 16.6 },
          { country: 'United Kingdom', visitors: 234, percentage: 8.5 },
          { country: 'United States', visitors: 123, percentage: 4.5 },
          { country: 'Other', visitors: 88, percentage: 3.2 },
        ],
      }
      
      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGAId = () => {
    if (gaMeasurementId && gaMeasurementId.trim()) {
      localStorage.setItem('ga_measurement_id', gaMeasurementId.trim())
      // Initialize GA immediately
      initGA(gaMeasurementId.trim())
      alert('Google Analytics Measurement ID saved! Analytics tracking is now active.')
      // Reload analytics data
      loadAnalyticsData(gaMeasurementId.trim())
    } else {
      alert('Please enter a valid Google Analytics Measurement ID')
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (num) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
  }

  return (
    <div className="google-analytics-admin">
      <div className="analytics-header">
        <div>
          <h1>Google Analytics</h1>
          <p>Monitor website visits, conversions, and business intelligence</p>
        </div>
        <div className="ga-config">
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={gaMeasurementId}
            onChange={(e) => setGaMeasurementId(e.target.value)}
            className="ga-id-input"
          />
          <button onClick={handleSaveGAId} className="btn-save-ga">
            Save GA ID
          </button>
        </div>
      </div>

      {!gaMeasurementId && (
        <div className="ga-setup-notice">
          <h3>📊 Setup Google Analytics</h3>
          <p>To view analytics data, you need to configure your Google Analytics Measurement ID:</p>
          <ol>
            <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">Google Analytics</a></li>
            <li>Create a property or select an existing one</li>
            <li>Go to Admin → Data Streams → Web</li>
            <li>Copy your Measurement ID (format: G-XXXXXXXXXX)</li>
            <li>Enter it above and click "Save GA ID"</li>
            <li>Add the ID to your <code>.env</code> file as <code>VITE_GA_MEASUREMENT_ID</code></li>
          </ol>
          <p className="note">
            <strong>Note:</strong> For real-time data, you'll need to set up Google Analytics Reporting API 
            on the backend. This dashboard shows the structure - connect it to your GA API for live data.
          </p>
        </div>
      )}

      {gaMeasurementId && (
        <>
          <div className="date-range-selector">
            <button
              className={dateRange === '7d' ? 'active' : ''}
              onClick={() => setDateRange('7d')}
            >
              Last 7 Days
            </button>
            <button
              className={dateRange === '30d' ? 'active' : ''}
              onClick={() => setDateRange('30d')}
            >
              Last 30 Days
            </button>
            <button
              className={dateRange === '90d' ? 'active' : ''}
              onClick={() => setDateRange('90d')}
            >
              Last 90 Days
            </button>
            <a
              href="https://analytics.google.com/analytics/web/#/p13543826519/realtime/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-ga"
            >
              View in Google Analytics →
            </a>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading analytics data...</p>
            </div>
          ) : analyticsData ? (
            <>
              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Visitors</span>
                    <span className={`metric-change ${analyticsData.visitors.change >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(analyticsData.visitors.change)}
                    </span>
                  </div>
                  <div className="metric-value">{formatNumber(analyticsData.visitors.today)}</div>
                  <div className="metric-subtext">vs {formatNumber(analyticsData.visitors.yesterday)} yesterday</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Page Views</span>
                    <span className={`metric-change ${analyticsData.pageViews.change >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(analyticsData.pageViews.change)}
                    </span>
                  </div>
                  <div className="metric-value">{formatNumber(analyticsData.pageViews.today)}</div>
                  <div className="metric-subtext">vs {formatNumber(analyticsData.pageViews.yesterday)} yesterday</div>
                </div>

                <div className="metric-card highlight">
                  <div className="metric-header">
                    <span className="metric-label">Conversions</span>
                    <span className={`metric-change ${analyticsData.conversions.change >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(analyticsData.conversions.change)}
                    </span>
                  </div>
                  <div className="metric-value">{formatNumber(analyticsData.conversions.today)}</div>
                  <div className="metric-subtext">vs {formatNumber(analyticsData.conversions.yesterday)} yesterday</div>
                </div>

                <div className="metric-card highlight">
                  <div className="metric-header">
                    <span className="metric-label">Conversion Rate</span>
                    <span className={`metric-change ${analyticsData.conversionRate.change >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(analyticsData.conversionRate.change)}
                    </span>
                  </div>
                  <div className="metric-value">{analyticsData.conversionRate.today}%</div>
                  <div className="metric-subtext">vs {analyticsData.conversionRate.yesterday}% yesterday</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Top Pages</h3>
                  <div className="top-pages-list">
                    {analyticsData.topPages.map((page, index) => (
                      <div key={index} className="page-item">
                        <div className="page-info">
                          <span className="page-rank">#{index + 1}</span>
                          <div>
                            <div className="page-title">{page.title}</div>
                            <div className="page-path">{page.path}</div>
                          </div>
                        </div>
                        <div className="page-views">{formatNumber(page.views)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Traffic Sources</h3>
                  <div className="traffic-sources-list">
                    {analyticsData.trafficSources.map((source, index) => (
                      <div key={index} className="source-item">
                        <div className="source-header">
                          <span className="source-name">{source.source}</span>
                          <span className="source-percentage">{source.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <div className="source-visitors">{formatNumber(source.visitors)} visitors</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Devices</h3>
                  <div className="devices-list">
                    {analyticsData.devices.map((device, index) => (
                      <div key={index} className="device-item">
                        <div className="device-header">
                          <span className="device-name">{device.device}</span>
                          <span className="device-percentage">{device.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                        <div className="device-visitors">{formatNumber(device.visitors)} visitors</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Top Countries</h3>
                  <div className="countries-list">
                    {analyticsData.countries.map((country, index) => (
                      <div key={index} className="country-item">
                        <div className="country-header">
                          <span className="country-name">{country.country}</span>
                          <span className="country-percentage">{country.percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${country.percentage}%` }}
                          ></div>
                        </div>
                        <div className="country-visitors">{formatNumber(country.visitors)} visitors</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Intelligence Insights */}
              <div className="insights-section">
                <h3>Business Intelligence Insights</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <h4>Conversion Trend</h4>
                      <p>
                        Conversion rate increased by {formatPercentage(analyticsData.conversionRate.change)} 
                        compared to yesterday. This indicates strong performance in membership signups.
                      </p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">🎯</div>
                    <div className="insight-content">
                      <h4>Top Converting Page</h4>
                      <p>
                        "{analyticsData.topPages[0].title}" page has the highest traffic with{' '}
                        {formatNumber(analyticsData.topPages[0].views)} views. Consider optimizing 
                        this page for better conversions.
                      </p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📱</div>
                    <div className="insight-content">
                      <h4>Mobile Traffic</h4>
                      <p>
                        {analyticsData.devices.find(d => d.device === 'Mobile')?.percentage}% of 
                        visitors are on mobile devices. Ensure mobile experience is optimized.
                      </p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">🌍</div>
                    <div className="insight-content">
                      <h4>Geographic Focus</h4>
                      <p>
                        {analyticsData.countries[0].country} accounts for{' '}
                        {analyticsData.countries[0].percentage}% of traffic. Consider localized 
                        marketing campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

export default GoogleAnalytics

