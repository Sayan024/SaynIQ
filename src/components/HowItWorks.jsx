import React from 'react';
import { motion } from 'framer-motion';
import { STEPS } from '../constants';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-dark overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">How <span className="text-primary">SaynIQ</span> Works</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Five simple steps to achieving total digital organization and enhanced focus.</p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-dark-soft border-2 border-primary/30 flex items-center justify-center text-primary text-3xl mb-8 shadow-[0_0_30px_rgba(124,58,237,0.2)] relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <step.icon />
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
