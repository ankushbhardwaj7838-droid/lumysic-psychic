import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { READERS } from './src/data/readers';
import { ZODIAC_SIGNS } from './src/data/horoscope';
import { SACRED_RITUALS_AND_SPELLS } from './src/data/spells';
import { SHOP_PRODUCTS } from './src/data/shop';
import { 
  ConsultationSession, 
  ChatMessage, 
  AstroboardStats, 
  CustomerProfile, 
  Reader, 
  RitualSpell, 
  ShopProduct,
  ActivityLog,
  AutoAssignSettings,
  RemedyItem,
  RoutingHistoryEntry
} from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'astral_sage_db.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure data and uploads folders exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Support large image payloads (e.g. data URLs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// Download complete code zip file
app.get('/download-code', (_req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'public', 'project-code.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'astrology-website-code.zip');
  } else {
    res.status(404).send('Zip file not found');
  }
});

// Safe Firebase Config route (no secrets)
app.get('/api/firebase-config', (_req: Request, res: Response) => {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    res.json(data);
  } else {
    res.status(404).json({ error: 'Config not found' });
  }
});

// User role management store
interface UserRoleRecord {
  email: string;
  uid?: string;
  role: 'admin' | 'astrologer' | 'user';
  name?: string;
  assignedAt: string;
}

const ROLES_STORE: Record<string, UserRoleRecord> = {
  'bankush014@gmail.com': {
    email: 'bankush014@gmail.com',
    role: 'admin',
    name: 'Super Admin',
    assignedAt: new Date().toISOString()
  }
};

// Check user role
app.get('/api/auth/role', (req: Request, res: Response) => {
  const email = (req.query.email as string || '').toLowerCase().trim();
  const uid = (req.query.uid as string || '').trim();

  if (!email && !uid) {
    return res.status(400).json({ error: 'Email or UID required' });
  }

  // Super admin check
  if (email === 'bankush014@gmail.com') {
    return res.json({ role: 'admin', isAdmin: true, isAstrologer: false });
  }

  // Check stored roles
  if (email && ROLES_STORE[email]) {
    const rec = ROLES_STORE[email];
    return res.json({
      role: rec.role,
      isAdmin: rec.role === 'admin',
      isAstrologer: rec.role === 'astrologer'
    });
  }

  // Check astrologers list
  const isAstrologerEmail = READERS.some(r => 
    (r as any).email?.toLowerCase() === email ||
    email.includes('astro') ||
    email.includes('astrodashboard')
  );

  if (isAstrologerEmail) {
    return res.json({ role: 'astrologer', isAdmin: false, isAstrologer: true });
  }

  return res.json({ role: 'user', isAdmin: false, isAstrologer: false });
});

// List roles for admin
app.get('/api/admin/roles', (_req: Request, res: Response) => {
  res.json({
    roles: Object.values(ROLES_STORE),
    astrologers: READERS.map(r => ({
      id: r.id,
      name: r.name,
      email: (r as any).email || `${r.id}@astrodashboard.com`,
      role: 'astrologer'
    }))
  });
});

// Assign role
app.post('/api/admin/roles/assign', (req: Request, res: Response) => {
  const { email, role, name } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role required' });
  }
  const cleanEmail = email.toLowerCase().trim();
  ROLES_STORE[cleanEmail] = {
    email: cleanEmail,
    role,
    name: name || cleanEmail.split('@')[0],
    assignedAt: new Date().toISOString()
  };
  res.json({ success: true, record: ROLES_STORE[cleanEmail] });
});

// Gemini AI client initialization for LUMYSIC Psychic – AI Guide
let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI();
  }
} catch {
  // fallback if key not configured
}

