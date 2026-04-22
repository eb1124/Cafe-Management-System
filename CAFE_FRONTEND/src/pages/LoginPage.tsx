/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, CupSoda, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { apiService } from '../services/api';
import { storeUser } from '../services/auth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const user = await apiService.auth.login(email, password);
      storeUser(user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,183,159,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(183,139,82,0.10),transparent_22%)]" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-forest px-12 py-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12">
                <CupSoda size={26} className="text-[#f6e9d2]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Brew Haven</h1>
                <p className="text-sm text-white/65">Cafe management dashboard</p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                Welcome back
              </p>
              <h2 className="mt-4 text-5xl font-semibold leading-tight tracking-tight">
                Run your cafe with calm, clarity, and style.
              </h2>
              <p className="mt-6 text-base leading-7 text-white/72">
                Manage menu items, customer orders, staff, branches, and payments
                through one clean, warm workspace.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e5d2] text-forest">
                <Leaf size={22} />
              </div>
              <div>
                <p className="text-lg font-semibold">Simple daily operations</p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Built for cafe teams who want a dashboard that feels warm, intuitive,
                  and easy to use.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="app-surface p-8 md:p-10">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Sign in
                </p>
                <h2 className="mt-3 text-[42px] font-semibold leading-none tracking-tight text-ink">
                  Welcome Back
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Enter your details to access the cafe dashboard.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-[#ecd4cf] bg-[#fbefec] px-4 py-3 text-sm font-medium text-[#9a5748]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-ink">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@brewhaven.com"
                      className="app-input pl-11"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="ml-1 block text-sm font-semibold text-ink">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-forest hover:text-forest-deep"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/70"
                      size={18}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="app-input pl-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/70 transition hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary mt-2 w-full justify-center py-4 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-muted">
                Need access?{' '}
                <span className="font-semibold text-forest">Contact support</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
