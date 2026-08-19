import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTodayActivity } from "../../redux/slice/receptionist/receptionistSlice";
import { Card, THead, GuestCell, RoomCell, PayBadge, Spinner, Empty, fmtDate } from "./shared";
import CheckoutModal from "./CheckoutModal";
import InvoiceConfirmModal from "./InvoiceConfirmModal";
import CollectPaymentModal from "./CollectPaymentModal";

export default function TodayDepartures() {
  const dispatch = useDispatch();
  const { departures, todayLoading } = useSelector((s) => s.receptionist);

  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [confirmedInvoice, setConfirmedInvoice] = useState(null);
  const [payBookingId, setPayBookingId] = useState(null);

  const handleCheckoutSuccess = (invoice) => {
    dispatch(fetchTodayActivity());
    setConfirmedInvoice(invoice);
  };

  const handlePaySuccess = () => {
    dispatch(fetchTodayActivity());
  };

  return (
    <>
      <Card title="Today's Departures" icon="🛫" count={departures.length}>
        {todayLoading ? (
          <Spinner />
        ) : departures.length === 0 ? (
          <Empty msg="No departures expected today." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Guest", "Room", "Check-Out", "Payment", "Actions"]} />
              <tbody>
                {departures.map((b) => (
                  <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <GuestCell guest={b.guest} />
                    <RoomCell room={b.room} />
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkOutDate)}</td>
                    <td className="px-4 py-3"><PayBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {b.paymentStatus === "pending" &&
                          b.status !== "cancelled" &&
                          b.status !== "checked-out" && (
                            <button
                              onClick={() => setPayBookingId(b._id)}
                              className="text-xs px-2.5 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600"
                            >
                              Collect Pay
                            </button>
                          )}
                        {b.status === "checked-in" && (
                          <button
                            onClick={() => setCheckoutBooking(b)}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Check Out
                          </button>
                        )}
                        {b.status === "checked-out" && (
                          <span className="text-xs font-medium text-gray-500">Checked Out</span>
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

      {checkoutBooking && (
        <CheckoutModal
          booking={checkoutBooking}
          onClose={() => setCheckoutBooking(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {confirmedInvoice && (
        <InvoiceConfirmModal
          invoice={confirmedInvoice}
          onClose={() => setConfirmedInvoice(null)}
        />
      )}

      {payBookingId && (
        <CollectPaymentModal
          bookingId={payBookingId}
          onClose={() => setPayBookingId(null)}
          onSuccess={handlePaySuccess}
        />
      )}
    </>
  );
}
