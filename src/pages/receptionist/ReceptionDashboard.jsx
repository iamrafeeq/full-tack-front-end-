import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTodayActivity } from "../../redux/slice/receptionist/receptionistSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import TodayArrivals from "../../components/receptionist/TodayArrivals";
import TodayDepartures from "../../components/receptionist/TodayDepartures";
import CreateBookingForm from "../../components/receptionist/CreateBookingForm";
import RoomStatusTable from "../../components/receptionist/RoomStatusTable";

export default function ReceptionDashboard() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTodayActivity());
    dispatch(fetchAllRooms());
  }, [dispatch]);

  return (
    <ReceptionistLayout>
      <TodayArrivals />
      <TodayDepartures />
      <CreateBookingForm />
      <RoomStatusTable />
    </ReceptionistLayout>
  );
}
