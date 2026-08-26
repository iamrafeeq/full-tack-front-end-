import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearPasswordReset } from "../../redux/slice/auth/passwordResetSlice";
import { required, validEmail, runValidators } from "../../utils/validators";
import { notifyError } from "../../utils/toast";
import Spinner from "../../components/Spinner";

function ForgotPassword() {
  const dispatch = useDispatch();
  const { forgotLoading, forgotError, forgotSuccess } = useSelector(
    (state) => state.passwordReset
  );

  const [email, setEmail]     = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    dispatch(clearPasswordReset());
  }, [dispatch]);

  useEffect(() => { if (forgotError) notifyError(forgotError); }, [forgotError]);

  const validate = (val) => runValidators(val, [required, validEmail]);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) setEmailError(validate(e.target.value));
  };

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validate(email));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(email);
    setEmailError(err);
    if (err) return;
    dispatch(forgotPassword({ email }));
  };

  const inputClass = `w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors ${
    emailError && touched
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
          {forgotSuccess ? (
            /* ── Confirmation state ── */
            <div className="text-center">
              <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A24B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[10px] tracking-[0.25em] text-[#C9A24B] uppercase mb-3">
                LuxuryStay Hospitality
              </p>
              <h2 className="text-2xl font-serif text-[#0B1F2A] mb-3">Check Your Email</h2>
              <div className="w-10 h-px bg-[#C9A24B] mx-auto mb-5" />
              <p className="text-sm text-[#0B1F2A]/60 leading-relaxed mb-6">
                If that email exists, a reset link has been sent. Please check your inbox
                and follow the link to reset your password.
              </p>
              <p className="text-xs text-[#0B1F2A]/40 mb-8">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => dispatch(clearPasswordReset())}
                className="w-full bg-[#0B1F2A] text-[#FBF8F2] py-3 text-[11px] tracking-[0.2em] uppercase border border-[#0B1F2A] hover:bg-[#0B1F2A]/90 hover:border-[#C9A24B] transition-colors"
              >
                Try a different email
              </button>
              <p className="text-center text-sm text-[#0B1F2A]/50 mt-6">
                <Link to="/login" className="text-[#C9A24B] font-medium hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <div className="text-center mb-10">
                <p className="text-[10px] tracking-[0.25em] text-[#C9A24B] uppercase mb-3">
                  LuxuryStay Hospitality
                </p>
                <h1 className="text-3xl font-serif text-[#0B1F2A]">Forgot Password</h1>
                <div className="w-10 h-px bg-[#C9A24B] mx-auto mt-4" />
                <p className="text-sm text-[#0B1F2A]/50 mt-4">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div>
                  <label className="block text-[11px] tracking-[0.1em] uppercase text-[#0B1F2A]/60 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                  {touched && emailError && (
                    <p className="text-[#8B3A3A] text-xs mt-1.5">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0B1F2A] text-[#FBF8F2] py-3.5 mt-2 text-[11px] tracking-[0.2em] uppercase border border-[#0B1F2A] hover:bg-[#0B1F2A]/90 hover:border-[#C9A24B] transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? <><Spinner size="sm" color="white" /> Sending…</> : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-[#0B1F2A]/50 mt-8">
                Remember your password?{" "}
                <Link to="/login" className="text-[#C9A24B] font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
