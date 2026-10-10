import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Check, ArrowLeft, Sparkles, Shield, Phone, Mail, Globe, Lock, X, User } from 'lucide-react';
import { COUNTRIES, CountryInfo, detectUserGeo } from '../utils/currency';
import { CustomerProfile } from '../types';
import { LumysicLogo } from './LumysicLogo';

interface AuthScreenProps {
  onLoginSuccess: (profile: Partial<CustomerProfile>) => void;
  onBackToSite?: () => void;
  detectedGeo?: CountryInfo;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onBackToSite,
  detectedGeo
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(
    detectedGeo || COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0]
  );
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name') || '';
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const saved = localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone') || '';
    return saved.replace(/^\+\d+\s*/, '');
  });
  const [formError, setFormError] = useState('');
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // OTP Step
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  // Auto-detect geo if not provided
  useEffect(() => {
    if (!detectedGeo) {
      detectUserGeo().then(geo => {
        if (geo) setSelectedCountry(geo);
      });
    } else {
      setSelectedCountry(detectedGeo);
    }
  }, [detectedGeo]);

  // Resend timer
  useEffect(() => {
    if (step === 'otp' && resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendCountdown]);

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.currency.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = userName.trim();
    if (!cleanName) {
      setFormError('Please enter your name');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 6) {
      setFormError('Please enter a valid contact number');
      return;
    }
    setFormError('');
    setStep('otp');
    setResendCountdown(30);
    setOtpError('');
  };

  const handleInstantLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = userName.trim();
    if (!cleanName) {
      setFormError('Please enter your name');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 6) {
      setFormError('Please enter a valid contact number');
      return;
    }
    setFormError('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const cleanPhone = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
      const resolvedCurrency = selectedCountry.code === 'GB' || selectedCountry.dialCode === '+44' ? 'GBP' : 'USD';
      localStorage.setItem('astral_customer_name', cleanName);
      localStorage.setItem('lumysic_user_name', cleanName);
      localStorage.setItem('astral_customer_phone', cleanPhone);
      localStorage.setItem('lumysic_user_phone', cleanPhone);
      localStorage.setItem('astral_currency', resolvedCurrency);
      localStorage.setItem('astral_is_logged_in', 'true');
      onLoginSuccess({
        id: 'usr_' + Date.now(),
        name: cleanName,
        phone: cleanPhone,
        country: selectedCountry.code,
        countryCode: selectedCountry.dialCode,
        currency: resolvedCurrency,
        isFirstTimeUser: false,
        freeMinutesUsed: false,
        totalConsultations: 0
      });
    }, 450);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const nextOtp = [...otp];
    nextOtp[index] = val.slice(-1);
    setOtp(nextOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      setOtpError('Please enter all 4 digits');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const cleanPhone = `${selectedCountry.dialCode} ${phoneNumber.trim()}`;
      const finalName = userName.trim() || 'LUMSIC Seeker';
      const resolvedCurrency = selectedCountry.code === 'GB' || selectedCountry.dialCode === '+44' ? 'GBP' : 'USD';
      localStorage.setItem('astral_customer_name', finalName);
      localStorage.setItem('lumysic_user_name', finalName);
      localStorage.setItem('lumsic_user_name', finalName);
      localStorage.setItem('astral_customer_phone', cleanPhone);
      localStorage.setItem('lumysic_user_phone', cleanPhone);
      localStorage.setItem('lumsic_user_phone', cleanPhone);
      localStorage.setItem('astral_currency', resolvedCurrency);
      localStorage.setItem('astral_is_logged_in', 'true');
      onLoginSuccess({
        id: 'usr_' + Date.now(),
        name: finalName,
        phone: cleanPhone,
        country: selectedCountry.code,
        countryCode: selectedCountry.dialCode,
        currency: resolvedCurrency,
        isFirstTimeUser: false,
        freeMinutesUsed: false,
        totalConsultations: 0
      });
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const finalName = userName.trim() || 'LUMSIC Seeker';
      const cleanPhone = `${selectedCountry.dialCode} ${phoneNumber.trim() || '50 123 4567'}`;
      localStorage.setItem('astral_customer_name', finalName);
      localStorage.setItem('lumysic_user_name', finalName);
      localStorage.setItem('lumsic_user_name', finalName);
      localStorage.setItem('astral_customer_phone', cleanPhone);
      localStorage.setItem('lumysic_user_phone', cleanPhone);
      localStorage.setItem('lumsic_user_phone', cleanPhone);
      localStorage.setItem('astral_is_logged_in', 'true');
      onLoginSuccess({
        id: 'usr_google_' + Date.now(),
        name: finalName,
        email: 'user@lumsic.com',
        phone: cleanPhone,
        country: selectedCountry.code,
        countryCode: selectedCountry.dialCode,
        currency: selectedCountry.currency,
        isFirstTimeUser: false,
        freeMinutesUsed: false,
        totalConsultations: 0
      });
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#060A1C] text-white flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Ambient Nebular Light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between relative z-10 pt-2">
        {step === 'otp' ? (
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Number</span>
          </button>
        ) : onBackToSite ? (
          <button
            type="button"
            onClick={onBackToSite}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-amber-300/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Website</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-xs text-emerald-400/90 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>256-bit Secure Sanctuary</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-amber-300 font-medium">
            <span>{selectedCountry.flag}</span>
            <span className="font-bold">{selectedCountry.currency}</span>
          </div>
          {onBackToSite && (
            <button
              type="button"
              onClick={onBackToSite}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              title="Close and return to website"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Centered Card Container */}
      <div className="w-full max-w-md my-auto relative z-10 flex flex-col items-center">
        {/* LUMSIC Aries Celestial Logo Emblem - Perfectly sized */}
        <div className="mb-3 transition-transform duration-300 hover:scale-105">
          <LumysicLogo size={88} glow={true} />
        </div>

        {/* Stylish LUMSIC Brand Name */}
        <div className="flex flex-col items-center text-center">
          <h1 
            className="text-3xl sm:text-[34px] font-extrabold uppercase bg-gradient-to-r from-[#FFF9E6] via-[#F6D06E] to-[#D4A034] bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(246,208,110,0.45)] select-none"
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
              letterSpacing: '0.24em'
            }}
          >
            LUMSIC
          </h1>

          {/* Elegant Celestial Divider */}
          <div className="flex items-center justify-center gap-2.5 mt-1.5 w-full">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#F6D06E]/70" />
            <span className="text-[11px] text-[#F6D06E] select-none filter drop-shadow-[0_0_6px_rgba(246,208,110,0.8)]">✦</span>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#F6D06E]/70" />
          </div>

          <p className="text-xs sm:text-sm text-[#FCE38A]/85 mt-2 mb-6 text-center font-medium tracking-wide">
            Discover Your Cosmic Path &amp; Spiritual Guidance
          </p>
        </div>

        {/* STEP 1: NAME & CONTACT NUMBER LOGIN */}
        {step === 'phone' && (
          <div className="w-full bg-[#0D1536]/90 border border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Divider "Login or Sign Up" */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wide">
                Login or Create Account
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center animate-in fade-in">
                {formError}
              </div>
            )}

            {/* Form: Name & Contact Number */}
            <form onSubmit={handleInstantLogin} className="space-y-4">
              {/* 1. Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Your Name</span>
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-normal">Shown in profile</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Enter your name"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white placeholder-slate-400 text-sm font-medium transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* 2. Contact Number Input with Country Code Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#F6D06E]" />
                    <span>Contact Number</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Country dial code</span>
                </label>
                <div className="flex items-stretch gap-2">
                  {/* Country Picker Button */}
                  <button
                    type="button"
                    onClick={() => setIsCountryPickerOpen(true)}
                    className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 hover:border-amber-400/50 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
                    title="Change Country Code"
                  >
                    <span className="text-lg leading-none">{selectedCountry.flag}</span>
                    <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Mobile Number Input Field */}
                  <div className="flex-1 relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="Enter contact number"
                      className="w-full h-full px-4 py-3 rounded-2xl bg-[#141E47] border border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white placeholder-slate-400 text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Continue Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={!userName.trim() || !phoneNumber.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  <Sparkles className="w-4 h-4 fill-gray-950" />
                  <span>Continue / Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!userName.trim() || !phoneNumber.trim()}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
                >
                  Verify with 4-Digit OTP Code
                </button>
              </div>
            </form>

            {/* Divider "or" */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Login: Google */}
            <div className="grid grid-cols-1 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 text-gray-800 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            {onBackToSite && (
              <div className="mt-5 pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={onBackToSite}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#F6D06E]" />
                  <span>Back to Website</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="w-full bg-[#0D1536]/90 border border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Enter Verification Code
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                We sent a 4-digit code to{' '}
                <span className="font-mono text-[#F6D06E] font-bold">
                  {selectedCountry.dialCode} {phoneNumber}
                </span>
              </p>
            </div>

            {/* 4-Digit Input Boxes */}
            <div className="flex justify-center gap-3 my-6">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className="w-13 h-14 text-center text-xl font-bold font-mono rounded-2xl bg-[#141E47] border-2 border-indigo-800/80 focus:border-[#F6D06E] focus:outline-none text-white transition-all shadow-inner"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-rose-400 text-center mb-3 font-semibold">
                {otpError}
              </p>
            )}

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F6D06E] via-[#FACC15] to-[#E5B744] hover:brightness-110 active:scale-[0.99] text-gray-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
            >
              <Sparkles className="w-4 h-4 fill-gray-950" />
              <span>{isVerifying ? 'Verifying...' : 'Verify & Enter'}</span>
            </button>

            {/* Resend OTP */}
            <div className="text-center mt-5 text-xs text-slate-400">
              {resendCountdown > 0 ? (
                <span>Resend code in <b className="text-white font-mono">{resendCountdown}s</b></span>
              ) : (
                <button
                  type="button"
                  onClick={() => setResendCountdown(30)}
                  className="text-[#F6D06E] font-bold hover:underline cursor-pointer"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Terms */}
      <div className="relative z-10 text-center text-[11px] text-slate-400 max-w-sm px-4 pt-4">
        By continuing, you agree to our{' '}
        <span className="text-slate-300 underline cursor-pointer hover:text-white">Terms of Use</span> &amp;{' '}
        <span className="text-slate-300 underline cursor-pointer hover:text-white">Privacy Policy</span>.
      </div>

      {/* COUNTRY CODE PICKER MODAL */}
      {isCountryPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D1536] border border-indigo-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[85vh] flex flex-col text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#F6D06E]" />
                <span>Select Your Country &amp; Currency</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCountryPickerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative my-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country, dial code (+971, +1, +44)..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#141E47] border border-indigo-800 focus:border-[#F6D06E] focus:outline-none text-white text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-indigo-900">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      localStorage.setItem('astral_country', c.code);
                      localStorage.setItem('astral_currency', c.currency);
                      setIsCountryPickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-amber-400/15 border border-amber-300/40 text-white' 
                        : 'hover:bg-white/5 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{c.flag}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Currency: <span className="text-[#F6D06E] font-semibold">{c.currency} ({c.currencySymbol.trim()})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                        {c.dialCode}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#F6D06E]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
