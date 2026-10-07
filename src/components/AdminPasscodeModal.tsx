import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound, ArrowRight, X, AlertCircle } from 'lucide-react';

export const ADMIN_SECRET_CODE = '9998997226';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcode.trim();

    if (cleanInput === ADMIN_SECRET_CODE) {
      setError(null);
      onSuccess();
    } else {
      setError('Clave secreta incorrecta. Acceso restringido al personal autorizado.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPasscode('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 text-slate-100 shadow-2xl transition-all duration-300 ${
          isShaking ? 'translate-x-[-8px] animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
              <KeyRound className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400">
                Seguridad & Control
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-100 leading-snug">
                Acceso Administrativo
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <div className="mt-4 text-xs text-slate-400 leading-relaxed">
          Para ingresar al <span className="text-amber-300 font-semibold">Panel de Administración de la Boutique</span>, ingresa la clave secreta autorizada.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" /> Clave Secreta de Administrador
              </span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                value={passcode}
                onChange={e => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ingresa la clave secreta..."
                className={`w-full rounded-xl border bg-slate-950/80 px-4 py-3 text-base font-mono tracking-widest text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition ${
                  error 
                    ? 'border-rose-500/80 focus:ring-rose-500/50' 
                    : 'border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/20'
                }`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-500/10 bg-amber-950/20 p-3 text-[11px] text-amber-300/80 flex items-start gap-2">
            <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Módulo protegido para coordinadores, servidores y encargados de inventario de la Fraternidad.</span>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
            >
              <span>Entrar al Panel</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
