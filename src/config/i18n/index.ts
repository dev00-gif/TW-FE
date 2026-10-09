import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import errorsEn from './locales/errors.en.json'
import errorsVi from './locales/errors.vi.json'
import vi from './locales/vi.json'
// Feature translations
import mediaEn from '@/features/admin/media/i18n/en.json'
import mediaVi from '@/features/admin/media/i18n/vi.json'
import postsEn from '@/features/admin/posts/i18n/en.json'
import postsVi from '@/features/admin/posts/i18n/vi.json'
import adminUsersEn from '@/features/admin/users/i18n/en.json'
import adminUsersVi from '@/features/admin/users/i18n/vi.json'
import settingsEn from '@/features/admin/settings/i18n/en.json'
import settingsVi from '@/features/admin/settings/i18n/vi.json'
import dashboardEn from '@/features/admin/dashboard/i18n/en.json'
import dashboardVi from '@/features/admin/dashboard/i18n/vi.json'
import schedulesEn from '@/features/admin/schedules/i18n/en.json'
import schedulesVi from '@/features/admin/schedules/i18n/vi.json'
import devicesEn from '@/features/admin/devices/i18n/en.json'
import devicesVi from '@/features/admin/devices/i18n/vi.json'
import bulletinsEn from '@/features/admin/bulletins/i18n/en.json'
import bulletinsVi from '@/features/admin/bulletins/i18n/vi.json'
import reportsEn from '@/features/admin/reports/i18n/en.json'
import reportsVi from '@/features/admin/reports/i18n/vi.json'
import locationsEn from '@/features/admin/locations/i18n/en.json'
import locationsVi from '@/features/admin/locations/i18n/vi.json'
import i18n from 'i18next'

export const LANGUAGES = {
  vi: { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
} as const

export type LanguageCode = keyof typeof LANGUAGES

const STORAGE_KEY = 'language'
const DEFAULT_LANGUAGE: LanguageCode = 'vi'

// Get saved language from localStorage or use default
const getSavedLanguage = (): LanguageCode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in LANGUAGES) {
      return saved as LanguageCode
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_LANGUAGE
}

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: vi,
      apiErrors: errorsVi,
      media: mediaVi,
      posts: postsVi,
      adminUsers: adminUsersVi,
      adminSettings: settingsVi,
      adminDashboard: dashboardVi,
      adminSchedules: schedulesVi,
      adminDevices: devicesVi,
      adminBulletins: bulletinsVi,
      adminReports: reportsVi,
      adminLocations: locationsVi,
    },
    en: {
      translation: en,
      apiErrors: errorsEn,
      media: mediaEn,
      posts: postsEn,
      adminUsers: adminUsersEn,
      adminSettings: settingsEn,
      adminDashboard: dashboardEn,
      adminSchedules: schedulesEn,
      adminDevices: devicesEn,
      adminBulletins: bulletinsEn,
      adminReports: reportsEn,
      adminLocations: locationsEn,
    },
  },
  lng: getSavedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  returnNull: false,
  defaultNS: 'translation',
  ns: [
    'translation',
    'apiErrors',
    'auth',
    'media',
    'posts',
    'adminUsers',
    'adminSettings',
    'adminDashboard',
    'adminSchedules',
    'adminDevices',
    'adminBulletins',
    'adminReports',
    'adminLocations',
  ],
})

// Save language to localStorage when changed
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    // Ignore localStorage errors
  }
})

export default i18n
