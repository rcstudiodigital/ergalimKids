import React, { useState } from 'react'
import { Palette, Image, Type, Layout, Eye, EyeOff, Save, RotateCcw, Monitor } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import ImageUpload from '@/components/ui/ImageUpload'
import type { SiteTheme, HeroBanner, HomeSection, CarouselSlide, HomeCarousel } from '@/types'
import toast from 'react-hot-toast'

const FONT_OPTIONS: { value: SiteTheme['fontFamily']; label: string; preview: string }[] = [
  { value: 'Nunito',     label: 'Nunito',     preview: 'Ergalim Kids' },
  { value: 'Inter',      label: 'Inter',      preview: 'Ergalim Kids' },
  { value: 'Poppins',    label: 'Poppins',    preview: 'Ergalim Kids' },
  { value: 'Montserrat', label: 'Montserrat', preview: 'Ergalim Kids' },
  { value: 'Roboto',     label: 'Roboto',     preview: 'Ergalim Kids' },
]

const RADIUS_OPTIONS: { value: SiteTheme['borderRadius']; label: string; preview: string }[] = [
  { value: 'sharp',   label: 'Quadrado',   preview: '0px' },
  { value: 'medium',  label: 'Médio',      preview: '8px' },
  { value: 'rounded', label: 'Arredondado', preview: '16px' },
]

const PRESET_COLORS = [
  { primary: '#1B2D5E', accent: '#E91E8C', name: 'Padrão (Azul + Rosa)' },
  { primary: '#1a1a2e', accent: '#e94560', name: 'Dark + Vermelho' },
  { primary: '#2d6a4f', accent: '#f4a261', name: 'Verde + Laranja' },
  { primary: '#6b21a8', accent: '#ec4899', name: 'Roxo + Rosa' },
  { primary: '#0f172a', accent: '#38bdf8', name: 'Escuro + Azul Claro' },
  { primary: '#b45309', accent: '#f59e0b', name: 'Marrom + Dourado' },
]

