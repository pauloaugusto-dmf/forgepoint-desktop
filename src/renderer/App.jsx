import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Cpu,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Wrench,
  Edit3,
  Trash2,
  Layers,
  Gamepad2,
  Filter,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

import TitleBar from './components/TitleBar';
import GameIdeaModal from './components/GameIdeaModal';
import GameIdeaDetailModal from './components/GameIdeaDetailModal';
import MechanicModal from './components/MechanicModal';
import BackupModal from './components/BackupModal';
import { resolveMedia } from './utils';

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ideas'); // 'ideas' | 'mechanics'
  const [search, setSearch] = useState('');
  const [mechanicFilter, setMechanicFilter] = useState('all'); // 'all' | 'implemented' | 'pending'

  // Modals state
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailIdea, setDetailIdea] = useState(null);

  const [isMechanicModalOpen, setIsMechanicModalOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allIdeas, allMechs] = await Promise.all([
        window.api.getGameIdeas(),
        window.api.getMechanics(),
      ]);
      setIdeas(allIdeas || []);
      setMechanics(allMechs || []);
    } catch (err) {
      toast.error('Erro ao carregar dados locais: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stats / KPIs
  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const totalMechanics = mechanics.length;
    const implementedMechanics = mechanics.filter((m) => m.is_implemented).length;
    const pendingMechanics = totalMechanics - implementedMechanics;

    return {
      totalIdeas,
      totalMechanics,
      implementedMechanics,
      pendingMechanics,
    };
  }, [ideas, mechanics]);

  // Filtragem de Ideias
  const filteredIdeas = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ideas;
    return ideas.filter(
      (idea) =>
        idea.title.toLowerCase().includes(q) ||
        (idea.description && idea.description.toLowerCase().includes(q)) ||
        (idea.mechanics &&
          idea.mechanics.some((m) => m.name.toLowerCase().includes(q)))
    );
  }, [ideas, search]);

  // Filtragem de Mecânicas
  const filteredMechanics = useMemo(() => {
    const q = search.toLowerCase().trim();
    return mechanics.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.used_in_games &&
          m.used_in_games.some((g) => g.title.toLowerCase().includes(q)));

      const matchesFilter =
        mechanicFilter === 'all' ||
        (mechanicFilter === 'implemented' && m.is_implemented) ||
        (mechanicFilter === 'pending' && !m.is_implemented);

      return matchesSearch && matchesFilter;
    });
  }, [mechanics, search, mechanicFilter]);

  // ==================== HANDLERS: IDEIAS ====================

  const handleOpenNewIdea = () => {
    setSelectedIdea(null);
    setIsIdeaModalOpen(true);
  };

  const handleEditIdea = (idea) => {
    setSelectedIdea(idea);
    setIsIdeaModalOpen(true);
  };

  const handleSaveIdea = async (payload, mechanicsPayload, id) => {
    try {
      if (id) {
        await window.api.updateGameIdea(id, payload, mechanicsPayload);
        toast.success(`Ideia "${payload.title}" atualizada!`);
      } else {
        await window.api.addGameIdea(payload, mechanicsPayload);
        toast.success(`Ideia "${payload.title}" criada com sucesso!`);
      }
      await loadData();
      if (detailIdea && detailIdea.id === id) {
        const refreshed = await window.api.getGameIdeaById(id);
        setDetailIdea(refreshed);
      }
    } catch (err) {
      toast.error('Erro ao salvar ideia de jogo: ' + err.message);
      throw err;
    }
  };

  const handleDeleteIdea = async (idea) => {
    const confirm = window.confirm(`Deseja realmente excluir a ideia de jogo "${idea.title}"?`);
    if (!confirm) return;

    try {
      await window.api.deleteGameIdea(idea.id);
      toast.success(`Ideia "${idea.title}" excluída.`);
      if (detailIdea && detailIdea.id === idea.id) {
        setIsDetailModalOpen(false);
        setDetailIdea(null);
      }
      await loadData();
    } catch (err) {
      toast.error('Erro ao excluir ideia: ' + err.message);
    }
  };

  const handleSelectIdea = (idea) => {
    setDetailIdea(idea);
    setIsDetailModalOpen(true);
  };

  const handleToggleIntegration = async (ideaId, mechanicId, isIntegrated, notes = null) => {
    try {
      const updated = await window.api.patchIntegration(ideaId, mechanicId, isIntegrated, notes);
      setDetailIdea(updated);
      await loadData();
      toast.success(
        isIntegrated
          ? 'Mecânica marcada como integrada no jogo!'
          : 'Integração desmarcada neste jogo.'
      );
    } catch (err) {
      toast.error('Erro ao atualizar integração: ' + err.message);
    }
  };

  // ==================== HANDLERS: MECÂNICAS ====================

  const handleOpenNewMechanic = () => {
    setSelectedMechanic(null);
    setIsMechanicModalOpen(true);
  };

  const handleEditMechanic = (mech) => {
    setSelectedMechanic(mech);
    setIsMechanicModalOpen(true);
  };

  const handleSaveMechanic = async (payload, id) => {
    try {
      if (id) {
        await window.api.updateMechanic(id, payload);
        toast.success(`Mecânica "${payload.name}" atualizada!`);
      } else {
        await window.api.addMechanic(payload);
        toast.success(`Mecânica "${payload.name}" adicionada ao catálogo!`);
      }
      await loadData();
    } catch (err) {
      toast.error('Erro ao salvar mecânica: ' + err.message);
      throw err;
    }
  };

  const handleQuickCreateMechanic = async (payload) => {
    try {
      const created = await window.api.addMechanic(payload);
      await loadData();
      return created;
    } catch (err) {
      toast.error('Erro ao criar mecânica rápida: ' + err.message);
      throw err;
    }
  };

  const handleQuickUpdateMechanic = async (id, payload) => {
    try {
      const updated = await window.api.updateMechanic(id, payload);
      await loadData();
      return updated;
    } catch (err) {
      toast.error('Erro ao atualizar mecânica: ' + err.message);
      throw err;
    }
  };

  const handleToggleMechanicImplemented = async (mech) => {
    try {
      await window.api.toggleMechanicImplemented(mech.id, !mech.is_implemented);
      await loadData();
      if (detailIdea) {
        const refreshed = await window.api.getGameIdeaById(detailIdea.id);
        setDetailIdea(refreshed);
      }
      toast.success(
        !mech.is_implemented
          ? `"${mech.name}" marcada como implementada no catálogo!`
          : `"${mech.name}" marcada como a programar.`
      );
    } catch (err) {
      toast.error('Erro ao alternar status da mecânica: ' + err.message);
    }
  };

  const handleDeleteMechanic = async (mech) => {
    const confirm = window.confirm(`Deseja realmente remover a mecânica "${mech.name}"?`);
    if (!confirm) return;

    try {
      await window.api.deleteMechanic(mech.id);
      toast.success(`Mecânica "${mech.name}" removida do catálogo.`);
      await loadData();
    } catch (err) {
      toast.error('Erro ao excluir mecânica: ' + err.message);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-950 text-gray-100 overflow-hidden">
      {/* TitleBar Superior */}
      <TitleBar
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onNewIdea={handleOpenNewIdea}
        onNewMechanic={handleOpenNewMechanic}
      />

      {/* Conteúdo Principal com Scroll */}
      <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
        <div className="max-w-[1720px] mx-auto w-full space-y-7">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('ideas')}
            className={`p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left border cursor-pointer select-none ${
              activeTab === 'ideas'
                ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/15'
                : 'bg-dark-900 border-dark-800 hover:border-dark-700 hover:-translate-y-0.5'
            }`}
          >
            <div className="p-3 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.totalIdeas}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Ideias de Jogos
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mechanics');
              setMechanicFilter('all');
            }}
            className={`p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left border cursor-pointer select-none ${
              activeTab === 'mechanics' && mechanicFilter === 'all'
                ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/15'
                : 'bg-dark-900 border-dark-800 hover:border-dark-700 hover:-translate-y-0.5'
            }`}
          >
            <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.totalMechanics}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Total de Mecânicas
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mechanics');
              setMechanicFilter(mechanicFilter === 'implemented' ? 'all' : 'implemented');
            }}
            className={`p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left border cursor-pointer select-none ${
              activeTab === 'mechanics' && mechanicFilter === 'implemented'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/15'
                : 'bg-dark-900 border-dark-800 hover:border-dark-700 hover:-translate-y-0.5'
            }`}
          >
            <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.implementedMechanics}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Prontas p/ Reusar
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mechanics');
              setMechanicFilter(mechanicFilter === 'pending' ? 'all' : 'pending');
            }}
            className={`p-4 rounded-2xl flex items-center gap-3.5 transition-all text-left border cursor-pointer select-none ${
              activeTab === 'mechanics' && mechanicFilter === 'pending'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/15'
                : 'bg-dark-900 border-dark-800 hover:border-dark-700 hover:-translate-y-0.5'
            }`}
          >
            <div className="p-3 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.pendingMechanics}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                A Programar
              </div>
            </div>
          </button>
        </div>

        {/* Barra de Controles e Pesquisa */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-txt-muted absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'ideas'
                  ? 'Buscar ideias de jogos ou mecânicas vinculadas...'
                  : 'Buscar mecânicas por nome, descrição ou jogo...'
              }
              className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'mechanics' && (
              <div className="flex items-center bg-dark-950 p-1 rounded-xl border border-dark-750 gap-1">
                <button
                  type="button"
                  onClick={() => setMechanicFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mechanicFilter === 'all'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setMechanicFilter('implemented')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mechanicFilter === 'implemented'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Implementadas
                </button>
                <button
                  type="button"
                  onClick={() => setMechanicFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mechanicFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  A Programar
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenNewMechanic}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Mecânica</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewIdea}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Ideia de Jogo</span>
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-72 rounded-3xl bg-dark-900 border border-dark-800 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === 'ideas' ? (
          /* ================= ABA DE IDEIAS DE JOGOS ================= */
          filteredIdeas.length === 0 ? (
            <div className="py-20 text-center bg-dark-900 border border-dark-800 rounded-3xl p-8">
              <Code2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhuma ideia de jogo encontrada
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                {ideas.length === 0
                  ? 'Comece cadastrando sua primeira ideia de jogo e selecione quais mecânicas ela utilizará!'
                  : 'Nenhuma ideia corresponde ao filtro de busca.'}
              </p>
              {ideas.length === 0 && (
                <button
                  onClick={handleOpenNewIdea}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-600/30"
                >
                  Criar Primeira Ideia de Jogo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {filteredIdeas.map((idea) => {
                const mechs = idea.mechanics || [];
                const totalMechs = mechs.length;
                const implementedCount = mechs.filter((m) => m.is_implemented).length;
                const integratedCount = mechs.filter((m) => m.is_integrated).length;
                const readyPct =
                  totalMechs > 0 ? Math.round((implementedCount / totalMechs) * 100) : 0;
                const imgUrl = resolveMedia(idea.image_url);

                return (
                  <div
                    key={idea.id}
                    onClick={() => handleSelectIdea(idea)}
                    className="group bg-dark-900 border border-dark-800 hover:border-violet-500/60 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer"
                  >
                    <div>
                      {/* Cover Image */}
                      <div className="relative h-44 bg-dark-950 overflow-hidden border-b border-dark-800">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={idea.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-950/50 via-dark-900 to-cyan-950/40 flex items-center justify-center">
                            <Gamepad2 className="w-12 h-12 text-violet-400/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />

                        {/* Quick Action Buttons */}
                        <div
                          className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleEditIdea(idea)}
                            className="p-2 rounded-xl bg-black/75 text-slate-200 hover:text-white hover:bg-violet-600 transition-colors"
                            title="Editar Ideia"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIdea(idea)}
                            className="p-2 rounded-xl bg-black/75 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                            title="Excluir Ideia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Badges de Prontidão */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                            {implementedCount}/{totalMechs} prontas no catálogo
                          </span>
                          {totalMechs > 0 && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                              {integratedCount}/{totalMechs} integradas
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Título e Descrição */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                          {idea.title}
                        </h3>

                        {idea.description ? (
                          <p className="text-xs text-txt-muted line-clamp-2 leading-relaxed">
                            {idea.description}
                          </p>
                        ) : (
                          <p className="text-xs text-dark-600 italic">Sem descrição informada.</p>
                        )}

                        {/* Pills de Mecânicas */}
                        <div className="pt-2 space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Mecânicas ({totalMechs})</span>
                            {totalMechs > 0 && (
                              <span className="text-cyan-400">{readyPct}% reaproveitável</span>
                            )}
                          </div>

                          {totalMechs === 0 ? (
                            <div className="text-xs text-txt-muted italic">
                              Nenhuma mecânica marcada
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {mechs.map((m) => (
                                <span
                                  key={m.id}
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                                    m.is_integrated
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                      : m.is_implemented
                                      ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/40'
                                      : 'bg-dark-950 text-slate-400 border-dark-700'
                                  }`}
                                >
                                  {m.is_integrated ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  ) : m.is_implemented ? (
                                    <Sparkles className="w-3 h-3 text-cyan-300 shrink-0" />
                                  ) : (
                                    <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
                                  )}
                                  <span>{m.name}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso no Rodapé do Card */}
                    <div className="px-5 pb-4 pt-2">
                      <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${readyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ================= ABA DO CATÁLOGO DE MECÂNICAS ================= */
          filteredMechanics.length === 0 ? (
            <div className="py-20 text-center bg-dark-900 border border-dark-800 rounded-3xl p-8">
              <Cpu className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhuma mecânica encontrada
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                {mechanics.length === 0
                  ? 'Seu catálogo ainda está vazio. Cadastre mecânicas como Pulo, State Machine ou Tiro com um GIF demonstrativo!'
                  : 'Nenhuma mecânica corresponde aos filtros aplicados.'}
              </p>
              {mechanics.length === 0 && (
                <button
                  onClick={handleOpenNewMechanic}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-md shadow-cyan-600/30"
                >
                  Cadastrar Primeira Mecânica
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {filteredMechanics.map((mech) => {
                const gifUrl = resolveMedia(mech.gif_url);
                const usedIn = mech.used_in_games || [];

                return (
                  <div
                    key={mech.id}
                    className={`bg-dark-900 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all ${
                      mech.is_implemented
                        ? 'border-emerald-500/35 hover:border-emerald-500/60'
                        : 'border-dark-800 hover:border-cyan-500/50'
                    }`}
                  >
                    <div>
                      {/* GIF Showcase */}
                      <div className="relative h-48 bg-dark-950 border-b border-dark-800 flex items-center justify-center overflow-hidden">
                        {gifUrl ? (
                          <img
                            src={gifUrl}
                            alt={mech.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-dark-600">
                            <Cpu className="w-10 h-10" />
                            <span className="text-[11px] font-semibold">Sem GIF demonstrativo</span>
                          </div>
                        )}

                        {/* Status Toggle Pill */}
                        <div className="absolute top-3 left-3">
                          <button
                            type="button"
                            onClick={() => handleToggleMechanicImplemented(mech)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                              mech.is_implemented
                                ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                                : 'bg-amber-950/85 text-amber-300 border-amber-500/50 hover:bg-amber-900'
                            }`}
                            title="Clique para alternar entre Implementada e A Programar"
                          >
                            {mech.is_implemented ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Implementada</span>
                              </>
                            ) : (
                              <>
                                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                                <span>A Programar</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Quick Edit/Delete */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditMechanic(mech)}
                            className="p-2 rounded-xl bg-black/75 text-slate-200 hover:text-white hover:bg-cyan-600 transition-colors"
                            title="Editar Mecânica"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMechanic(mech)}
                            className="p-2 rounded-xl bg-black/75 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                            title="Excluir Mecânica"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Info da Mecânica */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-bold text-white">{mech.name}</h3>
                        {mech.description ? (
                          <p className="text-xs text-txt-muted leading-relaxed">
                            {mech.description}
                          </p>
                        ) : (
                          <p className="text-xs text-dark-600 italic">Sem descrição técnica.</p>
                        )}

                        {/* Usada em Jogos */}
                        <div className="pt-2 border-t border-dark-800 space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-violet-400" />
                            <span>
                              Usada em {usedIn.length} {usedIn.length === 1 ? 'jogo' : 'jogos'}
                            </span>
                          </div>

                          {usedIn.length === 0 ? (
                            <p className="text-xs text-txt-muted italic">
                              Ainda não vinculada a nenhuma ideia de jogo.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {usedIn.map((gameRef) => (
                                <span
                                  key={gameRef.game_idea_id}
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                                    gameRef.is_integrated
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                                      : 'bg-violet-500/15 text-violet-200 border-violet-500/35'
                                  }`}
                                >
                                  {gameRef.is_integrated && (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  )}
                                  <span>{gameRef.title}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        </div>
      </main>

      {/* Modais */}
      <GameIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onSave={handleSaveIdea}
        onQuickCreateMechanic={handleQuickCreateMechanic}
        onQuickUpdateMechanic={handleQuickUpdateMechanic}
        initialIdea={selectedIdea}
        mechanics={mechanics}
      />

      <GameIdeaDetailModal
        isOpen={isDetailModalOpen}
        idea={detailIdea}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(idea) => {
          setIsDetailModalOpen(false);
          handleEditIdea(idea);
        }}
        onDelete={(idea) => {
          handleDeleteIdea(idea);
        }}
        onToggleIntegration={handleToggleIntegration}
        onToggleMechanicImplemented={handleToggleMechanicImplemented}
      />

      <MechanicModal
        isOpen={isMechanicModalOpen}
        onClose={() => setIsMechanicModalOpen(false)}
        onSave={handleSaveMechanic}
        initialMechanic={selectedMechanic}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRefresh={loadData}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
