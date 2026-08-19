import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../../components/admin/AdminLayout";
import InvoiceStats from "../../../components/admin/invoices/InvoiceStats";
import InvoiceTable from "../../../components/admin/invoices/InvoiceTable";
import InvoiceDetailModal from "../../../components/admin/invoices/InvoiceDetailModal";
import {
  fetchInvoices,
  fetchInvoiceById,
  clearSingleInvoice,
} from "../../../redux/slice/invoice/invoiceSlice";

export default function AdminInvoices() {
  const dispatch = useDispatch();
  const { invoices, loading, error, singleInvoice, singleLoading } =
    useSelector((s) => s.invoices);

  const [showDetail, setShowDetail] = useState(false);
  const [filter,     setFilter]     = useState("all");

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const openDetail = (id) => {
    dispatch(fetchInvoiceById(id));
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    dispatch(clearSingleInvoice());
  };

  const paidCount    = invoices.filter((i) => i.paymentStatus === "paid").length;
  const pendingCount = invoices.filter((i) => i.paymentStatus === "pending").length;

  return (
    <AdminLayout>
      <InvoiceStats
        total={invoices.length}
        paid={paidCount}
        unpaid={pendingCount}
        loading={loading}
      />

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        error={error}
        filter={filter}
        onFilterChange={setFilter}
        onViewDetail={openDetail}
      />

      {showDetail && (
        <InvoiceDetailModal
          invoice={singleLoading ? null : singleInvoice}
          onClose={closeDetail}
        />
      )}
    </AdminLayout>
  );
}
