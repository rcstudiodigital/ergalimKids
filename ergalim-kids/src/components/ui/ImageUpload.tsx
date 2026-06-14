/**
 * ImageUpload — Upload de imagem do PC ou celular
 * Converte para base64 ou aceita URL externa
 * Em produção: substituir o base64 por upload para Cloudinary/S3
 */
import React, { useRef, useState } from 'react'
import { Upload, Link, X, Image } from 'lucide-react'

interface Props {
  value: string          // URL atual da imagem
  onChange: (url: string) => void
  label?: string
  className?: string
}

export default function ImageUpload({ value, onChange, label, className = '' }: Props) {
  const [mode, setMode]       = useState<'url' | 'file'>('url')
  const [urlInput, setUrlInput] = useState(value || '')
  const [dragging, setDragging] = useState(false)
  const [converting, setConverting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { alert('Selecione uma imagem'); return }
    if (file.size > 5 * 1024 * 1024)   { alert('Imagem muito grande (máx 5MB)'); return }

    setConverting(true)
    const reader = new FileReader()
    reader.onload = e => {
      onChange(e.target?.result as string)
      setConverting(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) onChange(urlInput.trim())
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-xs font-black text-gray-500 block">{label}</label>}

      {/* Toggle modo */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black border-2 transition-all ${mode==='file' ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-500 hover:border-brand-navy hover:text-brand-navy'}`}>
          <Upload size={13}/> Upload do dispositivo
        </button>
        <button type="button" onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black border-2 transition-all ${mode==='url' ? 'bg-brand-navy text-white border-brand-navy' : 'border-gray-200 text-gray-500 hover:border-brand-navy hover:text-brand-navy'}`}>
          <Link size={13}/> Colar link (URL)
        </button>
      </div>

      {/* Upload de arquivo */}
      {mode === 'file' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragging ? 'border-brand-pink bg-bg-soft scale-[1.02]' : 'border-gray-300 hover:border-brand-pink hover:bg-bg-soft'}`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"   // abre câmera no celular
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {converting ? (
            <div className="py-2">
              <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin mx-auto mb-2"/>
              <p className="text-xs font-bold text-gray-400">Processando...</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-gray-300 mb-2"/>
              <p className="text-sm font-black text-gray-500">
                Arraste uma imagem aqui ou <span className="text-brand-pink">clique para selecionar</span>
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1">
                JPG, PNG, WebP · Máx 5MB · Funciona pelo celular também 📱
              </p>
            </>
          )}
        </div>
      )}

      {/* URL externa */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onBlur={handleUrlSubmit}
            onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="https://... (link da imagem)"
            className="input-field flex-1 text-xs font-mono"
          />
          <button type="button" onClick={handleUrlSubmit}
            className="btn-navy px-4 text-sm shrink-0">OK</button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative">
          <div className="w-full aspect-[3/2] rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
            <img src={value} alt="Preview" className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display='none' }}/>
          </div>
          <button type="button" onClick={() => { onChange(''); setUrlInput('') }}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
            <X size={13}/>
          </button>
          <p className="text-[10px] text-gray-400 font-bold mt-1 text-center">
            {value.startsWith('data:') ? '📁 Imagem do dispositivo' : '🔗 Imagem por URL'}
          </p>
        </div>
      )}
    </div>
  )
}
