import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, deleteMessage, clearDeleteError } from "../../../redux/slice/contactUs/contactusSlice";
import { notifySuccess, notifyError } from "../../../utils/toast";
import AdminLayout from "../../../components/admin/AdminLayout";
import Spinner from "../../../components/Spinner";

export default function AdminMessages() {
  const dispatch = useDispatch();
  const { messages, count, fetchLoading, fetchError, deleteLoading, deleteError } =
    useSelector((s) => s.contact);

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  useEffect(() => { if (fetchError) notifyError(fetchError); }, [fetchError]);

  useEffect(() => {
    if (!deleteError) return;
    notifyError(deleteError);
    const t = setTimeout(() => dispatch(clearDeleteError()), 4000);
    return () => clearTimeout(t);
  }, [deleteError, dispatch]);

  return (
    <AdminLayout title="Contact Messages">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-[#0B1F2A]">Contact Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {fetchLoading ? "Loading…" : `${count} message${count !== 1 ? "s" : ""} received`}
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchMessages())}
            disabled={fetchLoading}
            className="inline-flex items-center gap-1.5 justify-center px-4 py-2 rounded-lg bg-[#0B1F2A] text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {fetchLoading ? <><Spinner size="sm" color="white" /> Refresh</> : <><span>↻</span> Refresh</>}
          </button>
        </div>

        {/* Loading skeleton */}
        {fetchLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!fetchLoading && messages.length === 0 && !fetchError && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <span className="text-5xl mb-4">✉️</span>
            <p className="text-lg font-medium text-gray-500">No messages yet</p>
            <p className="text-sm mt-1">Contact form submissions will appear here.</p>
          </div>
        )}

        {/* Message cards */}
        {!fetchLoading && messages.map((msg) => (
          <div
            key={msg._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-start"
          >
            {/* Avatar */}
            <div className="w-11 h-11 shrink-0 rounded-full bg-[#0B1F2A]/10 text-[#0B1F2A] flex items-center justify-center text-sm font-semibold uppercase">
              {msg.name?.charAt(0) || "?"}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium text-[#0B1F2A]">{msg.name}</span>
                <span className="text-xs text-gray-400">{msg.email}</span>
                {msg.phone && (
                  <span className="text-xs text-gray-400">{msg.phone}</span>
                )}
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>

              {msg.subject && (
                <p className="mt-1 text-sm font-medium text-[#C9A24B]">{msg.subject}</p>
              )}
              <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={() => dispatch(deleteMessage(msg._id)).then((r) => { if (!r.error) notifySuccess("Message deleted."); })}
              disabled={deleteLoading === msg._id}
              className="shrink-0 self-start px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading === msg._id ? "Deleting…" : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
