import type { Product, Order, SiteSettings, OwnerPermissions, Coupon } from '@/types'

// ─── PRODUTOS (com fotos reais da Ergalim Kids) ────────────────────────────
export const INITIAL_PRODUCTS: Product[] = []

// ─── PEDIDOS mock ──────────────────────────────────────────────────────────
export const INITIAL_ORDERS: Order[] = []

// ─── CONFIGURAÇÕES (com dados reais da Ergalim Kids) ──────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'Ergalim Kids',
  storePhone: '(21) 99211-0726',
  storeWhatsapp: '5521992110726',
  storeInstagram: '@ergalimkids',
  storeAddress: 'Rua Dom João Braga, 236 - Alto da Serra',
  storeEmail: import.meta.env.VITE_STORE_EMAIL || 'contato@ergalimkids.com.br',
  heroTitle: 'Para Pequenos Grandes Sonhadores',
  heroSubtitle: 'Moda infantil com estilo, conforto e aventura',
  freeShippingAbove: 299,
  paymentGateway: 'mercadopago',
  stripePublicKey: '',
  mercadopagoPublicKey: '',
  emailNotifyOwner: true,
  emailNotifyCustomer: true,
  maintenanceMode: false,
  // ── Customização visual (editável pelo admin) ──
  hero: {
    title: 'Para Pequenos Grandes Sonhadores',
    subtitle: 'Moda infantil com estilo, conforto e aventura',
    imageUrl: '',
    buttonText: 'Explorar coleção',
    buttonUrl: '/shop',
    overlayOpacity: 75,
  },
  carousel: {
    enabled: true,
    intervalMs: 5000,
    slides: [
      {
        id: 'slide-1',
        imageUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&q=80',
        title: 'Coleção Inverno 2026',
        subtitle: 'Conforto e estilo para os dias frios',
        buttonText: 'Ver coleção',
        buttonUrl: '/shop?new=true',
      },
      {
        id: 'slide-2',
        imageUrl: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1600&q=80',
        title: 'Novidades chegando',
        subtitle: 'As peças mais fofas para os pequenos',
        buttonText: 'Explorar',
        buttonUrl: '/shop',
      },
    ],
  },
  homeSections: [
    { id: 'benefits',   type: 'banner',     title: 'Benefícios',           visible: true },
    { id: 'categories', type: 'categories',  title: 'Categorias',           visible: true },
    { id: 'featured',   type: 'featured',    title: 'Destaques da Coleção', visible: true },
    { id: 'promo',      type: 'promo',       title: 'Banner Promocional',   visible: true,
      imageUrl: '',
      promoText: 'Até 30% OFF na coleção de inverno!', promoButtonText: 'Aproveitar agora' },
  ],
  theme: {
    primaryColor: '#1B2D5E',
    accentColor: '#E91E8C',
    fontFamily: 'Nunito',
    borderRadius: 'rounded',
  },
  shippingOptions: [
    {
      id: 'sh1',
      name: 'PAC (Correios)',
      description: 'Entrega econômica pelos Correios',
      price: 19.90,
      estimatedDays: '7 a 12 dias úteis',
      active: true,
    },
    {
      id: 'sh2',
      name: 'SEDEX (Correios)',
      description: 'Entrega expressa pelos Correios',
      price: 34.90,
      estimatedDays: '2 a 4 dias úteis',
      active: true,
    },
    {
      id: 'sh3',
      name: 'Motoboy Local',
      description: 'Apenas para Volta Redonda e região',
      price: 15.00,
      estimatedDays: 'Mesmo dia ou próximo dia',
      active: true,
    },
    {
      id: 'sh4',
      name: 'Retirada na Loja',
      description: 'Rua Dom João Braga, 236 - Alto da Serra',
      price: 0,
      estimatedDays: 'Agendamento pelo WhatsApp',
      active: true,
    },
  ],
}

// ─── PERMISSÕES PADRÃO DO DONO ─────────────────────────────────────────────
export const DEFAULT_OWNER_PERMISSIONS: OwnerPermissions = {
  canManageProducts: true,
  canManagePromotions: true,
  canViewOrders: true,
  canUpdateOrderStatus: true,
  canViewFinancial: true,
  canEditSiteContent: false,
  canManageShipping: true,
  canManagePaymentGateway: false,
}

// ─── CUPONS ────────────────────────────────────────────────────────────────
export const INITIAL_COUPONS: Coupon[] = []
