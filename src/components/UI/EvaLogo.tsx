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
        <clipPath id="eva-logo-clip">
          <rect width="64" height="64" rx="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#eva-logo-clip)">
        <rect width="64" height="64" fill="#668AD1" />
        <text
          x="-4"
          y="58"
          fill="#F8FAFC"
          fontFamily="'Arial Rounded MT Bold', 'Arial Black', Arial, sans-serif"
          fontSize="66"
          fontWeight="900"
          letterSpacing="-12"
        >
          ce
        </text>
      </g>
    </svg>
  );
}
