import React, { useState } from 'react';
import { X, LogOut, CheckCircle2, AlertTriangle, Receipt } from 'lucide-react';
import { Booking } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';

interface CheckOutModalProps {
  booking: Booking;
  onClose: () => void;
  onRefreshAll: () => void;
  onOpenFolio: (bookingId: string) => void;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  booking,
  onClose,
  onRefreshAll,
  onOpenFolio,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const charges = booking.total_charges || 0;
  const paid = booking.total_paid || 0;
  const balance = charges - paid;

  const handleConfirmCheckout = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.checkOut(booking.id);
      if (res.success) {
        onRefreshAll();
        onClose();
      } else {
        alert(`Checkout failed: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Checkout error: ${err.message}`);
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
            <LogOut className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif-luxury font-bold text-slate-100 text-sm">
              Process Guest Departure & Check-Out
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resident Summary */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
          <div className="font-semibold text-slate-100 text-sm">
            {booking.first_name} {booking.last_name}
          </div>
          <div className="text-slate-400">
            Room {booking.room_number || 'N/A'} · {booking.room_type_name}
          </div>
          <div className="text-slate-400 text-[11px]">
            Stay: {booking.check_in_date} → {booking.check_out_date} ({booking.total_nights} Nights)
          </div>
        </div>

        {/* Balance Status */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Total Folio Charges:</span>
            <span className="font-mono-code text-slate-200 font-semibold">{formatINR(charges)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Payments Collected:</span>
            <span className="font-mono-code text-emerald-400 font-semibold">{formatINR(paid)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800/80 pt-1.5 font-bold">
            <span className="text-slate-200">Outstanding Balance:</span>
            <span className={`font-mono-code ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatINR(balance)}
            </span>
          </div>
        </div>

        {balance > 0 ? (
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] space-y-2">
            <div className="flex items-start gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Outstanding balance of {formatINR(balance)} remains unsettled.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFolio(booking.id);
              }}
              className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Settle Payment in Folio First</span>
            </button>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded text-emerald-300 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Folio account is balanced. Ready for final departure.</span>
          </div>
        )}

        <div className="text-[11px] text-slate-500">
          Note: Checking out will set Room {booking.room_number} to <span className="text-amber-400">DIRTY / TURNOVER</span> and generate an automated cleaning order.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCheckout}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded cursor-pointer"
          >
            {isSubmitting ? 'Finalizing Checkout...' : 'Confirm Check-Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
