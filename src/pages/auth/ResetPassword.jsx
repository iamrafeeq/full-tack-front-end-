import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearPasswordReset } from "../../redux/slice/auth/passwordResetSlice";
import { required, strongPassword, runValidators } from "../../utils/validators";

function ResetPassword() {
  const { token } = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { resetLoading, resetError, resetSuccess } = useSelector(
    (state) => state.passwordReset
  );

  const [form, setForm]     = useState({ newPassword: "", confirmPassword: "" });
  const [show, setShow]     = useState({ newPassword: false, confirmPassword: false });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    dispatch(clearPasswordReset());
  }, [dispatch]);

  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, navigate]);

  const validateField = (name, value, allValues = form) => {
    if (name === "newPassword") return runValidators(value, [required, strongPassword]);
    if (name === "confirmPassword") {
      if (!value) return "Please confirm your new password.";
      if (value !== allValues.newPassword) return "Passwords do not match.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, updated) }));
    }
    // Re-validate confirm if the user edits newPassword after touching confirm
    if (name === "newPassword" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", updated.confirmPassword, updated),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validate = () => {
    const newErrors = {
      newPassword:     validateField("newPassword",     form.newPassword),
      confirmPassword: validateField("confirmPassword", form.confirmPassword),
    };
    setErrors(newErrors);
    setTouched({ newPassword: true, confirmPassword: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(resetPassword({ token, newPassword: form.newPassword }));
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
          {resetSuccess ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A24B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[10px] tracking-[0.25em] text-[#C9A24B] uppercase mb-3">
                LuxuryStay Hospitality
              </p>
              <h2 className="text-2xl font-serif text-[#0B1F2A] mb-3">Password Reset</h2>
              <div className="w-10 h-px bg-[#C9A24B] mx-auto mb-5" />
              <p className="text-sm text-[#0B1F2A]/60 leading-relaxed mb-8">
                Your password has been updated successfully. You'll be redirected to
                Sign In in a moment.
              </p>
              <Link
                to="/login"
                className="block w-full bg-[#0B1F2A] text-[#FBF8F2] py-3.5 text-center text-[11px] tracking-[0.2em] uppercase border border-[#0B1F2A] hover:bg-[#0B1F2A]/90 hover:border-[#C9A24B] transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            /* ── Reset form ── */
            <>
              <div className="text-center mb-10">
                <p className="text-[10px] tracking-[0.25em] text-[#C9A24B] uppercase mb-3">
                  LuxuryStay Hospitality
                </p>
                <h1 className="text-3xl font-serif text-[#0B1F2A]">New Password</h1>
                <div className="w-10 h-px bg-[#C9A24B] mx-auto mt-4" />
                <p className="text-sm text-[#0B1F2A]/50 mt-4">
                  Choose a strong password for your account.
                </p>
              </div>

              {resetError && (
                <div className="mb-8 pl-4 py-3 border-l-2 border-[#8B3A3A] bg-[#8B3A3A]/5 text-sm text-[#8B3A3A]">
                  <p>{resetError}</p>
                  <Link
                    to="/forgot-password"
                    className="mt-2 inline-block text-xs text-[#8B3A3A] underline hover:text-[#0B1F2A]"
                  >
                    Request a new reset link
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div>
                  <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={show.newPassword ? "text" : "password"}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("newPassword")}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, newPassword: !s.newPassword }))}
                      className="absolute right-0 top-2.5 text-[10px] tracking-[0.15em] uppercase text-[#C9A24B] hover:text-[#0B1F2A] pr-3"
                    >
                      {show.newPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {touched.newPassword && errors.newPassword && (
                    <p className="text-[#8B3A3A] text-xs mt-1.5">{errors.newPassword}</p>
                  )}
                  {form.newPassword && !errors.newPassword && (
                    <p className="text-[#0B1F2A]/40 text-xs mt-1.5">
                      Must include a letter, a number, and a special character (!@#$_-).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={show.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass("confirmPassword")}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, confirmPassword: !s.confirmPassword }))}
                      className="absolute right-0 top-2.5 text-[10px] tracking-[0.15em] uppercase text-[#C9A24B] hover:text-[#0B1F2A] pr-3"
                    >
                      {show.confirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-[#8B3A3A] text-xs mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#0B1F2A] text-[#FBF8F2] py-3.5 mt-2 text-[11px] tracking-[0.2em] uppercase border border-[#0B1F2A] hover:bg-[#0B1F2A]/90 hover:border-[#C9A24B] transition-colors disabled:opacity-50"
                >
                  {resetLoading ? "Updating..." : "Reset Password"}
                </button>
              </form>

              <p className="text-center text-sm text-[#0B1F2A]/50 mt-8">
                <Link to="/login" className="text-[#C9A24B] font-medium hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
