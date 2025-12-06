/**
 * Service for QR code scanning via backend API
 */

export interface QRScanResult {
  success: boolean
  address?: string
  error?: string
  format?: string
}

/**
 * Upload QR code image to backend for parsing
 * @param file - The image file containing the QR code
 * @returns Parsed withdrawal address or error
 */
export async function scanQRCodeFromFile(
  file: File
): Promise<QRScanResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please upload an image file (PNG, JPG, etc.)',
      }
    }

    // Create form data
    const formData = new FormData()
    formData.append('image', file)

    // Call backend API
    const response = await fetch('/api/qr-scan', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to scan QR code',
      }
    }

    return {
      success: true,
      address: data.address,
      format: data.format,
    }
  } catch (error) {
    console.error('QR scan service error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to upload and scan QR code',
    }
  }
}

/**
 * Validate withdrawal address format
 * @param address - The address to validate
 * @returns True if address appears valid
 */
export function isValidWithdrawalAddress(address: string): boolean {
  if (!address || address.length < 10) {
    return false
  }

  // Common cryptocurrency address patterns
  const addressPatterns = [
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Bitcoin (Legacy)
    /^bc1[a-z0-9]{39,59}$/, // Bitcoin (Bech32)
    /^0x[a-fA-F0-9]{40}$/, // Ethereum and EVM-compatible chains
    /^[A-Z2-7]{58}$/, // Algorand
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, // Solana
    /^T[A-Za-z1-9]{33}$/, // Tron
    /^[A-Z0-9]{34}$/, // Stellar
    /^[a-z0-9_-]{43,88}$/, // Cosmos/ATOM
    /^[A-Za-z0-9]{26,35}$/, // Ripple/XRP
    /^[a-zA-Z0-9]{26,35}$/, // Cardano
    /^[a-zA-Z0-9]{40,}$/, // Generic hex addresses
  ]

  return addressPatterns.some((pattern) => pattern.test(address))
}


