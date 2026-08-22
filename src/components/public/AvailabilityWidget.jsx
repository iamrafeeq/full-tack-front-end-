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

const iso = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const pretty = (s) =>
  s
    ? new Date(`${s}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

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

  const reset = () => {
    setSelected(null);
    dispatch(clearAvailability());
  };

  const presets = [
    { key: "tonight", label: "Tonight",      make: () => [today, addDays(today, 1)] },
    {
      key: "weekend",
      label: "This weekend",
      make: () => {
        const f = addDays(today, (5 - today.getDay() + 7) % 7 || 7);
        return [f, addDays(f, 2)];
      },
    },
    { key: "week", label: "Next week", make: () => [addDays(today, 7), addDays(today, 12)] },
  ];

  const applyPreset = (p) => {
    const [a, b] = p.make();
    setCheckIn(iso(a));
    setCheckOut(iso(b));
    setPreset(p.key);
    reset();
  };

  const results  = availableRooms || [];
  const cheapest = results.length
    ? results.reduce((m, r) =>
        (r.discountPrice || r.price) < (m.discountPrice || m.price) ? r : m
      )
    : null;
  const selectedRoom  = results.find((r) => r._id === selected) || null;
  const selectedPrice = selectedRoom ? selectedRoom.discountPrice || selectedRoom.price : 0;

  return (
    <div id="book" className="relative z-20 max-w-6xl mx-auto px-6 -mt-24">
      <div className="bg-white rounded-[20px] shadow-2xl px-8 pt-7 pb-8 [color-scheme:light]">

        {/* Heading + presets */}
        <div className="flex items-baseline justify-between gap-6 flex-wrap mb-5">
          <div>
            <p className="font-serif text-[22px] text-[#0B1F2A]">Find your stay</p>
            <p className="text-[13px] text-gray-500 mt-1">
              Pick your dates — we'll show what's free and what it costs. No account needed to look.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Popular:</span>
            <div className="flex gap-2">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className={`text-xs font-semibold px-3.5 py-[7px] rounded-full border transition-colors ${
                    preset === p.key
                      ? "bg-[#C9A24B] border-[#C9A24B] text-[#0B1F2A]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-[#C9A24B]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px_210px] gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#13293D] uppercase tracking-wider">Check In</label>
            <input
              type="date"
              value={checkIn}
              min={iso(today)}
              onChange={(e) => {
                const v = e.target.value;
                setCheckIn(v);
                if (v >= checkOut) setCheckOut(iso(addDays(new Date(v), 1)));
                setPreset(null);
                reset();
              }}
              className="border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-[#13293D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#13293D] uppercase tracking-wider">Check Out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || iso(today)}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setPreset(null);
                reset();
              }}
              className="border border-gray-200 rounded-[10px] px-4 py-3 text-sm text-[#13293D] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#13293D] uppercase tracking-wider">Guests</label>
            <div className="flex items-center justify-between border border-gray-200 rounded-[10px] px-2 py-[5px]">
              <button
                aria-label="Fewer guests"
                onClick={() => { setGuests((g) => Math.max(1, g - 1)); reset(); }}
                className="w-[34px] h-[34px] rounded-lg bg-gray-100 text-[#0B1F2A] text-lg leading-none hover:bg-[#C9A24B] transition-colors"
              >
                −
              </button>
              <span className="text-sm font-semibold text-[#13293D]">
                {guests} {guests === 1 ? "guest" : "guests"}
              </span>
              <button
                aria-label="More guests"
                onClick={() => { setGuests((g) => Math.min(6, g + 1)); reset(); }}
                className="w-[34px] h-[34px] rounded-lg bg-gray-100 text-[#0B1F2A] text-lg leading-none hover:bg-[#C9A24B] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            disabled={!checkIn || !checkOut || nights < 1 || availLoading}
            onClick={() =>
              dispatch(fetchAvailableRooms({ checkIn, checkOut, guests: String(guests) }))
            }
            className="bg-[#0B1F2A] text-white font-semibold text-[15px] px-5 py-3.5 rounded-[10px] tracking-wide transition-colors hover:bg-[#C9A24B] hover:text-[#0B1F2A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availLoading ? "Searching…" : availableRooms ? "Search again" : "Show me rooms"}
          </button>
        </div>

        <p className="text-[13px] text-gray-500 mt-3.5">
          {nights > 0
            ? `${nights} night${nights === 1 ? "" : "s"} · ${pretty(checkIn)} → ${pretty(checkOut)} · ${guests} ${guests === 1 ? "guest" : "guests"}`
            : "Choose a check-out date after your check-in to see prices."}
        </p>

        {availError && <p className="mt-4 text-sm text-red-500">{availError}</p>}

        {/* Results */}
        {availableRooms !== null && !availLoading && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            {results.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-serif text-[19px] text-[#0B1F2A]">Nothing free for those nights</p>
                <p className="text-[13px] text-gray-500 mt-2 mb-4">
                  Try shifting your dates by a day, or lower the guest count — most of our rooms sleep two.
                </p>
                <button
                  onClick={() => {
                    setCheckIn(iso(addDays(new Date(checkIn), 1)));
                    setCheckOut(iso(addDays(new Date(checkOut), 1)));
                    setPreset(null);
                    reset();
                  }}
                  className="text-[13px] font-semibold px-5 py-2.5 rounded-full border border-[#0B1F2A] text-[#0B1F2A] hover:bg-gray-50"
                >
                  Try the next night
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 mb-3.5">
                  <p className="text-sm font-semibold text-[#0B1F2A]">
                    {results.length} room{results.length === 1 ? "" : "s"} free for your dates — from $
                    {cheapest ? cheapest.discountPrice || cheapest.price : 0} a night
                  </p>
                  <p className="text-xs text-gray-400">
                    Tap a room to see your total. You can change dates anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.slice(0, 3).map((room) => {
                    const img = room.images?.[0]
                      ? `${apiBase}/${room.images[0]}`
                      : TYPE_IMAGES[room.type] || DEFAULT_IMAGE;
                    const price    = room.discountPrice || room.price;
                    const on       = selected === room._id;
                    const isCheap  = cheapest && cheapest._id === room._id;
                    return (
                      <button
                        key={room._id}
                        onClick={() => setSelected(on ? null : room._id)}
                        className={`text-left flex flex-col gap-3 rounded-[14px] p-3.5 border-[1.5px] transition-all ${
                          on
                            ? "bg-[#FBF8F1] border-[#C9A24B] shadow-[0_8px_20px_-6px_rgba(201,162,75,.45)]"
                            : "bg-white border-gray-100 hover:border-[#C9A24B]/40"
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-[84px] h-[84px] rounded-[10px] object-cover shrink-0"
                          />
                          <div className="min-w-0 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-[#0B1F2A] text-sm">Room {room.roomNumber}</p>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                  isCheap ? "bg-[#C9A24B] text-[#0B1F2A]" : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {isCheap ? "Recommended" : "Available"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 capitalize">
                              {room.type} · sleeps {room.capacity}
                            </p>
                            {room.amenities?.length > 0 && (
                              <p className="text-xs text-gray-400 truncate">
                                {room.amenities.slice(0, 3).join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-2 border-t border-gray-100 pt-2.5">
                          <div>
                            <p className="text-[15px] font-bold text-[#0B1F2A]">
                              ${(price * nights).toLocaleString()} total
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              ${price} × {nights} night{nights === 1 ? "" : "s"}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-3.5 py-2 rounded-full ${
                              on ? "bg-[#0B1F2A] text-white" : "bg-gray-100 text-[#0B1F2A]"
                            }`}
                          >
                            {on ? "Selected ✓" : "Choose"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {results.length > 3 && (
                  <p className="text-center mt-3.5">
                    <Link
                      to="/rooms"
                      className="text-[13px] font-semibold text-[#0B1F2A] border-b border-[#C9A24B]"
                    >
                      View all {results.length} available rooms →
                    </Link>
                  </p>
                )}

                {/* Confirm strip */}
                {selectedRoom && (
                  <>
                    <div className="mt-5 rounded-[14px] bg-[#0B1F2A] px-6 py-5 flex items-center justify-between gap-6 flex-wrap">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A24B] mb-1.5">
                          Step 3 of 3 — you're nearly there
                        </p>
                        <p className="font-serif text-xl text-white capitalize">
                          Room {selectedRoom.roomNumber} · {selectedRoom.type}
                        </p>
                        <p className="text-[13px] text-gray-400 mt-1.5">
                          {pretty(checkIn)} → {pretty(checkOut)} · {nights} night{nights === 1 ? "" : "s"} ·{" "}
                          {guests} {guests === 1 ? "guest" : "guests"}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[11px] text-gray-400 uppercase tracking-widest">Total</p>
                          <p className="font-serif text-[28px] text-[#C9A24B] mt-0.5">
                            ${(selectedPrice * nights).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Taxes shown before you pay</p>
                        </div>
                        <Link
                          to={`/booking?room=${selectedRoom._id}&checkIn=${checkIn}&checkOut=${checkOut}`}
                          className="bg-[#C9A24B] text-[#0B1F2A] font-bold text-[15px] px-7 py-4 rounded-full whitespace-nowrap hover:bg-white transition-colors"
                        >
                          Continue to booking →
                        </Link>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      You'll sign in on the next step — nothing is charged yet. Free cancellation up to 48 hours
                      before arrival. Questions? Call{" "}
                      <span className="text-[#0B1F2A] font-semibold">+1 (234) 567-8900</span>.
                    </p>
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
