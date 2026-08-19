import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
  HOUSEKEEPING: "housekeeping",
  USER: "user",
};

const DASHBOARDS = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  receptionist: "/receptionist/dashboard",
  housekeeping: "/housekeeping/dashboard",
  user: "/",
};

function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F2A] px-4">
      <div className="bg-white w-full max-w-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-serif text-[#0B1F2A] mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}

export function GuestRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={DASHBOARDS[role] || "/"} replace />;
  }

  return children;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }

  return children;
}

export default ProtectedRoute;
