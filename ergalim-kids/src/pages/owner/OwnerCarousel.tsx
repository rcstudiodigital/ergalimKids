import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Monitor, Save, Plus, ArrowUp, ArrowDown, Trash2, Lock } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import ImageUpload from '@/components/ui/ImageUpload'
import type { HomeCarousel } from '@/types'
import toast from 'react-hot-toast'

export default function OwnerCarousel() {
  const { settings, updateSettings, ownerPermissions } = useStore()
  const [saving, setSaving] = useState(false)
  const [carousel, setCarousel] = useState<HomeCarousel>({
    enabled: settings.carousel?.enabled ?? true,
    intervalMs: settings.carousel?.intervalMs ?? 5000,
    slides: settings.carousel?.slides ? [...settings.carousel.slides] : [],
  })

  // Permissão liberada pelo admin
  if (ownerPermissions.canEditSiteContent === false) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Lock size={24} className="text-gray-400"/>
        </div>
        <h2 className="font-display font-extrabold text-brand-ink text-xl mb-2">Sem permissão</h2>
        <p className="text-sm text-gray-500">
          A edição do carrossel não está liberada para a sua conta.
          Peça ao administrador para habilitar “Editar conteúdo do site”.
        </p>
      </div>
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateSettings({ carousel })
      toast.success('Carrossel atualizado!')
    } catch {
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const move = (idx: number, dir: -1 | 1) => setCarousel(c => {
    const t = idx + dir
    if (t < 0 || t >= c.slides.length) return c
    const s = [...c.slides];[s[idx], s[t]] = [s[t], s[idx]]; return { ...c, slides: s }
  })

  const patchSlide = (idx: number, field: string, value: string) => setCarousel(c => {
    const s = [...c.slides]; s[idx] = { ...s[idx], [field]: value }; return { ...c, slides: s }
  })

  return (
    <div className="space-y-6 animate-fadeUp max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-brand-ink flex items-center gap-2">
          <Monitor size={22} className="text-brand-pink"/> Carrossel da Home
        </h1>
        <p className="text-sm text-gray-500 mt-1">Banner rotativo no topo da página inicial da loja.</p>
      </div>

      {/* Configurações gerais */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-brand-ink text-sm">Mostrar carrossel</p>
            <p className="text-xs text-gray-400">Liga ou desliga o banner na home</p>
          </div>
          <button onClick={() => setCarousel(c => ({ ...c, enabled: !c.enabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${carousel.enabled ? 'bg-brand-pink' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${carousel.enabled ? 'left-6' : 'left-0.5'}`}/>
          </button>
        </div>

        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-brand-navy">Duração de cada imagem</label>
            <span className="text-brand-pink font-bold text-sm">{(carousel.intervalMs / 1000).toFixed(1)}s</span>
          </div>
          <input type="range" min={2000} max={10000} step={500} value={carousel.intervalMs}
            onChange={e => setCarousel(c => ({ ...c, intervalMs: Number(e.target.value) }))}
            className="w-full accent-brand-pink"/>
          <div className="flex justify-between text-2xs text-gray-400 mt-1">
            <span>2s (rápido)</span>
            <span>10s (lento)</span>
          </div>
        </div>
      </div>

      {/* Slides */}
      <div className="space-y-4">
        {carousel.slides.map((slide, idx) => (
          <div key={slide.id} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-brand-ink text-sm">Imagem {idx + 1}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-navy hover:bg-bg-soft disabled:opacity-30" title="Subir">
                  <ArrowUp size={15}/>
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === carousel.slides.length - 1}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-navy hover:bg-bg-soft disabled:opacity-30" title="Descer">
                  <ArrowDown size={15}/>
                </button>
                <button onClick={() => setCarousel(c => ({ ...c, slides: c.slides.filter((_, i) => i !== idx) }))}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50" title="Remover">
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Imagem do slide</label>
                <ImageUpload value={slide.imageUrl} onChange={url => patchSlide(idx, 'imageUrl', url)}/>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Título (opcional)</label>
                  <input value={slide.title || ''} placeholder="Ex: Coleção Inverno 2026"
                    onChange={e => patchSlide(idx, 'title', e.target.value)} className="input-field"/>
                </div>
                <div>
                  <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Subtítulo (opcional)</label>
                  <input value={slide.subtitle || ''} placeholder="Ex: Conforto para os dias frios"
                    onChange={e => patchSlide(idx, 'subtitle', e.target.value)} className="input-field"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Texto do botão</label>
                    <input value={slide.buttonText || ''} placeholder="Ver coleção"
                      onChange={e => patchSlide(idx, 'buttonText', e.target.value)} className="input-field"/>
                  </div>
                  <div>
                    <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Link do botão</label>
                    <input value={slide.buttonUrl || ''} placeholder="/shop"
                      onChange={e => patchSlide(idx, 'buttonUrl', e.target.value)} className="input-field"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setCarousel(c => ({
            ...c,
            slides: [...c.slides, { id: `slide-${Date.now()}`, imageUrl: '', title: '', subtitle: '', buttonText: '', buttonUrl: '/shop' }]
          }))}
          className="w-full border-2 border-dashed border-line rounded-2xl py-5 text-sm font-bold text-gray-400 hover:border-brand-pink hover:text-brand-pink transition-colors flex items-center justify-center gap-2">
          <Plus size={16}/> Adicionar imagem ao carrossel
        </button>

        {carousel.slides.length === 0 && (
          <p className="text-center text-xs text-gray-400">Nenhuma imagem ainda. Adicione ao menos uma para o carrossel aparecer.</p>
        )}
      </div>

      {/* Salvar */}
      <div className="sticky bottom-4">
        <button onClick={save} disabled={saving}
          className="btn-primary w-full justify-center gap-2 shadow-card-lg">
          <Save size={16}/> {saving ? 'Salvando...' : 'Salvar carrossel'}
        </button>
      </div>
    </div>
  )
}
