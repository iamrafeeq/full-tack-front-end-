import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import RoomStatusTable from "../../components/receptionist/RoomStatusTable";

export default function RoomStatusPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  return (
    <ReceptionistLayout title="Room Status">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Room Status</h1>
          <p className="text-sm text-gray-500 mt-1">View current occupancy and filter rooms by status.</p>
        </div>
        <RoomStatusTable />
      </div>
    </ReceptionistLayout>
  );
}
