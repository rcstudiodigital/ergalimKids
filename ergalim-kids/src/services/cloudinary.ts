/**
 * Cloudinary — Upload de imagens sem backend
 * 
 * Para configurar:
 * 1. Acesse cloudinary.com → crie conta grátis
 * 2. No painel: Settings → Upload → Upload Presets
 * 3. Clique "Add upload preset" → Signing Mode: "Unsigned" → Salve
 * 4. Copie o "Cloud name" e o "Preset name"
 * 5. Coloque no .env.local:
 *    VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
 *    VITE_CLOUDINARY_UPLOAD_PRESET=seu_preset
 */

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export interface UploadResult {
  url:       string   // URL pública otimizada
  publicId:  string   // ID para deletar depois
  width:     number
  height:    number
}

/**
 * Faz upload de um File para o Cloudinary
 * Retorna a URL pública da imagem
 */
export async function uploadImage(
  file: File,
  folder = 'ergalim-kids/products'
): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Configure VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET no .env.local')
  }

  const formData = new FormData()
  formData.append('file',          file)
  formData.append('upload_preset', UPLOAD_PRESET)
  // NÃO enviar 'folder' nem 'transformation' aqui:
  // presets Unsigned não permitem esses parâmetros na requisição (erro 400).
  // A pasta já está configurada no próprio preset (ergalim_kids → ergalim-kids).

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    console.error('Cloudinary erro:', errData)
    throw new Error(errData?.error?.message || 'Falha no upload da imagem')
  }

  const data = await res.json()
  return {
    url:      data.secure_url,
    publicId: data.public_id,
    width:    data.width,
    height:   data.height,
  }
}

/**
 * Gera URL otimizada com transformações do Cloudinary
 * Ex: getOptimizedUrl(url, { width: 400, height: 500 })
 */
export function getOptimizedUrl(url: string, opts?: { width?: number; height?: number; quality?: number }): string {
  if (!url.includes('cloudinary.com')) return url
  const { width = 800, height, quality = 'auto' } = opts || {}
  const transforms = [`w_${width}`, `q_${quality}`, 'f_auto', 'c_fill']
  if (height) transforms.push(`h_${height}`)
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`)
}
