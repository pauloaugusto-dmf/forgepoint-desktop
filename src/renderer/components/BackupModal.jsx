import React, { useState } from 'react';
import { X, Download, Upload, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BackupModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      const exported = await window.api.exportData();
      if (exported) {
        toast.success('Backup exportado com sucesso!');
        onClose();
      }
    } catch (err) {
      toast.error('Erro ao exportar backup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const confirm = window.confirm(
      'ATENÇÃO: A importação substituirá todas as ideias e mecânicas atuais do Forgepoint. Deseja continuar?'
    );
    if (!confirm) return;

    try {
      setLoading(true);
      const imported = await window.api.importData();
      if (imported) {
        toast.success('Dados importados com sucesso!');
        await onRefresh();
        onClose();
      }
    } catch (err) {
      toast.error('Erro ao importar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-dark-800 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-violet-600/20 text-violet-400 rounded-2xl border border-violet-500/30">
            <Database size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Backup & Restauração</h2>
            <p className="text-xs text-txt-muted">
              Exporte seus dados em JSON ou restaure em qualquer máquina.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Exportar Dados</h3>
              <p className="text-xs text-txt-muted">Salvar catálogo e ideias em arquivo JSON</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <Download size={14} />
              <span>Exportar</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-dark-950 border border-dark-800 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Importar Dados</h3>
              <p className="text-xs text-txt-muted">Restaurar a partir de um backup existente</p>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <Upload size={14} />
              <span>Importar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
