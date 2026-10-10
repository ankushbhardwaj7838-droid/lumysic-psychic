import React, { useState, useEffect, useRef } from 'react';
import { Reader, ConsultationSession, ChatMessage } from '../types';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  CheckCheck, 
  Check, 
  Smile, 
  Paperclip, 
  Camera, 
  Mic, 
  Send, 
  X, 
  PhoneOff, 
  Sparkles, 
  User, 
  Lock, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Compass, 
  Heart, 
  FileText, 
  Bookmark, 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  ChevronRight, 
  Sliders, 
  Star, 
  Orbit, 
  Eye, 
  Zap, 
  Flame, 
  Search, 
  MessageSquare, 
  PhoneCall, 
  Plus
} from 'lucide-react';

interface AstroboardViewProps {
  onBackToSite: () => void;
  onOpenAdmin?: () => void;
  readers?: Reader[];
  onToggleReaderOnline?: (readerId: string, isOnline: boolean) => void;
}

// 12 Zodiac signs for optional tools tab
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', ruler: 'Mars', color: '#F9DCD2' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', ruler: 'Venus', color: '#CDEFD9' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', ruler: 'Mercury', color: '#FFF9B8' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', ruler: 'Moon', color: '#DDE3FF' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', ruler: 'Sun', color: '#F9DCD2' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', ruler: 'Mercury', color: '#D8F1E9' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air', ruler: 'Venus', color: '#F8D5E5' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', ruler: 'Pluto', color: '#E5D9FF' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire', ruler: 'Jupiter', color: '#FFF9B8' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', ruler: 'Saturn', color: '#CDEFD9' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air', ruler: 'Uranus', color: '#DDE3FF' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', ruler: 'Neptune', color: '#E5D9FF' }
];

