import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ScreenshotGallery from './components/ScreenshotGallery';
import HowItWorks from './components/HowItWorks';
import DownloadSection from './components/DownloadSection';
import About from './components/About';
import Footer from './components/Footer';
import SharePage from './pages/SharePage';

function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <ScreenshotGallery />
      <HowItWorks />
      <DownloadSection />
      <About />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-dark selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/share" element={<SharePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
