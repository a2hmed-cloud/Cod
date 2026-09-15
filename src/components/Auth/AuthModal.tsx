import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Database,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { authApi, healthApi, AuthUser } from '../../services/api';
import { syncEngine, SyncStatus } from '../../services/syncEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onAuthChange: (user: AuthUser | null) => void;
  isLight: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthChange,
  isLight,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ status: string; database: string; engine?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local-only');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      // Check real DB health
      healthApi.check()
        .then(setDbStatus)
        .catch(() => setDbStatus({ status: 'error', database: 'disconnected' }));
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = syncEngine.subscribe((status) => setSyncStatus(status));
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      onAuthChange(res.user);
      setSuccessMsg('Successfully authenticated with PostgreSQL backend');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authApi.register(email, password, name);
      onAuthChange(res.user);
      setSuccessMsg('Account created successfully');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      onAuthChange(null);
      setSuccessMsg('Logged out successfully');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      onAuthChange(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      await syncEngine.syncAllPending();
      setSuccessMsg('All pending changes synchronized with PostgreSQL');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-window"
        className={`w-full max-w-md rounded-xl shadow-2xl border overflow-hidden flex flex-col transition-colors ${
          isLight
            ? 'bg-[#ffffff]/95 text-[#1d1d1f] border-black/10'
            : 'bg-[#1e1e1e]/95 text-[#f5f5f7] border-white/10'
        }`}
      >
        {/* Window Chrome / Titlebar */}
        <div
          className={`h-11 px-4 flex items-center justify-between border-b select-none ${
            isLight ? 'bg-[#f6f6f6] border-black/5' : 'bg-[#252526] border-white/5'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 cursor-pointer" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="text-xs font-semibold tracking-wide flex items-center space-x-1.5 opacity-80">
            <ShieldCheck size={14} className="text-[#007aff]" />
            <span>Cod Authentication & Cloud Sync</span>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              isLight ? 'hover:bg-black/5 text-black/50' : 'hover:bg-white/10 text-white/50'
            }`}
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Database & Sync Status Banner */}
          <div
            className={`mb-5 p-3 rounded-lg border text-xs flex items-center justify-between ${
              dbStatus?.status === 'ok'
                ? isLight
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : isLight
                  ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                  : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database size={15} />
              <div>
                <span className="font-semibold">
                  {dbStatus?.status === 'ok' ? 'PostgreSQL 15 Connected' : 'Database Offline'}
                </span>
                <span className="opacity-75 block text-[11px]">
                  Prisma ORM • Local-First IndexedDB
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-black/10">
                {syncStatus}
              </span>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start space-x-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-start space-x-2">
              <CheckCircle size={15} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Logged in View */}
          {currentUser ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border text-center ${
                  isLight ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#007aff]/20 text-[#007aff] font-semibold text-lg flex items-center justify-center mx-auto mb-2">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-sm">{currentUser.name}</h3>
                <p className="text-xs opacity-60 mt-0.5">{currentUser.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 text-[11px] rounded-full bg-[#007aff]/15 text-[#007aff] font-medium">
                  Role: {currentUser.role}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors ${
                    isLight
                      ? 'bg-black/5 hover:bg-black/10 text-[#1d1d1f]'
                      : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>Sync Projects with Cloud PostgreSQL</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-lg text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Tabs: Login / Register) */
            <div>
              {/* Tab Selector */}
              <div
                className={`flex p-1 rounded-lg mb-5 border ${
                  isLight ? 'bg-black/5 border-black/5' : 'bg-black/30 border-white/5'
                }`}
              >
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    tab === 'login'
                      ? isLight
                        ? 'bg-white text-black shadow-sm'
                        : 'bg-[#2d2d2d] text-white shadow-sm'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    tab === 'register'
                      ? isLight
                        ? 'bg-white text-black shadow-sm'
                        : 'bg-[#2d2d2d] text-white shadow-sm'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-medium opacity-70 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 opacity-40" />
                      <input
                        id="login-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@apple.com"
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none transition-all ${
                          isLight
                            ? 'bg-black/5 border-black/10 focus:border-[#007aff] focus:bg-white'
                            : 'bg-white/5 border-white/10 focus:border-[#007aff] focus:bg-black/40'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium opacity-70 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-2.5 opacity-40" />
                      <input
                        id="login-password-input"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none transition-all ${
                          isLight
                            ? 'bg-black/5 border-black/10 focus:border-[#007aff] focus:bg-white'
                            : 'bg-white/5 border-white/10 focus:border-[#007aff] focus:bg-black/40'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    id="btn-login-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-[#007aff] hover:bg-[#0071eb] active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <span>Sign In with Password</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-medium opacity-70 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-2.5 opacity-40" />
                      <input
                        id="register-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Steve Wozniak"
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none transition-all ${
                          isLight
                            ? 'bg-black/5 border-black/10 focus:border-[#007aff] focus:bg-white'
                            : 'bg-white/5 border-white/10 focus:border-[#007aff] focus:bg-black/40'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium opacity-70 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 opacity-40" />
                      <input
                        id="register-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="steve@apple.com"
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none transition-all ${
                          isLight
                            ? 'bg-black/5 border-black/10 focus:border-[#007aff] focus:bg-white'
                            : 'bg-white/5 border-white/10 focus:border-[#007aff] focus:bg-black/40'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium opacity-70 mb-1">
                      Password (min 6 chars)
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-2.5 opacity-40" />
                      <input
                        id="register-password-input"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none transition-all ${
                          isLight
                            ? 'bg-black/5 border-black/10 focus:border-[#007aff] focus:bg-white'
                            : 'bg-white/5 border-white/10 focus:border-[#007aff] focus:bg-black/40'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    id="btn-register-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 bg-[#007aff] hover:bg-[#0071eb] active:scale-[0.99] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <span>Create PostgreSQL Account</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
