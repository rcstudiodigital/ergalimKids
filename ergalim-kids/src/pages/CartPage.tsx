import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Tag, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/utils/security'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, discount, coupon, applyCoupon, removeCoupon, itemCount } = useCart()
  const { settings } = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')

  const total = subtotal - discount  // frete é calculado no checkout

  const handleCoupon = () => {
    if (applyCoupon(couponInput)) { toast.success('Cupom aplicado'); setCouponInput('') }
    else toast.error('Cupom inválido ou pedido mínimo não atingido')
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
      <h2 className="font-display font-black text-3xl text-brand-navy mb-3">Carrinho vazio</h2>
      <p className="text-gray-500 mb-8">Adicione produtos e volte aqui para finalizar sua compra.</p>
      <Link to="/shop" className="btn-primary">Explorar coleção</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="section-title text-2xl md:text-3xl mb-8">Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="card p-4 flex gap-4">
              <Link to={`/product/${item.product.id}`} className="w-20 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link to={`/product/${item.product.id}`} className="font-bold text-brand-navy text-sm hover:text-brand-pink transition-colors line-clamp-2">{item.product.name}</Link>
                  <button onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16}/></button>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.selectedSize} · {item.selectedColor}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity-1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><Minus size={12}/></button>
                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity+1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><Plus size={12}/></button>
                  </div>
                  <span className="font-black text-brand-navy">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="space-y-4">
          {/* Cupom + Resumo */}
          <div className="card p-5">
            <h3 className="font-black text-brand-navy mb-4">Resumo do Pedido</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto ({coupon})</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Frete</span><span className="text-gray-400">Calculado no checkout</span></div>
              <div className="flex justify-between font-black text-brand-navy text-base border-t border-gray-100 pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>

            {!coupon ? (
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="text" placeholder="Cupom de desconto" value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} onKeyDown={e => e.key==='Enter' && handleCoupon()} className="input-field pl-8 py-2 text-xs" />
                </div>
                <button onClick={handleCoupon} className="btn-outline py-2 px-3 text-xs">Aplicar</button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
                <span className="text-xs text-green-700 font-bold">{coupon} aplicado</span>
                <button onClick={removeCoupon} className="text-green-500 hover:text-green-700"><X size={14}/></button>
              </div>
            )}

            <button onClick={handleCheckout} className="btn-primary w-full py-4 text-base">Finalizar Compra</button>
            <p className="text-xs text-gray-400 text-center mt-3">Pagamento seguro com criptografia SSL</p>
          </div>

          <Link to="/shop" className="btn-ghost w-full justify-center text-sm">← Continuar comprando</Link>
        </div>
      </div>
    </div>
  )
}
