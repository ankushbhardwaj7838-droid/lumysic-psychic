import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Info, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'astral';
  text: string;
  timestamp: string;
}

export const AskAstralSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'astral',
      text: "Greetings, seeker. I am Ask LUMSIC, your guide through planetary ephemeris, tarot archetypes, and vibrational numerology. What question or placement would you like to explore today?",
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Contextual astronomical response generator
    setTimeout(() => {
      let reply = "In esoteric and spiritual tradition, this query invites conscious balance. Remember that planetary placements represent psychological archetypes and developmental potentials rather than unchangeable destiny.";
      
      const lower = userText.toLowerCase();
      if (lower.includes('saturn') || lower.includes('return')) {
        reply = "Saturn's return occurs every 29.5 years when Saturn returns to the exact ecliptic longitude of your birth. Historically and psychologically, this marks a period of profound restructuring, mature accountability, and shedding superficial commitments in favor of authentic life foundations.";
      } else if (lower.includes('mercury') || lower.includes('retrograde')) {
        reply = "Mercury retrograde is an astronomical optical illusion where Mercury appears to move backward in the sky from Earth's vantage point. In tradition, this tri-annual 3-week window is best utilized for the 're-' verbs: review, reflect, revise, and reconnect, rather than hasty new contracts.";
      } else if (lower.includes('tarot') || lower.includes('card')) {
        reply = "In tarot practice, cards function as symbolic mirrors reflecting your subconscious states. Major Arcana cards denote macro life lessons, while Minor Arcana cards reflect daily circumstances. They prompt self-inquiry rather than rigid fortunetelling.";
      } else if (lower.includes('compatib') || lower.includes('love')) {
        reply = "Synastry explores how two distinct natal charts interact. While elemental harmony (such as Fire with Air, or Earth with Water) offers easy resonance, challenges in aspects like Mars-Venus or Saturn-Sun provide the greatest catalysts for emotional maturity and personal evolution.";
      } else if (lower.includes('numerology') || lower.includes('life path')) {
        reply = "Your Life Path Number reveals the overarching themes and evolutionary hurdles you are naturally wired to encounter. Derived from the sum of your birth date reduced to single digits or master numbers (11, 22, 33), it serves as a steady compass for purposeful action.";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'astral',
        text: reply,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <section id="ask-astral" className="py-20 bg-[#0D1026] border-b border-[#252A42] scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Specification 18) */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#7C5CFF] block mb-2">
            AI-Assisted Cosmic Wisdom
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Ask LUMSIC
          </h2>
          <p className="text-sm sm:text-base text-[#A8ADC2]">
            Your guide to the cosmic world. Inquire about planetary placements, tarot symbolism, compatibility, and ancient spiritual traditions.
          </p>
        </div>

        {/* Chat Interface Container */}
        <div className="cosmic-card rounded-2xl overflow-hidden flex flex-col h-[520px]">
          
          {/* Chat Header */}
          <div className="p-4 bg-[#070A18] border-b border-[#252A42] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 flex items-center justify-center text-[#7C5CFF]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ask LUMSIC AI Oracle</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Astronomical Engine Active</span>
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[#A8ADC2] font-mono">
              Ethical Guidance Policy
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#070A18]/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  m.sender === 'user' ? 'bg-[#7C5CFF] text-white' : 'bg-[#11162B] border border-[#252A42] text-[#E7C878]'
                }`}>
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-[#7C5CFF] text-white rounded-tr-none' 
                    : 'bg-[#11162B] border border-[#252A42] text-[#ded2f2] rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-[#A8ADC2] italic p-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E7C878] animate-spin" />
                <span>LUMSIC is consulting ephemeris archives...</span>
              </div>
            )}
          </div>

          {/* Suggested Starter Prompts */}
          <div className="px-4 py-2 bg-[#070A18] border-t border-[#252A42]/60 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
            {[
              'What is a Saturn Return?',
              'How does Mercury Retrograde work?',
              'Meaning of The Star card',
              'Explain Life Path 7'
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputValue(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#11162B] border border-[#252A42] text-[#A8ADC2] hover:text-white hover:border-[#7C5CFF] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#070A18] border-t border-[#252A42] flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your birth chart, tarot meanings, transits..."
              className="flex-1 bg-[#11162B] border border-[#252A42] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#7C5CFF]"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6A47FF] text-white transition-colors cursor-pointer"
              aria-label="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Ethical Transparency Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#A8ADC2]/70 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#7C5CFF]" />
          <span>
            AI responses distinguish philosophical and archetypal interpretation from physical fact. Never used as a substitute for professional counsel.
          </span>
        </div>

      </div>
    </section>
  );
};
