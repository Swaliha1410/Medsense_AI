import React, { createContext, useContext, useEffect, useState } from 'react'

// Map display names to Google Translate language codes
const LANGUAGE_CODES = {
  English:    'en',
  Spanish:    'es',
  French:     'fr',
  German:     'de',
  Arabic:     'ar',
  Hindi:      'hi',
  Mandarin:   'zh-CN',
  Portuguese: 'pt',
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('medsense_language') || 'English'
  )

  // Inject the Google Translate script once on mount
  useEffect(() => {
    // Define the callback Google Translate will call when ready
    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-new
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          // Disable the Google toolbar banner entirely
          layout: window.google.translate.TranslateElement.InlineLayout.NONE,
        },
        'google_translate_element'
      )

      // Restore persisted language after widget initialises
      const saved = localStorage.getItem('medsense_language')
      if (saved && saved !== 'English') {
        applyGoogleTranslate(LANGUAGE_CODES[saved])
      }
    }

    if (!document.getElementById('gt-script')) {
      const script = document.createElement('script')
      script.id = 'gt-script'
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  /** Programmatically select a language in the hidden GT combo-box */
  function applyGoogleTranslate(langCode) {
    if (langCode === 'en') {
      // Restore original language
      const restore = document.querySelector('.goog-te-banner-frame')
      if (restore) {
        const btn = restore.contentDocument?.querySelector('.goog-te-button button')
        btn?.click()
        return
      }
      // Fallback: hit the "show original" cookie trick
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname
      window.location.reload()
      return
    }

    // Set the cookie Google Translate reads
    const cookieVal = `/en/${langCode}`
    document.cookie = `googtrans=${cookieVal}; path=/`
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${location.hostname}`

    // Also trigger via the hidden select element if the widget is ready
    const trySelect = () => {
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        select.value = langCode
        select.dispatchEvent(new Event('change'))
        return true
      }
      return false
    }

    if (!trySelect()) {
      // Widget not ready yet — retry up to 20× every 200 ms
      let attempts = 0
      const interval = setInterval(() => {
        if (trySelect() || ++attempts >= 20) clearInterval(interval)
      }, 200)
    }
  }

  /** Called from Settings when the user picks a language */
  function changeLanguage(displayName) {
    setLanguage(displayName)
    localStorage.setItem('medsense_language', displayName)
    applyGoogleTranslate(LANGUAGE_CODES[displayName] ?? 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, LANGUAGE_CODES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
