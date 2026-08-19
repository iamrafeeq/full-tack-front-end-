import { useDispatch, useSelector } from "react-redux";
import { updateUserStatus } from "../../../redux/slice/adminSlice/guestUser";

export default function StatusToggle({ user }) {
  const dispatch = useDispatch();
  const { statusLoading } = useSelector((state) => state.guestUser);

  const handleToggle = () => {
    dispatch(updateUserStatus({ id: user._id, isActive: !user.isActive }));
  };

  return (
    <button
      onClick={handleToggle}
      disabled={statusLoading}
      title={user.isActive ? "Deactivate user" : "Activate user"}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        user.isActive ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
          user.isActive ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
