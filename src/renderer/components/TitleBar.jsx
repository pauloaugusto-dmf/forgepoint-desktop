import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Database, Plus } from 'lucide-react';
import iconLogo from '../../assets/icon.png';

export default function TitleBar({ onOpenBackup, onNewIdea, onNewMechanic }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Verifica estado inicial
    if (window.windowControls?.isMaximized) {
      window.windowControls.isMaximized().then((max) => setIsMaximized(Boolean(max)));
    }

    // Ouve mudanças de estado do main process
    if (window.windowControls?.onStateChange) {
      const cleanup = window.windowControls.onStateChange((data) => {
        if (data && typeof data.isMaximized === 'boolean') {
          setIsMaximized(data.isMaximized);
        }
      });
      return cleanup;
    }
  }, []);

  const handleToggleMaximize = async () => {
    if (window.windowControls?.maximize) {
      const isMax = await window.windowControls.maximize();
      if (typeof isMax === 'boolean') {
        setIsMaximized(isMax);
      }
    }
  };

  return (
    <header
      onDoubleClick={handleToggleMaximize}
      style={{ WebkitAppRegion: 'drag' }}
      className="h-10 bg-dark-950/95 border-b border-dark-800 flex items-center justify-between pl-3 pr-0 select-none titlebar-drag shrink-0 z-40"
    >
      {/* Esquerda: Logo Oficial e Nome */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' }}>
        <img
          src={iconLogo}
          alt="Forgepoint Logo"
          className="w-5 h-5 rounded-md object-contain shadow-sm"
        />
        <span className="text-xs font-black tracking-wider uppercase text-white">
          Forgepoint
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
          Game Dev Studio
        </span>
      </div>

      {/* Centro / Ações Rápidas */}
      <div className="flex items-center gap-2 titlebar-no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          onClick={onNewIdea}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-[11px] font-bold transition-all cursor-pointer"
        >
          <Plus size={12} />
          <span>Nova Ideia</span>
        </button>

        <button
          type="button"
          onClick={onNewMechanic}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-[11px] font-bold transition-all cursor-pointer"
        >
          <Plus size={12} />
          <span>Nova Mecânica</span>
        </button>

        <button
          type="button"
          onClick={onOpenBackup}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
          title="Backup & Restauração"
        >
          <Database size={13} />
          <span>Backup</span>
        </button>
      </div>

      {/* Direita: Controles de Janela Nativos (altura completa para clique fácil) */}
      <div className="flex items-center h-full titlebar-no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' }}
          onClick={() => window.windowControls?.minimize()}
          className="px-4 h-full flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Minimizar"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' }}
          onClick={handleToggleMaximize}
          className="px-4 h-full flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? (
            <Copy size={11} className="rotate-90" />
          ) : (
            <Square size={12} />
          )}
        </button>
        <button
          type="button"
          style={{ WebkitAppRegion: 'no-drag' }}
          onClick={() => window.windowControls?.close()}
          className="px-4 h-full flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Fechar"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
