interface IconProps {
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export const IconFolder = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconSave = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const IconCheck = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconEdit = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IconEye = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconAI = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

export const IconPackage = ({ size = 20, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const IconBird = ({ size = 48, className = '', ariaLabel }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden={ariaLabel ? undefined : 'true'} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel}>
    <path d="M24 8C16 8 12 14 12 22C12 27 15 31 20 33V40C20 41 21 42 22 42H26C27 42 28 41 28 40V33C33 31 36 27 36 22C36 14 32 8 24 8Z" fill="#0ea5e9"/>
    <circle cx="21" cy="20" r="2" fill="#0f172a"/>
    <path d="M27 24L33 26L27 28Z" fill="#fbbf24"/>
  </svg>
);
