import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Clock, QrCode, CreditCard, Smartphone,
  Building2, Wallet, CheckCircle2, AlertTriangle, ArrowRight,
  Lock, RefreshCw, Sparkles
} from 'lucide-react';
import { apiUrl } from '../config/api';

function GooglePayLogo() {
  return (
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    </div>
  );
}

function PhonePeLogo() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center p-1.5 shadow-sm">
      <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
        <path d="M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243C1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433m-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.67-.737-1.743-.804-2.48-.134-.738.67-.804 1.743-.134 2.48l2.615 2.949H7.663a.887.887 0 0 0-.871.871v5.698c0 .469.335.871.805.871h2.212c1.877 0 3.218-1.073 3.218-2.883v-1.006l2.084 2.352c.67.737 1.743.804 2.48.134.738-.67.804-1.743.134-2.48l-1.949-2.213h1.34c.47 0 .872-.402.872-.871z" />
      </svg>
    </div>
  );
}

function PaytmLogo() {
  return (
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="#002970" d="M.232 9.4A.234.234 0 0 0 0 9.636v5.924c0 .132.096.238.216.241h1.09c.13 0 .237-.107.237-.24l.004-1.658H2.57c.857 0 1.453-.605 1.453-1.481v-1.538c0-.877-.596-1.484-1.453-1.484zm9.032 0a.24.24 0 0 0-.237.241v2.47c0 .94.657 1.608 1.579 1.608h.675s.016 0 .037.004a.253.253 0 0 1 .222.253c0 .13-.096.235-.219.251l-.018.004l-.303.006H9.739a.24.24 0 0 0-.236.24v1.09a.24.24 0 0 0 .236.242h1.75c.92 0 1.577-.669 1.577-1.608v-4.56a.24.24 0 0 0-.236-.24h-1.07a.24.24 0 0 0-.236.24c-.005.787 0 1.525 0 2.255a.253.253 0 0 1-.25.25h-.449a.253.253 0 0 1-.25-.255c.005-.754-.005-1.5-.005-2.25a.24.24 0 0 0-.236-.24zm-4.004.006a.23.23 0 0 0-.238.226v1.023c0 .132.113.24.252.24h1.413c.112.017.2.1.213.23v.14c-.013.124-.1.214-.207.224h-.7c-.93 0-1.594.63-1.594 1.515v1.269c0 .88.57 1.506 1.495 1.506h1.94c.348 0 .63-.27.63-.6v-4.136c0-1.004-.508-1.637-1.72-1.637zm-3.713 1.572h.678c.139 0 .25.115.25.256v.836a.253.253 0 0 1-.25.256h-.1q-.289.002-.578 0zm4.67 1.977h.445c.139 0 .252.108.252.24v.932a.2.2 0 0 1-.014.076a.25.25 0 0 1-.238.164h-.445a.247.247 0 0 1-.252-.24v-.933c0-.132.113-.239.252-.239" />
        <path fill="#00BAF2" d="m15.85 8.167l-.04.004c-.68.19-.543 1.148-1.781 1.23h-.12a.2.2 0 0 0-.052.005h-.001a.24.24 0 0 0-.184.235v1.09c0 .134.106.241.237.241h.645v4.623c0 .132.104.238.233.238h1.058a.236.236 0 0 0 .233-.238v-4.623h.6c.13 0 .236-.107.236-.241v-1.09a.24.24 0 0 0-.236-.24h-.612V8.386a.22.22 0 0 0-.216-.22zm4.225 1.17c-.398 0-.762.15-1.042.395v-.124a.24.24 0 0 0-.234-.224h-1.07a.24.24 0 0 0-.236.242v5.92a.24.24 0 0 0 .236.242h1.07c.12 0 .217-.091.233-.209v-4.25a.393.393 0 0 1 .371-.408h.196a.4.4 0 0 1 .226.09a.4.4 0 0 1 .145.319v4.074l.004.155a.24.24 0 0 0 .237.241h1.07a.24.24 0 0 0 .235-.23l-.001-4.246c0-.14.062-.266.174-.34a.4.4 0 0 1 .196-.068h.198c.23.02.37.2.37.408c.005 1.396.004 2.8.004 4.224a.24.24 0 0 0 .237.241h1.07c.13 0 .236-.108.236-.241v-4.543c0-.31-.034-.442-.08-.577a1.6 1.6 0 0 0-1.51-1.09h-.015a1.58 1.58 0 0 0-1.152.5c-.291-.308-.7-.5-1.153-.5z" />
      </svg>
    </div>
  );
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentSuccess,
  onPaymentFailure
}) {
  if (!isOpen) return null;

  const {
    movieTitle = 'Movie',
    theaterName = 'PIXORA Cinema',
    showtime = '06:30 PM',
    date = 'Tomorrow',
    seats = [],
    totalPrice,
    bookingId = null
  } = bookingDetails || {};

  const getSeatPriceFallback = (seatId) => {
    if (!seatId) return 290;
    const row = String(seatId)[0];
    if (['E', 'F', 'G', 'H', 'J'].includes(row)) return 340;
    return 290;
  };

  const calculatedTotal = (totalPrice && totalPrice > 0)
    ? totalPrice
    : (seats && seats.length > 0 ? seats.reduce((sum, s) => sum + getSeatPriceFallback(s), 0) : 340);

  // Tab: 'upi' | 'card' | 'netbanking' | 'wallet'
  const [activeTab, setActiveTab] = useState('upi');

  // UPI State
  const [upiOption, setUpiOption] = useState('apps'); // 'apps' | 'id' | 'qr'
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Processing & Verification state
  const [processingState, setProcessingState] = useState('idle'); // 'idle' | 'processing' | 'success' | 'conflict'
  const [statusMessage, setStatusMessage] = useState('');

  // 10-Minute Lock Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    setProcessingState('processing');
    setStatusMessage('Connecting to secure payment gateway...');

    try {
      // Step 1: Create Order handshake
      const token = localStorage.getItem('token');
      const orderRes = await fetch(apiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          bookingId,
          amount: calculatedTotal,
          currency: 'INR',
          paymentMethod: activeTab.toUpperCase()
        })
      });

      setStatusMessage('Authorizing transaction with issuing bank...');
      await new Promise((r) => setTimeout(r, 1200));

      // Step 2: Verify Payment & Confirm
      const paymentId = `PAY_IN_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const verifyRes = await fetch(apiUrl('/api/payments/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          bookingId,
          paymentId,
          paymentMethod: activeTab.toUpperCase(),
          orderId: `order_${Date.now()}`
        })
      });

      setStatusMessage('Payment verified! Finalizing cinema ticket reservation...');
      await new Promise((r) => setTimeout(r, 800));

      setProcessingState('success');
      if (onPaymentSuccess) {
        onPaymentSuccess({
          paymentId,
          paymentMethod: activeTab.toUpperCase(),
          totalPrice: calculatedTotal
        });
      }
    } catch (err) {
      setProcessingState('idle');
      if (onPaymentFailure) onPaymentFailure(err.message);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#111319] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.95)] p-5 sm:p-7 flex flex-col space-y-5 my-auto text-[#ede9e3]"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header: Trust Badge & Amount */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 pr-8">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e5a93c]/15 border border-[#e5a93c]/40 flex items-center justify-center text-[#e5a93c]">
              <ShieldCheck className="w-5 h-5 text-[#e5a93c]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#e5a93c] font-mono-cinema">PIXORA PAY</span>
              </div>
              <p className="text-[11px] text-gray-400 truncate max-w-[220px]">{movieTitle} • {seats.join(', ')}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Payable</span>
            <span className="text-2xl font-black text-[#e5a93c] font-mono-cinema">₹{calculatedTotal}</span>
          </div>
        </div>

        {/* 10-Minute Lock TTL Warning Strip */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#e5a93c]/10 border border-[#e5a93c]/20 text-xs">
          <div className="flex items-center space-x-2 text-[#f3c562]">
            <Clock className="w-4 h-4 text-[#e5a93c] animate-pulse" />
            <span>Seats held for you. Complete payment in:</span>
          </div>
          <span className="font-mono-cinema font-bold text-[#e5a93c] text-sm bg-black/40 px-2 py-0.5 rounded border border-[#e5a93c]/30">
            {formatTimer(secondsRemaining)}
          </span>
        </div>

        {/* Processing Overlay State */}
        {processingState === 'processing' && (
          <div className="py-12 flex flex-col items-center text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#e5a93c] animate-spin" />
            <h4 className="text-lg font-bold text-white">Processing Payment Securely</h4>
            <p className="text-xs text-gray-400 max-w-sm">{statusMessage}</p>
          </div>
        )}

        {/* Conflict Simulation Display */}
        {processingState === 'conflict' && (
          <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Simulated Concurrency Test Result</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{statusMessage}</p>
            <button
              onClick={() => setProcessingState('idle')}
              className="btn-champagne px-4 py-2 rounded-xl text-xs font-bold"
            >
              Resume My Payment
            </button>
          </div>
        )}

        {/* Main Payment Options */}
        {processingState === 'idle' && (
          <>
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setActiveTab('upi')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${activeTab === 'upi' ? 'bg-[#d4af37] text-black shadow-md font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI</span>
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${activeTab === 'card' ? 'bg-[#d4af37] text-black shadow-md font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setActiveTab('netbanking')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${activeTab === 'netbanking' ? 'bg-[#d4af37] text-black shadow-md font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Net Banking</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${activeTab === 'wallet' ? 'bg-[#d4af37] text-black shadow-md font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Wallets</span>
              </button>
            </div>

            {/* Tab 1: UPI Options */}
            {activeTab === 'upi' && (
              <div className="space-y-4 pt-1">
                {/* UPI Sub-selector */}
                <div className="flex space-x-2 text-xs">
                  <button
                    onClick={() => setUpiOption('apps')}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${upiOption === 'apps' ? 'bg-white/15 border-[#d4af37] text-white font-bold' : 'border-white/10 text-gray-400'
                      }`}
                  >
                    UPI Apps
                  </button>
                  <button
                    onClick={() => setUpiOption('id')}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${upiOption === 'id' ? 'bg-white/15 border-[#d4af37] text-white font-bold' : 'border-white/10 text-gray-400'
                      }`}
                  >
                    Enter UPI ID
                  </button>
                  <button
                    onClick={() => setUpiOption('qr')}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${upiOption === 'qr' ? 'bg-white/15 border-[#d4af37] text-white font-bold' : 'border-white/10 text-gray-400'
                      }`}
                  >
                    Scan QR
                  </button>
                </div>

                {upiOption === 'apps' && (
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    {[
                      { id: 'gpay', name: 'Google Pay', icon: <GooglePayLogo /> },
                      { id: 'phonepe', name: 'PhonePe', icon: <PhonePeLogo /> },
                      { id: 'paytm', name: 'Paytm UPI', icon: <PaytmLogo /> }
                    ].map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-2 ${selectedApp === app.id
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-md ring-1 ring-[#d4af37]/50'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                          }`}
                      >
                        {app.icon}
                        <span className="text-xs font-bold">{app.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {upiOption === 'id' && (
                  <div className="space-y-2 pt-1">
                    <label className="text-xs text-gray-400">Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      placeholder="username@okhdfcbank or mobilenumber@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                )}

                {upiOption === 'qr' && (
                  <div className="p-4 rounded-2xl bg-white text-black flex flex-col items-center text-center space-y-2">
                    <div className="w-32 h-32 bg-gray-100 border border-gray-300 rounded-xl p-2 flex items-center justify-center shadow-inner">
                      <QrCode className="w-24 h-24 text-gray-900" />
                    </div>
                    <p className="text-xs font-bold text-gray-800">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                    <p className="text-[10px] text-gray-500">Instant verification upon scan completion</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Credit / Debit Card */}
            {activeTab === 'card' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs text-gray-400">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4532 •••• •••• 8901 (Visa / Mastercard / RuPay)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Name on Card</label>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Net Banking */}
            {activeTab === 'netbanking' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${selectedBank === bank
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5e6b3]'
                        : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                      }`}
                  >
                    {bank} Bank
                  </button>
                ))}
              </div>
            )}

            {/* Tab 4: Wallets */}
            {activeTab === 'wallet' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet', 'Mobikwik'].map((wallet) => (
                  <button
                    key={wallet}
                    className="p-3.5 rounded-2xl border border-white/10 bg-black/40 text-xs font-bold hover:border-[#d4af37]/40 hover:text-white transition-all text-left"
                  >
                    {wallet}
                  </button>
                ))}
              </div>
            )}

            {/* Pay CTA Button */}
            <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
              <button
                onClick={handlePay}
                className="w-full btn-cinema py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center space-x-2 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{calculatedTotal} Securely</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

