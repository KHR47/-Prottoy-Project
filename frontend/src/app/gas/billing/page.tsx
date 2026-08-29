"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { CreditCard, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Smartphone, Building2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import toast from "react-hot-toast";

export default function MyGasBillsPage() {
  const { isReady } = useRequireRole(["citizen"]);
  const [loading, setLoading] = useState(true);
  const [meter, setMeter] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [paymentTab, setPaymentTab] = useState("mobile"); 

  useEffect(() => {
    if (isReady) {
      const user = getUser();
      const fetchMyMeter = async () => {
        try {
          const res = await api.get("/gas/meters");
          const citizenNameLower = user?.name?.trim().toLowerCase();
          const myMeter = res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower && m.status === 'active')
            || res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower);
          setMeter(myMeter);
        } catch (err: any) {
          if (err?.code !== "ERR_NETWORK") console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMyMeter();
    }
  }, [isReady]);

  const handleInitiatePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePay = async (invoiceId: string) => {
    setIsPaying(true);
    setTimeout(async () => {
      try {
        await api.patch(`/gas/meters/${meter.id}/pay`);
        toast.success(`Payment successful via ${paymentMethod.toUpperCase()}!`);
        
        const res = await api.get("/gas/meters");
        const user = getUser();
        const citizenNameLower = user?.name?.trim().toLowerCase();
        const updatedMeter = res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower && m.status === 'active')
          || res.data.find((m: any) => m.citizenName?.trim().toLowerCase() === citizenNameLower);
        setMeter(updatedMeter);
        setShowPaymentModal(false);
      } catch (err) {
        toast.error("Payment failed. Please try again.");
      } finally {
        setIsPaying(false);
      }
    }, 2000);
  };

  if (!isReady) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">No Gas Meter Found</h2>
          <p className="mt-2 text-slate-500">You do not have an active line gas connection. Please request a meter first.</p>
        </main>
      </div>
    );
  }

  const invoice = meter.pendingInvoice;
  const history = meter.invoiceHistory || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold uppercase text-orange-700">Digital Payments</p>
          </div>
          <h1 className="text-3xl font-black text-slate-950">My Gas Bills</h1>
          <p className="mt-2 text-slate-600">
            View your current gas utility invoices, pay online securely, and review your payment history.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" /> Current Invoice
          </h2>
          
          {!invoice ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
              <h3 className="text-xl font-bold text-slate-900">You're all caught up!</h3>
              <p className="text-slate-500 mt-1">There are no pending gas bills for your account.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-orange-200 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>
              
              <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Invoice ID</p>
                  <p className="text-lg font-mono font-bold text-slate-900">{invoice.id}</p>
                  <p className="text-sm text-slate-500 mt-1">Issued: {invoice.date}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-bold text-slate-500 uppercase">Total Due</p>
                  <p className="text-4xl font-black text-orange-600">৳{invoice.amount}</p>
                  <p className="text-sm font-bold text-rose-500 mt-1">Status: UNPAID</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="w-full md:w-auto flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase">Breakdown</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Base Charge</span>
                      <span className="font-medium text-slate-900">৳{invoice.breakdown.base}</span>
                    </li>
                    <li className="flex justify-between border-b border-slate-200 pb-2">
                      <span>Over-Limit Penalty</span>
                      <span className="font-medium text-slate-900">{invoice.breakdown.penalty > 0 ? `৳${invoice.breakdown.penalty}` : '-'}</span>
                    </li>
                    <li className="flex justify-between font-bold text-slate-900 pt-1">
                      <span>Total</span>
                      <span>৳{invoice.amount}</span>
                    </li>
                  </ul>
                </div>

                <div className="w-full md:w-auto">
                  <button 
                    onClick={handleInitiatePayment}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition"
                  >
                    Pay ৳{invoice.amount} Now <ArrowRight className="h-5 w-5" />
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <CreditCard className="h-3 w-3" /> Secure Payment Gateway
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" /> Payment History
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Invoice ID</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No past payments found.
                      </td>
                    </tr>
                  ) : (
                    history.map((hist: any) => (
                      <tr key={hist.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-slate-900">{hist.id}</td>
                        <td className="px-6 py-4 text-slate-600">{hist.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">৳{hist.amount}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {showPaymentModal && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Checkout</h2>
                  <p className="text-sm text-slate-300">Smart City Pay</p>
                </div>
              </div>
              <button 
                onClick={() => !isPaying && setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 shrink-0">
                <button 
                  onClick={() => setPaymentTab("mobile")}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold border-b border-slate-200 transition ${paymentTab === "mobile" ? "bg-white text-orange-600 border-l-4 border-l-orange-600" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Smartphone className="h-5 w-5" /> Mobile Banking
                </button>
                <button 
                  onClick={() => setPaymentTab("card")}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold border-b border-slate-200 transition ${paymentTab === "card" ? "bg-white text-orange-600 border-l-4 border-l-orange-600" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <CreditCard className="h-5 w-5" /> Credit / Debit Card
                </button>
                <button 
                  onClick={() => setPaymentTab("bank")}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left font-bold border-b border-slate-200 transition ${paymentTab === "bank" ? "bg-white text-orange-600 border-l-4 border-l-orange-600" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Building2 className="h-5 w-5" /> Net Banking
                </button>
              </div>

              <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                  <p className="text-slate-500 font-bold uppercase text-sm">Total Payable</p>
                  <p className="text-3xl font-black text-slate-900">৳{invoice.amount}</p>
                </div>

                {paymentTab === "mobile" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setPaymentMethod("bkash")} className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === "bkash" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200 hover:border-pink-300"}`}>
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-black text-xs">bKash</div>
                      </button>
                      <button onClick={() => setPaymentMethod("nagad")} className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === "nagad" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 hover:border-orange-300"}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-black text-xs">Nagad</div>
                      </button>
                      <button onClick={() => setPaymentMethod("rocket")} className={`p-3 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === "rocket" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-slate-200 hover:border-purple-300"}`}>
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black text-xs" style={{fontSize: '0.6rem'}}>Rocket</div>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{paymentMethod.toUpperCase()} Account Number</label>
                      <input type="text" placeholder="e.g. 017XXXXXXXX" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                  </div>
                )}

                {paymentTab === "card" && (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-600">VISA</div>
                      <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-600">MasterCard</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                        <input type="text" placeholder="123" className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentTab === "bank" && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 mb-4">Select your bank from the list below to proceed to their secure portal.</p>
                    <select className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white">
                      <option>City Bank</option>
                      <option>BRAC Bank</option>
                      <option>Dutch-Bangla Bank</option>
                      <option>Islami Bank</option>
                      <option>Eastern Bank Ltd.</option>
                    </select>
                  </div>
                )}

              </div>
            </div>

            <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end shrink-0">
              <button 
                onClick={() => handlePay(invoice.id)}
                disabled={isPaying}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" /> Confirm Payment
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
