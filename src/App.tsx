import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from './components/Header';
import { OfferBanner } from './components/OfferBanner';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { ChooseYourPath } from './components/ChooseYourPath';
import { AstrologersCarousel } from './components/AstrologersCarousel';
import { HowItWorks } from './components/HowItWorks';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhyAstralSection } from './components/WhyAstralSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { SanctuaryHub } from './components/SanctuaryHub';
import { ReaderCollective } from './components/ReaderCollective';
import { ReaderProfileModal } from './components/ReaderProfileModal';
import { CustomerIntakeModal } from './components/CustomerIntakeModal';
import { LiveChatView } from './components/LiveChatView';
import { CompatibilitySection } from './components/CompatibilitySection';
import { LearnSection } from './components/LearnSection';
import { Footer } from './components/Footer';
import { BirthChartModal } from './components/BirthChartModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AstralUniversalExplorer } from './components/AstralUniversalExplorer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MyAstralDashboardModal } from './components/MyAstralDashboardModal';
import { StarryBackground } from './components/StarryBackground';
import { MobileFeedView } from './components/MobileFeedView';
import { DailyTarotModal } from './components/DailyTarotModal';
import { DailyHoroscopeModal } from './components/DailyHoroscopeModal';
import { SacredRitualsModal } from './components/SacredRitualsModal';
import { RitualsAndSpellsSection } from './components/RitualsAndSpellsSection';
import { AuthScreen, AuthRedirectTarget } from './components/AuthScreen';
import { supabase, signOutUser, getUserProfile, isSupabaseConfigured } from './lib/supabase';
import { NavigationDrawer } from './components/NavigationDrawer';
import { WalletTransactionModal } from './components/WalletTransactionModal';
import { SupportChatModal } from './components/SupportChatModal';
import { RedeemGiftCardModal } from './components/RedeemGiftCardModal';
import { EditProfileModal } from './components/EditProfileModal';
import { detectUserGeo, CountryInfo } from './utils/currency';
import { Reader, ConsultationSession, CustomerProfile, ConsultationStartData, ChatMessage } from './types';
import { READERS } from './data/readers';

