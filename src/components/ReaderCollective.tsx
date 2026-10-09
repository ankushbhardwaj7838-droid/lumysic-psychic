import React, { useState, useMemo } from 'react';
import { Reader } from '../types';
import { Star, MessageSquare, Search, Sparkles, User, MapPin, ArrowLeft } from 'lucide-react';

interface ReaderCollectiveProps {
  readers: Reader[];
  onViewProfile: (reader: Reader) => void;
  onStartChat: (reader: Reader) => void;
  onGoBack?: () => void;
}

interface FilterDef {
  id: string;
  label: string;
  matches: (reader: Reader) => boolean;
}

const SKILL_FILTERS: FilterDef[] = [
  { 
    id: 'all', 
    label: 'All Readers', 
    matches: () => true 
  },
  { 
    id: 'tarot', 
    label: 'Tarot', 
    matches: (r) => r.specialities.includes('Tarot Reading') 
  },
  { 
    id: 'psychic', 
    label: 'Psychic', 
    matches: (r) => r.specialities.includes('Psychic Reading') 
  },
  { 
    id: 'love', 
    label: 'Love & Relationships', 
    matches: (r) => r.specialities.some(s => s === 'Love & Relationship Reading' || s === 'Marriage & Compatibility') 
  },
  { 
    id: 'career', 
    label: 'Career', 
    matches: (r) => r.specialities.some(s => s === 'Career & Life Direction' || s === 'Vedic Career Guidance') 
  },
  { 
    id: 'clairvoyance', 
    label: 'Clairvoyance', 
    matches: (r) => r.specialities.includes('Clairvoyance') 
  },
  { 
    id: 'mediumship', 
    label: 'Mediumship', 
    matches: (r) => r.specialities.includes('Mediumship') 
  },
  { 
    id: 'western-astrology', 
    label: 'Western Charts', 
    matches: (r) => r.specialities.some(s => s.toLowerCase().includes('western')) 
  },
  { 
    id: 'vedic-astrology', 
    label: 'Vedic Jyotish', 
    matches: (r) => r.specialities.some(s => s.toLowerCase().includes('vedic')) 
  },
  { 
    id: 'numerology', 
    label: 'Numerology', 
    matches: (r) => r.specialities.includes('Numerology') 
  },
  { 
    id: 'oracle-cards', 
    label: 'Oracle Cards', 
    matches: (r) => r.specialities.includes('Oracle Cards') 
  },
  { 
    id: 'spiritual-guidance', 
    label: 'Spiritual Guidance', 
    matches: (r) => r.specialities.includes('Spiritual Guidance') 
  },
];