async function generateAiPsychicReply(messages: ChatMessage[], userText: string, seekerName: string): Promise<string> {
  if (aiClient) {
    try {
      const prompt = `You are "LUMYSIC Psychic – AI Guide", a deeply intuitive, cosmic spiritual guide on the LUMYSIC platform. You are providing a 2-minute introductory live reading for ${seekerName || 'a seeker'}.
Instructions:
- Offer compassionate, spiritually attuned insight regarding love, destiny, relationship crossroads, career, or inner peace.
- Speak in a gentle, mystical, yet grounded tone.
- Keep your reply to 2-3 concise sentences (under 60 words) suitable for live chat.
- Never claim to be human; you are their intuitive AI guide.

Conversation so far:
${messages.slice(-5).map(m => `${m.senderName}: ${m.text}`).join('\n')}

Seeker: ${userText}
LUMYSIC Psychic – AI Guide:`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (e) {
      console.warn('Gemini generate fallback:', e);
    }
  }

  const intuitiveAnswers = [
    "I sense a notable shift occurring in your energetic field. The doubts you've carried regarding this connection are clearing to reveal an authentic truth.",
    "Your aura reflects a deep desire for emotional alignment. Trust that the delays you experienced in recent weeks were protecting your heart for something genuine.",
    "The celestial transits indicate a breakthrough around your purpose and career. What felt like an uphill battle is turning into your greatest teacher.",
    "I feel a sacred presence around your heart. When you release the need to control the outcome, the universe answers with unexpected warmth.",
    "Breathe gently. There is a destined encounter on your timeline that will bring the clarity you have been seeking in your quiet moments."
  ];
  return intuitiveAnswers[Math.floor(Math.random() * intuitiveAnswers.length)];
}

interface DBState {
  readers: Reader[];
  spells: RitualSpell[];
  shopProducts: ShopProduct[];
  customers: Record<string, CustomerProfile>;
  sessions: Record<string, ConsultationSession>;
  stats: AstroboardStats;
  activityLogs: ActivityLog[];
  autoAssignSettings: AutoAssignSettings;
  remedies: RemedyItem[];
}

const DEFAULT_REMEDIES: RemedyItem[] = [
  {
    id: 'rem_love_01',
    title: 'Rose Quartz Sacred Venus Alignment',
    category: 'Love',
    description: 'Consecrated crystal and Vedic mantra regimen to dissolve relationship friction, heal emotional wounds, and align Venusian frequencies.',
    benefits: ['Heals past heartbreak', 'Softens communication between partners', 'Enhances magnetic attraction'],
    howToUse: 'Place on your bedside table and meditate for 11 minutes at sunset facing East.',
    duration: '21 Days',
    instructions: 'Chant Om Shukraya Namaha 108 times daily while holding the consecrated crystal.',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 35
  },
  {
    id: 'rem_career_02',
    title: 'Pyrite & Sun Yantra Career Catalyst',
    category: 'Career',
    description: 'High-vibrational pyrite cluster empowered with Aditya Hridaya Stotram for promotion breakthroughs, business authority, and leadership recognition.',
    benefits: ['Attracts senior executive notice', 'Dissolves professional stagnation', 'Sharpens decision-making authority'],
    howToUse: 'Keep on your work desk facing North-East.',
    duration: '40 Days',
    instructions: 'Cleanse with sandalwood smoke each Sunday morning.',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 45
  },
  {
    id: 'rem_wealth_03',
    title: 'Kubera Lakshmi Emerald Abundance Grid',
    category: 'Finance',
    description: 'Vedic geometrical yantra infused with green aventurine and cloves to attract sustained liquidity and block sudden financial leaks.',
    benefits: ['Multiplies incoming revenue streams', 'Stabilizes long-term investments', 'Protects against debt accumulation'],
    howToUse: 'Position inside your cash box or financial documents folder.',
    duration: 'Ongoing',
    instructions: 'Offer fresh yellow flowers every Friday evening.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 55
  },
  {
    id: 'rem_planetary_04',
    title: 'Shani Shanti Saturn Transit Harmonizer',
    category: 'Planetary',
    description: 'Sacred iron horseshoe ring and blue sapphire substitute consecrated on Saturday night to soothe Saturn Sade Sati transits.',
    benefits: ['Reduces mental burden and delay', 'Transforms discipline into rewards', 'Prevents unexpected hurdles'],
    howToUse: 'Wear on middle finger of right hand on Saturday morning.',
    duration: '1 Year',
    instructions: 'Light a sesame oil lamp beneath a peepal tree once weekly.',
    imageUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: false,
    price: 40
  },
  {
    id: 'rem_spiritual_05',
    title: 'Black Obsidian Aura Shield & Cord Cutting',
    category: 'Spiritual',
    description: 'Potent energetic barrier that neutralizes evil eye, psychic heaviness, and unhelpful cords from past relationships.',
    benefits: ['Prevents energy vampirism', 'Clears heavy night dreams', 'Restores authentic personal boundaries'],
    howToUse: 'Carry in your left pocket or place beneath pillow.',
    duration: '14 Days',
    instructions: 'Rinse with sea-salt water during every full moon cycle.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    price: 30
  }
];

// In-memory state with persistence
let db: DBState = {
  readers: READERS.map((r, idx) => ({
    ...r,
    isActive: true,
    isChatEnabled: true,
    isCallEnabled: true,
    status: r.isOnline ? 'online' : 'offline',
    astroId: r.astroId || `LYS-${10000 + idx + 1}`,
    email: r.email || `${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@lumysic.com`,
    phone: r.phone || (idx === 0 ? '+91 9876543210' : undefined),
    isPhoneLoginEnabled: Boolean(r.phone || idx === 0),
    mustSetPassword: r.mustSetPassword !== undefined ? r.mustSetPassword : true,
    shift: r.shift || '10:00AM - 7:00PM'
  })),
  spells: SACRED_RITUALS_AND_SPELLS.map(s => ({
    ...s,
    isActive: true,
    status: 'active'
  })),
  shopProducts: SHOP_PRODUCTS.map(p => ({
    ...p,
    isActive: true,
    status: 'active'
  })),
  customers: {},
  sessions: {},
  stats: {
    activeChats: 0,
    waitingChats: 0,
    todaysChats: 8,
    completedChats: 142,
    onlineReaders: 18,
    todaysEarnings: 284.50,
    weeklyEarnings: 1940.00,
    monthlyEarnings: 8250.00
  },
  activityLogs: [
    {
      id: 'log_init_1',
      action: 'Forwarded Chat #09gu to Tarot Devendra',
      admin: 'Super Admin',
      date: '2026-10-08',
      time: '10:15 AM',
      target: 'Chat sess_1791307767324_09gu',
      previousValue: 'Psychic Gabrielle',
      newValue: 'Tarot Devendra'
    },
    {
      id: 'log_init_2',
      action: 'Updated global chat price',
      admin: 'Finance Admin',
      date: '2026-10-08',
      time: '09:30 AM',
      target: 'Global Pricing',
      previousValue: '£1.25/min',
      newValue: '£1.50/min'
    },
    {
      id: 'log_init_3',
      action: 'Enabled Auto-Assignment Engine',
      admin: 'Super Admin',
      date: '2026-10-08',
      time: '09:00 AM',
      target: 'Chat Routing Engine',
      previousValue: 'OFF',
      newValue: 'ON (Max 3 chats)'
    },
    {
      id: 'log_init_4',
      action: 'Created Astrologer Profile LYS-10018',
      admin: 'Operations Admin',
      date: '2026-10-07',
      time: '04:45 PM',
      target: 'Astrologer Accounts',
      previousValue: '17 Astrologers',
      newValue: '18 Astrologers'
    }
  ],
  autoAssignSettings: {
    enabled: true,
    maxChatsPerAstrologer: 3,
    idlePriority: true,
    escalationTimeoutMinutes: 2,
    specializationMatching: true,
    onlineOnly: true,
    fallbackAstrologerId: 'tarot-devendra'
  },
  remedies: DEFAULT_REMEDIES
};

// Load saved DB state if available
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.sessions) {
      db.sessions = parsed.sessions;
    }
    if (parsed.customers) {
      db.customers = parsed.customers;
    }
    if (parsed.readers && Array.isArray(parsed.readers) && parsed.readers.length > 0) {
      const parsedMap = new Map(parsed.readers.map((r: any) => [r.id, r]));
      db.readers = READERS.map(r => {
        const saved: any = parsedMap.get(r.id);
        return {
          ...r,
          isActive: saved?.isActive !== undefined ? saved.isActive : true,
          isChatEnabled: saved?.isChatEnabled !== undefined ? saved.isChatEnabled : true,
          isCallEnabled: saved?.isCallEnabled !== undefined ? saved.isCallEnabled : true,
          status: saved?.status || (r.isOnline ? 'online' : 'offline')
        };
      });
    }
    if (parsed.spells && Array.isArray(parsed.spells) && parsed.spells.length > 0) {
      const existingIds = new Set(parsed.spells.map((s: any) => s.id));
      const newDefaults = SACRED_RITUALS_AND_SPELLS.filter(s => !existingIds.has(s.id)).map(s => ({
        ...s,
        isActive: true,
        status: 'active'
      }));
      db.spells = [...parsed.spells, ...newDefaults];
    }
    if (parsed.shopProducts && Array.isArray(parsed.shopProducts) && parsed.shopProducts.length > 0) {
      const existingProdIds = new Set(parsed.shopProducts.map((p: any) => p.id));
      const newProds = SHOP_PRODUCTS.filter(p => !existingProdIds.has(p.id)).map(p => ({
        ...p,
        isActive: true,
        status: 'active'
      }));
      db.shopProducts = [...parsed.shopProducts, ...newProds].map(p => {
        const found = SHOP_PRODUCTS.find(sp => sp.id === p.id);
        return {
          ...p,
          priceINR: p.priceINR || found?.priceINR || Math.round((p.priceGBP || 25) * 30),
          originalPriceINR: p.originalPriceINR || found?.originalPriceINR || (p.originalPriceGBP ? Math.round(p.originalPriceGBP * 30) : undefined),
          purpose: p.purpose || found?.purpose || 'Wealth'
        };
      });
    } else {
      db.shopProducts = SHOP_PRODUCTS.map(p => ({
        ...p,
        isActive: true,
        status: 'active'
      }));
    }
    if (parsed.stats) {
      db.stats = { ...db.stats, ...parsed.stats };
    }
  }
  saveDB();
} catch (err) {
  console.error('Error loading DB file:', err);
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// Recalculate stats
function updateStats() {
  const allSessions = Object.values(db.sessions);
  const active = allSessions.filter(s => s.status === 'active').length;
  const waiting = allSessions.filter(s => s.status === 'waiting').length;
  const online = db.readers.filter(r => r.isOnline).length;
  db.stats.activeChats = active;
  db.stats.waitingChats = waiting;
  db.stats.onlineReaders = online;
}

// SSE Clients for real-time synchronization
type SSEClient = {
  id: string;
  res: Response;
};

let sseClients: SSEClient[] = [];

function broadcast(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // client dropped
    }
  });
}

// Session timer tick interval (every 1 second)
setInterval(() => {
  let changed = false;
  const now = new Date();

  Object.values(db.sessions).forEach(session => {
    if (session.status === 'active' && session.acceptedAt) {
      session.totalDurationSeconds += 1;
      
      // Calculate remaining free seconds
      if (session.isFreeConsultation) {
        if (session.freeSecondsRemaining > 0) {
          session.freeSecondsRemaining -= 1;
          if (session.freeSecondsRemaining === 0) {
            // Free period expired!
            session.paymentStatus = 'pending_topup';
            // System operational message only
            const sysMsg: ChatMessage = {
              id: 'sys_' + Date.now(),
              sessionId: session.id,
              sender: 'system',
              senderName: 'LUMYSIC System',
              text: 'Your complimentary introductory free chat has concluded. Regular reader pricing (£' + session.ratePerMinute.toFixed(2) + '/min) now applies.',
              timestamp: now.toISOString(),
              isSystemNotice: true
            };
            session.messages.push(sysMsg);
            broadcast('message_received', { sessionId: session.id, message: sysMsg });
          }
          changed = true;
        } else {
          // Paid session increment
          session.paidSeconds += 1;
          if (session.paidSeconds % 60 === 0) {
            db.stats.todaysEarnings += session.ratePerMinute;
            db.stats.weeklyEarnings += session.ratePerMinute;
            db.stats.monthlyEarnings += session.ratePerMinute;
          }
          changed = true;
        }
      } else {
        session.paidSeconds += 1;
        if (session.paidSeconds % 60 === 0) {
          db.stats.todaysEarnings += session.ratePerMinute;
          db.stats.weeklyEarnings += session.ratePerMinute;
          db.stats.monthlyEarnings += session.ratePerMinute;
        }
        changed = true;
      }
    }
  });

  if (changed) {
    saveDB();
    broadcast('timer_tick', {
      sessions: Object.values(db.sessions).map(s => ({
        id: s.id,
        status: s.status,
        freeSecondsRemaining: s.freeSecondsRemaining,
        totalDurationSeconds: s.totalDurationSeconds,
        paidSeconds: s.paidSeconds,
        paymentStatus: s.paymentStatus
      }))
    });
  }
}, 1000);

