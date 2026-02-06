import { useState, useEffect } from 'react'
import { t, getLanguage, setLanguage as setLang, getAvailableLanguages } from '../utils/i18n'

/**
 * Hook for translations
 * Automatically updates when language changes
 */
export const useTranslation = () => {
  const [lang, setLangState] = useState(getLanguage())

  useEffect(() => {
    const handleLanguageChange = () => {
      setLangState(getLanguage())
    }

    window.addEventListener('languagechange', handleLanguageChange)
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange)
    }
  }, [])

  return {
    t,
    language: lang,
    setLanguage: (newLang) => {
      setLang(newLang)
      setLangState(newLang)
    },
  }
}

