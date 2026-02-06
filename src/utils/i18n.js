/**
 * Internationalization (i18n) System
 * Supports multiple languages with fallback to English
 */

const translations = {
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      noResults: 'No results found',
    },
    // Navigation
    nav: {
      home: 'Home',
      join: 'Join',
      benefits: 'Benefits',
      events: 'Events',
      login: 'Login',
      support: 'Support',
    },
    // Membership
    membership: {
      annual: 'Annual Membership',
      lifetime: 'Lifetime Membership',
      price: 'Price',
      perYear: 'per year',
      oneTime: 'one-time',
      joinNow: 'Join Now',
      exploreMembership: 'Explore Membership',
    },
    // Currency
    currency: {
      symbol: '$',
      code: 'USD',
      name: 'US Dollar',
    },
  },
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      submit: 'إرسال',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      search: 'بحث',
      filter: 'تصفية',
      noResults: 'لا توجد نتائج',
    },
    nav: {
      home: 'الرئيسية',
      join: 'انضم',
      benefits: 'المزايا',
      events: 'الفعاليات',
      login: 'تسجيل الدخول',
      support: 'الدعم',
    },
    membership: {
      annual: 'عضوية سنوية',
      lifetime: 'عضوية مدى الحياة',
      price: 'السعر',
      perYear: 'سنوياً',
      oneTime: 'مرة واحدة',
      joinNow: 'انضم الآن',
      exploreMembership: 'استكشف العضوية',
    },
    currency: {
      symbol: '$',
      code: 'USD',
      name: 'دولار أمريكي',
    },
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      submit: 'Soumettre',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      filter: 'Filtrer',
      noResults: 'Aucun résultat trouvé',
    },
    nav: {
      home: 'Accueil',
      join: 'Rejoindre',
      benefits: 'Avantages',
      events: 'Événements',
      login: 'Connexion',
      support: 'Support',
    },
    membership: {
      annual: 'Adhésion annuelle',
      lifetime: 'Adhésion à vie',
      price: 'Prix',
      perYear: 'par an',
      oneTime: 'unique',
      joinNow: 'Rejoindre maintenant',
      exploreMembership: 'Explorer l\'adhésion',
    },
    currency: {
      symbol: '$',
      code: 'USD',
      name: 'Dollar américain',
    },
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      submit: 'Enviar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      noResults: 'No se encontraron resultados',
    },
    nav: {
      home: 'Inicio',
      join: 'Unirse',
      benefits: 'Beneficios',
      events: 'Eventos',
      login: 'Iniciar sesión',
      support: 'Soporte',
    },
    membership: {
      annual: 'Membresía anual',
      lifetime: 'Membresía de por vida',
      price: 'Precio',
      perYear: 'por año',
      oneTime: 'única vez',
      joinNow: 'Únete ahora',
      exploreMembership: 'Explorar membresía',
    },
    currency: {
      symbol: '$',
      code: 'USD',
      name: 'Dólar estadounidense',
    },
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭',
      submit: '提交',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      search: '搜索',
      filter: '筛选',
      noResults: '未找到结果',
    },
    nav: {
      home: '首页',
      join: '加入',
      benefits: '福利',
      events: '活动',
      login: '登录',
      support: '支持',
    },
    membership: {
      annual: '年度会员',
      lifetime: '终身会员',
      price: '价格',
      perYear: '每年',
      oneTime: '一次性',
      joinNow: '立即加入',
      exploreMembership: '探索会员',
    },
    currency: {
      symbol: '$',
      code: 'USD',
      name: '美元',
    },
  },
  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      close: 'बंद करें',
      submit: 'सबमिट करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      noResults: 'कोई परिणाम नहीं मिला',
    },
    nav: {
      home: 'होम',
      join: 'शामिल हों',
      benefits: 'लाभ',
      events: 'इवेंट्स',
      login: 'लॉगिन',
      support: 'सहायता',
    },
    membership: {
      annual: 'वार्षिक सदस्यता',
      lifetime: 'आजीवन सदस्यता',
      price: 'मूल्य',
      perYear: 'प्रति वर्ष',
      oneTime: 'एक बार',
      joinNow: 'अभी शामिल हों',
      exploreMembership: 'सदस्यता देखें',
    },
    currency: {
      symbol: '$',
      code: 'USD',
      name: 'अमेरिकी डॉलर',
    },
  },
}

// Get current language from localStorage, default to English
// English is always the default - browser language detection is disabled
const getCurrentLanguage = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('wwc_language')
    if (stored && translations[stored]) {
      return stored
    }
    // Always default to English - don't auto-detect from browser
    return 'en'
  }
  return 'en'
}

// Current language state
let currentLanguage = getCurrentLanguage()

// Translation function
export const t = (key, params = {}) => {
  const keys = key.split('.')
  let value = translations[currentLanguage]
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k]
    } else {
      // Fallback to English
      value = translations.en
      for (const k2 of keys) {
        if (value && value[k2]) {
          value = value[k2]
        } else {
          return key // Return key if translation not found
        }
      }
      break
    }
  }
  
  // Replace parameters
  if (typeof value === 'string' && params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] || match
    })
  }
  
  return value || key
}

// Set language
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem('wwc_language', lang)
      // Update HTML lang attribute
      document.documentElement.lang = lang
      // Trigger custom event for components to re-render
      window.dispatchEvent(new Event('languagechange'))
    }
  }
}

// Get current language
export const getLanguage = () => currentLanguage

// Get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ]
}

// Format currency
export const formatCurrency = (amount, showCode = false) => {
  const currency = translations[currentLanguage]?.currency || translations.en.currency
  const formatted = new Intl.NumberFormat(getLanguage() === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  
  if (showCode) {
    return `${formatted} ${currency.code}`
  }
  return formatted
}

// Initialize language on load - always default to English
if (typeof window !== 'undefined') {
  const lang = getCurrentLanguage()
  setLanguage(lang)
  // Ensure HTML attributes are set correctly for English by default
  if (!localStorage.getItem('wwc_language')) {
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  }
}

