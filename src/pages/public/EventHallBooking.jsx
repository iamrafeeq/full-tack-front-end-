import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { fetchAllEventHalls } from "../../redux/slice/eventHalls/eventHallSlice";
import { createEventHallBooking, clearCreateError } from "../../redux/slice/eventHallBookings/eventHallBookingSlice";
import { createPaymentIntent, clearPaymentState } from "../../redux/slice/payments/paymentsSlice";
import { useAuth } from "../../context/AuthContext";
import StripeCheckoutForm from "../../components/payment/StripeCheckoutForm";
import Spinner from "../../components/Spinner";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const stripeAppearance = {
  theme: "stripe",
  variables: {
    colorPrimary:    "#C9A24B",
    colorBackground: "#ffffff",
    colorText:       "#0B1F2A",
    colorDanger:     "#dc2626",
    fontFamily:      "ui-sans-serif, system-ui, sans-serif",
    borderRadius:    "8px",
  },
};

const EVENT_TYPES = [
  { value: "wedding",    label: "Wedding" },
  { value: "conference", label: "Conference" },
  { value: "birthday",   label: "Birthday Party" },
  { value: "corporate",  label: "Corporate Event" },
  { value: "other",      label: "Other" },
];

const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMins = 7 * 60 + i * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const label = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return { value, label };
});

function timeToMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function calcHours(start, end) {
  const diff = timeToMins(end) - timeToMins(start);
  return diff > 0 ? diff / 60 : 0;
}

