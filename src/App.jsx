import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastStyle={{ fontFamily: "inherit" }}
      />
    </div>
  );
}

export default App;
