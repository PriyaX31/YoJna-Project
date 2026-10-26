export default function AuthLayout({ children }) {
  return (
    <div className="relative flex-1 min-h-[calc(100vh-140px)] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden text-slate-50">
      {/* Background gradients and purple ambient highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Auth Content Container - perfectly centered horizontally and vertically */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

