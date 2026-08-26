import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthLogin } from "../../redux/slice/auth/loginAuthSlice";
import { useAuth } from "../../context/AuthContext";
import { required, validEmail, strongPassword, runValidators } from "../../utils/validators";
import { notifyError } from "../../utils/toast";
import Spinner from "../../components/Spinner";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.login);
  const { login } = useAuth();

  useEffect(() => { if (error) notifyError(error); }, [error]);

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
 <div className="min-h-screen flex items-center justify-center bg-[#0B1F2A] px-4 py-[120px] relative">
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,162,75,0.08),transparent_60%)]" />

  <div className="relative w-full max-w-md">
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0B1F2A] border-2 border-[#C9A24B] flex items-center justify-center z-10">
      <span className="font-serif text-[#C9A24B] text-sm tracking-wider">LS</span>
    </div>

    <div className="bg-[#FBF8F2] border border-[#C9A24B]/30 shadow-2xl px-8 py-12 sm:px-12">
      <div className="text-center mb-10">
        <p className="text-[10px] tracking-[0.25em] text-[#C9A24B] uppercase mb-3">
          LuxuryStay Hospitality
        </p>
        <h1 className="text-3xl font-serif text-[#0B1F2A]">Welcome Back</h1>
        <div className="w-10 h-px bg-[#C9A24B] mx-auto mt-4" />
        <p className="text-sm text-[#0B1F2A]/50 mt-4">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
          {touched.email && errors.email && (
            <p className="text-[#8B3A3A] text-xs mt-1.5">{errors.email}</p>
          )}
        </div>

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
          {touched.password && errors.password && (
            <p className="text-[#8B3A3A] text-xs mt-1.5">{errors.password}</p>
          )}
          <div className="flex justify-end mt-1">
            <Link
              to="/forgot-password"
              className="text-[11px] tracking-wide text-[#C9A24B] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#0B1F2A] text-[#FBF8F2] py-3.5 mt-2 text-[11px] tracking-[0.2em] uppercase border border-[#0B1F2A] hover:bg-[#0B1F2A]/90 hover:border-[#C9A24B] transition-colors disabled:opacity-50"
        >
          {loading ? <><Spinner size="sm" color="white" /> Signing in…</> : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-[#0B1F2A]/50 mt-8">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#C9A24B] font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  </div>
</div>
  );
}

export default Login;