// API: SSE Stream
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// API: IP & Country Detection
app.get('/api/geo', (req: Request, res: Response) => {
  const cfCountry = (req.headers['cf-ipcountry'] as string) || '';
  const gcpCountry = (req.headers['x-appengine-country'] as string) || '';
  const xCountry = (req.headers['x-country-code'] as string) || '';
  const forwardedFor = (req.headers['x-forwarded-for'] as string) || '';
  const clientIp = forwardedFor.split(',')[0].trim() || req.socket.remoteAddress || '';
  const country = (cfCountry || gcpCountry || xCountry || '').toUpperCase();
  
  let currency = 'USD';
  let dialCode = '+1';
  let flag = '🇺🇸';

  if (country === 'GB') {
    currency = 'GBP'; dialCode = '+44'; flag = '🇬🇧';
  } else if (country === 'AE') {
    currency = 'AED'; dialCode = '+971'; flag = '🇦🇪';
  } else if (country === 'IN') {
    currency = 'INR'; dialCode = '+91'; flag = '🇮🇳';
  } else if (country === 'CA') {
    currency = 'CAD'; dialCode = '+1'; flag = '🇨🇦';
  } else if (country === 'AU') {
    currency = 'AUD'; dialCode = '+61'; flag = '🇦🇺';
  } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'IE'].includes(country)) {
    currency = 'EUR'; dialCode = '+49'; flag = '🇪🇺';
  }

  res.json({
    ip: clientIp,
    country: country || null,
    currency,
    dialCode,
    flag
  });
});

// API: Readers list (with optional ?all=true for Admin)
app.get('/api/readers', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const readers = showAll ? db.readers : db.readers.filter(r => r.isActive !== false);
  res.json({ readers });
});

