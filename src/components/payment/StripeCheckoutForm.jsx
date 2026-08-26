import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useDispatch } from "react-redux";
import { confirmStripePayment } from "../../redux/slice/payments/paymentsSlice";
import { notifyError, notifyInfo } from "../../utils/toast";

export default function StripeCheckoutForm({ bookingId, total, onSuccess, onCancel }) {
  const stripe   = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (stripeError) {
      notifyError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const res = await dispatch(
        confirmStripePayment({
          bookingId,
          paymentIntentId: paymentIntent.id,
          paymentMethod: "credit_card",
        })
      );

      if (res.error) {
        notifyInfo("Payment received! Your booking will be updated shortly.");
        setTimeout(onSuccess, 2500);
        return;
      }

      onSuccess();
      return;
    }

    notifyError("Payment was not completed. Please try again.");
    setLoading(false);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-[#C9A24B]">
        Step 2 of 2
      </p>
      <h2 className="font-serif text-2xl text-[#0B1F2A] sm:text-3xl">
        Complete Payment
      </h2>

      {total > 0 && (
        <div className="mt-4 mb-6 flex items-center justify-between rounded-xl bg-[#0B1F2A]/5 px-5 py-4">
          <span className="text-sm text-gray-600">Amount due</span>
          <span className="font-serif text-2xl font-semibold text-[#C9A24B]">
            ${total.toLocaleString()}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Stripe's PaymentElement renders card fields */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <PaymentElement options={{ layout: "tabs" }} />
        </div>

        {/* Test card helper */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 space-y-0.5">
          <p className="font-medium">Test mode — use these card details:</p>
          <p>Card: <span className="font-mono">4242 4242 4242 4242</span></p>
          <p>Expiry: any future date &nbsp;·&nbsp; CVC: any 3 digits</p>
          <p className="mt-1 text-blue-500">Declined card: <span className="font-mono">4000 0000 0000 0002</span></p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading || !stripe || !elements}
            className="flex-1 rounded-full bg-[#0B1F2A] py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing…
              </span>
            ) : (
              `Pay $${total?.toLocaleString() || ""}`
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-gray-300 px-6 py-3 text-sm text-gray-600 transition hover:border-gray-400 hover:text-gray-800 disabled:opacity-50"
          >
            ← Go Back
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Payments secured by Stripe · SSL encrypted
      </div>
    </div>
  );
}
