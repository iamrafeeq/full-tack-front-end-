import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { fetchAllTables } from "../../redux/slice/tables/tableSlice";
import {
  createTableReservation,
  clearCreateError,
} from "../../redux/slice/tableReservations/tableReservationSlice";

const TIMES = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30",
  "19:00","19:30","20:00","20:30","21:00","21:30","22:00",
];

const LOC_LABEL = { indoor: "Indoor", outdoor: "Outdoor", "private-room": "Private Room" };
const LOC_ICON  = { indoor: "🏠", outdoor: "🌿", "private-room": "🚪" };

const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const today = () => new Date().toISOString().split("T")[0];

export default function TableReservation() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { tables, loading: tablesLoading } = useSelector((s) => s.tables);
  const { createLoading, createError }     = useSelector((s) => s.tableReservations);

  const [step, setStep] = useState("search"); // "search" | "pick" | "done"
  const [form, setForm] = useState({
    date: today(), time: "19:00", partySize: 2, specialRequests: "",
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [done, setDone] = useState(null);

  useEffect(() => {
    dispatch(fetchAllTables());
    dispatch(clearCreateError());
  }, [dispatch]);

  const availableTables = tables.filter(
    (t) => t.isActive !== false && t.status === "available" && t.capacity >= form.partySize
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate("/login"); return; }
    setSelectedTable(null);
    setStep("pick");
  };

  const handleBook = () => {
    if (!selectedTable) return;
    dispatch(createTableReservation({
      table: selectedTable._id,
      reservationDate: form.date,
      reservationTime: form.time,
      partySize: form.partySize,
      specialRequests: form.specialRequests,
    })).then((res) => {
      if (!res.error) {
        setDone(res.payload);
        setStep("done");
      }
    });
  };

  // Specific error detection
  const isCapacityError = createError?.toLowerCase().includes("capacity") || createError?.toLowerCase().includes("party");
  const isConflictError = createError?.toLowerCase().includes("conflict") || createError?.toLowerCase().includes("overlap") || createError?.toLowerCase().includes("already");

  return (
    <div className="min-h-screen bg-white text-[#1F2937] pt-20">
      {/* Hero */}
      <section
        className="relative h-[45vh] min-h-[300px] w-full flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-[#0B1F2A]/70" />
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-[#C9A24B] tracking-[0.3em] text-xs font-medium mb-3 uppercase">Dining at LuxuryStay</p>
          <h1 className="font-serif text-4xl sm:text-5xl">Reserve a Table</h1>
          <p className="mt-3 text-gray-300 text-sm max-w-md mx-auto">
            Book your dining experience — indoor, outdoor, or private room.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left: form / table picker ── */}
          <div className="lg:col-span-2">

            {/* STEP 1 — Search */}
            {step === "search" && (
              <div>
                <h2 className="font-serif text-2xl text-[#0B1F2A] mb-6">Find Availability</h2>
                <form onSubmit={handleSearch} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Date *</label>
                      <input type="date" min={today()} value={form.date}
                        onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Time *</label>
                      <select value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none">
                        {TIMES.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Party Size *</label>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setForm((p) => ({ ...p, partySize: Math.max(1, p.partySize - 1) }))}
                        className="w-10 h-10 rounded-full border border-gray-200 text-lg hover:border-[#C9A24B] transition-colors">−</button>
                      <span className="text-lg font-semibold text-[#0B1F2A] w-8 text-center">{form.partySize}</span>
                      <button type="button" onClick={() => setForm((p) => ({ ...p, partySize: Math.min(20, p.partySize + 1) }))}
                        className="w-10 h-10 rounded-full border border-gray-200 text-lg hover:border-[#C9A24B] transition-colors">+</button>
                      <span className="text-sm text-gray-400">{form.partySize === 1 ? "guest" : "guests"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5">Special Requests</label>
                    <textarea rows={3} value={form.specialRequests}
                      onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
                      placeholder="Dietary needs, occasion, seating preference…"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none resize-none" />
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 bg-[#C9A24B] text-[#0B1F2A] font-semibold rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity">
                    {isAuthenticated ? "Find Available Tables" : "Sign In to Reserve"}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2 — Pick table */}
            {step === "pick" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep("search")} className="text-sm text-gray-400 hover:text-[#0B1F2A]">← Back</button>
                  <h2 className="font-serif text-2xl text-[#0B1F2A]">
                    {tablesLoading ? "Loading tables…" : `${availableTables.length} table${availableTables.length === 1 ? "" : "s"} available`}
                  </h2>
                </div>

                {/* Error banners */}
                {createError && (
                  <div className={`mb-5 px-4 py-3 rounded-xl border text-sm ${
                    isCapacityError ? "bg-orange-50 border-orange-200 text-orange-700" :
                    isConflictError ? "bg-red-50 border-red-200 text-red-700" :
                    "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    {isCapacityError && <p className="font-semibold mb-1">Party size exceeds table capacity</p>}
                    {isConflictError && <p className="font-semibold mb-1">Time slot not available</p>}
                    <p>{createError}</p>
                    {isConflictError && <p className="mt-2 text-xs opacity-80">Try a different time or choose another table.</p>}
                  </div>
                )}

                {tablesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#C9A24B] rounded-full animate-spin" />
                  </div>
                ) : availableTables.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl">
                    <p className="text-3xl mb-3">😔</p>
                    <p className="font-medium text-gray-600">No tables available for {form.partySize} guests</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Try adjusting your date, time, or party size.</p>
                    <button onClick={() => setStep("search")} className="text-sm font-semibold text-[#C9A24B] underline">Change details</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableTables.map((table) => {
                      const on = selectedTable?._id === table._id;
                      return (
                        <button key={table._id} type="button" onClick={() => setSelectedTable(on ? null : table)}
                          className={`text-left p-5 rounded-2xl border-2 transition-all ${
                            on ? "bg-[#FBF8F1] border-[#C9A24B] shadow-lg" : "bg-white border-gray-100 hover:border-[#C9A24B]/40"
                          }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{LOC_ICON[table.location] || "🪑"}</span>
                              <div>
                                <p className="font-bold text-[#0B1F2A]">Table {table.tableNumber}</p>
                                <p className="text-xs text-gray-400">{LOC_LABEL[table.location] || table.location}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${on ? "bg-[#0B1F2A] text-white" : "bg-gray-100 text-[#0B1F2A]"}`}>
                              {on ? "Selected ✓" : "Select"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">Seats up to <strong className="text-[#0B1F2A]">{table.capacity}</strong> guests</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedTable && (
                  <div className="mt-8 bg-[#0B1F2A] rounded-2xl p-6 text-white">
                    <p className="text-[#C9A24B] text-xs uppercase tracking-widest mb-2">Confirm Reservation</p>
                    <p className="font-serif text-xl">Table {selectedTable.tableNumber} — {LOC_LABEL[selectedTable.location]}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(`${form.date}T00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      {" · "}{fmtTime(form.time)} · {form.partySize} {form.partySize === 1 ? "guest" : "guests"}
                    </p>
                    {createError && !isCapacityError && !isConflictError && (
                      <p className="mt-3 text-red-300 text-sm">{createError}</p>
                    )}
                    <button onClick={handleBook} disabled={createLoading}
                      className="mt-5 w-full py-3 rounded-full bg-[#C9A24B] text-[#0B1F2A] font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity">
                      {createLoading ? "Booking…" : "Confirm Reservation"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Done */}
            {step === "done" && done && (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                <h2 className="font-serif text-3xl text-[#0B1F2A] mb-2">Reservation Confirmed</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
                  Your table has been reserved. See you soon!
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-sm mx-auto space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Table</span><span className="font-medium">{done.table?.tableNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-medium">{new Date(`${done.reservationDate}T00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Time</span><span className="font-medium">{fmtTime(done.reservationTime)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Party Size</span><span className="font-medium">{done.partySize} guests</span></div>
                  {done.specialRequests && <div className="flex justify-between"><span className="text-gray-400">Notes</span><span className="font-medium">{done.specialRequests}</span></div>}
                </div>
                <div className="flex gap-3 justify-center mt-8">
                  <button onClick={() => { setStep("search"); setSelectedTable(null); setDone(null); dispatch(clearCreateError()); }}
                    className="px-6 py-2.5 rounded-full border border-[#0B1F2A] text-[#0B1F2A] text-sm font-medium hover:bg-[#0B1F2A] hover:text-white transition-colors">
                    Make Another
                  </button>
                  <button onClick={() => navigate("/my-table-reservations")}
                    className="px-6 py-2.5 rounded-full bg-[#C9A24B] text-[#0B1F2A] text-sm font-semibold hover:opacity-90 transition-opacity">
                    View My Reservations
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sticky summary ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#0B1F2A] rounded-2xl p-6 text-white">
              <p className="text-[#C9A24B] text-xs uppercase tracking-widest mb-4">Your Selection</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span>{form.date ? new Date(`${form.date}T00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time</span>
                  <span>{fmtTime(form.time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Guests</span>
                  <span>{form.partySize}</span>
                </div>
                {selectedTable && (
                  <>
                    <div className="border-t border-white/10 pt-3 mt-3" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Table</span>
                      <span className="text-[#C9A24B] font-semibold">{selectedTable.tableNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location</span>
                      <span>{LOC_LABEL[selectedTable.location]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacity</span>
                      <span>{selectedTable.capacity} seats</span>
                    </div>
                  </>
                )}
              </div>
              {form.specialRequests && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{form.specialRequests}</p>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
                Reservations are held for 15 minutes after the booked time.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
