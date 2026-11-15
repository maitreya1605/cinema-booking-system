import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle2, Film } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function AuthPage({ onBack: propOnBack, onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCinema();
  const handleBack = propOnBack || (() => {
    if (location.state?.from) {
      navigate(location.state.from, { state: location.state });
    } else {
      navigate('/');
    }
  });

  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  // Role toggle
  const handleRoleToggle = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role: selectedRole };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      if (data.token && data.user) {
        login(data.user, data.token);
      }

      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      } else if (location.state?.from) {
        navigate(location.state.from, { state: location.state });
      } else {
        navigate('/catalog');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col md:flex-row relative select-none">
      
      {/* ========================================================= */}
      {/* LEFT HALF (50%): Dramatic Full-Bleed Cinema Camera Visual */}
      {/* ========================================================= */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen bg-black flex flex-col justify-between overflow-hidden">
        {/* Full-bleed background photo of camera rig */}
        <img
          src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=85"
          alt="Cinema Camera Rig"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
        />

        {/* Cinematic Atmospheric Lighting Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30" />
        <div className="absolute inset-0 bg-[#d4af37]/10 mix-blend-color" />

        {/* Floating "Back to Cinema" Pill Button on Top-Left */}
        <div className="relative z-20 p-6 md:p-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Back to Cinema</span>
          </button>
        </div>

        {/* Tagline & Studio Attribution on Bottom-Left */}
        <div className="relative z-20 p-8 sm:p-12 text-white">
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">
              PIXORA Studios
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight max-w-md">
            Experience Cinema The Way Directors Intended.
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 font-medium">
            IMAX Laser · Dolby Atmos 7.1 · 4DX Dynamic Motion
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT HALF (50%): Crisp White Login / Sign-Up Form View  */}
      {/* ========================================================= */}
      <div className="w-full md:w-1/2 min-h-screen bg-white flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-10 relative">
        
        {/* Mobile top-back button */}
        <div className="w-full max-w-md flex justify-between items-center md:hidden mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cinema</span>
          </button>
          <span className="text-xs font-bold tracking-widest text-gray-900">PIXORA</span>
        </div>

        <div className="w-full max-w-md flex flex-col justify-center">
          
          {/* Brand Name (No logo icon) */}
          <div className="flex justify-center mb-2">
            <span className="text-2xl font-black tracking-widest text-gray-900">
              PIXORA
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight text-center">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center max-w-sm mx-auto leading-relaxed">
            {isLogin
              ? "Today is a new day. It's your day. You shape it. Sign in to start managing your cinema bookings."
              : 'Join PIXORA today to reserve prime seats, unlock exclusive premiere tickets, and enjoy movies.'}
          </p>

          {/* Role Pill Switch: [ Moviegoer | Cinema Admin ] */}
          <div className="mt-7 mb-4 p-1 rounded-xl bg-[#f2f4f7] flex items-center border border-gray-200/80">
            <button
              type="button"
              onClick={() => handleRoleToggle('user')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedRole === 'user'
                  ? 'bg-white text-gray-900 shadow-sm font-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Moviegoer
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('admin')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-gray-900 shadow-sm font-black'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Cinema Admin
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-600 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {forgotPasswordNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2 text-xs text-amber-800">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Password reset instructions have been sent to your email address.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-sm text-gray-900 placeholder-gray-400 bg-white transition-all shadow-2xs"
                />
              </div>
            )}

            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-sm text-gray-900 placeholder-gray-400 bg-white transition-all shadow-2xs"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-sm text-gray-900 placeholder-gray-400 bg-white transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot password link */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotPasswordNotice(true)}
                  className="text-xs font-semibold text-[#b89728] hover:text-[#d4af37] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-cinema w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-[#e5a93c]/20 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          </form>

          {/* Toggle between Login and Sign Up */}
          <div className="mt-5 text-center">
            <span className="text-xs text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-bold text-[#b89728] hover:text-[#d4af37] hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