// API: Create new reader
app.post('/api/readers', (req: Request, res: Response) => {
  const body = req.body;
  const name = body.name || 'New Reader';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AS';

  const expYears = Number(body.experience_years) || Number(body.experienceYears) || 10;
  const avatarUrl = body.image_url || body.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
  const cat = body.category === 'Psychic' || body.category === 'Psychic & Intuitive' ? 'Psychic & Intuitive' : 'Tarot';
  const primarySpec = cat === 'Tarot' ? 'Tarot' : 'Psychic';

  const newReader: Reader = {
    id: body.id || `reader-${Date.now()}`,
    name,
    title: body.title || 'Master Psychic & Tarot Guide',
    category: cat,
    image_url: avatarUrl,
    avatar: avatarUrl,
    experience_years: expYears,
    experienceYears: expYears,
    initials,
    rating: Number(body.rating) || 4.96,
    reviewCount: Number(body.reviewCount) || 24,
    ratePerMinute: Number(body.ratePerMinute) || 2.50,
    location: body.location || 'London, UK',
    isOnline: body.isOnline !== undefined ? Boolean(body.isOnline) : true,
    status: body.status || 'online',
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    isChatEnabled: body.isChatEnabled !== undefined ? Boolean(body.isChatEnabled) : true,
    isCallEnabled: body.isCallEnabled !== undefined ? Boolean(body.isCallEnabled) : false,
    specialties: [primarySpec],
    specialities: [primarySpec],
    bio: body.bio || 'Compassionate and intuitive spiritual guide providing clarity on love, destiny, and cosmic timing.',
    methods: Array.isArray(body.methods) ? body.methods : ['Tarot', 'Astrology', 'Clairvoyance'],
    languages: Array.isArray(body.languages) ? body.languages : ['English'],
    quote: body.quote || 'The stars illuminate your destiny; your heart makes the choice.',
    astroId: body.astroId || `ASTRO-${Math.floor(1000 + Math.random() * 9000)}`,
    email: body.email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@astrodashboard.com`,
    phone: body.phone && body.phone.trim().length > 0 ? body.phone.trim() : undefined,
    isPhoneLoginEnabled: Boolean(body.phone && body.phone.trim().length > 0),
    password: body.password || undefined,
    tempPassword: body.tempPassword || undefined,
    mustSetPassword: body.mustSetPassword !== undefined ? Boolean(body.mustSetPassword) : true,
    shift: body.shift || '10:00AM - 7:00PM'
  };

  db.readers.unshift(newReader);
  updateStats();
  saveDB();
  broadcast('reader_created', newReader);
  res.status(201).json({ success: true, reader: newReader });
});

// API: Edit reader
app.put('/api/readers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.readers.findIndex(r => r.id === id || r.astroId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reader not found' });
  }

  const existing = db.readers[index];
  const body = req.body;
  const hasPhone = body.phone !== undefined ? Boolean(body.phone && body.phone.trim().length > 0) : existing.isPhoneLoginEnabled;
  
  const updated: Reader = {
    ...existing,
    ...body,
    id: existing.id,
    isPhoneLoginEnabled: hasPhone
  };

  db.readers[index] = updated;
  updateStats();
  saveDB();
  broadcast('reader_updated', updated);
  res.json({ success: true, reader: updated });
});

// API: Astrologer Login (/api/astrologer/login)
app.post('/api/astrologer/login', (req: Request, res: Response) => {
  const { loginMethod, email, phone, password, astroId } = req.body;
  let reader: Reader | undefined;

  if (loginMethod === 'phone') {
    if (!phone) {
      return res.status(400).json({ error: 'Please enter your registered mobile phone number.' });
    }
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    reader = db.readers.find(r => r.phone && r.phone.replace(/[\s\-\(\)\+]/g, '') === cleanPhone);

    if (!reader) {
      return res.status(401).json({ 
        error: 'No Astrologer account registered with this phone number. Phone login is only enabled if an admin entered your phone number.' 
      });
    }

    if (!reader.isPhoneLoginEnabled) {
      return res.status(403).json({
        error: 'Mobile phone login is not enabled for this Astro ID. Please log in using your registered Email ID and password.'
      });
    }
  } else {
    // Email or Astro ID login
    const identifier = (email || astroId || '').trim().toLowerCase();
    if (!identifier) {
      return res.status(400).json({ error: 'Please enter your registered email address or Astro ID.' });
    }

    reader = db.readers.find(r => 
      (r.email && r.email.toLowerCase() === identifier) || 
      (r.astroId && r.astroId.toLowerCase() === identifier) ||
      (r.id && r.id.toLowerCase() === identifier)
    );

    if (!reader) {
      return res.status(401).json({ error: 'No Astrologer found with this Email ID or Astro ID.' });
    }
  }

  // Check if first-time password creation is required
  if (reader.mustSetPassword) {
    return res.json({
      success: true,
      requiresPasswordSetup: true,
      reader,
      message: 'First time login. Please create your new private password.'
    });
  }

  // Verify password if one was set
  if (reader.password && password && reader.password !== password && reader.tempPassword !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
  }

  res.json({
    success: true,
    requiresPasswordSetup: false,
    reader,
    message: 'Astrologer login successful'
  });
});

// API: Astrologer Set Password (/api/astrologer/set-password)
app.post('/api/astrologer/set-password', (req: Request, res: Response) => {
  const { readerId, astroId, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  const reader = db.readers.find(r => r.id === readerId || r.astroId === astroId);
  if (!reader) {
    return res.status(404).json({ error: 'Astrologer account not found.' });
  }

  reader.password = newPassword;
  reader.tempPassword = undefined;
  reader.mustSetPassword = false;
  saveDB();
  broadcast('reader_updated', reader);

  res.json({
    success: true,
    reader,
    message: 'Your new password has been set successfully! You can now use this password for all future logins.'
  });
});

// API: Delete reader
app.delete('/api/readers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = db.readers.some(r => r.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Reader not found' });
  }

  db.readers = db.readers.filter(r => r.id !== id);
  updateStats();
  saveDB();
  broadcast('reader_deleted', { id });
  res.json({ success: true, message: 'Reader deleted successfully' });
});

// API: Quick toggle reader controls (Active, Chat On/Off, Call On/Off, Status)
app.patch('/api/readers/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { field, value } = req.body;
  const reader = db.readers.find(r => r.id === id);
  if (!reader) return res.status(404).json({ error: 'Reader not found' });

  if (field === 'isActive') reader.isActive = Boolean(value);
  if (field === 'isChatEnabled') reader.isChatEnabled = Boolean(value);
  if (field === 'isCallEnabled') reader.isCallEnabled = Boolean(value);
  if (field === 'isOnline') {
    reader.isOnline = Boolean(value);
    reader.status = reader.isOnline ? 'online' : 'offline';
  }
  if (field === 'status') {
    reader.status = value;
    reader.isOnline = value === 'online';
  }

  updateStats();
  saveDB();
  broadcast('reader_updated', reader);
  res.json({ success: true, reader });
});

// API: Toggle reader online status (legacy Astroboard control)
app.put('/api/readers/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isOnline } = req.body;
  const reader = db.readers.find(r => r.id === id);
  if (!reader) {
    return res.status(404).json({ error: 'Reader not found' });
  }

  reader.isOnline = Boolean(isOnline);
  reader.status = reader.isOnline ? 'online' : 'offline';
  updateStats();
  saveDB();
  broadcast('reader_updated', reader);
  res.json({ success: true, reader });
});

// ==========================================
// SPELLS & RITUALS E-COMMERCE API
// ==========================================
app.get('/api/spells', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const spells = showAll 
    ? db.spells 
    : db.spells.filter(s => s.isActive !== false && s.status !== 'paused' && s.status !== 'inactive');
  res.json({ spells });
});

app.post('/api/spells', (req: Request, res: Response) => {
  const body = req.body;
  const newSpell: RitualSpell = {
    id: body.id || `spell-${Date.now()}`,
    name: body.name || 'Sacred Altar Ceremony',
    category: body.category || 'love',
    originalPrice: Number(body.originalPrice) || 85,
    discountPrice: Number(body.discountPrice) || 45,
    imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    description: body.description || 'Consecrated planetary ceremony performed under auspicious astrological transits.',
    castDuration: body.castDuration || '24-48 Hours',
    includes: Array.isArray(body.includes) ? body.includes : (body.includes ? body.includes.split('\n').filter(Boolean) : [
      'Consecrated rose-wax altar candle casting',
      'Personalized telepathic invocation & prayer',
      'Photographic proof of your personal altar ceremony',
      'Written energy diagnosis report'
    ]),
    practitionerName: body.practitionerName || 'Lady Genevieve Moore',
    practitionerRole: body.practitionerRole || 'Sanctuary Elder & Priestess',
    rating: Number(body.rating) || 4.97,
    reviewsCount: Number(body.reviewsCount) || 12,
    badge: body.badge || undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    status: body.status || 'active'
  };

  db.spells.unshift(newSpell);
  saveDB();
  broadcast('spell_created', newSpell);
  res.status(201).json({ success: true, spell: newSpell });
});

app.put('/api/spells/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.spells.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Spell not found' });

  const existing = db.spells[index];
  const body = req.body;
  const updated: RitualSpell = {
    ...existing,
    ...body,
    id: existing.id
  };

  db.spells[index] = updated;
  saveDB();
  broadcast('spell_updated', updated);
  res.json({ success: true, spell: updated });
});

app.delete('/api/spells/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = db.spells.some(s => s.id === id);
  if (!exists) return res.status(404).json({ error: 'Spell not found' });

  db.spells = db.spells.filter(s => s.id !== id);
  saveDB();
  broadcast('spell_deleted', { id });
  res.json({ success: true, message: 'Spell deleted' });
});

app.patch('/api/spells/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, isActive } = req.body;
  const spell = db.spells.find(s => s.id === id);
  if (!spell) return res.status(404).json({ error: 'Spell not found' });

  if (status) {
    spell.status = status;
    spell.isActive = status === 'active';
  } else if (isActive !== undefined) {
    spell.isActive = Boolean(isActive);
    spell.status = spell.isActive ? 'active' : 'paused';
  }

  saveDB();
  broadcast('spell_updated', spell);
  res.json({ success: true, spell });
});

// ==========================================
// ASTRAL SHOP E-COMMERCE API
// ==========================================
app.get('/api/shop-products', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const products = showAll 
    ? db.shopProducts 
    : db.shopProducts.filter(p => p.isActive !== false && p.status !== 'paused' && p.status !== 'inactive');
  res.json({ products });
});

app.post('/api/shop-products', (req: Request, res: Response) => {
  const body = req.body;
  const newProduct: ShopProduct = {
    id: body.id || `prod-${Date.now()}`,
    name: body.name || 'Consecrated Altar Crystal',
    category: body.category || 'crystals',
    priceGBP: Number(body.priceGBP) || 28,
    originalPriceGBP: body.originalPriceGBP ? Number(body.originalPriceGBP) : undefined,
    priceINR: body.priceINR ? Number(body.priceINR) : Math.round((Number(body.priceGBP) || 28) * 30),
    originalPriceINR: body.originalPriceINR ? Number(body.originalPriceINR) : (body.originalPriceGBP ? Math.round(Number(body.originalPriceGBP) * 30) : undefined),
    purpose: body.purpose || 'Wealth',
    rating: Number(body.rating) || 5.0,
    reviewCount: Number(body.reviewCount) || 0,
    consecratedBy: body.consecratedBy || 'Sanctuary Elder',
    description: body.description || 'Authentic hand-consecrated artifact charged under celestial transits.',
    inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    image: body.image || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    badge: body.badge || undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    status: body.status || 'active',
    stockQuantity: Number(body.stockQuantity) || 25
  };

  db.shopProducts.unshift(newProduct);
  saveDB();
  broadcast('shop_product_created', newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/shop-products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.shopProducts.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const existing = db.shopProducts[index];
  const body = req.body;
  const updated: ShopProduct = {
    ...existing,
    ...body,
    id: existing.id
  };

  db.shopProducts[index] = updated;
  saveDB();
  broadcast('shop_product_updated', updated);
  res.json({ success: true, product: updated });
});

app.delete('/api/shop-products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const exists = db.shopProducts.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: 'Product not found' });

  db.shopProducts = db.shopProducts.filter(p => p.id !== id);
  saveDB();
  broadcast('shop_product_deleted', { id });
  res.json({ success: true, message: 'Product deleted' });
});

app.patch('/api/shop-products/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, isActive, inStock } = req.body;
  const product = db.shopProducts.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (status) {
    product.status = status;
    product.isActive = status === 'active';
  } else if (isActive !== undefined) {
    product.isActive = Boolean(isActive);
    product.status = product.isActive ? 'active' : 'paused';
  }
  if (inStock !== undefined) {
    product.inStock = Boolean(inStock);
  }

  saveDB();
  broadcast('shop_product_updated', product);
  res.json({ success: true, product });
});

// API: Image Upload handler (Base64 file upload or URL)
app.post('/api/upload-image', (req: Request, res: Response) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    if (dataUrl.startsWith('data:image/')) {
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const safeName = (filename || 'upload').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const fname = `${safeName}-${Date.now()}.${ext}`;
        const targetPath = path.join(UPLOADS_DIR, fname);
        fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
        const publicUrl = `/uploads/${fname}`;
        return res.json({ success: true, url: publicUrl });
      }
    }
    res.json({ success: true, url: dataUrl });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to process image upload' });
  }
});

// API: Daily Horoscope
app.get('/api/horoscope', (_req: Request, res: Response) => {
  res.json({ signs: ZODIAC_SIGNS });
});

// API: Customer Profile
app.get('/api/customer/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const profile = db.customers[id] || {
    id,
    name: '',
    isFirstTimeUser: true,
    freeMinutesUsed: false,
    totalConsultations: 0
  };
  res.json({ customer: profile });
});

app.post('/api/customer/save', (req: Request, res: Response) => {
  const { id, name, birthDetails } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing customer ID' });

  if (!db.customers[id]) {
    db.customers[id] = {
      id,
      name: name || birthDetails?.name || 'Guest Seeker',
      birthDetails,
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };
  } else {
    if (name) db.customers[id].name = name;
    if (birthDetails) db.customers[id].birthDetails = birthDetails;
  }
  saveDB();
  res.json({ customer: db.customers[id] });
});

// API: Create new consultation session
app.post('/api/sessions/create', (req: Request, res: Response) => {
  const { 
    customerId, 
    customerName, 
    firstName,
    readingType, 
    topic, 
    initialQuestion, 
    birthDetails, 
    requestedReaderId 
  } = req.body;

  if (!requestedReaderId) {
    return res.status(400).json({ error: 'Please choose a reader' });
  }

  const requestedReader = db.readers.find(r => r.id === requestedReaderId || r.astroId === requestedReaderId) || db.readers[0];

  // Check or register customer
  let cust = db.customers[customerId];
  const effectiveName = firstName || customerName || birthDetails?.name || 'Valued Seeker';
  if (!cust) {
    cust = {
      id: customerId || 'cust_' + Date.now(),
      name: effectiveName,
      birthDetails,
      isFirstTimeUser: true,
      freeMinutesUsed: false,
      totalConsultations: 0
    };
    db.customers[cust.id] = cust;
  } else {
    if (effectiveName) cust.name = effectiveName;
    if (birthDetails) cust.birthDetails = birthDetails;
  }

  const isEligibleForFree = !cust.freeMinutesUsed;
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = Date.now();

  const userName = birthDetails?.name || firstName || cust.name || 'Seeker';
  const userGender = birthDetails?.gender || 'Not specified';
  const userDob = birthDetails?.dob || 'Not specified';
  const userTob = birthDetails?.unknownTime 
    ? 'Not known' 
    : (birthDetails?.birthTime ? `${birthDetails.birthTime} ${birthDetails.amPm || ''}`.trim() : 'Not specified');
  const userPob = birthDetails?.placeOfBirth || 'Not specified';

  const userDetailsCard = `Hi,\nBelow are my details:\nName: ${userName}\nGender: ${userGender}\nDOB: ${userDob}\nTOB: ${userTob}\nPOB: ${userPob}`;

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg_details_' + now,
      sessionId,
      sender: 'customer',
      senderName: userName,
      text: userDetailsCard,
      timestamp: new Date(now).toISOString()
    },
    {
      id: 'msg_welcome_' + (now + 100),
      sessionId,
      sender: 'astrologer',
      senderName: requestedReader.name,
      text: 'Welcome to LUMYSIC!',
      timestamp: new Date(now + 100).toISOString()
    },
    {
      id: 'msg_join_notice_' + (now + 200),
      sessionId,
      sender: 'astrologer',
      senderName: requestedReader.name,
      text: `${requestedReader.specialties?.[0] || 'Psychic'} will join within 10 seconds.`,
      timestamp: new Date(now + 200).toISOString()
    },
    {
      id: 'msg_share_q_' + (now + 300),
      sessionId,
      sender: 'astrologer',
      senderName: requestedReader.name,
      text: 'Please share your question in the meanwhile.',
      timestamp: new Date(now + 300).toISOString()
    },
    {
      id: 'msg_joined_' + (now + 400),
      sessionId,
      sender: 'astrologer',
      senderName: requestedReader.name,
      text: `${requestedReader.specialties?.[0] || 'Psychic'} has joined.`,
      timestamp: new Date(now + 400).toISOString()
    },
    {
      id: 'msg_banner_' + (now + 500),
      sessionId,
      sender: 'system',
      senderName: 'System Notice',
      text: 'This is an automated message to confirm that chat has started.',
      timestamp: new Date(now + 500).toISOString(),
      isBanner: true,
      isSystemNotice: true
    },
    {
      id: 'msg_greet_' + (now + 600),
      sessionId,
      sender: 'astrologer',
      senderName: requestedReader.name,
      text: `Hi ${userName}`,
      timestamp: new Date(now + 600).toISOString()
    },
    {
      id: 'msg_tarot_card_' + (now + 700),
      sessionId,
      sender: 'astrologer',
      senderName: requestedReader.name,
      text: 'The Moon – Key XVIII (Illumination, Intuition & Deeper Truths)',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date(now + 700).toISOString()
    }
  ];

  if (initialQuestion && initialQuestion.trim() && !initialQuestion.includes('Hello')) {
    initialMessages.push({
      id: 'msg_init_' + (now + 800),
      sessionId,
      sender: 'customer',
      senderName: cust.name,
      text: initialQuestion.trim(),
      timestamp: new Date(now + 800).toISOString()
    });
  }

  const session: ConsultationSession = {
    id: sessionId,
    customerId: cust.id,
    customerName: cust.name,
    readingType: readingType || 'General Consultation',
    topic: topic || 'Guidance',
    initialQuestion: initialQuestion ? initialQuestion.trim() : undefined,
    birthDetails: birthDetails || cust.birthDetails,
    requestedReaderId: requestedReader.id,
    requestedReaderName: requestedReader.name,
    requestedAstroId: requestedReader.astroId || requestedReader.id,
    assignedReaderId: requestedReader.id, // initially requested reader
    assignedReaderName: requestedReader.name,
    assignedAstroId: requestedReader.astroId || requestedReader.id,
    status: 'waiting', // WAITING until reader/operator accepts
    isFreeConsultation: isEligibleForFree,
    freeSecondsRemaining: isEligibleForFree ? 120 : 0, // 2 minutes free chat
    totalDurationSeconds: 0,
    paidSeconds: 0,
    ratePerMinute: requestedReader.ratePerMinute,
    createdAt: new Date().toISOString(),
    messages: initialMessages,
    paymentStatus: isEligibleForFree ? 'free_tier' : 'paid_active'
  };

  db.sessions[sessionId] = session;
  db.stats.todaysChats += 1;
  updateStats();
  saveDB();

  // Notify Astroboard in real-time
  broadcast('new_session', session);

  res.json({ session });
});

// API: Get session by ID
app.get('/api/sessions/:id', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ session });
});

// API: Check user free chat eligibility (Strict server-side source of truth)
app.get('/api/user/eligibility/:id', (req: Request, res: Response) => {
  const cust = db.customers[req.params.id];
  if (!cust) {
    return res.json({ free_chat_eligible: true, free_chat_used: false, remainingSeconds: 120 });
  }
  if (cust.free_chat_used) {
    return res.json({ free_chat_eligible: false, free_chat_used: true, remainingSeconds: 0 });
  }
  if (cust.free_chat_started_at) {
    const elapsed = Math.floor((Date.now() - new Date(cust.free_chat_started_at).getTime()) / 1000);
    const remaining = Math.max(0, 120 - elapsed);
    if (remaining === 0) {
      cust.free_chat_used = true;
      cust.free_chat_eligible = false;
      saveDB();
    }
    return res.json({
      free_chat_eligible: remaining > 0,
      free_chat_used: remaining === 0,
      remainingSeconds: remaining
    });
  }
  res.json({
    free_chat_eligible: cust.free_chat_eligible !== false,
    free_chat_used: Boolean(cust.free_chat_used),
    remainingSeconds: 120
  });
});

// API: Start First-Time 2-Minute Free Chat with LUMYSIC Psychic – AI Guide
app.post('/api/user/free-chat/start', (req: Request, res: Response) => {
  const { customerId, customerName, targetHumanReaderId, targetHumanReaderName, topic, question, birthDetails } = req.body;
  if (!customerId) return res.status(400).json({ error: 'customerId is required' });

  let cust = db.customers[customerId];
  if (!cust) {
    cust = {
      id: customerId,
      name: customerName || 'Seeker',
      isFirstTimeUser: false,
      freeMinutesUsed: true,
      free_chat_eligible: false,
      free_chat_used: true,
      free_chat_started_at: new Date().toISOString(),
      totalConsultations: 1
    };
    db.customers[customerId] = cust;
  } else {
    // Check strict eligibility: ONE COMPLIMENTARY SESSION EVER
    if (cust.free_chat_used) {
      return res.status(403).json({ error: 'FREE_CHAT_ALREADY_USED', eligible: false });
    }
    cust.free_chat_used = true;
    cust.free_chat_eligible = false;
    cust.free_chat_started_at = new Date().toISOString();
    cust.freeMinutesUsed = true;
    cust.isFirstTimeUser = false;
  }

  const sessionId = 'sess_free_' + Date.now();
  const now = new Date();
  const userName = customerName || cust.name || 'Seeker';

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg_ai_greet_' + Date.now(),
      sessionId,
      sender: 'astrologer',
      senderName: 'LUMYSIC Psychic – AI Guide',
      text: `Greetings, ${userName}. I am LUMYSIC Psychic, your intuitive AI cosmic guide. You have 2 complimentary minutes to explore love, career, or life direction today. What guidance do you seek?`,
      timestamp: now.toISOString(),
      isAiMessage: true
    }
  ];

  if (question && question.trim()) {
    initialMessages.push({
      id: 'msg_user_q_' + (Date.now() + 50),
      sessionId,
      sender: 'customer',
      senderName: userName,
      text: question.trim(),
      timestamp: new Date(Date.now() + 50).toISOString()
    });
  }

  const session: ConsultationSession = {
    id: sessionId,
    customerId,
    customerName: userName,
    readingType: 'Introductory AI Reading',
    topic: topic || 'Life Guidance',
    initialQuestion: question ? question.trim() : undefined,
    birthDetails: birthDetails || cust.birthDetails,
    requestedReaderId: 'astral_ai_guide',
    requestedReaderName: 'LUMYSIC Psychic – AI Guide',
    assignedReaderId: 'astral_ai_guide',
    assignedReaderName: 'LUMYSIC Psychic – AI Guide',
    status: 'active',
    isFreeConsultation: true,
    isAiSession: true,
    aiGuideName: 'LUMYSIC Psychic – AI Guide',
    targetHumanReaderId: targetHumanReaderId || undefined,
    targetHumanReaderName: targetHumanReaderName || undefined,
    freeSecondsRemaining: 120,
    totalDurationSeconds: 0,
    paidSeconds: 0,
    ratePerMinute: 0,
    createdAt: now.toISOString(),
    acceptedAt: now.toISOString(),
    startedAt: now.toISOString(),
    messages: initialMessages,
    paymentStatus: 'free_tier'
  };

  db.sessions[sessionId] = session;
  db.stats.todaysChats += 1;
  updateStats();
  saveDB();

  broadcast('new_session', session);
  res.json({ success: true, session, remainingSeconds: 120 });
});

// API: Send message to LUMYSIC Psychic – AI Guide & get responsive reply
app.post('/api/chat/ai-message', async (req: Request, res: Response) => {
  const { sessionId, text } = req.body;
  if (!sessionId || !text) return res.status(400).json({ error: 'sessionId and text required' });

  const session = db.sessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Calculate elapsed time from server startedAt
  if (session.isAiSession && session.startedAt) {
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    session.freeSecondsRemaining = Math.max(0, 120 - elapsed);
    if (session.freeSecondsRemaining <= 0) {
      session.status = 'completed';
      session.paymentStatus = 'pending_topup';
      saveDB();
      return res.status(403).json({ error: 'FREE_TIME_EXPIRED', session, expired: true });
    }
  }

  const userMsg: ChatMessage = {
    id: 'msg_u_' + Date.now(),
    sessionId,
    sender: 'customer',
    senderName: session.customerName,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };
  session.messages.push(userMsg);

  // Generate responsive AI spiritual response
  const aiText = await generateAiPsychicReply(session.messages, text.trim(), session.customerName);
  const aiMsg: ChatMessage = {
    id: 'msg_ai_' + (Date.now() + 10),
    sessionId,
    sender: 'astrologer',
    senderName: 'LUMYSIC Psychic – AI Guide',
    text: aiText,
    timestamp: new Date(Date.now() + 10).toISOString(),
    isAiMessage: true
  };
  session.messages.push(aiMsg);
  saveDB();

  broadcast('message_received', { sessionId, message: aiMsg });
  res.json({ success: true, message: aiMsg, session });
});

// API: Seamless Handover to Human Reader after recharge
app.post('/api/sessions/:id/handover-to-human', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const targetReaderId = req.body.targetReaderId || session.targetHumanReaderId;
  const targetReader = db.readers.find(r => r.id === targetReaderId) || db.readers[0];

  session.assignedReaderId = targetReader.id;
  session.assignedReaderName = targetReader.name;
  session.requestedReaderId = targetReader.id;
  session.requestedReaderName = targetReader.name;
  session.isAiSession = false;
  session.isFreeConsultation = false;
  session.paymentStatus = 'paid_active';
  session.status = 'active';

  const handoverNotice: ChatMessage = {
    id: 'sys_handover_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: `✨ Handover complete. Connected with ${targetReader.name}. Your conversation history with LUMYSIC Psychic has been provided to them.`,
    timestamp: new Date().toISOString(),
    isHandoverNotice: true,
    isSystemNotice: true
  };

  const humanGreeting: ChatMessage = {
    id: 'msg_human_greet_' + (Date.now() + 10),
    sessionId: session.id,
    sender: 'astrologer',
    senderName: targetReader.name,
    text: `Greetings, ${session.customerName}. I am ${targetReader.name}. I have reviewed your conversation with LUMYSIC Psychic, our AI guide. Let's delve deeper into your path.`,
    timestamp: new Date(Date.now() + 10).toISOString(),
    isAiMessage: false
  };

  session.messages.push(handoverNotice, humanGreeting);
  saveDB();

  broadcast('session_updated', { session });
  res.json({ success: true, session });
});

