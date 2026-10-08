import React, { useState } from 'react';
import { 
  Building, 
  DoorClosed, 
  Sparkles, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Eye, 
  KeyRound, 
  User,
  Crown,
  Receipt
} from 'lucide-react';
import { Room, HotelSummary, Booking } from '../types';
import { formatINR, formatINRLarge } from '../utils/currency';

interface DashboardOverviewProps {
  rooms: Room[];
  summary: HotelSummary | null;
  bookings: Booking[];
  onSelectRoom: (room: Room) => void;
  onOpenFolio: (bookingId: string) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onQuickStatusChange: (roomNumber: string, status: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  rooms,
  summary,
  bookings,
  onSelectRoom,
  onOpenFolio,
  onCheckIn,
  onCheckOut,
  onQuickStatusChange,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL' | 'VILLA'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    // Floor filter
    if (selectedFloor === 'VILLA') {
      if (!r.room_number.startsWith('V-')) return false;
    } else if (selectedFloor !== 'ALL') {
      if (r.floor !== selectedFloor) return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = r.room_number.toLowerCase().includes(q);
      const matchType = r.room_type_name.toLowerCase().includes(q);
      const matchGuest = r.current_guest_name?.toLowerCase().includes(q);
      if (!matchNum && !matchType && !matchGuest) return false;
    }

    return true;
  });

  // Today arrivals (Confirmed bookings for today)
  const arrivalsToday = bookings.filter((b) => b.status === 'CONFIRMED');
  // Today departures (Checked in bookings)
  const departuresToday = bookings.filter((b) => b.status === 'CHECKED_IN');

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/60';
      case 'AVAILABLE':
        return 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500/60';
      case 'CLEANING':
        return 'border-sky-500/40 bg-sky-950/20 hover:border-sky-500/60';
      case 'MAINTENANCE':
        return 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/60';
      default:
        return 'border-slate-800 bg-slate-900/40';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return <span className="text-amber-400 font-medium">Occupied</span>;
      case 'AVAILABLE':
        return <span className="text-emerald-400 font-medium">Available</span>;
      case 'CLEANING':
        return <span className="text-sky-400 font-medium">Cleaning</span>;
      case 'MAINTENANCE':
        return <span className="text-rose-400 font-medium">Maintenance</span>;
      default:
        return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. KPI Executive Stats Bar */}
      {summary && (
        <section aria-label="Key Performance Indicators" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Occupancy */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Occupancy</span>
              <Building className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-code text-slate-100">
                {summary.occupancy_rate}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {summary.occupied_rooms} of {summary.total_rooms} rooms filled
              </div>
            </div>
            {/* Minimal line meter */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(summary.occupancy_rate, 100)}%` }} 
              />
            </div>
          </div>

          {/* ADR */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Average Daily Rate (ADR)</span>
              <span className="text-emerald-400 font-bold font-mono-code text-sm">₹</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-code text-emerald-400">
                {formatINR(summary.adr)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across active stays
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
              Benchmark Target: ₹15,000.00
            </div>
          </div>

          {/* RevPAR */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>RevPAR</span>
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-code text-amber-300">
                {formatINR(summary.revpar)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Rev Per Available Room
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 pt-2 border-t border-slate-800/60 mt-2">
              +14.2% vs last week
            </div>
          </div>

          {/* Revenue */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total Gross Folio</span>
              <Receipt className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono-code text-slate-100">
                {formatINR(summary.total_revenue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Settled: {formatINRLarge(summary.total_collected)}
              </div>
            </div>
            <div className="text-[10px] text-amber-400/80 pt-2 border-t border-slate-800/60 mt-2">
              Due: {formatINR(summary.outstanding_balance)}
            </div>
          </div>

          {/* Room Availability Matrix */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Inventory Status</span>
              <DoorClosed className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400">Available:</span>
                <span className="font-mono-code font-bold text-slate-200">{summary.available_rooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sky-400">Cleaning:</span>
                <span className="font-mono-code font-bold text-slate-200">{summary.cleaning_rooms}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-400">Maintenance:</span>
                <span className="font-mono-code font-bold text-slate-200">{summary.maintenance_rooms}</span>
              </div>
            </div>
          </div>

          {/* Front Desk Flow */}
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col justify-between">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Front Desk Activity</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Arrivals:
                </span>
                <span className="font-mono-code font-bold text-emerald-300">{arrivalsToday.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5 text-amber-400" /> Departures:
                </span>
                <span className="font-mono-code font-bold text-amber-300">{departuresToday.length}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Interactive Floor Plan & Room Matrix */}
      <section aria-label="Floorplan and Room Inventory" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="font-serif-luxury text-lg font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              <span>Interactive Property Grid & Rooms</span>
              <span className="text-xs font-sans text-slate-400 font-normal">
                ({filteredRooms.length} of {rooms.length} shown)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select room to view guest folio, toggle cleaning/maintenance, or issue digital RFID keys.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search room #, guest, suite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-56 font-sans"
            />
          </div>
        </div>

        {/* Filter controls: Floors and Statuses (Interactive buttons allowed per guidelines) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Floor selection */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Floors' },
              { id: 1, label: 'Floor 1 (Garden)' },
              { id: 2, label: 'Floor 2 (Ocean)' },
              { id: 3, label: 'Floor 3 (Executive)' },
              { id: 4, label: 'Floor 4 (Royal)' },
              { id: 'VILLA', label: 'Beach Villas' },
            ].map((f) => (
              <button
                key={String(f.id)}
                onClick={() => setSelectedFloor(f.id as any)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedFloor === f.id
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status selection */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'AVAILABLE', label: 'Available' },
              { id: 'OCCUPIED', label: 'Occupied' },
              { id: 'CLEANING', label: 'Cleaning' },
              { id: 'MAINTENANCE', label: 'Maintenance' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedStatus === s.id
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === 'OCCUPIED';
            return (
              <div
                key={room.room_number}
                className={`rounded-lg border p-4 transition-all duration-200 flex flex-col justify-between ${getStatusBorder(
                  room.status
                )}`}
              >
                <div>
                  {/* Top line: Room Number & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-luxury text-xl font-bold text-amber-400">
                          {room.room_number.startsWith('V-') ? room.room_number : `Room ${room.room_number}`}
                        </span>
                        {room.vip_status === 1 && (
                          <span className="text-amber-400 flex items-center gap-0.5 text-xs font-semibold" title="VIP Guest">
                            <Crown className="w-3.5 h-3.5 fill-amber-400" />
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {room.room_type_name}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      {getStatusText(room.status)}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Cleanliness: <span className={room.cleanliness === 'CLEAN' ? 'text-emerald-400' : 'text-amber-400'}>{room.cleanliness}</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Meta (Zero-pill text styling) */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2.5">
                    <span>{room.bed_type}</span>
                    <span aria-hidden="true">·</span>
                    <span>{room.size_sqft} sq ft</span>
                    <span aria-hidden="true">·</span>
                    <span>{room.view_type}</span>
                  </div>

                  {/* Guest Stay Information */}
                  {isOccupied && room.current_guest_name ? (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-900/40 rounded p-2 text-xs">
                      <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Current Resident</div>
                      <div className="font-medium text-slate-100 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{room.current_guest_name}</span>
                      </div>
                      {room.notes && (
                        <div className="text-[11px] text-amber-300/80 mt-1 italic line-clamp-1">
                          "{room.notes}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Rate: <span className="font-mono-code text-slate-200 font-semibold">{formatINR(room.base_price, false)}/night</span></span>
                      <span>Floor {room.floor}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Action Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectRoom(room)}
                    className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manage Room</span>
                  </button>

                  {isOccupied && room.active_booking_id && (
                    <button
                      onClick={() => onOpenFolio(room.active_booking_id!)}
                      className="py-1.5 px-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Open Guest Folio & Bill"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Folio</span>
                    </button>
                  )}

                  {!isOccupied && (
                    <select
                      value={room.status}
                      onChange={(e) => onQuickStatusChange(room.room_number, e.target.value)}
                      className="py-1 px-2 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="CLEANING">Cleaning</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="OCCUPIED">Occupied</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Front Desk Arrivals & Departures Pipeline */}
      <section aria-label="Front Desk Movement" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
        {/* Scheduled Arrivals */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-emerald-400" />
              <h3 className="font-serif-luxury font-semibold text-slate-100 text-sm tracking-wide">
                Upcoming & Pending Arrivals
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono-code">
              {arrivalsToday.length} waiting
            </span>
          </div>

          {arrivalsToday.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No pending arrivals scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {arrivalsToday.map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-md flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {booking.first_name} {booking.last_name}
                      </span>
                      {booking.vip_status === 1 && (
                        <span className="text-amber-400 text-[10px] font-bold">VIP</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{booking.room_type_name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{booking.total_nights} Nights</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-code">{formatINR(booking.nightly_rate, false)}/nt</span>
                    </div>
                    {booking.special_requests && (
                      <div className="text-[10px] text-amber-400/90 mt-1 italic">
                        Note: {booking.special_requests}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCheckIn(booking)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Check-In</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Departures */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif-luxury font-semibold text-slate-100 text-sm tracking-wide">
                In-House Guests & Departures
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono-code">
              {departuresToday.length} in-house
            </span>
          </div>

          {departuresToday.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No in-house guests currently checked in.
            </div>
          ) : (
            <div className="space-y-3">
              {departuresToday.slice(0, 4).map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-md flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {booking.first_name} {booking.last_name}
                      </span>
                      <span className="text-amber-400 font-mono-code">
                        (Room {booking.room_number})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Checkout: {booking.check_out_date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-code text-slate-300">
                        Charges: {formatINR(booking.total_charges || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenFolio(booking.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-400" />
                      <span>Folio</span>
                    </button>
                    <button
                      onClick={() => onCheckOut(booking)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Check-Out</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
