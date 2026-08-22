import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import ReportMaintenanceForm from "../../components/receptionist/ReportMaintenanceForm";

export default function ReportIssuePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  return (
    <ReceptionistLayout title="Report Issue">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Report a Maintenance Issue</h1>
          <p className="text-sm text-gray-500 mt-1">Flag a room for the maintenance team.</p>
        </div>
        <ReportMaintenanceForm />
      </div>
    </ReceptionistLayout>
  );
}
