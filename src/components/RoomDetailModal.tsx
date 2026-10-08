import React, { useState } from 'react';
import { 
  X, 
  DoorClosed, 
  Sparkles, 
  Wrench, 
  User, 
  Receipt, 
  Check, 
  Crown,
  KeyRound,
  FileText
} from 'lucide-react';
import { Room, RoomStatus, CleanlinessStatus } from '../types';
import { api } from '../services/api';

interface RoomDetailModalProps {
  room: Room;
  onClose: () => void;
  onRefreshAll: () => void;
  onOpenFolio: (bookingId: string) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onRefreshAll,
  onOpenFolio
}) => {
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const [cleanliness, setCleanliness] = useState<CleanlinessStatus>(room.cleanliness);
  const [notes, setNotes] = useState(room.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateRoomStatus({
        room_number: room.room_number,
        status,
        cleanliness,
        notes: notes.trim()
      });
      onRefreshAll();
      onClose();
    } catch (err: any) {
      alert(`Error updating room: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full my-auto shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury font-bold text-amber-400 text-lg">
                Room {room.room_number}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                · {room.room_type_name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Floor {room.floor} · {room.view_type} · {room.bed_type}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Active Guest Info if occupied */}
          {room.status === 'OCCUPIED' && room.current_guest_name && (
            <div className="p-3 bg-slate-950/80 border border-amber-500/30 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Current In-House Resident
                </span>
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{room.current_guest_name}</span>
                  {room.vip_status === 1 && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                </div>
              </div>

              {room.active_booking_id && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFolio(room.active_booking_id!);
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View Folio</span>
                </button>
              )}
            </div>
          )}

          {/* Operational Status Dropdown */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Occupancy Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RoomStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="CLEANING">Cleaning / Turnover</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OUT_OF_ORDER">Out of Order</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                Cleanliness State
              </label>
              <select
                value={cleanliness}
                onChange={(e) => setCleanliness(e.target.value as CleanlinessStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="CLEAN">Clean</option>
                <option value="INSPECTED">Inspected & Verified</option>
                <option value="DIRTY">Dirty</option>
                <option value="IN_PROGRESS">Cleaning In Progress</option>
              </select>
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Housekeeping / Engineering Room Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. VIP guest requested extra pillows, terrace door latch inspected."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
