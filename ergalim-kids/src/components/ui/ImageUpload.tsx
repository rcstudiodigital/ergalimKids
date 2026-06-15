import React, { useRef, useState } from 'react'
import { Upload, Link, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadImage } from '@/services/cloudinary'

interface Props {
  value:    string
  onChange: (url: string) => void
  label?:   string
  folder?:  string
}

export default function ImageUpload({ value, onChange, label, folder }: Props) {
  const [mode, setMode]       = useState<'upload' | 'url'>(value ? 'url' : 'upload')
  const [urlInput, setUrlInput] = useState(value || '')
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem (JPG, PNG, WebP)'); return }
    if (file.size > 10 * 1024 * 1024)   { setError('Imagem muito grande (máx 10MB)'); return }

    setLoading(true)
    setError('')
    try {
      const result = await uploadImage(file, folder || 'ergalim-kids/products')
      onChange(result.url)
      setUrlInput(result.url)
      setMode('url')
    } catch (e: any) {
      // Se Cloudinary não configurado, usa base64 local como fallback
      const reader = new FileReader()
      reader.onload = ev => {
        onChange(ev.target?.result as string)
        setError('')
      }
      reader.readAsDataURL(file)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const applyUrl = () => {
    if (urlInput.trim()) { onChange(urlInput.trim()); setError('') }
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-black text-gray-500 block">{label}</label>}

      {/* Toggle */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black border-2 transition-all
            ${mode==='upload' ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-500 hover:border-brand-navy'}`}>
          <Upload size={12}/> Enviar do dispositivo
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black border-2 transition-all
            ${mode==='url' ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-500 hover:border-brand-navy'}`}>
          <Link size={12}/> Colar URL
        </button>
      </div>

      {/* Upload */}
      {mode === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !loading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
            ${dragging  ? 'border-brand-pink bg-bg-soft scale-[1.01]' : 'border-gray-300 hover:border-brand-pink hover:bg-bg-soft'}
            ${loading   ? 'pointer-events-none opacity-70' : ''}`}>
          <input ref={inputRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}/>
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 size={28} className="text-brand-pink animate-spin"/>
              <p className="text-xs font-bold text-gray-400">Fazendo upload...</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-gray-300 mb-2"/>
              <p className="text-sm font-black text-gray-500">
                Arraste ou <span className="text-brand-pink">clique para selecionar</span>
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1">
                JPG, PNG, WebP · Máx 10MB · 📱 Funciona no celular
              </p>
            </>
          )}
        </div>
      )}

      {/* URL */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input type="url" value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onBlur={applyUrl}
            onKeyDown={e => e.key === 'Enter' && applyUrl()}
            placeholder="https://..."
            className="input-field flex-1 text-xs font-mono"/>
          <button type="button" onClick={applyUrl} className="btn-navy px-4 shrink-0 text-sm">
            OK
          </button>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 font-bold">
          <AlertCircle size={13}/> {error}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative group">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
            <img src={value} alt="Preview" className="w-full h-full object-cover"
              onError={() => setError('URL da imagem inválida')}/>
          </div>
          <button type="button" onClick={() => { onChange(''); setUrlInput(''); setError('') }}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md opacity-0 group-hover:opacity-100">
            <X size={13}/>
          </button>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle size={11} className="text-green-500"/>
            <p className="text-[10px] text-gray-400 font-bold">
              {value.includes('cloudinary.com') ? '☁️ Cloudinary' : value.startsWith('data:') ? '📁 Local' : '🔗 URL externa'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
