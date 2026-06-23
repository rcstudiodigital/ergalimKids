import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

/**
 * Gera o QR Code localmente (no navegador), sem depender de site externo.
 * Mais seguro e profissional: os dados do PIX nunca saem do dispositivo.
 */
export default function QrCode({ value, size = 208 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: '#1C2444', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).catch(() => { /* se falhar, o canvas fica vazio (o copia-e-cola ainda funciona) */ })
  }, [value, size])

  return <canvas ref={canvasRef} className="mx-auto rounded-lg" width={size} height={size}/>
}
