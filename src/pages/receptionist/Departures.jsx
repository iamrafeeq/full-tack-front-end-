import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTodayActivity } from "../../redux/slice/receptionist/receptionistSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import TodayDepartures from "../../components/receptionist/TodayDepartures";

export default function DeparturesPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTodayActivity());
  }, [dispatch]);

  return (
    <ReceptionistLayout title="Today's Departures">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Today's Departures</h1>
          <p className="text-sm text-gray-500 mt-1">Process check-outs and collect any outstanding payments.</p>
        </div>
        <TodayDepartures />
      </div>
    </ReceptionistLayout>
  );
}