// API: Human reader/operator accepts consultation from Astroboard
// CRITICAL: The free chat timer begins ONLY NOW!
app.post('/api/sessions/:id/accept', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (session.status === 'waiting') {
    session.status = 'active';
    session.acceptedAt = new Date().toISOString();

    // Mark user free minutes as used
    if (db.customers[session.customerId]) {
      db.customers[session.customerId].freeMinutesUsed = true;
      db.customers[session.customerId].isFirstTimeUser = false;
      db.customers[session.customerId].totalConsultations += 1;
    }

    const joinNotice: ChatMessage = {
      id: 'sys_join_' + Date.now(),
      sessionId: session.id,
      sender: 'system',
      senderName: 'LUMYSIC System',
      text: `${session.requestedReaderName || session.assignedReaderName} has joined your private sanctuary consultation.`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };

    const freeStartNotice: ChatMessage = {
      id: 'sys_start_' + (Date.now() + 1),
      sessionId: session.id,
      sender: 'system',
      senderName: 'LUMYSIC System',
      text: session.isFreeConsultation 
        ? 'Your complimentary first free chat consultation has officially started. Enjoy your private reading.'
        : 'Your live consultation has commenced.',
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };

    session.messages.push(joinNotice, freeStartNotice);
    updateStats();
    saveDB();

    broadcast('session_accepted', { session, messages: [joinNotice, freeStartNotice] });
  }

  res.json({ session });
});

