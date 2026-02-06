import React, { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { getAvailableLanguages } from '../utils/i18n'
import './LanguageSelector.css'

const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const languages = getAvailableLanguages()

  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="language-selector">
      <button
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className="language-icon">🌐</span>
        <span className="language-code">{currentLang.code.toUpperCase()}</span>
        <span className="language-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <>
          <div className="language-overlay" onClick={() => setIsOpen(false)} />
          <div className="language-dropdown">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
              >
                <span className="language-name">{lang.nativeName}</span>
                <span className="language-english-name">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSelector

