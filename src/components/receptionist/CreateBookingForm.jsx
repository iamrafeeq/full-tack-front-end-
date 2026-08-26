import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  searchGuests,
  clearGuestResults,
} from "../../redux/slice/receptionist/receptionistSlice";
import { createBooking, clearBookingError } from "../../redux/slice/Booking/bookingSlice";
import { Card, PAYMENT_METHODS } from "./shared";
import { notifySuccess, notifyError } from "../../utils/toast";
import Spinner from "../Spinner";

export default function CreateBookingForm() {
  const dispatch = useDispatch();
  const { guestResults, searchLoading } = useSelector((s) => s.receptionist);
  const { createLoading, createError } = useSelector((s) => s.bookings);
  const { rooms } = useSelector((s) => s.rooms);

  const [showForm,       setShowForm]       = useState(false);
  const [guestQuery,     setGuestQuery]     = useState("");
  const [selectedGuest,  setSelectedGuest]  = useState(null);
  const [showGuestDrop,  setShowGuestDrop]  = useState(false);
  const [form, setForm] = useState({
    room: "", checkInDate: "", checkOutDate: "", paymentTiming: "checkin", paymentMethod: "cash",
  });

  useEffect(() => { if (createError) notifyError(createError); }, [createError]);

  const debounceRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const handleGuestQuery = (e) => {
    const val = e.target.value;
    setGuestQuery(val);
    setSelectedGuest(null);
    if (!val.trim()) {
      dispatch(clearGuestResults());
      setShowGuestDrop(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(searchGuests(val.trim()));
      setShowGuestDrop(true);
    }, 400);
  };

  const selectGuest = (g) => {
    setSelectedGuest(g);
    setGuestQuery(g.name);
    setShowGuestDrop(false);
    dispatch(clearGuestResults());
  };

  const clearGuest = () => {
    setSelectedGuest(null);
    setGuestQuery("");
    dispatch(clearGuestResults());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) return;
    const payload = {
      room: form.room,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      paymentTiming: form.paymentTiming,
      guestId: selectedGuest._id,
      ...(form.paymentTiming === "now" && { paymentMethod: form.paymentMethod }),
    };
    const res = await dispatch(createBooking(payload));
    if (!res.error) {
      notifySuccess("Booking created successfully!");
      setShowForm(false);
      setForm({ room: "", checkInDate: "", checkOutDate: "", paymentTiming: "checkin", paymentMethod: "cash" });
      setSelectedGuest(null);
      setGuestQuery("");
    }
  };

  const openForm = () => {
    setShowForm(true);
    dispatch(clearBookingError());
  };

  return (
    <Card
      title="Create Booking for Guest"
      icon="📝"
      action={
        <button
          onClick={showForm ? () => setShowForm(false) : openForm}
          className="text-xs px-3 py-1.5 rounded-md border border-[#C9A24B] text-[#C9A24B] hover:bg-[#C9A24B]/10 transition"
        >
          {showForm ? "Close" : "+ New Booking"}
        </button>
      }
    >
      <div className="px-6 py-4">
        {!showForm ? (
          <p className="text-sm text-gray-400 text-center py-2">
            Click "+ New Booking" to create a reservation on behalf of a guest.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Guest search */}
            <div className="relative">
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                Search Guest *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={guestQuery}
                  onChange={handleGuestQuery}
                  placeholder="Type guest name or email…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A24B]"
                />
                {searchLoading && (
                  <div className="absolute right-3 top-3 w-4 h-4 border-2 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {showGuestDrop && guestResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {guestResults.map((g) => (
                    <button
                      key={g._id}
                      type="button"
                      onClick={() => selectGuest(g)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#C9A24B]/10 border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-[#0B1F2A]">{g.name}</p>
                      <p className="text-xs text-gray-400">
                        {g.email}{g.phone ? ` · ${g.phone}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedGuest && (
                <div className="mt-2 flex items-center gap-2 bg-[#C9A24B]/10 border border-[#C9A24B]/30 rounded-md px-3 py-2">
                  <span className="text-sm font-medium text-[#0B1F2A]">{selectedGuest.name}</span>
                  <span className="text-xs text-gray-500">{selectedGuest.email}</span>
                  <button
                    type="button"
                    onClick={clearGuest}
                    className="ml-auto text-gray-400 hover:text-gray-600 leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Room */}
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                  Room *
                </label>
                <select
                  required
                  value={form.room}
                  onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C9A24B]"
                >
                  <option value="">Select a room…</option>
                  {rooms
                    .filter((r) => r.status === "available")
                    .map((r) => (
                      <option key={r._id} value={r._id}>
                        Room {r.roomNumber} – {r.type} (${(r.discountPrice || r.price)?.toLocaleString()}/night)
                      </option>
                    ))}
                </select>
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                  Check-In *
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={form.checkInDate}
                  onChange={(e) => setForm((p) => ({ ...p, checkInDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A24B]"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                  Check-Out *
                </label>
                <input
                  type="date"
                  required
                  min={form.checkInDate || today}
                  value={form.checkOutDate}
                  onChange={(e) => setForm((p) => ({ ...p, checkOutDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A24B]"
                />
              </div>

              {/* Payment timing */}
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">
                  Payment Timing *
                </label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: "now",      label: "Pay Now" },
                    { value: "checkin",  label: "At Check-In" },
                    { value: "checkout", label: "At Check-Out" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition text-sm ${
                        form.paymentTiming === opt.value
                          ? "border-[#C9A24B] bg-[#C9A24B]/5 text-[#0B1F2A]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payTimingBooking"
                        value={opt.value}
                        checked={form.paymentTiming === opt.value}
                        onChange={() => setForm((p) => ({ ...p, paymentTiming: opt.value }))}
                        className="accent-[#C9A24B]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment method — only when paying now */}
              {form.paymentTiming === "now" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C9A24B]"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-sm px-5 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading || !selectedGuest}
                className="inline-flex items-center gap-1.5 justify-center bg-[#C9A24B] text-[#0B1F2A] text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {createLoading ? <><Spinner size="sm" color="#0B1F2A" /> Create Booking</> : "Create Booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
