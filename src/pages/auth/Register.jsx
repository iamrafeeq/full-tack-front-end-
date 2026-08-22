import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthRegister } from "../../redux/slice/auth/registerAuthSlice";
import {
  required,
  validName,
  validEmail,
  strongPassword,
  matchPassword,
  validPhone,
  validNationality,
  validCNIC,
  validDateOfBirth,
  runValidators,
} from "../../utils/validators";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    Date_OF_Birth: "",
    Nationality: "",
    Address: "",
    CNIC_Passport_Number: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { name, email, password, phone, Date_OF_Birth, Nationality, Address, CNIC_Passport_Number } = formData;

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "name":         return runValidators(value, [(v) => required(v, "full name"), validName]);
      case "email":        return runValidators(value, [(v) => required(v, "email address"), validEmail]);
      case "password":     return runValidators(value, [(v) => required(v, "password"), strongPassword]);
      case "confirmPassword": return matchPassword(formData.password, value) || (value ? undefined : "Please confirm your password.");
      case "phone":        return runValidators(value, [(v) => required(v, "phone number"), validPhone]);
      case "Date_OF_Birth": return validDateOfBirth(value);
      case "Nationality":  return runValidators(value, [(v) => required(v, "nationality"), validNationality]);
      case "Address":      return required(value, "address");
      case "CNIC_Passport_Number": return runValidators(value, [(v) => required(v, "CNIC or Passport number"), validCNIC]);
      default:             return undefined;
    }
  };

  const handleChange = (e) => {
    const { name: fieldName, value } = e.target;
    if (fieldName === "confirmPassword") {
      setConfirmPassword(value);
      if (touched.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: matchPassword(formData.password, value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
      if (touched[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, value) }));
      }
      // re-validate confirm password if password changes
      if (fieldName === "password" && touched.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: matchPassword(value, confirmPassword) }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name: fieldName, value } = e.target;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, value) }));
  };

  const validate = () => {
    const allFields = {
      name:                 validateField("name", name),
      email:                validateField("email", email),
      password:             validateField("password", password),
      confirmPassword:      matchPassword(password, confirmPassword) || (confirmPassword ? undefined : "Please confirm your password."),
      phone:                validateField("phone", phone),
      Date_OF_Birth:        validDateOfBirth(Date_OF_Birth),
      Nationality:          validateField("Nationality", Nationality),
      Address:              validateField("Address", Address),
      CNIC_Passport_Number: validateField("CNIC_Passport_Number", CNIC_Passport_Number),
    };
    setErrors(allFields);
    const allKeys = Object.keys(allFields).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allKeys);
    return !Object.values(allFields).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(AuthRegister(formData)).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors ${
      errors[field] && touched[field]
        ? "border-red-400 focus:border-red-400"
        : "border-gray-300 focus:border-[#C9A24B]"
    }`;

  const FieldError = ({ field }) =>
    touched[field] && errors[field] ? (
      <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    ) : null;

  return (
 <div className="min-h-screen flex items-center justify-center bg-[#0B1F2A] px-4 py-[120px] relative">
  {/* subtle vignette */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,162,75,0.08),transparent_60%)]" />

  <div className="relative w-full max-w-lg">
    {/* seal */}
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0B1F2A] border-2 border-[#C9A24B] flex items-center justify-center z-10">
      <span className="font-serif text-[#C9A24B] text-sm tracking-wider">LS</span>
    </div>

    <div className="bg-[#FBF8F2] border border-[#C9A24B]/30 shadow-2xl px-8 py-12 sm:px-12">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.25em] text-[#C9A24B] uppercase mb-3">
          LuxuryStay Hospitality
        </p>
        <h1 className="text-3xl font-serif text-[#0B1F2A]">Guest Registration</h1>
        <div className="w-10 h-px bg-[#C9A24B] mx-auto mt-4" />
      </div>

      {error && (
        <div className="mb-8 pl-4 py-3 border-l-2 border-[#8B3A3A] bg-[#8B3A3A]/5 text-sm text-[#8B3A3A]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        {/* Section 01 — Guest Details */}
        <div className="space-y-5">
          <p className="text-[11px] tracking-[0.2em] text-[#0B1F2A]/50 uppercase">
            01 &middot; Guest Details
          </p>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("name")}
              placeholder="John Doe"
            />
            <FieldError field="name" />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("email")}
              placeholder="you@example.com"
            />
            <FieldError field="email" />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("phone")}
              placeholder="+92 300 0000000"
            />
            <FieldError field="phone" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="Date_OF_Birth"
                value={Date_OF_Birth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass("Date_OF_Birth")}
              />
              <FieldError field="Date_OF_Birth" />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
                Nationality
              </label>
              <input
                type="text"
                name="Nationality"
                value={Nationality}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass("Nationality")}
                placeholder="Pakistani"
              />
              <FieldError field="Nationality" />
            </div>
          </div>
        </div>

        {/* Section 02 — Identification */}
        <div className="space-y-5 pt-8 border-t border-[#C9A24B]/25">
          <p className="text-[11px] tracking-[0.2em] text-[#0B1F2A]/50 uppercase">
            02 &middot; Identification
          </p>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              Address
            </label>
            <input
              type="text"
              name="Address"
              value={Address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("Address")}
              placeholder="123 Main Street, City"
            />
            <FieldError field="Address" />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              CNIC / Passport Number
            </label>
            <input
              type="text"
              name="CNIC_Passport_Number"
              value={CNIC_Passport_Number}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("CNIC_Passport_Number")}
              placeholder="42201-1234567-1"
            />
            <FieldError field="CNIC_Passport_Number" />
          </div>
        </div>

        {/* Section 03 — Security */}
        <div className="space-y-5 pt-8 border-t border-[#C9A24B]/25">
          <p className="text-[11px] tracking-[0.2em] text-[#0B1F2A]/50 uppercase">
            03 &middot; Security
          </p>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass("password")}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2.5 text-[10px] tracking-[0.15em] uppercase text-[#C9A24B] hover:text-[#0B1F2A]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError field="password" />
            {!errors.password && password && (
              <p className="text-[#0B1F2A]/40 text-xs mt-1.5">
                Must include a letter, a number, and a special character (!@#$_-).
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("confirmPassword")}
              placeholder="••••••••"
            />
            <FieldError field="confirmPassword" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1F2A] text-[#FBF8F2] py-3.5 mt-2 text-[11px] tracking-[0.2em] uppercase border border-[#0B1F2A] hover:bg-[#0B1F2A]/90 hover:border-[#C9A24B] transition-colors disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-center text-sm text-[#0B1F2A]/50 mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-[#C9A24B] font-medium hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  </div>
</div>
  );
}

export default Register;
