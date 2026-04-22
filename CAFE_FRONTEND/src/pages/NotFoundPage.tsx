/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-raspberry rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-plum rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10 text-center"
      >
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border border-white/10">
          <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-10">
            <Coffee size={56} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-9xl font-black text-primary tracking-tighter mb-4">404</h1>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-6">Oops! Page Spilled</h2>
          <p className="text-lg text-slate-400 font-medium max-w-md mx-auto mb-12 leading-relaxed">
            It seems the page you're looking for has been moved or doesn't exist. Let's get you back to the dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/dashboard"
              className="w-full sm:w-auto bg-raspberry text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-raspberry/20 hover:bg-wine hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Home size={20} />
              Back to Dashboard
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto bg-slate-100 text-slate-600 font-black px-10 py-5 rounded-2xl hover:bg-slate-200 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
