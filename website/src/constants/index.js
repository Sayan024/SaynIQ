import { 
  FaStickyNote, 
  FaBrain, 
  FaRobot, 
  FaLock, 
  FaTasks, 
  FaFire, 
  FaBell, 
  FaRss, 
  FaLink, 
  FaChartLine,
  FaGithub,
  FaAndroid
} from 'react-icons/fa';

export const NAV_LINKS = [
  { name: 'Features', href: '#features' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'About', href: '#about' },
];

export const FEATURES = [
  {
    title: 'AI Notes',
    description: 'Transform your scattered thoughts into structured, searchable notes with AI assistance.',
    icon: FaStickyNote,
  },
  {
    title: 'Knowledge Hub',
    description: 'A centralized vault for all your research, links, and documents.',
    icon: FaBrain,
  },
  {
    title: 'AI Chat Assistant',
    description: 'Context-aware assistant that knows your data and helps you find answers fast.',
    icon: FaRobot,
  },
  {
    title: 'Password Vault',
    description: 'Securely store and manage your credentials with military-grade encryption.',
    icon: FaLock,
  },
  {
    title: 'Task Manager',
    description: 'Stay organized with smart task prioritization and progress tracking.',
    icon: FaTasks,
  },
  {
    title: 'Daily Streaks',
    description: 'Build lasting habits with gamified streak tracking and motivation.',
    icon: FaFire,
  },
  {
    title: 'Reminder Alerts',
    description: 'Never miss a beat with intelligent, context-sensitive notifications.',
    icon: FaBell,
  },
  {
    title: 'Trending Tech Feed',
    description: 'Stay ahead of the curve with a curated feed of the latest in tech.',
    icon: FaRss,
  },
  {
    title: 'Smart Link Saver',
    description: 'Automatically extract metadata and organize links you save for later.',
    icon: FaLink,
  },
  {
    title: 'Productivity Insights',
    description: 'Visual analytics to help you understand and improve your workflow.',
    icon: FaChartLine,
  },
];

export const STEPS = [
  {
    title: 'Save Notes & Links',
    description: 'Capture anything from your browser or mind instantly.',
    icon: FaLink,
  },
  {
    title: 'Organize Knowledge',
    description: 'SaynIQ automatically categorizes and connects your data.',
    icon: FaBrain,
  },
  {
    title: 'Use AI Assistant',
    description: 'Query your knowledge base using natural language.',
    icon: FaRobot,
  },
  {
    title: 'Track Productivity',
    description: 'Monitor your focus and task completion in real-time.',
    icon: FaChartLine,
  },
  {
    title: 'Never Forget',
    description: 'Your second brain remembers so you don\'t have to.',
    icon: FaFire,
  },
];

export const APP_INFO = {
  name: 'SaynIQ',
  tagline: 'Your AI Second Brain',
  description: 'SaynIQ is a premium AI-powered productivity platform designed to help you capture, organize, and leverage your knowledge like never before.',
  version: 'v1.0.0',
  androidSupport: 'Android 8.0+',
  githubUrl: 'https://github.com/Sayan024/SaynIQ?utm_source=chatgpt.com',
  apkUrl: 'https://drive.usercontent.google.com/download?id=1785mTQpLjkcCLzc_HKnXxcUBpn_0cBzO&export=download',
  developer: 'Sayan Banerjee',
};

export const SCREENSHOTS = [
  { id: 1, src: '/screenshots/screen1.png', alt: 'SaynIQ AI Chat Interface' },
  { id: 2, src: '/screenshots/screen2.png', alt: 'Secure Password Vault' },
  { id: 3, src: '/screenshots/screen3.png', alt: 'Task Management Dashboard' },
  { id: 4, src: '/screenshots/screen4.png', alt: 'Knowledge Hub Overview' },
  { id: 5, src: '/screenshots/screen5.png', alt: 'Save Link and Metadata Fetching' },
];
