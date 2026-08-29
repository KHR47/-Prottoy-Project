"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { Receipt, CheckCircle, Clock, CreditCard, X, Smartphone, Building } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const invoicesData = [
  { id: "INV-2026-03", period: "March 2026", amount: 1450, dueDate: "2026-04-15", status: "unpaid" },
  { id: "INV-2026-02", period: "February 2026", amount: 840, dueDate: "2026-03-15", status: "paid" },
  { id: "INV-2026-01", period: "January 2026", amount: 810, dueDate: "2026-02-15", status: "paid" },
  { id: "INV-2025-12", period: "December 2025", amount: 790, dueDate: "2026-01-15", status: "paid" },
];

export default function MyBillsPage() {
  const { isReady } = useRequireRole(["citizen"]);
  const [invoices, setInvoices] = useState(invoicesData);

  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("bkash");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayClick = (id: string) => {
    setPayingInvoiceId(id);
    setPaymentMethod("bkash"); // Reset to default
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setInvoices(invoices.map(inv => inv.id === payingInvoiceId ? { ...inv, status: "paid" } : inv));
      setIsProcessing(false);
      setPayingInvoiceId(null);
      toast.success("Payment completed successfully!");
    }, 1500);
  };

  const payingInvoice = invoices.find(inv => inv.id === payingInvoiceId);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-bold uppercase text-emerald-700">Water Services</p>
          <h1 className="text-3xl font-black text-slate-950">My Bills & Invoices</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            View your billing history, download invoices, and securely pay your outstanding water bills.
          </p>
        </div>

        {/* Current Due Summary */}
        {invoices.filter(i => i.status === "unpaid").length > 0 ? (
          <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                <Receipt className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Total Outstanding Balance</p>
                <h2 className="text-3xl font-black">
                  ৳{invoices.filter(i => i.status === "unpaid").reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                </h2>
              </div>
            </div>
            <button 
              onClick={() => handlePayClick(invoices.find(i => i.status === "unpaid")?.id || "")}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-400"
            >
              <CreditCard className="h-5 w-5" />
              Pay Total Balance
            </button>
          </div>
        ) : (
           <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-900">All Caught Up!</h2>
              <p className="text-emerald-700 mt-1">You have no outstanding water bills.</p>
            </div>
          </div>
        )}

        {/* Invoices List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Billing History</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">{invoice.period}</h3>
                    {invoice.status === "paid" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold uppercase">
                        <CheckCircle className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">
                        <Clock className="h-3 w-3" /> Due {invoice.dueDate}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-mono">Invoice #{invoice.id}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-slate-900">৳{invoice.amount.toLocaleString()}</span>
                  
                  {invoice.status === "unpaid" ? (
                    <button
                      onClick={() => handlePayClick(invoice.id)}
                      className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition shadow-sm"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <button className="shrink-0 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-sm transition shadow-sm">
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {payingInvoiceId && payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-black text-slate-900">Checkout</h2>
              <button onClick={() => setPayingInvoiceId(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-sm text-slate-500 font-bold mb-1">Paying Invoice</p>
                <div className="flex justify-between items-end">
                  <p className="text-lg font-black text-slate-900">{payingInvoice.id}</p>
                  <p className="text-2xl font-black text-emerald-600">৳{payingInvoice.amount.toLocaleString()}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Mobile Banking</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* bKash */}
                <button 
                  onClick={() => setPaymentMethod("bkash")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition ${paymentMethod === "bkash" ? "border-[#e2136e] bg-pink-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="h-8 w-8 rounded-full bg-[#e2136e] flex items-center justify-center text-white"><Smartphone className="h-4 w-4" /></div>
                  <span className="text-xs font-bold text-slate-700">bKash</span>
                </button>
                {/* Nagad */}
                <button 
                  onClick={() => setPaymentMethod("nagad")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition ${paymentMethod === "nagad" ? "border-[#f7941d] bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="h-8 w-8 rounded-full bg-[#f7941d] flex items-center justify-center text-white"><Smartphone className="h-4 w-4" /></div>
                  <span className="text-xs font-bold text-slate-700">Nagad</span>
                </button>
                {/* Rocket */}
                <button 
                  onClick={() => setPaymentMethod("rocket")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition ${paymentMethod === "rocket" ? "border-[#8c1562] bg-fuchsia-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="h-8 w-8 rounded-full bg-[#8c1562] flex items-center justify-center text-white"><Smartphone className="h-4 w-4" /></div>
                  <span className="text-xs font-bold text-slate-700">Rocket</span>
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Card & Bank</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === "card" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <CreditCard className={`h-6 w-6 ${paymentMethod === "card" ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-sm font-bold text-slate-700">Credit/Debit Card</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod("bank")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === "bank" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <Building className={`h-6 w-6 ${paymentMethod === "bank" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="text-sm font-bold text-slate-700">Net Banking</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 bg-slate-50">
              <button
                onClick={processPayment}
                disabled={isProcessing}
                className="w-full flex justify-center items-center rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing Payment..." : `Pay ৳${payingInvoice.amount.toLocaleString()} via ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`}
              </button>
              <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" /> Secure Payment Gateway
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