export default function AdminCustomize() {
  const { settings, updateSettings } = useStore()
  const [tab, setTab] = useState<'carousel' | 'hero' | 'categories' | 'sections' | 'theme'>('carousel')
  const [hero, setHero]       = useState<HeroBanner>({ ...settings.hero })
  const [sections, setSections] = useState<HomeSection[]>([...settings.homeSections])
  const [theme, setTheme]     = useState<SiteTheme>({ ...settings.theme })
  const [carousel, setCarousel] = useState<HomeCarousel>({
    enabled: settings.carousel?.enabled ?? true,
    intervalMs: settings.carousel?.intervalMs ?? 5000,
    slides: settings.carousel?.slides ? [...settings.carousel.slides] : [],
  })
  const [catImages, setCatImages] = useState({
    meninas:   settings.categoryImages?.meninas   || '',
    meninos:   settings.categoryImages?.meninos   || '',
    conjuntos: settings.categoryImages?.conjuntos || '',
    novidades: settings.categoryImages?.novidades || '',
  })
  const [saving, setSaving]   = useState(false)
  const [previewImg, setPreviewImg] = useState(false)

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    updateSettings({ hero, homeSections: sections, theme, categoryImages: catImages, carousel })
    setSaving(false)
    toast.success('Personalização salva! A home foi atualizada.')
  }

  const reset = () => {
    setHero({ ...settings.hero })
    setSections([...settings.homeSections])
    setTheme({ ...settings.theme })
    setCatImages({
      meninas:   settings.categoryImages?.meninas   || '',
      meninos:   settings.categoryImages?.meninos   || '',
      conjuntos: settings.categoryImages?.conjuntos || '',
      novidades: settings.categoryImages?.novidades || '',
    })
    toast('Alterações desfeitas', { icon: '↩' })
  }

  const toggleSection = (id: string) => setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s))

  const updateSection = (id: string, patch: Partial<HomeSection>) => setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))

  const TABS = [
    { id: 'carousel' as const,   label: 'Carrossel',     icon: <Monitor size={15}/> },
    { id: 'hero' as const,     label: 'Hero / Capa',    icon: <Image size={15}/> },
    { id: 'categories' as const, label: 'Categorias',   icon: <Image size={15}/> },
    { id: 'sections' as const, label: 'Seções da Home', icon: <Layout size={15}/> },
    { id: 'theme' as const,    label: 'Cores & Fonte',  icon: <Palette size={15}/> },
  ]

  return (
    <div className="space-y-6 animate-fadeUp"> <div className="flex items-center justify-between"> <div> <h1 className="text-2xl font-black text-white flex items-center gap-2"> <Monitor size={22} className="text-brand-pink"/> Personalizar Site
          </h1> <p className="text-sm text-gray-400 mt-1">Edite a aparência da loja. As alterações ficam visíveis imediatamente.</p> </div> <div className="flex gap-2"> <button onClick={reset} className="btn-ghost text-gray-400 hover:text-white border border-gray-700 rounded-xl px-4 py-2 flex items-center gap-2 text-sm"> <RotateCcw size={14}/> Desfazer
          </button> <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-5"> {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Salvando...</> : <><Save size={16}/> Salvar</>}
          </button> </div> </div> {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-2xl w-fit"> {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-white'}`}> {t.icon} {t.label}
          </button> ))}
      </div> {/* ── CARROSSEL ────────────────────────────────────────────────────── */}
      {tab === 'carousel' && (
        <div className="space-y-5"> {/* Configurações gerais */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"> <div className="flex items-center justify-between mb-4"> <div> <p className="font-bold text-white text-sm">Carrossel da Home</p> <p className="text-xs text-gray-400">Banner rotativo no topo da página inicial</p> </div> <button onClick={() => setCarousel(c => ({ ...c, enabled: !c.enabled }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${carousel.enabled ? 'bg-brand-pink' : 'bg-gray-600'}`}> <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${carousel.enabled ? 'translate-x-6' : ''}`}/> </button> </div> {/* Duração de cada slide */}
            <div className="border-t border-gray-800 pt-4"> <div className="flex items-center justify-between mb-2"> <label className="text-sm font-bold text-gray-300">Duração de cada imagem</label> <span className="text-brand-pink font-bold text-sm">{(carousel.intervalMs / 1000).toFixed(1)}s</span> </div> <input type="range" min={2000} max={10000} step={500} value={carousel.intervalMs}
                onChange={e => setCarousel(c => ({ ...c, intervalMs: Number(e.target.value) }))}
                className="w-full accent-brand-pink"/> <div className="flex justify-between text-2xs text-gray-500 mt-1"> <span>2s (rápido)</span> <span>10s (lento)</span> </div> </div> </div> {/* Lista de slides */}
          <div className="space-y-4"> {carousel.slides.map((slide, idx) => (
              <div key={slide.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5"> <div className="flex items-center justify-between mb-4"> <p className="font-bold text-white text-sm">Imagem {idx + 1}</p> <div className="flex items-center gap-1"> <button onClick={() => setCarousel(c => {
                        if (idx === 0) return c
                        const s = [...c.slides];[s[idx-1], s[idx]] = [s[idx], s[idx-1]]; return { ...c, slides: s }
                      })}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30" title="Subir">↑</button> <button onClick={() => setCarousel(c => {
                        if (idx === c.slides.length-1) return c
                        const s = [...c.slides];[s[idx+1], s[idx]] = [s[idx], s[idx+1]]; return { ...c, slides: s }
                      })}
                      disabled={idx === carousel.slides.length-1}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30" title="Descer">↓</button> <button onClick={() => setCarousel(c => ({ ...c, slides: c.slides.filter((_, i) => i !== idx) }))}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Remover"></button> </div> </div> <div className="grid sm:grid-cols-2 gap-4"> {/* Imagem */}
                  <div> <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Imagem do slide</label> <ImageUpload
                      value={slide.imageUrl}
                      onChange={url => setCarousel(c => {
                        const s = [...c.slides]; s[idx] = { ...s[idx], imageUrl: url }; return { ...c, slides: s }
                      })}/> </div> {/* Textos */}
                  <div className="space-y-3"> <div> <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Título (opcional)</label> <input value={slide.title || ''} placeholder="Ex: Coleção Inverno 2026" onChange={e => setCarousel(c => { const s = [...c.slides]; s[idx] = { ...s[idx], title: e.target.value }; return { ...c, slides: s } })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink"/> </div> <div> <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Subtítulo (opcional)</label> <input value={slide.subtitle || ''} placeholder="Ex: Conforto para os dias frios" onChange={e => setCarousel(c => { const s = [...c.slides]; s[idx] = { ...s[idx], subtitle: e.target.value }; return { ...c, slides: s } })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink"/> </div> <div className="grid grid-cols-2 gap-2"> <div> <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Texto do botão</label> <input value={slide.buttonText || ''} placeholder="Ver coleção" onChange={e => setCarousel(c => { const s = [...c.slides]; s[idx] = { ...s[idx], buttonText: e.target.value }; return { ...c, slides: s } })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink"/> </div> <div> <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Link do botão</label> <input value={slide.buttonUrl || ''} placeholder="/shop" onChange={e => setCarousel(c => { const s = [...c.slides]; s[idx] = { ...s[idx], buttonUrl: e.target.value }; return { ...c, slides: s } })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink"/> </div> </div> </div> </div> </div> ))}

            {/* Adicionar slide */}
            <button
              onClick={() => setCarousel(c => ({
                ...c,
                slides: [...c.slides, { id: `slide-${Date.now()}`, imageUrl: '', title: '', subtitle: '', buttonText: '', buttonUrl: '/shop' }]
              }))}
              className="w-full border-2 border-dashed border-gray-700 rounded-2xl py-5 text-sm font-bold text-gray-400 hover:border-brand-pink hover:text-brand-pink transition-colors"> + Adicionar imagem ao carrossel
            </button> {carousel.slides.length === 0 && (
              <p className="text-center text-xs text-gray-500">Nenhuma imagem ainda. Adicione ao menos uma para o carrossel aparecer.</p> )}
          </div> </div> )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {tab === 'hero' && (
        <div className="grid xl:grid-cols-2 gap-6"> <div className="space-y-5"> {/* Título */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"> <h2 className="font-black text-white flex items-center gap-2"><Type size={16} className="text-brand-pink"/> Textos do Hero</h2> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Título principal</label> <input value={hero.title} onChange={e => setHero(h => ({...h, title: e.target.value}))}
                  className="input-field bg-gray-800 border-gray-700 text-white placeholder-gray-500" placeholder="Para Pequenos Grandes Sonhadores"/> <p className="text-xs text-gray-500 mt-1">{hero.title.length}/60 caracteres</p> </div> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Subtítulo</label> <textarea value={hero.subtitle} onChange={e => setHero(h => ({...h, subtitle: e.target.value}))} rows={2}
                  className="input-field bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none" placeholder="Moda infantil com estilo, conforto e aventura"/> </div> <div className="grid grid-cols-2 gap-3"> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Texto do botão</label> <input value={hero.buttonText} onChange={e => setHero(h => ({...h, buttonText: e.target.value}))}
                    className="input-field bg-gray-800 border-gray-700 text-white text-sm"/> </div> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Link do botão</label> <input value={hero.buttonUrl} onChange={e => setHero(h => ({...h, buttonUrl: e.target.value}))}
                    className="input-field bg-gray-800 border-gray-700 text-white text-sm"/> </div> </div> </div> {/* Imagem */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"> <h2 className="font-black text-white flex items-center gap-2"><Image size={16} className="text-brand-pink"/> Imagem de Fundo</h2> <ImageUpload
                value={hero.imageUrl}
                onChange={url => setHero(h => ({...h, imageUrl: url}))}
                folder="ergalim-kids/home" /> <div> <label className="text-xs font-bold text-gray-400 flex items-center justify-between mb-2"> <span>Escurecimento da imagem</span> <span className="text-brand-pink font-black">{hero.overlayOpacity}%</span> </label> <input type="range" min={0} max={100} value={hero.overlayOpacity}
                  onChange={e => setHero(h => ({...h, overlayOpacity: Number(e.target.value)}))}
                  className="w-full accent-pink"/> <div className="flex justify-between text-xs text-gray-600 mt-1"> <span>Mais claro</span><span>Mais escuro</span> </div> </div> {/* Sugestões de imagens */}
              <div> <p className="text-xs font-bold text-gray-400 mb-2">Sugestões rápidas</p> <div className="grid grid-cols-3 gap-2"> {[
                    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
                    'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80',
                    'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
                    'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80',
                    'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=600&q=80',
                    'https://images.unsplash.com/photo-1478546344-e1401e1f4234?w=600&q=80',
                  ].map(url => (
                    <button key={url} onClick={() => setHero(h => ({...h, imageUrl: url}))}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${hero.imageUrl === url ? 'border-brand-pink' : 'border-transparent hover:border-gray-600'}`}> <img src={url} alt="" className="w-full h-full object-cover"/> </button> ))}
                </div> </div> </div> </div> {/* Preview do hero */}
          <div className="sticky top-6"> <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3"> Preview</p> <div className="rounded-2xl overflow-hidden shadow-2xl" style={{maxHeight:'500px',overflow:'hidden'}}> <div className="relative min-h-[300px] flex items-center" style={{background:'#1B2D5E'}}> {hero.imageUrl && (
                  <> <img src={hero.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{opacity: hero.overlayOpacity / 100 * 0.35}}/> <div className="absolute inset-0" style={{background:'linear-gradient(to right, rgba(27,45,94,0.9), rgba(27,45,94,0.5))'}}/> </> )}
                <div className="relative p-8"> <div className="inline-block bg-brand-pink/20 border border-brand-pink/40 text-brand-pink text-xs font-bold px-4 py-1.5 rounded-full mb-4"> NOVA COLEÇÃO 2025</div> <h1 className="font-display font-black text-2xl text-white leading-tight mb-3" style={{fontFamily: theme.fontFamily}}> {hero.title || 'Título aqui'}
                  </h1> <p className="text-white/70 text-sm mb-5">{hero.subtitle}</p> <button className="btn-primary text-sm px-6 py-2.5">{hero.buttonText}</button> </div> </div> </div> </div> </div> )}

      {/* ── SEÇÕES ─────────────────────────────────────────────────────── */}
      {/* ── ABA CATEGORIAS ──────────────────────────────────────────── */}
      {tab === 'categories' && (
        <div className="space-y-4"> <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"> <h2 className="font-black text-white flex items-center gap-2 mb-2"> Imagens das Categorias
            </h2> <p className="text-xs text-gray-400 mb-5"> Troque as fotos que aparecem na seção "Escolha pelo estilo!" da home.
              Deixe em branco para usar a imagem padrão.
            </p> <div className="grid sm:grid-cols-2 gap-5"> {[
                { key: 'meninas'   as const, label: ' Meninas',   emoji: '' },
                { key: 'meninos'   as const, label: ' Meninos',   emoji: '' },
                { key: 'conjuntos' as const, label: ' Conjuntos', emoji: '' },
                { key: 'novidades' as const, label: ' Novidades', emoji: '' },
              ].map(cat => (
                <div key={cat.key} className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700"> <p className="font-black text-white text-sm mb-3">{cat.label}</p> <ImageUpload
                    value={catImages[cat.key]}
                    onChange={url => setCatImages(c => ({ ...c, [cat.key]: url }))}
                    folder="ergalim-kids/categorias" /> </div> ))}
            </div> <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/40 rounded-xl text-xs text-blue-300 font-bold"> Dica: use fotos no formato retrato (mais altas que largas) para ficarem bonitas nos cartões.
            </div> </div> </div> )}

      {tab === 'sections' && (
        <div className="space-y-4 max-w-2xl"> <p className="text-sm text-gray-400">Ative ou desative seções da página inicial. Você também pode editar os títulos e o banner promocional.</p> {sections.map(section => (
            <div key={section.id} className={`bg-gray-900 border rounded-2xl p-5 transition-all ${section.visible ? 'border-gray-800' : 'border-gray-800 opacity-60'}`}> <div className="flex items-center justify-between gap-4 mb-3"> <div className="flex items-center gap-3"> <span className="text-xl"> {section.type === 'banner' ? '' : section.type === 'categories' ? '' : section.type === 'featured' ? '' : ''}
                  </span> <div> <p className="font-bold text-white text-sm">{section.type === 'banner' ? 'Benefícios' : section.type === 'categories' ? 'Categorias' : section.type === 'featured' ? 'Produtos em Destaque' : 'Banner Promocional'}</p> <p className="text-xs text-gray-500 mt-0.5">{section.visible ? 'Visível na home' : 'Oculto'}</p> </div> </div> <button onClick={() => toggleSection(section.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${section.visible ? 'bg-brand-pink' : 'bg-gray-700'}`}> <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${section.visible ? 'left-6' : 'left-0.5'}`}/> </button> </div> {section.visible && (
                <div className="space-y-3 pt-3 border-t border-gray-800"> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Título da seção</label> <input value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })}
                      className="input-field bg-gray-800 border-gray-700 text-white text-sm"/> </div> {/* Seção promo — campos extras */}
                  {section.type === 'promo' && (
                    <> <ImageUpload
                        label="Imagem do banner" value={section.imageUrl || ''}
                        onChange={url => updateSection(section.id, { imageUrl: url })}
                        folder="ergalim-kids/banners" /> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Texto da promoção</label> <input value={section.promoText || ''} onChange={e => updateSection(section.id, { promoText: e.target.value })}
                          className="input-field bg-gray-800 border-gray-700 text-white text-sm" placeholder="Até 30% OFF na coleção!"/> </div> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Texto do botão</label> <input value={section.promoButtonText || ''} onChange={e => updateSection(section.id, { promoButtonText: e.target.value })}
                          className="input-field bg-gray-800 border-gray-700 text-white text-sm" placeholder="Aproveitar agora"/> </div> </> )}
                </div> )}
            </div> ))}
        </div> )}

      {/* ── TEMA ───────────────────────────────────────────────────────── */}
      {tab === 'theme' && (
        <div className="grid xl:grid-cols-2 gap-6 max-w-4xl"> <div className="space-y-5"> {/* Cores pré-definidas */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"> <h2 className="font-black text-white flex items-center gap-2"><Palette size={16} className="text-brand-pink"/> Esquema de Cores</h2> <div className="grid grid-cols-2 gap-3"> {PRESET_COLORS.map(preset => (
                  <button key={preset.name} onClick={() => setTheme(t => ({...t, primaryColor: preset.primary, accentColor: preset.accent}))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${theme.primaryColor === preset.primary && theme.accentColor === preset.accent ? 'border-white' : 'border-gray-700 hover:border-gray-500'}`}> <div className="flex gap-2 mb-2"> <div className="w-6 h-6 rounded-lg" style={{background: preset.primary}}/> <div className="w-6 h-6 rounded-lg" style={{background: preset.accent}}/> </div> <p className="text-xs text-gray-300 font-semibold">{preset.name}</p> </button> ))}
              </div> <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800"> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Cor primária (fundo)</label> <div className="flex items-center gap-2"> <input type="color" value={theme.primaryColor} onChange={e => setTheme(t => ({...t, primaryColor: e.target.value}))}
                      className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer"/> <input value={theme.primaryColor} onChange={e => setTheme(t => ({...t, primaryColor: e.target.value}))}
                      className="input-field bg-gray-800 border-gray-700 text-white text-xs font-mono flex-1"/> </div> </div> <div> <label className="text-xs font-bold text-gray-400 block mb-1">Cor de destaque (botões)</label> <div className="flex items-center gap-2"> <input type="color" value={theme.accentColor} onChange={e => setTheme(t => ({...t, accentColor: e.target.value}))}
                      className="w-10 h-10 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer"/> <input value={theme.accentColor} onChange={e => setTheme(t => ({...t, accentColor: e.target.value}))}
                      className="input-field bg-gray-800 border-gray-700 text-white text-xs font-mono flex-1"/> </div> </div> </div> </div> {/* Fonte */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3"> <h2 className="font-black text-white flex items-center gap-2"><Type size={16} className="text-brand-pink"/> Tipografia</h2> <div className="space-y-2"> {FONT_OPTIONS.map(f => (
                  <label key={f.value} className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${theme.fontFamily === f.value ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-700 hover:border-gray-600'}`}> <div className="flex items-center gap-3"> <input type="radio" name="font" checked={theme.fontFamily === f.value} onChange={() => setTheme(t => ({...t, fontFamily: f.value}))} className="accent-pink"/> <span className="text-white font-semibold text-sm">{f.label}</span> </div> <span className="text-gray-300 text-base" style={{fontFamily: f.value}}>{f.preview}</span> </label> ))}
              </div> </div> {/* Border radius */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3"> <h2 className="font-black text-white flex items-center gap-2"><Layout size={16} className="text-brand-pink"/> Estilo dos Cantos</h2> <div className="grid grid-cols-3 gap-3"> {RADIUS_OPTIONS.map(r => (
                  <button key={r.value} onClick={() => setTheme(t => ({...t, borderRadius: r.value}))}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${theme.borderRadius === r.value ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-700 hover:border-gray-500'}`}> <div className="w-10 h-10 bg-brand-pink/30" style={{borderRadius: r.preview}}/> <span className="text-xs text-gray-300 font-semibold">{r.label}</span> </button> ))}
              </div> </div> </div> {/* Preview do tema */}
          <div className="sticky top-6"> <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3"> Preview do Tema</p> <div className="bg-white rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"> <div className="h-16 rounded-2xl flex items-center px-4 gap-3" style={{background: theme.primaryColor}}> <span className="font-black text-white text-lg" style={{fontFamily: theme.fontFamily}}>ergalim</span> <span className="font-black text-lg" style={{color: theme.accentColor, fontFamily: theme.fontFamily}}>kids</span> </div> <div className="h-20 rounded-2xl flex items-center justify-center" style={{background: `${theme.primaryColor}15`, borderRadius: theme.borderRadius === 'sharp' ? '4px' : theme.borderRadius === 'medium' ? '8px' : '16px'}}> <p className="text-sm font-bold" style={{color: theme.primaryColor, fontFamily: theme.fontFamily}}>Banner de exemplo</p> </div> <button className="w-full py-3 font-black text-white text-sm" style={{background: theme.accentColor, fontFamily: theme.fontFamily, borderRadius: theme.borderRadius === 'sharp' ? '4px' : theme.borderRadius === 'medium' ? '8px' : '16px'}}> Botão de ação
              </button> <div className="grid grid-cols-2 gap-3"> {[1,2].map(i => (
                  <div key={i} className="bg-gray-100 overflow-hidden" style={{borderRadius: theme.borderRadius === 'sharp' ? '4px' : theme.borderRadius === 'medium' ? '8px' : '16px'}}> <div className="h-20 bg-gray-200"/> <div className="p-2"> <p className="text-xs font-black" style={{color: theme.primaryColor, fontFamily: theme.fontFamily}}>Produto {i}</p> <p className="text-xs font-black" style={{color: theme.accentColor}}>R$ 189,90</p> </div> </div> ))}
              </div> </div> </div> </div> )}
    </div> )
}
