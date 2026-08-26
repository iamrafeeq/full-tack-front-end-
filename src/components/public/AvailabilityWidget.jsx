import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAvailableRooms,
  clearAvailability,
} from "../../redux/slice/roomSlice/roomSlice";
import { apiBase } from "../../api/axios";

const TYPE_IMAGES = {
  single: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  double: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  deluxe: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  suite:  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
};
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80";

const iso    = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const pretty  = (s) =>
  s ? new Date(`${s}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";

export default function AvailabilityWidget() {
  const dispatch = useDispatch();
  const { availableRooms, availLoading, availError } = useSelector((s) => s.rooms);

  const today   = new Date();
  const nextFri = addDays(today, (5 - today.getDay() + 7) % 7 || 7);

  const [checkIn,  setCheckIn]  = useState(iso(nextFri));
  const [checkOut, setCheckOut] = useState(iso(addDays(nextFri, 2)));
  const [guests,   setGuests]   = useState(2);
  const [preset,   setPreset]   = useState("weekend");
  const [selected, setSelected] = useState(null);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const d = (new Date(checkOut) - new Date(checkIn)) / 86400000;
    return d > 0 ? Math.round(d) : 0;
  })();

  const reset = () => { setSelected(null); dispatch(clearAvailability()); };

  const presets = [
    { key: "tonight", label: "Tonight",       make: () => [today, addDays(today, 1)] },
    { key: "weekend", label: "This weekend",  make: () => { const f = addDays(today, (5 - today.getDay() + 7) % 7 || 7); return [f, addDays(f, 2)]; } },
    { key: "week",    label: "Next 5 nights", make: () => [addDays(today, 7), addDays(today, 12)] },
  ];

  const applyPreset = (p) => {
    const [a, b] = p.make();
    setCheckIn(iso(a)); setCheckOut(iso(b)); setPreset(p.key); reset();
  };

  const results   = availableRooms || [];
  const cheapest  = results.length ? results.reduce((m, r) => (r.discountPrice || r.price) < (m.discountPrice || m.price) ? r : m) : null;
  const selectedRoom  = results.find((r) => r._id === selected) || null;
  const selectedPrice = selectedRoom ? selectedRoom.discountPrice || selectedRoom.price : 0;

  return (
    <div id="book" className="relative z-20 max-w-6xl mx-auto px-3 sm:px-6 -mt-16 sm:-mt-24">
      <div className="bg-white rounded-2xl shadow-2xl px-4 sm:px-8 pt-5 sm:pt-7 pb-6 sm:pb-8 [color-scheme:light]">

        {/* ── Header ── */}
        <div className="mb-4 sm:mb-5">
          <p className="font-serif text-xl sm:text-[22px] text-[#0B1F2A]">Find your stay</p>
          <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
            Pick dates — we'll show what's free and the price. No account needed to look.
          </p>
        </div>

        {/* ── Quick-pick presets — horizontally scrollable on mobile ── */}
<div className="mb-4">
  <span className="text-xs text-gray-500 font-medium mb-2 block">
    Availability
  </span>
  <div className="relative">
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth snap-x snap-mandatory">
      {presets.map((p) => (
        <button
          key={p.key}
          onClick={() => applyPreset(p)}
          className={`shrink-0 snap-start text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-150 ${
            preset === p.key
              ? "bg-[#C9A24B] border-[#C9A24B] text-[#0B1F2A] shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:border-[#C9A24B] hover:text-[#0B1F2A]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
    {/* fade edge hints there's more content to scroll */}
    <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
  </div>
</div>

        {/* ── Date + Guest fields ── */}
        {/* Mobile: check-in/check-out side by side, guests full row, button full row */}
        {/* Desktop: all four in one row                                              */}
        <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_200px_210px] gap-3 sm:gap-4 items-end">

          {/* Check In */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold text-[#13293D] uppercase tracking-wider">
              Check In
            </label>
            <input
              type="date"
              value={checkIn}
              min={iso(today)}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                if (v >= checkOut) setCheckOut(iso(addDays(new Date(v), 1)));
                setPreset(null); reset();
              }}
              className="border border-gray-200 rounded-xl px-3 py-3 sm:px-4 text-sm text-[#13293D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A24B] w-full"
            />
          </div>

          {/* Check Out */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold text-[#13293D] uppercase tracking-wider">
              Check Out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || iso(today)}
              onChange={(e) => { setCheckOut(e.target.value); setPreset(null); reset(); }}
              className="border border-gray-200 rounded-xl px-3 py-3 sm:px-4 text-sm text-[#13293D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A24B] w-full"
            />
          </div>

          {/* Guests — full width on mobile */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold text-[#13293D] uppercase tracking-wider">
              Guests
            </label>
            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-[10px] sm:py-[5px]">
              <button
                aria-label="Fewer guests"
                onClick={() => { setGuests((g) => Math.max(1, g - 1)); reset(); }}
                className="w-10 h-10 sm:w-[34px] sm:h-[34px] rounded-lg bg-gray-100 text-[#0B1F2A] text-lg leading-none hover:bg-[#C9A24B] transition-colors active:scale-95"
              >
                −
              </button>
              <span className="text-sm font-semibold text-[#13293D]">
                {guests} {guests === 1 ? "guest" : "guests"}
              </span>
              <button
                aria-label="More guests"
                onClick={() => { setGuests((g) => Math.min(6, g + 1)); reset(); }}
                className="w-10 h-10 sm:w-[34px] sm:h-[34px] rounded-lg bg-gray-100 text-[#0B1F2A] text-lg leading-none hover:bg-[#C9A24B] transition-colors active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Search button — full width on mobile */}
          <button
            disabled={!checkIn || !checkOut || nights < 1 || availLoading}
            onClick={() => dispatch(fetchAvailableRooms({ checkIn, checkOut, guests: String(guests) }))}
            className="col-span-2 md:col-span-1 bg-[#0B1F2A] text-white font-semibold text-base sm:text-[15px] px-5 py-4 sm:py-3.5 rounded-xl tracking-wide transition-colors hover:bg-[#C9A24B] hover:text-[#0B1F2A] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98]"
          >
            {availLoading ? "Searching…" : availableRooms ? "Search again" : "Show me rooms"}
          </button>
        </div>

        {/* Summary line */}
        <p className="text-xs sm:text-[13px] text-gray-500 mt-3">
          {nights > 0
            ? `${nights} night${nights === 1 ? "" : "s"} · ${pretty(checkIn)} → ${pretty(checkOut)} · ${guests} ${guests === 1 ? "guest" : "guests"}`
            : "Choose a check-out date after your check-in to see prices."}
        </p>

        {availError && <p className="mt-4 text-sm text-red-500">{availError}</p>}

        {/* ── Results ── */}
        {availableRooms !== null && !availLoading && (
          <div className="mt-5 sm:mt-6 border-t border-gray-100 pt-4 sm:pt-5">
            {results.length === 0 ? (
              <div className="text-center py-6 px-2">
                <p className="font-serif text-lg sm:text-[19px] text-[#0B1F2A]">Nothing free for those nights</p>
                <p className="text-xs sm:text-[13px] text-gray-500 mt-2 mb-5">
                  Try shifting your dates by a day or lowering the guest count — most rooms sleep two.
                </p>
                <button
                  onClick={() => {
                    setCheckIn(iso(addDays(new Date(checkIn), 1)));
                    setCheckOut(iso(addDays(new Date(checkOut), 1)));
                    setPreset(null); reset();
                  }}
                  className="text-sm font-semibold px-6 py-3 rounded-full border border-[#0B1F2A] text-[#0B1F2A] hover:bg-gray-50 active:scale-95"
                >
                  Try the next night
                </button>
              </div>
            ) : (
              <>
                {/* Result count */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-4">
                  <p className="text-sm font-semibold text-[#0B1F2A]">
                    {results.length} room{results.length === 1 ? "" : "s"} available — from $
                    {cheapest ? cheapest.discountPrice || cheapest.price : 0}
                    <span className="font-normal text-gray-500"> / night</span>
                  </p>
                  <p className="text-xs text-gray-400">Tap a room to see your total.</p>
                </div>

                {/* Room cards — horizontal on mobile for easy scanning */}
                <div className="flex flex-col gap-3">
                  {results.slice(0, 3).map((room) => {
                    const img = room.images?.[0]
                      ? (room.images[0].startsWith("http") ? room.images[0] : `${apiBase}/${room.images[0]}`)
                      : TYPE_IMAGES[room.type] || DEFAULT_IMAGE;
                    const price   = room.discountPrice || room.price;
                    const on      = selected === room._id;
                    const isCheap = cheapest && cheapest._id === room._id;

                    return (
                      <button
                        key={room._id}
                        onClick={() => setSelected(on ? null : room._id)}
                        className={`text-left flex flex-row gap-3 rounded-2xl p-3 sm:p-3.5 border-[1.5px] transition-all active:scale-[.99] ${
                          on
                            ? "bg-[#FBF8F1] border-[#C9A24B] shadow-[0_8px_20px_-6px_rgba(201,162,75,.45)]"
                            : "bg-white border-gray-100 hover:border-[#C9A24B]/40"
                        }`}
                      >
                        {/* Image */}
                        <img
                          src={img}
                          alt=""
                          className="w-24 h-24 sm:w-[84px] sm:h-[84px] rounded-xl object-cover shrink-0"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-[#0B1F2A] text-sm">Room {room.roomNumber}</p>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                isCheap ? "bg-[#C9A24B] text-[#0B1F2A]" : "bg-gray-100 text-gray-500"
                              }`}>
                                {isCheap ? "Best value" : "Available"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">
                              {room.type} · sleeps {room.capacity}
                            </p>
                            {room.amenities?.length > 0 && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {room.amenities.slice(0, 3).join(" · ")}
                              </p>
                            )}
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-end justify-between gap-2 mt-2">
                            <div>
                              <p className="text-[15px] font-bold text-[#0B1F2A] leading-tight">
                                ${(price * nights).toLocaleString()}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                ${price} × {nights} night{nights === 1 ? "" : "s"}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                              on ? "bg-[#0B1F2A] text-white" : "bg-gray-100 text-[#0B1F2A]"
                            }`}>
                              {on ? "Selected ✓" : "Choose"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {results.length > 3 && (
                  <p className="text-center mt-4">
                    <Link
                      to="/rooms"
                      className="text-sm font-semibold text-[#0B1F2A] border-b border-[#C9A24B]"
                    >
                      View all {results.length} available rooms →
                    </Link>
                  </p>
                )}

                {/* ── Confirm strip ── */}
                {selectedRoom && (
                  <>
                    <div className="mt-5 rounded-2xl bg-[#0B1F2A] px-4 sm:px-6 py-5">
                      {/* Badge */}
                      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#C9A24B] mb-2">
                        Almost there — review &amp; continue
                      </p>

                      {/* Room + dates */}
                      <p className="font-serif text-lg sm:text-xl text-white capitalize">
                        Room {selectedRoom.roomNumber} · {selectedRoom.type}
                      </p>
                      <p className="text-xs sm:text-[13px] text-gray-400 mt-1">
                        {pretty(checkIn)} → {pretty(checkOut)} · {nights} night{nights === 1 ? "" : "s"} · {guests} {guests === 1 ? "guest" : "guests"}
                      </p>

                      {/* Price + CTA — stacked on mobile, side by side on desktop */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase tracking-widest">Total</p>
                          <p className="font-serif text-3xl sm:text-[28px] text-[#C9A24B] mt-0.5">
                            ${(selectedPrice * nights).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Taxes shown before you pay</p>
                        </div>

                        <Link
                          to={`/booking?room=${selectedRoom._id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                          className="w-full sm:w-auto text-center bg-[#C9A24B] text-[#0B1F2A] font-bold text-base px-7 py-4 rounded-full whitespace-nowrap hover:bg-white transition-colors active:scale-[.98]"
                        >
                          Continue to booking →
                        </Link>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
                      You'll sign in on the next step — nothing is charged yet.{" "}
                      Free cancellation up to 48 hours before arrival.{" "}
                      Questions?{" "}
                      <span className="text-[#0B1F2A] font-semibold whitespace-nowrap">+1 (234) 567-8900</span>
n                      </p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
