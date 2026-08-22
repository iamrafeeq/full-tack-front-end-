import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleUser } from "../../redux/slice/auth/loginAuthSlice";
import { editProfile } from "../../redux/slice/auth/registerAuthSlice";
import { useAuth } from "../../context/AuthContext";
import { required, validName, validPhone, validNationality, validCNIC, validDateOfBirth, runValidators } from "../../utils/validators";

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useAuth();

  const { singleUser, singleUserLoading, singleUserError } = useSelector(
    (state) => state.login
  );
  const { updateLoading, updateError } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (authUser?._id) {
      dispatch(getSingleUser(authUser._id));
    }
  }, [dispatch, authUser?._id]);

  const profile = singleUser || authUser;

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const validateEditField = (fieldName, value) => {
    switch (fieldName) {
      case "name":                 return runValidators(value, [(v) => required(v, "full name"), validName]);
      case "phone":                return runValidators(value, [validPhone]);
      case "Nationality":          return runValidators(value, [validNationality]);
      case "Date_OF_Birth":        return validDateOfBirth(value);
      case "CNIC_Passport_Number": return runValidators(value, [validCNIC]);
      case "Address":              return required(value, "address");
      default:                     return undefined;
    }
  };

  const validateEditForm = () => {
    const errs = {
      name:                 validateEditField("name", formData.name),
      phone:                validateEditField("phone", formData.phone),
      Date_OF_Birth:        validDateOfBirth(formData.Date_OF_Birth),
      Nationality:          validateEditField("Nationality", formData.Nationality),
      CNIC_Passport_Number: validateEditField("CNIC_Passport_Number", formData.CNIC_Passport_Number),
      Address:              validateEditField("Address", formData.Address),
    };
    setEditErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleEditClick = () => {
    setEditErrors({});
    setSuccessMsg("");
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      Date_OF_Birth: profile?.Date_OF_Birth
        ? new Date(profile.Date_OF_Birth).toISOString().split("T")[0]
        : "",
      Nationality: profile?.Nationality || "",
      Address: profile?.Address || "",
      CNIC_Passport_Number: profile?.CNIC_Passport_Number || "",
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: validateEditField(name, value) }));
  };

  const handleSave = () => {
    if (!validateEditForm()) return;
    dispatch(editProfile({ userId: authUser._id, formData })).then((result) => {
      if (editProfile.fulfilled.match(result)) {
        dispatch(getSingleUser(authUser._id));
        setSuccessMsg("Profile updated successfully.");
        setIsEditing(false);
      }
    });
  };

  const editInputClass = (field) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors ${
      editErrors[field]
        ? "border-red-400 focus:border-red-400"
        : "border-gray-300 focus:border-[#C9A24B]"
    }`;

  const FieldError = ({ field }) =>
    editErrors[field] ? (
      <p className="text-red-500 text-xs mt-1">{editErrors[field]}</p>
    ) : null;

  if (singleUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (singleUserError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-sm">{singleUserError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-200">
          <div className="h-14 w-14 rounded-full bg-[#0B1F2A] text-white flex items-center justify-center text-lg font-medium">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-medium text-[#0B1F2A]">
              {isEditing ? formData.name || "—" : profile?.name || "—"}
            </h1>
            <p className="text-sm text-gray-500">{profile?.email || "—"}</p>
          </div>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full border border-[#C9A24B] text-[#C9A24B]">
            Verified
          </span>
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            {successMsg}
          </div>
        )}
        {updateError && isEditing && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {updateError}
          </div>
        )}

        {/* Account Details */}
        <div className="px-6 py-6">
          <h2 className="text-sm font-medium text-[#0B1F2A] mb-4">
            {isEditing ? "Edit Profile" : "Account Details"}
          </h2>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

            {/* Full Name */}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Full Name</dt>
              {isEditing ? (
                <>
                  <input name="name" value={formData.name} onChange={handleChange} className={editInputClass("name")} />
                  <FieldError field="name" />
                </>
              ) : (
                <dd className="text-sm text-[#0B1F2A]">{profile?.name || "—"}</dd>
              )}
            </div>

            {/* Email — always read-only */}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</dt>
              <dd className="text-sm text-[#0B1F2A]">{profile?.email || "—"}</dd>
            </div>

            {/* Phone */}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Phone Number</dt>
              {isEditing ? (
                <>
                  <input name="phone" value={formData.phone} onChange={handleChange} className={editInputClass("phone")} placeholder="+92 300 0000000" />
                  <FieldError field="phone" />
                </>
              ) : (
                <dd className="text-sm text-[#0B1F2A]">{profile?.phone || "—"}</dd>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Date of Birth</dt>
              {isEditing ? (
                <>
                  <input type="date" name="Date_OF_Birth" value={formData.Date_OF_Birth} onChange={handleChange} className={editInputClass("Date_OF_Birth")} />
                  <FieldError field="Date_OF_Birth" />
                </>
              ) : (
                <dd className="text-sm text-[#0B1F2A]">
                  {profile?.Date_OF_Birth ? new Date(profile.Date_OF_Birth).toLocaleDateString() : "—"}
                </dd>
              )}
            </div>

            {/* Nationality */}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Nationality</dt>
              {isEditing ? (
                <>
                  <input name="Nationality" value={formData.Nationality} onChange={handleChange} className={editInputClass("Nationality")} placeholder="e.g. Pakistani" />
                  <FieldError field="Nationality" />
                </>
              ) : (
                <dd className="text-sm text-[#0B1F2A]">{profile?.Nationality || "—"}</dd>
              )}
            </div>

            {/* CNIC */}
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">CNIC / Passport Number</dt>
              {isEditing ? (
                <>
                  <input name="CNIC_Passport_Number" value={formData.CNIC_Passport_Number} onChange={handleChange} className={editInputClass("CNIC_Passport_Number")} placeholder="42201-1234567-1" />
                  <FieldError field="CNIC_Passport_Number" />
                </>
              ) : (
                <dd className="text-sm text-[#0B1F2A]">{profile?.CNIC_Passport_Number || "—"}</dd>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-gray-500 mb-1">Address</dt>
              {isEditing ? (
                <>
                  <textarea name="Address" value={formData.Address} onChange={handleChange} rows={2} className={`${editInputClass("Address")} resize-none`} />
                  <FieldError field="Address" />
                </>
              ) : (
                <dd className="text-sm text-[#0B1F2A]">{profile?.Address || "—"}</dd>
              )}
            </div>

          </dl>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={updateLoading}
                className="bg-[#0B1F2A] text-white text-sm px-4 py-2.5 rounded-md font-medium hover:opacity-90 disabled:opacity-60"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="border border-gray-300 text-[#0B1F2A] text-sm px-4 py-2.5 rounded-md font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEditClick}
                className="bg-[#0B1F2A] text-white text-sm px-4 py-2.5 rounded-md font-medium hover:opacity-90"
              >
                Edit Profile
              </button>
              <button
                type="button"
                className="border border-gray-300 text-[#0B1F2A] text-sm px-4 py-2.5 rounded-md font-medium hover:bg-gray-50"
              >
                Change Password
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
