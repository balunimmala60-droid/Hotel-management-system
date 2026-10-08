import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Clock, 
  Table, 
  Download, 
  FileCode, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { SqlQueryResult } from '../types';
import { api } from '../services/api';

const PRESET_QUERIES = [
  {
    title: '1. Revenue & Occupancy by Suite Type',
    description: 'Calculates total rooms, occupied count, and total gross revenue generated grouped by room category.',
    sql: `-- Revenue and Occupancy breakdown by Room Category
SELECT 
    rt.category AS "Category",
    rt.name AS "Suite Type",
    COUNT(r.room_number) AS "Total Inventory",
    SUM(CASE WHEN r.status = 'OCCUPIED' THEN 1 ELSE 0 END) AS "Occupied Count",
    ROUND(CAST(SUM(CASE WHEN r.status = 'OCCUPIED' THEN 1 ELSE 0 END) AS REAL) / COUNT(r.room_number) * 100, 1) || '%' AS "Occupancy Rate",
    COALESCE(SUM(fi.total_amount), 0.0) AS "Total Gross Billed (₹)"
FROM room_types rt
JOIN rooms r ON rt.id = r.room_type_id
LEFT JOIN bookings b ON r.room_number = b.room_number
LEFT JOIN folio_items fi ON b.id = fi.booking_id
GROUP BY rt.id
ORDER BY "Total Gross Billed (₹)" DESC;`
  },
  {
    title: '2. Departing Guests with Unpaid Folios',
    description: 'Finds currently checked-in guests with an outstanding balance due on their account.',
    sql: `-- Find in-house guests with unpaid balance due
SELECT 
    b.id AS "Booking ID",
    g.first_name || ' ' || g.last_name AS "Guest Name",
    b.room_number AS "Room",
    b.check_out_date AS "Departure Date",
    COALESCE((SELECT SUM(total_amount) FROM folio_items WHERE booking_id = b.id), 0.0) AS "Total Charges (₹)",
    COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0.0) AS "Total Paid (₹)",
    ROUND(
        COALESCE((SELECT SUM(total_amount) FROM folio_items WHERE booking_id = b.id), 0.0) -
        COALESCE((SELECT SUM(amount) FROM payments WHERE booking_id = b.id), 0.0), 2
    ) AS "Balance Due (₹)"
FROM bookings b
JOIN guests g ON b.guest_id = g.id
WHERE b.status = 'CHECKED_IN'
ORDER BY "Balance Due (₹)" DESC;`
  },
  {
    title: '3. Top Spending VIP Guests',
    description: 'Ranks guests by all-time spending across room accommodations, spa, and dining.',
    sql: `-- Top spending guests across the resort
SELECT 
    g.id AS "Guest ID",
    g.first_name || ' ' || g.last_name AS "Guest Name",
    g.loyalty_tier AS "Loyalty Tier",
    g.email AS "Email",
    COUNT(DISTINCT b.id) AS "Total Stays",
    COALESCE(SUM(fi.total_amount), 0.0) AS "Lifetime Spend (₹)"
FROM guests g
JOIN bookings b ON g.id = b.guest_id
JOIN folio_items fi ON b.id = fi.booking_id
GROUP BY g.id
ORDER BY "Lifetime Spend (₹)" DESC
LIMIT 5;`
  },
  {
    title: '4. Housekeeping Backlog & Priority Tickets',
    description: 'Inspects pending and in-progress turnover tasks ordered by urgency.',
    sql: `-- Housekeeping priority queue
SELECT 
    h.id AS "Task ID",
    h.room_number AS "Room",
    r.status AS "Room Status",
    h.task_type AS "Task Type",
    h.priority AS "Priority",
    h.status AS "Task Status",
    h.assigned_to AS "Attendant",
    h.reported_issue AS "Instructions"
FROM housekeeping_tasks h
JOIN rooms r ON h.room_number = r.room_number
WHERE h.status != 'COMPLETED'
ORDER BY 
    CASE h.priority 
        WHEN 'URGENT' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'NORMAL' THEN 3 
        ELSE 4 
    END;`
  },
  {
    title: '5. In-Room Dining Revenue by Category',
    description: 'Summarizes menu catalog pricing and availability.',
    sql: `-- Room Service Menu Catalog
SELECT 
    category AS "Menu Category",
    COUNT(*) AS "Item Count",
    ROUND(AVG(price), 2) AS "Average Price (₹)",
    MIN(price) AS "Min Price (₹)",
    MAX(price) AS "Max Price (₹)"
FROM room_service_menu
GROUP BY category
ORDER BY "Average Price (₹)" DESC;`
  }
];

