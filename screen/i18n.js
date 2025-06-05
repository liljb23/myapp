import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

// ✅ Load the last used language
const getStoredLanguage = async () => {
  try {
    const storedLanguage = await SecureStore.getItemAsync('appLanguage');
    return storedLanguage || 'en';
  } catch (error) {
    console.error('Error getting stored language:', error);
    return 'en';
  }
};

// ✅ Translations
const resources = {
  en: {
    translation: {
      "Change Language": "Change Language",
      "Home": "Home",
      "Settings": "Settings"
    }
  },
  th: {
    translation: {
      "Change Language": "เปลี่ยนภาษา",
      "Home": "หน้าแรก",
      "Settings": "การตั้งค่า"
    }
  },
  ar: {
    translation: {
      "Change Language": "تغيير اللغة",
      "Home": "الصفحة الرئيسية",
      "Settings": "الإعدادات"
    }
  }
};

// ✅ Initialize i18next
const initI18n = async () => {
  const storedLanguage = await getStoredLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: storedLanguage,
      fallbackLng: 'en',
      interpolation: { escapeValue: false }
    });
};

// Initialize i18n
initI18n().catch(console.error);

export default i18n;