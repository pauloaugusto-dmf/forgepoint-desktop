import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  Search,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'mechanics' | 'gdd'
  const [mechSearch, setMechSearch] = useState('');
  const [mechStatusFilter, setMechStatusFilter] = useState('all'); // 'all' | 'integrated' | 'pending' | 'implemented'

  // Reset tab to 'overview' whenever a new idea is opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setMechSearch('');
      setMechStatusFilter('all');
    }
  }, [isOpen, idea?.id]);

  if (!isOpen || !idea) return null;

  const mechs = idea.mechanics || [];
  const totalMechs = mechs.length;
  const implementedCount = mechs.filter((m) => m.is_implemented).length;
  const integratedCount = mechs.filter((m) => m.is_integrated).length;
  const pendingIntegrationCount = totalMechs - integratedCount;

  const implementedPct = totalMechs > 0 ? Math.round((implementedCount / totalMechs) * 100) : 0;
  const integratedPct = totalMechs > 0 ? Math.round((integratedCount / totalMechs) * 100) : 0;

  const imageUrl = resolveMedia(idea.image_url);
  const gdd = idea.gdd || {};

  // Filtragem de mecânicas dentro do modal
  const filteredMechs = mechs.filter((m) => {
    const q = mechSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.notes && m.notes.toLowerCase().includes(q));

    const matchesFilter =
      mechStatusFilter === 'all' ||
      (mechStatusFilter === 'integrated' && m.is_integrated) ||
      (mechStatusFilter === 'pending' && !m.is_integrated) ||
      (mechStatusFilter === 'implemented' && m.is_implemented);

    return matchesSearch && matchesFilter;
  });

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
      <div className="w-full max-w-5xl bg-dark-900 border border-dark-750 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-fadeIn">
        {/* ================= HERO BANNER ================= */}
        <div className="relative h-48 sm:h-56 bg-dark-950 shrink-0 overflow-hidden border-b border-dark-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={idea.title}
              className="w-full h-full object-cover opacity-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-950/80 via-dark-900 to-cyan-950/60 flex items-center justify-center">
              <Gamepad2 className="w-20 h-20 text-violet-500/25" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />

          {/* Quick Actions Toolbar */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleExportGddJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-violet-600 text-violet-300 hover:text-white transition-all text-xs font-bold backdrop-blur-md cursor-pointer border border-white/10 shadow-sm"
              title="Exportar GDD em formato JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>
            <button
              onClick={handleCopyGddText}
              className="p-2 rounded-xl bg-black/60 hover:bg-dark-700 text-slate-300 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10 shadow-sm"
              title="Copiar texto do GDD"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(idea)}
              className="p-2 rounded-xl bg-black/60 hover:bg-violet-600 text-slate-300 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10 shadow-sm"
              title="Editar Ideia e GDD"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(idea)}
              className="p-2 rounded-xl bg-black/60 hover:bg-rose-600 text-rose-400 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10 shadow-sm"
              title="Excluir Ideia"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white transition-all backdrop-blur-md cursor-pointer border border-white/10 shadow-sm ml-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Project Title & Meta Badges */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/25 border border-violet-500/40 text-violet-200 text-[11px] font-bold backdrop-blur-md">
                <Code2 className="w-3 h-3" />
                <span>Projeto de Jogo</span>
              </span>
              {gdd.genre && (
                <span className="px-2.5 py-0.5 rounded-full bg-dark-800/90 border border-dark-700 text-slate-200 text-[11px] font-medium backdrop-blur-md">
                  {gdd.genre}
                </span>
              )}
              {gdd.engine && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-medium backdrop-blur-md">
                  {gdd.engine}
                </span>
              )}
              {gdd.target_platforms && (
                <span className="px-2.5 py-0.5 rounded-full bg-dark-800/90 border border-dark-700 text-slate-300 text-[11px] font-medium backdrop-blur-md hidden sm:inline-block">
                  {gdd.target_platforms}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {idea.title}
            </h2>
          </div>
        </div>

        {/* ================= TAB NAVIGATION ================= */}
        <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-dark-800 shrink-0 bg-dark-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400/30'
                  : 'bg-dark-800/70 text-slate-300 hover:text-white hover:bg-dark-750'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Visão Geral do Projeto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mechanics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mechanics'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400/30'
                  : 'bg-dark-800/70 text-slate-300 hover:text-white hover:bg-dark-750'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Stack de Mecânicas ({totalMechs})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gdd')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gdd'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400/30'
                  : 'bg-dark-800/70 text-slate-300 hover:text-white hover:bg-dark-750'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>GDD / Design Detalhado</span>
            </button>
          </div>

          {/* Quick Summary Pill on the Right */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              {implementedCount}/{totalMechs} prontas
            </span>
            <span className="text-dark-700">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {integratedCount}/{totalMechs} integradas
            </span>
          </div>
        </div>

        {/* ================= TAB BODY ================= */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ==================== TAB 1: VISÃO GERAL (DEFAULT) ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Pitch Principal & Premissa */}
              <div className="bg-gradient-to-br from-violet-950/25 via-dark-950 to-dark-950 border border-violet-500/30 rounded-2xl p-5 sm:p-6 shadow-lg shadow-violet-500/5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pitch & Visão Criativa
                  </span>
                  {gdd.target_audience && (
                    <span className="text-xs text-slate-400 font-medium bg-dark-900/90 px-3 py-1 rounded-full border border-dark-800">
                      Público-Alvo: <strong className="text-slate-200">{gdd.target_audience}</strong>
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                  {idea.description || (
                    <span className="text-dark-600 italic">Nenhum pitch ou conceito cadastrado para esta ideia.</span>
                  )}
                </p>
              </div>

              {/* Ficha Técnica Executiva do Projeto */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  Ficha Técnica & Especificações
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1.5 mb-2">
                      <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
                      Gênero
                    </span>
                    <p className="text-sm font-bold text-white">
                      {gdd.genre || <span className="text-dark-600 font-normal italic">Não especificado</span>}
                    </p>
                  </div>

                  <div className="bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1.5 mb-2">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      Engine / Tecnologia
                    </span>
                    <p className="text-sm font-bold text-cyan-300">
                      {gdd.engine || <span className="text-dark-600 font-normal italic">Não especificada</span>}
                    </p>
                  </div>

                  <div className="bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1.5 mb-2">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Plataformas
                    </span>
                    <p className="text-sm font-bold text-white">
                      {gdd.target_platforms || <span className="text-dark-600 font-normal italic">Não especificadas</span>}
                    </p>
                  </div>

                  <div className="bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-colors">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1.5 mb-2">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Estilo Visual
                    </span>
                    <p className="text-sm font-bold text-white line-clamp-1" title={gdd.art_style}>
                      {gdd.art_style || <span className="text-dark-600 font-normal italic">Não especificado</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Destaque: USP & Core Gameplay Loop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* USP / Gancho */}
                <div className="bg-gradient-to-br from-amber-950/25 via-dark-950 to-dark-950 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Diferencial Único (USP / Hook)
                      </h4>
                      <p className="text-[11px] text-amber-400/80">O que torna este jogo especial e vendável</p>
                    </div>
                  </div>
                  <div>
                    {gdd.usp ? (
                      <p className="text-sm text-amber-100/90 leading-relaxed font-medium">
                        {gdd.usp}
                      </p>
                    ) : (
                      <p className="text-xs text-dark-600 italic">
                        Nenhum diferencial único (USP) detalhado ainda.
                      </p>
                    )}
                  </div>
                </div>

                {/* Core Gameplay Loop */}
                <div className="bg-gradient-to-br from-cyan-950/25 via-dark-950 to-dark-950 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-lg shadow-cyan-500/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                      <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Core Gameplay Loop
                      </h4>
                      <p className="text-[11px] text-cyan-400/80">Ciclo minuto a minuto do jogador</p>
                    </div>
                  </div>
                  <div>
                    {gdd.core_loop ? (
                      <p className="text-sm text-cyan-100/90 leading-relaxed font-medium whitespace-pre-line">
                        {gdd.core_loop}
                      </p>
                    ) : (
                      <p className="text-xs text-dark-600 italic">
                        Core loop de gameplay ainda não registrado.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Escopo MVP & Referências */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-950/20 via-dark-950 to-dark-950 border border-emerald-500/25 rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      <Layers className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Escopo do MVP (Primeira Demo Jogável)
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                    {gdd.mvp_scope || (
                      <span className="text-dark-600 italic">Escopo do MVP não definido.</span>
                    )}
                  </p>
                </div>

                <div className="bg-dark-950 border border-dark-800 rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                      <FileText className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Inspirações & Referências
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {gdd.references || (
                      <span className="text-dark-600 italic">Nenhuma referência registrada.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Painel de Progresso Técnico das Mecânicas (Com Call-to-Action) */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-violet-400" />
                      Status Técnico & Stack de Mecânicas
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {totalMechs === 0
                        ? 'Nenhuma mecânica vinculada ainda.'
                        : `${totalMechs} mecânica(s) compõem a arquitetura deste projeto.`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('mechanics')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-bold transition-all cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    <span>Ver e Gerenciar Mecânicas ({totalMechs})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Duas Barras de Progresso Executivas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="bg-dark-900 border border-dark-750 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Prontas no Catálogo
                      </span>
                      <span className="font-black text-white">
                        {implementedCount}/{totalMechs} ({implementedPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-dark-950 rounded-full overflow-hidden border border-dark-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${implementedPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-dark-900 border border-dark-750 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Integradas no Código do Jogo
                      </span>
                      <span className="font-black text-white">
                        {integratedCount}/{totalMechs} ({integratedPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-dark-950 rounded-full overflow-hidden border border-dark-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${integratedPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Preview das Mecânicas Interativo */}
                {totalMechs > 0 && (
                  <div className="pt-2 border-t border-dark-800/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Mecânicas Vinculadas (Clique para filtrar na aba):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {mechs.slice(0, 8).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setMechSearch(m.name);
                            setActiveTab('mechanics');
                          }}
                          title={`Clique para visualizar e gerenciar "${m.name}"`}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                            m.is_integrated
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                              : m.is_implemented
                              ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/25'
                              : 'bg-dark-900 text-slate-400 border-dark-750 hover:text-white'
                          }`}
                        >
                          {m.is_integrated ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : m.is_implemented ? (
                            <Sparkles className="w-3 h-3 text-cyan-300" />
                          ) : (
                            <Wrench className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{m.name}</span>
                        </button>
                      ))}
                      {totalMechs > 8 && (
                        <button
                          type="button"
                          onClick={() => {
                            setMechSearch('');
                            setActiveTab('mechanics');
                          }}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 text-violet-300 border border-dark-750 cursor-pointer"
                        >
                          +{totalMechs - 8} outras mecânicas...
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: MECÂNICAS & INTEGRAÇÃO ==================== */}
          {activeTab === 'mechanics' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Barra de Filtros e Busca da Mecânica */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-dark-950 border border-dark-800 p-3 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-txt-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={mechSearch}
                    onChange={(e) => setMechSearch(e.target.value)}
                    placeholder="Filtrar mecânicas deste jogo..."
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500"
                  />
                  {mechSearch && (
                    <button
                      type="button"
                      onClick={() => setMechSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                      title="Limpar filtro"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setMechStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mechStatusFilter === 'all'
                        ? 'bg-violet-600 text-white'
                        : 'bg-dark-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    Todas ({totalMechs})
                  </button>

                  <button
                    type="button"
                    onClick={() => setMechStatusFilter('integrated')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mechStatusFilter === 'integrated'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-dark-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    Integradas ({integratedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setMechStatusFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mechStatusFilter === 'pending'
                        ? 'bg-amber-600 text-white'
                        : 'bg-dark-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    A Integrar ({pendingIntegrationCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setMechStatusFilter('implemented')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mechStatusFilter === 'implemented'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-dark-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    Prontas ({implementedCount})
                  </button>
                </div>
              </div>

              {/* Lista das Mecânicas */}
              {totalMechs === 0 ? (
                <div className="p-12 text-center bg-dark-950 border border-dark-800 rounded-2xl">
                  <Cpu className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">Nenhuma mecânica vinculada</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Este jogo ainda não possui mecânicas associadas. Clique no botão de edição para selecionar as mecânicas que ele usará.
                  </p>
                  <button
                    type="button"
                    onClick={() => onEdit(idea)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-600/30"
                  >
                    Vincular Mecânicas
                  </button>
                </div>
              ) : filteredMechs.length === 0 ? (
                <div className="p-10 text-center bg-dark-950 border border-dark-800 rounded-2xl">
                  <p className="text-xs text-slate-400">
                    Nenhuma mecânica corresponde aos filtros de busca aplicados.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMechs.map((m) => {
                    const gif = resolveMedia(m.gif_url);

                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          m.is_integrated
                            ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/15'
                            : 'bg-dark-950 border-dark-800 hover:border-dark-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3.5">
                            {gif ? (
                              <img
                                src={gif}
                                alt={m.name}
                                className="w-14 h-14 rounded-xl object-cover border border-dark-750 shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-center text-slate-500 shrink-0 shadow-sm">
                                <Cpu className="w-7 h-7" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white">{m.name}</h4>

                                {/* Status Global no Catálogo */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    onToggleMechanicImplemented && onToggleMechanicImplemented(m)
                                  }
                                  title="Clique para alternar o status global desta mecânica no catálogo"
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
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
                                      <span>A Programar</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {m.description && (
                                <p className="text-xs text-txt-muted leading-relaxed">
                                  {m.description}
                                </p>
                              )}

                              {m.notes && (
                                <div className="mt-2 text-xs text-violet-300 bg-violet-950/40 px-3 py-1.5 rounded-xl border border-violet-500/20 inline-block">
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
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                                m.is_integrated
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/20'
                                  : 'bg-dark-900 hover:bg-dark-800 text-slate-300 border-dark-700 hover:border-emerald-500/40'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {m.is_integrated ? 'Integrada no Jogo' : 'Marcar como Integrada'}
                              </span>
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

          {/* ==================== TAB 3: GDD COMPLETO ==================== */}
          {activeTab === 'gdd' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Gameplay & Regras */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Mecânicas, Regras & Core Loop
                </h4>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Core Gameplay Loop:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.core_loop || <span className="text-dark-600 italic">Não especificado</span>}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Condições de Vitória e Derrota:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.win_loss_conditions || <span className="text-dark-600 italic">Não especificado</span>}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Sistemas de Progressão, Upgrades & Economia:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.progression_systems || <span className="text-dark-600 italic">Não especificado</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arte, Áudio e Narrativa */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Estética, Áudio & Narrativa
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Estilo Visual & Arte:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.art_style || <span className="text-dark-600 italic">Não especificado</span>}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Direção de Áudio & Trilha:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.audio_style || <span className="text-dark-600 italic">Não especificado</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Narrativa, Universo & Lore:
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                    {gdd.narrative_setting || <span className="text-dark-600 italic">Não especificado</span>}
                  </p>
                </div>
              </div>

              {/* Produção & Escopo MVP */}
              <div className="bg-dark-950 border border-dark-800 rounded-2xl p-5 sm:p-6 space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Planejamento de Produção & MVP
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Engine / Tecnologia:
                    </span>
                    <p className="text-sm font-bold text-white bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.engine || <span className="text-dark-600 font-normal italic">Não especificada</span>}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Diferencial Único (USP):
                    </span>
                    <p className="text-sm font-medium text-amber-300 bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                      {gdd.usp || <span className="text-dark-600 font-normal italic">Não especificado</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5">
                    Escopo do MVP (Primeira Demo Jogável):
                  </span>
                  <p className="text-sm text-emerald-200/95 leading-relaxed bg-dark-900 p-4 sm:p-5 rounded-2xl border border-dark-800">
                    {gdd.mvp_scope || <span className="text-dark-600 italic">Não especificado</span>}
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
