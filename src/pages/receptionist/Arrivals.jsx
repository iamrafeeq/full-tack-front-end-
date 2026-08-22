import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTodayActivity } from "../../redux/slice/receptionist/receptionistSlice";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import TodayArrivals from "../../components/receptionist/TodayArrivals";

export default function ArrivalsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTodayActivity());
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  return (
    <ReceptionistLayout title="Today's Arrivals">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Today's Arrivals</h1>
          <p className="text-sm text-gray-500 mt-1">Check in guests and collect payments for today's arrivals.</p>
        </div>
        <TodayArrivals />
      </div>
    </ReceptionistLayout>
  );
}
