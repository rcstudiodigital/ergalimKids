import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, MapPin, Phone, Truck, CreditCard, ShieldCheck } from 'lucide-react'
import { useStore } from '@/context/StoreContext'

export default function Footer() {
  const { settings } = useStore()

  return (
    <footer className="mt-auto">

      {/* ── BENEFÍCIOS (estilo henri) ─────────────────────────────────── */}
      <div className="bg-white border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Enviamos para todo o Brasil', sub: 'Frete grátis acima de R$299' },
              { icon: CreditCard, title: 'Pague como quiser', sub: 'Pix, cartão ou boleto' },
              { icon: ShieldCheck, title: 'Compra 100% segura', sub: 'Seus dados sempre protegidos' },
            ].map(b => (
              <div key={b.title} className="flex items-center gap-3.5 justify-center sm:justify-start">
                <div className="w-11 h-11 rounded-2xl bg-bg-soft flex items-center justify-center shrink-0">
                  <b.icon size={20} className="text-brand-blue"/>
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-ink">{b.title}</p>
                  <p className="text-xs text-gray-500 font-medium">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER ────────────────────────────────────────────────── */}
      <div className="bg-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display font-extrabold text-white text-2xl mb-1">Ganhe 10% de desconto</h3>
              <p className="text-white/70 font-medium text-sm">Cadastre seu e-mail e receba ofertas exclusivas</p>
            </div>
            <form
              onSubmit={e => { e.preventDefault(); alert('Inscrito! Use o cupom ERGALIM10 na sua próxima compra.') }}
              className="flex gap-3 w-full md:w-auto">
              <input type="email" required placeholder="seu@email.com"
                className="flex-1 md:w-72 px-5 py-3 rounded-full font-medium text-sm border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-brand-yellow transition-colors"/>
              <button type="submit" className="btn-yellow whitespace-nowrap">
                Quero desconto
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand-pink flex items-center justify-center">
                    <span className="text-white font-display font-extrabold leading-none">e</span>
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-lg text-white">ergalim</span>
                    <span className="font-display font-extrabold text-lg text-brand-pink"> kids</span>
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed text-white/60">
                  Moda infantil com estilo, conforto e qualidade para os pequenos.
                </p>
                <div className="flex gap-3 mt-5">
                  <a href={`https://instagram.com/${(settings.storeInstagram||'').replace('@','')}`} target="_blank" rel="noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-brand-pink transition-colors" aria-label="Instagram">
                    <Instagram size={16} className="text-white"/>
                  </a>
                  <a href={`https://wa.me/${settings.storeWhatsapp}`} target="_blank" rel="noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-brand-mint transition-colors" aria-label="WhatsApp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm mb-4">Loja</h4>
                <ul className="space-y-2.5">
                  {[
                    ['Meninas', '/shop?category=Feminino'],
                    ['Meninos', '/shop?category=Masculino'],
                    ['Novidades', '/shop?new=true'],
                    ['Promoções', '/shop?sale=true'],
                    ['Destaques', '/shop?featured=true'],
                  ].map(([label, href]) => (
                    <li key={href}>
                      <Link to={href} className="text-sm font-medium text-white/60 hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm mb-4">Ajuda</h4>
                <ul className="space-y-2.5">
                  {[
                    ['Entrega', '/shipping'],
                    ['Trocas', '/returns'],
                    ['Guia de Tamanhos', '/size-guide'],
                    ['Privacidade', '/privacy'],
                    ['Termos', '/terms'],
                  ].map(([label, href]) => (
                    <li key={href}>
                      <Link to={href} className="text-sm font-medium text-white/60 hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm mb-4">Contato</h4>
                <ul className="space-y-3 text-sm font-medium text-white/60">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-white/40">
              <p>© {new Date().getFullYear()} Ergalim Kids · Todos os direitos reservados</p>
              <div className="flex items-center gap-4">
                <span>Pix · Cartão · Boleto</span>
                <span>Entrega para todo o Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
