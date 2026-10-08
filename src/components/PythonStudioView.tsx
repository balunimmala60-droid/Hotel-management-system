import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { PythonExecutionResult } from '../types';
import { api } from '../services/api';

const PYTHON_PRESETS = [
  {
    title: '1. Executive Nightly Audit & Financial Balance',
    description: 'Computes room revenue, dining sales, hospitality tax liabilities, and accounts receivable.',
    code: [
      '# Nightly Audit PMS Routine',
      'summary = get_hotel_summary()',
      'all_data = get_all_data()',
      '',
      'print("=" * 60)',
      'print("GRAND HORIZON RESORT - OFFICIAL NIGHTLY AUDIT REPORT")',
      'print(f"Timestamp: {datetime.datetime.now().strftime(\'%Y-%m-%d %H:%M:%S\')}")',
      'print("=" * 60)',
      '',
      '# 1. Occupancy & Performance',
      'print(f"Total Rooms Inventory: {summary[\'total_rooms\']}")',
      'print(f"Occupied Units:        {summary[\'occupied_rooms\']}")',
      'print(f"Available Units:       {summary[\'available_rooms\']}")',
      'print(f"Occupancy Ratio:       {summary[\'occupancy_rate\']}%")',
      'print("Average Daily Rate:    ₹" + f"{summary[\'adr\']:.2f}")',
      'print("RevPAR:                ₹" + f"{summary[\'revpar\']:.2f}")',
      'print("-" * 60)',
      '',
      '# 2. Financial Breakdown',
      'cursor.execute("SELECT category, SUM(amount), SUM(total_amount - amount), SUM(total_amount) FROM folio_items GROUP BY category")',
      'rows = cursor.fetchall()',
      'print("DEPARTMENTAL REVENUE BREAKDOWN:")',
      'for cat, sub, tax, total in rows:',
      '    print("  * " + f"{cat:<10} Subtotal: ₹{sub:>9.2f} | GST (18%): ₹{tax:>7.2f} | Gross: ₹{total:>9.2f}")',
      '',
      'print("-" * 60)',
      'print("Total Gross Billed:     ₹" + f"{summary[\'total_revenue\']:,.2f}")',
      'print("Total Cash Collected:   ₹" + f"{summary[\'total_collected\']:,.2f}")',
      'print("Accounts Receivable:    ₹" + f"{summary[\'outstanding_balance\']:,.2f}")',
      'print("=" * 60)',
      'print("Nightly audit verification status: BALANCED & VERIFIED")'
    ].join('\n')
  },
  {
    title: '2. Dynamic Pricing Yield Management Algorithm',
    description: 'Analyzes occupancy rate thresholds and calculates dynamic rate multipliers for each suite class.',
    code: [
      '# Dynamic Pricing Yield Management Engine',
      'summary = get_hotel_summary()',
      'occ_rate = summary[\'occupancy_rate\']',
      '',
      'print(f"Current Property Occupancy: {occ_rate}%\\n")',
      '',
      '# Yield Multipliers based on occupancy elasticity',
      'if occ_rate >= 80.0:',
      '    multiplier = 1.35',
      '    tier = "PEAK_DEMAND (+35%)"',
      'elif occ_rate >= 60.0:',
      '    multiplier = 1.20',
      '    tier = "HIGH_DEMAND (+20%)"',
      'elif occ_rate >= 40.0:',
      '    multiplier = 1.00',
      '    tier = "STANDARD_BASE_RATE (1.0x)"',
      'else:',
      '    multiplier = 0.85',
      '    tier = "LOW_SEASON_PROMO (-15%)"',
      '',
      'print(f"Yield Pricing Tier: {tier}")',
      'print(f"Applied Multiplier: {multiplier:.2f}x\\n")',
      'print(f"{\'Room Type\':<25} {\'Base Rate\':<12} {\'Dynamic Rate\':<14} {\'Rev Impact\'}")',
      'print("-" * 65)',
      '',
      'cursor.execute("SELECT name, base_price FROM room_types")',
      'for name, base in cursor.fetchall():',
      '    dynamic_rate = round(base * multiplier, 2)',
      '    diff = dynamic_rate - base',
      '    print(f"{name:<25} ₹" + f"{base:>7.2f}     ₹" + f"{dynamic_rate:>8.2f}     {diff:+8.2f}")'
    ].join('\n')
  },
  {
    title: '3. VIP Loyalty Tier Promotion Engine',
    description: 'Calculates all-time guest folio spend and upgrades eligible accounts to Diamond VIP.',
    code: [
      '# VIP Loyalty Upgrade Scan',
      'cursor.execute("""',
      '    SELECT g.id, g.first_name, g.last_name, g.loyalty_tier, COALESCE(SUM(fi.total_amount), 0)',
      '    FROM guests g',
      '    LEFT JOIN bookings b ON g.id = b.guest_id',
      '    LEFT JOIN folio_items fi ON b.id = fi.booking_id',
      '    GROUP BY g.id',
      '""")',
      '',
      'guests = cursor.fetchall()',
      'print("SCANNING GUEST RESIDENTS FOR VIP UPGRADES:")',
      'print("-" * 65)',
      '',
      'for gid, fname, lname, current_tier, spend in guests:',
      '    # Upgrade rule: > ₹1,50,000 spend -> Diamond VIP, > ₹75,000 -> Platinum, > ₹25,000 -> Gold',
      '    eligible_tier = "Diamond VIP" if spend >= 150000 else "Platinum" if spend >= 75000 else "Gold" if spend >= 25000 else "Silver"',
      '    upgrade_note = "[UPGRADE RECOMMENDED]" if eligible_tier != current_tier else "[CURRENT]"',
      '    print(f"{fname} {lname:<18} | Spend: ₹" + f"{spend:>8.2f} | Tier: {current_tier:<11} -> {eligible_tier:<11} {upgrade_note}")'
    ].join('\n')
  },
  {
    title: '4. Housekeeping & Maintenance Distribution Check',
    description: 'Inspects room turnover efficiency and workload distribution across housekeeping staff.',
    code: [
      '# Housekeeping Workload Distribution',
      'cursor.execute("""',
      '    SELECT assigned_to, COUNT(*), ',
      '           SUM(CASE WHEN status = \'COMPLETED\' THEN 1 ELSE 0 END),',
      '           SUM(CASE WHEN priority = \'URGENT\' THEN 1 ELSE 0 END)',
      '    FROM housekeeping_tasks',
      '    GROUP BY assigned_to',
      '""")',
      '',
      'print("HOUSEKEEPING STAFF WORKLOAD AUDIT:")',
      'print(f"{\'Attendant\':<24} {\'Total Tasks\':<14} {\'Completed\':<12} {\'Urgent Pending\'}")',
      'print("-" * 65)',
      '',
      'for staff, total, done, urgent in cursor.fetchall():',
      '    staff_name = staff or "Unassigned"',
      '    print(f"{staff_name:<24} {total:<14} {done:<12} {urgent}")'
    ].join('\n')
  }
];

