import React from 'react'
import Header from './Header'
import Footer from './Footer'
import LegalNav from './LegalNav'
import SeoJsonLd from './SeoJsonLd'
import './LegalPage.css'

const LAST_UPDATED = 'February 6, 2026'
const BASE_URL = 'https://wishwavesclub.com'

const LegalPage = ({ 
  title, 
  description, 
  path, 
  children,
  jsonLd 
}) => {
  // Set page title and meta tags
  React.useEffect(() => {
    document.title = title
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', description)

    // Update or create canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${BASE_URL}${path}`)

    // OpenGraph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${BASE_URL}${path}` },
    ]

    ogTags.forEach(tag => {
      let meta = document.querySelector(`meta[property="${tag.property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', tag.property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', tag.content)
    })

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ]

    twitterTags.forEach(tag => {
      let meta = document.querySelector(`meta[name="${tag.name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', tag.name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', tag.content)
    })
  }, [title, description, path])

  return (
    <div className="legal-page">
      <SeoJsonLd data={jsonLd} />
      <Header />
      <div className="legal-page-container">
        <LegalNav />
        <div className="legal-content-wrapper">
          <div className="legal-content">
            <div className="legal-header">
              <h1>{title.replace(' | Wish Waves Club (WWC)', '')}</h1>
              <p className="last-updated">Last updated: {LAST_UPDATED}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default LegalPage


