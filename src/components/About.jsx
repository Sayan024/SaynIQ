import React from 'react';
import { motion } from 'framer-motion';
import { APP_INFO } from '../constants';

const About = () => {
  return (
    <section id="about" className="py-24 bg-dark-soft">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary/20 rounded-2xl -z-10"></div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">The Vision behind <span className="text-primary">{APP_INFO.name}</span></h2>
            </motion.div>
            
            <p className="text-lg text-white/70 mb-6 leading-relaxed">
              SaynIQ was born from a simple observation: we are drowning in information but starving for knowledge. Our mission is to build the ultimate interface between your biological mind and the digital world.
            </p>
            
            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              By combining state-of-the-art AI models with intuitive design, we've created a "Second Brain" that doesn't just store data, but helps you process, connect, and recall it exactly when you need it most.
            </p>

            <div className="flex items-center gap-4 p-6 glass-card inline-flex">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-2xl text-dark">
                SB
              </div>
              <div>
                <h4 className="font-bold text-xl">{APP_INFO.developer}</h4>
                <p className="text-white/50 text-sm">Lead Architect & AI Designer</p>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6">
            <div className="space-y-6 pt-12">
              <div className="glass-card p-8 aspect-square flex flex-col justify-center text-center">
                <div className="text-4xl font-bold text-accent mb-2">100%</div>
                <p className="text-white/50 text-sm">Open Source</p>
              </div>
              <div className="glass-card p-8 aspect-square flex flex-col justify-center text-center bg-primary/10">
                <div className="text-4xl font-bold text-white mb-2">∞</div>
                <p className="text-white/50 text-sm">Possibilities</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card p-8 aspect-square flex flex-col justify-center text-center bg-white/5">
                <div className="text-4xl font-bold text-white mb-2">AI</div>
                <p className="text-white/50 text-sm">First Architecture</p>
              </div>
              <div className="glass-card p-8 aspect-square flex flex-col justify-center text-center">
                <div className="text-4xl font-bold text-primary mb-2">Privacy</div>
                <p className="text-white/50 text-sm">By Design</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
