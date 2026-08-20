import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthLogin } from "../../redux/slice/auth/loginAuthSlice";
import { useAuth } from "../../context/AuthContext";
import { required, validEmail, strongPassword, runValidators } from "../../utils/validators";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.login);
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateField = (name, value) => {
    if (name === "email") return runValidators(value, [required, validEmail]);
    if (name === "password") return runValidators(value, [required, strongPassword]);
  };

  const validate = () => {
    const newErrors = {
      email: runValidators(email, [required, validEmail]),
      password: runValidators(password, [required, strongPassword]),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await dispatch(AuthLogin(formData)).unwrap();
      login(result.user, result.token);
      const dashboards = {
        admin: "/admin/dashboard",
        manager: "/admin/dashboard",
        receptionist: "/receptionist/dashboard",
        housekeeping: "/housekeeping/dashboard",
      };
      navigate(dashboards[result.user.role] || "/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors ${
      errors[field] && touched[field]
        ? "border-red-400 focus:border-red-400"
        : "border-gray-300 focus:border-[#C9A24B]"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F2A] px-4">
      <div className="bg-white w-full max-w-md rounded-lg p-8">
        <h1 className="text-2xl font-serif text-[#0B1F2A] mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your LuxuryStay account</p>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
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
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1F2A] text-white py-2.5 rounded-md font-medium hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#C9A24B] font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
