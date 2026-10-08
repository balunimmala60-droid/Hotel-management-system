import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Crown, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText,
  UserCheck
} from 'lucide-react';
import { Guest, Booking } from '../types';

interface GuestDirectoryViewProps {
  guests: Guest[];
  bookings: Booking[];
  onOpenFolio: (bookingId: string) => void;
}

export const GuestDirectoryView: React.FC<GuestDirectoryViewProps> = ({
  guests,
  bookings,
  onOpenFolio,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const filteredGuests = guests.filter((g) => {
    if (selectedTier !== 'ALL' && g.loyalty_tier !== selectedTier) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${g.first_name} ${g.last_name}`.toLowerCase().includes(q);
      const matchEmail = g.email.toLowerCase().includes(q);
      const matchPhone = g.phone.toLowerCase().includes(q);
      const matchNotes = g.notes?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchNotes) return false;
    }

    return true;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond VIP':
        return 'text-amber-400 font-bold';
      case 'Platinum':
        return 'text-sky-300 font-semibold';
      case 'Gold':
        return 'text-amber-200 font-medium';
      case 'Silver':
        return 'text-slate-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Guest Resident Directory & Loyalty</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            VIP member portfolios, stay preferences, lifetime activity, and reservation histories.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest name, email, phone, preferences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Tier filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Tiers' },
            { id: 'Diamond VIP', label: 'Diamond VIP' },
            { id: 'Platinum', label: 'Platinum' },
            { id: 'Gold', label: 'Gold' },
            { id: 'Silver', label: 'Silver' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedTier === t.id
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => {
          const guestBookings = bookings.filter((b) => b.guest_id === guest.id);
          const activeStay = guestBookings.find((b) => b.status === 'CHECKED_IN');

          return (
            <div
              key={guest.id}
              className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm">
                        {guest.first_name} {guest.last_name}
                      </span>
                      {guest.vip_status === 1 && (
                        <span title="VIP Guest">
                          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5">
                      <span className={getTierColor(guest.loyalty_tier)}>
                        {guest.loyalty_tier}
                      </span>
                      <span className="text-slate-500 font-mono-code text-[11px] ml-2">
                        {guest.id}
                      </span>
                    </div>
                  </div>

                  {activeStay && (
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        In-House
                      </span>
                      <div className="text-xs font-mono-code text-slate-300">
                        Room {activeStay.room_number}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Coordinates (Zero-pill text styling) */}
                <div className="space-y-1.5 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{guest.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{guest.phone}</span>
                  </div>
                  {guest.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{guest.address}</span>
                    </div>
                  )}
                </div>

                {/* Preferences & Notes */}
                {guest.notes && (
                  <div className="mt-3 p-2 bg-slate-950/60 border border-slate-800 rounded text-[11px] text-amber-300/90 italic">
                    "{guest.notes}"
                  </div>
                )}
              </div>

              {/* Stays History */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Total Stays: <span className="font-mono-code text-slate-200 font-bold">{guestBookings.length}</span>
                </span>

                {activeStay && (
                  <button
                    onClick={() => onOpenFolio(activeStay.id)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-xs transition-colors cursor-pointer"
                  >
                    View Active Folio
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
