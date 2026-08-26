import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { payBooking } from "../../redux/slice/Booking/bookingSlice";
import { PAYMENT_METHODS } from "./shared";
import { notifySuccess, notifyError } from "../../utils/toast";
import Spinner from "../Spinner";

export default function CollectPaymentModal({ bookingId, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { payLoading, payError } = useSelector((s) => s.bookings);
  const [payMethod, setPayMethod] = useState("cash");

  useEffect(() => { if (payError) notifyError(payError); }, [payError]);

  const handleSubmit = async () => {
    const res = await dispatch(payBooking({ bookingId, paymentMethod: payMethod }));
    if (!res.error) {
      notifySuccess("Payment recorded successfully.");
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
        <h3 className="text-lg font-serif text-[#0B1F2A] mb-1">Collect Payment</h3>
        <p className="text-sm text-gray-400 mb-5">Select the payment method received from the guest.</p>

        <div className="space-y-2 mb-6">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.value}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition ${
                payMethod === m.value
                  ? "border-[#C9A24B] bg-[#C9A24B]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="collectPayMethod"
                value={m.value}
                checked={payMethod === m.value}
                onChange={(e) => setPayMethod(e.target.value)}
                className="accent-[#C9A24B]"
              />
              <span className="text-sm text-[#0B1F2A] font-medium">{m.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={payLoading}
            className="flex-1 inline-flex items-center gap-1.5 justify-center bg-[#0B1F2A] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {payLoading ? <><Spinner size="sm" color="white" /> Confirm Payment</> : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
