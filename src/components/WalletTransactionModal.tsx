import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Menu, Search, Wallet, ShoppingBag, Sparkles, Plus, 
  ChevronDown, ChevronUp, Clock, Gift, CheckCircle2, RefreshCw, Copy, Check, MessageSquare
} from 'lucide-react';
import { formatCurrencyPrice } from '../utils/currency';
import { Reader } from '../types';

interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  orderId: string;
  amount: number;
  type: 'debit' | 'credit';
  rechargePart?: number;
  bonusPart?: number;
}

interface PaymentLogItem {
  id: string;
  txnId: string;
  method: string;
  date: string;
  amount: number;
  status: 'Success' | 'Pending';
}

interface ExpiringItem {
  id: string;
  title: string;
  amount: number;
  expiryDate: string;
  daysRemaining: number;
}

interface WalletTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency?: string;
  availableBalance: number;
  rechargeBalance: number;
  cashbackBalance: number;
  onRechargeSuccess: (addedRecharge: number, addedCashback: number) => void;
  initialTab?: 'wallet' | 'order' | 'remedies';
  readers?: Reader[];
  onStartChatWithReader?: (reader: Reader) => void;
  onOpenRemediesModal?: () => void;
  onOpenDrawer?: () => void;
}

export const WalletTransactionModal: React.FC<WalletTransactionModalProps> = ({
  isOpen,
  onClose,
  currentCurrency = 'INR',
  availableBalance = 0,
  rechargeBalance = 0,
  cashbackBalance = 0,
  onRechargeSuccess,
  initialTab = 'order',
  readers = [],
  onStartChatWithReader,
  onOpenRemediesModal,
  onOpenDrawer
}) => {
  // Top 3 Tabs matching screenshots: 'wallet' | 'order' | 'remedies'
  const [topTab, setTopTab] = useState<'wallet' | 'order' | 'remedies'>(initialTab);

  // Sync with initialTab prop when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setTopTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Balance breakdown expandable state (Photo 1)
  const [showBreakdown, setShowBreakdown] = useState(false);

  // 3 Sub-filters under Wallet (Photo 1): 'transaction' | 'payment_logs' | 'expiring'
  const [walletSubFilter, setWalletSubFilter] = useState<'transaction' | 'payment_logs' | 'expiring'>('transaction');

  // Sub-filters under Remedies (Photo 3): 'all' | 'suggested' | 'purchased'
  const [remediesFilter, setRemediesFilter] = useState<'all' | 'suggested' | 'purchased'>('all');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Quick Recharge Modal state
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number>(250);
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeSuccessNotice, setRechargeSuccessNotice] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Default transactions list
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    try {
      const stored = localStorage.getItem('astral_txns');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  });

  // Payment logs
  const [paymentLogs, setPaymentLogs] = useState<PaymentLogItem[]>(() => {
    try {
      const stored = localStorage.getItem('astral_pay_logs');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  });

  // Expiring credits list
  const [expiringList] = useState<ExpiringItem[]>([
    {
      id: 'exp_1',
      title: 'Welcome First-Time Seeker Bonus',
      amount: 15,
      expiryDate: '12 Oct 2026',
      daysRemaining: 5
    }
  ]);

  if (!isOpen) return null;

  const formatBal = (amt: number): string => {
    return formatCurrencyPrice(amt, currentCurrency).currentPrice;
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteRecharge = () => {
    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      const bonusCash = selectedPack >= 1000 ? 200 : selectedPack >= 500 ? 75 : selectedPack >= 250 ? 35 : 0;
      onRechargeSuccess(selectedPack, bonusCash);

      const newTx: TransactionItem = {
        id: 'tx_' + Date.now(),
        title: `Wallet Recharge (+${formatBal(selectedPack)})`,
        subtitle: 'Payment via Instant Auto-Pay',
        date: 'Just now',
        orderId: '#TXN_' + Math.floor(100000000 + Math.random() * 900000000),
        amount: selectedPack,
        type: 'credit',
        rechargePart: selectedPack,
        bonusPart: bonusCash
      };

      const newPay: PaymentLogItem = {
        id: 'pay_' + Date.now(),
        txnId: 'TXN-' + Math.floor(1000000000 + Math.random() * 9000000000),
        method: 'Instant Auto-Pay',
        date: 'Just now',
        amount: selectedPack,
        status: 'Success'
      };

      setTransactions(prev => {
        const updated = [newTx, ...prev];
        localStorage.setItem('astral_txns', JSON.stringify(updated));
        return updated;
      });

      setPaymentLogs(prev => {
        const updated = [newPay, ...prev];
        localStorage.setItem('astral_pay_logs', JSON.stringify(updated));
        return updated;
      });

      setIsRechargeModalOpen(false);
      setRechargeSuccessNotice(true);
      setTimeout(() => setRechargeSuccessNotice(false), 3500);
    }, 600);
  };

  // Featured Master Psychic
  const featuredPsychic = readers.find(r => r.name.toLowerCase().includes('master')) || readers[0] || {
    id: 'reader-featured',
    name: 'Master Psychic',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    status: 'online',
    skills: ['Psychic', 'Tarot', 'Love Reading'],
    rating: 4.98,
    reviewsCount: 3840,
    ratePerMinute: 1.85,
    bio: 'I never charge for the first reading. If you feel connected, we continue together.',
    tagline: 'Deep clairvoyant channeled insight'
  };

  const filteredOrders = readers.filter(r => 
    !searchQuery || 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.specialties || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Main Container - Clean White & Royal Purple Matching User Images */}
      <div className="w-full max-w-lg bg-[#F8FAFC] sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[680px] max-h-screen text-gray-900 overflow-hidden border border-purple-900/30">
        
        {/* ================= 1. ROYAL PURPLE HEADER (Matching Photo 1, 2, 3) ================= */}
        <header className="bg-gradient-to-r from-[#240C48] via-[#3B0764] to-[#240C48] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            {onOpenDrawer ? (
              <button
                type="button"
                onClick={onOpenDrawer}
                className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-bold text-white tracking-wide font-sans">
              History
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Search orders"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Optional Search Bar Input Dropdown */}
        {isSearchVisible && (
          <div className="px-4 py-2 bg-[#2D0D55] text-white border-b border-purple-900 flex items-center gap-2 animate-in slide-in-from-top-1">
            <Search className="w-3.5 h-3.5 text-purple-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history, psychics or remedies..."
              className="w-full bg-transparent text-xs text-white placeholder-purple-300/60 outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-purple-300 text-xs">✕</button>
            )}
          </div>
        )}

        {/* ================= 2. TOP TABS: WALLET | ORDER | REMEDIES (Matching Photo 1, 2, 3) ================= */}
        <div className="grid grid-cols-3 bg-white border-b border-gray-200 shrink-0 text-sm font-bold shadow-xs">
          {[
            { id: 'wallet', label: 'Wallet' },
            { id: 'order', label: 'Order' },
            { id: 'remedies', label: 'Remedies' }
          ].map((tab) => {
            const isActive = topTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTopTab(tab.id as any)}
                className={`py-3.5 text-center font-bold text-xs sm:text-sm transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-[#581C87] text-[#581C87] font-extrabold bg-purple-50/40'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Recharge Success Toast */}
        {rechargeSuccessNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between font-semibold animate-in slide-in-from-top-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Recharge Successful! Balance updated.
            </span>
            <button onClick={() => setRechargeSuccessNotice(false)}>✕</button>
          </div>
        )}

        {/* ================= 3. TAB 1: WALLET (Matching Photo 1) ================= */}
        {topTab === 'wallet' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {/* AVAILABLE BALANCE & RECHARGE ROW */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">
                    Available Balance
                  </span>
                  <div className="text-3xl font-extrabold text-gray-900 font-mono tracking-tight mt-1">
                    {availableBalance === 0 ? '₹0' : formatBal(availableBalance)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(true)}
                  className="px-6 py-2 rounded-xl bg-[#581C87] hover:bg-[#4C1D95] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Recharge
                </button>
              </div>

              {/* View Balance Breakdown Expandable Pill */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between text-xs text-gray-600 font-medium hover:text-gray-900 transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border border-gray-400 rounded-sm flex items-center justify-center text-[9px] font-bold">
                      ℹ
                    </span>
                    <span>View Balance Breakdown</span>
                  </span>
                  {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expandable Breakdown Details */}
                {showBreakdown && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Recharge Balance:</span>
                      <span className="font-mono font-bold text-gray-900">{formatBal(rechargeBalance)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Promotional / Cashback Balance:</span>
                      <span className="font-mono font-bold text-purple-700">{formatBal(cashbackBalance)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-bold text-gray-900">
                      <span>Total Usable Coins:</span>
                      <span className="font-mono">{formatBal(availableBalance)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* THREE SUB-FILTER PILLS: [ Transactions ] [ Payment Logs ] [ Expiring ] */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {[
                  { id: 'transaction', label: 'Transactions' },
                  { id: 'payment_logs', label: 'Payment Logs' },
                  { id: 'expiring', label: 'Expiring' }
                ].map((item) => {
                  const isActive = walletSubFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWalletSubFilter(item.id as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#581C87] text-white shadow-xs font-bold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* 1. Transactions List */}
              {walletSubFilter === 'transaction' && (
                <div className="space-y-2.5">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                          {tx.title}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {tx.date}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                          <span>{tx.orderId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(tx.orderId)}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === tx.orderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          {formatBal(tx.amount)}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end gap-1 font-mono">
                          <span>{formatBal(tx.rechargePart || 0)}</span>
                          <span>+</span>
                          <span>{formatBal(tx.bonusPart || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Payment Logs List */}
              {walletSubFilter === 'payment_logs' && (
                <div className="space-y-2.5">
                  {paymentLogs.length === 0 ? (
                    <div className="py-12 px-4 text-center rounded-2xl bg-white border border-gray-200/80">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 text-sm mb-1">No Payment Logs</h4>
                      <p className="text-xs text-gray-400">No recharge payments recorded yet.</p>
                    </div>
                  ) : (
                    paymentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-white border border-gray-200/90 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900">{log.txnId}</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{log.method} • {log.date}</p>
                        </div>
                        <div className="text-right font-mono font-bold text-sm text-emerald-600">
                          +{formatBal(log.amount)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 3. Expiring List */}
              {walletSubFilter === 'expiring' && (
                <div className="space-y-2.5">
                  {expiringList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-amber-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.title}</p>
                          <p className="text-[11px] text-amber-700 font-medium">
                            Expires in {item.daysRemaining} days ({item.expiryDate})
                          </p>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-amber-700 text-sm">
                        {formatBal(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 4. TAB 2: ORDER (Matching Photo 2) ================= */}
        {topTab === 'order' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {/* Primary Consultation Order: Featured Master Psychic */}
            <div 
              onClick={() => {
                if (onStartChatWithReader) onStartChatWithReader(featuredPsychic as any);
              }}
              className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Purple Avatar with Online Dot */}
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#2E1065] via-[#4C1D95] to-[#7C3AED] p-0.5 flex items-center justify-center shadow-sm">
                    <div className="w-full h-full rounded-full bg-[#180A38] flex items-center justify-center overflow-hidden">
                      <span className="text-xl text-purple-200 select-none">🔮</span>
                    </div>
                  </div>
                  {/* Glowing Green Online Dot */}
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400" />
                </div>

                {/* Name & Quote */}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-950 text-sm tracking-tight group-hover:text-[#581C87] transition-colors">
                    {featuredPsychic.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5 max-w-[230px] sm:max-w-xs font-normal">
                    {featuredPsychic.bio || 'I never charge for the first reading. If you feel connected, we continue.'}
                  </p>
                </div>
              </div>

              {/* Date on Right Top */}
              <div className="text-right shrink-0">
                <span className="text-xs text-gray-400 font-medium">
                  06 Oct 2026
                </span>
                <div className="mt-1 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#581C87] bg-purple-50 px-2 py-0.5 rounded-full">
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </span>
                </div>
              </div>
            </div>

            {/* List other psychics/readers for immediate consultation connection */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Available Psychics to Connect
                </span>
                <span className="text-xs text-[#581C87] font-semibold">Live Online</span>
              </div>
              <div className="space-y-2">
                {filteredOrders.slice(0, 4).map((reader) => (
                  <div
                    key={reader.id}
                    onClick={() => {
                      if (onStartChatWithReader) onStartChatWithReader(reader);
                    }}
                    className="bg-white rounded-xl p-3 border border-gray-200/70 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={reader.avatar} 
                          alt={reader.name} 
                          className="w-10 h-10 rounded-full object-cover border border-purple-200"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-950 truncate">{reader.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{(reader.specialties || reader.methods || []).slice(0, 2).join(' • ')}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full bg-[#581C87] hover:bg-[#4C1D95] text-white text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Consult Free
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. TAB 3: REMEDIES (Matching Photo 3) ================= */}
        {topTab === 'remedies' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between bg-[#F8FAFC]">
            {/* Top Pill Sub-Filters: [ All ] [ Suggested ] [ Purchased ] */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'suggested', label: 'Suggested' },
                  { id: 'purchased', label: 'Purchased' }
                ].map((item) => {
                  const isActive = remediesFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRemediesFilter(item.id as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#581C87] text-white shadow-xs font-bold'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Center Empty State (EXACT MATCH to Photo 3!) */}
              <div className="py-12 sm:py-16 text-center max-w-sm mx-auto">
                {/* Circular bubble with magnifying glass with sad face */}
                <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                  <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    {/* Sad/neutral face inside lens */}
                    <circle cx="9" cy="9.5" r="0.8" fill="currentColor" />
                    <circle cx="13" cy="9.5" r="0.8" fill="currentColor" />
                    <path d="M9 13.5c.8-.7 2.2-.7 3 0" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Uh-oh!
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-6 leading-relaxed">
                  You've not booked any product in Astromall yet!
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRemediesModal) onOpenRemediesModal();
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#581C87] hover:bg-[#4C1D95] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Explore Astromall &amp; Sacred Remedies
                </button>
              </div>
            </div>

            <div className="text-center pb-2 text-[11px] text-gray-400">
              Prescribed gemstone talismans &amp; celestial spells will appear here.
            </div>
          </div>
        )}

        {/* ================= 6. RECHARGE MODAL DIALOG ================= */}
        {isRechargeModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xl max-w-sm mx-auto w-full animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#581C87]" />
                  <span>Instant Wallet Recharge</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2 mb-4">
                Select your recharge pack. Bonus coins are credited instantly to your account.
              </p>

              {/* Recharge Packs */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { amt: 100, cash: 0, tag: 'Standard' },
                  { amt: 250, cash: 35, tag: 'Best Value' },
                  { amt: 500, cash: 75, tag: 'Popular' },
                  { amt: 1000, cash: 200, tag: 'Maximum Bonus' },
                ].map((pack) => {
                  const isSelected = selectedPack === pack.amt;
                  return (
                    <button
                      key={pack.amt}
                      type="button"
                      onClick={() => setSelectedPack(pack.amt)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'bg-purple-50 border-[#581C87] text-gray-900 shadow-xs' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-extrabold text-base font-mono text-gray-900">
                        {formatBal(pack.amt)}
                      </div>
                      {pack.cash > 0 ? (
                        <div className="text-[11px] text-[#581C87] font-bold mt-0.5">
                          +{formatBal(pack.cash)} Bonus
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 mt-0.5">{pack.tag}</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleExecuteRecharge}
                disabled={isRecharging}
                className="w-full py-3 rounded-2xl bg-[#581C87] hover:bg-[#4C1D95] active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRecharging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Recharge...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm &amp; Add {formatBal(selectedPack)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