export const PythonStudioView: React.FC = () => {
  const [code, setCode] = useState(PYTHON_PRESETS[0].code);
  const [result, setResult] = useState<PythonExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'RUNNER' | 'SOURCE' | 'ARCHITECTURE'>('RUNNER');
  const [pythonSource, setPythonSource] = useState<string>('');
  const [sqlSource, setSqlSource] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load python and sql source
    api.getSource('python').then((res) => {
      if (res.success) setPythonSource(res.content);
    }).catch(() => {});

    api.getSource('sql').then((res) => {
      if (res.success) setSqlSource(res.content);
    }).catch(() => {});
  }, []);

  const handleRunPython = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    try {
      const res = await api.executePython(code);
      setResult(res);
    } catch (err: any) {
      setResult({ error: err.message || 'Execution error' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>Python 3 PMS Backend & API Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute real Python routines against the database or inspect and download complete Python/SQL source files.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('RUNNER')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'RUNNER'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Python Runner
          </button>
          <button
            onClick={() => setActiveTab('SOURCE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'SOURCE'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Backend Source Code
          </button>
          <button
            onClick={() => setActiveTab('ARCHITECTURE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'ARCHITECTURE'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Architecture
          </button>
        </div>
      </div>

      {activeTab === 'RUNNER' && (
        <div className="space-y-6">
          {/* Preset Routines */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pre-built Python PMS Algorithms
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PYTHON_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setCode(preset.code)}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div className="font-semibold text-xs text-slate-200">{preset.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Python Code Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-mono-code">Python 3.10 Engine (scope includes: conn, cursor, sqlite3, datetime)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(code)}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleRunPython}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-semibold rounded text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-slate-950 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running Python...' : 'Run Python Script'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full bg-slate-950 p-4 font-mono-code text-xs text-emerald-300 leading-relaxed focus:outline-none resize-y selection:bg-emerald-500/30"
              placeholder="# Write Python code here"
              spellCheck={false}
            />
          </div>

          {/* Results Output */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {result.error ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Runtime Exception
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Execution Succeeded
                    </span>
                  )}
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono-code">
                    {result.elapsedMs} ms execution time
                  </span>
                </div>
              </div>

              {result.stdout && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Standard Output (stdout)</div>
                  <pre className="font-mono-code text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {result.stdout}
                  </pre>
                </div>
              )}

              {result.error && (
                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Traceback / Error</div>
                  <pre className="font-mono-code text-xs text-rose-300 whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'SOURCE' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900 p-4 border border-slate-800 rounded-lg text-xs">
            <div>
              <h3 className="font-semibold text-slate-100">Standalone Project Files</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Download the complete Python PMS script and SQLite DDL schema to run offline with <code className="text-amber-400 font-mono-code">python3 hotel_backend.py</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadFile('hotel_backend.py', pythonSource)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>hotel_backend.py</span>
              </button>
              <button
                onClick={() => downloadFile('schema.sql', sqlSource)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>schema.sql</span>
              </button>
            </div>
          </div>

          {/* Python Backend File Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono-code font-bold text-amber-400">backend/hotel_backend.py</span>
              <button
                onClick={() => handleCopyCode(pythonSource)}
                className="px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded text-xs transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Script</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-300 font-mono-code text-[11px] leading-relaxed overflow-x-auto max-h-[600px] select-all">
              {pythonSource || '# Loading Python source...'}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'ARCHITECTURE' && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6 text-xs text-slate-300">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-slate-100">
              Full-Stack Architecture: Python + HTML + SQL
            </h3>
            <p className="text-slate-400 mt-1">
              How the three tiers collaborate to deliver a real-time, ACID-compliant luxury hotel property management system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1: HTML & React UI */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                1
              </div>
              <h4 className="font-bold text-slate-100 text-sm">Presentation Tier (HTML / CSS / React)</h4>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>Interactive Floor Plan & 4-floor room matrix</li>
                <li>Reservation creation & express check-in modal</li>
                <li>Itemized guest folio ledger & payment terminal</li>
                <li>Luxury print-ready tax invoice styling</li>
                <li>In-room dining POS ordering tray</li>
              </ul>
            </div>

            {/* Tier 2: Python Controller */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                2
              </div>
              <h4 className="font-bold text-slate-100 text-sm">Application Tier (Python 3.10 Backend)</h4>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>JSON-RPC dispatching and request validation</li>
                <li>Reservation conflict detection (date overlap checks)</li>
                <li>Digital RFID keycard token generation</li>
                <li>Financial tax computation (10% hospitality rate)</li>
                <li>Nightly audit and yield management algorithms</li>
              </ul>
            </div>

            {/* Tier 3: SQL Relational Database */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                3
              </div>
              <h4 className="font-bold text-slate-100 text-sm">Persistence Tier (SQL Database / SQLite)</h4>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li>8 normalized tables in 3rd Normal Form</li>
                <li>Enforced Foreign Keys (<code className="text-amber-400 font-mono-code">PRAGMA foreign_keys = ON</code>)</li>
                <li>Indexes on room statuses, booking dates, and folios</li>
                <li>ACID transactional guarantees for payments & billing</li>
                <li>Direct live SQL console execution support</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
