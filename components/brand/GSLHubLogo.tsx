type BrandProps = {
  className?: string;
  showTagline?: boolean;
};

const Mark = ({ inverted = false }: { inverted?: boolean }) => {
  const primary = inverted ? '#ffffff' : 'currentColor';

  return (
    <g aria-hidden="true">
      <path
        d="M42 7a21 21 0 1 0 0 42"
        fill="none"
        stroke={primary}
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path d="M35.5 28h10" fill="none" stroke={primary} strokeLinecap="round" strokeWidth="5" />
      <path d="M36.5 37.5 50 51" fill="none" stroke="#2563ff" strokeLinecap="round" strokeWidth="5" />

      <path d="m15 26 9-10 9 7 8-10" fill="none" stroke={primary} strokeLinecap="round" strokeWidth="1.8" />
      <path d="m15 26 11 8 7-11" fill="none" stroke={primary} strokeLinecap="round" strokeWidth="1.8" />

      <circle cx="15" cy="26" r="3.8" fill={primary} />
      <circle cx="24" cy="16" r="3.3" fill={primary} />
      <circle cx="26" cy="34" r="3.3" fill={primary} />
      <circle cx="33" cy="23" r="5.2" fill="#2563ff" />
      <circle cx="41" cy="13" r="3.2" fill={primary} />

      <path d="m48 5 1.8 4.2L54 11l-4.2 1.8L48 17l-1.8-4.2L42 11l4.2-1.8Z" fill="#2563ff" />
    </g>
  );
};

export function GSLHubLogo({ className, showTagline = true }: BrandProps) {
  return (
    <svg
      aria-label="GSLHub — Generative Search Lab Hub"
      className={className}
      role="img"
      style={{ display: 'block', height: 'auto', maxWidth: '100%' }}
      viewBox="0 0 286 58"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Mark />
      <text
        fill="currentColor"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="29"
        fontWeight="700"
        letterSpacing="-1"
        x="64"
        y="31"
      >
        GSL
      </text>
      <text
        fill="#2563ff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="29"
        fontWeight="500"
        letterSpacing="-1"
        x="122"
        y="31"
      >
        Hub
      </text>
      {showTagline ? (
        <text
          fill="currentColor"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="8.2"
          letterSpacing="1.45"
          opacity="0.68"
          x="65"
          y="46"
        >
          GENERATIVE SEARCH LAB HUB
        </text>
      ) : null}
    </svg>
  );
}

export function GSLHubIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="GSLHub"
      className={className}
      role="img"
      style={{ display: 'block', height: 'auto', maxWidth: '100%' }}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="15" fill="#0b132b" />
      <g transform="translate(5 5)">
        <Mark inverted />
      </g>
    </svg>
  );
}
