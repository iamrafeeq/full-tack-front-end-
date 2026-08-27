import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createBooking, clearBookingError } from "../../redux/slice/Booking/bookingSlice";
import { createPaymentIntent, clearPaymentState } from "../../redux/slice/payments/paymentsSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";
import { fetchSettings } from "../../redux/slice/settings/settingsSlice";
import { fetchRoomFeedback } from "../../redux/slice/feedback/feedbackSlice";
import { useAuth } from "../../context/AuthContext";
import StripeCheckoutForm from "../../components/payment/StripeCheckoutForm";
import Spinner from "../../components/Spinner";
import {
  FiCheckCircle, FiCalendar, FiMoon, FiCreditCard,
  FiHome, FiList, FiLock,
} from "react-icons/fi";

// Initialise Stripe once at module level (outside component to avoid recreating the Promise)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// Stripe appearance — matches hotel brand colours
const stripeAppearance = {
  theme: "stripe",
  variables: {
    colorPrimary:     "#C9A24B",
    colorBackground:  "#ffffff",
    colorText:        "#0B1F2A",
    colorDanger:      "#dc2626",
    fontFamily:       "ui-sans-serif, system-ui, sans-serif",
    borderRadius:     "8px",
  },
};

function StarRow({ rating, small }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`${small ? "text-xs" : "text-sm"} leading-none ${n <= Math.round(rating) ? "text-[#C9A24B]" : "text-gray-200"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

function RoomRatingsBlock({ data, loading }) {
  if (loading) {
    return <div className="h-14 animate-pulse rounded-lg bg-gray-100" />;
  }
  if (!data || data.totalCount === 0) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <StarRow rating={data.averageRating} />
        <span className="font-semibold text-[#0B1F2A] text-sm">{data.averageRating}</span>
        <span className="text-xs text-gray-400">
          · {data.totalCount} {data.totalCount === 1 ? "review" : "reviews"}
        </span>
      </div>
      {data.reviews.slice(0, 3).map((r, i) => (
        <div key={i} className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <StarRow rating={r.rating} small />
            <span className="text-xs text-gray-400">
              {r.guestName} · {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
          {r.comment && (
            <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function Booking() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedId = searchParams.get("room");

  const { token, user: authUser } = useAuth();
  const { rooms, loading: roomsLoading } = useSelector((state) => state.rooms);
  const { createLoading, createError }   = useSelector((state) => state.bookings);
  const { intentLoading, intentError }   = useSelector((state) => state.payments);
  const hotelSettings = useSelector((state) => state.settings?.data);
  const { roomFeedback, roomFeedbackLoading } = useSelector((state) => state.feedback);

  const [form, setForm] = useState({
    room:          preselectedId || "",
    checkIn:       searchParams.get("checkIn")  || "",
    checkOut:      searchParams.get("checkOut") || "",
    paymentTiming: "now",
  });

  // 'form' → booking form, 'payment' → Stripe card form, 'done' → success overlay
  const [step, setStep]               = useState("form");
  const [paymentInfo, setPaymentInfo] = useState(null);     // { bookingId, clientSecret }
  const [confirmedBooking, setConfirmedBooking] = useState(null); // full booking payload

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    dispatch(fetchAllRooms());
    dispatch(clearBookingError());
    dispatch(clearPaymentState());
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (form.room) dispatch(fetchRoomFeedback(form.room));
  }, [form.room, dispatch]);

  useEffect(() => {
    if (preselectedId) setForm((prev) => ({ ...prev, room: preselectedId }));
  }, [preselectedId]);

  const selectedRoom  = rooms.find((r) => r._id === form.room);
  const pricePerNight = selectedRoom?.discountPrice || selectedRoom?.price || 0;

  const getNights = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  };
  const nights = getNights();
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
    })).then((result) => {
      if (result.error) return;

      const bookingId = result.payload?.booking?._id;
      setConfirmedBooking(result.payload?.booking ?? null);

      if (form.paymentTiming === "now" && bookingId) {
        dispatch(createPaymentIntent({ bookingId })).then((intentResult) => {
          if (!intentResult.error) {
            setPaymentInfo({ bookingId, clientSecret: intentResult.payload.clientSecret });
            setStep("payment");
          }
        });
      } else {
        setStep("done");
      }
    });
  };

  // ── Shared page shell — confirmation overlay is rendered inside the return ──
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
          <h1 className="font-serif text-4xl sm:text-5xl">
            {step === "payment" ? "Secure Payment" : "Book Your Stay"}
          </h1>
          <p className="mt-4 max-w-xl text-gray-200">
            {step === "payment"
              ? "Your booking is reserved — complete payment to confirm."
              : "Complete the form below to reserve your room at LuxuryStay."}
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">

          {/* ── Main content area ─────────────────────────────────────────── */}
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10 lg:col-span-2">

            {/* ── STEP: PAYMENT ─────────────────────────────────────────────── */}
            {step === "payment" && paymentInfo && (
              <>
                {!stripePromise ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700">
                    <strong>Stripe not configured.</strong> Add your publishable key to{" "}
                    <code>frontend/.env</code> as{" "}
                    <code>VITE_STRIPE_PUBLISHABLE_KEY</code>.
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: paymentInfo.clientSecret,
                      appearance: stripeAppearance,
                    }}
                  >
                    <StripeCheckoutForm
                      bookingId={paymentInfo.bookingId}
                      total={total}
                      onSuccess={() => setStep("done")}
                      onCancel={() => setStep("form")}
                    />
                  </Elements>
                )}
              </>
            )}

            {/* ── STEP: BOOKING FORM ────────────────────────────────────────── */}
            {step === "form" && (
              <>
                {!token && (
                  <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                    You need to{" "}
                    <Link to="/login" className="font-medium underline">log in</Link>
                    {" "}before completing your booking.
                  </div>
                )}

                {createError && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {createError}
                  </div>
                )}

                {intentError && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {intentError}
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
                      <div className="rounded-lg border border-[#C9A24B]/40 bg-[#C9A24B]/5 px-4 py-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#0B1F2A] text-base">
                            Room {selectedRoom.roomNumber} &mdash;{" "}
                            {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)}
                          </p>
                          <span className="shrink-0 rounded-full bg-[#C9A24B]/20 px-2.5 py-0.5 text-xs font-medium text-[#7a5c1e]">
                            Selected
                          </span>
                        </div>
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
                            <p className="font-medium text-[#0B1F2A]">
                              Up to {selectedRoom.capacity} guest{selectedRoom.capacity !== 1 ? "s" : ""}
                            </p>
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
                        {(selectedRoom.status === "occupied" || selectedRoom.status === "cleaning") && (
                          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                            This room is currently occupied — pick future dates and your booking will be confirmed if those dates are free.
                          </p>
                        )}
                      </div>
                    ) : (
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

                  {/* Room guest ratings */}
                  {form.room && (
                    <RoomRatingsBlock
                      data={roomFeedback[form.room]}
                      loading={roomFeedbackLoading[form.room]}
                    />
                  )}

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

                  {/* Guest info */}
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
                        { value: "now",      label: "Pay Now",          sub: "Secure online payment" },
                        { value: "checkin",  label: "Pay at Check-in",  sub: "Pay when you arrive" },
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

                    {/* Pay now — Stripe badge */}
                    {form.paymentTiming === "now" && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#C9A24B]/30 bg-[#C9A24B]/5 px-4 py-3">
                        <FiLock className="text-[#C9A24B] shrink-0" size={18} />
                        <div>
                          <p className="text-sm font-medium text-[#0B1F2A]">Secure online payment via Stripe</p>
                          <p className="text-xs text-gray-400 mt-0.5">Card details collected on the next step · SSL encrypted</p>
                        </div>
                      </div>
                    )}

                    {form.paymentTiming !== "now" && (
                      <p className="mt-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        Payment will be collected{" "}
                        {form.paymentTiming === "checkin" ? "when you arrive at the hotel" : "when you check out"}.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={createLoading || intentLoading || !token || nights < 1 || !form.room}
                    className="inline-flex items-center gap-1.5 justify-center w-full rounded-full bg-[#0B1F2A] py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
                  >
                    {(createLoading || intentLoading)
                      ? <><Spinner size="sm" color="white" /> {createLoading ? "Confirming…" : "Preparing payment…"}</>
                      : !token
                      ? "Log in to Book"
                      : form.paymentTiming === "now"
                      ? "Confirm & Pay →"
                      : "Confirm Booking"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── Booking summary sidebar (always visible) ──────────────────── */}
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

              {step === "payment" && (
                <div className="mt-4 rounded-lg bg-green-900/30 border border-green-700/40 px-3 py-2 text-xs text-green-300">
                  ✓ Booking reserved · Payment pending
                </div>
              )}

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

      {/* ── Booking confirmation modal ──────────────────────────────────── */}
      {step === "done" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0B1F2A]/80 backdrop-blur-sm" />

          {/* Modal card */}
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#C9A24B] via-[#e4c07a] to-[#C9A24B]" />

            <div className="px-8 pt-8 pb-6">
              {/* Icon + title */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-4">
                  <FiCheckCircle className="text-green-500" size={32} />
                </div>
                <h2 className="font-serif text-2xl text-[#0B1F2A] leading-tight">Booking Confirmed</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  Your reservation has been successfully created
                </p>
                {confirmedBooking?._id && (
                  <div className="mt-3 rounded-full bg-gray-100 px-4 py-1 text-xs font-mono text-gray-500 tracking-wide">
                    Ref #{confirmedBooking._id.slice(-8).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Booking details grid */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                <div className="flex items-center gap-3 px-4 py-3">
                  <FiHome className="text-[#C9A24B] shrink-0" size={15} />
                  <span className="text-xs text-gray-400 w-20 shrink-0">Room</span>
                  <span className="text-sm font-medium text-[#0B1F2A] capitalize ml-auto text-right">
                    {selectedRoom
                      ? `${selectedRoom.roomNumber} — ${selectedRoom.type}`
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <FiCalendar className="text-[#C9A24B] shrink-0" size={15} />
                  <span className="text-xs text-gray-400 w-20 shrink-0">Check-in</span>
                  <span className="text-sm font-medium text-[#0B1F2A] ml-auto">
                    {form.checkIn
                      ? new Date(form.checkIn + "T12:00:00").toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <FiCalendar className="text-[#C9A24B] shrink-0" size={15} />
                  <span className="text-xs text-gray-400 w-20 shrink-0">Check-out</span>
                  <span className="text-sm font-medium text-[#0B1F2A] ml-auto">
                    {form.checkOut
                      ? new Date(form.checkOut + "T12:00:00").toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <FiMoon className="text-[#C9A24B] shrink-0" size={15} />
                  <span className="text-xs text-gray-400 w-20 shrink-0">Nights</span>
                  <span className="text-sm font-medium text-[#0B1F2A] ml-auto">{nights}</span>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <FiCreditCard className="text-[#C9A24B] shrink-0" size={15} />
                  <span className="text-xs text-gray-400 w-20 shrink-0">Payment</span>
                  <span className="ml-auto">
                    {paymentInfo ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <FiCheckCircle size={11} /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Pay at hotel
                      </span>
                    )}
                  </span>
                </div>

                {total > 0 && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xs text-gray-400 w-20 shrink-0 pl-[23px]">Total</span>
                    <span className="font-serif text-lg font-semibold text-[#0B1F2A] ml-auto">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A24B] py-3 px-5 text-sm font-medium text-[#0B1F2A] transition hover:opacity-90"
                >
                  <FiList size={15} />
                  View My Bookings
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 py-3 px-5 text-sm font-medium text-gray-600 transition hover:border-[#0B1F2A] hover:text-[#0B1F2A]"
                >
                  <FiHome size={15} />
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;
