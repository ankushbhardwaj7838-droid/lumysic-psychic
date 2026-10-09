import React from 'react';

interface LumenLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LumenLogo: React.FC<LumenLogoProps> = ({
  className = '',
  showText = true,
  size = 'md'
}) => {
  const heightClass = size === 'sm' ? 'h-8 sm:h-9' : size === 'lg' ? 'h-14 sm:h-16' : 'h-10 sm:h-11';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Vector recreation of the exact golden Lumen emblem:
          Double crescent moon framing an 8-pointed radiant compass star with top/bottom spire diamonds,
          plus luxury golden gradient wordmark "LUMEN" */}
      <svg
        viewBox="0 0 340 100"
        className={`${heightClass} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LUMEN Logo"
      >
        <defs>
          {/* Rich metallic gold gradient */}
          <linearGradient id="lumenGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE898" />
            <stop offset="25%" stopColor="#DFAD39" />
            <stop offset="50%" stopColor="#FFF2BD" />
            <stop offset="75%" stopColor="#C99320" />
            <stop offset="100%" stopColor="#FFE484" />
          </linearGradient>

          {/* Deep gold bevel shadow */}
          <linearGradient id="lumenGoldDark" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8C5C0E" />
            <stop offset="50%" stopColor="#DCA42E" />
            <stop offset="100%" stopColor="#FDE18A" />
          </linearGradient>

          <filter id="lumenGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* EMBLEM (Left: Center X = 50, Center Y = 50) */}
        <g transform="translate(4, 0)">
          {/* Outer Crescent Moon Ring */}
          <path
            d="M 50 15 
               A 35 35 0 0 0 50 85 
               A 31 31 0 0 1 50 20
               Z"
            fill="url(#lumenGoldGrad)"
            stroke="url(#lumenGoldDark)"
            strokeWidth="0.8"
          />
          <path
            d="M 50 15 
               A 35 35 0 0 1 50 85 
               A 31 31 0 0 0 50 20
               Z"
            fill="url(#lumenGoldGrad)"
            stroke="url(#lumenGoldDark)"
            strokeWidth="0.8"
          />

          {/* Inner Crescent Horns */}
          <path
            d="M 50 23 
               C 32 23, 22 36, 22 50 
               C 22 64, 32 77, 50 77 
               C 36 74, 28 64, 28 50 
               C 28 36, 36 26, 50 23 Z"
            fill="url(#lumenGoldDark)"
          />
          <path
            d="M 50 23 
               C 68 23, 78 36, 78 50 
               C 78 64, 68 77, 50 77 
               C 64 74, 72 64, 72 50 
               C 72 36, 64 26, 50 23 Z"
            fill="url(#lumenGoldDark)"
          />

          {/* Top Diamond Spire Finial */}
          <path
            d="M 50 3 L 54.5 12 L 50 21 L 45.5 12 Z"
            fill="url(#lumenGoldGrad)"
            stroke="url(#lumenGoldDark)"
            strokeWidth="0.5"
          />
          <circle cx="50" cy="3" r="2.2" fill="url(#lumenGoldGrad)" />

          {/* Bottom Diamond Spire Finial */}
          <path
            d="M 50 79 L 54.5 88 L 50 97 L 45.5 88 Z"
            fill="url(#lumenGoldGrad)"
            stroke="url(#lumenGoldDark)"
            strokeWidth="0.5"
          />
          <circle cx="50" cy="97" r="2.2" fill="url(#lumenGoldGrad)" />

          {/* Vertical central needle through star */}
          <line x1="50" y1="18" x2="50" y2="82" stroke="url(#lumenGoldGrad)" strokeWidth="1.5" />

          {/* 8-Pointed Radiant Star */}
          {/* Cardinal Points */}
          <polygon
            points="50,26 53,47 74,50 53,53 50,74 47,53 26,50 47,47"
            fill="url(#lumenGoldGrad)"
            stroke="url(#lumenGoldDark)"
            strokeWidth="0.75"
          />
          {/* Diagonal Points */}
          <polygon
            points="50,33 52,48 67,35 52,52 67,65 48,52 33,67 48,48 35,33 48,50"
            fill="url(#lumenGoldDark)"
            opacity="0.9"
          />

          {/* Star facets bevel highlights */}
          <line x1="50" y1="26" x2="50" y2="74" stroke="#FFF7D6" strokeWidth="0.7" />
          <line x1="26" y1="50" x2="74" y2="50" stroke="#FFF7D6" strokeWidth="0.7" />
          <circle cx="50" cy="50" r="3.2" fill="url(#lumenGoldGrad)" stroke="#6C4505" strokeWidth="0.6" />
        </g>

        {/* WORDMARK: "LUMEN" with high-definition serif gold bevel typography */}
        {showText && (
          <g transform="translate(108, 0)">
            <text
              x="0"
              y="68"
              fontFamily="'Cinzel', 'Cormorant Garamond', 'Times New Roman', serif"
              fontSize="52"
              fontWeight="800"
              letterSpacing="6"
              fill="url(#lumenGoldGrad)"
              stroke="url(#lumenGoldDark)"
              strokeWidth="1.2"
              filter="url(#lumenGlow)"
            >
              LUMEN
            </text>
            <text
              x="0"
              y="68"
              fontFamily="'Cinzel', 'Cormorant Garamond', 'Times New Roman', serif"
              fontSize="52"
              fontWeight="800"
              letterSpacing="6"
              fill="url(#lumenGoldGrad)"
            >
              LUMEN
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
