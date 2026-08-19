import { useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";

const STAFF_PREFIXES = ["/admin", "/manager", "/receptionist", "/housekeeping"];

function App() {
  const location = useLocation();
  const isStaffRoute = STAFF_PREFIXES.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  return (
    <div>
      {!isStaffRoute && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;
