import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkInBooking } from "../../redux/slice/Booking/bookingSlice";
import { fetchTodayActivity } from "../../redux/slice/receptionist/receptionistSlice";
import { Card, THead, GuestCell, RoomCell, PayBadge, Spinner, Empty, fmtDate } from "./shared";
import CollectPaymentModal from "./CollectPaymentModal";
import { notifySuccess, notifyError } from "../../utils/toast";

export default function TodayArrivals() {
  const dispatch = useDispatch();
  const { arrivals, todayLoading, todayError } = useSelector((s) => s.receptionist);
  const { checkInLoading, checkInError } = useSelector((s) => s.bookings);

  const [payBookingId, setPayBookingId] = useState(null);

  useEffect(() => { if (todayError)   notifyError(todayError); },   [todayError]);
  useEffect(() => { if (checkInError) notifyError(checkInError); }, [checkInError]);

  const handleCheckIn = async (id) => {
    const res = await dispatch(checkInBooking(id));
    if (!res.error) {
      notifySuccess("Guest checked in successfully.");
      dispatch(fetchTodayActivity());
    }
  };

  return (
    <>
      <Card title="Today's Arrivals" icon="🛬" count={arrivals.length}>
        {todayLoading ? (
          <Spinner />
        ) : arrivals.length === 0 ? (
          <Empty msg="No arrivals expected today." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Guest", "Room", "Check-In", "Payment", "Actions"]} />
              <tbody>
                {arrivals.map((b) => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <GuestCell guest={b.guest} />
                    <RoomCell room={b.room} />
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkInDate)}</td>
                    <td className="px-4 py-3"><PayBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {b.paymentStatus === "pending" && b.status !== "cancelled" && (
                          <button
                            onClick={() => setPayBookingId(b._id)}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600"
                          >
                            Collect Pay
                          </button>
                        )}
                        {b.status === "booked" && (
                          <button
                            onClick={() => handleCheckIn(b._id)}
                            disabled={checkInLoading}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {checkInLoading ? "…" : "Check In"}
                          </button>
                        )}
                        {b.status === "checked-in" && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1.5 rounded-md">
                            Checked In
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {payBookingId && (
        <CollectPaymentModal
          bookingId={payBookingId}
          onClose={() => setPayBookingId(null)}
          onSuccess={() => dispatch(fetchTodayActivity())}
        />
      )}
    </>
  );
}
