import { useDispatch, useSelector } from "react-redux";
import { updateUserRole } from "../../../redux/slice/adminSlice/guestUser";

const ROLES = ["user", "receptionist", "housekeeping", "manager", "admin"];

export default function RoleSelect({ user }) {
  const dispatch = useDispatch();
  const { roleLoading } = useSelector((state) => state.guestUser);

  const handleChange = (e) => {
    if (e.target.value === user.role) return;
    dispatch(updateUserRole({ id: user._id, role: e.target.value }));
  };

  return (
    <select
      value={user.role}
      onChange={handleChange}
      disabled={roleLoading}
      className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-[#C9A24B] disabled:opacity-50 cursor-pointer"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </option>
      ))}
    </select>
  );
}
