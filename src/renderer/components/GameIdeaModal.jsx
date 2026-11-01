import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Code2,
  Upload,
  Plus,
  CheckCircle2,
  Cpu,
  Search,
  Sparkles,
  Wrench,
  FileJson,
  Download,
  BookOpen,
  Gamepad2,
  Palette,
  FileText,
} from 'lucide-react';
import { resolveMedia } from '../utils';

const DEFAULT_GDD = {
  genre: '',
  target_platforms: '',
  target_audience: '',
  usp: '',
  references: '',
  core_loop: '',
  win_loss_conditions: '',
  progression_systems: '',
  art_style: '',
  audio_style: '',
  narrative_setting: '',
  engine: '',
  mvp_scope: '',
};

export default function GameIdeaModal({
  isOpen,
  onClose,
  onSave,
  onQuickCreateMechanic,
  initialIdea = null,
  mechanics = [],
}) {
  const [activeTab, setActiveTab] = useState('concept'); // 'concept' | 'gameplay' | 'mechanics' | 'art_tech'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    selectedMechanics: {}, // { [id]: { is_integrated: boolean, notes: string } }
    gdd: { ...DEFAULT_GDD },
  });

  const [mechanicSearch, setMechanicSearch] = useState('');
  const [quickMechName, setQuickMechName] = useState('');
  const [quickMechImplemented, setQuickMechImplemented] = useState(false);
  const [creatingQuickMech, setCreatingQuickMech] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialIdea) {
      const selectedMap = {};
      if (Array.isArray(initialIdea.mechanics)) {
        initialIdea.mechanics.forEach((m) => {
          selectedMap[m.id] = {
            is_integrated: Boolean(m.is_integrated),
            notes: m.notes || '',
          };
        });
      }

      setFormData({
        title: initialIdea.title || '',
        description: initialIdea.description || '',
        image_url: initialIdea.image_url || '',
        selectedMechanics: selectedMap,
        gdd: {
          ...DEFAULT_GDD,
          ...(initialIdea.gdd || {}),
        },
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        selectedMechanics: {},
        gdd: { ...DEFAULT_GDD },
      });
    }
    setActiveTab('concept');
    setMechanicSearch('');
    setQuickMechName('');
    setQuickMechImplemented(false);
    setError('');
    setImportSuccess('');
  }, [initialIdea, isOpen]);

  if (!isOpen) return null;

  const updateGddField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      gdd: {
        ...prev.gdd,
        [field]: value,
      },
    }));
  };

  const toggleMechanic = (mechanicId) => {
    setFormData((prev) => {
      const next = { ...prev.selectedMechanics };
      if (next[mechanicId]) {
        delete next[mechanicId];
      } else {
        next[mechanicId] = { is_integrated: false, notes: '' };
      }
      return { ...prev, selectedMechanics: next };
    });
  };

  const updateMechanicLink = (mechanicId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      selectedMechanics: {
        ...prev.selectedMechanics,
        [mechanicId]: {
          ...prev.selectedMechanics[mechanicId],
          [field]: value,
        },
      },
    }));
  };

  const handleSelectLocalImage = async () => {
    try {
      const filePath = await window.api.selectMedia();
      if (filePath) {
        setFormData((prev) => ({ ...prev, image_url: filePath }));
      }
    } catch (err) {
      setError('Falha ao selecionar imagem: ' + err.message);
    }
  };

  const handleQuickAddMechanic = async () => {
    if (!quickMechName.trim() || !onQuickCreateMechanic) return;
    setCreatingQuickMech(true);
    try {
      const created = await onQuickCreateMechanic({
        name: quickMechName.trim(),
        description: null,
        gif_url: null,
        is_implemented: quickMechImplemented,
      });
      if (created && created.id) {
        toggleMechanic(created.id);
        setQuickMechName('');
        setQuickMechImplemented(false);
      }
    } catch (err) {
      setError(err.message || 'Falha ao criar mecânica rápida.');
    } finally {
      setCreatingQuickMech(false);
    }
  };

  // ==================== IMPORTAÇÃO INTELIGENTE DE JSON ====================

  const handleImportJsonFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setImportSuccess('');

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const root = json.game || json.idea || json.gdd || json;
      const gddData = json.gdd || root.gdd || {};

      const importedTitle = root.title || root.titulo || root.name || root.nome || '';
      const importedDescription =
        root.description ||
        root.descricao ||
        root.pitch ||
        root.concept ||
        root.conceito ||
        '';
      const importedImageUrl = root.image_url || root.imageUrl || root.capa || root.image || '';

      const newGdd = {
        genre: gddData.genre || root.genre || root.genero || '',
        target_platforms:
          gddData.target_platforms || root.target_platforms || root.platforms || root.plataformas || '',
        target_audience:
          gddData.target_audience || root.target_audience || root.publico_alvo || root.publicoAlvo || '',
        usp: gddData.usp || root.usp || root.diferencial || root.hook || '',
        references:
          gddData.references || root.references || root.referencias || root.inspiracoes || '',
        core_loop: gddData.core_loop || root.core_loop || root.coreLoop || root.loop || '',
        win_loss_conditions:
          gddData.win_loss_conditions ||
          root.win_loss_conditions ||
          root.regras ||
          root.condicoes_vitoria_derrota ||
          '',
        progression_systems:
          gddData.progression_systems ||
          root.progression_systems ||
          root.progressao ||
          root.economia ||
          '',
        art_style: gddData.art_style || root.art_style || root.arte || root.estilo_visual || '',
        audio_style:
          gddData.audio_style || root.audio_style || root.audio || root.trilha || root.musica || '',
        narrative_setting:
          gddData.narrative_setting ||
          root.narrative_setting ||
          root.lore ||
          root.historia ||
          root.narrativa ||
          root.ambientacao ||
          '',
        engine: gddData.engine || root.engine || root.motor || '',
        mvp_scope:
          gddData.mvp_scope || root.mvp_scope || root.escopo_mvp || root.escopo || root.mvp || '',
      };

      // Mapeamento e vinculação de mecânicas do JSON
      const rawMechanics =
        json.mechanics || root.mechanics || json.mecanicas || root.mecanicas || [];
      const updatedSelectedMechs = { ...formData.selectedMechanics };
      let linkedCount = 0;

      if (Array.isArray(rawMechanics)) {
        for (const item of rawMechanics) {
          const mechName = typeof item === 'string' ? item.trim() : item.name?.trim();
          if (!mechName) continue;

          // Busca se já existe no catálogo
          let matched = mechanics.find(
            (m) => m.name.toLowerCase() === mechName.toLowerCase()
          );

          // Se não existir e puder criar automaticamente
          if (!matched && onQuickCreateMechanic) {
            try {
              matched = await onQuickCreateMechanic({
                name: mechName,
                description: item.description || null,
                gif_url: null,
                is_implemented: Boolean(item.is_implemented),
              });
            } catch (err) {
              console.warn('Falha ao auto-criar mecânica importada:', mechName, err);
            }
          }

          if (matched && matched.id) {
            updatedSelectedMechs[matched.id] = {
              is_integrated: typeof item === 'object' ? Boolean(item.is_integrated) : false,
              notes: typeof item === 'object' && item.notes ? item.notes.trim() : '',
            };
            linkedCount++;
          }
        }
      }

      setFormData((prev) => ({
        ...prev,
        title: importedTitle || prev.title,
        description: importedDescription || prev.description,
        image_url: importedImageUrl || prev.image_url,
        selectedMechanics: updatedSelectedMechs,
        gdd: {
          ...prev.gdd,
          ...Object.fromEntries(
            Object.entries(newGdd).filter(([_, v]) => v && typeof v === 'string' && v.trim() !== '')
          ),
        },
      }));

      setImportSuccess(
        `GDD importado com sucesso! Informações carregadas e ${linkedCount} mecânica(s) vinculada(s).`
      );
    } catch (err) {
      setError('Erro ao importar JSON: ' + err.message);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const template = {
      title: 'Nome do Seu Jogo',
      pitch: 'Breve resumo de 1 ou 2 parágrafos com o conceito geral e premissa do jogo.',
      image_url: '',
      gdd: {
        genre: 'Metroidvania / Ação 2D',
        target_platforms: 'PC (Steam), Nintendo Switch',
        target_audience: 'Fãs de Hollow Knight e Dead Cells',
        usp: 'Diferencial único: mecânica inovadora que ninguém mais tem.',
        references: 'Hollow Knight, Celeste, Katana Zero',
        core_loop: 'Explorar salas -> Coletar recursos -> Enfrentar inimigos -> Melhorar habilidades',
        win_loss_conditions: 'Vitória: derrotar o chefe final. Derrota: perder toda a vida.',
        progression_systems: 'Árvore de habilidades, upgrades de equipamentos e itens passivos.',
        art_style: 'Pixel Art 16-bit com iluminação dinâmica.',
        audio_style: 'Trilha sonora orquestral/synthwave com SFX imersivos.',
        narrative_setting: 'Sinopse e mitologia do universo do jogo.',
        engine: 'Godot 4.3 / Unity',
        mvp_scope: '1 fase jogável, 3 inimigos, 1 chefe e movimentação base concluída.',
      },
      mechanics: [
        {
          name: 'Pulo & Gravidade',
          is_integrated: true,
          notes: 'Pulo com sustentação e salto duplo desbloqueável',
        },
        {
          name: 'Dash / Esquiva',
          is_integrated: false,
          notes: 'Frames de invulnerabilidade ao passar por projéteis',
        },
        {
          name: 'State Machine (FSM)',
          is_integrated: true,
          notes: 'Máquina de estados para gerenciar movimentação e combate',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_gdd_forgepoint.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('O título da ideia de jogo é obrigatório.');
      setActiveTab('concept');
      return;
    }

    setSaving(true);
    setError('');

    const mechanicsPayload = Object.entries(formData.selectedMechanics).map(
      ([mechanicId, config]) => ({
        mechanic_id: Number(mechanicId),
        is_integrated: Boolean(config.is_integrated),
        notes: config.notes ? config.notes.trim() : null,
      })
    );

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() ? formData.description.trim() : null,
      image_url: formData.image_url.trim() ? formData.image_url.trim() : null,
      gdd: formData.gdd,
    };

    try {
      await onSave(payload, mechanicsPayload, initialIdea?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Falha ao salvar ideia de jogo.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMechanics = mechanics.filter((m) =>
    m.name.toLowerCase().includes(mechanicSearch.toLowerCase().trim())
  );

  const selectedCount = Object.keys(formData.selectedMechanics).length;
  const previewImage = resolveMedia(formData.image_url);

  // Contadores de campos preenchidos por aba para feedback visual
  const conceptFilled = [
    formData.title,
    formData.description,
    formData.gdd.genre,
    formData.gdd.target_platforms,
    formData.gdd.target_audience,
    formData.gdd.usp,
    formData.gdd.references,
  ].filter((v) => v && v.trim()).length;

  const gameplayFilled = [
    formData.gdd.core_loop,
    formData.gdd.win_loss_conditions,
    formData.gdd.progression_systems,
  ].filter((v) => v && v.trim()).length;

  const artTechFilled = [
    formData.gdd.art_style,
    formData.gdd.audio_style,
    formData.gdd.narrative_setting,
    formData.gdd.engine,
    formData.gdd.mvp_scope,
  ].filter((v) => v && v.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-dark-900 border border-dark-750 rounded-3xl shadow-2xl p-6 md:p-8 my-8 relative max-h-[94vh] flex flex-col">
        {/* Header com botões de Importação de JSON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-750 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/15 text-violet-300 rounded-xl border border-violet-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialIdea ? 'Editar Ideia & GDD' : 'Novo Jogo & GDD Completo'}
              </h2>
              <p className="text-xs text-txt-muted">
                Estruture o Game Design Document e vincule o stack de mecânicas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Input escondido para selecionar arquivo JSON */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Importar um arquivo JSON com todas as informações do GDD"
            >
              <FileJson className="w-4 h-4 text-violet-400" />
              <span>Importar GDD (.json)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 border border-dark-700 text-xs font-medium transition-colors"
              title="Baixar modelo JSON para preencher ou alimentar ChatGPT/Claude/Gemini"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Modelo JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-dark-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs shrink-0 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              <X size={14} />
            </button>
          </div>
        )}

        {importSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs shrink-0 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} />
              {importSuccess}
            </span>
            <button
              onClick={() => setImportSuccess('')}
              className="text-emerald-400 hover:text-emerald-200"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-dark-800 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('concept')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'concept'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-dark-800/80 text-slate-400 hover:text-white hover:bg-dark-750'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Conceito & Pitch</span>
            {conceptFilled > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white">
                {conceptFilled}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gameplay')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'gameplay'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-dark-800/80 text-slate-400 hover:text-white hover:bg-dark-750'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>2. Core Loop & Regras</span>
            {gameplayFilled > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white">
                {gameplayFilled}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mechanics'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-dark-800/80 text-slate-400 hover:text-white hover:bg-dark-750'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Mecânicas ({selectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('art_tech')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'art_tech'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-dark-800/80 text-slate-400 hover:text-white hover:bg-dark-750'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Arte, Lore & Técnico</span>
            {artTechFilled > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white">
                {artTechFilled}
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-5 overflow-y-auto pr-1 flex-1">
          {/* ==================== ABA 1: CONCEITO & PITCH ==================== */}
          {activeTab === 'concept' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Título do Jogo / Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Neon Protocol, Hollow Echoes, Chrono Blade..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Grid: Gênero, Plataformas & Público */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Gênero & Subgênero
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.genre}
                    onChange={(e) => updateGddField('genre', e.target.value)}
                    placeholder="Ex: Metroidvania 2D, Roguelite..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Plataformas-Alvo
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.target_platforms}
                    onChange={(e) => updateGddField('target_platforms', e.target.value)}
                    placeholder="Ex: PC (Steam), Switch, Mobile..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Público-Alvo
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.target_audience}
                    onChange={(e) => updateGddField('target_audience', e.target.value)}
                    placeholder="Ex: Fãs de Dead Cells e Katana Zero..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* USP (Diferencial Único) & Referências */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Diferencial Único (USP / Hook)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.usp}
                    onChange={(e) => updateGddField('usp', e.target.value)}
                    placeholder="O que torna este jogo único no mercado?"
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Inspirações & Referências
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.references}
                    onChange={(e) => updateGddField('references', e.target.value)}
                    placeholder="Ex: Celeste, Dead Cells, Katana Zero..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Pitch / Conceito Geral */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Conceito Geral / Pitch do Jogo
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a premissa, gameplay core loop, influências e o diferencial do jogo..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {/* Imagem de Capa */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Imagem de Capa / Concept Art
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="URL externa ou selecione um arquivo local..."
                    className="flex-1 bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSelectLocalImage}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-bold text-violet-300 border border-dark-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Arquivo Local</span>
                  </button>
                </div>

                {previewImage && (
                  <div className="mt-3 relative h-36 bg-dark-950 rounded-2xl overflow-hidden border border-dark-750">
                    <img
                      src={previewImage}
                      alt="Capa da Ideia"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== ABA 2: GAMEPLAY & REGRAS ==================== */}
          {activeTab === 'gameplay' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Core Loop */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center gap-1.5">
                  <Gamepad2 size={14} />
                  <span>Core Gameplay Loop (Segundo a Segundo / Minuto a Minuto)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.gdd.core_loop}
                  onChange={(e) => updateGddField('core_loop', e.target.value)}
                  placeholder="Ex: Explorar sala -> Desviar de armadilhas com dash -> Eliminar guardião com projéteis -> Coletar fragmento de código -> Desbloquear atalho."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Condições de Vitória e Derrota */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Condições de Vitória e Derrota
                </label>
                <textarea
                  rows={2}
                  value={formData.gdd.win_loss_conditions}
                  onChange={(e) => updateGddField('win_loss_conditions', e.target.value)}
                  placeholder="Ex: Vitória: Sobrecargar o núcleo da IA central. Derrota: Vida zerada ou cronômetro do setor esgotar."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {/* Progressão & Economia */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Sistemas de Progressão, Upgrades & Economia
                </label>
                <textarea
                  rows={3}
                  value={formData.gdd.progression_systems}
                  onChange={(e) => updateGddField('progression_systems', e.target.value)}
                  placeholder="Ex: Árvore de implantes passivos, slots de chips de memória, moedas coletadas em baús para compra com o mercador..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ==================== ABA 3: MECÂNICAS (STACK) ==================== */}
          {activeTab === 'mechanics' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Catálogo de Mecânicas Vinculadas</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                      {selectedCount} selecionada{selectedCount === 1 ? '' : 's'}
                    </span>
                  </h3>
                  <p className="text-xs text-txt-muted mt-0.5">
                    Marque as mecânicas necessárias para este jogo e registre seu status de integração
                  </p>
                </div>
              </div>

              {/* Criação Rápida de Mecânica */}
              <div className="bg-dark-950 p-3 rounded-2xl border border-dark-800 flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={quickMechName}
                  onChange={(e) => setQuickMechName(e.target.value)}
                  placeholder="Adicionar nova mecânica ao catálogo..."
                  className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setQuickMechImplemented(!quickMechImplemented)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    quickMechImplemented
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : 'bg-dark-900 text-slate-400 border-dark-700'
                  }`}
                >
                  {quickMechImplemented ? '✓ Pronta no Catálogo' : 'A Programar'}
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddMechanic}
                  disabled={!quickMechName.trim() || creatingQuickMech}
                  className="w-full sm:w-auto px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                >
                  {creatingQuickMech ? 'Criando...' : '+ Adicionar'}
                </button>
              </div>

              {/* Busca de Mecânicas */}
              <div className="relative">
                <Search className="w-4 h-4 text-txt-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={mechanicSearch}
                  onChange={(e) => setMechanicSearch(e.target.value)}
                  placeholder="Filtrar catálogo de mecânicas..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Lista de Mecânicas */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {filteredMechanics.length === 0 ? (
                  <div className="p-4 text-center text-xs text-txt-muted bg-dark-950 rounded-xl border border-dark-800">
                    Nenhuma mecânica encontrada com esse nome.
                  </div>
                ) : (
                  filteredMechanics.map((mech) => {
                    const isSelected = Boolean(formData.selectedMechanics[mech.id]);
                    const linkData = formData.selectedMechanics[mech.id] || {};

                    return (
                      <div
                        key={mech.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-dark-950 border-cyan-500/50 ring-1 ring-cyan-500/20'
                            : 'bg-dark-950 border-dark-800 hover:border-dark-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleMechanic(mech.id)}
                              className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{mech.name}</span>
                                {mech.is_implemented ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    <Sparkles size={10} />
                                    Pronta no catálogo
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    <Wrench size={10} />
                                    A programar
                                  </span>
                                )}
                              </div>
                              {mech.description && (
                                <p className="text-[11px] text-txt-muted line-clamp-1 mt-0.5">
                                  {mech.description}
                                </p>
                              )}
                            </div>
                          </label>

                          {isSelected && (
                            <button
                              type="button"
                              onClick={() =>
                                updateMechanicLink(
                                  mech.id,
                                  'is_integrated',
                                  !linkData.is_integrated
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                linkData.is_integrated
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-dark-900 text-slate-400 border-dark-700 hover:border-dark-600'
                              }`}
                            >
                              {linkData.is_integrated ? '✓ Integrada no Jogo' : 'Não Integrada'}
                            </button>
                          )}
                        </div>

                        {/* Nota contextual se selecionada */}
                        {isSelected && (
                          <div className="mt-2.5 pt-2.5 border-t border-dark-800">
                            <input
                              type="text"
                              value={linkData.notes || ''}
                              onChange={(e) =>
                                updateMechanicLink(mech.id, 'notes', e.target.value)
                              }
                              placeholder="Notas específicas deste jogo (ex: Pulo duplo com asas, Dash com 12 frames de invulnerabilidade)..."
                              className="w-full bg-dark-900 border border-dark-750 rounded-lg px-2.5 py-1 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ==================== ABA 4: ARTE, LORE & TÉCNICO ==================== */}
          {activeTab === 'art_tech' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Estilo Visual & Áudio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Palette size={13} className="text-amber-400" />
                    <span>Estilo Visual & Arte</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.gdd.art_style}
                    onChange={(e) => updateGddField('art_style', e.target.value)}
                    placeholder="Ex: Pixel Art 16-bit com iluminação dinâmica 2D neon volumétrica..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Direção de Áudio & Trilha Sonora
                  </label>
                  <textarea
                    rows={2}
                    value={formData.gdd.audio_style}
                    onChange={(e) => updateGddField('audio_style', e.target.value)}
                    placeholder="Ex: Trilha synthwave sombria, batidas eletrônicas industriais e SFX mecânicos pesados..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Narrativa / Lore */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>Narrativa, Universo & Lore</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.gdd.narrative_setting}
                  onChange={(e) => updateGddField('narrative_setting', e.target.value)}
                  placeholder="Ex: Em uma megacidade subterrânea controlada por uma IA tirânica, o protagonista é uma sentinela renegada..."
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Engine & Escopo do MVP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Engine / Tecnologia
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.engine}
                    onChange={(e) => updateGddField('engine', e.target.value)}
                    placeholder="Ex: Godot 4.3, Unity, Unreal 5..."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1.5">
                    Escopo do MVP (Primeira Demo Jogável)
                  </label>
                  <input
                    type="text"
                    value={formData.gdd.mvp_scope}
                    onChange={(e) => updateGddField('mvp_scope', e.target.value)}
                    placeholder="Ex: 1 bioma, 3 inimigos, 1 miniboss e as 5 mecânicas base."
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-xs text-white placeholder-txt-muted focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-dark-750 flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-txt-muted">
              {activeTab === 'concept' && 'Dica: Você pode preencher manualmente ou clicar em "Importar GDD (.json)".'}
              {activeTab === 'gameplay' && 'Defina o core loop para orientar a integração de mecânicas.'}
              {activeTab === 'mechanics' && `${selectedCount} mecânica(s) conectada(s) a este jogo.`}
              {activeTab === 'art_tech' && 'Defina a direção estética e o escopo do MVP.'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : initialIdea ? 'Atualizar Ideia & GDD' : 'Criar Jogo & GDD'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
