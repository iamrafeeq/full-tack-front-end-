export const fmt = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

export const STATUS_COLORS = {
  paid:    "bg-green-100 text-green-700",
  pending: "bg-orange-100 text-orange-700",
  unpaid:  "bg-yellow-100 text-yellow-700",
};

export const downloadInvoicePdf = async (invoiceId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://localhost:5000/api/invoices/${invoiceId}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error("PDF download failed");
  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${invoiceId.slice(-6).toUpperCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
