export type UserRole = 'admin' | 'owner' | 'customer'

export interface User {
  id: string; name: string; email: string; role: UserRole; createdAt: string
}

export interface ProductVariant {
  size: string; color: string; stock: number; sku: string
}

export interface Product {
  id: string; name: string; description: string; price: number; originalPrice?: number
  images: string[]; category: 'Masculino' | 'Feminino' | 'Unissex'; subcategory?: string
  variants: ProductVariant[]; tags: string[]; featured: boolean; active: boolean
  createdAt: string; updatedAt: string
}

export interface CartItem {
  product: Product; quantity: number; selectedSize: string; selectedColor: string
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface ShippingAddress {
  name: string; street: string; number: string; complement?: string
  neighborhood: string; city: string; state: string; zipCode: string; phone: string
}

export interface Order {
  id: string; customerId: string; customerName: string; customerEmail: string; customerPhone: string
  items: { productId: string; productName: string; productImage: string; price: number; quantity: number; size: string; color: string }[]
  subtotal: number; shipping: number; discount: number; total: number; status: OrderStatus
  paymentMethod: 'stripe' | 'pix' | 'mercadopago'; paymentId?: string
  shippingAddress: ShippingAddress; trackingCode?: string; notes?: string
  createdAt: string; updatedAt: string
}

export interface Coupon {
  code: string; discount: number; minValue?: number; active: boolean
}

export interface ShippingOption {
  id: string; name: string; description: string; price: number; estimatedDays: string
  active: boolean; icon?: string
}

// ─── CUSTOMIZAÇÃO VISUAL (editável pelo admin) ────────────────────────────
export interface HeroBanner {
  title: string           // ex: "Para Pequenos Grandes Sonhadores"
  subtitle: string        // ex: "Moda infantil com estilo..."
  imageUrl: string        // URL da imagem de fundo
  buttonText: string      // ex: "Explorar coleção"
  buttonUrl: string       // ex: "/shop"
  overlayOpacity: number  // 0–100
}

export interface HomeSection {
  id: string
  type: 'banner' | 'categories' | 'featured' | 'promo'
  title: string
  subtitle?: string
  visible: boolean
  imageUrl?: string       // para seção de promo
  promoText?: string
  promoButtonText?: string
}

export interface SiteTheme {
  primaryColor: string    // ex: "#1B2D5E" (navy)
  accentColor: string     // ex: "#E91E8C" (pink)
  fontFamily: 'Nunito' | 'Inter' | 'Poppins' | 'Montserrat' | 'Roboto'
  borderRadius: 'sharp' | 'medium' | 'rounded'
}

export interface SiteSettings {
  // ── Dados da loja ──────────────────────────────────────────────────────
  storeName: string; storePhone: string; storeWhatsapp: string; storeInstagram: string
  storeAddress: string; storeEmail: string
  // ── Textos padrão ──────────────────────────────────────────────────────
  heroTitle: string; heroSubtitle: string
  // ── Logística ──────────────────────────────────────────────────────────
  freeShippingAbove: number; shippingOptions: ShippingOption[]
  // ── Pagamento ──────────────────────────────────────────────────────────
  paymentGateway: 'stripe' | 'mercadopago' | 'pagarme'
  stripePublicKey: string; mercadopagoPublicKey: string
  // ── E-mails ────────────────────────────────────────────────────────────
  emailNotifyOwner: boolean; emailNotifyCustomer: boolean
  // ── Manutenção ─────────────────────────────────────────────────────────
  maintenanceMode: boolean
  // ── CUSTOMIZAÇÃO VISUAL (admin) ────────────────────────────────────────
  hero: HeroBanner
  homeSections: HomeSection[]
  theme: SiteTheme
}

export interface OwnerPermissions {
  canManageProducts: boolean; canManagePromotions: boolean; canViewOrders: boolean
  canUpdateOrderStatus: boolean; canViewFinancial: boolean
  canEditSiteContent: boolean; canManageShipping: boolean; canManagePaymentGateway: boolean
}

// ─── CLIENTE ──────────────────────────────────────────────────────────────
export interface SavedAddress {
  id: string
  label: string          // ex: "Casa", "Trabalho"
  name: string
  phone: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string
  cpf?: string           // armazenado mascarado, nunca completo no frontend
  birthDate?: string
  addresses: SavedAddress[]
  createdAt: string
}
