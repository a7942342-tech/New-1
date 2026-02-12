
import React from 'react';

export const Button: React.FC<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}> = ({ onClick, variant = 'primary', children, disabled, className = '', isLoading }) => {
  const base = "px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 text-sm";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20",
    secondary: "bg-slate-800/50 hover:bg-slate-700 text-slate-200 border border-slate-700/50 backdrop-blur-md",
    accent: "bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean }> = ({ children, className = '', hover = true }) => (
  <div className={`glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 ${hover ? 'hover:border-indigo-500/30 hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
}> = ({ value, onChange, placeholder, type = "text", onKeyDown, className = '' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    className={`w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-100 placeholder-slate-600 backdrop-blur-xl transition-all ${className}`}
  />
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "indigo" }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
    {children}
  </span>
);

export const Footer: React.FC = () => (
  <footer className="mt-20 py-12 border-t border-white/5 bg-slate-950/50">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-2 space-y-4">
        <h4 className="text-xl font-black tracking-tighter">Anime<span className="text-indigo-500">Lover</span></h4>
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
          The world's largest community-driven hub for Hindi dubbed anime. We index the best content from around the web so you don't have to.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">Discord</a>
          <a href="#" className="text-slate-500 hover:text-white transition-colors">Instagram</a>
        </div>
      </div>
      <div className="space-y-4">
        <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Platform</h5>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
        </ul>
      </div>
      <div className="space-y-4">
        <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Support</h5>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Content Removal</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium">
      <p>© 2024 Anime Lover Hub. Made with ❤️ for Hindi Fans.</p>
      <p>All videos indexed are hosted by third parties. Anime Lover does not host any files.</p>
    </div>
  </footer>
);
