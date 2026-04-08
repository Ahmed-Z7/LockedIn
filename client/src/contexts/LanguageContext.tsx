import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar-eg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.learning': 'Learning',
    'nav.schedule': 'Schedule',
    'nav.leaderboard': 'Leaderboard',
    'nav.aicoach': 'AI Coach',
    'nav.challenges': 'Challenges',
    'nav.analytics': 'Analytics',
    'nav.community': 'Community',
    'nav.dashboard': 'Dashboard',
    'nav.getstarted': 'Get Started',
    'hero.badge': 'AI-Powered Smart Learning',
    'hero.title.part1': 'Study Smarter',
    'hero.title.part2': 'Not Harder',
    'hero.subtitle': 'LOCKEDIN combines AI guidance, gamified learning, and personalized scheduling to help you ace your exams with focus and motivation.',
    'hero.cta.start': 'Start Learning Today',
    'hero.cta.ai': 'Try AI Coach',
    'hero.stats.students': 'Active Students',
    'hero.stats.success': 'Success Rate',
    'hero.stats.tutoring': 'AI Tutoring',
    'home.hero.title': 'TRANSFORM YOUR STUDY INTO UNSTOPPABLE PROGRESS',
    'home.hero.subtitle': 'The hardcore focus platform that turns study blocks into a high-stakes climb to the top. No distractions. No excuses.',
    'home.hero.cta': 'Join the Neural Network',
    'profile.settings.language': 'Language Settings',
    'profile.settings.lang_en': 'English',
    'profile.settings.lang_ar': 'Egyptian Slang (Ammiya)',
    'study.lockin': 'Lock In',
    'study.breach': 'NEURAL BREACH DETECTED!',
    'study.return': 'Return to Session'
  },
  'ar-eg': {
    'nav.learning': 'قعدة المذاكرة',
    'nav.schedule': 'جدولي المتظبط',
    'nav.leaderboard': 'أوائل الثانوية',
    'nav.aicoach': 'زيد الذكي',
    'nav.challenges': 'تحديات الوحوش',
    'nav.analytics': 'مستوايا إيه',
    'nav.community': 'القهوة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.getstarted': 'ابدأ دلوقتي يا بطل',
    'hero.badge': 'تعلم ذكي بالذكاء الاصطناعي',
    'hero.title.part1': 'ذاكر بذكاء',
    'hero.title.part2': 'مش بعفرة',
    'hero.subtitle': 'لوكد إن بيجمع بين ذكاء زيد، وجو الألعاب، وجدول متفصل ليك عشان تقفل امتحاناتك بتركيز وحماس.',
    'hero.cta.start': 'ابدأ مذاكرة دلوقتي',
    'hero.cta.ai': 'جرب زيد المدرب',
    'hero.stats.students': 'طلاب جامدين',
    'hero.stats.success': 'نسبة النجاح',
    'hero.stats.tutoring': 'مساعدة 24 ساعة',
    'home.hero.title': 'حول مذاكرتك لسرعة صاروخية مابتوقفش',
    'home.hero.subtitle': 'المنصة اللي هتخليك تركز غصب عنك وتحول المذاكرة لتحدي حقيقي. مفيش دلع.. مفيش تضييع وقت.',
    'home.hero.cta': 'دوس يا وحش',
    'profile.settings.language': 'إعدادات اللغة',
    'profile.settings.lang_en': 'إنجليزي',
    'profile.settings.lang_ar': 'عامية مصرية (روقان)',
    'study.lockin': 'ثبت يا وحش',
    'study.breach': 'إقفش.. فيه تشتيت حصل!',
    'study.return': 'ارجع لمذاكرتك يا بطل'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('lockedin_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lockedin_lang', lang);
  };

  useEffect(() => {
    const isAr = language === 'ar-eg';
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    // Add a class for specific Arabic fonts if needed
    if (isAr) {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