export default function EventHallBooking() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { token, user: authUser } = useAuth();

  const { halls, loading: hallsLoading } = useSelector((s) => s.eventHalls);
  const { createLoading, createError }   = useSelector((s) => s.eventHallBookings);
  const { intentLoading, intentError }   = useSelector((s) => s.payments);

  const [form, setForm] = useState({
    eventDate:       "",
    startTime:       "09:00",
    endTime:         "12:00",
    eventType:       "wedding",
    guestCount:      50,
    specialRequests: "",
  });
  const [selectedHall, setSelectedHall] = useState(null);
  const [step,         setStep]         = useState("form"); // form | payment | done
  const [paymentInfo,  setPaymentInfo]  = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    dispatch(fetchAllEventHalls(false));
    dispatch(clearCreateError());
    dispatch(clearPaymentState());
  }, [dispatch]);

  const hours         = calcHours(form.startTime, form.endTime);
  const estimatedTotal = selectedHall ? hours * (selectedHall.hourlyRate || 0) : 0;

  const availableHalls = halls.filter(
    (h) => h.isActive !== false && h.status === "available" && h.capacity >= form.guestCount
  );

  const isCapacityError = createError?.toLowerCase().includes("capacity") ||
                          createError?.toLowerCase().includes("exceeds");
  const isConflictError = createError?.toLowerCase().includes("conflict") ||
                          createError?.toLowerCase().includes("overlap") ||
                          createError?.toLowerCase().includes("already booked");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "guestCount" ? Number(value) : value }));
    if (name === "guestCount" || name === "eventDate") setSelectedHall(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    if (!selectedHall) return;
    if (hours <= 0) return;

    dispatch(createEventHallBooking({
      hall:            selectedHall._id,
      eventDate:       form.eventDate,
      startTime:       form.startTime,
      endTime:         form.endTime,
      eventType:       form.eventType,
      guestCount:      form.guestCount,
      specialRequests: form.specialRequests,
    })).then((result) => {
      if (result.error) return;
      const bookingId = result.payload?._id;
      if (!bookingId) return;
      dispatch(createPaymentIntent({ bookingId })).then((intentResult) => {
        if (!intentResult.error) {
          setPaymentInfo({ bookingId, clientSecret: intentResult.payload.clientSecret, total: result.payload.totalAmount || estimatedTotal });
          setStep("payment");
        }
      });
    });
  };

  // ── Done ─────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="mt-6 font-serif text-3xl text-[#0B1F2A]">Booking Confirmed!</h1>
        <p className="mt-3 max-w-md text-gray-500">
          Your event hall booking has been created and payment processed.
          Our team will review and confirm your reservation shortly.
          We look forward to hosting your event.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/my-event-hall-bookings"
            className="rounded-full bg-[#C9A24B] px-8 py-3 font-medium text-[#0B1F2A] transition hover:opacity-90"
          >
            View My Bookings
          </Link>
          <Link
            to="/"
            className="rounded-full border border-[#0B1F2A] px-8 py-3 font-medium text-[#0B1F2A] transition hover:bg-[#0B1F2A] hover:text-white"
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
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-[#0B1F2A]/70" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="font-serif text-4xl sm:text-5xl">
            {step === "payment" ? "Secure Payment" : "Book an Event Hall"}
          </h1>
          <p className="mt-4 max-w-xl text-gray-200">
            {step === "payment"
              ? "Your booking is reserved — complete payment to confirm."
              : "Host your perfect event at LuxuryStay. Weddings, conferences, birthdays, and more."}
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-3">

          {/* Main content */}
          <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-10 lg:col-span-2">

            {/* PAYMENT STEP */}
            {step === "payment" && paymentInfo && (
              <>
                {!stripePromise ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700">
                    <strong>Stripe not configured.</strong> Add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to your env.
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret: paymentInfo.clientSecret, appearance: stripeAppearance }}
                  >
                    <StripeCheckoutForm
                      bookingId={paymentInfo.bookingId}
                      total={paymentInfo.total}
                      onSuccess={() => setStep("done")}
                      onCancel={() => setStep("form")}
                    />
                  </Elements>
                )}
              </>
            )}

            {/* BOOKING FORM STEP */}
            {step === "form" && (
              <>
                {!token && (
                  <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                    You need to <Link to="/login" className="font-medium underline">log in</Link> before completing your booking.
                  </div>
                )}

                {createError && (
                  <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
                    isCapacityError
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : isConflictError
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}>
                    {isCapacityError && <span className="font-medium">Capacity exceeded: </span>}
                    {isConflictError && <span className="font-medium">Scheduling conflict: </span>}
                    {createError}
                  </div>
                )}

                {intentError && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{intentError}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Date + Times */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Event Date *</label>
                      <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange}
                        required min={today}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Start Time *</label>
                      <select name="startTime" value={form.startTime} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none">
                        {TIME_SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">End Time *</label>
                      <select name="endTime" value={form.endTime} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none">
                        {TIME_SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      {hours <= 0 && form.startTime && form.endTime && (
                        <p className="mt-1 text-xs text-red-500">End time must be after start time.</p>
                      )}
                    </div>
                  </div>

                  {/* Event type + guest count */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Event Type *</label>
                      <select name="eventType" value={form.eventType} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none">
                        {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Expected Guests *</label>
                      <input type="number" name="guestCount" min="1" max="10000"
                        value={form.guestCount} onChange={handleChange} required
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none" />
                    </div>
                  </div>

                  {/* Special requests */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Special Requests</label>
                    <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange}
                      rows={3} placeholder="Catering needs, décor preferences, AV requirements…"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#C9A24B] focus:outline-none resize-none" />
                  </div>

                  {/* Available halls */}
                  {form.eventDate && hours > 0 && (
                    <div>
                      <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-gray-500">
                        Select a Hall *
                      </label>
                      {hallsLoading ? (
                        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                      ) : availableHalls.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 px-5 py-6 text-center text-sm text-gray-500">
                          No halls available for {form.guestCount} guests on this date.
                          Try a different date or reduce your guest count.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableHalls.map((hall) => {
                            const hallTotal = hours * (hall.hourlyRate || 0);
                            const isSelected = selectedHall?._id === hall._id;
                            return (
                              <label key={hall._id}
                                className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition ${
                                  isSelected ? "border-[#C9A24B] bg-[#C9A24B]/5" : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input type="radio" name="hall" value={hall._id} checked={isSelected}
                                    onChange={() => setSelectedHall(hall)}
                                    className="mt-1 accent-[#C9A24B]" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <p className="font-semibold text-[#0B1F2A]">{hall.hallName}</p>
                                      <p className="font-serif text-lg text-[#C9A24B]">${hallTotal.toLocaleString()}</p>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                                      <span>Up to {hall.capacity} guests</span>
                                      <span>${(hall.hourlyRate || 0).toLocaleString()}/hr × {hours} hr{hours !== 1 ? "s" : ""}</span>
                                    </div>
                                    {(hall.amenities || []).length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {hall.amenities.map((a) => (
                                          <span key={a} className="text-xs bg-[#C9A24B]/10 text-[#7a5c1e] px-2 py-0.5 rounded-full">{a}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Guest details */}
                  {token && authUser && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">Your Account Details</p>
                      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <p><span className="text-gray-400">Name: </span><span className="font-medium text-[#0B1F2A]">{authUser.name || "—"}</span></p>
                        <p><span className="text-gray-400">Email: </span><span className="font-medium text-[#0B1F2A]">{authUser.email || "—"}</span></p>
                      </div>
                    </div>
                  )}

                  {/* Payment notice */}
                  <div className="flex items-center gap-3 rounded-xl border border-[#C9A24B]/30 bg-[#C9A24B]/5 px-4 py-3">
                    <span className="text-lg">💳</span>
                    <div>
                      <p className="text-sm font-medium text-[#0B1F2A]">Secure online payment via Stripe</p>
                      <p className="text-xs text-gray-400 mt-0.5">Payment required to confirm your booking · SSL encrypted</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createLoading || intentLoading || !token || hours <= 0 || !selectedHall || !form.eventDate}
                    className="inline-flex items-center gap-1.5 justify-center w-full rounded-full bg-[#0B1F2A] py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
                  >
                    {(createLoading || intentLoading)
                      ? <><Spinner size="sm" color="white" /> {createLoading ? "Creating booking…" : "Preparing payment…"}</>
                      : !token
                      ? "Log in to Book"
                      : "Book & Pay →"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-[#0B1F2A] p-8 text-white shadow-xl">
              <h3 className="font-serif text-xl text-[#C9A24B]">Booking Summary</h3>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Hall</span>
                  <span className="font-medium">{selectedHall?.hallName || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Event Date</span>
                  <span className="font-medium">{form.eventDate || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Time</span>
                  <span className="font-medium">
                    {form.startTime && form.endTime
                      ? `${TIME_SLOTS.find(s => s.value === form.startTime)?.label || form.startTime} – ${TIME_SLOTS.find(s => s.value === form.endTime)?.label || form.endTime}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Duration</span>
                  <span className="font-medium">{hours > 0 ? `${hours} hr${hours !== 1 ? "s" : ""}` : "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Event Type</span>
                  <span className="font-medium capitalize">{EVENT_TYPES.find(t => t.value === form.eventType)?.label || form.eventType}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-gray-300">Guests</span>
                  <span className="font-medium">{form.guestCount}</span>
                </div>
                {selectedHall && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-gray-300">Rate</span>
                    <span className="font-medium">${(selectedHall.hourlyRate || 0).toLocaleString()}/hr</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-gray-300">Estimated Total</span>
                <span className="font-serif text-2xl text-[#C9A24B]">
                  {estimatedTotal > 0 ? `$${estimatedTotal.toLocaleString()}` : "—"}
                </span>
              </div>
              {estimatedTotal > 0 && (
                <p className="mt-1 text-xs text-gray-400">Final amount confirmed by server</p>
              )}

              {step === "payment" && (
                <div className="mt-4 rounded-lg bg-green-900/30 border border-green-700/40 px-3 py-2 text-xs text-green-300">
                  ✓ Booking created · Payment pending
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
