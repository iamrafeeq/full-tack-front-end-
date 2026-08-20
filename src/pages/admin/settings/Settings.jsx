import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  fetchSettings,
  updateSettings,
  clearUpdateStatus,
} from "../../../redux/slice/settings/settingsSlice";

export default function Settings() {
  const dispatch = useDispatch();
  const { data, loading, error, updateLoading, updateError, updateSuccess } =
    useSelector((s) => s.settings);

  const [form, setForm] = useState({
    taxPercentage:      "",
    cancellationPolicy: "",
    checkInTime:        "",
    checkOutTime:       "",
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Populate form when settings load
  useEffect(() => {
    if (data) {
      setForm({
        taxPercentage:      data.taxPercentage      ?? "",
        cancellationPolicy: data.cancellationPolicy ?? "",
        checkInTime:        data.checkInTime        ?? "",
        checkOutTime:       data.checkOutTime       ?? "",
      });
    }
  }, [data]);

  // Auto-clear success banner after 3 s
  useEffect(() => {
    if (!updateSuccess) return;
    const id = setTimeout(() => dispatch(clearUpdateStatus()), 3000);
    return () => clearTimeout(id);
  }, [updateSuccess, dispatch]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateSettings({
        taxPercentage:      Number(form.taxPercentage),
        cancellationPolicy: form.cancellationPolicy,
        checkInTime:        form.checkInTime,
        checkOutTime:       form.checkOutTime,
      })
    );
  };

  return (
    <AdminLayout>
      {/* Loading skeleton */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Fetch error */}
      {!loading && error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      {!loading && !error && (
        <div className="max-w-xl">
          {updateSuccess && (
            <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Settings saved successfully.
            </div>
          )}
          {updateError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {updateError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tax Percentage */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">
                Tax Percentage (%)
              </label>
              <input
                type="number"
                name="taxPercentage"
                value={form.taxPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#C9A24B] focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Applied automatically to invoices at checkout.
              </p>
            </div>

            {/* Check-in / Check-out times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">
                  Check-in Time
                </label>
                <input
                  type="text"
                  name="checkInTime"
                  value={form.checkInTime}
                  onChange={handleChange}
                  placeholder="14:00"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#C9A24B] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">
                  Check-out Time
                </label>
                <input
                  type="text"
                  name="checkOutTime"
                  value={form.checkOutTime}
                  onChange={handleChange}
                  placeholder="11:00"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#C9A24B] focus:outline-none"
                />
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1.5">
                Cancellation Policy
              </label>
              <textarea
                name="cancellationPolicy"
                value={form.cancellationPolicy}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#C9A24B] focus:outline-none resize-none"
                placeholder="Describe the hotel's cancellation policy…"
              />
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="px-6 py-2.5 rounded-lg bg-[#0B1F2A] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {updateLoading ? "Saving…" : "Save Settings"}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
