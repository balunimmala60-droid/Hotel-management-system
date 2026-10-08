import React from 'react';
import { 
  Building2, 
  CalendarCheck, 
  Users, 
  Receipt, 
  Sparkles, 
  UtensilsCrossed, 
  Database, 
  Terminal, 
  Plus, 
  RotateCcw,
  Clock,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { HotelSummary } from '../types';

export type NavTab = 
  | 'overview' 
  | 'reservations' 
  | 'guests' 
  | 'billing' 
  | 'housekeeping' 
  | 'dining' 
  | 'sql_studio' 
  | 'python_backend'
  | 'basic_html';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  summary: HotelSummary | null;
  onOpenNewBooking: () => void;
  onResetDb: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  summary,
  onOpenNewBooking,
  onResetDb,
  isResetting
}) => {
  const [timeStr, setTimeStr] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview' as NavTab, label: 'Rooms & Floorplan', icon: Building2 },
    { id: 'reservations' as NavTab, label: 'Reservations', icon: CalendarCheck },
    { id: 'guests' as NavTab, label: 'Guest Directory', icon: Users },
    { id: 'billing' as NavTab, label: 'Folio & Billing', icon: Receipt },
    { id: 'housekeeping' as NavTab, label: 'Housekeeping', icon: Sparkles },
    { id: 'dining' as NavTab, label: 'In-Room Dining', icon: UtensilsCrossed },
    { id: 'sql_studio' as NavTab, label: 'SQL Studio', icon: Database },
    { id: 'python_backend' as NavTab, label: 'Python Backend', icon: Terminal },
    { id: 'basic_html' as NavTab, label: 'Basic HTML View', icon: FileCode },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Luxury Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/40">
          {/* Logo & Hotel Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <span className="font-serif-luxury font-bold text-lg">GH</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-base font-semibold tracking-wider text-slate-100">
                  GRAND HORIZON
                </span>
                <span className="text-[10px] tracking-widest text-amber-400 font-medium uppercase">
                  Resort & Suites PMS
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>5-Star Luxury Property</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Python 3 + SQLite Online
                </span>
              </div>
            </div>
          </div>

          {/* KPI Ticker & Fast Metrics (Zero-pill text styling) */}
          {summary && (
            <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 border-x border-slate-800/60 px-6 py-2">
              <div>
                <span className="text-slate-400">Occupancy:</span>{' '}
                <span className="font-semibold text-amber-300 font-mono-code">{summary.occupancy_rate}%</span>{' '}
                <span className="text-slate-400">({summary.occupied_rooms}/{summary.total_rooms} rooms)</span>
              </div>
              <div aria-hidden="true" className="text-slate-700">|</div>
              <div>
                <span className="text-slate-400">ADR:</span>{' '}
                <span className="font-semibold text-slate-200 font-mono-code">₹{summary.adr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div aria-hidden="true" className="text-slate-700">|</div>
              <div>
                <span className="text-slate-400">RevPAR:</span>{' '}
                <span className="font-semibold text-emerald-400 font-mono-code">₹{summary.revpar.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {/* Top Right Controls: Clock & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-md px-3 py-1.5 font-mono-code">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeStr || '10:24:00 AM'}</span>
            </div>

            <button
              onClick={onResetDb}
              disabled={isResetting}
              title="Reset Database to Pristine Seed State"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isResetting ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Reset DB</span>
            </button>

            <button
              onClick={onOpenNewBooking}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-md shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Reservation</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
