import React from "react";
import { Upload } from "lucide-react";
import { problems } from "../../data/problems";
import { exportProblemsCSV } from "../../utils";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { dark, setDark } = useAppContext();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoadingPwd(true);
      await api.put('/auth/update-password', { oldPassword, newPassword });
      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      </div>
      <div className="space-y-4">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Dark Mode</p>
              <p className="text-xs text-[var(--muted-foreground)]">Switch between light and dark theme</p>
            </div>
            <button onClick={() => setDark(!dark)}
              className={`relative w-12 h-6 rounded-full transition-colors ${dark ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${dark ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Data</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Export Data</p>
              <p className="text-xs text-[var(--muted-foreground)]">Download all {problems.length} problems as CSV</p>
            </div>
            <button onClick={() => exportProblemsCSV(problems)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              <Upload size={14} />Export CSV
            </button>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Security</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--foreground)]">Current Password</label>
                <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm outline-none focus:border-[var(--primary)]" />
              </div>
              <div />
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--foreground)]">New Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--foreground)]">Confirm New Password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
            <button type="submit" disabled={loadingPwd} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
              {loadingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-2">About</h2>
          <p className="text-sm text-[var(--muted-foreground)]">SIH 2025 Problem Explorer — {problems.length} problem statements from Smart India Hackathon 2025. Built for students, mentors, faculty, and hackathon teams.</p>
        </div>
      </div>
    </div>
  );
}
