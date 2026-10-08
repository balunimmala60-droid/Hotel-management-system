import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, User, Building, AlertCircle } from 'lucide-react';
import { Booking, Room } from '../types';
import { api } from '../services/api';

interface CheckInModalProps {
  booking: Booking;
  rooms: Room[];
  onClose: () => void;
  onRefreshAll: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  booking,
  rooms,
  onClose,
  onRefreshAll
}) => {
  // Available rooms for this room type or currently assigned room
  const availableRooms = rooms.filter(
    (r) => (r.status === 'AVAILABLE' && r.room_type_id === booking.room_type_id) || r.room_number === booking.room_number
  );

  const [selectedRoom, setSelectedRoom] = useState<string>(
    booking.room_number || (availableRooms[0]?.room_number || '')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedKeycard, setIssuedKeycard] = useState<string | null>(null);

  const handleCompleteCheckIn = async () => {
    if (!selectedRoom) {
      alert('Please select a room to assign.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.checkIn(booking.id, selectedRoom);
      if (res.success) {
        setIssuedKeycard(res.keycard_code);
        onRefreshAll();
      } else {
        alert(`Check-in failed: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Check-in error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl text-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif-luxury font-bold text-slate-100 text-sm">
              Express Guest Check-In
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {issuedKeycard ? (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-serif-luxury text-base font-bold text-slate-100">
              Check-In Successful!
            </h4>
            <p className="text-slate-400 text-xs">
              Resident <span className="font-semibold text-slate-200">{booking.first_name} {booking.last_name}</span> has been checked into <span className="text-amber-400 font-bold">Room {selectedRoom}</span>.
            </p>
            <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Issued Digital RFID Key</span>
              <div className="font-mono-code text-sm font-bold text-emerald-400 mt-0.5">
                {issuedKeycard}
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Guest Details */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span>{booking.first_name} {booking.last_name}</span>
                <span className="text-amber-400 font-mono-code">{booking.id}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                {booking.room_type_name} · {booking.total_nights} Nights ({booking.check_in_date} → {booking.check_out_date})
              </div>
              {booking.special_requests && (
                <div className="text-amber-400/90 text-[11px] italic">
                  Note: {booking.special_requests}
                </div>
              )}
            </div>

            {/* Room Assignment */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Assign / Confirm Room
              </label>
              {availableRooms.length === 0 ? (
                <div className="p-2 bg-rose-950/20 border border-rose-500/30 rounded text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No ready rooms for this suite type. Please inspect housekeeping turnover.</span>
                </div>
              ) : (
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                >
                  {availableRooms.map((r) => (
                    <option key={r.room_number} value={r.room_number}>
                      Room {r.room_number} (Floor {r.floor} · {r.view_type})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCheckIn}
                disabled={isSubmitting || !selectedRoom}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Issuing RFID Key...' : 'Complete Check-In'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
