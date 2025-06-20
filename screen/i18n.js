import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

const LANGUAGE_KEY = 'appLanguage';

const languageDetector = {
  type: 'languageDetector',
  async: true, // This is important
  detect: async (callback) => {
    try {
      const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
      callback(storedLanguage || 'en');
    } catch (error) {
      console.error('Error getting stored language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, lng);
    } catch (error) {
      console.error('Error setting stored language:', error);
    }
  },
};

// ✅ Translations
const resources = {
  en: {
    translation: {
      "Hello": "Hello",
      "Change Language": "Change Language",
      "Home": "Home",
      "Settings": "Settings",
      "Logout": "Logout",
      "Search...": "Search...",
      "Login": "Login",
      "Register": "Register",
      "Recommends": "Recommends",
      "See all": "See all",
      "Categories": "Categories",
      "Blog": "Blog",
      "Mosque near you": "Mosque near you",
      "Tourist attractions": "Tourist attractions",
      "Places of prayer near you": "Places of prayer near you",
      "Discounts and benefits": "Discounts and benefits",
      "Thai": "Thai",
      "English": "English",
      "Arabic": "Arabic"
    }
  },
  th: {
    translation: {
      "Hello": "สวัสดี",
      "Change Language": "เปลี่ยนภาษา",
      "Home": "หน้าแรก",
      "Settings": "การตั้งค่า",
      "Logout": "ออกจากระบบ",
      "Search...": "ค้นหา...",
      "Login": "เข้าสู่ระบบ",
      "Register": "สมัครสมาชิก",
      "Recommends": "แนะนำ",
      "See all": "ดูทั้งหมด",
      "Categories": "หมวดหมู่",
      "Blog": "บล็อก",
      "Mosque near you": "มัสยิดใกล้คุณ",
      "Tourist attractions": "สถานที่ท่องเที่ยว",
      "Places of prayer near you": "สถานที่ละหมาดใกล้คุณ",
      "Discounts and benefits": "ส่วนลดและสิทธิประโยชน์",
      "Thai": "ไทย",
      "English": "อังกฤษ",
      "Arabic": "อาหรับ"
    }
  },
  ar: {
    translation: {
      "Hello": "مرحبا",
      "Change Language": "تغيير اللغة",
      "Home": "الصفحة الرئيسية",
      "Settings": "الإعدادات",
      "Logout": "تسجيل الخروج",
      "Search...": "بحث...",
      "Login": "تسجيل الدخول",
      "Register": "تسجيل",
      "Recommends": "موصى به",
      "See all": "عرض الكل",
      "Categories": "الفئات",
      "Blog": "مدونة",
      "Mosque near you": "مسجد بالقرب منك",
      "Tourist attractions": "المعالم السياحية",
      "Places of prayer near you": "أماكن الصلاة بالقرب منك",
      "Discounts and benefits": "الخصومات والمزايا",
      "Thai": "التايلاندية",
      "English": "الإنجليزية",
      "Arabic": "العربية"
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: false, // This is important for preventing issues during initialization
    },
  });

export default i18n;
