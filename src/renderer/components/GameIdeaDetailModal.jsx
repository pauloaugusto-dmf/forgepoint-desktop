import React from 'react';
import {
  X,
  Edit3,
  Trash2,
  Code2,
  Cpu,
  CheckCircle2,
  Sparkles,
  Wrench,
  Layers,
} from 'lucide-react';
import { resolveMedia } from '../utils';

export default function GameIdeaDetailModal({
  isOpen,
  idea,
  onClose,
  onEdit,
  onDelete,
  onToggleIntegration,
  onToggleMechanicImplemented,
}) {
  if (!isOpen || !idea) return null;

  const mechs = idea.mechanics || [];
  const totalMechs = mechs.length;
  const implementedCount = mechs.filter((m) => m.is_implemented).length;
  const integratedCount = mechs.filter((m) => m.is_integrated).length;

  const implementedPct = totalMechs > 0 ? Math.round((implementedCount / totalMechs) * 100) : 0;
  const integratedPct = totalMechs > 0 ? Math.round((integratedCount / totalMechs) * 100) : 0;

  const imageUrl = resolveMedia(idea.image_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-dark-900 border border-dark-750 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Banner / Cover Header */}
        <div className="relative h-48 sm:h-64 bg-dark-950 shrink-0 overflow-hidden border-b border-dark-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={idea.title}
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-950/60 via-dark-900 to-cyan-950/40 flex items-center justify-center">
              <Code2 className="w-16 h-16 text-violet-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => onEdit(idea)}
              className="p-2 rounded-xl bg-black/60 text-slate-300 hover:text-white hover:bg-violet-600 transition-colors"
              title="Editar Ideia"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(idea)}
              className="p-2 rounded-xl bg-black/60 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
              title="Excluir Ideia"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-200 text-[11px] font-bold mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>Projeto / Ideia de Jogo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {idea.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Description */}
          {idea.description ? (
            <div className="bg-dark-950/80 border border-dark-800 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {idea.description}
            </div>
          ) : (
            <p className="text-xs text-dark-600 italic">Sem descrição detalhada.</p>
          )}

          {/* Dual Progress Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Prontas no Catálogo (Reaproveitáveis)
                </span>
                <span className="font-black text-white">
                  {implementedCount}/{totalMechs} ({implementedPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${implementedPct}%` }}
                />
              </div>
              <p className="text-[11px] text-txt-muted">
                Mecânicas já codificadas na sua biblioteca que este jogo reaproveita.
              </p>
            </div>

            <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Integradas no Jogo Atual
                </span>
                <span className="font-black text-white">
                  {integratedCount}/{totalMechs} ({integratedPct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${integratedPct}%` }}
                />
              </div>
              <p className="text-[11px] text-txt-muted">
                Mecânicas já plugadas e funcionando dentro da build deste projeto.
              </p>
            </div>
          </div>

          {/* Checklist de Mecânicas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <span>Mecânicas do Projeto ({totalMechs})</span>
              </h3>
              <span className="text-xs text-txt-muted">
                Clique no botão de status para alternar a integração
              </span>
            </div>

            {totalMechs === 0 ? (
              <div className="p-8 text-center bg-dark-950 border border-dark-800 rounded-2xl">
                <Cpu className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  Nenhuma mecânica vinculada a este jogo ainda. Edite o projeto para selecionar do catálogo.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {mechs.map((m) => {
                  const gif = resolveMedia(m.gif_url);

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        m.is_integrated
                          ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/15'
                          : 'bg-dark-950 border-dark-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {gif ? (
                            <img
                              src={gif}
                              alt={m.name}
                              className="w-12 h-12 rounded-xl object-cover border border-dark-750 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-750 flex items-center justify-center text-slate-500 shrink-0">
                              <Cpu className="w-6 h-6" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white">{m.name}</h4>
                              <button
                                type="button"
                                onClick={() =>
                                  onToggleMechanicImplemented && onToggleMechanicImplemented(m)
                                }
                                title="Clique para alternar o status global desta mecânica no catálogo"
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                                  m.is_implemented
                                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
                                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                                }`}
                              >
                                {m.is_implemented ? (
                                  <>
                                    <Sparkles size={10} />
                                    <span>Pronta no Catálogo</span>
                                  </>
                                ) : (
                                  <>
                                    <Wrench size={10} />
                                    <span>A Programar no Catálogo</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {m.description && (
                              <p className="text-xs text-txt-muted mt-1 leading-relaxed">
                                {m.description}
                              </p>
                            )}

                            {m.notes && (
                              <div className="mt-2 text-xs text-violet-300 bg-violet-950/40 px-3 py-1.5 rounded-xl border border-violet-500/20">
                                <strong>Nota do Jogo:</strong> {m.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Toggle de Integração */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onToggleIntegration(idea.id, m.id, !m.is_integrated, m.notes)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                              m.is_integrated
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                                : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-dark-700 hover:border-emerald-500/40'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{m.is_integrated ? 'Integrada no Jogo' : 'Marcar como Integrada'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
