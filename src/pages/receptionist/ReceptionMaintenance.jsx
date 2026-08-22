import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import MaintenanceRequestsView from "../../components/maintenance/MaintenanceRequestsView";

export default function ReceptionMaintenancePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  return (
    <ReceptionistLayout title="Maintenance">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Maintenance Requests</h1>
          <p className="text-sm text-gray-500 mt-1">View, update, and assign maintenance issues.</p>
        </div>
        <MaintenanceRequestsView />
      </div>
    </ReceptionistLayout>
  );
}
