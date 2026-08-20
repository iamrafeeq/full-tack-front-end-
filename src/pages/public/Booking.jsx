import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking, clearBookingError } from "../../redux/slice/Booking/bookingSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";
import { fetchSettings } from "../../redux/slice/settings/settingsSlice";
import { useAuth } from "../../context/AuthContext";

function Booking() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  // Room pre-selected via query param: /booking?room=<_id>
  const preselectedId = searchParams.get("room");

  const { token, user: authUser } = useAuth();
  const { rooms, loading: roomsLoading } = useSelector((state) => state.rooms);
  const { createLoading, createError }   = useSelector((state) => state.bookings);
  const hotelSettings = useSelector((state) => state.settings?.data);

  const [form, setForm] = useState({
    room:          preselectedId || "",
    checkIn:       "",
    checkOut:      "",
    paymentTiming: "now",
    paymentMethod: "credit_card",
  });
  const [confirmed, setConfirmed] = useState(false);

  // Today's date string for min="" on date inputs
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    dispatch(fetchAllRooms());
    dispatch(clearBookingError());
    dispatch(fetchSettings());
  }, [dispatch]);

  // If rooms load and a preselected ID is in the URL, keep it in form
  useEffect(() => {
    if (preselectedId) setForm((prev) => ({ ...prev, room: preselectedId }));
  }, [preselectedId]);

  const selectedRoom = rooms.find((r) => r._id === form.room);

  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  };

  const nights = getNights();
  const pricePerNight = selectedRoom?.discountPrice || selectedRoom?.price || 0;
  const total  = nights * pricePerNight;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    if (!form.room || !form.checkIn || !form.checkOut || nights < 1) return;

    dispatch(createBooking({
      room:          form.room,
      checkInDate:   form.checkIn,
      checkOutDate:  form.checkOut,
      paymentTiming: form.paymentTiming,
      ...(form.paymentTiming === "now" && { paymentMethod: form.paymentMethod }),
    })).then((result) => {
      if (!result.error) setConfirmed(true);
    });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-6 font-serif text-3xl text-[#0B1F2A]">Booking Confirmed!</h1>
        <p className="mt-3 max-w-md text-gray-500">
          Your reservation has been successfully created.{" "}
          {selectedRoom && <>Room {selectedRoom.roomNumber} is reserved from {form.checkIn} to {form.checkOut}.</>}
          {" "}We look forward to hosting you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/rooms"
            className="rounded-full border border-[#0B1F2A] px-8 py-3 font-medium text-[#0B1F2A] transition hover:bg-[#0B1F2A] hover:text-white"
          >
            Browse Rooms
          </Link>
          <Link
            to="/"
            className="rounded-full bg-[#C9A24B] px-8 py-3 font-medium text-[#0B1F2A] transition hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-[#1F2937]">
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[320px] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-[#0B1F2A]/70" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">Book Your Stay</h1>
          <p className="mt-4 max-w-xl text-gray-200">Complete the form below to reserve your room at LuxuryStay.</p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Form */}
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10 lg:col-span-2">

            {/* Not logged in banner */}
            {!token && (
              <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                You need to{" "}
                <Link to="/login" className="font-medium underline">log in</Link>
                {" "}before completing your booking.
              </div>
            )}

            {/* API error */}
            {createError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {createError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Room selector */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Room *
                </label>

                {roomsLoading ? (
                  <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ) : preselectedId && selectedRoom ? (
                  /* Pre-selected from room detail page — show as read-only card */
                  <div className="rounded-lg border border-[#C9A24B]/40 bg-[#C9A24B]/5 px-4 py-4 space-y-3">
                    {/* Room identity */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[#0B1F2A] text-base">
                        Room {selectedRoom.roomNumber} &mdash; {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)}
                      </p>
                      <span className="shrink-0 rounded-full bg-[#C9A24B]/20 px-2.5 py-0.5 text-xs font-medium text-[#7a5c1e]">
                        Selected
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Price / Night</span>
                        <p className="font-semibold text-[#0B1F2A]">
                          ${selectedRoom.discountPrice || selectedRoom.price}
                          {selectedRoom.discountPrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through">${selectedRoom.price}</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Bed Type</span>
                        <p className="font-medium text-[#0B1F2A] capitalize">{selectedRoom.bedType || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Capacity</span>
                        <p className="font-medium text-[#0B1F2A]">Up to {selectedRoom.capacity} guest{selectedRoom.capacity !== 1 ? "s" : ""}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Status</span>
                        <p>
                          {selectedRoom.status === "available" && <span className="text-green-600 font-medium">Available</span>}
                          {selectedRoom.status === "occupied"  && <span className="text-orange-500 font-medium">Occupied</span>}
                          {selectedRoom.status === "cleaning"  && <span className="text-yellow-600 font-medium">Cleaning</span>}
                          {selectedRoom.status === "reserved"  && <span className="text-blue-600 font-medium">Reserved</span>}
                        </p>
                      </div>
                    </div>

                    {/* Occupied notice */}
                    {(selectedRoom.status === "occupied" || selectedRoom.status === "cleaning") && (
                      <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        This room is currently occupied — pick future dates and your booking will be confirmed if those dates are free.
                      </p>
                    )}
                  </div>
                ) : (
                  /* No pre-selection — show the full dropdown */
                  <>
                    <select
                      name="room"
                      value={form.room}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                    >
                      <option value="">-- Choose a room --</option>
                      {rooms
                        .filter((r) => r.status !== "maintenance")
                        .map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.roomNumber} — {r.type.charAt(0).toUpperCase() + r.type.slice(1)} (${r.discountPrice || r.price}/night, {r.capacity} guests)
                          </option>
                        ))}
                    </select>
                    {rooms.filter((r) => r.status !== "maintenance").length === 0 && (
                      <p className="mt-1 text-xs text-red-500">No rooms are available for booking.</p>
                    )}
                    {form.room && selectedRoom && (selectedRoom.status === "occupied" || selectedRoom.status === "cleaning") && (
                      <p className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        This room is currently occupied — your booking dates must start after the current guest checks out.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Check-In Date *
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={form.checkIn}
                    onChange={handleChange}
                    required
                    min={today}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Check-Out Date *
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={form.checkOut}
                    onChange={handleChange}
                    required
                    min={form.checkIn || today}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
              </div>
              {nights === 0 && form.checkIn && form.checkOut && (
                <p className="text-xs text-red-500">Check-out must be after check-in.</p>
              )}

              {/* Guest info (pre-filled, read-only) */}
              {token && authUser && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">Your Account Details</p>
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p><span className="text-gray-400">Name: </span><span className="font-medium text-[#0B1F2A]">{authUser.name || "—"}</span></p>
                    <p><span className="text-gray-400">Email: </span><span className="font-medium text-[#0B1F2A]">{authUser.email || "—"}</span></p>
                  </div>
                </div>
              )}

              {/* Payment timing */}
              <div>
                <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Payment Timing *
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { value: "now",      label: "Pay Now",         sub: "Settle online immediately" },
                    { value: "checkin",  label: "Pay at Check-in", sub: "Pay when you arrive" },
                    { value: "checkout", label: "Pay at Check-out", sub: "Pay when you leave" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 px-4 py-3 transition ${
                        form.paymentTiming === opt.value
                          ? "border-[#C9A24B] bg-[#C9A24B]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentTiming"
                          value={opt.value}
                          checked={form.paymentTiming === opt.value}
                          onChange={handleChange}
                          className="accent-[#C9A24B]"
                        />
                        <span className="text-sm font-medium text-[#0B1F2A]">{opt.label}</span>
                      </div>
                      <span className="pl-5 text-xs text-gray-400">{opt.sub}</span>
                    </label>
                  ))}
                </div>

                {/* Payment method — shown only when paying now */}
                {form.paymentTiming === "now" && (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                      Payment Method *
                    </label>
                    <select
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                    <p className="mt-1.5 text-xs text-gray-400">
                      Mock payment — no real charge is made. A transaction ID is generated for the record.
                    </p>
                  </div>
                )}

                {form.paymentTiming !== "now" && (
                  <p className="mt-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    Payment will be collected {form.paymentTiming === "checkin" ? "when you arrive at the hotel" : "when you check out"}.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createLoading || !token || nights < 1 || !form.room}
                className="w-full rounded-full bg-[#0B1F2A] py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
              >
                {createLoading ? "Confirming…" : !token ? "Log in to Book" : form.paymentTiming === "now" ? "Confirm & Pay" : "Confirm Booking"}
              </button>
            </form>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-[#0B1F2A] p-8 text-white shadow-xl">
              <h3 className="font-serif text-xl text-[#C9A24B]">Booking Summary</h3>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Room</span>
                  <span className="font-medium">
                    {selectedRoom ? `${selectedRoom.roomNumber} — ${selectedRoom.type}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Bed</span>
                  <span className="font-medium capitalize">{selectedRoom?.bedType || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Price / Night</span>
                  <span className="font-medium">{pricePerNight ? `$${pricePerNight}` : "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Check-In</span>
                  <span className="font-medium">{form.checkIn || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Check-Out</span>
                  <span className="font-medium">{form.checkOut || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Nights</span>
                  <span className="font-medium">{nights || "—"}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-gray-300">Total</span>
                <span className="font-serif text-2xl text-[#C9A24B]">
                  {total > 0 ? `$${total.toLocaleString()}` : "—"}
                </span>
              </div>

              {/* Hotel Policies */}
              {hotelSettings && (hotelSettings.checkInTime || hotelSettings.checkOutTime || hotelSettings.cancellationPolicy) && (
                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-[#C9A24B]">Hotel Policies</p>
                  {hotelSettings.checkInTime && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Check-in</span>
                      <span className="text-white">{hotelSettings.checkInTime}</span>
                    </div>
                  )}
                  {hotelSettings.checkOutTime && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Check-out</span>
                      <span className="text-white">{hotelSettings.checkOutTime}</span>
                    </div>
                  )}
                  {hotelSettings.cancellationPolicy && (
                    <p className="text-xs text-gray-400 leading-relaxed">{hotelSettings.cancellationPolicy}</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Booking;
