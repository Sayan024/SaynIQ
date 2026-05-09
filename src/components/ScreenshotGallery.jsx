import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpandAlt, FaTimes } from 'react-icons/fa';
import { SCREENSHOTS } from '../constants';

const ScreenshotGallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <section id="gallery" className="py-24 bg-dark-soft relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Inside <span className="text-accent">SaynIQ</span></h2>
          <p className="text-white/50 max-w-2xl mx-auto">Take a look at the beautiful and intuitive interface of your new productivity companion.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {SCREENSHOTS.map((screen) => (
            <motion.div
              key={screen.id}
              whileHover={{ y: -10 }}
              className="relative aspect-[9/19] rounded-[2rem] overflow-hidden border-2 border-white/10 group cursor-pointer"
              onClick={() => setSelectedImg(screen)}
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <FaExpandAlt className="text-white text-3xl" />
              </div>
              <img
                src={screen.src}
                alt={screen.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x800/120824/FFFFFF?text=SaynIQ+Screenshot';
                }}
              />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedImg(null)}
          >
            <button className="absolute top-10 right-10 text-3xl text-white/50 hover:text-white">
              <FaTimes />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-full max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImg.src}
                alt={selectedImg.alt}
                className="max-h-[80vh] rounded-[2rem] border-4 border-white/20 shadow-[0_0_50px_rgba(124,58,237,0.5)]"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x800/120824/FFFFFF?text=SaynIQ+Screenshot';
                }}
              />
              <p className="text-center mt-6 text-white/70 text-lg">{selectedImg.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ScreenshotGallery;
