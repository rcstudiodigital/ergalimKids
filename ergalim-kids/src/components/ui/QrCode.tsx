import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Gera o QR Code localmente como imagem PNG (melhor qualidade e leitura
 * que canvas em celulares). Preto/branco puro e margem adequada.
 */
export default function QrCode({ value, size = 256 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    if (!value) return
    QRCode.toDataURL(value, {
      width: size,
      margin: 4,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',   // correção alta = mais robusto à leitura
    })
      .then(setDataUrl)
      .catch((e) => console.error('Erro ao gerar QR:', e))
  }, [value, size])

  if (!dataUrl) {
    return <div style={{ width: size, height: size }} className="mx-auto bg-gray-100 animate-pulse rounded"/>
  }

  return <img src={dataUrl} alt="QR Code Pix" width={size} height={size} className="mx-auto" style={{ imageRendering: 'pixelated' }}/>
}