export const ReaderCollective: React.FC<ReaderCollectiveProps> = ({
  readers,
  onViewProfile,
  onStartChat,
  onGoBack,
}) => {
  const [activeFilterId, setActiveFilterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOnline, setOnlyOnline] = useState(false);

  // Compute live counts for each filter
  const filterCounts = useMemo(() => {
    const activeReaders = readers.filter(r => r.isActive !== false);
    const counts: Record<string, number> = {};
    SKILL_FILTERS.forEach(f => {
      counts[f.id] = activeReaders.filter(f.matches).length;
    });
    return counts;
  }, [readers]);

  const filteredReaders = useMemo(() => {
    const currentFilter = SKILL_FILTERS.find(f => f.id === activeFilterId) || SKILL_FILTERS[0];

    return readers.filter(reader => {
      // Visibility check
      if (reader.isActive === false) {
        return false;
      }
      // Skill filter match
      if (!currentFilter.matches(reader)) {
        return false;
      }
      // Online match
      if (onlyOnline && !reader.isOnline) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = reader.name.toLowerCase().includes(q);
        const matchesTitle = reader.title.toLowerCase().includes(q);
        const matchesSpeciality = reader.specialities.some(s => s.toLowerCase().includes(q));
        const matchesCategory = reader.category.toLowerCase().includes(q);
        const matchesLocation = reader.location.toLowerCase().includes(q);
        return matchesName || matchesTitle || matchesSpeciality || matchesCategory || matchesLocation;
      }
      return true;
    });
  }, [readers, activeFilterId, onlyOnline, searchQuery]);

  return (
    <section id="readers" className="scroll-mt-20 sm:scroll-mt-24 py-8 sm:py-10 md:py-14 bg-[#0b0514] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Back to Home Button */}
        {onGoBack && (
          <div className="mb-4 flex items-center justify-start">
            <button
              type="button"
              onClick={onGoBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1b0c33] hover:bg-[#2a134e] border border-[#d4af37]/50 text-[#f5e7a9] text-xs font-semibold shadow-md active:scale-95 cursor-pointer transition-all"
              title="Back to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-8 pb-5 border-b border-[#2c184d]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vetted Spiritual Directory</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf7f2]">
              The Reader Collective
            </h2>
            <p className="text-sm md:text-base text-[#bda5db] mt-2 max-w-2xl font-light">
              Our exceptional readers, psychics and tarot masters bring a minimum of 15 years in private practice. Choose your specialist to begin your complimentary introductory free chat.
            </p>
          </div>

          {/* Guarantee banner inline */}
          <div className="bg-[#190d30] border border-[#d4af37]/30 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-[#faf7f2]">First Chat Free</span>
              <span className="text-[11px] text-[#bda5db]">Available with any reader below</span>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col gap-4 mb-8">
          
          {/* Skill Filter Tabs - Swipeable on mobile */}
          <div className="flex items-center sm:flex-wrap gap-1.5 p-1.5 bg-[#150b24] border border-[#2c184d] rounded-2xl overflow-x-auto no-scrollbar touch-pan-x">
            {SKILL_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilterId(filter.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeFilterId === filter.id
                    ? 'bg-[#d4af37] text-[#0b0514] font-semibold shadow-md'
                    : 'text-[#faf7f2]/70 hover:text-[#faf7f2] hover:bg-[#201037]'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  activeFilterId === filter.id ? 'bg-[#0b0514]/20 text-[#0b0514]' : 'bg-[#28134a] text-[#bda5db]'
                }`}>
                  {filterCounts[filter.id]}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Online Filter */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bda5db]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reader by name, skill, or location..."
                className="w-full pl-9 pr-3 py-2 bg-[#150b24] border border-[#2c184d] rounded-xl text-xs text-[#faf7f2] placeholder-[#bda5db]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <button
              onClick={() => setOnlyOnline(!onlyOnline)}
              className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                onlyOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#150b24] text-[#faf7f2]/70 border-[#2c184d] hover:text-[#faf7f2]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>Online Only</span>
            </button>
          </div>

        </div>

        {/* Reader Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReaders.map((reader) => (
            <article
              key={reader.id}
              className="group bg-[#150b24] rounded-2xl border border-[#2c184d] hover:border-[#d4af37]/50 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg shadow-black/20 hover:shadow-[#d4af37]/5"
            >
              <div className="p-5">
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#241340] border-2 border-[#d4af37]/40 flex items-center justify-center text-sm font-semibold text-[#faf7f2]">
                      {reader.avatar ? (
                        <img
                          src={reader.avatar}
                          alt={reader.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="font-serif text-base">{reader.initials}</span>
                    </div>

                    {/* Online indicator */}
                    <span
                      title={reader.isOnline ? 'Online now' : 'Currently offline'}
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#150b24] ${
                        reader.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-[#d4af37] text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-[#d4af37]" />
                      <span className="font-mono tabular-nums">{reader.rating.toFixed(2)}</span>
                    </div>
                    <span className="block text-[11px] text-[#bda5db] font-mono tabular-nums">
                      ({reader.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Name & Title */}
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#faf7f2] group-hover:text-[#d4af37] transition-colors leading-snug">
                    {reader.name}
                  </h3>
                  <p className="text-xs text-[#d4af37] font-medium mt-0.5 line-clamp-1">
                    {reader.title}
                  </p>
                </div>

                {/* Unboxed Metadata Discipline */}
                <div className="flex items-center gap-2 text-xs text-[#bda5db] mt-2.5">
                  <span>{reader.experienceYears}+ Yrs Exp</span>
                  <span aria-hidden="true" className="text-[#faf7f2]/20">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#d4af37]/70" />
                    <span className="truncate max-w-[120px]">{reader.location}</span>
                  </span>
                </div>

                {/* Bio excerpt */}
                <p className="text-xs text-[#faf7f2]/70 mt-3 line-clamp-2 leading-relaxed font-light">
                  {reader.bio}
                </p>

                {/* Top 2-3 Skills (Clean Card Discipline) */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {reader.specialities.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#201037] text-[#bda5db] border border-[#2c184d]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer with Price and Actions */}
              <div className="p-4 bg-[#10071c] border-t border-[#2c184d] space-y-3">
                
                {/* Free Chat Tag & Rate */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#d4af37] font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>First Chat Free</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#faf7f2] font-semibold font-mono tabular-nums">
                      £{reader.ratePerMinute.toFixed(2)}
                    </span>
                    <span className="text-[#bda5db] text-[11px]">/min after</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewProfile(reader)}
                    className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-[#1e0f38] hover:bg-[#2d1552] text-[#faf7f2] border border-[#2c184d] transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <User className="w-3.5 h-3.5 text-[#bda5db]" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => reader.isChatEnabled !== false && onStartChat(reader)}
                    disabled={reader.isChatEnabled === false}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                      reader.isChatEnabled === false
                        ? 'bg-[#180b27] text-[#7d659c] border border-[#2c184d] cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-[#0b0514] hover:shadow-md hover:shadow-[#d4af37]/20 transition-all cursor-pointer active:scale-95'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{reader.isChatEnabled === false ? 'Chat Paused' : 'Start Chat'}</span>
                  </button>
                </div>

              </div>
            </article>
          ))}
        </div>

        {filteredReaders.length === 0 && (
          <div className="text-center py-16 bg-[#150b24] rounded-2xl border border-[#2c184d]">
            <p className="text-sm text-[#faf7f2]">No specialists found matching this filter.</p>
            <button
              onClick={() => { setActiveFilterId('all'); setSearchQuery(''); setOnlyOnline(false); }}
              className="mt-3 text-xs text-[#d4af37] underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
