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
      case "name":         return runValidators(value, [required, validName]);
      case "email":        return runValidators(value, [required, validEmail]);
      case "password":     return runValidators(value, [required, strongPassword]);
      case "confirmPassword": return matchPassword(formData.password, value) || (value ? undefined : "Please confirm your password.");
      case "phone":        return runValidators(value, [required, validPhone]);
      case "Date_OF_Birth": return validDateOfBirth(value);
      case "Nationality":  return runValidators(value, [required, validNationality]);
      case "Address":      return required(value, "Address");
      case "CNIC_Passport_Number": return runValidators(value, [required, validCNIC]);
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
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F2A] px-4 py-10">
      <div className="bg-white w-full max-w-md rounded-lg p-8">
        <h1 className="text-2xl font-serif text-[#0B1F2A] mb-1">Create Account</h1>
        <p className="text-sm text-gray-500 mb-6">Join LuxuryStay Hospitality</p>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Full Name</label>
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

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Email</label>
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

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Phone Number</label>
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

          {/* Date of Birth */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Date of Birth</label>
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

          {/* Nationality */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Nationality</label>
            <input
              type="text"
              name="Nationality"
              value={Nationality}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("Nationality")}
              placeholder="e.g. Pakistani"
            />
            <FieldError field="Nationality" />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Address</label>
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

          {/* CNIC / Passport */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">CNIC / Passport Number</label>
            <input
              type="text"
              name="CNIC_Passport_Number"
              value={CNIC_Passport_Number}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("CNIC_Passport_Number")}
              placeholder="e.g. 42201-1234567-1"
            />
            <FieldError field="CNIC_Passport_Number" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Password</label>
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
                className="absolute right-3 top-2 text-xs text-gray-500 hover:text-[#C9A24B]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError field="password" />
            {!errors.password && password && (
              <p className="text-gray-400 text-xs mt-1">
                Must include a letter, a number, and a special character (!@#$_-).
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-1 text-[#0B1F2A]">Confirm Password</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1F2A] text-white py-2.5 rounded-md font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#C9A24B] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
