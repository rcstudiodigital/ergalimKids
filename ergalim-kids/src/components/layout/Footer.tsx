import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, MessageCircle, MapPin, Phone, Mail, Star } from 'lucide-react'
import { useStore } from '@/context/StoreContext'

export default function Footer() {
  const { settings } = useStore()

  return (
    <footer className="mt-auto">
      {/* Newsletter — fundo colorido */}
      <div className="relative overflow-hidden" style={{background:'linear-gradient(135deg, #1A2B6B 0%, #2A3F9E 100%)'}}>
        <div className="absolute inset-0 dot-pattern opacity-30"/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-black text-white text-2xl mb-1">Ganhe 10% de desconto!</h3>
              <p className="text-white/70 font-bold text-sm">Cadastre seu e-mail e receba ofertas exclusivas</p>
            </div>
            <form
              onSubmit={e => { e.preventDefault(); alert('Inscrito! 🎉 Use o cupom ERGALIM10 na sua próxima compra!') }}
              className="flex gap-3 w-full md:w-auto">
              <input type="email" required placeholder="seu@email.com"
                className="flex-1 md:w-72 px-5 py-3.5 rounded-3xl font-bold text-sm border-2 border-white/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-brand-yellow transition-colors"/>
              <button type="submit" className="btn-yellow whitespace-nowrap shadow-kid">
                🎁 Quero desconto
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="bg-brand-navy text-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Logo + sobre */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} fill="#FFD600" color="#FFD600"/>
                <div>
                  <span className="font-black text-xl text-white">ergalim</span>
                  <span className="font-black text-xl text-brand-pink"> kids</span>
                </div>
              </div>
              <p className="text-sm font-bold leading-relaxed text-white/60">
                Moda infantil com estilo, conforto e aventura. Para pequenos grandes sonhadores! 🌟
              </p>
              <div className="flex gap-3 mt-5">
                <a href={`https://instagram.com/${(settings.storeInstagram||'').replace('@','')}`} target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-brand-pink transition-colors">
                  <Instagram size={16}/>
                </a>
                <a href={`https://wa.me/${settings.storeWhatsapp}`} target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-green-500 transition-colors"
                  title="WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-sm mb-4 flex items-center gap-1.5">
                🛍️ Loja
              </h4>
              <ul className="space-y-2.5">
                {[
                  ['👧 Meninas', '/shop?category=Feminino'],
                  ['👦 Meninos', '/shop?category=Masculino'],
                  ['✨ Novidades', '/shop?new=true'],
                  ['🏷️ Promoções', '/shop?sale=true'],
                  ['⭐ Destaques', '/shop?featured=true'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-sm font-bold text-white/60 hover:text-brand-yellow transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-sm mb-4 flex items-center gap-1.5">
                ❓ Ajuda
              </h4>
              <ul className="space-y-2.5">
                {[
                  ['FAQ', '/faq'], ['Entrega', '/shipping'],
                  ['Trocas', '/returns'], ['Guia de Tamanhos', '/size-guide'],
                  ['Contato', '/contact'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-sm font-bold text-white/60 hover:text-brand-yellow transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-sm mb-4 flex items-center gap-1.5">
                📍 Contato
              </h4>
              <ul className="space-y-3 text-sm font-bold text-white/60">
                <li className="flex items-start gap-2">
                  <MapPin size={15} className="shrink-0 mt-0.5 text-brand-pink"/>
                  {settings.storeAddress}
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={15} className="text-brand-pink"/>
                  {settings.storePhone}
                </li>
                <li className="flex items-center gap-2">
                  <Instagram size={15} className="text-brand-pink"/>
                  {settings.storeInstagram}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-white/40">
            <p>© {new Date().getFullYear()} Ergalim Kids · Feito com 💖 para os pequenos</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">🔒 SSL</span>
              <span>💳 Pix · Cartão · Boleto</span>
              <span>🚚 Entrega Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
