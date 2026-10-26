export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Emblem Icon */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 shrink-0 drop-shadow-[0_2px_10px_rgba(147,51,234,0.4)]"
      >
        <defs>
          <linearGradient id="logo-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="logo-g2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
        {/* Kanban / Project sprint bars */}
        <rect x="3" y="4" width="13" height="28" rx="4" fill="url(#logo-g1)" />
        <rect x="19" y="12" width="14" height="20" rx="4" fill="url(#logo-g2)" />
        <rect x="19" y="4" width="14" height="5" rx="2.5" fill="url(#logo-g1)" />
      </svg>

      {/* Brand Name */}
      <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase select-none">
        YOJNA
      </span>
    </div>
  );
}
