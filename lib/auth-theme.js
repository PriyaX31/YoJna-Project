export const authTheme = {
  variables: {
    colorPrimary: "#9333ea", // Vibrant purple-600
    colorBackground: "#0b0f19", // Deep slate-950
    colorText: "#f8fafc", // Slate-50
    colorTextSecondary: "#94a3b8", // Slate-400
    colorTextOnPrimaryBackground: "#ffffff",
    colorInputBackground: "#020617", // Slate-950
    colorInputText: "#f8fafc",
    colorNeutral: "#334155",
    colorShimmer: "rgba(147, 51, 234, 0.15)",
    borderRadius: "0.875rem",
  },
  elements: {
    rootBox: "w-full max-w-md mx-auto flex justify-center",
    card: "w-full mx-auto bg-slate-900/90 shadow-2xl border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 text-slate-100",
    headerTitle: "text-2xl font-bold tracking-tight text-slate-100",
    headerSubtitle: "text-sm text-slate-400 mt-1",
    formButtonPrimary:
      "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border-0",
    socialButtonsBlockButton:
      "bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-medium py-2.5 rounded-xl transition-all shadow-sm hover:border-slate-700",
    socialButtonsBlockButtonText: "text-slate-200 font-medium text-sm",
    formFieldLabel: "text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5",
    formFieldInput:
      "bg-slate-950 border-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl text-slate-100 text-sm py-2.5 px-3.5 transition-all placeholder:text-slate-600",
    footerActionLink: "text-purple-400 hover:text-purple-300 font-semibold hover:underline decoration-purple-400 transition-colors",
    footerActionText: "text-slate-400 text-sm",
    dividerLine: "bg-slate-800",
    dividerText: "text-slate-500 text-xs uppercase tracking-widest font-semibold px-2",
    identityPreviewText: "text-slate-200 font-medium",
    identityPreviewEditButtonIcon: "text-purple-400 hover:text-purple-300",
    formFieldSuccessText: "text-emerald-400 text-xs",
    formFieldErrorText: "text-rose-400 text-xs font-medium",
    alert: "border border-purple-500/30 bg-purple-950/40 text-purple-200 rounded-xl p-3 text-sm",
    alertText: "text-purple-200 text-sm",
    badge: "bg-purple-950/50 border border-purple-500/30 text-purple-300 font-medium px-2 py-0.5 rounded-md text-xs",
    formResendCodeLink: "text-purple-400 hover:text-purple-300 font-semibold",
    otpCodeFieldInput: "border-slate-800 bg-slate-950 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-100 rounded-lg",
  },
};

