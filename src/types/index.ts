export type ReaderCategory = 
  | 'Tarot' 
  | 'Psychic & Intuitive' 
  | 'Western Astrology' 
  | 'Mediumship' 
  | 'Spiritual Guidance' 
  | 'Vedic Astrology';

export interface Reader {
  id: string;
  name: string;
  title: string;
  category: ReaderCategory;
  image_url?: string;
  avatar: string; // Alias for image_url
  experience_years?: number;
  experienceYears: number; // Alias for experience_years
  initials: string;
  rating: number; // e.g. 4.98 or 4.99
  reviewCount: number;
  sessionsCount?: number; // Distinct consultation sessions (e.g. 989, 1420, etc.)
  ratePerMinute: number; // in GBP £ (0.99 for 5+ years experience, max 2.50)
  location: string;
  isOnline: boolean;
  status?: 'online' | 'busy' | 'offline' | 'on_break' | 'suspended';
  isActive?: boolean; // Controls public visibility
  isChatEnabled?: boolean; // Controls chat consultation availability
  isCallEnabled?: boolean; // Controls call consultation availability
  specialties?: string[]; // Categorized specifically
  specialities: string[]; // Alias for specialties
  bio: string;
  methods: string[];
  languages: string[];
  quote: string;
  astroId?: string; // e.g. "ASTRO-1024"
  email?: string; // Registered email for astrologer login
  phone?: string; // Optional phone number for mobile login
  isPhoneLoginEnabled?: boolean; // Set true ONLY if phone number was provided by admin
  password?: string; // Astrologer permanent password
  tempPassword?: string; // Temporary password if set
  mustSetPassword?: boolean; // True for first-time login to enforce new password creation
  shift?: string; // e.g. "10:00AM - 7:00PM"
  maxConcurrentChats?: number;
}

export interface CustomerBirthDetails {
  name?: string;
  gender?: 'Male' | 'Female' | 'Other' | string;
  dob?: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  amPm?: 'AM' | 'PM';
  placeOfBirth?: string;
  unknownTime?: boolean;
}

export interface ConsultationStartData {
  firstName: string;
  fullName?: string;
  gender?: string;
  topic: string;
  readingType: string;
  question: string;
  birthDetails?: CustomerBirthDetails;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  country?: string;
  currency?: string;
  birthDetails?: CustomerBirthDetails;
  isFirstTimeUser: boolean;
  freeMinutesUsed: boolean;
  free_chat_eligible?: boolean;
  free_chat_used?: boolean;
  free_chat_started_at?: string;
  totalConsultations: number;
}

export type SessionStatus = 'waiting' | 'active' | 'completed' | 'cancelled';

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'customer' | 'astrologer' | 'system';
  senderName: string;
  text: string;
  timestamp: string; // ISO
  isSystemNotice?: boolean;
  imageUrl?: string;
  isBanner?: boolean;
  isAiMessage?: boolean;
  isHandoverNotice?: boolean;
}

export type SessionPriority = 'normal' | 'waiting' | 'urgent' | 'critical';
export type AssignmentType = 'DIRECT' | 'AUTO_ASSIGNED' | 'MANUALLY_FORWARDED' | 'REASSIGNED';

export interface RoutingHistoryEntry {
  id: string;
  fromReaderId: string;
  fromReaderName: string;
  toReaderId: string;
  toReaderName: string;
  timestamp: string; // ISO
  forwardedBy: string; // e.g. "Admin (Super Admin)"
  reason: string;
}

