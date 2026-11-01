import React, { useState } from 'react';
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
  FileJson,
  Copy,
  BookOpen,
  Gamepad2,
  Palette,
  FileText,
  Monitor,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
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
  const [activeTab, setActiveTab] = useState('mechanics'); // 'mechanics' | 'gdd_concept' | 'gdd_gameplay' | 'gdd_art_tech'

  if (!isOpen || !idea) return null;

  const mechs = idea.mechanics || [];
  const totalMechs = mechs.length;
  const implementedCount = mechs.filter((m) => m.is_implemented).length;
  const integratedCount = mechs.filter((m) => m.is_integrated).length;

  const implementedPct = totalMechs > 0 ? Math.round((implementedCount / totalMechs) * 100) : 0;
  const integratedPct = totalMechs > 0 ? Math.round((integratedCount / totalMechs) * 100) : 0;

  const imageUrl = resolveMedia(idea.image_url);
  const gdd = idea.gdd || {};

  const handleExportGddJson = () => {
    const exportObject = {
      title: idea.title,
      pitch: idea.description,
      image_url: idea.image_url,
      gdd: {
        genre: gdd.genre || '',
        target_platforms: gdd.target_platforms || '',
        target_audience: gdd.target_audience || '',
        usp: gdd.usp || '',
        references: gdd.references || '',
        core_loop: gdd.core_loop || '',
        win_loss_conditions: gdd.win_loss_conditions || '',
        progression_systems: gdd.progression_systems || '',
        art_style: gdd.art_style || '',
        audio_style: gdd.audio_style || '',
        narrative_setting: gdd.narrative_setting || '',
        engine: gdd.engine || '',
        mvp_scope: gdd.mvp_scope || '',
      },
      mechanics: mechs.map((m) => ({
        name: m.name,
        is_implemented: m.is_implemented,
        is_integrated: m.is_integrated,
        notes: m.notes || '',
      })),
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = idea.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.href = url;
    a.download = `gdd_${safeTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('GDD exportado em JSON com sucesso!');
  };

  const handleCopyGddText = () => {
    const textLines = [
      `# GDD: ${idea.title}`,
      idea.description ? `\n## Pitch / Conceito:\n${idea.description}` : '',
      gdd.genre ? `\n- Gênero: ${gdd.genre}` : '',
      gdd.target_platforms ? `- Plataformas: ${gdd.target_platforms}` : '',
      gdd.target_audience ? `- Público-Alvo: ${gdd.target_audience}` : '',
      gdd.usp ? `- USP / Diferencial: ${gdd.usp}` : '',
      gdd.references ? `- Referências: ${gdd.references}` : '',
      gdd.core_loop ? `\n## Core Gameplay Loop:\n${gdd.core_loop}` : '',
      gdd.win_loss_conditions ? `\n## Regras & Condições:\n${gdd.win_loss_conditions}` : '',
      gdd.progression_systems ? `\n## Progressão & Economia:\n${gdd.progression_systems}` : '',
      gdd.art_style ? `\n## Estilo Visual:\n${gdd.art_style}` : '',
      gdd.audio_style ? `\n## Áudio & Trilha:\n${gdd.audio_style}` : '',
      gdd.narrative_setting ? `\n## Narrativa & Universo:\n${gdd.narrative_setting}` : '',
      gdd.engine ? `\n- Engine: ${gdd.engine}` : '',
      gdd.mvp_scope ? `- Escopo MVP: ${gdd.mvp_scope}` : '',
      `\n## Mecânicas (${totalMechs}):`,
      ...mechs.map(
        (m) =>
          `- [${m.is_integrated ? 'X' : ' '}] ${m.name}${
            m.notes ? ` (Nota: ${m.notes})` : ''
          } - ${m.is_implemented ? 'Pronta no Catálogo' : 'A Programar'}`
      ),
    ].filter(Boolean);

    navigator.clipboard.writeText(textLines.join('\n'));
    toast.success('GDD copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-dark-900 border border-dark-750 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[94vh] flex flex-col">
        {/* Banner / Cover Header */}
        <div className="relative h-48 sm:h-56 bg-dark-950 shrink-0 overflow-hidden border-b border-dark-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={idea.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-950/60 via-dark-900 to-cyan-950/40 flex items-center justify-center">
              <Code2 className="w-16 h-16 text-violet-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleExportGddJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 text-violet-300 hover:text-white hover:bg-violet-600 transition-colors text-xs font-bold backdrop-blur-md cursor-pointer"
              title="Exportar GDD em formato JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>
            <button
              onClick={handleCopyGddText}
              className="p-2 rounded-xl bg-black/60 text-slate-300 hover:text-white hover:bg-dark-700 transition-colors backdrop-blur-md cursor-pointer"
              title="Copiar texto do GDD para a área de transferência"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(idea)}
              className="p-2 rounded-xl bg-black/60 text-slate-300 hover:text-white hover:bg-violet-600 transition-colors backdrop-blur-md cursor-pointer"
              title="Editar Ideia e GDD"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(idea)}
              className="p-2 rounded-xl bg-black/60 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors backdrop-blur-md cursor-pointer"
              title="Excluir Ideia"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 transition-colors backdrop-blur-md cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Título e Badges no Banner */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-200 text-[11px] font-bold">
                <Code2 className="w-3 h-3" />
                <span>Projeto / GDD</span>
              </span>
              {gdd.genre && (
                <span className="px-2.5 py-0.5 rounded-full bg-dark-800/90 border border-dark-700 text-slate-300 text-[11px] font-medium">
                  {gdd.genre}
                </span>
              )}
              {gdd.engine && (
                <span className="px-2.5 py-0.5 rounded-full bg-dark-800/90 border border-dark-700 text-cyan-300 text-[11px] font-medium">
                  {gdd.engine}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {idea.title}
            </h2>
          </div>
        </div>

        {/* Dual Progress Overview */}
        <div className="px-6 pt-4 pb-2 shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-dark-800">
          <div className="bg-dark-950/80 border border-dark-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Prontas no Catálogo
              </span>
              <span className="font-black text-white">
                {implementedCount}/{totalMechs} ({implementedPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${implementedPct}%` }}
              />
            </div>
          </div>

          <div className="bg-dark-950/80 border border-dark-800 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Integradas na Build
              </span>
              <span className="font-black text-white">
                {integratedCount}/{totalMechs} ({integratedPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${integratedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-dark-800 overflow-x-auto shrink-0 bg-dark-900">
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mechanics'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stack de Mecânicas ({totalMechs})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gdd_concept')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gdd_concept'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>GDD: Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gdd_gameplay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gdd_gameplay'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>GDD: Core Loop & Regras</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gdd_art_tech')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gdd_art_tech'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>GDD: Arte & Técnico</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* ==================== TAB: MECÂNICAS ==================== */}
          {activeTab === 'mechanics' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-muted">
                  Alterne o botão para sincronizar o que já foi integrado no código deste jogo
                </span>
              </div>

              {totalMechs === 0 ? (
                <div className="p-8 text-center bg-dark-950 border border-dark-800 rounded-2xl">
                  <Cpu className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Nenhuma mecânica vinculada a este jogo ainda. Clique no ícone de lápis para editar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mechs.map((m) => {
                    const gif = resolveMedia(m.gif_url);

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
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
                              onClick={() =>
                                onToggleIntegration(idea.id, m.id, !m.is_integrated, m.notes)
                              }
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
          )}

          {/* ==================== TAB: GDD VISÃO GERAL ==================== */}
          {activeTab === 'gdd_concept' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Pitch */}
              {idea.description ? (
                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Conceito Geral / Pitch
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {idea.description}
                  </p>
                </div>
              ) : null}

              {/* Informações de Mercado e Público */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
                    Gênero & Subgênero
                  </span>
                  <p className="text-xs font-bold text-white">
                    {gdd.genre || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>

                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
                    Plataformas-Alvo
                  </span>
                  <p className="text-xs font-bold text-white">
                    {gdd.target_platforms || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>

                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
                    Público-Alvo
                  </span>
                  <p className="text-xs font-bold text-white">
                    {gdd.target_audience || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>
              </div>

              {/* USP & Referências */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-dark-950 border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    Diferencial Único (USP / Hook)
                  </span>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {gdd.usp || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>

                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-1">
                    Inspirações & Referências
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gdd.references || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: GDD GAMEPLAY ==================== */}
          {activeTab === 'gdd_gameplay' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Core Loop */}
              <div className="bg-dark-950 border border-cyan-500/20 bg-cyan-500/5 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-1.5">
                  <Gamepad2 size={13} />
                  Core Gameplay Loop
                </h4>
                <p className="text-xs text-cyan-100 leading-relaxed whitespace-pre-line">
                  {gdd.core_loop || <span className="text-dark-600 italic">Não informado</span>}
                </p>
              </div>

              {/* Condições de Vitória e Derrota */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Condições de Vitória e Derrota
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {gdd.win_loss_conditions || <span className="text-dark-600 italic">Não informado</span>}
                </p>
              </div>

              {/* Progressão & Economia */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sistemas de Progressão, Upgrades & Economia
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {gdd.progression_systems || <span className="text-dark-600 italic">Não informado</span>}
                </p>
              </div>
            </div>
          )}

          {/* ==================== TAB: GDD ARTE & TÉCNICO ==================== */}
          {activeTab === 'gdd_art_tech' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Arte e Áudio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                    <Palette size={12} className="text-amber-400" />
                    Estilo Visual & Arte
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gdd.art_style || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>

                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Direção de Áudio & Trilha Sonora
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gdd.audio_style || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>
              </div>

              {/* Narrativa & Lore */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1.5">
                  <FileText size={12} />
                  Narrativa, Universo & Lore
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {gdd.narrative_setting || <span className="text-dark-600 italic">Não informado</span>}
                </p>
              </div>

              {/* Engine & Escopo MVP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Engine / Tecnologia
                  </span>
                  <p className="text-xs font-bold text-white">
                    {gdd.engine || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>

                <div className="bg-dark-950 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Escopo do MVP (Primeira Demo Jogável)
                  </span>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {gdd.mvp_scope || <span className="text-dark-600 italic">Não informado</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
