import { useEffect } from 'react'

/**
 * SEO JSON-LD Component
 * Injects structured data for SEO
 */
const SeoJsonLd = ({ data }) => {
  useEffect(() => {
    if (!data) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    script.id = 'seo-json-ld'
    
    // Remove existing script if present
    const existing = document.getElementById('seo-json-ld')
    if (existing) {
      existing.remove()
    }
    
    document.head.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById('seo-json-ld')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [data])

  return null
}

export default SeoJsonLd