export interface ConsultationSession {
  id: string;
  customerId: string;
  customerName: string;
  readingType?: string;
  topic?: string;
  initialQuestion?: string;
  birthDetails?: CustomerBirthDetails;
  requestedReaderId: string;
  requestedReaderName: string;
  requestedAstroId?: string;
  assignedReaderId: string;
  assignedReaderName: string;
  assignedAstroId?: string;
  status: SessionStatus;
  priority?: SessionPriority;
  assignmentType?: AssignmentType;
  routingHistory?: RoutingHistoryEntry[];
  isFreeConsultation: boolean;
  isAiSession?: boolean;
  aiGuideName?: string;
  targetHumanReaderId?: string;
  targetHumanReaderName?: string;
  freeSecondsRemaining: number;
  totalDurationSeconds: number;
  paidSeconds: number;
  ratePerMinute: number;
  createdAt: string; // ISO
  acceptedAt?: string; // ISO - timer begins ONLY when this is set!
  startedAt?: string; // ISO - free chat start timestamp
  endedAt?: string; // ISO
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadForOperator?: boolean;
  unreadForCustomer?: boolean;
  messages: ChatMessage[];
  paymentStatus: 'free_tier' | 'paid_active' | 'pending_topup' | 'settled';
}

export type AdminRole = 
  | 'super_admin' 
  | 'operations_admin' 
  | 'chat_admin' 
  | 'content_admin' 
  | 'finance_admin';

export interface ActivityLog {
  id: string;
  action: string;
  admin: string;
  date: string;
  time: string;
  target: string;
  previousValue?: string;
  newValue?: string;
}

export interface AutoAssignSettings {
  enabled: boolean;
  maxChatsPerAstrologer: number;
  idlePriority: boolean;
  escalationTimeoutMinutes: number;
  specializationMatching: boolean;
  onlineOnly: boolean;
  fallbackAstrologerId?: string;
}

export interface RemedyItem {
  id: string;
  title: string;
  category: 'Love' | 'Career' | 'Finance' | 'Marriage' | 'Family' | 'Health & Wellness' | 'Planetary' | 'Spiritual' | 'General';
  description: string;
  benefits: string[];
  howToUse: string;
  duration: string;
  instructions: string;
  imageUrl?: string;
  status: 'published' | 'draft';
  isFeatured?: boolean;
  price?: number;
}

export interface AstroboardStats {
  activeChats: number;
  waitingChats: number;
  todaysChats: number;
  completedChats: number;
  onlineReaders: number;
  todaysEarnings: number; // £
  weeklyEarnings: number; // £
  monthlyEarnings: number; // £
}

export interface HoroscopeSign {
  id: string;
  name: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  symbol: string;
  rulingPlanet: string;
  tarotCard: string;
  dailySummary: string;
  loveGuidance: string;
  careerGuidance: string;
  cosmicAdvice: string;
  luckyNumber: number;
  affirmation: string;
  avatarImage: string;
  sunSign: string;
  moonSign: string;
  ascendant: string;
  scores: {
    love: number;
    family: number;
    career: number;
    health: number;
  };
  transitHeadline?: string;
  transitText: string;
  luckyColor?: string;
  compatibility?: string;
}

export interface RitualSpell {
  id: string;
  name: string;
  category: 'spells' | 'reiki' | 'love' | 'protection' | 'prosperity' | 'healing' | string;
  type?: 'spell' | 'healing';
  originalPrice: number; // GBP £
  discountPrice: number; // GBP £
  imageUrl: string;
  description: string;
  castDuration: string; // e.g. '24-48 Hours'
  includes: string[];
  practitionerName: string;
  practitionerRole: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  isActive?: boolean;
  status?: 'active' | 'paused' | 'inactive';
}

export interface ShopProduct {
  id: string;
  name: string;
  category: 'magnets' | 'rings' | 'crystals' | 'talismans' | 'altar' | 'candles' | 'incense' | 'decks' | 'jewelry' | string;
  type?: 'shop';
  priceGBP: number;
  originalPriceGBP?: number;
  priceINR?: number;
  originalPriceINR?: number;
  purpose?: 'Wealth' | 'Love' | 'Protection' | 'Career' | 'Health' | string;
  rating: number;
  reviewCount: number;
  consecratedBy: string;
  description: string;
  inStock: boolean;
  image: string;
  image_url?: string;
  stockCount?: number;
  badge?: string;
  isActive?: boolean;
  status?: 'active' | 'paused' | 'inactive';
  stockQuantity?: number;
  materials?: string;
}
