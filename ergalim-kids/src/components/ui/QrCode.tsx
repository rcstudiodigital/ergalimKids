import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

/**
 * Gera o QR Code localmente (no navegador), sem depender de site externo.
 * Usa preto/branco puro e margem adequada para máxima compatibilidade
 * com os leitores dos apps de banco.
 */
export default function QrCode({ value, size = 240 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 4,                          // zona de silêncio padrão (apps exigem)
      color: { dark: '#000000', light: '#FFFFFF' },  // preto/branco puro (leitura confiável)
      errorCorrectionLevel: 'M',
    }).catch((e) => { console.error('Erro ao gerar QR:', e) })
  }, [value, size])

  return <canvas ref={canvasRef} className="mx-auto" width={size} height={size}/>
}
