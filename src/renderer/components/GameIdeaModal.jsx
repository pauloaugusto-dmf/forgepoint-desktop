import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { resolveMedia } from '../utils';

export default function GameIdeaModal({
  isOpen,
  onClose,
  onSave,
  onQuickCreateMechanic,
  initialIdea = null,
  mechanics = [],
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    selectedMechanics: {}, // { [id]: { is_integrated: boolean, notes: string } }
  });

  const [mechanicSearch, setMechanicSearch] = useState('');
  const [quickMechName, setQuickMechName] = useState('');
  const [quickMechImplemented, setQuickMechImplemented] = useState(false);
  const [creatingQuickMech, setCreatingQuickMech] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image_url: '',
        selectedMechanics: {},
      });
    }
    setMechanicSearch('');
    setQuickMechName('');
    setQuickMechImplemented(false);
    setError('');
  }, [initialIdea, isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('O título da ideia de jogo é obrigatório.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-dark-900 border border-dark-750 rounded-3xl shadow-2xl p-6 md:p-8 my-8 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-750 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/15 text-violet-300 rounded-xl border border-violet-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialIdea ? 'Editar Ideia de Jogo' : 'Nova Ideia de Jogo'}
              </h2>
              <p className="text-xs text-txt-muted">
                Cadastre o conceito e monte o stack de mecânicas necessárias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dark-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs shrink-0">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-1 flex-1">
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
              placeholder="Ex: Metroidvania Cyberpunk, Soulslike 2D, Roguelike Espacial..."
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Conceito Geral / Pitch
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a premissa, gameplay core loop, influências e o diferencial do jogo..."
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors resize-none"
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
                className="flex-1 bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-violet-500 transition-colors"
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
              <div className="mt-3 relative h-40 bg-dark-950 rounded-2xl overflow-hidden border border-dark-750">
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

          {/* Mecânicas Vinculadas */}
          <div className="space-y-3 pt-2 border-t border-dark-750">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Vincular Mecânicas do Catálogo</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    {selectedCount} selecionada{selectedCount === 1 ? '' : 's'}
                  </span>
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Marque quais mecânicas serão usadas neste projeto e registre se já estão integradas
                </p>
              </div>
            </div>

            {/* Criação Rápida de Mecânica */}
            <div className="bg-dark-950 p-3 rounded-2xl border border-dark-800 flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={quickMechName}
                onChange={(e) => setQuickMechName(e.target.value)}
                placeholder="Nome de uma mecânica nova não listada..."
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
                {quickMechImplemented ? '✓ Já Implementada' : 'A Programar'}
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
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
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
                            placeholder="Notas específicas deste jogo (ex: Pulo deve ser duplo com asa, Dash tem 0.2s de cooldown)..."
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

          {/* Footer Actions */}
          <div className="pt-4 border-t border-dark-750 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : initialIdea ? 'Atualizar Ideia' : 'Criar Ideia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
