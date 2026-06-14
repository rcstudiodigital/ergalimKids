import type { Product, Order, SiteSettings, OwnerPermissions, Coupon } from '@/types'

// ─── PRODUTOS (com fotos reais da Ergalim Kids) ────────────────────────────
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Conjunto Moletom Feminino "A" Rosa',
    description: 'Conjunto feminino em moletom rosa vibrante com detalhes em branco e letra "A" aplicada. Inclui jaqueta com capuz e zíper + calça jogger combinando. Tecido macio e quentinho, ideal para o dia a dia da criançada com muito estilo.',
    price: 189.90, originalPrice: 239.90,
    images: [
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
    ],
    category: 'Feminino', subcategory: 'Conjuntos',
    variants: [
      { size: '2', color: 'Rosa', stock: 8, sku: 'CF-A-2-RO' },
      { size: '4', color: 'Rosa', stock: 10, sku: 'CF-A-4-RO' },
      { size: '6', color: 'Rosa', stock: 7, sku: 'CF-A-6-RO' },
      { size: '8', color: 'Rosa', stock: 5, sku: 'CF-A-8-RO' },
      { size: '10', color: 'Rosa', stock: 3, sku: 'CF-A-10-RO' },
    ],
    tags: ['conjunto', 'moletom', 'rosa', 'feminino', 'jaqueta'],
    featured: true, active: true,
    createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'p2',
    name: 'Conjunto Masculino STK Bege/Preto',
    description: 'Conjunto masculino premium com jaqueta com capuz estampada e calça jogger. Cores bege e preto com logo STK exclusivo. Visual urbano e moderno para os pequenos fashionistas.',
    price: 199.90, originalPrice: 259.90,
    images: [
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
    ],
    category: 'Masculino', subcategory: 'Conjuntos',
    variants: [
      { size: '2', color: 'Bege/Preto', stock: 5, sku: 'CM-STK-2-BP' },
      { size: '4', color: 'Bege/Preto', stock: 7, sku: 'CM-STK-4-BP' },
      { size: '6', color: 'Bege/Preto', stock: 6, sku: 'CM-STK-6-BP' },
      { size: '8', color: 'Bege/Preto', stock: 4, sku: 'CM-STK-8-BP' },
      { size: '10', color: 'Bege/Preto', stock: 3, sku: 'CM-STK-10-BP' },
    ],
    tags: ['conjunto', 'stk', 'masculino', 'bege', 'preto'],
    featured: true, active: true,
    createdAt: '2025-01-05T10:00:00Z', updatedAt: '2025-01-05T10:00:00Z',
  },
  {
    id: 'p3',
    name: 'Moletom Feminino "R" Pink Neon',
    description: 'Moletom com capuz feminino na cor rosa neon com logo "R" estiloso em destaque. Tecido peluciado por dentro, super quentinho. Atitude e estilo para a sua pequena.',
    price: 169.90,
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80',
    ],
    category: 'Feminino', subcategory: 'Moletons',
    variants: [
      { size: '4', color: 'Rosa Neon', stock: 7, sku: 'MF-R-4-RN' },
      { size: '6', color: 'Rosa Neon', stock: 9, sku: 'MF-R-6-RN' },
      { size: '8', color: 'Rosa Neon', stock: 6, sku: 'MF-R-8-RN' },
      { size: '10', color: 'Rosa Neon', stock: 4, sku: 'MF-R-10-RN' },
    ],
    tags: ['moletom', 'rosa neon', 'feminino', 'capuz'],
    featured: true, active: true,
    createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'p4',
    name: 'Calça Jogger STK Preta',
    description: 'Calça jogger masculina preta com faixa bege lateral e logo STK. Cós elástico, punho no tornozelo, 2 bolsos laterais. Conforto total para brincadeiras e passeios.',
    price: 99.90,
    images: [
      'https://images.unsplash.com/photo-1478546344-e1401e1f4234?w=600&q=80',
    ],
    category: 'Masculino', subcategory: 'Calças',
    variants: [
      { size: '2', color: 'Preto', stock: 9, sku: 'CM-JOG-2-PR' },
      { size: '4', color: 'Preto', stock: 11, sku: 'CM-JOG-4-PR' },
      { size: '6', color: 'Preto', stock: 8, sku: 'CM-JOG-6-PR' },
      { size: '8', color: 'Preto', stock: 6, sku: 'CM-JOG-8-PR' },
    ],
    tags: ['calça', 'jogger', 'masculino', 'preto'],
    featured: false, active: true,
    createdAt: '2025-01-03T10:00:00Z', updatedAt: '2025-01-03T10:00:00Z',
  },
  {
    id: 'p5',
    name: 'Jaqueta Feminina com Capuz Rosa/Branco',
    description: 'Jaqueta com capuz em moletom rosa e mangas brancas com estrelas bordadas. Fechamento em zíper, modelagem confortável e estilosa para meninas que amam aventura.',
    price: 119.90, originalPrice: 149.90,
    images: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
    ],
    category: 'Feminino', subcategory: 'Jaquetas',
    variants: [
      { size: '2', color: 'Rosa/Branco', stock: 6, sku: 'JF-A-2-RB' },
      { size: '4', color: 'Rosa/Branco', stock: 8, sku: 'JF-A-4-RB' },
      { size: '6', color: 'Rosa/Branco', stock: 5, sku: 'JF-A-6-RB' },
      { size: '8', color: 'Rosa/Branco', stock: 2, sku: 'JF-A-8-RB' },
    ],
    tags: ['jaqueta', 'rosa', 'estrelas', 'feminino', 'capuz'],
    featured: true, active: true,
    createdAt: '2025-01-08T10:00:00Z', updatedAt: '2025-01-08T10:00:00Z',
  },
]