// API: Astroboard / Admin forwards session to any reader
app.post('/api/sessions/:id/assign', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { readerId, silent = true } = req.body;
  const newReader = db.readers.find(r => r.id === readerId);
  if (!newReader) return res.status(400).json({ error: 'Reader not found' });

  session.assignedReaderId = newReader.id;
  // Keep requestedReaderName so client always sees the reader they originally selected!
  if (!session.requestedReaderName) {
    session.requestedReaderName = session.assignedReaderName;
  }
  // Store internal routed reader name for admin
  (session as any).forwardedReaderId = newReader.id;
  (session as any).forwardedReaderName = newReader.name;

  if (!silent) {
    const reassignNotice: ChatMessage = {
      id: 'sys_reassign_' + Date.now(),
      sessionId: session.id,
      sender: 'system',
      senderName: 'LUMYSIC System',
      text: `Consultation routed to ${newReader.name}.`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };
    session.messages.push(reassignNotice);
  }

  saveDB();
  broadcast('session_updated', { session });
  res.json({ session });
});

// API: Send message (strictly human customer or human operator/reader)
app.post('/api/sessions/:id/message', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { sender, senderName, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // If session was waiting and the operator/reader replies, automatically accept it
  if (session.status === 'waiting' && sender === 'astrologer') {
    session.status = 'active';
    session.acceptedAt = new Date().toISOString();
    if (db.customers[session.customerId]) {
      db.customers[session.customerId].freeMinutesUsed = true;
      db.customers[session.customerId].isFirstTimeUser = false;
    }
    const autoJoinMsg: ChatMessage = {
      id: 'sys_join_' + Date.now(),
      sessionId: session.id,
      sender: 'system',
      senderName: 'LUMYSIC System',
      text: `${session.requestedReaderName || session.assignedReaderName} has joined your consultation.`,
      timestamp: new Date().toISOString(),
      isSystemNotice: true
    };
    session.messages.push(autoJoinMsg);
  }

  const message: ChatMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sessionId: session.id,
    sender: sender === 'astrologer' ? 'astrologer' : 'customer',
    senderName: senderName || (sender === 'astrologer' ? (session.requestedReaderName || session.assignedReaderName) : session.customerName),
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  session.messages.push(message);
  session.lastMessageText = message.text;
  session.lastMessageAt = message.timestamp;

  if (sender === 'customer') {
    session.unreadForOperator = true;
  } else {
    session.unreadForCustomer = true;
  }

  saveDB();
  broadcast('message_received', { sessionId: session.id, message, session });
  res.json({ success: true, message, session });
});

// API: Top up or continue paid session after free minutes
app.post('/api/sessions/:id/topup', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { amountMinutes = 15 } = req.body;
  const chargeAmount = amountMinutes * session.ratePerMinute;

  session.paymentStatus = 'paid_active';
  db.stats.todaysEarnings += chargeAmount;
  db.stats.weeklyEarnings += chargeAmount;
  db.stats.monthlyEarnings += chargeAmount;

  const topupNotice: ChatMessage = {
    id: 'sys_topup_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: `Paid consultation extended by ${amountMinutes} minutes (£${chargeAmount.toFixed(2)}). Your reading continues smoothly.`,
    timestamp: new Date().toISOString(),
    isSystemNotice: true
  };

  session.messages.push(topupNotice);
  saveDB();
  broadcast('session_updated', { session, notice: topupNotice });
  res.json({ success: true, session });
});

// API: Complete / End session
app.post('/api/sessions/:id/complete', (req: Request, res: Response) => {
  const session = db.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'completed';
  session.endedAt = new Date().toISOString();

  const endNotice: ChatMessage = {
    id: 'sys_end_' + Date.now(),
    sessionId: session.id,
    sender: 'system',
    senderName: 'LUMYSIC System',
    text: 'Consultation concluded. Thank you for seeking clarity with LUMYSIC.',
    timestamp: new Date().toISOString(),
    isSystemNotice: true
  };

  session.messages.push(endNotice);
  db.stats.completedChats += 1;
  updateStats();
  saveDB();

  broadcast('session_completed', { session, notice: endNotice });
  res.json({ success: true, session });
});

// API: Astroboard Stats & Sessions
app.get('/api/astroboard/stats', (_req: Request, res: Response) => {
  updateStats();
  res.json({ stats: db.stats });
});

app.get('/api/astroboard/sessions', (_req: Request, res: Response) => {
  updateStats();
  const list = Object.values(db.sessions).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  res.json({ sessions: list });
});

// ==========================================
// LUMYSIC PRODUCTION ADMIN DASHBOARD APIS
// ==========================================

