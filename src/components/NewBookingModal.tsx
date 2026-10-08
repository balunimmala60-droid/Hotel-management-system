import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Building, 
  User, 
  DollarSign, 
  Sparkles, 
  Crown,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { RoomType, Room, Guest } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';

interface NewBookingModalProps {
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  onClose: () => void;
  onRefreshAll: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  roomTypes,
  rooms,
  guests,
  onClose,
  onRefreshAll,
}) => {
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [selectedGuestId, setSelectedGuestId] = useState(guests[0]?.id || '');
  
  // New Guest Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loyaltyTier, setLoyaltyTier] = useState('Silver');
  const [isVip, setIsVip] = useState(false);
  const [guestNotes, setGuestNotes] = useState('');

  // Stay Form Fields
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(roomTypes[0]?.id || 'RT-DLX');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [autoCheckIn, setAutoCheckIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate nights
  const dIn = new Date(checkInDate);
  const dOut = new Date(checkOutDate);
  const diffTime = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
  const totalNights = isNaN(diffTime) || diffTime <= 0 ? 1 : diffTime;

  // Selected room type details
  const selectedType = roomTypes.find((rt) => rt.id === selectedRoomTypeId) || roomTypes[0];
  const nightlyRate = selectedType ? selectedType.base_price : 6500.0;
  const subtotal = nightlyRate * totalNights;
  const tax = subtotal * 0.18;
  const totalEstimated = subtotal + tax;

  // Available rooms for this room type
  const availableRoomsForType = rooms.filter(
    (r) => r.room_type_id === selectedRoomTypeId && r.status === 'AVAILABLE'
  );

  // Set default room number if available
  React.useEffect(() => {
    if (availableRoomsForType.length > 0) {
      setSelectedRoomNumber(availableRoomsForType[0].room_number);
    } else {
      setSelectedRoomNumber('');
    }
  }, [selectedRoomTypeId, rooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        room_type_id: selectedRoomTypeId,
        room_number: selectedRoomNumber || null,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_nights: totalNights,
        guests_count: guestsCount,
        nightly_rate: nightlyRate,
        special_requests: specialRequests,
        auto_checkin: autoCheckIn
      };

      if (isNewGuest) {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
          alert('Please enter guest name and email address.');
          setIsSubmitting(false);
          return;
        }
        payload.first_name = firstName.trim();
        payload.last_name = lastName.trim();
        payload.email = email.trim();
        payload.phone = phone.trim() || '+1 555-0199';
        payload.loyalty_tier = loyaltyTier;
        payload.vip_status = isVip;
        payload.guest_notes = guestNotes;
      } else {
        payload.guest_id = selectedGuestId;
      }

      const res = await api.createBooking(payload);
      if (res.success) {
        onRefreshAll();
        onClose();
      } else {
        alert(`Failed to create reservation: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Booking creation error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-slate-100 text-base">
                Create New Hotel Reservation
              </h3>
              <p className="text-xs text-slate-400">
                Book luxury accommodation, assign room inventory, and establish folio ledger.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. Guest Resident Selection */}
          <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Guest Profile
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewGuest(true)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    isNewGuest ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  New Guest
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewGuest(false)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    !isNewGuest ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Existing Directory
                </button>
              </div>
            </div>

            {isNewGuest ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victoria"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sterling"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. victoria@horizon.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-400 mb-1">Loyalty Tier</label>
                    <select
                      value={loyaltyTier}
                      onChange={(e) => setLoyaltyTier(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    >
                      <option value="Silver">Silver Member</option>
                      <option value="Gold">Gold Elite</option>
                      <option value="Platinum">Platinum Member</option>
                      <option value="Diamond VIP">Diamond VIP</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="vipCheck"
                      checked={isVip}
                      onChange={(e) => setIsVip(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="vipCheck" className="text-slate-300 font-medium cursor-pointer flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Mark as VIP Resident
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-400 mb-1">Select Guest Record</label>
                <select
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.first_name} {g.last_name} ({g.loyalty_tier}) · {g.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Room Type & Dates */}
          <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              Suite Selection & Stay Dates
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Check-In Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono-code"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Check-Out Date</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono-code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Suite Category</label>
                <select
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-semibold"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} ({formatINR(rt.base_price)}/nt)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assign Physical Room</label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                >
                  {availableRoomsForType.length === 0 ? (
                    <option value="">No clean room ready (Unassigned)</option>
                  ) : (
                    availableRoomsForType.map((r) => (
                      <option key={r.room_number} value={r.room_number}>
                        Room {r.room_number} (Floor {r.floor} · {r.view_type})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Special Requests / Preferences</label>
              <input
                type="text"
                placeholder="e.g., High floor away from elevator, complimentary champagne, extra towels."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>

            {/* Instant Check-In Toggle */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoCheckIn"
                checked={autoCheckIn}
                onChange={(e) => setAutoCheckIn(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <label htmlFor="autoCheckIn" className="text-slate-200 cursor-pointer flex items-center gap-1 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                Express Check-In Now (Issue RFID Key immediately)
              </label>
            </div>
          </div>

          {/* 3. Estimated Financial Pricing Preview */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Stay Duration & Rate</span>
              <span className="font-semibold text-slate-200">
                {totalNights} {totalNights === 1 ? 'Night' : 'Nights'} @ {formatINR(nightlyRate)}/night
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Total Est. Folio (incl. 18% GST)</span>
              <span className="font-serif-luxury font-bold text-amber-400 text-base">
                {formatINR(totalEstimated)}
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-md shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming with SQLite...' : 'Confirm & Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