export const SqlStudioView: React.FC = () => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'SCHEMA'>('CONSOLE');

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    try {
      const data = await api.executeSql(query);
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message || 'Execution error' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    if (!result || !result.columns || !result.rows) return;
    const header = result.columns.map(c => `"${c}"`).join(',');
    const rows = result.rows.map(r => r.map(val => `"${val ?? ''}"`).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + [header, rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hotel_query_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span>Interactive SQL Database Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute native SQL statements directly against the live relational SQLite database (<code className="text-amber-400 font-mono-code">hotel.db</code>).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('CONSOLE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'CONSOLE'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Query Console
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeTab === 'SCHEMA'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Database Schema & DDL
          </button>
        </div>
      </div>

      {activeTab === 'CONSOLE' ? (
        <div className="space-y-6">
          {/* Preset Queries Toolbar */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Preset Analytical SQL Queries
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset.sql);
                  }}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div className="font-semibold text-xs text-slate-200">{preset.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-mono-code">SQLite 3 Console (PRAGMA foreign_keys = ON)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>

                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold rounded text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-slate-950 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={8}
              className="w-full bg-slate-950 p-4 font-mono-code text-xs text-amber-200/90 leading-relaxed focus:outline-none resize-y selection:bg-amber-500/30"
              placeholder="SELECT * FROM rooms WHERE status = 'OCCUPIED';"
              spellCheck={false}
            />
          </div>

          {/* Results Area */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  {result.error ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      SQL Error
                    </span>
                  ) : (
                    <>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Query Executed
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">
                        {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'} returned
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-400 font-mono-code">
                        {result.elapsedMs} ms latency
                      </span>
                    </>
                  )}
                </div>

                {!result.error && result.rows && result.rows.length > 0 && (
                  <button
                    onClick={exportCsv}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>

              {result.error ? (
                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-lg text-xs font-mono-code text-rose-300">
                  {result.error}
                </div>
              ) : result.columns && result.rows ? (
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 font-semibold font-mono-code text-[11px]">
                      <tr>
                        {result.columns.map((col, idx) => (
                          <th key={idx} className="py-2.5 px-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono-code text-[11px]">
                      {result.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 text-slate-200 whitespace-nowrap">
                              {cell === null ? (
                                <span className="text-slate-600 italic">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        /* Schema & DDL Explorer */
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
            The Hotel Management System uses a 3rd Normal Form (3NF) relational database schema designed for high transactional consistency, audit compliance, and speed. Foreign key constraints are strictly enforced.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'rooms',
                pk: 'room_number (TEXT)',
                desc: 'Physical room inventory, floor level, view type, operational status, and cleanliness state.',
                cols: ['room_number (PK)', 'floor (INT)', 'room_type_id (FK)', 'status (TEXT)', 'cleanliness (TEXT)', 'view_type (TEXT)', 'notes (TEXT)']
              },
              {
                name: 'room_types',
                pk: 'id (TEXT)',
                desc: 'Suite categories, nightly pricing base, bed arrangements, square footage, and luxury amenities.',
                cols: ['id (PK)', 'name (TEXT)', 'category (TEXT)', 'base_price (REAL)', 'max_guests (INT)', 'bed_type (TEXT)', 'size_sqft (INT)', 'amenities (TEXT)']
              },
              {
                name: 'guests',
                pk: 'id (TEXT)',
                desc: 'Guest resident profiles, VIP tiers, contact coordinates, passport ID, and personal preferences.',
                cols: ['id (PK)', 'first_name (TEXT)', 'last_name (TEXT)', 'email (TEXT UNIQUE)', 'phone (TEXT)', 'loyalty_tier (TEXT)', 'vip_status (INT)', 'notes (TEXT)']
              },
              {
                name: 'bookings',
                pk: 'id (TEXT)',
                desc: 'Reservations ledger linking guest to room, check-in/out dates, agreed nightly rate, and keycard.',
                cols: ['id (PK)', 'guest_id (FK)', 'room_number (FK)', 'room_type_id (FK)', 'check_in_date (TEXT)', 'check_out_date (TEXT)', 'nightly_rate (REAL)', 'status (TEXT)']
              },
              {
                name: 'folio_items',
                pk: 'id (TEXT)',
                desc: 'Itemized billing charges: room nights, in-room dining, spa therapies, mini-bar, and 10% tax.',
                cols: ['id (PK)', 'booking_id (FK)', 'category (TEXT)', 'description (TEXT)', 'amount (REAL)', 'tax_rate (REAL)', 'total_amount (REAL)']
              },
              {
                name: 'payments',
                pk: 'id (TEXT)',
                desc: 'Settlement transactions: Credit Card, Amex, Cash, Bank Transfer with payment auth reference.',
                cols: ['id (PK)', 'booking_id (FK)', 'amount (REAL)', 'payment_method (TEXT)', 'transaction_ref (TEXT)', 'status (TEXT)']
              },
              {
                name: 'housekeeping_tasks',
                pk: 'id (TEXT)',
                desc: 'Cleaning turnover queues, priority levels (Urgent/High/Normal), and attendant assignments.',
                cols: ['id (PK)', 'room_number (FK)', 'task_type (TEXT)', 'priority (TEXT)', 'status (TEXT)', 'assigned_to (TEXT)', 'scheduled_date (TEXT)']
              },
              {
                name: 'room_service_menu',
                pk: 'id (TEXT)',
                desc: 'Culinary items, wine bottles, pricing, and live kitchen availability.',
                cols: ['id (PK)', 'category (TEXT)', 'name (TEXT)', 'description (TEXT)', 'price (REAL)', 'is_available (INT)']
              }
            ].map((tbl) => (
              <div key={tbl.name} className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code font-bold text-amber-400 text-sm">
                    {tbl.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-code">
                    {tbl.pk}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{tbl.desc}</p>
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Columns</div>
                  <div className="flex flex-wrap gap-1">
                    {tbl.cols.map((col, cIdx) => (
                      <span key={cIdx} className="text-[10px] font-mono-code text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