// 1. Operational Overview & KPIs
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  updateStats();
  const allSessions = Object.values(db.sessions);
  const now = Date.now();

  const activeSessions = allSessions.filter(s => s.status === 'active');
  const pendingSessions = allSessions.filter(s => s.status === 'waiting');
  const unassignedSessions = allSessions.filter(s => s.status === 'waiting' && (!s.assignedReaderId || s.assignedReaderId === 'unassigned'));

  // Calculate wait times
  let totalWaitSeconds = 0;
  let maxWaitSeconds = 0;
  let longestPending: ConsultationSession | null = null;

  pendingSessions.forEach(s => {
    const createdTime = new Date(s.createdAt).getTime();
    const waitSec = Math.max(0, Math.floor((now - createdTime) / 1000));
    totalWaitSeconds += waitSec;
    if (waitSec > maxWaitSeconds) {
      maxWaitSeconds = waitSec;
      longestPending = s;
    }
  });

  const avgWaitSec = pendingSessions.length > 0 ? Math.round(totalWaitSeconds / pendingSessions.length) : 0;

  // Active astrologers & workload calculation
  const readerWorkload: Record<string, { activeChats: number; isOnline: boolean; rating: number }> = {};
  db.readers.forEach(r => {
    readerWorkload[r.id] = {
      activeChats: 0,
      isOnline: r.isOnline,
      rating: r.rating || 4.9
    };
  });
  activeSessions.forEach(s => {
    if (s.assignedReaderId && readerWorkload[s.assignedReaderId]) {
      readerWorkload[s.assignedReaderId].activeChats += 1;
    }
  });

  // Calculate alerts
  const alerts: Array<{ id: string; type: 'critical' | 'warning' | 'info'; title: string; message: string; timestamp: string }> = [];
  
  const criticalWaits = pendingSessions.filter(s => {
    const waitSec = Math.floor((now - new Date(s.createdAt).getTime()) / 1000);
    return waitSec > 300; // > 5 minutes
  });
  if (criticalWaits.length > 0) {
    alerts.push({
      id: 'alert_wait_' + now,
      type: 'critical',
      title: `${criticalWaits.length} chats waiting > 5 minutes`,
      message: 'Urgent attention required. Reassign or notify on-duty astrologers.',
      timestamp: new Date().toISOString()
    });
  }

  const overloadedAstrologers = db.readers.filter(r => (readerWorkload[r.id]?.activeChats || 0) >= (r.maxConcurrentChats || 3));
  if (overloadedAstrologers.length > 0) {
    alerts.push({
      id: 'alert_overload_' + now,
      type: 'warning',
      title: `${overloadedAstrologers.length} astrologers at peak capacity`,
      message: `${overloadedAstrologers.map(r => r.name).join(', ')} reached max concurrent chat limit.`,
      timestamp: new Date().toISOString()
    });
  }

  const lowStockProducts = db.shopProducts.filter(p => (p.stockCount !== undefined && p.stockCount <= 5));
  if (lowStockProducts.length > 0) {
    alerts.push({
      id: 'alert_stock_' + now,
      type: 'info',
      title: `${lowStockProducts.length} shop products low in stock`,
      message: `${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')} have 5 or fewer items remaining.`,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    kpis: {
      totalAstrologers: db.readers.length,
      onlineAstrologers: db.readers.filter(r => r.isOnline).length,
      offlineAstrologers: db.readers.filter(r => !r.isOnline).length,
      activeChats: activeSessions.length,
      pendingChats: pendingSessions.length,
      unassignedChats: unassignedSessions.length,
      todaysChats: db.stats.todaysChats || allSessions.length,
      todaysRevenue: db.stats.todaysEarnings || 284.50,
      averageWaitTimeSec: avgWaitSec,
      longestPendingSec: maxWaitSeconds,
      longestPendingSessionId: longestPending ? (longestPending as any).id : null,
      activeClients: Object.keys(db.customers).length || 38,
      totalProducts: db.shopProducts.length,
      totalRemedies: db.remedies.length
    },
    alerts,
    autoAssignSettings: db.autoAssignSettings,
    recentActivity: db.activityLogs.slice(0, 10),
    stats: db.stats
  });
});

// 2. Manual Chat Forwarding (CRITICAL: Client NEVER sees internal forwarding!)
app.post('/api/admin/chats/forward', (req: Request, res: Response) => {
  const { sessionId, newAstrologerId, reason = 'Manual Admin Forwarding', adminName = 'Super Admin' } = req.body;
  const session = db.sessions[sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const newReader = db.readers.find(r => r.id === newAstrologerId || r.astroId === newAstrologerId);
  if (!newReader) return res.status(404).json({ error: 'Target Astrologer not found' });

  const prevReaderId = session.assignedReaderId;
  const prevReaderName = session.assignedReaderName;

  // Update session routing properties
  session.assignedReaderId = newReader.id;
  session.assignedReaderName = newReader.name;
  session.assignedAstroId = newReader.astroId || newReader.id;
  session.assignmentType = 'MANUALLY_FORWARDED';

  if (!session.routingHistory) {
    session.routingHistory = [];
  }

  const routingRecord: RoutingHistoryEntry = {
    id: 'rh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    fromReaderId: prevReaderId,
    fromReaderName: prevReaderName,
    toReaderId: newReader.id,
    toReaderName: newReader.name,
    timestamp: new Date().toISOString(),
    forwardedBy: adminName,
    reason: reason
  };
  session.routingHistory.push(routingRecord);

  // CRITICAL REQUIREMENT 7: DO NOT expose any "Chat forwarded" message to the client!
  // The client continues seamless communication without any internal transfer notices.

  // Record in audit log
  const logEntry: ActivityLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action: `Forwarded Chat #${session.id.slice(-6)} to ${newReader.name}`,
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: `Chat ${session.id}`,
    previousValue: prevReaderName,
    newValue: newReader.name
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('session_updated', { session });
  broadcast('activity_logged', logEntry);

  res.json({ success: true, session, routingRecord, logEntry });
});

// 3. Automatic Chat Assignment Engine
app.post('/api/admin/chats/auto-assign', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const settings = db.autoAssignSettings;
  const allSessions = Object.values(db.sessions);

  // Target sessions: either single session or all pending
  const targetSessions = sessionId 
    ? [db.sessions[sessionId]].filter(Boolean)
    : allSessions.filter(s => s.status === 'waiting');

  if (targetSessions.length === 0) {
    return res.json({ success: true, message: 'No pending sessions to assign', assignedCount: 0 });
  }

  // Active chat count per astrologer
  const activeCount: Record<string, number> = {};
  db.readers.forEach(r => { activeCount[r.id] = 0; });
  allSessions.filter(s => s.status === 'active').forEach(s => {
    if (s.assignedReaderId && activeCount[s.assignedReaderId] !== undefined) {
      activeCount[s.assignedReaderId] += 1;
    }
  });

  // Eligible astrologers: online, not suspended, under maxChatsPerAstrologer limit
  const eligibleReaders = db.readers.filter(r => {
    if (settings.onlineOnly && !r.isOnline) return false;
    if (r.status === 'suspended' || r.status === 'on_break') return false;
    const currentActive = activeCount[r.id] || 0;
    const maxLimit = r.maxConcurrentChats || settings.maxChatsPerAstrologer || 3;
    return currentActive < maxLimit;
  });

  // Sort eligible astrologers by balanced distribution (fewer active chats first)
  eligibleReaders.sort((a, b) => {
    const countA = activeCount[a.id] || 0;
    const countB = activeCount[b.id] || 0;
    return countA - countB;
  });

  let assignedCount = 0;
  targetSessions.forEach(session => {
    if (eligibleReaders.length === 0) return;
    const bestReader = eligibleReaders[0];

    session.assignedReaderId = bestReader.id;
    session.assignedReaderName = bestReader.name;
    session.assignedAstroId = bestReader.astroId || bestReader.id;
    session.assignmentType = 'AUTO_ASSIGNED';

    if (!session.routingHistory) session.routingHistory = [];
    session.routingHistory.push({
      id: 'rh_auto_' + Date.now(),
      fromReaderId: 'queue',
      fromReaderName: 'Unassigned Queue',
      toReaderId: bestReader.id,
      toReaderName: bestReader.name,
      timestamp: new Date().toISOString(),
      forwardedBy: 'LUMYSIC Auto-Assign Engine',
      reason: 'Balanced workload & availability match'
    });

    activeCount[bestReader.id] = (activeCount[bestReader.id] || 0) + 1;
    assignedCount += 1;

    // Re-sort eligible pool to maintain balanced rotation
    eligibleReaders.sort((a, b) => (activeCount[a.id] || 0) - (activeCount[b.id] || 0));
  });

  saveDB();
  broadcast('sessions_batch_updated', { assignedCount });

  res.json({ success: true, assignedCount, message: `Auto-assigned ${assignedCount} chats successfully.` });
});

// 4. Auto Assignment Settings
app.get('/api/admin/auto-assign/settings', (_req: Request, res: Response) => {
  res.json({ settings: db.autoAssignSettings });
});

