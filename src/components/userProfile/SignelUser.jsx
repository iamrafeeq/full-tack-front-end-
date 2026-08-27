import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleUser } from "../../redux/slice/auth/loginAuthSlice";
import { editProfile } from "../../redux/slice/auth/registerAuthSlice";
import { changePassword, clearChangePassword } from "../../redux/slice/auth/changePasswordSlice";
import { useAuth } from "../../context/AuthContext";
import {
  required, validName, validPhone, validNationality,
  validCNIC, validDateOfBirth, strongPassword, runValidators,
} from "../../utils/validators";
import Spinner from "../Spinner";
import { notifySuccess, notifyError } from "../../utils/toast";

const ROLE_LABELS = {
  user: "Guest", admin: "Admin", manager: "Manager",
  receptionist: "Receptionist", housekeeping: "Housekeeping",
};

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useAuth();

  const { singleUser, singleUserLoading, singleUserError } = useSelector((s) => s.login);
  const { updateLoading, updateError }                     = useSelector((s) => s.auth);
  const { loading: pwLoading, error: pwError, success: pwSuccess } = useSelector((s) => s.changePassword);

  // ── profile edit state ─────────────────────────────────────────────
  const [isEditing,  setIsEditing]  = useState(false);
  const [formData,   setFormData]   = useState({});
  const [editErrors, setEditErrors] = useState({});

  // ── change-password state ──────────────────────────────────────────
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwForm,  setPwForm]  = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwShow,  setPwShow]  = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [pwErrors, setPwErrors] = useState({});

  // ── effects ────────────────────────────────────────────────────────
  useEffect(() => { if (updateError) notifyError(updateError); }, [updateError]);
  useEffect(() => { if (pwError)     notifyError(pwError);     }, [pwError]);

  useEffect(() => {
    if (pwSuccess) {
      notifySuccess("Password changed successfully.");
      handleCancelPw();
      dispatch(clearChangePassword());
    }
  }, [pwSuccess, dispatch]);

  useEffect(() => {
    if (authUser?._id) dispatch(getSingleUser(authUser._id));
  }, [dispatch, authUser?._id]);

  const profile  = singleUser || authUser;
  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // ── profile-edit helpers ───────────────────────────────────────────
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
    setIsChangingPw(false);
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

  // ── change-password helpers ────────────────────────────────────────
  const validatePwField = (name, value) => {
    if (name === "currentPassword") return required(value, "current password");
    if (name === "newPassword")     return runValidators(value, [(v) => required(v, "new password"), strongPassword]);
    if (name === "confirmPassword") {
      if (!value) return "Please confirm your new password.";
      if (value !== pwForm.newPassword) return "Passwords do not match.";
    }
    return undefined;
  };

  const validateAllPw = () => {
    const errs = {
      currentPassword: validatePwField("currentPassword", pwForm.currentPassword),
      newPassword:     validatePwField("newPassword",     pwForm.newPassword),
      confirmPassword: validatePwField("confirmPassword", pwForm.confirmPassword),
    };
    setPwErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleChangePasswordClick = () => {
    setIsEditing(false);
    setPwErrors({});
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPwShow({ currentPassword: false, newPassword: false, confirmPassword: false });
    dispatch(clearChangePassword());
    setIsChangingPw(true);
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...pwForm, [name]: value };
    setPwForm(updated);
    setPwErrors((p) => ({ ...p, [name]: validatePwField(name, value) }));
    if (name === "newPassword" && pwErrors.confirmPassword !== undefined) {
      setPwErrors((p) => ({ ...p, confirmPassword: updated.confirmPassword !== value ? "Passwords do not match." : "" }));
    }
  };

  const handleCancelPw = () => {
    setIsChangingPw(false);
    setPwErrors({});
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    dispatch(clearChangePassword());
  };

  const handleSavePw = () => {
    if (!validateAllPw()) return;
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwErrors((p) => ({ ...p, newPassword: "New password must differ from current password." }));
      return;
    }
    dispatch(changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }));
  };

  // ── shared styles ──────────────────────────────────────────────────
  const inputCls = (field, errMap = editErrors) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none transition-colors ${
      errMap[field]
        ? "border-red-400 focus:border-red-400"
        : "border-gray-200 focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B]/30"
    }`;

  const Err = ({ msg }) =>
    msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;

  // ── full-page loading / error ──────────────────────────────────────
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

      {/* ── Dark header strip ── */}
      <div className="bg-[#0B1F2A] pt-[110px] pb-10 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C9A24B]/20 border-2 border-[#C9A24B]/40 text-[#C9A24B] flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-white truncate">{profile?.name || "—"}</h1>
            <p className="text-sm text-gray-400 truncate mt-0.5">{profile?.email || "—"}</p>
          </div>
          <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#C9A24B]/15 text-[#C9A24B] border border-[#C9A24B]/30">
            {ROLE_LABELS[profile?.role] || profile?.role || "Guest"}
          </span>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-5 pb-16 space-y-4">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {isEditing ? "Edit Profile" : "Profile Details"}
            </h2>
            {!isEditing && !isChangingPw && (
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
            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</p>
              {isEditing
                ? <><input name="name" value={formData.name} onChange={handleChange} className={inputCls("name")} /><Err msg={editErrors.name} /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.name || "—"}</p>}
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-[#0B1F2A] truncate">{profile?.email || "—"}</p>
            </div>

            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
              {isEditing
                ? <><input name="phone" value={formData.phone} onChange={handleChange} placeholder="+92 300 0000000" className={inputCls("phone")} /><Err msg={editErrors.phone} /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.phone || "—"}</p>}
            </div>

            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Date of Birth</p>
              {isEditing
                ? <><input type="date" name="Date_OF_Birth" value={formData.Date_OF_Birth} onChange={handleChange} className={inputCls("Date_OF_Birth")} /><Err msg={editErrors.Date_OF_Birth} /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">
                    {profile?.Date_OF_Birth
                      ? new Date(profile.Date_OF_Birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>}
            </div>

            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Nationality</p>
              {isEditing
                ? <><input name="Nationality" value={formData.Nationality} onChange={handleChange} placeholder="e.g. Pakistani" className={inputCls("Nationality")} /><Err msg={editErrors.Nationality} /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.Nationality || "—"}</p>}
            </div>

            <div className={isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">CNIC / Passport</p>
              {isEditing
                ? <><input name="CNIC_Passport_Number" value={formData.CNIC_Passport_Number} onChange={handleChange} placeholder="42201-1234567-1" className={inputCls("CNIC_Passport_Number")} /><Err msg={editErrors.CNIC_Passport_Number} /></>
                : <p className="text-sm font-medium text-[#0B1F2A]">{profile?.CNIC_Passport_Number || "—"}</p>}
            </div>

            <div className={`sm:col-span-2 ${isEditing ? "flex flex-col gap-1" : "bg-gray-50 rounded-xl px-4 py-3"}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Address</p>
              {isEditing
                ? <><textarea name="Address" value={formData.Address} onChange={handleChange} rows={2} className={`${inputCls("Address")} resize-none`} /><Err msg={editErrors.Address} /></>
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
                  disabled={isChangingPw}
                  className="flex-1 sm:flex-none bg-[#0B1F2A] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors active:scale-[.98] disabled:opacity-40"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleChangePasswordClick}
                  disabled={isChangingPw}
                  className="flex-1 sm:flex-none border border-gray-200 text-[#0B1F2A] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-[.98] disabled:opacity-40"
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Change Password card (visible when isChangingPw) ── */}
        {isChangingPw && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Change Password</h2>
            </div>

            <div className="px-5 sm:px-6 pb-5 space-y-4">

              {/* Current Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={pwShow.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    placeholder="Enter your current password"
                    className={`${inputCls("currentPassword", pwErrors)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((s) => ({ ...s, currentPassword: !s.currentPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B1F2A] transition-colors"
                  >
                    <EyeIcon open={pwShow.currentPassword} />
                  </button>
                </div>
                <Err msg={pwErrors.currentPassword} />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={pwShow.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    placeholder="Min 6 chars, letter + number + special"
                    className={`${inputCls("newPassword", pwErrors)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((s) => ({ ...s, newPassword: !s.newPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B1F2A] transition-colors"
                  >
                    <EyeIcon open={pwShow.newPassword} />
                  </button>
                </div>
                <Err msg={pwErrors.newPassword} />
                {pwForm.newPassword && !pwErrors.newPassword && (
                  <p className="text-[#0B1F2A]/40 text-xs mt-1">Must include a letter, a number, and a special character (!@#$_-).</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={pwShow.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    placeholder="Repeat your new password"
                    className={`${inputCls("confirmPassword", pwErrors)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((s) => ({ ...s, confirmPassword: !s.confirmPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B1F2A] transition-colors"
                  >
                    <EyeIcon open={pwShow.confirmPassword} />
                  </button>
                </div>
                <Err msg={pwErrors.confirmPassword} />
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-5 sm:px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleSavePw}
                disabled={pwLoading}
                className="inline-flex items-center gap-1.5 justify-center flex-1 sm:flex-none bg-[#0B1F2A] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors disabled:opacity-60 active:scale-[.98]"
              >
                {pwLoading ? <><Spinner size="sm" color="white" /> Updating…</> : "Update Password"}
              </button>
              <button
                onClick={handleCancelPw}
                disabled={pwLoading}
                className="flex-1 sm:flex-none border border-gray-200 text-[#0B1F2A] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors active:scale-[.98] disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
