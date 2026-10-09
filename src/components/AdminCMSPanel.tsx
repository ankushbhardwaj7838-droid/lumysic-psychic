import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Sparkles, 
  Search, 
  Bell, 
  User, 
  Settings, 
  RefreshCw, 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Phone, 
  Video, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package, 
  Tag, 
  Activity, 
  FileText, 
  Download, 
  Layers, 
  Calendar, 
  Filter, 
  ArrowRightLeft, 
  Award, 
  Zap, 
  Send, 
  Smartphone, 
  Mail, 
  Lock, 
  Copy, 
  BarChart3, 
  PieChart, 
  ArrowLeft,
  Flame,
  CheckCheck,
  MoreVertical,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { 
  Reader, 
  ConsultationSession, 
  ChatMessage, 
  AstroboardStats, 
  ShopProduct, 
  ActivityLog, 
  AutoAssignSettings, 
  RemedyItem, 
  AdminRole, 
  RoutingHistoryEntry,
  CustomerProfile
} from '../types';

interface AdminCMSPanelProps {
  onBackToSite: () => void;
  initialTab?: string;
}

export const AdminCMSPanel: React.FC<AdminCMSPanelProps> = ({
  onBackToSite,
  initialTab = 'dashboard'
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Admin authentication & Role-Based Access Control (RBAC)
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('super_admin');
  const [currentAdminName, setCurrentAdminName] = useState('Alex Vance (Super Admin)');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'astrologers' | 'chats' | 'clients' | 'products' | 'remedies'>('all');

  // Core Data
  const [readers, setReaders] = useState<Reader[]>([]);
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [remedies, setRemedies] = useState<RemedyItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [autoAssignSettings, setAutoAssignSettings] = useState<AutoAssignSettings>({
    enabled: true,
    maxChatsPerAstrologer: 3,
    idlePriority: true,
    escalationTimeoutMinutes: 2,
    specializationMatching: true,
    onlineOnly: true,
    fallbackAstrologerId: 'tarot-devendra'
  });

  // Operational KPIs
  const [kpis, setKpis] = useState({
    totalAstrologers: 19,
    onlineAstrologers: 14,
    offlineAstrologers: 5,
    activeChats: 4,
    pendingChats: 3,
    unassignedChats: 1,
    todaysChats: 28,
    todaysRevenue: 412.50,
    averageWaitTimeSec: 85,
    longestPendingSec: 210,
    activeClients: 42,
    totalProducts: 16,
    totalRemedies: 12
  });
  const [systemAlerts, setSystemAlerts] = useState<Array<{ id: string; type: 'critical' | 'warning' | 'info'; title: string; message: string; timestamp: string }>>([]);

  // Loading & Notifications
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Forward Chat Modal
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedSessionToForward, setSelectedSessionToForward] = useState<ConsultationSession | null>(null);
  const [forwardTargetAstroId, setForwardTargetAstroId] = useState('');
  const [forwardReason, setForwardReason] = useState('Manual Load Balancing');
  const [forwardSearch, setForwardSearch] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  // Add / Edit Astrologer Modal
  const [astroModalOpen, setAstroModalOpen] = useState(false);
  const [newAstroName, setNewAstroName] = useState('');
  const [newAstroEmail, setNewAstroEmail] = useState('');
  const [newAstroPhone, setNewAstroPhone] = useState('');
  const [newAstroSpecialty, setNewAstroSpecialty] = useState('Vedic Astrology');
  const [newAstroRate, setNewAstroRate] = useState(1.75);
  const [newAstroMaxChats, setNewAstroMaxChats] = useState(3);
  const [newAstroHours, setNewAstroHours] = useState('10:00 AM - 07:00 PM');
  const [newAstroBio, setNewAstroBio] = useState('Dedicated Vedic astrologer and intuitive counselor with over 10 years of experience.');
  const [createdAstroReceipt, setCreatedAstroReceipt] = useState<Reader | null>(null);

  // Pricing Control Modal
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [editingPriceReader, setEditingPriceReader] = useState<Reader | null>(null);
  const [newPriceRate, setNewPriceRate] = useState(1.50);

  // Date-wise Earnings & Reports Filter
  const [selectedDate, setSelectedDate] = useState('2026-10-08');
  const [dateWiseEarnings, setDateWiseEarnings] = useState<any>(null);

  // Product & Remedy Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Crystals');
  const [newProductPrice, setNewProductPrice] = useState(25);
  const [newProductStock, setNewProductStock] = useState(15);
  const [newProductDesc, setNewProductDesc] = useState('');

  const [remedyModalOpen, setRemedyModalOpen] = useState(false);
  const [newRemedyTitle, setNewRemedyTitle] = useState('');
  const [newRemedyCategory, setNewRemedyCategory] = useState<'Love' | 'Career' | 'Finance' | 'Marriage' | 'Family' | 'Health & Wellness' | 'Planetary' | 'Spiritual' | 'General'>('Love');
  const [newRemedyDesc, setNewRemedyDesc] = useState('');
  const [newRemedyPrice, setNewRemedyPrice] = useState(35);

  // Chat Filter
  const [chatFilterStatus, setChatFilterStatus] = useState<string>('all');
  const [chatFilterPriority, setChatFilterPriority] = useState<string>('all');

  // Live Timer tick for pending chats
  const [timerTick, setTimerTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show Toast
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all live data from backend
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, sessRes, readRes, prodRes, remRes, logRes] = await Promise.all([
        fetch('/api/admin/overview').catch(() => null),
        fetch('/api/astroboard/sessions').catch(() => null),
        fetch('/api/readers').catch(() => null),
        fetch('/api/shop/products').catch(() => null),
        fetch('/api/admin/remedies').catch(() => null),
        fetch('/api/admin/activity-logs').catch(() => null)
      ]);

      if (ovRes && ovRes.ok) {
        const ovData = await ovRes.json();
        if (ovData.kpis) setKpis(ovData.kpis);
        if (ovData.alerts) setSystemAlerts(ovData.alerts);
        if (ovData.autoAssignSettings) setAutoAssignSettings(ovData.autoAssignSettings);
      }

      if (sessRes && sessRes.ok) {
        const sessData = await sessRes.json();
        if (sessData.sessions) setSessions(sessData.sessions);
      }

      if (readRes && readRes.ok) {
        const readData = await readRes.json();
        if (readData.readers) setReaders(readData.readers);
      }

      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.products) setProducts(prodData.products);
      }

      if (remRes && remRes.ok) {
        const remData = await remRes.json();
        if (remData.remedies) setRemedies(remData.remedies);
      }

      if (logRes && logRes.ok) {
        const logData = await logRes.json();
        if (logData.logs) setActivityLogs(logData.logs);
      }

      // Fetch date wise earnings
      fetchDateWiseEarnings(selectedDate);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDateWiseEarnings = async (date: string) => {
    try {
      const res = await fetch(`/api/admin/earnings/date-wise?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setDateWiseEarnings(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds to mm:ss
  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate live waiting seconds from session.createdAt
  const getSessionWaitSeconds = (session: ConsultationSession) => {
    const created = new Date(session.createdAt).getTime();
    return Math.max(0, Math.floor((Date.now() - created) / 1000));
  };

  // Determine visual priority indicator
  const getWaitPriority = (waitSec: number): { label: 'NORMAL' | 'WAITING' | 'URGENT' | 'CRITICAL'; color: string; bg: string } => {
    if (waitSec >= 240) {
      return { label: 'CRITICAL', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300 animate-pulse' };
    }
    if (waitSec >= 120) {
      return { label: 'URGENT', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-300' };
    }
    if (waitSec >= 60) {
      return { label: 'WAITING', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' };
    }
    return { label: 'NORMAL', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' };
  };

  // Manual Chat Forwarding Handler
  const handleConfirmForward = async () => {
    if (!selectedSessionToForward || !forwardTargetAstroId) {
      showToast('Please select a target astrologer', 'error');
      return;
    }

    setIsForwarding(true);
    try {
      const res = await fetch('/api/admin/chats/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionToForward.id,
          newAstrologerId: forwardTargetAstroId,
          reason: forwardReason,
          adminName: currentAdminName
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Chat #${selectedSessionToForward.id.slice(-6)} forwarded successfully! (Client experience remains seamless)`, 'success');
        setForwardModalOpen(false);
        setSelectedSessionToForward(null);
        setForwardTargetAstroId('');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to forward chat', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error forwarding chat', 'error');
    } finally {
      setIsForwarding(false);
    }
  };

  // Toggle Auto-Assign Engine
  const handleToggleAutoAssign = async () => {
    const newStatus = !autoAssignSettings.enabled;
    const updated = { ...autoAssignSettings, enabled: newStatus };
    setAutoAssignSettings(updated);

    try {
      const res = await fetch('/api/admin/auto-assign/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: updated,
          adminName: currentAdminName
        })
      });
      if (res.ok) {
        showToast(`Auto-Assignment Engine is now ${newStatus ? 'ON (Balanced Distribution)' : 'OFF'}`, 'success');
        fetchAllData();
      }
    } catch {
      showToast('Failed to update auto-assign settings', 'error');
    }
  };

  // Run Auto Assign Batch Now
  const handleRunAutoAssignNow = async () => {
    try {
      const res = await fetch('/api/admin/chats/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Assigned ${data.assignedCount} chats.`, 'success');
        fetchAllData();
      }
    } catch {
      showToast('Failed to trigger auto assignment', 'error');
    }
  };

  // Create Astrologer Handler
  const handleCreateAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/astrologers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAstroName,
          email: newAstroEmail,
          phone: newAstroPhone,
          specialization: newAstroSpecialty,
          ratePerMinute: newAstroRate,
          maxConcurrentChats: newAstroMaxChats,
          workingHours: newAstroHours,
          bio: newAstroBio,
          adminName: currentAdminName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedAstroReceipt(data.reader);
        showToast(`Astrologer created! Auto-assigned ID: ${data.astroId}`, 'success');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to create astrologer', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating astrologer', 'error');
    }
  };

  // Update Astrologer Status
  const handleUpdateAstroStatus = async (astroId: string, status: string) => {
    try {
      const res = await fetch(`/api/readers/${astroId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'status', value: status })
      });
      if (res.ok) {
        showToast(`Status updated to ${status.toUpperCase()}`, 'success');
        fetchAllData();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // Update Astrologer Pricing
  const handleUpdatePricing = async () => {
    if (!editingPriceReader) return;
    try {
      const res = await fetch(`/api/admin/astrologers/${editingPriceReader.id}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ratePerMinute: newPriceRate,
          adminName: currentAdminName
        })
      });
      if (res.ok) {
        showToast(`Price updated to £${Number(newPriceRate).toFixed(2)}/min for ${editingPriceReader.name}`, 'success');
        setPricingModalOpen(false);
        fetchAllData();
      }
    } catch {
      showToast('Failed to update pricing', 'error');
    }
  };

  // Export Reports
  const handleExportReport = (reportType: string, format: 'csv' | 'pdf' | 'excel') => {
    let content = '';
    const now = new Date().toISOString();

    if (reportType === 'chats') {
      content = 'Chat ID,Client,Astrologer,Status,Wait Time Sec,Duration Sec,Created At\n';
      sessions.forEach(s => {
        content += `${s.id},"${s.customerName}","${s.assignedReaderName}",${s.status},${getSessionWaitSeconds(s)},${s.totalDurationSeconds},${s.createdAt}\n`;
      });
    } else if (reportType === 'astrologers') {
      content = 'Astro ID,Name,Specialty,Rate/Min,Online Status,Rating,Max Chats\n';
      readers.forEach(r => {
        content += `${r.astroId || r.id},"${r.name}","${r.category}",${r.ratePerMinute},${r.status},${r.rating},${r.maxConcurrentChats || 3}\n`;
      });
    } else {
      content = 'Date,Total Chats,Revenue,Platform Revenue,Astrologer Earnings\n';
      content += `${selectedDate},${sessions.length},£${kpis.todaysRevenue.toFixed(2)},£${(kpis.todaysRevenue * 0.4).toFixed(2)},£${(kpis.todaysRevenue * 0.6).toFixed(2)}\n`;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LUMSIC_${reportType}_report_${now.split('T')[0]}.${format === 'excel' ? 'csv' : format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportType.toUpperCase()} report as ${format.toUpperCase()}`, 'success');
  };

  // Role permissions check helper
  const canAccessSection = (section: string): boolean => {
    if (currentAdminRole === 'super_admin') return true;
    if (currentAdminRole === 'operations_admin') {
      return ['dashboard', 'chats', 'pending', 'astrologers', 'queue', 'activity'].includes(section);
    }
    if (currentAdminRole === 'chat_admin') {
      return ['dashboard', 'chats', 'pending', 'queue'].includes(section);
    }
    if (currentAdminRole === 'content_admin') {
      return ['dashboard', 'shop', 'remedies'].includes(section);
    }
    if (currentAdminRole === 'finance_admin') {
      return ['dashboard', 'pricing', 'earnings', 'reports'].includes(section);
    }
    return true;
  };

  // Filtered sessions for Chat Management
  const filteredSessions = sessions.filter(s => {
    if (chatFilterStatus !== 'all' && s.status !== chatFilterStatus) return false;
    if (chatFilterPriority !== 'all') {
      const wait = getSessionWaitSeconds(s);
      const prio = getWaitPriority(wait).label.toLowerCase();
      if (prio !== chatFilterPriority) return false;
    }
    if (globalSearch.trim()) {
      const query = globalSearch.toLowerCase();
      const matchClient = s.customerName?.toLowerCase().includes(query);
      const matchAstro = s.assignedReaderName?.toLowerCase().includes(query) || s.assignedAstroId?.toLowerCase().includes(query);
      const matchId = s.id?.toLowerCase().includes(query);
      if (!matchClient && !matchAstro && !matchId) return false;
    }
    return true;
  });

  // Pending / Waiting chats specifically
  const pendingQueue = sessions.filter(s => s.status === 'waiting');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* ================================================================ */}
      {/* 1. LARGE PROFESSIONAL HEADER (RED + WHITE THEME) */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-3 select-none">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Prominent LUMSIC Logo + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
              title="Toggle Menu"
            >
              <Layers className="w-5 h-5 text-rose-600" />
            </button>

            <div className="flex items-center gap-3">
              {/* Brand Logo Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center font-black shadow-md shadow-rose-600/25 shrink-0">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-xl sm:text-2xl tracking-tight text-rose-600 leading-none">
                    LUMSIC
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    ENTERPRISE CONTROL
                  </span>
                </div>
                <p className="text-[11.5px] sm:text-xs font-semibold text-slate-500 mt-0.5 tracking-wide">
                  Astrology Control Center &bull; Operational Headquarters
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="w-full bg-slate-50 border border-slate-200 hover:border-rose-400 focus-within:border-rose-600 focus-within:ring-2 focus-within:ring-rose-500/15 rounded-2xl px-3.5 py-2 flex items-center gap-2 transition-all shadow-xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search Astrologer, ID (LYS-...), Client, Chat ID, Product, Remedy..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {globalSearch && (
                <button onClick={() => setGlobalSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions, Notifications, Role Switcher, Main Site Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Auto Assignment Quick Status Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${autoAssignSettings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="font-semibold text-slate-600">Auto-Assign:</span>
              <span className={`font-black ${autoAssignSettings.enabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                {autoAssignSettings.enabled ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 flex items-center justify-center transition-colors border border-slate-200 cursor-pointer relative shadow-xs"
                title="System Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {systemAlerts.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 absolute top-2 right-2 ring-2 ring-white" />
                )}
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-600" />
                      <h4 className="font-black text-sm text-slate-900">Operational Alerts</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {systemAlerts.length} Active
                    </span>
                  </div>

                  <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                    {systemAlerts.length > 0 ? (
                      systemAlerts.map(alert => (
                        <div key={alert.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">{alert.title}</span>
                            <span className="text-[10px] text-slate-400">Just now</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{alert.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No critical alerts. All operational parameters normal.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer shadow-xs"
              >
                <div className="w-6 h-6 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs">
                  {currentAdminRole === 'super_admin' ? 'SA' : 'OP'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="leading-none text-[11px] font-extrabold text-slate-900">{currentAdminName.split(' ')[0]}</p>
                  <p className="text-[9.5px] text-rose-600 font-bold uppercase">{currentAdminRole.replace('_', ' ')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Switcher Menu */}
              {roleMenuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-3xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in space-y-2">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Admin View Role (RBAC)
                  </div>
                  {[
                    { role: 'super_admin', label: 'Super Admin', desc: 'Full root access to all modules' },
                    { role: 'operations_admin', label: 'Operations Admin', desc: 'Chats, Astrologers, Queue' },
                    { role: 'chat_admin', label: 'Chat Admin', desc: 'Forwarding & Queue monitoring' },
                    { role: 'content_admin', label: 'Content Admin', desc: 'Shop & Consecrated Remedies' },
                    { role: 'finance_admin', label: 'Finance Admin', desc: 'Pricing & Earnings Analytics' }
                  ].map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        setCurrentAdminRole(item.role as AdminRole);
                        setCurrentAdminName(`Alex (${item.label})`);
                        setRoleMenuOpen(false);
                        showToast(`Switched view to ${item.label}`, 'info');
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        currentAdminRole === item.role ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{item.desc}</p>
                      </div>
                      {currentAdminRole === item.role && <Check className="w-4 h-4 text-rose-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Link to Astrodashboard for Astrologers */}
            <a
              href="/astrodashboard"
              className="hidden lg:flex text-xs font-bold text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Astrologer Portal"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Astro Portal</span>
            </a>

            {/* Back to Public Site */}
            <button
              onClick={onBackToSite}
              className="text-xs font-bold text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Main Site</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* Global Toast Message */}
      {toastMessage && (
        <div className={`py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-600 text-white shadow-md' : 
          toastMessage.type === 'error' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-white shadow-md'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. BODY LAYOUT: COLLAPSIBLE SIDEBAR + MAIN WORKSPACE */}
      {/* ================================================================ */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className={`${sidebarCollapsed ? 'hidden' : 'block'} lg:block w-64 shrink-0 bg-white border-r border-slate-200 p-4 space-y-6 select-none shadow-xs`}>
          
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Operations &amp; Control
            </span>

            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: '' },
              { id: 'chats', label: 'Chats', icon: MessageSquare, badge: `${kpis.activeChats} live` },
              { id: 'pending', label: 'Pending Chats', icon: Clock, badge: kpis.pendingChats > 0 ? `${kpis.pendingChats}` : '', badgeColor: 'bg-rose-600 text-white' },
              { id: 'queue', label: 'Chat Assignment', icon: ArrowRightLeft, badge: autoAssignSettings.enabled ? 'AUTO' : 'OFF' },
              { id: 'astrologers', label: 'Astrologers', icon: Users, badge: `${kpis.onlineAstrologers} on` },
              { id: 'clients', label: 'Clients', icon: User, badge: '' }
            ].map(item => {
              const allowed = canAccessSection(item.id);
              return (
                <button
                  key={item.id}
                  disabled={!allowed}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    !allowed ? 'opacity-40 cursor-not-allowed' :
                    activeTab === item.id 
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === item.id 
                        ? 'bg-white/20 text-white' 
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Monetization &amp; Catalog
            </span>

            {[
              { id: 'pricing', label: 'Pricing Control', icon: Tag, badge: '' },
              { id: 'earnings', label: 'Earnings & Reports', icon: DollarSign, badge: `£${kpis.todaysRevenue.toFixed(0)}` },
              { id: 'shop', label: 'Lumysic Shop', icon: ShoppingBag, badge: `${products.length}` },
              { id: 'remedies', label: 'Remedies', icon: Sparkles, badge: `${remedies.length}` }
            ].map(item => {
              const allowed = canAccessSection(item.id);
              return (
                <button
                  key={item.id}
                  disabled={!allowed}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    !allowed ? 'opacity-40 cursor-not-allowed' :
                    activeTab === item.id 
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Governance &amp; Audit
            </span>

            {[
              { id: 'activity', label: 'Activity Logs', icon: Activity, badge: '' },
              { id: 'roles', label: 'Admin Roles (RBAC)', icon: Shield, badge: '' },
              { id: 'settings', label: 'System Controls', icon: Settings, badge: '' }
            ].map(item => {
              const allowed = canAccessSection(item.id);
              return (
                <button
                  key={item.id}
                  disabled={!allowed}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    !allowed ? 'opacity-40 cursor-not-allowed' :
                    activeTab === item.id 
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Refresh Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-600' : ''}`} />
              <span>Refresh Live Data</span>
            </button>
          </div>

        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          
          {/* ================================================================ */}
          {/* 3. TOP OPERATIONAL INFORMATION (ALWAYS VISIBLE OR OVERVIEW TAB) */}
          {/* ================================================================ */}
          <section className="space-y-4">
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Operations Overview
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time operational dashboard for astrologers, active queues, and platform revenue.
                </p>
              </div>

              {/* Action Buttons: Forward Chat & Auto Assign Trigger */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAutoAssign}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                    autoAssignSettings.enabled 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title="Toggle Auto Assignment Engine"
                >
                  <Zap className="w-3.5 h-3.5 text-rose-600" />
                  <span>Auto-Assign Engine: {autoAssignSettings.enabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => {
                    setAstroModalOpen(true);
                    setCreatedAstroReceipt(null);
                  }}
                  className="px-3.5 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Astrologer</span>
                </button>
              </div>
            </div>

            {/* 8 MAIN OPERATIONAL KPI CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
              
              {/* 1. Total Astrologers */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Astrologers</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{kpis.totalAstrologers}</span>
                  <Users className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
              </div>

              {/* 2. Online Astrologers */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Online Astrologers</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600">{kpis.onlineAstrologers}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* 3. Offline Astrologers */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Offline Astrologers</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-slate-400">{kpis.offlineAstrologers}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
              </div>

              {/* 4. Active Chats */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Chats</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-blue-600">{kpis.activeChats}</span>
                  <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                </div>
              </div>

              {/* 5. Pending Chats */}
              <div className={`p-3.5 rounded-2xl border shadow-xs flex flex-col justify-between ${
                kpis.pendingChats > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Chats</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className={`text-xl sm:text-2xl font-black ${kpis.pendingChats > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {kpis.pendingChats}
                  </span>
                  <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
              </div>

              {/* 6. Unassigned Chats */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Unassigned Chats</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-amber-600">{kpis.unassignedChats}</span>
                  <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0" />
                </div>
              </div>

              {/* 7. Today's Chats */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Chats</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{kpis.todaysChats}</span>
                  <Activity className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
              </div>

              {/* 8. Today's Revenue */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Revenue</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-black font-mono text-emerald-600">£{kpis.todaysRevenue.toFixed(2)}</span>
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              </div>

            </div>

            {/* 5 SECONDARY OPERATIONAL KPIS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              
              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Avg Chat Wait Time</span>
                  <span className="text-sm font-black font-mono text-slate-900">{formatWaitTime(kpis.averageWaitTimeSec)}</span>
                </div>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Longest Pending</span>
                  <span className="text-sm font-black font-mono text-rose-600">{formatWaitTime(kpis.longestPendingSec)}</span>
                </div>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Active Clients</span>
                  <span className="text-sm font-black text-slate-900">{kpis.activeClients}</span>
                </div>
                <User className="w-4 h-4 text-slate-400" />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Total Products</span>
                  <span className="text-sm font-black text-slate-900">{products.length} Items</span>
                </div>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Total Remedies</span>
                  <span className="text-sm font-black text-slate-900">{remedies.length} Consecrated</span>
                </div>
                <Sparkles className="w-4 h-4 text-rose-500" />
              </div>

            </div>

            {/* SYSTEM ALERTS BANNER (SECTION 27) */}
            {systemAlerts.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>{systemAlerts[0].title}:</strong> {systemAlerts[0].message}
                  </span>
                </div>
                <button
                  onClick={handleRunAutoAssignNow}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Auto-Resolve / Reassign Queue
                </button>
              </div>
            )}

          </section>

          {/* ================================================================ */}
          {/* 4. PENDING CHAT MONITOR & LIVE CHAT QUEUE (SECTION 5 & 10) */}
          {/* ================================================================ */}
          {(activeTab === 'dashboard' || activeTab === 'pending' || activeTab === 'chats') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      Pending Chat Monitor &bull; Live Queue
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Real-time queue monitoring with waiting timers and priority escalation indicators.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAutoAssignNow}
                    className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-rose-600" />
                    <span>Run Auto-Assign</span>
                  </button>
                </div>
              </div>

              {/* Pending Queue List */}
              {pendingQueue.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {pendingQueue.map((session, index) => {
                    const waitSec = getSessionWaitSeconds(session);
                    const prio = getWaitPriority(waitSec);

                    return (
                      <div 
                        key={session.id} 
                        className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-2xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                {session.customerName || 'Seeker'}
                              </h4>
                              <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md border ${prio.bg} ${prio.color}`}>
                                {prio.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              Topic: {session.topic || 'Astrology Reading'} &bull; Assigned: {session.assignedReaderName || 'Unassigned'}
                            </p>
                          </div>
                        </div>

                        {/* Right: Wait Timer + Forward Button */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Wait Time</span>
                            <span className={`text-base font-black font-mono ${waitSec > 120 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {formatWaitTime(waitSec)}
                            </span>
                          </div>

                          {/* Forward Chat Button */}
                          <button
                            onClick={() => {
                              setSelectedSessionToForward(session);
                              setForwardModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>FORWARD CHAT</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-700">No pending chats in queue</p>
                  <p className="text-slate-400 mt-0.5">All seeker consultations are currently active or answered.</p>
                </div>
              )}

            </section>
          )}

          {/* ================================================================ */}
          {/* 5. COMPLETE CHAT MANAGEMENT DASHBOARD (SECTION 4) */}
          {/* ================================================================ */}
          {(activeTab === 'dashboard' || activeTab === 'chats') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Live Chat Management Console
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Comprehensive table of all consultations with live status, duration, and assignment controls.
                  </p>
                </div>

                {/* Status & Priority Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['all', 'active', 'waiting', 'completed', 'cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setChatFilterStatus(st)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        chatFilterStatus === st 
                          ? 'bg-rose-600 text-white shadow-xs' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                      <th className="py-3 px-3">Chat ID</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Astrologer</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Wait Time</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Assignment Type</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSessions.slice(0, 15).map(session => {
                      const waitSec = getSessionWaitSeconds(session);
                      const prio = getWaitPriority(waitSec);

                      return (
                        <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            #{session.id.slice(-6)}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {session.customerName || 'Seeker'}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            {session.assignedReaderName || session.requestedReaderName || 'Unassigned'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              session.status === 'waiting' ? 'bg-amber-100 text-amber-800' :
                              session.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {session.status === 'waiting' ? formatWaitTime(waitSec) : '00:00'}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {Math.floor(session.totalDurationSeconds / 60)}m {session.totalDurationSeconds % 60}s
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md ${prio.bg} ${prio.color}`}>
                              {prio.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono text-[10.5px]">
                            {session.assignmentType || 'DIRECT'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedSessionToForward(session);
                                setForwardModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Forward
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </section>
          )}

          {/* ================================================================ */}
          {/* 6. ASTROLOGER MANAGEMENT (SECTION 11, 12, 13, 14) */}
          {/* ================================================================ */}
          {(activeTab === 'astrologers') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">Astrologer Directory &bull; Account Controls</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Manage astrologer profiles, pricing overrides, live statuses, and working shifts.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAstroModalOpen(true);
                    setCreatedAstroReceipt(null);
                  }}
                  className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Create Astrologer (Auto-ID)</span>
                </button>
              </div>

              {/* Astrologers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {readers.map(r => (
                  <div key={r.id} className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all bg-white shadow-xs space-y-3 flex flex-col justify-between">
                    
                    <div>
                      {/* Top Row: Avatar + Name + ID */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={r.avatar || r.image_url} 
                            alt={r.name} 
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                          />
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{r.name}</h4>
                            <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              ID: {r.astroId || r.id}
                            </span>
                          </div>
                        </div>

                        {/* Status override pill */}
                        <select
                          value={r.status || (r.isOnline ? 'online' : 'offline')}
                          onChange={(e) => handleUpdateAstroStatus(r.id, e.target.value)}
                          className={`text-[10.5px] font-black rounded-xl px-2 py-1 border outline-none cursor-pointer ${
                            r.status === 'online' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            r.status === 'busy' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            r.status === 'suspended' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="online">ONLINE</option>
                          <option value="offline">OFFLINE</option>
                          <option value="busy">BUSY</option>
                          <option value="on_break">ON BREAK</option>
                          <option value="suspended">SUSPENDED</option>
                        </select>
                      </div>

                      {/* Details & Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-center">
                        <div className="p-2 rounded-xl bg-slate-50">
                          <span className="text-[9.5px] text-slate-400 block font-bold">Price</span>
                          <span className="font-extrabold text-slate-800">£{r.ratePerMinute.toFixed(2)}/m</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50">
                          <span className="text-[9.5px] text-slate-400 block font-bold">Rating</span>
                          <span className="font-extrabold text-amber-600 font-mono">{r.rating.toFixed(2)} ★</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50">
                          <span className="text-[9.5px] text-slate-400 block font-bold">Max Chats</span>
                          <span className="font-extrabold text-slate-800">{r.maxConcurrentChats || 3}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingPriceReader(r);
                          setNewPriceRate(r.ratePerMinute);
                          setPricingModalOpen(true);
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Adjust Price
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('earnings');
                          setSelectedDate('2026-10-08');
                        }}
                        className="flex-1 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Work Report
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </section>
          )}

          {/* ================================================================ */}
          {/* 7. CHAT ASSIGNMENT ENGINE & CONFIGURATION (SECTION 8 & 9) */}
          {/* ================================================================ */}
          {(activeTab === 'queue') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Auto-Assignment Engine &bull; Workload &amp; Escalation Rules
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Automated balanced distribution, astrologer workload limits, and timeout escalations.
                  </p>
                </div>

                <button
                  onClick={handleToggleAutoAssign}
                  className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                    autoAssignSettings.enabled 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>Master Engine: {autoAssignSettings.enabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}</span>
                </button>
              </div>

              {/* 5 Crucial Rules Controls (User Request Highlights) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Workload Limit */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">1. Astrologer Workload Limit</span>
                    <span className="text-xs font-black font-mono text-rose-600">{autoAssignSettings.maxChatsPerAstrologer} Chats Max</span>
                  </div>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    If an astrologer already has {autoAssignSettings.maxChatsPerAstrologer} active chats, the 4th chat will never be assigned to them automatically.
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={autoAssignSettings.maxChatsPerAstrologer}
                    onChange={(e) => setAutoAssignSettings({ ...autoAssignSettings, maxChatsPerAstrologer: Number(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* 2. Escalation Timer */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">2. Escalation Timeout</span>
                    <span className="text-xs font-black font-mono text-rose-600">{autoAssignSettings.escalationTimeoutMinutes} Minutes</span>
                  </div>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    If an astrologer does not accept/respond within {autoAssignSettings.escalationTimeoutMinutes} minutes, the chat is automatically transferred to the next eligible astrologer.
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={autoAssignSettings.escalationTimeoutMinutes}
                    onChange={(e) => setAutoAssignSettings({ ...autoAssignSettings, escalationTimeoutMinutes: Number(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* 3. Idle Time Priority */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">3. Idle-Time Prioritization</span>
                    <input
                      type="checkbox"
                      checked={autoAssignSettings.idlePriority}
                      onChange={(e) => setAutoAssignSettings({ ...autoAssignSettings, idlePriority: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    Prioritizes astrologers who have been available and idle the longest to prevent repeated assignments to the same reader.
                  </p>
                </div>

                {/* 4. Online-Only Toggle */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">4. Online-Only Assignment</span>
                    <input
                      type="checkbox"
                      checked={autoAssignSettings.onlineOnly}
                      onChange={(e) => setAutoAssignSettings({ ...autoAssignSettings, onlineOnly: e.target.checked })}
                      className="w-4 h-4 accent-rose-600 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-500 text-[11.5px] leading-relaxed">
                    Ensures chats are never assigned to astrologers marked offline, on break, or suspended.
                  </p>
                </div>

              </div>

              {/* Save Settings Button */}
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    await fetch('/api/admin/auto-assign/settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ settings: autoAssignSettings, adminName: currentAdminName })
                    });
                    showToast('Auto-Assignment engine settings saved', 'success');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all"
                >
                  Save Engine Rules
                </button>
              </div>

            </section>
          )}

          {/* ================================================================ */}
          {/* 8. EARNINGS & DATE-WISE REPORTS (SECTION 17, 18, 19, 38) */}
          {/* ================================================================ */}
          {(activeTab === 'earnings') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Earnings Analytics &bull; Date-Wise Astrologer Work Report
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Filter by exact calendar date to inspect revenue, completed chats, and individual astrologer payouts.
                  </p>
                </div>

                {/* Specific Date Filter (Section 17 Requirement) */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-bold text-slate-700">Select Date:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        fetchDateWiseEarnings(e.target.value);
                      }}
                      className="bg-transparent font-mono font-bold text-slate-900 outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => handleExportReport('earnings', 'csv')}
                    className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Top Revenue Summary for Selected Date */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Date Revenue</span>
                  <span className="text-xl font-black font-mono text-slate-900 block">
                    £{dateWiseEarnings?.totalRevenue ? dateWiseEarnings.totalRevenue.toFixed(2) : '412.50'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Platform Revenue (40%)</span>
                  <span className="text-xl font-black font-mono text-emerald-700 block">
                    £{dateWiseEarnings?.platformRevenue ? dateWiseEarnings.platformRevenue.toFixed(2) : '165.00'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-700">Astrologer Payouts (60%)</span>
                  <span className="text-xl font-black font-mono text-blue-700 block">
                    £{dateWiseEarnings?.astrologerEarnings ? dateWiseEarnings.astrologerEarnings.toFixed(2) : '247.50'}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Completed Consultations</span>
                  <span className="text-xl font-black text-slate-900 block">
                    {dateWiseEarnings?.completedSessions || 24}
                  </span>
                </div>
              </div>

              {/* Astrologer Date-Wise Work Report Table (Section 18 Requirement) */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-slate-900">
                  Individual Astrologer Breakdown on {selectedDate}
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black">
                        <th className="py-2.5 px-3">Astrologer</th>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Chats Handled</th>
                        <th className="py-2.5 px-3">Completed</th>
                        <th className="py-2.5 px-3">Cancelled</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3 text-right">Astrologer Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(dateWiseEarnings?.astrologers || readers.slice(0, 8).map((r, i) => ({
                        astrologerName: r.name,
                        astroId: r.astroId || r.id,
                        totalChats: 4 + (i % 3),
                        completed: 3 + (i % 3),
                        cancelled: i % 2,
                        totalMinutes: 45 + (i * 12),
                        earnings: (45 + (i * 12)) * 1.5 * 0.6
                      }))).map((astro: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{astro.astrologerName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{astro.astroId}</td>
                          <td className="py-2.5 px-3 font-bold">{astro.totalChats}</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-bold">{astro.completed}</td>
                          <td className="py-2.5 px-3 text-slate-400">{astro.cancelled}</td>
                          <td className="py-2.5 px-3 font-mono">{Math.floor(astro.totalMinutes / 60)}h {astro.totalMinutes % 60}m</td>
                          <td className="py-2.5 px-3 text-right font-black font-mono text-emerald-600">
                            £{astro.earnings.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </section>
          )}

          {/* ================================================================ */}
          {/* 9. LUMSIC SHOP & REMEDIES (SECTION 20, 21, 22) */}
          {/* ================================================================ */}
          {(activeTab === 'shop' || activeTab === 'remedies') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {activeTab === 'shop' ? 'Lumsic Shop &bull; Product Catalog' : 'Remedies Management'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeTab === 'shop' 
                      ? 'Control inventory, retail prices, crystal categories, and product images.' 
                      : 'Publish consecrated Vedic & energetic remedies for personal healing.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (activeTab === 'shop') setProductModalOpen(true);
                    else setRemedyModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{activeTab === 'shop' ? '+ Add Product' : '+ Add Remedy'}</span>
                </button>
              </div>

              {/* Products or Remedies Grid */}
              {activeTab === 'shop' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <img 
                          src={p.image_url || p.image} 
                          alt={p.name} 
                          className="w-full h-36 rounded-xl object-cover border border-slate-100" 
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{p.category}</span>
                          <span className="text-xs font-black font-mono text-emerald-600">£{p.priceGBP}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">Stock: {p.stockCount || 12}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {remedies.map(rem => (
                    <div key={rem.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">{rem.category}</span>
                          <span className="text-xs font-black font-mono text-emerald-600">£{rem.price}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900">{rem.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{rem.description}</p>
                        <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1">
                          <p className="font-bold text-slate-700">Duration: {rem.duration}</p>
                          <p className="text-slate-500 italic text-[10.5px]">"{rem.instructions}"</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-black text-emerald-700 uppercase">{rem.status}</span>
                        <button
                          onClick={async () => {
                            await fetch(`/api/admin/remedies/${rem.id}`, { method: 'DELETE' });
                            showToast('Remedy deleted', 'info');
                            fetchAllData();
                          }}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </section>
          )}

          {/* ================================================================ */}
          {/* 10. ACTIVITY LOGS (AUDIT TRAIL) (SECTION 25) */}
          {/* ================================================================ */}
          {(activeTab === 'activity') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-base text-slate-900">Activity Logs &bull; Immutable Audit Trail</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Strict accountability log tracking all admin actions, forward events, and pricing overrides.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {activityLogs.length} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black">
                      <th className="py-2.5 px-3">Date &amp; Time</th>
                      <th className="py-2.5 px-3">Admin</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Target</th>
                      <th className="py-2.5 px-3">Previous Value</th>
                      <th className="py-2.5 px-3">New Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {log.date} {log.time}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{log.admin}</td>
                        <td className="py-2.5 px-3 text-rose-700 font-bold">{log.action}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{log.target}</td>
                        <td className="py-2.5 px-3 text-slate-400 line-clamp-1">{log.previousValue || 'None'}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-semibold">{log.newValue || 'Updated'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </section>
          )}

          {/* ================================================================ */}
          {/* 11. ROLE-BASED ACCESS CONTROL (RBAC) (SECTION 24) */}
          {/* ================================================================ */}
          {(activeTab === 'roles') && (
            <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
              
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900">Admin Roles &bull; Role-Based Permissions (RBAC)</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configured roles to ensure internal employees and operators only access authorized operational zones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { role: 'SUPER ADMIN', desc: 'Full root access to all platform controls, pricing, astrologers, and financial reports.', allowed: 'All Modules' },
                  { role: 'OPERATIONS ADMIN', desc: 'Manages incoming chat queues, astrologer status overrides, and workload limits.', allowed: 'Chats, Queue, Astrologers, Logs' },
                  { role: 'CHAT ADMIN', desc: 'Authorized to monitor live queues and manually forward consultations.', allowed: 'Queue, Live Chats' },
                  { role: 'CONTENT ADMIN', desc: 'Manages Lumysic Shop inventory and consecrated remedy catalog.', allowed: 'Shop, Remedies' },
                  { role: 'FINANCE ADMIN', desc: 'Controls per-minute pricing, global rates, and audits date-wise payout reports.', allowed: 'Pricing, Earnings, Reports' }
                ].map(r => (
                  <div key={r.role} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs text-slate-900">{r.role}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Active</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-[10.5px] font-bold text-emerald-700">
                      Permissions: {r.allowed}
                    </div>
                  </div>
                ))}
              </div>

            </section>
          )}

        </main>
      </div>

      {/* ================================================================ */}
      {/* MODAL 1: MANUAL CHAT FORWARDING (SECTION 6 & 7) */}
      {/* ================================================================ */}
      {forwardModalOpen && selectedSessionToForward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Manual Routing</span>
                <h3 className="font-black text-lg text-slate-900">
                  Forward Chat #{selectedSessionToForward.id.slice(-6)}
                </h3>
              </div>
              <button 
                onClick={() => setForwardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Session Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <strong className="text-slate-900">{selectedSessionToForward.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Astrologer:</span>
                <strong className="text-slate-900">{selectedSessionToForward.assignedReaderName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wait Time:</span>
                <strong className="text-rose-600 font-mono">{formatWaitTime(getSessionWaitSeconds(selectedSessionToForward))}</strong>
              </div>
              <div className="pt-2 text-[10.5px] text-emerald-700 font-medium border-t border-slate-200/80">
                &bull; Client will continue normal chat experience. Internal forwarding history is recorded for admin audit only.
              </div>
            </div>

            {/* Forward Reason */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Forwarding Reason</label>
              <select
                value={forwardReason}
                onChange={(e) => setForwardReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
              >
                <option value="Manual Load Balancing">Manual Load Balancing</option>
                <option value="Specialist Reassignment">Specialist Reassignment</option>
                <option value="Astrologer Delay Escalation">Astrologer Delay Escalation</option>
                <option value="Language Preference">Language Preference</option>
                <option value="Seeker Request">Seeker Request</option>
              </select>
            </div>

            {/* Select Target Astrologer List with Search */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Select Target Astrologer</span>
                <span className="text-[10px] text-slate-400">Available: {readers.filter(r => r.isOnline).length}</span>
              </div>

              <input
                type="text"
                value={forwardSearch}
                onChange={(e) => setForwardSearch(e.target.value)}
                placeholder="Search by astrologer name or LYS-ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-rose-400"
              />

              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-100 rounded-2xl p-1.5">
                {readers
                  .filter(r => {
                    if (!forwardSearch.trim()) return true;
                    const q = forwardSearch.toLowerCase();
                    return r.name.toLowerCase().includes(q) || (r.astroId && r.astroId.toLowerCase().includes(q));
                  })
                  .map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setForwardTargetAstroId(r.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        forwardTargetAstroId === r.id 
                          ? 'bg-rose-50 border-rose-300 text-rose-900' 
                          : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${r.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{r.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {r.astroId || r.id} &bull; {r.category}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 block">Rating: {r.rating} ★</span>
                        <span className="text-[9.5px] font-mono text-emerald-600">£{r.ratePerMinute}/m</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Confirm Forward Button */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForwardModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isForwarding || !forwardTargetAstroId}
                onClick={handleConfirmForward}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {isForwarding ? 'Forwarding...' : 'CONFIRM FORWARD'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 2: ADD ASTROLOGER WITH AUTO-GENERATED ID (SECTION 12) */}
      {/* ================================================================ */}
      {astroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Onboarding</span>
                <h3 className="font-black text-lg text-slate-900">Create Astrologer Account</h3>
              </div>
              <button onClick={() => setAstroModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdAstroReceipt ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Account Successfully Created!</span>
                </div>
                <div className="space-y-1 font-mono text-slate-700 bg-white p-3 rounded-xl border border-emerald-100">
                  <p><strong>Astrologer ID:</strong> {createdAstroReceipt.astroId}</p>
                  <p><strong>Name:</strong> {createdAstroReceipt.name}</p>
                  <p><strong>Login Email:</strong> {createdAstroReceipt.email}</p>
                  {createdAstroReceipt.phone && <p><strong>Mobile Login:</strong> Enabled ({createdAstroReceipt.phone})</p>}
                  <p><strong>Default Shift:</strong> {createdAstroReceipt.shift}</p>
                </div>
                <p className="text-[11px] text-emerald-700">
                  The astrologer can now log in at <code>/astrodashboard</code> using their registered email and set their permanent password.
                </p>
                <button
                  onClick={() => setAstroModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Done &bull; Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAstrologer} className="space-y-3.5 text-xs">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    value={newAstroName}
                    onChange={(e) => setNewAstroName(e.target.value)}
                    placeholder="e.g. Acharya Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-400 text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Registered Email *</label>
                    <input
                      type="email"
                      value={newAstroEmail}
                      onChange={(e) => setNewAstroEmail(e.target.value)}
                      placeholder="e.g. rajesh@lumysic.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-400 text-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone (Optional for Mobile Login)</label>
                    <input
                      type="text"
                      value={newAstroPhone}
                      onChange={(e) => setNewAstroPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-400 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Specialization</label>
                    <select
                      value={newAstroSpecialty}
                      onChange={(e) => setNewAstroSpecialty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-900"
                    >
                      <option value="Vedic Astrology">Vedic Astrology</option>
                      <option value="Tarot & Intuitive">Tarot &amp; Intuitive</option>
                      <option value="Western Astrology">Western Astrology</option>
                      <option value="Numerology & Kundli">Numerology &amp; Kundli</option>
                      <option value="Psychic Reading">Psychic Reading</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Per-Minute Rate (£)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={newAstroRate}
                      onChange={(e) => setNewAstroRate(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Max Concurrent Chats</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newAstroMaxChats}
                      onChange={(e) => setNewAstroMaxChats(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Working Hours / Shift</label>
                    <input
                      type="text"
                      value={newAstroHours}
                      onChange={(e) => setNewAstroHours(e.target.value)}
                      placeholder="10:00 AM - 07:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Astrologer Bio</label>
                  <textarea
                    rows={2}
                    value={newAstroBio}
                    onChange={(e) => setNewAstroBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all"
                >
                  CREATE ACCOUNT &bull; GENERATE ASTROLOGER ID
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 3: ADJUST PRICING MODAL (SECTION 16) */}
      {/* ================================================================ */}
      {pricingModalOpen && editingPriceReader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Adjust Consultation Pricing</h3>
              <button onClick={() => setPricingModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Update per-minute reading rate for <strong>{editingPriceReader.name}</strong> ({editingPriceReader.astroId}).
            </p>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">New Chat Rate (£/min)</label>
              <input
                type="number"
                step="0.05"
                value={newPriceRate}
                onChange={(e) => setNewPriceRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePricing}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs cursor-pointer"
              >
                Save Rate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 4: ADD SHOP PRODUCT (SECTION 20 & 21) */}
      {/* ================================================================ */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Add Product to Lumysic Shop</h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Product Name *</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Natural Raw Citrine Abundance Cluster"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="Crystals">Crystals</option>
                    <option value="Tarot">Tarot</option>
                    <option value="Spiritual Items">Spiritual Items</option>
                    <option value="Healing Products">Healing Products</option>
                    <option value="Books">Books</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (£)</label>
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Stock Count</label>
                <input
                  type="number"
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                if (!newProductName.trim()) return;
                await fetch('/api/shop/products', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: newProductName,
                    category: newProductCategory,
                    priceGBP: newProductPrice,
                    stockCount: newProductStock,
                    description: newProductDesc,
                    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
                  })
                });
                showToast('Product added to Lumysic Shop', 'success');
                setProductModalOpen(false);
                setNewProductName('');
                fetchAllData();
              }}
              className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs cursor-pointer"
            >
              Add Product
            </button>

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 5: ADD REMEDY (SECTION 22) */}
      {/* ================================================================ */}
      {remedyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Add Consecrated Remedy</h3>
              <button onClick={() => setRemedyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Remedy Title *</label>
                <input
                  type="text"
                  value={newRemedyTitle}
                  onChange={(e) => setNewRemedyTitle(e.target.value)}
                  placeholder="e.g. Venus Harmonization Rose Quartz Grid"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newRemedyCategory}
                    onChange={(e) => setNewRemedyCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="Love">Love</option>
                    <option value="Career">Career</option>
                    <option value="Finance">Finance</option>
                    <option value="Marriage">Marriage</option>
                    <option value="Planetary">Planetary</option>
                    <option value="Spiritual">Spiritual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (£)</label>
                  <input
                    type="number"
                    value={newRemedyPrice}
                    onChange={(e) => setNewRemedyPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description &amp; Instructions</label>
                <textarea
                  rows={2}
                  value={newRemedyDesc}
                  onChange={(e) => setNewRemedyDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={async () => {
                if (!newRemedyTitle.trim()) return;
                await fetch('/api/admin/remedies', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: newRemedyTitle,
                    category: newRemedyCategory,
                    price: newRemedyPrice,
                    description: newRemedyDesc,
                    duration: '21 Days',
                    instructions: 'Meditate facing East at sunrise'
                  })
                });
                showToast('Remedy published successfully', 'success');
                setRemedyModalOpen(false);
                setNewRemedyTitle('');
                fetchAllData();
              }}
              className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xs cursor-pointer"
            >
              Publish Remedy
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
