import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleUser } from "../../redux/slice/auth/loginAuthSlice";
import { editProfile } from "../../redux/slice/auth/registerAuthSlice";
import { useAuth } from "../../context/AuthContext";
import {
  required, validName, validPhone, validNationality,
  validCNIC, validDateOfBirth, runValidators,
} from "../../utils/validators";
import Spinner from "../Spinner";
import { notifySuccess, notifyError } from "../../utils/toast";

const ROLE_LABELS = {
  user: "Guest", admin: "Admin", manager: "Manager",
  receptionist: "Receptionist", housekeeping: "Housekeeping",
};

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useAuth();

  const { singleUser, singleUserLoading, singleUserError } = useSelector((s) => s.login);
  const { updateLoading, updateError } = useSelector((s) => s.auth);

  const [isEditing,  setIsEditing]  = useState(false);
  const [formData,   setFormData]   = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => { if (updateError) notifyError(updateError); }, [updateError]);

  useEffect(() => {
    if (authUser?._id) dispatch(getSingleUser(authUser._id));
  }, [dispatch, authUser?._id]);

  const profile  = singleUser || authUser;
  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const validateField = (name, value) => {
    switch (name) {
      case "name":                 return runValidators(value, [(v) => required(v, "full name"), validName]);
      case "phone":                return runValidators(value, [validPhone]);
      case "Nationality":          return runValidators(value, [validNationality]);
      case "Date_OF_Birth":        return validDateOfBirth(value);
      case "CNIC_Passport_Number": return runValidators(value, [validCNIC]);
      case "Address":              return required(value, "address");
      default:                     return undefined;
    }
  };

  const validateAll = () => {
    const errs = Object.fromEntries(
      ["name","phone","Date_OF_Birth","Nationality","CNIC_Passport_Number","Address"]
        .map((k) => [k, validateField(k, formData[k])])
    );
    setEditErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleEditClick = () => {
    setEditErrors({});
    setFormData({
      name:                 profile?.name || "",
      phone:                profile?.phone || "",
      Date_OF_Birth:        profile?.Date_OF_Birth ? new Date(profile.Date_OF_Birth).toISOString().split("T")[0] : "",
      Nationality:          profile?.Nationality || "",
      Address:              profile?.Address || "",
      CNIC_Passport_Number: profile?.CNIC_Passport_Number || "",
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setEditErrors((p) => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleSave = () => {
    if (!validateAll()) return;
    dispatch(editProfile({ userId: authUser._id, formData })).then((res) => {
      if (editProfile.fulfilled.match(res)) {
        dispatch(getSingleUser(authUser._id));
        notifySuccess("Profile updated successfully.");
        setIsEditing(false);
      }
    });
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none transition-colors ${
      editErrors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-gray-200 focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B]/30"
    }`;

  const Err = ({ f }) =>
    editErrors[f] ? <p className="text-red-500 text-xs mt-1">{editErrors[f]}</p> : null;

  /* ── loading / error ── */
  if (singleUserLoading) return (
    <div className="min-h-screen bg-[#F4F3EF] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (singleUserError) return (
    <div className="min-h-screen bg-[#F4F3EF] flex items-center justify-center">
      <p className="text-red-500 text-sm">{singleUserError}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F3EF]">

      {/* ── Dark header strip (sits right below the fixed navbar) ── */}
      <div className="bg-[#0B1F2A] pt-[110px] pb-10 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C9A24B]/20 border-2 border-[#C9A24B]/40 text-[#C9A24B] flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0">
            {initials}
          </div>
          {/* Name / email */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">
              {profile?.name || "—"}
            </h1>
            <p className="text-sm text-gray-400 truncate mt-0.5">{profile?.email || "—"}</p>
          </div>
          {/* Role badge */}
          <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#C9A24B]/15 text-[#C9A24B] border border-[#C9A24B]/30">
            {ROLE_LABELS[profile?.role] || profile?.role || "Guest"}
          </span>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-5 pb-16">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">

          {/* Section title */}
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {isEditing ? "Edit Profile" : "Profile Details"}
            </h2>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-[#0B1F2A] hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {/* Fields grid */}
          <div className="px-5 sm:px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Full Name */}
            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
              {isEditing
                ? <><input name="name" value={formData.name} onChange={handleChange} className={inputCls("name")} /><Err f="name" /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.name || "—"}</p>}
            </div>

            {/* Email — read-only always */}
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-[#0B1F2A] truncate">{profile?.email || "—"}</p>
            </div>

            {/* Phone */}
            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
              {isEditing
                ? <><input name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 0000000" className={inputCls("phone")} /><Err f="phone" /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.phone || "—"}</p>}
            </div>

            {/* Date of Birth */}
            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date of Birth</p>
              {isEditing
                ? <><input type="date" name="Date_OF_Birth" value={formData.Date_OF_Birth} onChange={handleChange} className={inputCls("Date_OF_Birth")} /><Err f="Date_OF_Birth" /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">
                    {profile?.Date_OF_Birth
                      ? new Date(profile.Date_OF_Birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>}
            </div>

            {/* Nationality */}
            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nationality</p>
              {isEditing
                ? <><input name="Nationality" value={formData.Nationality} onChange={handleChange} placeholder="e.g. Pakistani" className={inputCls("Nationality")} /><Err f="Nationality" /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.Nationality || "—"}</p>}
            </div>

            {/* CNIC */}
            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">CNIC / Passport</p>
              {isEditing
                ? <><input name="CNIC_Passport_Number" value={formData.CNIC_Passport_Number} onChange={handleChange} placeholder="42201-1234567-1" className={inputCls("CNIC_Passport_Number")} /><Err f="CNIC_Passport_Number" /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.CNIC_Passport_Number || "—"}</p>}
            </div>

            {/* Address — full width */}
            <div className={`sm:col-span-2 ${isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Address</p>
              {isEditing
                ? <><textarea name="Address" value={formData.Address} onChange={handleChange} rows={2} className={`${inputCls("Address")} resize-none`} /><Err f="Address" /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.Address || "—"}</p>}
            </div>

          </div>

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-5 sm:px-6 py-4 border-t border-gray-100">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updateLoading}
                  className="inline-flex items-center gap-1.5 justify-center flex-1 sm:flex-none bg-[#0B1F2A] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors disabled:opacity-60 active:scale-[.98]"
                >
                  {updateLoading ? <><Spinner size="sm" color="white" /> Saving…</> : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 sm:flex-none border border-gray-200 text-[#0B1F2A] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-[.98]"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="flex-1 sm:flex-none bg-[#0B1F2A] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors active:scale-[.98]"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  className="flex-1 sm:flex-none border border-gray-200 text-[#0B1F2A] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-[.98]"
                >
                  Change Password
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