export default function App() {


  // Readers state
  const [readers, setReaders] = useState<Reader[]>(READERS);

  // Modals state
  const [selectedProfileReader, setSelectedProfileReader] = useState<Reader | null>(null);
  const [selectedIntakeReader, setSelectedIntakeReader] = useState<Reader | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [explorerCategory, setExplorerCategory] = useState<string>('astrology');
  const [isBirthChartModalOpen, setIsBirthChartModalOpen] = useState(false);
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);
  const [isHoroscopeModalOpen, setIsHoroscopeModalOpen] = useState(false);
  const [isRitualsModalOpen, setIsRitualsModalOpen] = useState(false);
  const [ritualsInitialTab, setRitualsInitialTab] = useState<'spell' | 'healing' | 'shop'>('spell');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectTarget, setAuthRedirectTarget] = useState<AuthRedirectTarget | null>(null);

  // Trigger popup screen for Birth Chart
  const handleOpenBirthChart = () => {
    setIsBirthChartModalOpen(true);
  };

  // Navigation History & Back Button tracking
  const [navHistory, setNavHistory] = useState<string[]>(['home']);
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('astral_is_logged_in') === 'true';
  });

  const [detectedGeo, setDetectedGeo] = useState<CountryInfo | undefined>(undefined);

  // Global Language & Currency (Auto-detected by IP & Country)
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [currentCurrency, setCurrentCurrency] = useState<string>(() => {
    return localStorage.getItem('astral_currency') || 'USD';
  });

  // Auto-detect Geo and Currency based on IP / Timezone on startup
  useEffect(() => {
    detectUserGeo().then(geo => {
      if (geo) {
        setDetectedGeo(geo);
        if (!localStorage.getItem('astral_currency')) {
          setCurrentCurrency(geo.currency);
          localStorage.setItem('astral_currency', geo.currency);
        }
      }
    });
  }, []);

  // Supabase Auth session synchronization & persistent profile hydration
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('astral_is_logged_in', 'true');
        localStorage.setItem('lumysic_is_logged_in', 'true');
        
        getUserProfile(session.user.id).then(profile => {
          if (profile) {
            setCustomer(prev => ({
              ...prev,
              id: profile.id,
              name: profile.full_name || prev.name,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              country: profile.country || prev.country,
              countryCode: profile.country_code || prev.countryCode,
              currency: profile.currency || prev.currency
            }));
            if (profile.full_name) {
              localStorage.setItem('astral_customer_name', profile.full_name);
              localStorage.setItem('lumysic_user_name', profile.full_name);
            }
            if (profile.phone) {
              localStorage.setItem('astral_customer_phone', profile.phone);
              localStorage.setItem('lumysic_user_phone', profile.phone);
            }
            if (profile.email) {
              localStorage.setItem('lumysic_user_email', profile.email);
            }
          }
        });
      }
    });

    // Subscribe to live auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('astral_is_logged_in', 'true');
        localStorage.setItem('lumysic_is_logged_in', 'true');
      } else if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem('astral_is_logged_in');
        localStorage.removeItem('lumysic_is_logged_in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Customer Profile (saved or empty when not logged in)
  const [customer, setCustomer] = useState<CustomerProfile>(() => {
    const savedId = localStorage.getItem('astral_customer_id') || 'cust_' + Date.now();
    localStorage.setItem('astral_customer_id', savedId);
    const savedName = localStorage.getItem('lumysic_user_name') || localStorage.getItem('astral_customer_name') || '';
    const savedPhone = localStorage.getItem('lumysic_user_phone') || localStorage.getItem('astral_customer_phone') || '';
    return {
      id: savedId,
      name: savedName,
      phone: savedPhone,
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };
  });

  // Wallet Balances State (clean 0 balance for new seekers)
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astral_wallet_bal');
    return saved ? parseFloat(saved) : 0;
  });
  const [rechargeBalance, setRechargeBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astral_recharge_bal');
    return saved ? parseFloat(saved) : 0;
  });
  const [cashbackBalance, setCashbackBalance] = useState<number>(() => {
    const saved = localStorage.getItem('astral_cashback_bal');
    return saved ? parseFloat(saved) : 0;
  });

  // Drawer & Wallet Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'wallet' | 'order' | 'remedies'>('wallet');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Recharge & Redeem Handlers
  const handleRechargeSuccess = (addedRecharge: number, addedCashback: number) => {
    setRechargeBalance(prev => {
      const next = prev + addedRecharge;
      localStorage.setItem('astral_recharge_bal', next.toString());
      return next;
    });
    setCashbackBalance(prev => {
      const next = prev + addedCashback;
      localStorage.setItem('astral_cashback_bal', next.toString());
      return next;
    });
    setAvailableBalance(prev => {
      const next = prev + addedRecharge + addedCashback;
      localStorage.setItem('astral_wallet_bal', next.toString());
      return next;
    });
  };

  const handleRedeemSuccess = (addedAmount: number) => {
    setCashbackBalance(prev => {
      const next = prev + addedAmount;
      localStorage.setItem('astral_cashback_bal', next.toString());
      return next;
    });
    setAvailableBalance(prev => {
      const next = prev + addedAmount;
      localStorage.setItem('astral_wallet_bal', next.toString());
      return next;
    });
  };

  // Active Live Chat Session
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Scroll listener for floating back button and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolledDown(scrollY > 220);
      if (scrollY < 140) {
        setCurrentSection('home');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Fetch readers from server
  useEffect(() => {
    fetch('/api/readers')
      .then(res => res.json())
      .then(data => {
        if (data.readers && Array.isArray(data.readers)) {
          setReaders(data.readers);
        }
      })
      .catch(err => console.error('Failed to load readers:', err));
  }, []);

  // Real-time SSE listener for consultation session updates
  useEffect(() => {
    const eventSource = new EventSource('/api/events');
    eventSource.addEventListener('session_accepted', (e) => {
      const { session } = JSON.parse(e.data);
      if (activeSession && session.id === activeSession.id) {
        setActiveSession(session);
      }
    });
    eventSource.addEventListener('message_received', (e) => {
      const { sessionId, message, session } = JSON.parse(e.data);
      if (activeSession && activeSession.id === sessionId) {
        if (session) {
          setActiveSession(session);
        } else {
          setActiveSession(prev => prev ? ({
            ...prev,
            messages: [...prev.messages, message]
          }) : null);
        }
      }
    });
    eventSource.addEventListener('reader_updated', (e) => {
      const updated = JSON.parse(e.data);
      setReaders(prev => prev.map(r => r.id === updated.id ? updated : r));
    });
    return () => eventSource.close();
  }, [activeSession]);

  // Go to Home function
  const handleGoHome = () => {
    setSelectedProfileReader(null);
    setSelectedIntakeReader(null);
    setIsSearchOpen(false);
    setIsDashboardOpen(false);
    setIsExplorerOpen(false);
    setIsBirthChartModalOpen(false);
    setIsChatOpen(false);
    setCurrentSection('home');
    setNavHistory(['home']);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const homeEl = document.getElementById('home');
    if (homeEl) {
      homeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Navigate to sections directly
  const handleNavigateSection = (sectionId: string, pushHistory = true) => {
    if (sectionId === 'home') {
      handleGoHome();
      return;
    }

    if (sectionId === 'birth-chart') {
      handleOpenBirthChart();
      return;
    }
    if (sectionId === 'tarot') {
      setIsTarotModalOpen(true);
      return;
    }
    if (sectionId === 'horoscope') {
      setIsHoroscopeModalOpen(true);
      return;
    }
    if (sectionId === 'rituals' || sectionId === 'spells' || sectionId === 'healing' || sectionId === 'shop' || sectionId === 'astral-shop') {
      const targetTab: 'spell' | 'healing' | 'shop' = 
        (sectionId === 'shop' || sectionId === 'astral-shop') ? 'shop' : 
        sectionId === 'healing' ? 'healing' : 'spell';
      setRitualsInitialTab(targetTab);
      window.dispatchEvent(new CustomEvent('switch_rituals_tab', { detail: { tab: targetTab } }));

      const el = document.getElementById('rituals');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsRitualsModalOpen(true);
      }
      return;
    }

    setCurrentSection(sectionId);
    if (pushHistory) {
      setNavHistory(prev => {
        if (prev[prev.length - 1] === sectionId) return prev;
        return [...prev, sectionId];
      });
    }

    const jumpToTarget = () => {
      const targetId = (sectionId === 'shop' || sectionId === 'astral-shop') ? 'astral-shop' : sectionId;
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 76;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - headerOffset);
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    };

    jumpToTarget();
  };

  const handleOpenExplorer = (categoryId: string = 'astrology') => {
    setExplorerCategory(categoryId);
    setIsExplorerOpen(true);
  };

  // Consultation Handlers
  const handleInitiateChatWithReader = (reader: Reader) => {
    if (!isAuthenticated) {
      setAuthRedirectTarget({
        profileId: reader.id,
        profileName: reader.name,
        profileType: 'reader'
      });
      setSelectedProfileReader(null);
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedProfileReader(null);
    setSelectedIntakeReader(reader);
  };

  const handleQuickStartConsultation = () => {
    if (!isAuthenticated) {
      setSelectedProfileReader(null);
      setIsAuthModalOpen(true);
      return;
    }
    const reader = readers.find(r => r.status === 'online') || readers[0];
    if (reader) {
      setSelectedProfileReader(null);
      setSelectedIntakeReader(reader);
    }
  };

  const handleIntakeSubmit = (startData: ConsultationStartData) => {
    const updatedCustomer: CustomerProfile = {
      ...customer,
      name: startData.firstName,
      birthDetails: startData.birthDetails || customer.birthDetails
    };
    setCustomer(updatedCustomer);
    localStorage.setItem('astral_customer_name', startData.firstName);
    const reader = selectedIntakeReader || readers[0];
    setSelectedIntakeReader(null);
    createSession(reader, startData);
  };

  const createSession = async (reader: Reader, startData: ConsultationStartData) => {
    try {
      const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          firstName: startData.firstName,
          customerName: startData.fullName || startData.firstName,
          readingType: startData.readingType,
          topic: startData.topic,
          initialQuestion: startData.question,
          birthDetails: startData.birthDetails,
          requestedReaderId: reader.id
        })
      });
      const data = await res.json();
      if (data.session) {
        setActiveSession(data.session);
        setIsChatOpen(true);
      }
    } catch {
      const now = Date.now();
      const userName = startData.birthDetails?.name || startData.firstName;
      const userGender = startData.birthDetails?.gender || startData.gender || 'Not specified';
      const userDob = startData.birthDetails?.dob || 'Not specified';
      const userTob = startData.birthDetails?.unknownTime 
        ? 'Not known' 
        : (startData.birthDetails?.birthTime ? `${startData.birthDetails.birthTime} ${startData.birthDetails.amPm || ''}`.trim() : 'Not specified');
      const userPob = startData.birthDetails?.placeOfBirth || 'Not specified';

      const userDetailsCard = `Hi,\nBelow are my details:\nName: ${userName}\nGender: ${userGender}\nDOB: ${userDob}\nTOB: ${userTob}\nPOB: ${userPob}`;

      const mockSession: ConsultationSession = {
        id: 'sess_' + now,
        customerId: customer.id,
        customerName: userName,
        requestedReaderId: reader.id,
        requestedReaderName: reader.name,
        assignedReaderId: reader.id,
        assignedReaderName: reader.name,
        readingType: startData.readingType,
        topic: startData.topic,
        initialQuestion: startData.question,
        status: 'active',
        isFreeConsultation: true,
        freeSecondsRemaining: 120,
        paidSeconds: 0,
        totalDurationSeconds: 0,
        ratePerMinute: reader.ratePerMinute || 1.0,
        createdAt: new Date().toISOString(),
        paymentStatus: 'free_tier',
        messages: [
          {
            id: 'msg_details_' + now,
            sessionId: 'sess_' + now,
            sender: 'customer',
            senderName: userName,
            text: userDetailsCard,
            timestamp: new Date(now).toISOString()
          },
          {
            id: 'msg_welcome_' + (now + 100),
            sessionId: 'sess_' + now,
            sender: 'astrologer',
            senderName: reader.name,
            text: 'Welcome to LUMSIC!',
            timestamp: new Date(now + 100).toISOString()
          },
          {
            id: 'msg_join_notice_' + (now + 200),
            sessionId: 'sess_' + now,
            sender: 'astrologer',
            senderName: reader.name,
            text: `${reader.specialties?.[0] || 'Psychic'} will join within 10 seconds.`,
            timestamp: new Date(now + 200).toISOString()
          },
          {
            id: 'msg_share_q_' + (now + 300),
            sessionId: 'sess_' + now,
            sender: 'astrologer',
            senderName: reader.name,
            text: 'Please share your question in the meanwhile.',
            timestamp: new Date(now + 300).toISOString()
          },
          {
            id: 'msg_joined_' + (now + 400),
            sessionId: 'sess_' + now,
            sender: 'astrologer',
            senderName: reader.name,
            text: `${reader.specialties?.[0] || 'Psychic'} has joined.`,
            timestamp: new Date(now + 400).toISOString()
          },
          {
            id: 'msg_banner_' + (now + 500),
            sessionId: 'sess_' + now,
            sender: 'system',
            senderName: 'System Notice',
            text: 'This is an automated message to confirm that chat has started.',
            timestamp: new Date(now + 500).toISOString(),
            isBanner: true,
            isSystemNotice: true
          },
          {
            id: 'msg_greet_' + (now + 600),
            sessionId: 'sess_' + now,
            sender: 'astrologer',
            senderName: reader.name,
            text: `Hi ${userName}`,
            timestamp: new Date(now + 600).toISOString()
          },
          {
            id: 'msg_tarot_card_' + (now + 700),
            sessionId: 'sess_' + now,
            sender: 'astrologer',
            senderName: reader.name,
            text: 'The Moon – Key XVIII (Illumination, Intuition & Deeper Truths)',
            imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            timestamp: new Date(now + 700).toISOString()
          }
        ]
      };
      setActiveSession(mockSession);
      setIsChatOpen(true);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeSession) return;
    try {
      await fetch(`/api/sessions/${activeSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'customer',
          senderName: activeSession.customerName,
          text
        })
      });
    } catch {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sessionId: activeSession.id,
        sender: 'customer',
        senderName: activeSession.customerName,
        text,
        timestamp: new Date().toISOString()
      };
      setActiveSession(prev => prev ? ({ ...prev, messages: [...prev.messages, userMsg] }) : null);
    }
  };

  const activeReader = activeSession 
    ? (readers.find(r => r.id === activeSession.requestedReaderId) || readers.find(r => r.id === activeSession.assignedReaderId) || readers[0])
    : readers[0];



  return (
    <div className="min-h-screen bg-[#FFF8DF] text-[#2B2418] flex flex-col font-sans selection:bg-[#F4E7B8] selection:text-[#2B2418] relative">
      {/* Background Star Layer */}
      <StarryBackground density="dense" className="fixed inset-0 z-0 opacity-40 pointer-events-none" />

      {/* TOP STICKY BAR: ROTATING MARQUEE TICKER AT VERY TOP + GLOBAL LUXURY HEADER */}
      <div className="sticky top-0 z-40 shadow-md shadow-amber-950/10">
        <OfferBanner onClaimOffer={handleQuickStartConsultation} />
        <Header
          onStartReading={handleQuickStartConsultation}
          onNavigateSection={handleNavigateSection}
          onOpenExplorer={handleOpenExplorer}
          onOpenBirthChartModal={() => handleNavigateSection('birth-chart')}
          onOpenProfile={() => setIsDashboardOpen(true)}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAudio={() => setIsHoroscopeModalOpen(true)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          currentCurrency={currentCurrency}
          onSelectCurrency={(cur) => {
            setCurrentCurrency(cur);
            localStorage.setItem('astral_currency', cur);
          }}
          walletBalance={rechargeBalance + availableBalance}
          onOpenWallet={() => {
            setWalletInitialTab('wallet');
            setIsWalletOpen(true);
          }}
        />
      </div>

      {/* Floating Quick Back Button */}
      {(isScrolledDown || currentSection !== 'home') && (
        <button
          type="button"
          onClick={handleGoHome}
          className="fixed bottom-20 left-3 sm:left-6 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFF8DF]/95 hover:bg-[#F8EFCB] border-2 border-[#D6A83F] text-[#2B2418] text-xs font-bold shadow-xl shadow-amber-950/15 backdrop-blur-md transition-all active:scale-90 cursor-pointer animate-in fade-in duration-150"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4 text-[#D6A83F]" />
          <span>Back to Home</span>
        </button>
      )}

      {/* MAIN WEBSITE CONTENT */}
      <main className="flex-1 pb-16 md:pb-0 relative z-10">
        {/* 1. HERO */}
        <Hero
          onCreateBirthChart={handleOpenBirthChart}
          onFindAstrologer={() => handleNavigateSection('readers')}
          onOpenCompatibility={() => handleNavigateSection('compatibility')}
        />

        {/* MOBILE VIEW ONLY: Dedicated mobile feed matching user reference directly below Hero */}
        <div className="lg:hidden">
          <MobileFeedView
            readers={readers}
            onStartChat={handleInitiateChatWithReader}
            onViewProfile={(reader) => setSelectedProfileReader(reader)}
            onExploreAll={() => handleNavigateSection('readers')}
            onSelectPromptQuestion={(_q) => {
              const onlineReader = readers.find(r => r.isOnline) || readers[0];
              setSelectedIntakeReader(onlineReader);
            }}
            currentCurrency={currentCurrency}
          />
        </div>

        {/* DESKTOP-ONLY SECTIONS (Cards carousel, trust bar, choose your path) */}
        <div className="hidden lg:block">
          <TrustBar />
          <ChooseYourPath
            onSelectPath={() => {
              const onlineReader = readers.find(r => r.isOnline) || readers[0];
              setSelectedIntakeReader(onlineReader);
            }}
          />
          <AstrologersCarousel
            readers={readers}
            onViewProfile={(reader) => setSelectedProfileReader(reader)}
            onStartChat={handleInitiateChatWithReader}
            onExploreAll={() => handleNavigateSection('readers')}
            currentCurrency={currentCurrency}
          />
        </div>

        {/* 2. LOVE & COMPATIBILITY (COMPLETELY SHIFTED DIRECTLY UNDER THE ASTROLOGERS SECTION) */}
        <CompatibilitySection
          onChatWithLovePsychics={(_topic) => {
            // Find top love psychic (Psychic Tamara or Psychic Gabrielle, or top online love reader)
            const loveReader = readers.find(r => 
              r.id === 'psychic-tamara' || 
              r.id === 'psychic-gabrielle' || 
              r.specialities?.some(s => s.toLowerCase().includes('love'))
            ) || readers[0];

            handleInitiateChatWithReader(loveReader);
          }}
        />

        {/* 3. REVIEWS & TESTIMONIALS (FIXED IN UPPER SIDE - Social Proof directly after Compatibility) */}
        <TestimonialsSection />

        {/* 5. HOW IT WORKS */}
        <HowItWorks />

        {/* 6. WHY LUMSIC */}
        <WhyAstralSection />

        {/* 7. SACRED RITUALS, HEALING & SHOP */}
        <RitualsAndSpellsSection />

        {/* 8. FAQ */}
        <FAQSection />

        {/* 9. FINAL CTA (Start Free Chat with Psychics - Space tightened) */}
        <FinalCTA
          onStartBirthChart={() => handleNavigateSection('readers')}
          onFindAstrologer={() => handleNavigateSection('readers')}
        />

        {/* 10. VLOGS & GUIDES */}
        <LearnSection onNavigateSection={handleNavigateSection} />
      </main>

      {/* FOOTER */}
      <Footer
        onNavigateSection={handleNavigateSection}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
      />

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav
        activeSection={isWalletOpen ? 'chatroom' : currentSection}
        onNavigateSection={handleNavigateSection}
        onGoHome={handleGoHome}
        onOpenProfile={() => setIsDashboardOpen(true)}
        onOpenChatroom={() => {
          setWalletInitialTab('order');
          setIsWalletOpen(true);
        }}
        onOpenRituals={() => handleNavigateSection('rituals')}
        onOpenTarot={() => setIsTarotModalOpen(true)}
        onOpenHoroscope={() => setIsHoroscopeModalOpen(true)}
      />

      {/* ASTRAL 18-PILLAR GLOBAL STRUCTURE UNIVERSAL EXPLORER */}
      <AstralUniversalExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        initialCategoryId={explorerCategory}
        onNavigateSection={handleNavigateSection}
        onStartReading={handleQuickStartConsultation}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        currentCurrency={currentCurrency}
        onSelectCurrency={setCurrentCurrency}
      />

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSection={handleNavigateSection}
      />

      {/* MY LUMSIC USER DASHBOARD */}
      <MyAstralDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onNavigateSection={handleNavigateSection}
        userProfile={customer}
        onLogout={() => {
          localStorage.removeItem('astral_is_logged_in');
          localStorage.removeItem('lumysic_is_logged_in');
          localStorage.removeItem('astral_customer_name');
          localStorage.removeItem('lumysic_user_name');
          localStorage.removeItem('astral_customer_phone');
          localStorage.removeItem('lumysic_user_phone');
          setCustomer({
            id: 'cust_' + Date.now(),
            name: '',
            phone: '',
            isFirstTimeUser: true,
            freeMinutesUsed: false,
            totalConsultations: 0
          });
          setIsDashboardOpen(false);
          setIsAuthenticated(false);
        }}
      />

      {/* MODAL: READER PROFILE */}
      <ReaderProfileModal
        reader={selectedProfileReader}
        onClose={() => setSelectedProfileReader(null)}
        onStartReading={handleInitiateChatWithReader}
        currentCurrency={currentCurrency}
      />

      {/* POPUP SCREEN: COMPLETE NATAL BIRTH CHART MODAL */}
      <BirthChartModal
        isOpen={isBirthChartModalOpen}
        onClose={() => setIsBirthChartModalOpen(false)}
        onConsultAstrologer={handleQuickStartConsultation}
      />

      {/* MODAL: CUSTOMER INTAKE */}
      {selectedIntakeReader && (
        <CustomerIntakeModal
          reader={selectedIntakeReader}
          existingName={customer.name}
          onClose={() => setSelectedIntakeReader(null)}
          onSubmit={handleIntakeSubmit}
          isFirstTimeUser={customer.isFirstTimeUser}
        />
      )}

      {/* LIVE CHAT VIEW */}
      {isChatOpen && activeSession && (
        <LiveChatView
          session={activeSession}
          reader={activeReader}
          onSendMessage={handleSendMessage}
          onCloseChat={() => setIsChatOpen(false)}
          onEndConsultation={async () => {
            setActiveSession(prev => prev ? ({ ...prev, status: 'completed' }) : null);
          }}
          onTopUp={async (minutes: number) => {
            setActiveSession(prev => prev ? ({
              ...prev,
              freeSecondsRemaining: prev.freeSecondsRemaining + minutes * 60
            }) : null);
          }}
        />
      )}

      {/* DAILY TAROT MODAL */}
      <DailyTarotModal
        isOpen={isTarotModalOpen}
        onClose={() => setIsTarotModalOpen(false)}
      />

      {/* DAILY HOROSCOPE MODAL */}
      <DailyHoroscopeModal
        isOpen={isHoroscopeModalOpen}
        onClose={() => setIsHoroscopeModalOpen(false)}
        onStartReading={handleQuickStartConsultation}
      />

      {/* SACRED RITUALS & SPELLS MODAL */}
      <SacredRitualsModal
        isOpen={isRitualsModalOpen}
        onClose={() => setIsRitualsModalOpen(false)}
        initialTab={ritualsInitialTab}
      />

      {/* THREE-LINE LEFT HEADER NAVIGATION DRAWER (MATCHING USER REFERENCE) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={customer}
        isAuthenticated={isAuthenticated}
        onOpenLogin={() => {
          setIsDrawerOpen(false);
          setIsAuthModalOpen(true);
        }}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onOpenWallet={() => {
          setWalletInitialTab('wallet');
          setIsWalletOpen(true);
        }}
        onOpenOrders={() => {
          setWalletInitialTab('order');
          setIsWalletOpen(true);
        }}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenRedeem={() => setIsRedeemOpen(true)}
        onOpenSettings={() => setIsDashboardOpen(true)}
        onLogout={async () => {
          await signOutUser();
          localStorage.removeItem('astral_is_logged_in');
          localStorage.removeItem('lumysic_is_logged_in');
          localStorage.removeItem('astral_customer_name');
          localStorage.removeItem('lumysic_user_name');
          localStorage.removeItem('lumsic_user_name');
          localStorage.removeItem('astral_customer_phone');
          localStorage.removeItem('lumysic_user_phone');
          localStorage.removeItem('lumsic_user_phone');
          localStorage.removeItem('lumysic_user_email');
          setCustomer({
            id: 'cust_' + Date.now(),
            name: '',
            phone: '',
            isFirstTimeUser: true,
            freeMinutesUsed: false,
            totalConsultations: 0
          });
          setIsDrawerOpen(false);
          setIsAuthenticated(false);
        }}
      />

      {/* DEDICATED INTERNATIONAL LOGIN / SIGN UP MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-y-auto">
          <AuthScreen
            redirectTarget={authRedirectTarget}
            onLoginSuccess={(profile, redirect) => {
              localStorage.setItem('astral_is_logged_in', 'true');
              localStorage.setItem('lumysic_is_logged_in', 'true');
              if (profile.currency) {
                setCurrentCurrency(profile.currency);
                localStorage.setItem('astral_currency', profile.currency);
              }
              if (profile.country) {
                localStorage.setItem('astral_country', profile.country);
              }
              if (profile.name) {
                localStorage.setItem('astral_customer_name', profile.name);
                localStorage.setItem('lumysic_user_name', profile.name);
              }
              if (profile.phone) {
                localStorage.setItem('astral_customer_phone', profile.phone);
                localStorage.setItem('lumysic_user_phone', profile.phone);
              }
              setCustomer(prev => ({
                ...prev,
                ...profile,
                id: profile.id || prev.id,
                name: profile.name || prev.name,
                phone: profile.phone || prev.phone,
              }));
              setIsAuthenticated(true);
              setIsAuthModalOpen(false);

              // UNIFIED REDIRECT: Automatically return user to specific profile page
              const target = redirect || authRedirectTarget;
              if (target && target.profileId) {
                const targetReader = readers.find(r => r.id === target.profileId);
                if (targetReader) {
                  setSelectedProfileReader(targetReader);
                }
              }
              setAuthRedirectTarget(null);
            }}
            onBackToSite={() => {
              setIsAuthModalOpen(false);
              setAuthRedirectTarget(null);
            }}
            detectedGeo={detectedGeo}
          />
        </div>
      )}

      {/* FULL WALLET TRANSACTIONS & ORDER / REMEDIES HISTORY MODAL */}
      <WalletTransactionModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentCurrency={currentCurrency}
        availableBalance={availableBalance}
        rechargeBalance={rechargeBalance}
        cashbackBalance={cashbackBalance}
        onRechargeSuccess={handleRechargeSuccess}
        initialTab={walletInitialTab}
        readers={readers}
        onStartChatWithReader={(reader) => {
          setIsWalletOpen(false);
          handleInitiateChatWithReader(reader);
        }}
        onOpenRemediesModal={() => {
          setIsWalletOpen(false);
          setIsRitualsModalOpen(true);
        }}
        onOpenDrawer={() => {
          setIsWalletOpen(false);
          setIsDrawerOpen(true);
        }}
      />

      {/* CUSTOMER SUPPORT CHAT MODAL */}
      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        userName={customer.name}
      />

      {/* REDEEM GIFT CARD MODAL */}
      <RedeemGiftCardModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onRedeemSuccess={handleRedeemSuccess}
        currentCurrency={currentCurrency}
      />

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={customer}
        onSave={({ name, phone }) => {
          localStorage.setItem('astral_customer_name', name);
          localStorage.setItem('lumysic_user_name', name);
          localStorage.setItem('astral_customer_phone', phone);
          localStorage.setItem('lumysic_user_phone', phone);
          setCustomer(prev => ({ ...prev, name, phone }));
        }}
      />
    </div>
  );
}
