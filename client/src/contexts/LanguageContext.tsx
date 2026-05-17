import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar-eg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isAr: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // NAV
    'nav.learning': 'Learning',
    'nav.schedule': 'Schedule',
    'nav.leaderboard': 'Leaderboard',
    'nav.aicoach': 'AI Coach',
    'nav.challenges': 'Challenges',
    'nav.analytics': 'Analytics',
    'nav.community': 'Community',
    'nav.dashboard': 'Dashboard',
    'nav.getstarted': 'Get Started',
    // HOME
    'hero.badge': 'AI-Powered Smart Learning',
    'hero.title.part1': 'Study Smarter',
    'hero.title.part2': 'Not Harder',
    'hero.subtitle': 'LOCKEDIN combines AI guidance, gamified learning, and personalized scheduling to help you ace your exams.',
    'hero.cta.start': 'Start Learning Today',
    'hero.cta.ai': 'Try AI Coach',
    'hero.stats.students': 'Active Students',
    'hero.stats.success': 'Success Rate',
    'hero.stats.tutoring': 'AI Tutoring',
    'home.hero.title': 'TRANSFORM YOUR STUDY INTO UNSTOPPABLE PROGRESS',
    'home.hero.subtitle': 'The hardcore focus platform that turns study blocks into a high-stakes climb to the top.',
    'home.hero.cta': 'Join the Neural Network',
    // STUDY
    'study.lockin': 'Lock In',
    'study.breach': 'NEURAL BREACH DETECTED!',
    'study.return': 'Return to Session',
    // PROFILE
    'profile.settings.language': 'Language Settings',
    'profile.settings.lang_en': 'English',
    'profile.settings.lang_ar': 'Egyptian Slang (Ammiya)',
    // DASHBOARD
    'dash.hello': 'Hello',
    'dash.subtitle': 'Stay locked in — your goals are waiting.',
    'dash.hero.title': 'Study Smarter with AI-Powered Learning',
    'dash.hero.subtitle': 'Upload your study materials and let LOCKEDIN build your personalized study schedule in seconds.',
    'dash.start': 'Start Learning',
    'dash.schedule': 'View Schedule',
    'dash.stats.users': 'Active Users',
    'dash.stats.success': 'Success Rate',
    'dash.stats.ai': 'AI Support',
    'dash.streak': 'Day Streak',
    'dash.sessions': 'Sessions Done',
    'dash.xp': 'Neural XP',
    'dash.challenges': 'Active Challenges',
    'dash.weekly': 'Weekly Objective',
    'dash.sessions_of': 'of',
    'dash.sessions_done': 'sessions completed',
    'dash.no_goals': 'No active goals in system memory.',
    'dash.neural_sync': 'Neural Synchronicity at',
    'dash.optimization': 'Optimization',
    'dash.rankings': 'Check Global Rankings',
    'dash.rankings_sub': 'See how you stack up against the rest of the network.',
    // SCHEDULE
    'sched.title': 'Neural Timeline',
    'sched.subtitle': 'Synchronizing your biological rhythm with data.',
    'sched.daily': 'Daily Sync',
    'sched.integration': 'Neural Integration',
    'sched.timeline': 'Focus Mode Active',
    'sched.progress_map': 'View Progress Map',
    'sched.new_path': 'Initialize New Path',
    'sched.join': 'Join Session',
    'sched.exam': 'Enter Exam',
    'sched.mark': 'Mark as Synced',
    'sched.locked': 'Neural Locked',
    'sched.empty': 'Timeline Empty',
    'sched.empty_sub': 'No neural paths detected. Initialize a path from your study materials.',
    'sched.start': 'Start Learning',
    'sched.minutes': 'Minutes',
    'sched.phase': 'Phase',
    'sched.review': 'Review Sync',
    'sched.zed': 'ZED Neural Link',
    'sched.active': 'Protocol Active',
    'sched.ease': 'Ease Load',
    'sched.fast': 'Fast Track',
    'sched.break': 'Add Break',
    'sched.input': 'Sync Request...',
    'sched.exam_title': 'Neural Exam',
    'sched.exam_sub': 'Select target question depth',
    'sched.cancel': 'Cancel',
    'sched.init': 'Initialize',
    'sched.synth': 'ZED is synthesizing exam...',
    // CHALLENGES
    'chall.badge': 'System Progression',
    'chall.title': 'NEURAL TASKS',
    'chall.subtitle': 'LEVEL UP YOUR LIFE',
    'chall.desc': 'Transform your daily discipline into measurable growth. Complete challenges to earn XP.',
    'chall.in_progress': 'In Progress',
    'chall.mastered': 'Mastered',
    'chall.all': 'All Segments',
    'chall.progress': 'Neural Progress',
    'chall.xp': 'XP Reward',
    'chall.difficulty': 'Difficulty',
    'chall.synced': 'Synchronized',
    'chall.active': 'Active',
    'chall.reinforce': 'REINFORCE',
    'chall.mastered_btn': 'MASTERED',
    'chall.empty': 'No neural matches found in this segment.',
    // AI COACH
    'ai.title': 'ZED AI Coach',
    'ai.online': 'Neural Link Active',
    'ai.history': 'Neural History',
    'ai.new': 'New Neural Link',
    'ai.training': 'Training Center',
    'ai.recent': 'Recent History',
    'ai.loading': 'Loading memories...',
    'ai.no_history': 'No history found.',
    'ai.knowledge': 'Knowledge Points',
    'ai.level': 'Level',
    'ai.next': 'Next',
    'ai.input': 'Command the AI...',
    'ai.syncing': 'SYNCING NEURAL NETWORK...',
    'ai.study_night': 'Study at Night',
    'ai.exam': 'Exam in 3 Days',
    'ai.easier': 'Make it Easier',
    'ai.weekend': 'Weekend Focus',
    'ai.review': 'More Review',
    'ai.personality': 'Personality Core',
    'ai.lang_proto': 'Language Protocol',
    'ai.facts': 'Active Neural Facts',
    'ai.empty_bank': 'Neural Bank Empty',
    'ai.empty_bank_sub': 'Chat with ZED more to build internal memory.',
    'ai.welcome': 'Welcome to LOCKEDIN! 🔒 I\'m your AI coach. Ask me anything.',
    // ANALYTICS
    'ana.title': 'Analytics',
    'ana.subtitle': 'Track your learning progress',
    'ana.total_time': 'Total Study Time',
    'ana.sessions': 'Sessions',
    'ana.streak': 'Day Streak',
    'ana.completed': 'Completed',
    'ana.hours': 'hours',
    'ana.mins': 'mins',
    'ana.no_data': 'No data yet. Start studying!',
    // LEADERBOARD
    'lb.title': 'Global Rankings',
    'lb.subtitle': 'Top performers in the neural network',
    'lb.rank': 'Rank',
    'lb.name': 'Name',
    'lb.xp': 'XP',
    'lb.streak': 'Streak',
    'lb.level': 'Level',
    'lb.you': 'You',
    'lb.loading': 'Loading rankings...',
    'lb.global': 'Global',
    'lb.friends': 'Friends',
    'lb.weekly': 'Weekly',
    // COMMUNITY
    'comm.title': 'Community',
    'comm.subtitle': 'Connect with fellow learners',
    'comm.post': 'Create Post',
    'comm.like': 'Like',
    'comm.comment': 'Comment',
    'comm.share': 'Share',
    'comm.loading': 'Loading community...',
    'comm.empty': 'No posts yet. Be the first!',
    // NOTIFICATIONS
    'notif.title': 'Notifications',
    'notif.empty': 'No notifications yet.',
    'notif.mark_read': 'Mark all as read',
    // START LEARNING
    'start.title': 'Start Learning',
    'start.subtitle': 'Upload your materials and build your schedule',
    'start.upload': 'Upload Materials',
    'start.generate': 'Generate Schedule',
    'start.subject': 'Subject Name',
    'start.duration': 'Study Duration',
    // STUDY SESSION
    'session.break': 'Take a Break',
    'session.complete': 'Complete Session',
    'session.timer': 'Session Timer',
    'session.focus': 'Stay Focused!',
    'session.distraction': 'Distraction Detected',
    // PROFILE
    'prof.title': 'Profile',
    'prof.edit': 'Edit Profile',
    'prof.save': 'Save Changes',
    'prof.xp': 'Total XP',
    'prof.level': 'Level',
    'prof.streak': 'Current Streak',
    'prof.sessions': 'Sessions',
    'prof.logout': 'Logout',
    // FLASH CARDS
    'flash.title': 'Flash Cards',
    'flash.flip': 'Flip Card',
    'flash.next': 'Next Card',
    'flash.prev': 'Previous',
    'flash.knew': 'I Knew It',
    'flash.missed': 'Missed',
    'flash.complete': 'Set Complete!',
    // GENERAL
    'gen.loading': 'Loading...',
    'gen.error': 'Something went wrong.',
    'gen.retry': 'Try Again',
    'gen.back': 'Back',
    'gen.save': 'Save',
    'gen.cancel': 'Cancel',
    'gen.delete': 'Delete',
    'gen.confirm': 'Confirm',
    'gen.days': 'days',
  },
  'ar-eg': {
    // NAV
    'nav.learning': 'قعدة المذاكرة',
    'nav.schedule': 'جدولي المتظبط',
    'nav.leaderboard': 'أوائل الثانوية',
    'nav.aicoach': 'زيد الذكي',
    'nav.challenges': 'تحديات الوحوش',
    'nav.analytics': 'مستوايا إيه',
    'nav.community': 'القهوة',
    'nav.dashboard': 'لوحة التحكم',
    'nav.getstarted': 'ابدأ دلوقتي يا بطل',
    // HOME
    'hero.badge': 'تعلم ذكي بالذكاء الاصطناعي',
    'hero.title.part1': 'ذاكر بذكاء',
    'hero.title.part2': 'مش بعفرة',
    'hero.subtitle': 'لوكد إن بيجمع بين ذكاء زيد، وجو الألعاب، وجدول متفصل ليك عشان تقفل امتحاناتك.',
    'hero.cta.start': 'ابدأ مذاكرة دلوقتي',
    'hero.cta.ai': 'جرب زيد المدرب',
    'hero.stats.students': 'طلاب جامدين',
    'hero.stats.success': 'نسبة النجاح',
    'hero.stats.tutoring': 'مساعدة 24 ساعة',
    'home.hero.title': 'حول مذاكرتك لسرعة صاروخية مابتوقفش',
    'home.hero.subtitle': 'المنصة اللي هتخليك تركز غصب عنك وتحول المذاكرة لتحدي حقيقي. مفيش دلع.. مفيش تضييع وقت.',
    'home.hero.cta': 'دوس يا وحش',
    // STUDY
    'study.lockin': 'ثبت يا وحش',
    'study.breach': 'إقفش.. فيه تشتيت حصل!',
    'study.return': 'ارجع لمذاكرتك يا بطل',
    // PROFILE
    'profile.settings.language': 'إعدادات اللغة',
    'profile.settings.lang_en': 'إنجليزي',
    'profile.settings.lang_ar': 'عامية مصرية (روقان)',
    // DASHBOARD
    'dash.hello': 'هلا',
    'dash.subtitle': 'ثبت يا بطل — أهدافك بتستناك!',
    'dash.hero.title': 'ذاكر أذكى مع الـ AI',
    'dash.hero.subtitle': 'ارفع موادك وخلي لوكد إن يعمل جدول مذاكرة متفصل ليك في ثوانِ.',
    'dash.start': 'ابدأ تذاكر',
    'dash.schedule': 'شوف الجدول',
    'dash.stats.users': 'مستخدم نشيط',
    'dash.stats.success': 'نسبة النجاح',
    'dash.stats.ai': 'مساعدة لحظية',
    'dash.streak': 'يوم سلسلة',
    'dash.sessions': 'جلسات خلصت',
    'dash.xp': 'نقاط عصبية',
    'dash.challenges': 'تحديات شغالة',
    'dash.weekly': 'هدف الأسبوع',
    'dash.sessions_of': 'من',
    'dash.sessions_done': 'جلسة اتخلصت',
    'dash.no_goals': 'مفيش أهداف دلوقتي. ابدأ يا بطل!',
    'dash.neural_sync': 'نسبة تزامنك',
    'dash.optimization': 'من الهدف',
    'dash.rankings': 'شوف الترتيب العالمي',
    'dash.rankings_sub': 'انت فين من باقي الوحوش في الشبكة؟',
    // SCHEDULE
    'sched.title': 'جدول المذاكرة',
    'sched.subtitle': 'منظم وقتك عشان تذاكر صح.',
    'sched.daily': 'إنجاز اليوم',
    'sched.integration': 'نسبة الإنجاز',
    'sched.timeline': 'وضع التركيز شغال',
    'sched.progress_map': 'خريطة تقدمك',
    'sched.new_path': 'ابدأ مادة جديدة',
    'sched.join': 'ادخل الجلسة',
    'sched.exam': 'امتحن نفسك',
    'sched.mark': 'خلصتها ✓',
    'sched.locked': 'تم القفل ✓',
    'sched.empty': 'الجدول فاضي',
    'sched.empty_sub': 'مفيش جلسات لسه. ابدأ بمادة جديدة!',
    'sched.start': 'ابدأ تذاكر',
    'sched.minutes': 'دقيقة',
    'sched.phase': 'مستوى',
    'sched.review': 'مراجعة',
    'sched.zed': 'زيد الذكي',
    'sched.active': 'متوصل',
    'sched.ease': 'خففها شوية',
    'sched.fast': 'ضغط تاني',
    'sched.break': 'ضيف استراحة',
    'sched.input': 'قول لزيد إيه اللي تريده...',
    'sched.exam_title': 'امتحان عصبي',
    'sched.exam_sub': 'اختار عدد الأسئلة',
    'sched.cancel': 'إلغاء',
    'sched.init': 'ابدأ',
    'sched.synth': 'زيد بيولد الامتحان...',
    // CHALLENGES
    'chall.badge': 'تطور النظام',
    'chall.title': 'تحديات الوحوش',
    'chall.subtitle': 'ارفع مستواك في الحياة',
    'chall.desc': 'حول انضباطك اليومي لتقدم حقيقي. خلص التحديات واكسب نقاط XP.',
    'chall.in_progress': 'جاري',
    'chall.mastered': 'اتخلص',
    'chall.all': 'كل التحديات',
    'chall.progress': 'تقدمك',
    'chall.xp': 'مكافأة XP',
    'chall.difficulty': 'الصعوبة',
    'chall.synced': 'اتخلص ✓',
    'chall.active': 'شغال',
    'chall.reinforce': 'قوّي',
    'chall.mastered_btn': 'اتخلص ✓',
    'chall.empty': 'مفيش تحديات في القسم ده.',
    // AI COACH
    'ai.title': 'زيد مدربك الذكي',
    'ai.online': 'زيد متوصل',
    'ai.history': 'المحادثات',
    'ai.new': 'محادثة جديدة',
    'ai.training': 'تدريب زيد',
    'ai.recent': 'آخر المحادثات',
    'ai.loading': 'بيجيب الذكريات...',
    'ai.no_history': 'مفيش تاريخ.',
    'ai.knowledge': 'نقاط المعرفة',
    'ai.level': 'المستوى',
    'ai.next': 'التالي',
    'ai.input': 'قول لزيد إيه اللي تريده...',
    'ai.syncing': 'زيد بيفكر...',
    'ai.study_night': 'بذاكر بالليل',
    'ai.exam': 'عندي امتحان بعد 3 أيام',
    'ai.easier': 'خفف الجدول شوية',
    'ai.weekend': 'ضغط في الويك إند',
    'ai.review': 'ضيف مراجعة أكتر',
    'ai.personality': 'شخصية زيد',
    'ai.lang_proto': 'لغة زيد',
    'ai.facts': 'اللي زيد اتعلمه عنك',
    'ai.empty_bank': 'زيد مش عارف عنك حاجة',
    'ai.empty_bank_sub': 'كلم زيد أكتر عشان يتعلم عنك.',
    'ai.welcome': 'أهلاً يا بطل! 🔒 أنا زيد مدربك الذكي. اسألني في أي حاجة.',
    // ANALYTICS
    'ana.title': 'إحصائياتك',
    'ana.subtitle': 'تابع تقدمك في المذاكرة',
    'ana.total_time': 'إجمالي وقت المذاكرة',
    'ana.sessions': 'الجلسات',
    'ana.streak': 'السلسلة اليومية',
    'ana.completed': 'اتخلص',
    'ana.hours': 'ساعة',
    'ana.mins': 'دقيقة',
    'ana.no_data': 'مفيش بيانات لسه. ابدأ تذاكر!',
    // LEADERBOARD
    'lb.title': 'أوائل الثانوية',
    'lb.subtitle': 'أقوى الوحوش في الشبكة',
    'lb.rank': 'الترتيب',
    'lb.name': 'الاسم',
    'lb.xp': 'النقاط',
    'lb.streak': 'السلسلة',
    'lb.level': 'المستوى',
    'lb.you': 'إنت',
    'lb.loading': 'بيجيب الترتيب...',
    'lb.global': 'عالمي',
    'lb.friends': 'أصحابي',
    'lb.weekly': 'أسبوعي',
    // COMMUNITY
    'comm.title': 'مجتمع الوحوش',
    'comm.subtitle': 'اتكلم مع الطلاب التانيين',
    'comm.post': 'اكتب بوست',
    'comm.like': 'لايك',
    'comm.comment': 'كومنت',
    'comm.share': 'شير',
    'comm.loading': 'بيجيب البوستات...',
    'comm.empty': 'مفيش بوستات لسه. كن الأول!',
    // NOTIFICATIONS
    'notif.title': 'الإشعارات',
    'notif.empty': 'مفيش إشعارات دلوقتي.',
    'notif.mark_read': 'خلي كل حاجة متقراتش',
    // START LEARNING
    'start.title': 'ابدأ تذاكر',
    'start.subtitle': 'ارفع موادك وعمل الجدول',
    'start.upload': 'ارفع المواد',
    'start.generate': 'اعمل الجدول',
    'start.subject': 'اسم المادة',
    'start.duration': 'مدة المذاكرة',
    // STUDY SESSION
    'session.break': 'خد استراحة',
    'session.complete': 'خلصت الجلسة',
    'session.timer': 'الوقت',
    'session.focus': 'ركز يا بطل!',
    'session.distraction': 'إقفش! تشتيت حصل',
    // PROFILE
    'prof.title': 'بروفايلك',
    'prof.edit': 'عدل البروفايل',
    'prof.save': 'احفظ التغييرات',
    'prof.xp': 'إجمالي النقاط',
    'prof.level': 'المستوى',
    'prof.streak': 'سلسلتك',
    'prof.sessions': 'الجلسات',
    'prof.logout': 'اخرج',
    // FLASH CARDS
    'flash.title': 'الفلاش كاردز',
    'flash.flip': 'قلب الكارت',
    'flash.next': 'الكارت التالي',
    'flash.prev': 'السابق',
    'flash.knew': 'عرفتها',
    'flash.missed': 'فاتتني',
    'flash.complete': 'خلصت الكاردز!',
    // GENERAL
    'gen.loading': 'بيشغل...',
    'gen.error': 'في مشكلة حصلت.',
    'gen.retry': 'جرب تاني',
    'gen.back': 'ارجع',
    'gen.save': 'احفظ',
    'gen.cancel': 'إلغاء',
    'gen.delete': 'امسح',
    'gen.confirm': 'تأكيد',
    'gen.days': 'يوم',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('lockedin_lang') as Language) || 'en';
  });

  const isAr = language === 'ar-eg';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lockedin_lang', lang);
  };

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = isAr ? 'ar' : 'en';
    if (isAr) {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  }, [language, isAr]);

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isAr }}>
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
