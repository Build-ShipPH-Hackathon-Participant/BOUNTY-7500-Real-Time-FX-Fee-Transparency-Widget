/**
 * EMVCo QR Code Parser
 * Parses QR codes following the EMVCo QR code standard for payment processing
 * Supports PayMaya, GCash, and other Philippine payment QR codes
 */

export interface EMVCoData {
  // Merchant Information
  merchantName: string | null
  merchantCity: string | null
  merchantId: string | null
  
  // Transaction Details
  transactionAmount: number | null
  transactionCurrency: string | null
  transactionId: string | null
  
  // Payment Provider
  paymentProvider: string | null
  
  // Country
  countryCode: string | null
  
  // Raw data for reference
  rawData: string
}

// EMVCo Tag IDs
const EMVCO_TAGS = {
  PAYLOAD_FORMAT: '00',
  POINT_OF_INITIATION: '01',
  MERCHANT_ACCOUNT_INFO_START: '26',
  MERCHANT_ACCOUNT_INFO_END: '51',
  MERCHANT_CATEGORY_CODE: '52',
  TRANSACTION_CURRENCY: '53',
  TRANSACTION_AMOUNT: '54',
  TIP_INDICATOR: '55',
  COUNTRY_CODE: '58',
  MERCHANT_NAME: '59',
  MERCHANT_CITY: '60',
  POSTAL_CODE: '61',
  ADDITIONAL_DATA: '62',
  CRC: '63',
} as const

// Currency codes mapping
const CURRENCY_CODES: Record<string, string> = {
  '608': 'PHP',
  '764': 'THB',
  '702': 'SGD',
  '360': 'IDR',
  '458': 'MYR',
  '840': 'USD',
}

// Known payment providers
const PAYMENT_PROVIDERS: Record<string, string> = {
  'ph.ppmi.p2m': 'PayMaya',
  'com.paymaya.qr': 'PayMaya',
  'com.globe.gcash': 'GCash',
  'ph.com.bdo': 'BDO',
  'ph.com.bpi': 'BPI',
  'com.unionbank': 'UnionBank',
}

/**
 * Parse EMVCo QR code data
 */
export function parseEMVCoQR(data: string): EMVCoData {
  const result: EMVCoData = {
    merchantName: null,
    merchantCity: null,
    merchantId: null,
    transactionAmount: null,
    transactionCurrency: null,
    transactionId: null,
    paymentProvider: null,
    countryCode: null,
    rawData: data,
  }

  try {
    let position = 0
    
    while (position < data.length - 4) {
      // Read tag (2 digits)
      const tag = data.substring(position, position + 2)
      position += 2
      
      // Read length (2 digits)
      const lengthStr = data.substring(position, position + 2)
      const length = parseInt(lengthStr, 10)
      position += 2
      
      if (isNaN(length) || length <= 0 || position + length > data.length) {
        break
      }
      
      // Read value
      const value = data.substring(position, position + length)
      position += length
      
      // Parse based on tag
      switch (tag) {
        case EMVCO_TAGS.TRANSACTION_CURRENCY:
          result.transactionCurrency = CURRENCY_CODES[value] || value
          break
          
        case EMVCO_TAGS.TRANSACTION_AMOUNT:
          result.transactionAmount = parseFloat(value) || null
          break
          
        case EMVCO_TAGS.COUNTRY_CODE:
          result.countryCode = value
          break
          
        case EMVCO_TAGS.MERCHANT_NAME:
          result.merchantName = value
          break
          
        case EMVCO_TAGS.MERCHANT_CITY:
          result.merchantCity = value
          break
          
        case EMVCO_TAGS.ADDITIONAL_DATA:
          // Parse additional data for transaction ID
          const additionalData = parseAdditionalData(value)
          if (additionalData.transactionId) {
            result.transactionId = additionalData.transactionId
          }
          if (additionalData.paymentProvider) {
            result.paymentProvider = additionalData.paymentProvider
          }
          break
          
        default:
          // Check for merchant account info (tags 26-51)
          const tagNum = parseInt(tag, 10)
          if (tagNum >= 26 && tagNum <= 51) {
            const merchantInfo = parseMerchantAccountInfo(value)
            if (merchantInfo.merchantId) {
              result.merchantId = merchantInfo.merchantId
            }
            if (merchantInfo.paymentProvider && !result.paymentProvider) {
              result.paymentProvider = merchantInfo.paymentProvider
            }
          }
          break
      }
    }
  } catch (error) {
    console.error('Error parsing EMVCo QR:', error)
  }

  return result
}

