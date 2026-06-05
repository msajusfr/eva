interface EvaLogoProps {
  className?: string;
}

export function EvaLogo({ className }: EvaLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="eva-logo-bg" x1="10" x2="54" y1="5" y2="58">
          <stop stopColor="#7EA7F2" />
          <stop offset="1" stopColor="#3157B8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#eva-logo-bg)" />
      <path
        d="M10 40V24c0-6 4-10 10-10s10 4 10 10v4H19"
        fill="none"
        stroke="#F8FAFC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      <path
        d="M30 24c0-6 4-10 10-10s10 4 10 10v2c0 6-4 10-10 10H30"
        fill="none"
        stroke="#F8FAFC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      <path
        d="M50 24v18c0 5 3 8 8 8"
        fill="none"
        stroke="#0B1023"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <path
        d="M31 32h16"
        fill="none"
        stroke="#F8FAFC"
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  );
}
