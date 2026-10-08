import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Receipt,
  Coffee,
  Wine,
  Sparkles
} from 'lucide-react';
import { MenuItem, Room, Booking } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/currency';

interface RoomServiceViewProps {
  menu: MenuItem[];
  rooms: Room[];
  bookings: Booking[];
  onRefreshAll: () => void;
  onOpenFolio: (bookingId: string) => void;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export const RoomServiceView: React.FC<RoomServiceViewProps> = ({
  menu,
  rooms,
  bookings,
  onRefreshAll,
  onOpenFolio,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastBilledBookingId, setLastBilledBookingId] = useState<string | null>(null);

  // Filter occupied rooms with active bookings
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED' && r.active_booking_id);

  // Set default room if none selected
  React.useEffect(() => {
    if (!selectedRoomNumber && occupiedRooms.length > 0) {
      setSelectedRoomNumber(occupiedRooms[0].room_number);
    }
  }, [occupiedRooms, selectedRoomNumber]);

  const categories = ['ALL', 'BREAKFAST', 'MAINS', 'DESSERTS', 'WINE', 'BEVERAGES'];

  const filteredMenu = menu.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !selectedRoomNumber) return;

    const targetRoom = occupiedRooms.find((r) => r.room_number === selectedRoomNumber);
    if (!targetRoom || !targetRoom.active_booking_id) {
      alert('Selected room does not have an active guest booking.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderSummary = cart
        .map((c) => `${c.quantity}x ${c.menuItem.name}`)
        .join(', ');
      
      const fullDesc = orderNotes.trim()
        ? `In-Room Dining: ${orderSummary} (${orderNotes.trim()})`
        : `In-Room Dining: ${orderSummary}`;

      await api.addFolioCharge({
        booking_id: targetRoom.active_booking_id,
        category: 'DINING',
        description: fullDesc,
        amount: subtotal,
        tax_rate: 0.18
      });

      setLastBilledBookingId(targetRoom.active_booking_id);
      setCart([]);
      setOrderNotes('');
      onRefreshAll();
      alert(`Order successfully posted to Room ${targetRoom.room_number} folio! (Total: ${formatINR(total)})`);
    } catch (err: any) {
      alert(`Failed to charge room: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-serif-luxury text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            <span>In-Room Dining & Bar POS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gourmet room service ordering engine with 1-click ledger posting to guest folios.
          </p>
        </div>

        {lastBilledBookingId && (
          <button
            onClick={() => onOpenFolio(lastBilledBookingId)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs rounded border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>View Last Billed Folio</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Menu Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs (Buttons allowed for interactive filters) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Menu Items Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-100 text-sm">
                      {item.name}
                    </span>
                    <span className="font-mono-code font-bold text-amber-400 text-sm">
                      {formatINR(item.price)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {item.category}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to Tray</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active Order Tray & Room Billing */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-serif-luxury font-bold text-slate-100 text-sm">
              Room Service Tray
            </h3>
            <span className="text-xs text-amber-400 font-mono-code">
              {cart.reduce((s, c) => s + c.quantity, 0)} items
            </span>
          </div>

          {/* Select Target Room */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">
              Deliver & Charge To Room
            </label>
            {occupiedRooms.length === 0 ? (
              <div className="p-2 bg-amber-950/20 border border-amber-500/30 rounded text-xs text-amber-400">
                No rooms currently occupied to charge.
              </div>
            ) : (
              <select
                value={selectedRoomNumber}
                onChange={(e) => setSelectedRoomNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                {occupiedRooms.map((r) => (
                  <option key={r.room_number} value={r.room_number}>
                    Room {r.room_number} - {r.current_guest_name} ({r.room_type_name})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-60 overflow-y-auto space-y-2 divide-y border-slate-800/60">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Tray is currently empty. Click "Add to Tray" on any culinary dish.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.menuItem.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <div className="font-medium text-slate-200">{item.menuItem.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono-code">
                      {formatINR(item.menuItem.price)} each
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, -1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-mono-code font-bold text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItem.id, 1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Kitchen / Delivery Notes */}
          {cart.length > 0 && (
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Preparation Notes (Chef & Butler)
              </label>
              <input
                type="text"
                placeholder="e.g. Warm brioche, no dressing on salad"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200"
              />
            </div>
          )}

          {/* Price Breakdown */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono-code text-slate-200">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18%):</span>
                <span className="font-mono-code text-slate-200">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-100 border-t border-slate-800/80 pt-1.5">
                <span>Total to Post:</span>
                <span className="font-mono-code text-amber-400">{formatINR(total)}</span>
              </div>
            </div>
          )}

          {/* Post Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || !selectedRoomNumber || isSubmitting}
            className={`w-full py-2.5 rounded-md font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cart.length === 0 || !selectedRoomNumber || isSubmitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/10'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting to Folio...' : `Post Charge to Room ${selectedRoomNumber || ''}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
