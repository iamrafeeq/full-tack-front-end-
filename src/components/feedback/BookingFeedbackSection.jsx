import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookingFeedback,
  submitFeedback,
  clearSubmitError,
} from "../../redux/slice/feedback/feedbackSlice";
import StarRating from "./StarRating";

export default function BookingFeedbackSection({ bookingId }) {
  const dispatch = useDispatch();
  const { feedbackByBooking, fetchingBookings, submitLoading, submitError } =
    useSelector((s) => s.feedback);

  const feedback   = feedbackByBooking[bookingId];
  const isFetching = fetchingBookings[bookingId];
  const notFetched = feedback === undefined && !isFetching;

  const [formOpen, setFormOpen] = useState(false);
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState("");

  useEffect(() => {
    if (notFetched) dispatch(fetchBookingFeedback(bookingId));
  }, [dispatch, bookingId, notFetched]);

  const openForm = () => {
    dispatch(clearSubmitError());
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setRating(0);
    setComment("");
    dispatch(clearSubmitError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    const res = await dispatch(submitFeedback({ booking: bookingId, rating, comment }));
    if (!res.error) closeForm();
  };

  // Loading
  if (isFetching || notFetched) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="w-3 h-3 border-2 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  // Feedback already submitted — read-only view
  if (feedback) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1.5">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Your rating</p>
        <div className="flex items-center gap-2">
          <StarRating value={feedback.rating} readOnly size="text-base" />
          <span className="text-xs text-gray-500 font-medium">{feedback.rating}/5</span>
        </div>
        {feedback.comment && (
          <p className="text-xs text-gray-600 italic leading-relaxed">"{feedback.comment}"</p>
        )}
      </div>
    );
  }

  // No feedback yet — button or inline form
  if (!formOpen) {
    return (
      <button
        onClick={openForm}
        className="w-full text-sm border border-[#C9A24B] text-[#C9A24B] rounded-lg py-2 hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors font-medium"
      >
        Leave Feedback
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Rate your stay</p>
        <StarRating value={rating} onChange={setRating} />
        {!rating && (
          <p className="text-xs text-gray-400 mt-1">Select a star to continue</p>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#C9A24B] transition-colors"
      />

      {submitError && (
        <p className="text-xs text-red-500">{submitError}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={closeForm}
          className="flex-1 text-sm border border-gray-300 text-gray-500 rounded-lg py-2 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!rating || submitLoading}
          className="flex-1 text-sm bg-[#0B1F2A] text-white rounded-lg py-2 hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
        >
          {submitLoading ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
