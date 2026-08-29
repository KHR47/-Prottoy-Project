"use client";

import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useRequireRole } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Role, User } from "@/types/user";
import { Users, Search, UserPlus, Pencil, UserX, X, CheckCircle, AlertTriangle, Shield, Zap } from "lucide-react";

type UserForm = { name: string; email: string; phone: string; password: string; role: Role; badgeNumber: string; district: string; isActive: boolean };
const emptyForm: UserForm = { name: "", email: "", phone: "", password: "123456", role: "citizen", badgeNumber: "", district: "", isActive: true };

type District = { id: number; name: string };

const roleColors: Record<string, string> = {
  citizen: "bg-sky-500/20 text-sky-400 ring-sky-500/30",
  officer: "bg-amber-500/20 text-amber-400 ring-amber-500/30",
  authority: "bg-violet-500/20 text-violet-400 ring-violet-500/30",
  admin: "bg-rose-500/20 text-rose-400 ring-rose-500/30",
  driver: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30",
  attendant: "bg-pink-500/20 text-pink-400 ring-pink-500/30",
};

const inputClass = "h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-2 focus:ring-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed";

export default function AdminUsersPage() {
  const { isReady } = useRequireRole(["admin"]);
  const [users, setUsers] = useState<User[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function loadData() {
    const r = await api.get("/users");
    setUsers(r.data);
  }

  useEffect(() => {
    if (!isReady) return;
    let active = true;
    Promise.all([
      api.get("/users"),
      api.get("/locations/districts")
    ]).then(([uRes, dRes]) => {
      if (active) {
        setUsers(uRes.data);
        setDistricts(dRes.data);
      }
    }).catch((e) => setError(getErrorMessage(e, "Could not load data.")));
    return () => { active = false; };
  }, [isReady]);

  function updateForm(field: keyof UserForm, value: string | boolean) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  function resetForm() { setForm(emptyForm); setEditingId(null); setShowModal(false); }

  function openEdit(user: User) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, phone: (user as any).phone || "", password: "", role: user.role, badgeNumber: user.badgeNumber || "", district: (user as any).district || "", isActive: user.isActive !== false });
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    const payload = { name: form.name, email: form.email, phone: form.phone || null, role: form.role, badgeNumber: form.role === "officer" ? form.badgeNumber : null, district: form.district || null, isActive: form.isActive, ...(form.password ? { password: form.password } : {}) };
    try {
      if (editingId) { await api.patch(`/users/${editingId}`, payload); setMessage("User updated successfully."); }
      else { await api.post("/users", payload); setMessage("User created successfully."); }
      resetForm(); await loadData();
    } catch (e: unknown) { setError(getErrorMessage(e, "Could not save user.")); }
  }

  async function deactivateUser(id: number) {
    setError(""); setMessage("");
    try { await api.delete(`/users/${id}`); setMessage("User deactivated."); await loadData(); }
    catch (e: unknown) { setError(getErrorMessage(e, "Could not deactivate user.")); }
  }

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchSearch && (roleFilter === "all" || u.role === roleFilter);
  });

  const roleCount = (r: Role) => users.filter((u) => u.role === r).length;

  if (!isReady) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/40">
                <Users className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400">System Administration</p>
                <h1 className="text-2xl font-black text-white">User Management</h1>
              </div>
            </div>
            <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}
              className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-sm font-bold text-white transition shadow-lg shadow-teal-900/30">
              <UserPlus className="h-4 w-4" /> New User
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>}
        {message && <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"><CheckCircle className="h-4 w-4 shrink-0" />{message}</div>}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-6 gap-4">
          {(["citizen", "officer", "authority", "admin", "driver", "attendant"] as Role[]).map((r) => (
            <button key={r} onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
              className={`rounded-xl border p-4 text-left transition ${roleFilter === r ? "border-teal-500 bg-teal-500/10" : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600"}`}>
              <p className="text-xs font-bold text-slate-500 uppercase">{r}s</p>
              <p className={`text-3xl font-black mt-1 ${(roleColors[r] || "").split(" ")[1]}`}>{roleCount(r)}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-teal-500" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-1 self-start sm:self-auto flex-wrap">
            {(["all", "citizen", "officer", "authority", "admin", "driver", "attendant"] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition ${roleFilter === r ? "bg-teal-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                {r === "all" ? "All" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-700/50 bg-slate-900/50">
                <tr>
                  {["User", "Role", "Contact", "District", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No users found.</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset capitalize ${roleColors[user.role]}`}>{user.role}</span>
                      {user.role === "officer" && user.badgeNumber && <span className="ml-2 text-xs text-slate-500">#{user.badgeNumber}</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{(user as any).phone || <span className="text-slate-600 italic">—</span>}</td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{(user as any).district || <span className="text-slate-600 italic">—</span>}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${user.isActive === false ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(user)} className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-600 transition">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => deactivateUser(user.id)} disabled={user.isActive === false}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed">
                          <UserX className="h-3 w-3" /> Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
              <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{editingId ? "Edit User" : "Create New User"}</h2>
              <button onClick={resetForm} className="rounded-lg p-2 transition" style={{ color: 'var(--text-muted)' }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid gap-4 md:grid-cols-2">
              {[{label:'Full Name',field:'name',type:'text',placeholder:'Full Name',required:true},{label:'Email',field:'email',type:'email',placeholder:'Email',required:true},{label:'Phone',field:'phone',type:'tel',placeholder:'Phone',required:true},{label:'Password',field:'password',type:'password',placeholder:editingId?'Leave blank to keep':'Password',required:!editingId}].map(({label,field,type,placeholder,required})=>(
                <div key={field}>
                  <label className="block text-xs font-bold mb-1.5 uppercase" style={{color:'var(--text-muted)'}}>{label}</label>
                  <input className={inputClass} type={type} placeholder={placeholder} value={(form as any)[field]} onChange={(e)=>updateForm(field as keyof UserForm,e.target.value)} required={required}
                    style={{background:'var(--bg-elevated)',color:'var(--text-primary)',borderColor:'var(--border-strong)'}} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase" style={{color:'var(--text-muted)'}}>Role</label>
                <select className={inputClass} value={form.role} onChange={(e)=>updateForm('role',e.target.value as Role)}
                  style={{background:'var(--bg-elevated)',color:'var(--text-primary)',borderColor:'var(--border-strong)'}}>
                  <option value="citizen">Citizen</option>
                  <option value="officer">Officer</option>
                  <option value="authority">Authority / Operator</option>
                  <option value="driver">Driver (Transport)</option>
                  <option value="attendant">Parking Attendant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase" style={{color:'var(--text-muted)'}}>Badge Number</label>
                <input className={inputClass} placeholder="Officers only" value={form.badgeNumber} onChange={(e)=>updateForm('badgeNumber',e.target.value)} disabled={form.role!=="officer"} required={form.role==="officer"}
                  style={{background:'var(--bg-elevated)',color:'var(--text-primary)',borderColor:'var(--border-strong)'}} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase" style={{color:'var(--text-muted)'}}>District</label>
                <select className={inputClass} value={form.district} onChange={(e)=>updateForm('district',e.target.value)} required
                  style={{background:'var(--bg-elevated)',color:'var(--text-primary)',borderColor:'var(--border-strong)'}}>
                  <option value="">Select a district</option>
                  {districts.map((d)=><option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex h-11 w-full items-center gap-3 rounded-xl px-4 cursor-pointer transition" style={{border:'1px solid var(--border-strong)',background:'var(--bg-elevated)'}}>
                  <input type="checkbox" className="h-4 w-4 rounded text-teal-500 focus:ring-teal-500" checked={form.isActive} onChange={(e)=>updateForm('isActive',e.target.checked)} />
                  <span className="text-sm font-bold" style={{color:'var(--text-primary)'}}>Account Active</span>
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2" style={{borderTop:'1px solid var(--border)'}}>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-bold transition" style={{color:'var(--text-muted)'}}>Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-2.5 text-sm font-bold text-white transition">
                  <CheckCircle className="h-4 w-4" /> {editingId ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