// ─── PEDIDOS mock ──────────────────────────────────────────────────────────
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'EK-001', customerId: 'c1', customerName: 'Maria Silva',
    customerEmail: 'maria@email.com', customerPhone: '(24) 99999-0001',
    items: [{ productId: 'p1', productName: 'Conjunto Moletom Feminino "A" Rosa', productImage: '', price: 189.90, quantity: 1, size: '6', color: 'Rosa' }],
    subtotal: 189.90, shipping: 0, discount: 0, total: 189.90,
    status: 'paid', paymentMethod: 'pix',
    shippingAddress: { name: 'Maria Silva', street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'Volta Redonda', state: 'RJ', zipCode: '27200-000', phone: '(24) 99999-0001' },
    createdAt: '2025-01-20T10:30:00Z', updatedAt: '2025-01-20T10:30:00Z',
  },
  {
    id: 'EK-002', customerId: 'c2', customerName: 'João Pereira',
    customerEmail: 'joao@email.com', customerPhone: '(24) 98888-0002',
    items: [
      { productId: 'p2', productName: 'Conjunto Masculino STK Bege/Preto', productImage: '', price: 199.90, quantity: 1, size: '8', color: 'Bege/Preto' },
      { productId: 'p4', productName: 'Calça Jogger STK Preta', productImage: '', price: 99.90, quantity: 1, size: '8', color: 'Preto' },
    ],
    subtotal: 299.80, shipping: 0, discount: 29.98, total: 269.82,
    status: 'shipped', paymentMethod: 'stripe',
    shippingAddress: { name: 'João Pereira', street: 'Av. Brasil', number: '456', neighborhood: 'Bairro Novo', city: 'Barra Mansa', state: 'RJ', zipCode: '27300-000', phone: '(24) 98888-0002' },
    trackingCode: 'BR123456789BR',
    createdAt: '2025-01-19T14:00:00Z', updatedAt: '2025-01-20T08:00:00Z',
  },
  {
    id: 'EK-003', customerId: 'c3', customerName: 'Ana Costa',
    customerEmail: 'ana@email.com', customerPhone: '(24) 97777-0003',
    items: [{ productId: 'p3', productName: 'Moletom Feminino "R" Pink Neon', productImage: '', price: 169.90, quantity: 2, size: '10', color: 'Rosa Neon' }],
    subtotal: 339.80, shipping: 19.90, discount: 0, total: 359.70,
    status: 'pending', paymentMethod: 'pix',
    shippingAddress: { name: 'Ana Costa', street: 'Rua Augusta', number: '789', neighborhood: 'Vila Nova', city: 'Resende', state: 'RJ', zipCode: '27500-000', phone: '(24) 97777-0003' },
    createdAt: '2025-01-20T16:45:00Z', updatedAt: '2025-01-20T16:45:00Z',
  },
]

// ─── CONFIGURAÇÕES (com dados reais da Ergalim Kids) ──────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'Ergalim Kids',
  storePhone: '(24) 99239-1998',
  storeWhatsapp: '5524992391998',
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
    imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1400&q=80',
    buttonText: 'Explorar coleção',
    buttonUrl: '/shop',
    overlayOpacity: 75,
  },
  homeSections: [
    { id: 'benefits',   type: 'banner',     title: 'Benefícios',           visible: true },
    { id: 'categories', type: 'categories',  title: 'Categorias',           visible: true },
    { id: 'featured',   type: 'featured',    title: 'Destaques da Coleção', visible: true },
    { id: 'promo',      type: 'promo',       title: 'Banner Promocional',   visible: true,
      imageUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1200&q=80',
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
export const INITIAL_COUPONS: Coupon[] = [
  { code: 'ERGALIM10', discount: 0.10, minValue: 150, active: true },
  { code: 'KIDS15', discount: 0.15, minValue: 200, active: true },
  { code: 'BEMVINDO', discount: 0.20, minValue: 100, active: true },
]
