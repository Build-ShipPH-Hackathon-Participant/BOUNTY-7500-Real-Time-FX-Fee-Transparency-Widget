import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import jsQR from 'jsqr'

/**
 * Validates if a string is a valid cryptocurrency withdrawal address
 * Supports multiple blockchain address formats
 */
function isValidWithdrawalAddress(address: string): boolean {
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

  return addressPatterns.some(pattern => pattern.test(address))
}

/**
 * POST /api/qr-scan
 * Uploads a QR code image and extracts the withdrawal address
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image file.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Load and process image with sharp
    const image = sharp(buffer)
    
    // Convert to RGBA format for jsQR
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    
    const imageData = {
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
    }

    // Decode QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height)

    if (!qrCode) {
      return NextResponse.json(
        { error: 'No QR code found in the uploaded image' },
        { status: 404 }
      )
    }

    const decodedText = qrCode.data

    // Validate that the decoded text is a withdrawal address
    if (!isValidWithdrawalAddress(decodedText)) {
      return NextResponse.json(
        { 
          error: 'QR code does not contain a valid withdrawal address',
          decodedText: decodedText.substring(0, 20) + '...' // Partial for debugging
        },
        { status: 400 }
      )
    }

    // Return the validated withdrawal address
    return NextResponse.json({
      success: true,
      address: decodedText,
      format: qrCode.format || 'unknown',
    })

  } catch (error) {
    console.error('QR scan error:', error)
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('not a supported')) {
        return NextResponse.json(
          { error: 'Unsupported image format. Please use PNG, JPG, or JPEG.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to process QR code: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the QR code' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload QR code images.' },
    { status: 405 }
  )
}

