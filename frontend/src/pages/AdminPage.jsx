import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, BarChart3, Calendar, Clock, Film, Ticket, CheckCircle2,
  AlertCircle, X, Plus, Trash2, Search, User, LogOut,
  ArrowRight, ShieldCheck, ShieldAlert, Activity, Check,
  TrendingUp, Users, DollarSign, Percent
} from 'lucide-react';
import { useCinema } from '../context/CinemaContext';
import { apiUrl } from '../config/api';

export default function AdminPage() {
  const navigate = useNavigate();
  const { currentUser, login, logout, showToast } = useCinema();

  // Active Tab: 'overview' | 'schedule' | 'validator' | 'audit'
  const [activeTab, setActiveTab] = useState('overview');

  // Admin Data State
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [shows, setShows] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metadata, setMetadata] = useState({ movies: [], screens: [] });

  // Filter & Search
  const [reportSearch, setReportSearch] = useState('');
  const [showSearch, setShowSearch] = useState('');

  // Ticket Validator State
  const [ticketInput, setTicketInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // New Show Modal State
  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [newShowData, setNewShowData] = useState({
    movie: '',
    screen: '',
    showTime: '',
    price: 350
  });
  const [submittingShow, setSubmittingShow] = useState(false);

  // Auth form state (for non-admin or unauthenticated guests)
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const isAdmin = currentUser && currentUser.role === 'admin';

  // Fetch all admin data
  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, showsRes, logsRes, metaRes] = await Promise.all([
        fetch(apiUrl('/api/admin/overview'), { headers }),
        fetch(apiUrl('/api/admin/shows'), { headers }),
        fetch(apiUrl('/api/admin/audit-logs'), { headers }),
        fetch(apiUrl('/api/admin/metadata'), { headers })
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setKpis(overviewData.kpis);
        setOccupancyReport(overviewData.occupancyReport || []);
        setRecentBookings(overviewData.recentBookings || []);
      }

      if (showsRes.ok) {
        const showsData = await showsRes.json();
        setShows(showsData.shows || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      }

      if (metaRes.ok) {
        const metaData = await metaRes.json();
        setMetadata(metaData);
        if (metaData.movies.length > 0 && !newShowData.movie) {
          setNewShowData(prev => ({
            ...prev,
            movie: metaData.movies[0]._id,
            screen: metaData.screens[0]?._id || ''
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error connecting to admin service.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Admin Login Handler
  const handleDemoAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    // Try logging in or auto-registering admin account
    const emailToUse = authEmail.trim() || 'cinema_admin@pixora.com';
    const passwordToUse = authPassword || 'admin123';

    try {
      let res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passwordToUse })
      });

      if (!res.ok) {
        // Auto-register demo admin if not present
        res = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Cinema Admin',
            email: emailToUse,
            password: passwordToUse,
            role: 'admin'
          })
        });
      }

      const data = await res.json();
      if (res.ok && data.token && data.user) {
        login(data.user, data.token);
        showToast('👋 Welcome to PIXORA Admin Console!');
      } else {
        setAuthError(data.message || data.error || 'Admin sign-in failed');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Ticket Validation Action
  const handleValidateTicket = async (codeToValidate) => {
    const code = codeToValidate || ticketInput;
    if (!code || !code.trim()) {
      showToast('Please provide a ticket booking code.');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl('/api/admin/validate-ticket'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ticketCode: code.trim() })
      });

      const data = await res.json();
      if (res.ok) {
        setValidationResult({ success: true, ...data });
        showToast('✅ Guest admission verified!');
        fetchAdminData(); // Refresh occupancy & checked-in counters
      } else {
        setValidationResult({
          success: false,
          error: data.error || 'Ticket verification failed.',
          status: res.status,
          booking: data.booking
        });
      }
    } catch {
      setValidationResult({ success: false, error: 'Connection error reaching validation service.' });
    } finally {
      setValidating(false);
    }
  };

  // Schedule New Show Submit
  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!newShowData.movie || !newShowData.screen || !newShowData.showTime || !newShowData.price) {
      showToast('Please fill all show scheduling fields.');
      return;
    }

    setSubmittingShow(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(apiUrl('/api/admin/shows'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newShowData)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('🎬 Show scheduled successfully!');
        setIsAddShowOpen(false);
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to schedule show.');
      }
    } catch {
      showToast('Error communicating with scheduling API.');
    } finally {
      setSubmittingShow(false);
    }
  };

  // Delete Show
  const handleDeleteShow = async (showId) => {
    if (!confirm('Are you sure you want to remove this scheduled screening?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl(`/api/admin/shows/${showId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Show deleted from cinema schedule.');
        fetchAdminData();
      } else {
        showToast(data.error || 'Unable to delete show.');
      }
    } catch {
      showToast('Error removing screening.');
    }
  };

  // If user is not authenticated as admin, show dedicated Admin Gateway Login
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#060709] text-white flex flex-col justify-center items-center px-4 py-12 animate-fade-in selection:bg-[#d4af37] selection:text-black">
        <div className="w-full max-w-md bg-[#0f1015] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mb-1">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">PIXORA Admin Console</h2>
            <p className="text-xs text-gray-400 font-poetic italic">
              Cinema management operations, schedule management & live occupancy analytics
            </p>
          </div>

          {currentUser && currentUser.role !== 'admin' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold">Access Restricted</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Logged in as <strong className="text-white">{currentUser.email}</strong> (Moviegoer). Administrator permissions required.
                </p>
              </div>
            </div>
          )}

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Quick Demo Admin Button */}
          <button
            type="button"
            onClick={() => handleDemoAdminLogin()}
            disabled={authLoading}
            className="w-full btn-champagne py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#d4af37]/20 hover:scale-[1.02] transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{authLoading ? 'Verifying...' : 'Launch with Demo Admin Account'}</span>
          </button>

          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0f1015] px-3 text-[11px] text-gray-500 uppercase font-semibold">Or Sign In Manually</span>
          </div>

          <form onSubmit={handleDemoAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="cinema_admin@pixora.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Sign In to Console
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/catalog')}
              className="text-xs text-gray-500 hover:text-gray-300 font-poetic italic cursor-pointer"
            >
              ← Return to Movie Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered reports
  const filteredReport = occupancyReport.filter(r =>
    !reportSearch.trim() ||
    r.movieTitle.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.screenName.toLowerCase().includes(reportSearch.toLowerCase())
  );

  const filteredShows = shows.filter(s =>
    !showSearch.trim() ||
    s.movie?.title?.toLowerCase().includes(showSearch.toLowerCase()) ||
    s.screen?.name?.toLowerCase().includes(showSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090a0e] text-[#ede9e3] flex flex-col font-sans selection:bg-[#e5a93c] selection:text-[#090a0e]">
      {/* Top Admin Bar */}
      <header className="w-full border-b border-white/10 bg-[#0e1017] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#e5a93c] text-[#090a0e] flex items-center justify-center font-bold shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-cinema text-lg font-bold tracking-wider text-white">PIXORA</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono-cinema">Live Cinema Operations & Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              logout();
              navigate('/auth');
            }}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace - Full width stretched edge-to-edge */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#e5a93c] text-[#090a0e] shadow-md shadow-[#e5a93c]/20'
                : 'bg-[#111319] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-[#e5a93c] text-[#090a0e] shadow-md shadow-[#e5a93c]/20'
                : 'bg-[#111319] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Manager ({shows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'validator'
                ? 'bg-[#e5a93c] text-[#090a0e] shadow-md shadow-[#e5a93c]/20'
                : 'bg-[#111319] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Ticket Validator / Gate</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#e5a93c] text-[#090a0e] shadow-md shadow-[#e5a93c]/20'
                : 'bg-[#111319] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#e5a93c] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-mono-cinema">Aggregating live cinema metrics...</p>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW & ANALYTICS TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* KPI Metric Cards - Stretched full width edge-to-edge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                  <div className="p-5 sm:p-6 lg:p-7 rounded-2xl bg-[#111319] border border-white/10 flex flex-col justify-between shadow-xl w-full">
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[11px] font-mono-cinema">Gross Revenue</span>
                      <div className="w-8 h-8 rounded-xl bg-[#e5a93c]/15 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-[#e5a93c]" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono-cinema">₹{kpis?.totalRevenue?.toLocaleString('en-IN') || 0}</span>
                      <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center space-x-1 font-medium">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Confirmed transactions</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-7 rounded-2xl bg-[#111319] border border-white/10 flex flex-col justify-between shadow-xl w-full">
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[11px] font-mono-cinema">Total Bookings</span>
                      <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
                        <Ticket className="w-4 h-4 text-sky-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono-cinema">{kpis?.confirmedBookingsCount || 0}</span>
                      <p className="text-[11px] text-gray-400 mt-1.5 font-mono-cinema">
                        {kpis?.cancelledBookingsCount || 0} refunded cancellations
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-7 rounded-2xl bg-[#111319] border border-white/10 flex flex-col justify-between shadow-xl w-full">
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[11px] font-mono-cinema">Average Occupancy</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                        <Percent className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e5a93c] font-mono-cinema">{kpis?.averageOccupancy || 0}%</span>
                      <p className="text-[11px] text-gray-400 mt-1.5">Across all active screens</p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-7 rounded-2xl bg-[#111319] border border-white/10 flex flex-col justify-between shadow-xl w-full">
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[11px] font-mono-cinema">Gate Validations</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono-cinema">{kpis?.checkedInTickets || 0}</span>
                      <p className="text-[11px] text-gray-400 mt-1.5 font-mono-cinema">Guest passes admitted</p>
                    </div>
                  </div>
                </div>

                {/* Occupancy & Sales Report Table matching bookings & cancellations - Full width stretched */}
                <div className="w-full rounded-2xl bg-[#111319] border border-white/10 p-5 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-[#e5a93c]" />
                        <span>Live Screen Occupancy & Sales Report</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Matches scheduled screenings, seat capacity, confirmed bookings, and cancelled refunds
                      </p>
                    </div>

                    <div className="relative min-w-[260px]">
                      <input
                        type="text"
                        placeholder="Search movie or screen..."
                        value={reportSearch}
                        onChange={(e) => setReportSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e5a93c]"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-none w-full">
                    <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] text-gray-400 uppercase tracking-wider font-mono-cinema">
                          <th className="py-3.5 px-4 font-bold">Screening / Movie</th>
                          <th className="py-3.5 px-4 font-bold">Screen Hall</th>
                          <th className="py-3.5 px-4 font-bold">Showtime</th>
                          <th className="py-3.5 px-4 font-bold">Price</th>
                          <th className="py-3.5 px-4 font-bold">Capacity</th>
                          <th className="py-3.5 px-4 font-bold">Booked Seats</th>
                          <th className="py-3.5 px-4 font-bold">Cancelled</th>
                          <th className="py-3.5 px-4 font-bold">Occupancy</th>
                          <th className="py-3.5 px-4 font-bold text-right">Gross Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredReport.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-gray-500">
                              No matching screenings found in report.
                            </td>
                          </tr>
                        ) : (
                          filteredReport.map((row) => (
                            <tr key={row.showId} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                                {row.movieTitle}
                              </td>
                              <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap">{row.screenName}</td>
                              <td className="py-3.5 px-4 font-mono-cinema text-gray-300 whitespace-nowrap">
                                {new Date(row.showTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                                {new Date(row.showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5 px-4 font-mono-cinema font-semibold">₹{row.ticketPrice}</td>
                              <td className="py-3.5 px-4 font-mono-cinema">{row.capacity}</td>
                              <td className="py-3.5 px-4 font-bold text-[#f3c562] font-mono-cinema">{row.bookedSeatsCount}</td>
                              <td className="py-3.5 px-4 text-red-400 font-mono-cinema">{row.cancellationsCount}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3 min-w-[140px]">
                                  <div className="flex-1 max-w-[140px] h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${row.occupancyPercent >= 75
                                          ? 'bg-emerald-500'
                                          : row.occupancyPercent >= 40
                                            ? 'bg-[#e5a93c]'
                                            : 'bg-sky-500'
                                        }`}
                                      style={{ width: `${row.occupancyPercent}%` }}
                                    />
                                  </div>
                                  <span className="font-mono-cinema text-xs font-bold text-white">{row.occupancyPercent}%</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white font-mono-cinema text-right">₹{row.grossSales.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Bookings Transaction Table - Full width stretched */}
                <div className="w-full rounded-2xl bg-[#111319] border border-white/10 p-5 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Ticket className="w-5 h-5 text-[#e5a93c]" />
                    <span>Recent Customer Bookings & Validation State</span>
                  </h3>

                  <div className="overflow-x-auto scrollbar-none w-full">
                    <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] text-gray-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4 font-bold">Booking ID</th>
                          <th className="py-3.5 px-4 font-bold">Customer</th>
                          <th className="py-3.5 px-4 font-bold">Movie</th>
                          <th className="py-3.5 px-4 font-bold">Seats</th>
                          <th className="py-3.5 px-4 font-bold">Total Paid</th>
                          <th className="py-3.5 px-4 font-bold">Status</th>
                          <th className="py-3.5 px-4 font-bold">Gate Admission</th>
                          <th className="py-3.5 px-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {recentBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-gray-500">
                              No customer bookings recorded in database.
                            </td>
                          </tr>
                        ) : (
                          recentBookings.map((b) => (
                            <tr key={b._id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4 font-mono-cinema font-bold text-[#e5a93c]">
                                #{b._id.slice(-8).toUpperCase()}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-white">{b.user?.name || 'Customer'}</p>
                                <p className="text-[10px] text-gray-500 font-mono-cinema">{b.user?.email || 'N/A'}</p>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                                {b.show?.movie?.title || b.movieTitle || 'Movie'}
                              </td>
                              <td className="py-3.5 px-4 font-mono-cinema font-bold text-[#f3c562]">
                                {Array.isArray(b.seats) ? b.seats.join(', ') : 'Assigned'}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white font-mono-cinema">₹{b.totalPrice}</td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono-cinema ${
                                    b.bookingStatus === 'Confirmed'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {b.bookingStatus}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {b.isCheckedIn ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 w-max font-mono-cinema">
                                    <Check className="w-3 h-3" />
                                    <span>Admitted</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-400 border border-white/10 w-max inline-block font-mono-cinema">
                                    Unused
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {b.bookingStatus === 'Confirmed' && !b.isCheckedIn && (
                                  <button
                                    onClick={() => {
                                      setActiveTab('validator');
                                      setTicketInput(b._id.slice(-8).toUpperCase());
                                      handleValidateTicket(b._id.slice(-8).toUpperCase());
                                    }}
                                    className="btn-cinema-outline px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    Verify Gate Entry
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SCHEDULE MANAGER TAB */}
            {activeTab === 'schedule' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">Cinema Screening Schedules</h3>
                    <p className="text-xs text-gray-400 font-poetic italic mt-0.5">
                      Configure movie releases, timing slots, hall allocation, and ticket pricing
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="relative min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search shows..."
                        value={showSearch}
                        onChange={(e) => setShowSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                      />
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                      onClick={() => setIsAddShowOpen(true)}
                      className="btn-champagne px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-[#d4af37]/20 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Schedule New Show</span>
                    </button>
                  </div>
                </div>

                {/* Shows Grid - Stretched responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 w-full">
                  {filteredShows.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-gray-500">
                      No matching screenings found in cinema schedule.
                    </div>
                  ) : (
                    filteredShows.map((s) => (
                      <div
                        key={s._id}
                        className="rounded-3xl bg-[#0f1015] border border-white/10 p-5 flex flex-col justify-between space-y-4 hover:border-[#d4af37]/30 transition-all shadow-xl group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={s.movie?.posterUrl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=400&q=80'}
                              alt={s.movie?.title}
                              className="w-14 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0"
                            />
                            <div>
                              <h4 className="text-base font-black text-white group-hover:text-[#f5e6b3] transition-colors line-clamp-1">
                                {s.movie?.title || 'Untitled Movie'}
                              </h4>
                              <p className="text-xs text-gray-400 mt-0.5">{s.screen?.name || 'Screen'}</p>
                              <div className="flex items-center space-x-2 text-[11px] text-gray-400 mt-1">
                                <Clock className="w-3 h-3 text-[#d4af37]" />
                                <span>{new Date(s.showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteShow(s._id)}
                            title="Delete Show"
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Occupancy Progress Bar */}
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">Seats Reserved:</span>
                            <span className="font-bold text-white font-mono">
                              {s.bookedSeatsCount || 0} / {s.screen?.capacity || 48} ({s.occupancyPercent || 0}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
                            <div
                              className="h-full rounded-full bg-[#d4af37] transition-all duration-500"
                              style={{ width: `${s.occupancyPercent || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-gray-400">Date: {new Date(s.showTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                          <span className="font-black text-white">₹{s.price}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. TICKET VALIDATOR TAB */}
            {activeTab === 'validator' && (
              <div className="max-w-2xl mx-auto w-full space-y-6 animate-fade-in">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#e5a93c]/15 border border-[#e5a93c]/30 text-[#e5a93c] mx-auto flex items-center justify-center mb-2">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Cinema Gate Ticket Validator</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Simulate cinema entrance ticket scanning. Each issued boarding pass can only be admitted once.
                  </p>
                </div>

                {/* Ticket Input Card */}
                <div className="rounded-2xl bg-[#111319] border border-white/10 p-6 shadow-2xl space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 font-mono-cinema">
                      Scan or Enter Booking Reference ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={ticketInput}
                        onChange={(e) => setTicketInput(e.target.value)}
                        placeholder="e.g. 49EEB825 or MongoDB ID"
                        className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white font-mono-cinema placeholder-gray-600 focus:outline-none focus:border-[#e5a93c]"
                      />
                      <button
                        onClick={() => handleValidateTicket()}
                        disabled={validating || !ticketInput.trim()}
                        className="btn-cinema px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        {validating ? 'Verifying...' : 'Admit Guest'}
                      </button>
                    </div>
                  </div>

                  {/* Validation Feedback Result */}
                  {validationResult && (
                    <div
                      className={`p-5 rounded-2xl border flex flex-col space-y-3 animate-fade-in ${validationResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : validationResult.status === 409
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-red-500/10 border-red-500/40 text-red-400'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        {validationResult.success ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                        ) : validationResult.status === 409 ? (
                          <ShieldAlert className="w-7 h-7 text-amber-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
                        )}
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-wider">
                            {validationResult.success
                              ? 'ADMISSION GRANTED · VALID ENTRY'
                              : validationResult.status === 409
                                ? 'DUPLICATE ENTRY DETECTED'
                                : 'ADMISSION DENIED'}
                          </h4>
                          <p className="text-xs mt-0.5 opacity-90">
                            {validationResult.message || validationResult.error}
                          </p>
                        </div>
                      </div>

                      {validationResult.ticket && (
                        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-gray-200">
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-semibold">Movie:</span>
                            <span className="font-bold text-white">{validationResult.ticket.movieTitle}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-semibold">Hall:</span>
                            <span>{validationResult.ticket.screenName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-semibold">Seat(s):</span>
                            <span className="font-bold text-[#d4af37] font-mono">
                              {Array.isArray(validationResult.ticket.seats)
                                ? validationResult.ticket.seats.join(', ')
                                : 'Reserved'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-semibold">Customer:</span>
                            <span>{validationResult.ticket.customerName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick-Scan Suggestions from recent active tickets */}
                  {recentBookings.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                        Quick-Select Active Booking to Test Gate Flow:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {recentBookings.slice(0, 6).map((b) => (
                          <button
                            key={b._id}
                            onClick={() => {
                              const ref = b._id.slice(-8).toUpperCase();
                              setTicketInput(ref);
                              handleValidateTicket(ref);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${b.isCheckedIn
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                                : b.bookingStatus === 'Cancelled'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-white/5 text-gray-300 border-white/10 hover:border-[#d4af37] hover:text-[#d4af37]'
                              }`}
                          >
                            <span>#{b._id.slice(-8).toUpperCase()}</span>
                            <span className="text-[10px] ml-1 opacity-75">
                              ({b.show?.movie?.title?.slice(0, 10) || 'Movie'} · {b.isCheckedIn ? 'Admitted' : b.bookingStatus})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. AUDIT TRAIL TAB */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-black text-white">Business Activity Audit Trail</h3>
                  <p className="text-xs text-gray-400 font-poetic italic mt-0.5">
                    Immutable chronological record of material operations (shows scheduled, tickets validated, cancellations)
                  </p>
                </div>

                <div className="rounded-3xl bg-[#0f1015] border border-white/10 p-5 sm:p-6 shadow-xl">
                  {auditLogs.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      No material business actions logged yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {auditLogs.map((log) => (
                        <div
                          key={log._id}
                          className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-white/15 transition-all"
                        >
                          <div className="flex items-start space-x-3">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono mt-0.5 ${log.action === 'SHOW_CREATED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : log.action === 'TICKET_VALIDATED'
                                    ? 'bg-[#d4af37]/20 text-[#f5e6b3] border border-[#d4af37]/30'
                                    : log.action === 'SHOW_DELETED'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-white/10 text-gray-300'
                                }`}
                            >
                              {log.action}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white">{log.details}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                Executed by: {log.userEmail} · Entity: {log.entityType} ({log.entityId || 'N/A'})
                              </p>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono text-gray-400 self-end sm:self-auto">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Schedule New Show Modal */}
      {isAddShowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1015] border border-[#d4af37]/40 shadow-2xl p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setIsAddShowOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white flex items-center space-x-2">
                <Film className="w-5 h-5 text-[#d4af37]" />
                <span>Schedule Cinema Screening</span>
              </h3>
              <p className="text-xs text-gray-400 font-poetic italic">
                Publish a new movie showtime slot to customer discovery catalog
              </p>
            </div>

            <form onSubmit={handleCreateShow} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Movie</label>
                <select
                  value={newShowData.movie}
                  onChange={(e) => setNewShowData({ ...newShowData, movie: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {metadata.movies.map((m) => (
                    <option key={m._id} value={m._id} className="bg-[#0f1015] text-white">
                      {m.title} ({m.language || 'English'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Screen Hall</label>
                <select
                  value={newShowData.screen}
                  onChange={(e) => setNewShowData({ ...newShowData, screen: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {metadata.screens.map((s) => (
                    <option key={s._id} value={s._id} className="bg-[#0f1015] text-white">
                      {s.name} (Capacity: {s.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Show Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newShowData.showTime}
                    onChange={(e) => setNewShowData({ ...newShowData, showTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Base Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    required
                    value={newShowData.price}
                    onChange={(e) => setNewShowData({ ...newShowData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={submittingShow}
                  className="flex-1 btn-champagne py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
                >
                  {submittingShow ? 'Publishing Screening...' : 'Publish Screening'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddShowOpen(false)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