export const AstroboardView: React.FC<AstroboardViewProps> = ({
  onBackToSite,
  onOpenAdmin,
  readers: initialReaders,
  onToggleReaderOnline
}) => {
  // Readers List
  const [readers, setReaders] = useState<Reader[]>(initialReaders || []);

  // Currently authenticated Astrologer
  const [currentAstrologer, setCurrentAstrologer] = useState<Reader | null>(() => {
    try {
      const saved = localStorage.getItem('astrodashboard_logged_in_astro');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialReaders?.[0] || null;
  });

  // Top level tab: 'portal' (Astrologer Portal & Landing Chats) or 'tools' (AstroSphere Personal Dashboard)
  const [activeMainTab, setActiveMainTab] = useState<'portal' | 'tools'>('portal');

  // Consultation Sessions
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ConsultationSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Calling & Menu state for chat
  const [callingState, setCallingState] = useState<'voice' | 'video' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreenChat, setIsFullscreenChat] = useState(false);

  // Astrologer Login state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSetupReader, setPasswordSetupReader] = useState<Reader | null>(null);

  // Tools Tab subviews
  const [toolsSubView, setToolsSubView] = useState<string | null>(null);
  const [selectedZodiacSign, setSelectedZodiacSign] = useState<any>(ZODIAC_SIGNS[6]);
  const [selectedHoroscopePeriod, setSelectedHoroscopePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch readers
  const fetchReaders = async () => {
    try {
      const res = await fetch('/api/readers');
      const data = await res.json();
      if (data.readers && Array.isArray(data.readers)) {
        setReaders(data.readers);
        if (!currentAstrologer && data.readers.length > 0) {
          setCurrentAstrologer(data.readers[0]);
          localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(data.readers[0]));
        }
      }
    } catch (err) {
      console.error('Failed to load readers:', err);
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const res = await fetch('/api/astroboard/sessions');
      const data = await res.json();
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);

        // Keep activeChatSession up to date
        if (activeChatSession) {
          const updated = data.sessions.find((s: ConsultationSession) => s.id === activeChatSession.id);
          if (updated) {
            setActiveChatSession(updated);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchReaders();
    fetchSessions();

    const interval = setInterval(() => {
      fetchSessions();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeChatSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatSession?.messages]);

  // Online / Offline toggle
  const handleToggleOnline = async () => {
    if (!currentAstrologer) return;
    const newStatus = !currentAstrologer.isOnline;
    const updated = { ...currentAstrologer, isOnline: newStatus };
    setCurrentAstrologer(updated);
    localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(updated));

    if (onToggleReaderOnline) {
      onToggleReaderOnline(currentAstrologer.id, newStatus);
    }

    try {
      await fetch(`/api/readers/${currentAstrologer.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'isOnline', value: newStatus })
      });
      fetchReaders();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Handle Astrologer Login
  const handleAstrologerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const payload: any = { loginMethod };
      if (loginMethod === 'phone') {
        payload.phone = loginPhone;
      } else {
        payload.email = loginIdentifier;
        payload.password = loginPassword;
      }

      const res = await fetch('/api/astrologer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Login failed. Please check your credentials.');
        setIsLoggingIn(false);
        return;
      }

      if (data.requiresPasswordSetup) {
        setPasswordSetupReader(data.reader);
        setRequiresPasswordSetup(true);
        setIsLoggingIn(false);
        return;
      }

      // Successful login
      setCurrentAstrologer(data.reader);
      localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(data.reader));
      setIsLoginModalOpen(false);
      setLoginIdentifier('');
      setLoginPassword('');
      setLoginPhone('');
    } catch (err: any) {
      setLoginError(err.message || 'Network error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle setting password for first time login
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordSetupReader) return;
    if (newPassword.length < 4) {
      setLoginError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/astrologer/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: passwordSetupReader.id,
          astroId: passwordSetupReader.astroId,
          newPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Failed to set password.');
        setIsLoggingIn(false);
        return;
      }

      const updatedReader = data.reader || passwordSetupReader;
      setCurrentAstrologer(updatedReader);
      localStorage.setItem('astrodashboard_logged_in_astro', JSON.stringify(updatedReader));
      setRequiresPasswordSetup(false);
      setPasswordSetupReader(null);
      setNewPassword('');
      setIsLoginModalOpen(false);
      fetchReaders();
    } catch (err: any) {
      setLoginError(err.message || 'Failed to update password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Send message in chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatSession || !inputText.trim() || !currentAstrologer) return;

    const textToSend = inputText.trim();
    setInputText('');

    const optimisticMsg: ChatMessage = {
      id: 'msg_astro_' + Date.now(),
      sessionId: activeChatSession.id,
      sender: 'astrologer',
      senderName: currentAstrologer.name,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setActiveChatSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, optimisticMsg]
    } : null);

    try {
      await fetch(`/api/sessions/${activeChatSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'astrologer',
          senderName: currentAstrologer.name,
          text: textToSend
        })
      });

    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Filter landing chats for this logged in astrologer
  const astrologerSessions = sessions.filter(s => {
    if (!currentAstrologer) return true;
    return (
      s.requestedReaderId === currentAstrologer.id ||
      s.requestedReaderId === currentAstrologer.astroId ||
      s.assignedReaderId === currentAstrologer.id ||
      s.assignedReaderId === currentAstrologer.astroId
    );
  });

  // Effective landing sessions (or all if none match specifically)
  const displaySessions = astrologerSessions.length > 0 ? astrologerSessions : sessions;

  // Format time for WhatsApp bubbles (e.g., 12:44 PM)
  const formatTime = (isoString?: string) => {
    if (!isoString) return '12:44 PM';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '12:44 PM';
    }
  };

  // =========================================================================
  // VIEW: IF A CHAT IS CURRENTLY ACTIVE AND LANDED
  // EXACTLY MATCHING WhatsApp Image 2026-10-04 at 12.44.27 PM.jpeg
  // WITH STRICTLY NO EXTRA DETAILS!
  // =========================================================================
  if (activeChatSession) {
    const contactName = activeChatSession.customerName || 'Ankush';
    
    return (
      <div className="fixed inset-0 z-50 bg-[#0B1015] flex items-center justify-center sm:p-4 select-none">
        
        {/* Mobile Phone Mockup Frame or Responsive Container */}
        <div className={`w-full ${isFullscreenChat ? 'h-full max-w-full' : 'max-w-[425px] h-full sm:h-[860px] sm:max-h-[95vh] sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] sm:border-[8px] sm:border-[#1F2C34]'} bg-[#EFEAE2] flex flex-col overflow-hidden relative transition-all duration-200`}>

          {/* 1. TOP HEADER (WHATSAPP FOREST GREEN #008069 / #075E54) */}
          <header className="bg-[#008069] text-white px-2 sm:px-3 py-2.5 flex items-center justify-between shrink-0 shadow-sm z-30">
            
            {/* Left: Back button + Avatar + Name + Online Status */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              
              {/* Back button */}
              <button
                type="button"
                onClick={() => setActiveChatSession(null)}
                className="p-1 -ml-1 rounded-full hover:bg-black/10 active:scale-95 transition-all text-white cursor-pointer"
                title="Back to Astrodashboard"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </button>

              {/* Avatar circle */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                <span className="font-bold text-white text-sm sm:text-base">
                  {contactName.charAt(0).toUpperCase()}
                </span>
                {/* Online tiny indicator on avatar edge */}
                <span className="w-2.5 h-2.5 bg-[#25D366] rounded-full absolute bottom-0 right-0 border-2 border-[#008069]" />
              </div>

              {/* Contact Name & Status */}
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-[15px] sm:text-[16px] text-white tracking-tight truncate">
                    {contactName}
                  </h3>
                  {/* Verified / Trust check badge */}
                  <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] text-[#008069] flex items-center justify-center text-[9px] font-black shrink-0">
                    ✓
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-[12px] text-emerald-100 font-normal leading-none mt-0.5">
                  online
                </p>
              </div>

            </div>

            {/* Right Action Icons: Video Call, Voice Call, 3-dots Menu */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              
              {/* Video Call */}
              <button
                type="button"
                onClick={() => setCallingState('video')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-black/10 active:scale-90 transition-all cursor-pointer"
                title="Video Call"
              >
                <Video className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Voice Call */}
              <button
                type="button"
                onClick={() => setCallingState('voice')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-black/10 active:scale-90 transition-all cursor-pointer"
                title="Voice Call"
              >
                <Phone className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>

              {/* 3-dots Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-black/10 active:scale-90 transition-all cursor-pointer"
                  title="More Options"
                >
                  <MoreVertical className="w-5 h-5 stroke-[2.2]" />
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 w-44 text-xs font-semibold text-gray-800 z-50 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => {
                        setIsFullscreenChat(!isFullscreenChat);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-gray-100 flex items-center justify-between cursor-pointer"
                    >
                      <span>{isFullscreenChat ? 'Mobile Frame' : 'Full Screen'}</span>
                      {isFullscreenChat ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setActiveChatSession(null);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-gray-100 text-rose-600 cursor-pointer"
                    >
                      Close Consultation
                    </button>
                  </div>
                )}
              </div>

            </div>

          </header>

          {/* 2. CHAT CANVAS WITH WHATSAPP DOODLE WALLPAPER */}
          <div 
            className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 flex flex-col gap-2 relative bg-[#EFEAE2]"
            style={{
              backgroundImage: `radial-gradient(#D6CEBA 1px, transparent 1px), radial-gradient(#D6CEBA 1px, #EFEAE2 1px)`,
              backgroundSize: '28px 28px',
              backgroundPosition: '0 0, 14px 14px'
            }}
          >
            
            {/* Center Date Badge "TODAY" */}
            <div className="flex justify-center my-1 select-none">
              <span className="bg-white/90 backdrop-blur-xs text-[#54656F] text-[11px] font-semibold px-3 py-0.5 rounded-lg shadow-xs uppercase tracking-wider">
                TODAY
              </span>
            </div>

            {/* Messages Stream: Filtered & Clean */}
            {activeChatSession.messages && activeChatSession.messages.length > 0 ? (
              activeChatSession.messages.map((msg, idx) => {
                const isAstrologer = msg.sender === 'astrologer';
                const timeText = formatTime(msg.timestamp);

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isAstrologer ? 'items-end' : 'items-start'} my-0.5`}
                  >
                    <div
                      className={`max-w-[84%] sm:max-w-[75%] px-3 pt-2 pb-1.5 shadow-[0_1px_1.5px_rgba(0,0,0,0.13)] relative leading-relaxed select-text ${
                        isAstrologer
                          ? 'bg-[#D9FDD3] text-[#111B21] rounded-2xl rounded-tr-xs'
                          : 'bg-[#FFFFFF] text-[#111B21] rounded-2xl rounded-tl-xs'
                      }`}
                    >
                      {/* Message Content */}
                      <p className="text-[14px] sm:text-[14.5px] leading-snug whitespace-pre-wrap break-words pr-2">
                        {msg.text}
                      </p>

                      {/* Bottom Timestamp + Blue Checkmarks */}
                      <div className="flex items-center justify-end gap-1 text-[10px] sm:text-[10.5px] text-[#667781] mt-0.5 select-none font-normal">
                        <span>{timeText}</span>
                        {isAstrologer && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="my-auto text-center p-6 text-xs text-[#54656F] bg-white/70 backdrop-blur-xs rounded-2xl mx-auto max-w-xs shadow-xs">
                <p className="font-semibold text-gray-700">Chat connected with {contactName}</p>
                <p className="text-[11px] mt-1 text-gray-500">Send a greeting message to start the consultation.</p>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* 3. BOTTOM INPUT BAR (WHATSAPP STYLE WITH SMILE, ATTACHMENT, CAMERA & SEND/MIC BUTTON) */}
          <form 
            onSubmit={handleSendMessage}
            className="bg-[#F0F2F5] px-2 py-2 flex items-center gap-1.5 border-t border-[#E9EDEF] shrink-0 z-30"
          >
            
            {/* Pill Capsule */}
            <div className="flex-1 bg-white rounded-full px-3 py-1 flex items-center gap-2 shadow-xs border border-transparent focus-within:border-emerald-500">
              
              {/* Smile Emoji Icon */}
              <button
                type="button"
                className="text-[#54656F] hover:text-[#111B21] transition-colors p-1 cursor-pointer shrink-0"
                title="Emoji"
              >
                <Smile className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2]" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message"
                className="w-full bg-transparent text-[14.5px] sm:text-[15px] text-[#111B21] placeholder-[#8696A0] outline-none py-1.5"
                autoFocus
              />

              {/* Paperclip Attachment Icon */}
              <button
                type="button"
                className="text-[#54656F] hover:text-[#111B21] transition-colors p-1 cursor-pointer shrink-0 rotate-45"
                title="Attach"
              >
                <Paperclip className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
              </button>

              {/* Camera Icon */}
              <button
                type="button"
                className="text-[#54656F] hover:text-[#111B21] transition-colors p-1 cursor-pointer shrink-0"
                title="Camera"
              >
                <Camera className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2]" />
              </button>

            </div>

            {/* Circular Green Send / Microphone Button */}
            <button
              type="submit"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#00A884] hover:bg-[#02906F] text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
              title={inputText.trim() ? 'Send Message' : 'Voice Note'}
            >
              {inputText.trim() ? (
                <Send className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.4] ml-0.5" />
              ) : (
                <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
              )}
            </button>

          </form>

          {/* REALISTIC CALLING OVERLAY (WHEN CLICKING PHONE OR VIDEO CALL) */}
          {callingState && (
            <div className="absolute inset-0 z-50 bg-[#0B141A]/95 backdrop-blur-md flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-200">
              
              <div className="text-center pt-8 space-y-3">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  {callingState === 'video' ? 'WhatsApp Video Call' : 'WhatsApp Voice Call'}
                </span>
                <h3 className="text-2xl font-black text-white">{contactName}</h3>
                <p className="text-sm text-gray-300 animate-pulse">Ringing...</p>
              </div>

              <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center shadow-2xl relative">
                <span className="text-4xl font-extrabold text-white">
                  {contactName.charAt(0).toUpperCase()}
                </span>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
              </div>

              <div className="pb-8">
                <button
                  type="button"
                  onClick={() => setCallingState(null)}
                  className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN ASTRODASHBOARD (WHITE & REDDISH THEME)
  // SHOWING ASTROLOGER ASTRO ID, LANDING CHATS & FORECAST TOOLS
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#171717] font-sans flex flex-col selection:bg-[#FF999D]/30 selection:text-[#171717] pb-16">
      
      {/* ================= TOP GLOBAL HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#D8D8D8] px-4 sm:px-8 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="w-10 h-10 rounded-2xl bg-[#F8D5E5] text-[#FF999D] flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              title="Return to Public Site"
            >
              <Sparkles className="w-5 h-5 text-[#171717]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-rose-600 leading-none">
                  LUMSIC
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  ASTRODASHBOARD
                </span>
              </div>
              <p className="text-xs text-[#777777] mt-0.5 leading-tight">
                Astrologer Portal &amp; Live Chat Landing
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Direct Link to Admin Panel */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex text-xs font-bold text-[#777777] hover:text-[#171717] px-3 py-1.5 rounded-xl border border-[#D8D8D8] hover:border-[#171717] transition-all items-center gap-1.5 cursor-pointer"
                title="Go to Admin Panel"
              >
                <Shield className="w-3.5 h-3.5 text-[#FF999D]" />
                <span>Admin CMS</span>
              </button>
            )}

            {/* Login / Switch Account Button */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FFF9B8] hover:bg-[#FFF59D] text-[#171717] font-bold text-xs flex items-center gap-1.5 border border-[#D8D8D8] transition-colors cursor-pointer shadow-xs"
              title="Astro ID Login or Switch Account"
            >
              <User className="w-3.5 h-3.5 text-[#171717]" />
              <span className="hidden xs:inline">Astro ID Login</span>
            </button>

            {/* Back to Public Site */}
            <button
              onClick={onBackToSite}
              className="text-xs font-semibold text-[#777777] hover:text-[#171717] px-3 py-1.5 rounded-xl border border-[#D8D8D8] hover:border-[#171717] transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Main Site</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* ================= WORKSPACE MAIN ================= */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-6 flex-1">
        
        {/* 1. TOP PROFILE & STATUS HERO CARD */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D8D8D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#F8D5E5] to-[#FFA3A5] text-[#171717] flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-inner border border-[#D8D8D8]">
              {currentAstrologer ? currentAstrologer.name.charAt(0) : 'A'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF999D]">
                  Welcome back
                </span>
                {currentAstrologer?.astroId && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFF9B8] border border-[#D8D8D8] text-[#171717]">
                    ID: {currentAstrologer.astroId}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#171717] truncate leading-tight mt-0.5">
                {currentAstrologer ? currentAstrologer.name : 'Astrologer'}
              </h2>

              <p className="text-xs text-[#777777] mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{currentAstrologer?.email || 'Registered Astrologer'}</span>
                {currentAstrologer?.phone && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">📱 {currentAstrologer.phone} (Mobile Enabled)</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            
            {/* Online / Offline Status Toggle */}
            <button
              onClick={handleToggleOnline}
              className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                currentAstrologer?.isOnline
                  ? 'bg-[#CDEFD9] border-emerald-300 text-emerald-900'
                  : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}
              title="Toggle Live Online Availability"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${currentAstrologer?.isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
              <span>{currentAstrologer?.isOnline ? 'Profile Online (Accepting Chats)' : 'Profile Offline'}</span>
            </button>

          </div>

        </div>

        {/* 2. TAB SELECTOR: CHAT LANDING PORTAL VS COSMIC TOOLS */}
        <div className="flex items-center gap-2 border-b border-[#D8D8D8] pb-2">
          <button
            onClick={() => setActiveMainTab('portal')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'portal'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#171717] hover:bg-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#FF999D]" />
            <span>Landing Chats for Astro ID</span>
            {displaySessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#FF999D] text-white text-[10px] font-bold">
                {displaySessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMainTab('tools')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'tools'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'text-[#777777] hover:text-[#171717] hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FF999D]" />
            <span>Personal AstroSphere Tools</span>
          </button>
        </div>

        {/* ============================================================= */}
        {/* TAB 1: LANDING CHATS FOR ASTRO ID (REQUEST 2 & REQUEST 3) */}
        {/* ============================================================= */}
        {activeMainTab === 'portal' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#171717]">
                  Consultation Chat Queue for {currentAstrologer?.astroId || 'Your Astro ID'}
                </h3>
                <p className="text-xs text-[#777777]">
                  When a seeker starts a chat with your Astro ID, it lands here. Click to open the ultra-clean messaging screen.
                </p>
              </div>

              <button
                onClick={fetchSessions}
                className="p-2 rounded-xl bg-white border border-[#D8D8D8] text-[#777777] hover:text-[#171717] cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-xs"
                title="Refresh sessions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* List of landing chats */}
            {displaySessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displaySessions.map((session) => {
                  const customerName = session.customerName || 'Seeker';
                  const lastMessage = session.messages && session.messages.length > 0 
                    ? session.messages[session.messages.length - 1].text 
                    : session.initialQuestion || 'Consultation request';
                  const lastTime = session.messages && session.messages.length > 0
                    ? formatTime(session.messages[session.messages.length - 1].timestamp)
                    : formatTime(session.createdAt);

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-3xl p-5 border border-[#D8D8D8] hover:border-[#FF999D] shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-3">
                        
                        {/* Top row: Avatar + Name + Status Pill */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#E5D9FF] text-[#171717] font-black text-lg flex items-center justify-center shrink-0 border border-[#D8D8D8]">
                              {customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-base text-[#171717]">
                                  {customerName}
                                </h4>
                                <span className="w-3.5 h-3.5 rounded-full bg-[#25D366] text-[#008069] flex items-center justify-center text-[9px] font-black">
                                  ✓
                                </span>
                              </div>
                              <span className="text-[11px] text-[#777777] block">
                                Assigned to: {session.requestedAstroId || currentAstrologer?.astroId || 'Astro ID'}
                              </span>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            session.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#FFF9B8] text-amber-900'
                          }`}>
                            {session.status === 'active' ? 'Active Chat' : 'Incoming'}
                          </span>
                        </div>

                        {/* Last Message Snippet */}
                        <div className="bg-[#F5F5F5] p-3 rounded-2xl border border-[#D8D8D8]/70 text-xs text-[#171717]">
                          <span className="text-[10px] font-bold text-[#777777] block uppercase mb-0.5">
                            Last Message · {lastTime}
                          </span>
                          <p className="line-clamp-2 leading-relaxed italic">
                            "{lastMessage}"
                          </p>
                        </div>

                      </div>

                      {/* Action Button: Open Clean WhatsApp Chat */}
                      <button
                        onClick={() => setActiveChatSession(session)}
                        className="w-full py-2.5 rounded-2xl bg-[#008069] hover:bg-[#02906F] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Chat with {customerName}</span>
                      </button>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 border border-[#D8D8D8] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F8D5E5] text-[#FF999D] flex items-center justify-center mx-auto text-2xl">
                  💬
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-extrabold text-base text-[#171717]">No active consultations in queue</h4>
                  <p className="text-xs text-[#777777]">
                    When a seeker chooses your Astro ID ({currentAstrologer?.astroId || 'ASTRO-ID'}), the chat will land here in real time.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: ASTROSPHERE PERSONAL TOOLS (REQUEST 1 PRESERVED) */}
        {/* ============================================================= */}
        {activeMainTab === 'tools' && (
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <section className="space-y-3">
              <h3 className="font-extrabold text-base text-[#171717]">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setToolsSubView('horoscope')}
                  className="bg-white rounded-3xl p-4 border border-[#D8D8D8] shadow-xs cursor-pointer hover:border-[#FF999D] transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9B8] flex items-center justify-center shrink-0 border border-[#D8D8D8]/50 group-hover:scale-105 transition-transform">
                    <Sun className="w-6 h-6 text-[#171717]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#171717]">Daily Horoscope</h4>
                    <p className="text-xs text-[#777777]">Today's transit alignment</p>
                  </div>
                </div>

                <div 
                  onClick={() => setToolsSubView('birth_chart')}
                  className="bg-white rounded-3xl p-4 border border-[#D8D8D8] shadow-xs cursor-pointer hover:border-[#FF999D] transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#DDE3FF] flex items-center justify-center shrink-0 border border-[#D8D8D8]/50 group-hover:scale-105 transition-transform">
                    <Compass className="w-6 h-6 text-[#171717]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#171717]">Birth Chart</h4>
                    <p className="text-xs text-[#777777]">Natal houses &amp; aspects</p>
                  </div>
                </div>

                <div 
                  onClick={() => setToolsSubView('tarot')}
                  className="bg-white rounded-3xl p-4 border border-[#D8D8D8] shadow-xs cursor-pointer hover:border-[#FF999D] transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E5D9FF] flex items-center justify-center shrink-0 border border-[#D8D8D8]/50 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6 text-[#171717]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#171717]">Tarot Reading</h4>
                    <p className="text-xs text-[#777777]">3-Card intuitive spread</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Today's Astrology Card */}
            <section className="bg-white rounded-3xl p-6 border border-[#D8D8D8] shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF999D]">
                  Cosmic Overview
                </span>
                <h3 className="font-extrabold text-lg text-[#171717]">Today's Astrology</h3>
                <p className="text-xs text-[#777777]">Your cosmic guidance for today</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#D8D8D8]/60 space-y-1">
                  <span className="text-[#777777] block">Zodiac Sign</span>
                  <span className="font-black text-sm text-[#171717]">Libra ♎</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#D8D8D8]/60 space-y-1">
                  <span className="text-[#777777] block">Today's Energy</span>
                  <span className="font-black text-sm text-[#171717]">Balanced &amp; Reflective</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#D8D8D8]/60 space-y-1">
                  <span className="text-[#777777] block">Lucky Number</span>
                  <span className="font-black text-sm text-[#171717]">7</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#D8D8D8]/60 space-y-1">
                  <span className="text-[#777777] block">Lucky Color</span>
                  <span className="font-black text-sm text-[#FF999D]">Coral</span>
                </div>
              </div>
            </section>

            {/* 12 Zodiac signs */}
            <section className="bg-white rounded-3xl p-6 border border-[#D8D8D8] shadow-xs space-y-4">
              <h3 className="font-extrabold text-lg text-[#171717]">Explore Zodiac Signs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {ZODIAC_SIGNS.map(sign => (
                  <div
                    key={sign.name}
                    className="p-3 rounded-2xl border border-[#D8D8D8] flex items-center gap-2.5 bg-[#F5F5F5]"
                  >
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ backgroundColor: sign.color }}
                    >
                      {sign.symbol}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#171717] truncate">{sign.name}</h4>
                      <p className="text-[9px] text-[#777777] truncate">{sign.dates}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </main>

      {/* ================= MODAL: ASTROLOGER ASTRO ID LOGIN ================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D8D8D8] max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D8D8]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF999D]">
                  Astrologer Portal
                </span>
                <h3 className="font-black text-lg text-[#171717]">
                  {requiresPasswordSetup ? 'Create New Password' : 'Login with Astro ID'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                  setRequiresPasswordSetup(false);
                }}
                className="text-[#777777] hover:text-[#171717] font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* FLOW A: FIRST-TIME PASSWORD CREATION */}
            {requiresPasswordSetup ? (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#FFF9B8] border border-[#D8D8D8] text-xs text-[#171717]">
                  <p className="font-bold">First Time Astrologer Login</p>
                  <p className="text-[#777777] mt-0.5">
                    Welcome {passwordSetupReader?.name}! Please create your private password. You will use this same password for all future logins.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171717]">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter strong password (min 4 chars)"
                      className="w-full bg-[#F5F5F5] border border-[#D8D8D8] rounded-2xl px-4 py-2.5 text-xs text-[#171717] outline-none focus:border-[#FF999D]"
                      required
                    />
                    <Lock className="w-4 h-4 text-[#777777] absolute right-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-full bg-[#FF999D] text-white font-extrabold text-xs cursor-pointer hover:bg-[#FFA3A5] transition-colors"
                >
                  {isLoggingIn ? 'Setting Password...' : 'Save Password & Enter Astrodashboard'}
                </button>
              </form>
            ) : (
              /* FLOW B: STANDARD ASTROLOGER LOGIN */
              <form onSubmit={handleAstrologerLogin} className="space-y-4">
                
                {/* Login Method Toggle: Email vs Phone */}
                <div className="grid grid-cols-2 p-1 bg-[#F5F5F5] rounded-2xl border border-[#D8D8D8] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      setLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      loginMethod === 'email' ? 'bg-white shadow-xs text-[#171717]' : 'text-[#777777]'
                    }`}
                  >
                    Email / Astro ID
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('phone');
                      setLoginError('');
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      loginMethod === 'phone' ? 'bg-white shadow-xs text-[#171717]' : 'text-[#777777]'
                    }`}
                  >
                    Mobile Phone
                  </button>
                </div>

                {loginMethod === 'email' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#171717]">Registered Email or Astro ID</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. vikram@astrodashboard.com or ASTRO-9999"
                          className="w-full bg-[#F5F5F5] border border-[#D8D8D8] rounded-2xl px-4 py-2.5 text-xs text-[#171717] outline-none focus:border-[#FF999D]"
                          required
                        />
                        <Mail className="w-4 h-4 text-[#777777] absolute right-3.5 top-3" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#171717]">Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-[#F5F5F5] border border-[#D8D8D8] rounded-2xl px-4 py-2.5 text-xs text-[#171717] outline-none focus:border-[#FF999D]"
                        />
                        <Lock className="w-4 h-4 text-[#777777] absolute right-3.5 top-3" />
                      </div>
                      <p className="text-[10px] text-[#777777]">
                        * If first time logging in, leave password blank or enter anything to proceed to password setup.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Registered Mobile Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-[#F5F5F5] border border-[#D8D8D8] rounded-2xl px-4 py-2.5 text-xs text-[#171717] outline-none focus:border-[#FF999D]"
                        required
                      />
                      <Phone className="w-4 h-4 text-[#777777] absolute right-3.5 top-3" />
                    </div>
                    <p className="text-[10.5px] text-[#777777]">
                      Note: Mobile phone login is enabled only if an admin registered your phone number in Admin Panel.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-full bg-[#FF999D] hover:bg-[#FFA3A5] text-white font-extrabold text-xs cursor-pointer transition-colors shadow-xs"
                >
                  {isLoggingIn ? 'Verifying...' : 'Sign In to Astrodashboard'}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
