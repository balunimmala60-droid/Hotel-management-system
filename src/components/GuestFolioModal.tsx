import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  Plus, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  DollarSign, 
  AlertCircle,
  FileText,
  Building,
  User,
  Calendar,
  KeyRound
} from 'lucide-react';
import { FolioData, FolioItem, Payment } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';

interface GuestFolioModalProps {
  bookingId: string;
  onClose: () => void;
  onRefreshAll: () => void;
}

export const GuestFolioModal: React.FC<GuestFolioModalProps> = ({
  bookingId,
  onClose,
  onRefreshAll
}) => {
  const [folio, setFolio] = useState<FolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Charge State
  const [isAddingCharge, setIsAddingCharge] = useState(false);
  const [chargeCategory, setChargeCategory] = useState<'DINING' | 'SPA' | 'MINIBAR' | 'SERVICE'>('DINING');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  // Add Payment State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  // Print Mode State
  const [isPrintMode, setIsPrintMode] = useState(false);

  const loadFolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getFolio(bookingId);
      setFolio(data);
      if (data && data.balance_due > 0) {
        setPaymentAmount(data.balance_due.toFixed(2));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load folio');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFolio();
  }, [bookingId]);

  const handlePostCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeDesc.trim() || !chargeAmount) return;
    const amt = parseFloat(chargeAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      await api.addFolioCharge({
        booking_id: bookingId,
        category: chargeCategory,
        description: chargeDesc.trim(),
        amount: amt,
        tax_rate: 0.10
      });
      setChargeDesc('');
      setChargeAmount('');
      setIsAddingCharge(false);
      await loadFolio();
      onRefreshAll();
    } catch (err: any) {
      alert(`Error posting charge: ${err.message}`);
    }
  };

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    try {
      await api.addPayment({
        booking_id: bookingId,
        amount: amt,
        payment_method: paymentMethod
      });
      setIsAddingPayment(false);
      await loadFolio();
      onRefreshAll();
    } catch (err: any) {
      alert(`Error processing payment: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg text-center text-xs text-slate-300">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading Guest Folio & Financial Ledger from SQLite...
        </div>
      </div>
    );
  }

  if (error || !folio) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg max-w-md w-full text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-100">Folio Error</h3>
          <p className="text-xs text-slate-400 mt-1">{error || 'Unable to find folio record'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { booking, charges, payments, subtotal, tax_total, total_charges, total_paid, balance_due } = folio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-slate-100 text-base">
                  Guest Folio #{booking.id}
                </h3>
                <span className="text-[11px] text-amber-400 font-mono-code">
                  Room {booking.room_number || 'TBD'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Resident: <span className="text-slate-200 font-medium">{booking.first_name} {booking.last_name}</span> ({booking.loyalty_tier})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintMode(!isPrintMode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isPrintMode 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrintMode ? 'Standard View' : 'Invoice Preview'}</span>
            </button>

            {isPrintMode && (
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Printable Invoice Mode */}
          {isPrintMode ? (
            <div className="bg-white text-slate-900 p-8 rounded-lg shadow-lg font-sans">
              {/* Hotel Header */}
              <div className="flex items-start justify-between border-b border-slate-300 pb-6">
                <div>
                  <div className="font-serif-luxury text-2xl font-bold tracking-wider text-slate-900">
                    GRAND HORIZON RESORT & SUITES
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Promenade Beachfront Road, Goa / Mumbai · Email: reservations@grandhorizon.in
                  </div>
                  <div className="text-xs text-slate-500">
                    GSTIN: 30AABCG1234F1Z9 · State Code: 30 (Goa) · Luxury Hospitality Reg # IND-2026-90
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest font-bold text-slate-500">
                    Tax Invoice / Guest Folio
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {booking.id}
                  </div>
                  <div className="text-xs text-slate-600">
                    Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Guest & Stay Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Guest Name</span>
                  <span className="font-bold text-slate-800">{booking.first_name} {booking.last_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Room Assigned</span>
                  <span className="font-bold text-slate-800">Room {booking.room_number || 'N/A'} ({booking.room_type_name})</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Arrival Date</span>
                  <span className="font-bold text-slate-800">{booking.check_in_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Departure Date</span>
                  <span className="font-bold text-slate-800">{booking.check_out_date} ({booking.total_nights} Nights)</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="mt-4">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-right">GST (18%)</th>
                      <th className="py-2.5 px-3 text-right">Total (INR ₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {charges.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-semibold text-slate-600 uppercase text-[10px]">{item.category}</td>
                        <td className="py-2 px-3 text-slate-800">{item.description}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatINR(item.amount)}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatINR(item.total_amount - item.amount)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{formatINR(item.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payments */}
              <div className="mt-6 pt-4 border-t border-slate-300 flex justify-between items-start">
                <div className="w-1/2 text-xs">
                  <div className="font-bold uppercase text-[10px] text-slate-500 mb-2">Settlement & Payments (UPI / Bank)</div>
                  {payments.length === 0 ? (
                    <div className="text-slate-500 italic">No payments recorded yet.</div>
                  ) : (
                    <div className="space-y-1">
                      {payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between pr-8 text-slate-700">
                          <span>{p.payment_method} ({p.transaction_ref}):</span>
                          <span className="font-mono font-bold text-emerald-700">-{formatINR(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-1/2 max-w-xs space-y-1.5 text-xs text-right">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-mono">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Goods & Services Tax (18% GST):</span>
                    <span className="font-mono">{formatINR(tax_total)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1.5">
                    <span>Total Tax Invoice:</span>
                    <span className="font-mono">{formatINR(total_charges)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Payments Settled:</span>
                    <span className="font-mono">-{formatINR(total_paid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-slate-900 pt-2 text-slate-900">
                    <span>Balance Payable:</span>
                    <span className="font-mono text-amber-700">{formatINR(balance_due)}</span>
                  </div>
                </div>
              </div>

              {/* Sign-off Block */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
                <div>
                  <div className="w-48 border-b border-slate-400 mb-1" />
                  <span>Guest Signature</span>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-slate-400 mb-1 ml-auto" />
                  <span>Front Desk Cashier / Auditor</span>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive PMS Folio View */
            <>
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400">Total Charges</div>
                  <div className="text-lg font-bold font-mono-code text-slate-100 mt-1">
                    {formatINR(total_charges)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Subtotal + 18% GST</div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div className="text-[11px] text-slate-400">Paid to Date</div>
                  <div className="text-lg font-bold font-mono-code text-emerald-400 mt-1">
                    {formatINR(total_paid)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{payments.length} transactions</div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg col-span-2">
                  <div className="text-[11px] text-slate-400">Current Balance Due</div>
                  <div className={`text-2xl font-bold font-mono-code mt-1 ${balance_due > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {formatINR(balance_due)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {balance_due === 0 ? '✓ Account fully settled' : 'Payment required prior to departure checkout'}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add Charge & Make Payment */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddingCharge(!isAddingCharge)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Post In-Room / Service Charge</span>
                </button>

                <button
                  onClick={() => setIsAddingPayment(!isAddingPayment)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium rounded-md border border-emerald-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Record Payment / Settle Balance</span>
                </button>
              </div>

              {/* Add Charge Panel */}
              {isAddingCharge && (
                <form onSubmit={handlePostCharge} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Post New Folio Charge</span>
                    <button type="button" onClick={() => setIsAddingCharge(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                      <select
                        value={chargeCategory}
                        onChange={(e) => setChargeCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                      >
                        <option value="DINING">Dining & Bar</option>
                        <option value="SPA">Spa & Wellness</option>
                        <option value="MINIBAR">Mini-Bar Consumption</option>
                        <option value="SERVICE">Valet / Concierge / Laundry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Item Description</label>
                      <input
                        type="text"
                        placeholder="e.g. In-Room Wagyu Burger & Truffle Fries"
                        value={chargeDesc}
                        onChange={(e) => setChargeDesc(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Subtotal Amount (₹ INR)</label>
                      <input
                        type="number"
                        step="1"
                        placeholder="2500"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono-code"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCharge(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded cursor-pointer"
                    >
                      Post to Folio
                    </button>
                  </div>
                </form>
              )}

              {/* Add Payment Panel */}
              {isAddingPayment && (
                <form onSubmit={handlePostPayment} className="p-4 bg-slate-950 border border-emerald-900/40 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">Record Guest Settlement</span>
                    <button type="button" onClick={() => setIsAddingPayment(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                      >
                        <option value="UPI_BHIM">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                        <option value="NETBANKING_HDFC">HDFC / ICICI Net Banking</option>
                        <option value="RUPAY_CARD">RuPay Platinum / Visa / Mastercard</option>
                        <option value="AMEX_CENTURION">American Express</option>
                        <option value="CASH_INR">Cash (INR Front Desk)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Payment Amount (₹ INR)</label>
                      <input
                        type="number"
                        step="1"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono-code"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPayment(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-semibold rounded cursor-pointer"
                    >
                      Authorize & Settle
                    </button>
                  </div>
                </form>
              )}

              {/* Itemized Charges Table */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Itemized Charges Ledger
                </h4>
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 text-right">Tax</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {charges.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono-code">
                            {c.created_at ? c.created_at.split(' ')[0] : 'Today'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[10px] text-amber-400">
                            {c.category}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 font-medium">
                            {c.description}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-code text-slate-300">
                            {formatINR(c.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-code text-slate-400">
                            {formatINR(c.total_amount - c.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono-code font-bold text-slate-100">
                            {formatINR(c.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments History */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Recorded Payments & Receipts
                </h4>
                {payments.length === 0 ? (
                  <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-500 italic">
                    No payments have been posted yet.
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3">Reference / Trans ID</th>
                          <th className="py-2.5 px-3 text-right">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-3 text-slate-400 font-mono-code text-[11px]">
                              {p.created_at ? p.created_at.split(' ')[0] : 'Today'}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-200">
                              {p.payment_method}
                            </td>
                            <td className="py-2.5 px-3 font-mono-code text-slate-400 text-[11px]">
                              {p.transaction_ref}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono-code font-bold text-emerald-400">
                              {formatINR(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="no-print p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Folio records synchronized with SQLite <span className="font-mono-code text-slate-300">hotel.db</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
