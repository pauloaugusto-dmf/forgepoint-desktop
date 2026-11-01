import React, { useState, useEffect } from 'react';
import { X, Save, Cpu, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { resolveMedia } from '../utils';

export default function MechanicModal({ isOpen, onClose, onSave, initialMechanic = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gif_url: '',
    is_implemented: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMechanic) {
      setFormData({
        name: initialMechanic.name || '',
        description: initialMechanic.description || '',
        gif_url: initialMechanic.gif_url || '',
        is_implemented: Boolean(initialMechanic.is_implemented),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        gif_url: '',
        is_implemented: false,
      });
    }
    setError('');
  }, [initialMechanic, isOpen]);

  if (!isOpen) return null;

  const handleSelectLocalMedia = async () => {
    try {
      const filePath = await window.api.selectMedia();
      if (filePath) {
        setFormData((prev) => ({ ...prev, gif_url: filePath }));
      }
    } catch (err) {
      setError('Falha ao selecionar arquivo local: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('O nome da mecânica é obrigatório.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() ? formData.description.trim() : null,
      gif_url: formData.gif_url.trim() ? formData.gif_url.trim() : null,
      is_implemented: Boolean(formData.is_implemented),
    };

    try {
      await onSave(payload, initialMechanic?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Falha ao salvar mecânica.');
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = resolveMedia(formData.gif_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-dark-900 border border-dark-750 rounded-3xl shadow-2xl p-6 md:p-8 my-8 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-750 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 text-cyan-300 rounded-xl border border-cyan-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialMechanic ? 'Editar Mecânica' : 'Nova Mecânica'}
              </h2>
              <p className="text-xs text-txt-muted">
                Cadastre uma mecânica reutilizável no seu catálogo do Forgepoint
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
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Nome da Mecânica *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Pulo Duplo, State Machine, Dash, Wall Jump..."
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Descrição Técnica / Notas de Implementação
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes de como a mecânica foi implementada, parâmetros de gravidade, física ou scripts usados..."
              className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* GIF / Mídia demonstrativa */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              GIF ou Imagem Demonstrativa
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.gif_url}
                onChange={(e) => setFormData({ ...formData, gif_url: e.target.value })}
                placeholder="URL externa ou selecione um arquivo local..."
                className="flex-1 bg-dark-950 border border-dark-700 rounded-xl px-4 py-2 text-sm text-white placeholder-txt-muted focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleSelectLocalMedia}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-xs font-bold text-cyan-300 border border-dark-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Arquivo Local</span>
              </button>
            </div>

            {/* Preview da Mídia */}
            {previewSrc && (
              <div className="mt-3 relative h-40 bg-dark-950 rounded-2xl overflow-hidden border border-dark-750 flex items-center justify-center">
                <img
                  src={previewSrc}
                  alt="Preview da Mecânica"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Status de Implementação */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, is_implemented: !prev.is_implemented }))
              }
              className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                formData.is_implemented
                  ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/20'
                  : 'bg-dark-950 border-dark-800 hover:border-dark-700'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  formData.is_implemented
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-dark-800 text-slate-500'
                }`}
              >
                {formData.is_implemented ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {formData.is_implemented
                      ? 'Implementada no Catálogo (Pronta para Reuso)'
                      : 'A Programar (Pendente no Catálogo)'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      formData.is_implemented
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {formData.is_implemented ? 'Pronta' : 'Pendente'}
                  </span>
                </div>
                <p className="text-xs text-txt-muted mt-0.5">
                  {formData.is_implemented
                    ? 'Essa mecânica já possui código funcional e pode ser aproveitada imediatamente em qualquer jogo.'
                    : 'A mecânica foi catalogada como ideia técnica, mas ainda precisa ser codificada/prototipada.'}
                </p>
              </div>
            </button>
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : initialMechanic ? 'Atualizar Mecânica' : 'Criar Mecânica'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
