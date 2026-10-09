import React from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { LumysicLogo } from './LumysicLogo';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  currentLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  currentLanguage = 'en',
  onSelectLanguage
}) => {
  return (
    <footer className="bg-gradient-to-b from-[#FAF6EB] via-[#F7EFCB] to-[#F2E5BA] text-[#5C5343] border-t-2 border-[#E5D29C] pt-16 pb-24 lg:pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns Grid (Only verified features available on the website) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[#E5D29C]/80">
          
          {/* Column 1: EXPLORE */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#2B2418] tracking-wider font-serif">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: 'Psychics & Astrologers', id: 'readers' },
                { label: 'Love Compatibility', id: 'compatibility' },
                { label: 'Daily Horoscope', id: 'horoscope' },
                { label: 'Tarot Oracle', id: 'tarot' },
                { label: 'Birth Chart Calculator', id: 'birth-chart' },
                { label: 'Sacred Rituals & Spells', id: 'rituals' },
                { label: 'LUMSIC Shop', id: 'shop' },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigateSection(item.id)}
                    className="hover:text-[#B45309] font-medium transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: FREE TOOLS */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#2B2418] tracking-wider font-serif">Free Tools</h4>
            <ul className="space-y-2">
              {[
                { label: 'Free Daily Horoscope', id: 'horoscope' },
                { label: 'Daily Tarot Card Draw', id: 'tarot' },
                { label: 'Birth Chart Calculator', id: 'birth-chart' },
                { label: 'Zodiac Love Compatibility', id: 'compatibility' },
                { label: 'First Chat Free with Psychics', id: 'readers' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigateSection(item.id)}
                    className="hover:text-[#B45309] font-medium transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: LEARN & GUIDES */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#2B2418] tracking-wider font-serif">Learn & Guides</h4>
            <ul className="space-y-2">
              {[
                { label: 'Natal Chart Architecture', id: 'learn' },
                { label: 'Vedic vs Western Traditions', id: 'learn' },
                { label: 'Tarot Symbolism & Meanings', id: 'learn' },
                { label: 'How Consultations Work', id: 'how-it-works' },
                { label: 'Why LUMSIC Sanctuary', id: 'why-astral' },
                { label: 'Seeker Testimonials', id: 'testimonials' },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigateSection(item.id)}
                    className="hover:text-[#B45309] font-medium transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: COMPANY & SUPPORT */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#2B2418] tracking-wider font-serif">Sanctuary & Support</h4>
            <ul className="space-y-2">
              {[
                { label: 'Frequently Asked Questions', id: 'faq' },
                { label: 'Why LUMSIC Platform', id: 'why-astral' },
                { label: 'Verified Reader Collective', id: 'readers' },
                { label: 'Consecrated Spiritual Shop', id: 'shop' },
                { label: 'Astrologer Portal (Astrodashboard)', id: 'astrodashboard' },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => onNavigateSection(item.id)}
                    className="hover:text-[#B45309] font-medium transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Brand Logo, Legal Disclaimer & Language Selector */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <LumysicLogo size={26} glow={false} />
              <span 
                className="font-serif font-black tracking-[0.24em] text-base text-[#2B2418]"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              >
                LUMSIC
              </span>
            </div>
            <span className="text-[#B45309]/50">·</span>
            <span className="text-xs text-[#6F6654]">
              © {new Date().getFullYear()} LUMSIC Sanctuary Inc. Global Self-Discovery Platform.
            </span>
          </div>

          {/* Astrologer Portal & Admin Dashboard Quick Links */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <a
              href="/astrodashboard"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/astrodashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs text-[#8C6D23] hover:text-[#2B2418] px-3 py-1.5 rounded-full bg-[#FFFDF9] hover:bg-white border border-[#D6A83F]/60 transition-all flex items-center gap-1 font-bold shadow-xs active:scale-95"
              title="Open Astrologer Dashboard (Astrodashboard)"
            >
              <span>✦ Astrodashboard</span>
            </a>

            <a
              href="/admin-dashboard"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/admin-dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-xs text-[#2B2418] hover:text-[#B45309] px-3 py-1.5 rounded-full bg-[#FFFDF9] hover:bg-white border border-[#E5D29C] transition-all flex items-center gap-1 font-bold shadow-xs active:scale-95"
              title="Open Admin Dashboard"
            >
              <span>Admin Dashboard</span>
            </a>

            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#B45309]" />
              <select
                value={currentLanguage}
                onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value)}
                className="bg-[#FFFDF9] border border-[#E5D29C] text-xs text-[#2B2418] font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#D6A83F] shadow-xs"
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
                <option value="it">Italiano</option>
                <option value="hi">हिन्दी</option>
                <option value="ar">العربية</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>

        </div>

        {/* Ethical Disclaimer Notice */}
        <div className="mt-8 pt-6 border-t border-[#E5D29C]/80 text-center text-[11px] text-[#6F6654] max-w-4xl mx-auto leading-relaxed">
          LUMSIC is dedicated to personal contemplation, spiritual self-discovery, and cultural traditions. Astrological interpretations, tarot readings, and intuitive quizzes are offered for reflective guidance and should never substitute professional legal, financial, or medical counsel.
        </div>

      </div>
    </footer>
  );
};
