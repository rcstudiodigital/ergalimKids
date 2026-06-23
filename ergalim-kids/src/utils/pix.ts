/**
 * Gerador de PIX "Copia e Cola" (BR Code / padrão EMV do Banco Central)
 * Monta o código com o VALOR já embutido, para o cliente pagar o valor exato.
 *
 * Não depende de API externa — é o padrão oficial montado localmente.
 * O pagamento é confirmado manualmente pelo lojista (PIX estático com valor).
 */

// Monta um campo no formato EMV: ID + tamanho(2 dígitos) + valor
function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

// Cálculo do CRC16-CCITT (polinômio 0x1021) exigido pelo padrão PIX
function crc16(payload: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xFFFF
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Remove acentos e limita tamanho (nome e cidade não podem ter caracteres especiais)
function sanitize(text: string, max: number): string {
  return text
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // tira acentos
    .replace(/[^a-zA-Z0-9 ]/g, '')                      // só letras/números/espaço
    .toUpperCase()
    .trim()
    .slice(0, max)
}

// Formata a chave conforme o tipo (telefone precisa do +55, etc)
function formatKey(key: string, keyType: string): string {
  const clean = key.trim()
  switch (keyType) {
    case 'phone': {
      // Telefone PIX deve estar no formato +5521999999999
      const digits = clean.replace(/\D/g, '')
      if (digits.startsWith('55')) return `+${digits}`
      return `+55${digits}`
    }
    case 'cpf':
    case 'cnpj':
      return clean.replace(/\D/g, '')   // só números
    case 'email':
      return clean.toLowerCase()
    default:
      return clean                       // chave aleatória: como está
  }
}

export interface PixParams {
  key: string          // chave PIX do recebedor
  keyType: string      // cpf | cnpj | email | phone | random
  holderName: string   // nome do titular
  city: string         // cidade do titular
  amount: number       // valor da compra
  txid?: string        // identificador (ex: número do pedido)
}

/**
 * Gera o código PIX Copia e Cola com o valor embutido.
 * Retorna a string que vai no campo de copiar e também vira QR Code.
 */
export function generatePixCode(params: PixParams): string {
  const { key, keyType, holderName, city, amount, txid } = params

  const pixKey = formatKey(key, keyType)
  const name = sanitize(holderName || 'ERGALIM KIDS', 25)
  const merchantCity = sanitize(city || 'PETROPOLIS', 15)
  const reference = sanitize(txid || '***', 25) || '***'

  // Merchant Account Information (GUI do PIX + chave)
  const gui = emv('00', 'br.gov.bcb.pix')
  const keyField = emv('01', pixKey)
  const merchantAccount = emv('26', gui + keyField)

  // Valor da transação (formato 0.00)
  const txAmount = amount.toFixed(2)

  // Additional Data Field (campo 62) com o txid (referência do pedido)
  const txidField = emv('05', reference)
  const additionalData = emv('62', txidField)

  // Monta o payload (sem o CRC ainda)
  let payload =
    emv('00', '01') +                       // Payload Format Indicator
    emv('01', '12') +                        // Point of Initiation (12 = reutilizável com valor)
    merchantAccount +                        // chave PIX
    emv('52', '0000') +                      // Merchant Category Code
    emv('53', '986') +                       // Moeda (986 = BRL)
    emv('54', txAmount) +                    // VALOR
    emv('58', 'BR') +                        // País
    emv('59', name) +                        // Nome do recebedor
    emv('60', merchantCity) +                // Cidade
    additionalData                           // txid

  // Adiciona o campo do CRC (63) e calcula
  payload += '6304'
  const crc = crc16(payload)

  return payload + crc
}
