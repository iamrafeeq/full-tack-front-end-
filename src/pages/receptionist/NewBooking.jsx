import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import CreateBookingForm from "../../components/receptionist/CreateBookingForm";

export default function NewBookingPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  return (
    <ReceptionistLayout title="New Booking">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Create Booking</h1>
          <p className="text-sm text-gray-500 mt-1">Reserve a room on behalf of a registered guest.</p>
        </div>
        <CreateBookingForm />
      </div>
    </ReceptionistLayout>
  );
}
