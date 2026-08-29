"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import { CreditCard, Loader2, ArrowLeft, CheckCircle, Receipt, AlertTriangle } from "lucide-react";
import Link from "next/link";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // 'booking' or 'violation'
  const id = searchParams.get("id");
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!type || !id) {
      router.push("/dashboard");
      return;
    }
    
    const endpoint = type === "booking" ? "/parking/my-bookings" : "/parking/my-violations";
    api.get(endpoint).then(res => {
      const item = res.data.find((x: any) => String(x.id) === id);
      if (item) setData(item);
      else setError("Item not found or already paid.");
    }).catch(e => setError("Failed to load payment details")).finally(() => setLoading(false));
  }, [type, id, router]);

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (type === "booking") {
        await api.post(`/parking/bookings/${id}/pay`);
      } else {
        await api.post(`/parking/violations/${id}/pay`);
      }
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Payment processing failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>;

  if (error && !data) return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <AlertTriangle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
      <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
      <Link href="/dashboard" className="text-teal-600 font-bold hover:underline">Return to Dashboard</Link>
    </div>
  );

  if (success) return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h1>
      <p className="text-slate-500 mb-8">Your transaction has been processed securely.</p>
      
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left mb-8 space-y-3">
        <div className="flex justify-between text-sm"><span className="text-slate-500">Transaction ID</span><span className="font-bold text-slate-900">#TXN-{Math.floor(Math.random()*1000000)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Amount Paid</span><span className="font-bold text-teal-600">৳{type === "booking" ? data.totalFee : data.fineAmount}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="font-bold text-slate-900">{new Date().toLocaleString()}</span></div>
      </div>

      <div className="flex gap-4 justify-center">
         <Link href={type === "booking" ? "/bookings" : "/violations"} className="rounded-xl border-2 border-slate-200 px-6 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-all">Back to List</Link>
      </div>
    </div>
  );

  const amount = type === "booking" ? data.totalFee : data.fineAmount;
  const isPaid = data.paymentStatus === 'paid' || data.status === 'paid';

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Link href={type === "booking" ? "/bookings" : "/violations"} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 shrink-0">
             <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Secure Checkout</h1>
            <p className="text-sm text-slate-500">Complete your payment below.</p>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-600">{error}</div>}

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
            <span className="text-slate-500">Payment For</span>
            <span className="font-bold text-slate-900">{type === "booking" ? "Parking Booking" : "Parking Violation"}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
            <span className="text-slate-500">Vehicle</span>
            <span className="font-bold text-slate-900">{data.vehicleNumber}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-200">
            <span className="text-slate-500">Total Amount</span>
            <span className="text-2xl font-black text-teal-600">৳{amount}</span>
          </div>
        </div>

        {/* Dummy Payment Methods */}
        <div className="space-y-3 mb-8">
           <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Select Payment Method</label>
           <div className="rounded-xl border-2 border-teal-500 bg-teal-50 p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                 <CreditCard className="h-5 w-5 text-teal-600" />
                 <span className="font-bold text-teal-900">Credit / Debit Card</span>
              </div>
              <div className="h-4 w-4 rounded-full border-4 border-teal-500 bg-white" />
           </div>
           <div className="rounded-xl border-2 border-slate-100 bg-white p-4 flex items-center justify-between cursor-pointer opacity-60">
              <div className="flex items-center gap-3">
                 <span className="font-black text-blue-600 italic">bKash</span>
              </div>
              <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
           </div>
        </div>

        <button onClick={handlePay} disabled={processing || isPaid || amount < 0}
          className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-lg hover:bg-teal-600 transition-all disabled:opacity-50">
          {processing ? "Processing..." : isPaid ? "Already Paid" : amount === 0 ? "Confirm Booking (৳0)" : `Pay ৳${amount} Securely`}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
          <CheckCircle className="h-3 w-3" /> 256-bit Secure Encryption
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Navbar />
      <Suspense fallback={<div className="flex justify-center py-40"><Loader2 className="h-10 w-10 animate-spin text-teal-600" /></div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