/**
 * Parse merchant account info sub-fields
 */
function parseMerchantAccountInfo(data: string): { merchantId: string | null; paymentProvider: string | null } {
  const result = {
    merchantId: null as string | null,
    paymentProvider: null as string | null,
  }
  
  try {
    let position = 0
    
    while (position < data.length - 4) {
      const tag = data.substring(position, position + 2)
      position += 2
      
      const lengthStr = data.substring(position, position + 2)
      const length = parseInt(lengthStr, 10)
      position += 2
      
      if (isNaN(length) || length <= 0 || position + length > data.length) {
        break
      }
      
      const value = data.substring(position, position + length)
      position += length
      
      // Tag 00 is usually the payment provider identifier
      if (tag === '00') {
        result.paymentProvider = PAYMENT_PROVIDERS[value] || detectProvider(value)
      }
      // Tag 01 is usually the merchant ID
      else if (tag === '01') {
        result.merchantId = value
      }
    }
  } catch (error) {
    console.error('Error parsing merchant account info:', error)
  }
  
  return result
}

/**
 * Parse additional data field for transaction reference
 */
function parseAdditionalData(data: string): { transactionId: string | null; paymentProvider: string | null } {
  const result = {
    transactionId: null as string | null,
    paymentProvider: null as string | null,
  }
  
  try {
    let position = 0
    
    while (position < data.length - 4) {
      const tag = data.substring(position, position + 2)
      position += 2
      
      const lengthStr = data.substring(position, position + 2)
      const length = parseInt(lengthStr, 10)
      position += 2
      
      if (isNaN(length) || length <= 0 || position + length > data.length) {
        break
      }
      
      const value = data.substring(position, position + length)
      position += length
      
      // Tag 00 in additional data can be provider info
      if (tag === '00') {
        result.paymentProvider = PAYMENT_PROVIDERS[value] || detectProvider(value)
      }
      // Tag 05 is reference label / transaction ID
      else if (tag === '05') {
        result.transactionId = value
      }
    }
  } catch (error) {
    console.error('Error parsing additional data:', error)
  }
  
  return result
}

/**
 * Try to detect payment provider from string
 */
function detectProvider(value: string): string | null {
  const lowerValue = value.toLowerCase()
  
  for (const [key, provider] of Object.entries(PAYMENT_PROVIDERS)) {
    if (lowerValue.includes(key.toLowerCase())) {
      return provider
    }
  }
  
  // Additional pattern matching
  if (lowerValue.includes('paymaya') || lowerValue.includes('maya')) return 'PayMaya'
  if (lowerValue.includes('gcash')) return 'GCash'
  if (lowerValue.includes('bdo')) return 'BDO'
  if (lowerValue.includes('bpi')) return 'BPI'
  if (lowerValue.includes('unionbank')) return 'UnionBank'
  
  return null
}

/**
 * Check if a string looks like an EMVCo QR code
 */
export function isEMVCoQR(data: string): boolean {
  // EMVCo QR codes start with "000201" (payload format indicator)
  return data.startsWith('0002') && data.length > 20
}

/**
 * Format currency amount with proper symbol
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    PHP: '₱',
    THB: '฿',
    SGD: 'S$',
    IDR: 'Rp',
    MYR: 'RM',
    USD: '$',
  }
  
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