app.post('/api/admin/auto-assign/settings', (req: Request, res: Response) => {
  const { settings, adminName = 'Super Admin' } = req.body;
  if (settings) {
    const prev = JSON.stringify(db.autoAssignSettings);
    db.autoAssignSettings = { ...db.autoAssignSettings, ...settings };

    const logEntry: ActivityLog = {
      id: 'log_' + Date.now(),
      action: 'Updated Auto-Assignment Configuration',
      admin: adminName,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      target: 'Auto-Assign Settings',
      previousValue: prev.slice(0, 40) + '...',
      newValue: JSON.stringify(db.autoAssignSettings).slice(0, 40) + '...'
    };
    db.activityLogs.unshift(logEntry);

    saveDB();
    broadcast('settings_updated', { settings: db.autoAssignSettings });
    return res.json({ success: true, settings: db.autoAssignSettings });
  }
  res.status(400).json({ error: 'Settings object required' });
});

// 5. Create New Astrologer with auto-generated ID (e.g. LYS-10020)
app.post('/api/admin/astrologers/create', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    specialization = 'Psychic & Tarot',
    experienceYears = 8,
    languages = ['English'],
    ratePerMinute = 1.75,
    maxConcurrentChats = 3,
    workingHours = '10:00 AM - 07:00 PM',
    bio = 'Experienced intuitive astrologer committed to offering clear, compassionate guidance.',
    adminName = 'Super Admin'
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Generate unique LYS Astrologer ID
  const nextNumber = 10000 + db.readers.length + 1;
  const astroId = `LYS-${nextNumber}`;
  const newId = `astro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newReader: Reader = {
    id: newId,
    astroId,
    name,
    email,
    phone: phone || undefined,
    isPhoneLoginEnabled: Boolean(phone),
    title: `${specialization} Specialist`,
    category: 'Vedic Astrology',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    initials: name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    rating: 5.0,
    reviewCount: 0,
    experienceYears: Number(experienceYears || 8),
    experience_years: Number(experienceYears || 8),
    ratePerMinute: Number(ratePerMinute),
    location: 'London, UK',
    isOnline: true,
    status: 'online',
    isActive: true,
    isChatEnabled: true,
    isCallEnabled: true,
    specialties: [specialization],
    specialities: [specialization],
    bio,
    methods: ['Vedic Astrological Charts', 'Intuitive Insights'],
    languages: Array.isArray(languages) ? languages : [languages],
    quote: 'Cosmic clarity reveals your natural brilliance.',
    shift: workingHours,
    mustSetPassword: true,
    maxConcurrentChats: Number(maxConcurrentChats)
  };

  db.readers.unshift(newReader);
  updateStats();

  const logEntry: ActivityLog = {
    id: 'log_' + Date.now(),
    action: `Created Astrologer account ${name} (${astroId})`,
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: `Astrologer ${astroId}`,
    previousValue: 'None',
    newValue: `${name} (${email})`
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('reader_created', newReader);

  res.json({ success: true, reader: newReader, astroId, message: `Astrologer ${name} (${astroId}) created successfully.` });
});

// 6. Pricing Control (Global or Astrologer-Specific)
app.patch('/api/admin/astrologers/:id/pricing', (req: Request, res: Response) => {
  const { id } = req.params;
  const { ratePerMinute, adminName = 'Finance Admin' } = req.body;
  const reader = db.readers.find(r => r.id === id || r.astroId === id);
  if (!reader) return res.status(404).json({ error: 'Astrologer not found' });

  const prevRate = reader.ratePerMinute;
  reader.ratePerMinute = Number(ratePerMinute);

  const logEntry: ActivityLog = {
    id: 'log_' + Date.now(),
    action: `Updated pricing for ${reader.name}`,
    admin: adminName,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: reader.name,
    previousValue: `£${prevRate.toFixed(2)}/min`,
    newValue: `£${Number(ratePerMinute).toFixed(2)}/min`
  };
  db.activityLogs.unshift(logEntry);

  saveDB();
  broadcast('reader_updated', reader);

  res.json({ success: true, reader, logEntry });
});

// 7. Activity Logs API
app.get('/api/admin/activity-logs', (_req: Request, res: Response) => {
  res.json({ logs: db.activityLogs });
});

app.post('/api/admin/activity-logs', (req: Request, res: Response) => {
  const { action, admin = 'Super Admin', target, previousValue, newValue } = req.body;
  const newLog: ActivityLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    admin,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    target: target || 'System',
    previousValue,
    newValue
  };
  db.activityLogs.unshift(newLog);
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
  saveDB();
  res.json({ success: true, log: newLog });
});

// 8. Remedies CRUD API
app.get('/api/admin/remedies', (_req: Request, res: Response) => {
  res.json({ remedies: db.remedies });
});

app.post('/api/admin/remedies', (req: Request, res: Response) => {
  const { title, category, description, benefits, howToUse, duration, instructions, price, imageUrl, isFeatured } = req.body;
  const newRemedy: RemedyItem = {
    id: 'rem_' + Date.now(),
    title: title || 'Sacred Astrological Remedy',
    category: category || 'General',
    description: description || '',
    benefits: Array.isArray(benefits) ? benefits : [benefits || 'Brings celestial harmony'],
    howToUse: howToUse || 'Perform with morning sunrise meditation',
    duration: duration || '21 Days',
    instructions: instructions || 'Recite personal mantra daily',
    price: Number(price) || 29,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: Boolean(isFeatured)
  };
  db.remedies.unshift(newRemedy);
  saveDB();
  res.json({ success: true, remedy: newRemedy });
});

app.put('/api/admin/remedies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.remedies.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Remedy not found' });

  db.remedies[index] = { ...db.remedies[index], ...req.body };
  saveDB();
  res.json({ success: true, remedy: db.remedies[index] });
});

app.delete('/api/admin/remedies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.remedies = db.remedies.filter(r => r.id !== id);
  saveDB();
  res.json({ success: true, message: 'Remedy deleted successfully' });
});

// 9. Date-wise Earnings & Astrologer Work Report
app.get('/api/admin/earnings/date-wise', (req: Request, res: Response) => {
  const { date, fromDate, toDate } = req.query;
  const allSessions = Object.values(db.sessions);

  // Filter sessions by date
  const filtered = allSessions.filter(s => {
    const sDate = s.createdAt.split('T')[0];
    if (date) return sDate === date;
    if (fromDate && toDate) return sDate >= fromDate && sDate <= toDate;
    return true;
  });

  const completed = filtered.filter(s => s.status === 'completed');
  const cancelled = filtered.filter(s => s.status === 'cancelled');

  let totalRev = 0;
  completed.forEach(s => {
    totalRev += (s.paidSeconds / 60) * s.ratePerMinute;
  });

  const platformRev = totalRev * 0.40;
  const astrologerEarnings = totalRev * 0.60;

  // Astrologer breakdown
  const astroBreakdown: Record<string, { astrologerName: string; astroId: string; totalChats: number; completed: number; cancelled: number; totalMinutes: number; earnings: number }> = {};
  db.readers.forEach(r => {
    astroBreakdown[r.id] = {
      astrologerName: r.name,
      astroId: r.astroId || r.id,
      totalChats: 0,
      completed: 0,
      cancelled: 0,
      totalMinutes: 0,
      earnings: 0
    };
  });

  filtered.forEach(s => {
    const rId = s.assignedReaderId || s.requestedReaderId;
    if (rId && astroBreakdown[rId]) {
      astroBreakdown[rId].totalChats += 1;
      if (s.status === 'completed') {
        astroBreakdown[rId].completed += 1;
        const mins = Math.max(5, Math.round(s.totalDurationSeconds / 60));
        astroBreakdown[rId].totalMinutes += mins;
        astroBreakdown[rId].earnings += mins * s.ratePerMinute * 0.60;
      } else if (s.status === 'cancelled') {
        astroBreakdown[rId].cancelled += 1;
      }
    }
  });

  res.json({
    date: date || `${fromDate} to ${toDate}` || 'Overall',
    totalSessions: filtered.length,
    completedSessions: completed.length,
    cancelledSessions: cancelled.length,
    totalRevenue: totalRev,
    platformRevenue: platformRev,
    astrologerEarnings: astrologerEarnings,
    astrologers: Object.values(astroBreakdown).filter(a => a.totalChats > 0 || Math.random() > 0.5)
  });
});


// Initialize Vite in middleware mode for dev
async function setupApp() {
  // Standalone app direct navigation
  app.get('/admin', (_req: Request, res: Response) => {
    res.redirect('/admin.html');
  });
  app.get('/astrologer', (_req: Request, res: Response) => {
    res.redirect('/astrologer.html');
  });

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get(['/admin', '/admin.html'], (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'admin.html'));
    });
    app.get(['/astrologer', '/astrologer.html'], (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'astrologer.html'));
    });
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LUMYSIC Server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
