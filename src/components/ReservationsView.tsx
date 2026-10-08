import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  KeyRound, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  CreditCard,
  Plus
} from 'lucide-react';
import { Booking, Room } from '../types';
import { formatINR } from '../utils/currency';

interface ReservationsViewProps {
  bookings: Booking[];
  rooms: Room[];
  onOpenFolio: (bookingId: string) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onOpenNewBooking: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  bookings,
  rooms,
  onOpenFolio,
  onCheckIn,
  onCheckOut,
  onOpenNewBooking,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT'>('ALL');

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase().includes(q);
      const matchId = (b.id || '').toLowerCase().includes(q);
      const matchRoom = b.room_number ? b.room_number.toLowerCase().includes(q) : false;
      const matchEmail = b.email ? b.email.toLowerCase().includes(q) : false;
      if (!matchName && !matchId && !matchRoom && !matchEmail) return false;
    }

    return true;
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-sky-400 font-medium">Confirmed</span>;
      case 'CHECKED_IN':
        return <span className="text-emerald-400 font-medium">Checked In</span>;
      case 'CHECKED_OUT':
        return <span className="text-slate-400 font-medium">Checked Out</span>;
      case 'CANCELLED':
        return <span className="text-rose-400 font-medium">Cancelled</span>;
      default:
        return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-400" />
            <span>Reservations & Stay Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming bookings, room assignments, active resident stays, and digital RFID keycards.
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold rounded-md text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest, booking code (GH-...), room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Status segment filter (Buttons allowed for interactive filters) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Bookings' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'CHECKED_IN', label: 'Checked In' },
            { id: 'CHECKED_OUT', label: 'Checked Out' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Guest Information</th>
                <th className="py-3 px-4">Room & Category</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Folio Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No reservations matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const charges = b.total_charges || 0;
                  const paid = b.total_paid || 0;
                  const balance = charges - paid;

                  return (
                    <tr key={b.id} className="hover:bg-slate-850/40 transition-colors">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4 font-mono-code font-medium text-amber-400">
                        {b.id}
                        {b.keycard_code && (
                          <div className="text-[10px] text-slate-400 font-mono-code mt-0.5 flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-emerald-400" />
                            {b.keycard_code}
                          </div>
                        )}
                      </td>

                      {/* Guest Info (Zero-pill text styling) */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{b.first_name} {b.last_name}</span>
                          {b.vip_status === 1 && (
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                              · VIP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.email} · {b.phone}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Tier: <span className="text-slate-300 font-medium">{b.loyalty_tier}</span>
                        </div>
                      </td>

                      {/* Room & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {b.room_number ? `Room ${b.room_number}` : <span className="text-amber-400/90 italic">Unassigned</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.room_type_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-code">
                          {formatINR(b.nightly_rate, false)}/night
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">
                          {b.check_in_date} → {b.check_out_date}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.total_nights} Nights · {b.guests_count} {b.guests_count === 1 ? 'Guest' : 'Guests'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusDisplay(b.status)}
                      </td>

                      {/* Folio Total */}
                      <td className="py-3.5 px-4 font-mono-code">
                        <div className="text-slate-200 font-semibold">
                          {formatINR(charges)}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {balance > 0 ? (
                            <span className="text-amber-400">Due: {formatINR(balance)}</span>
                          ) : (
                            <span className="text-emerald-400">Paid in Full</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenFolio(b.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Open Detailed Folio & Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5 text-amber-400" />
                            <span>Folio</span>
                          </button>

                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => onCheckIn(b)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Process Guest Check-In & Issue RFID Key"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Check-In</span>
                            </button>
                          )}

                          {b.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => onCheckOut(b)}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Process Check-Out"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Check-Out</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
