'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, CheckCircle2, X, AlertCircle, Upload } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import jsQR from 'jsqr'
import { cn } from '@/lib/utils'
import { ITEM_VARIANTS } from '../constants'
import { scanQRCodeFromFile } from '../services/qrScanService'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  labelClass: string
}

/**
 * Scan QR code from image file using jsQR library
 * This doesn't require a DOM element unlike Html5Qrcode
 * Includes multiple detection attempts with image preprocessing
 */
async function scanFileWithJsQR(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Try multiple detection strategies
        const result = tryMultipleDetectionStrategies(img)
        resolve(result)
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Try multiple detection strategies to find QR code
 */
function tryMultipleDetectionStrategies(img: HTMLImageElement): string | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  
  if (!ctx) return null
  
  // Strategy 1: Original image
  let result = scanAtScale(img, canvas, ctx, 1)
  if (result) return result
  
  // Strategy 2: Scale down large images (QR might be too detailed)
  if (img.width > 1000 || img.height > 1000) {
    const scale = 800 / Math.max(img.width, img.height)
    result = scanAtScale(img, canvas, ctx, scale)
    if (result) return result
  }
  
  // Strategy 3: Scale up small images
  if (img.width < 300 || img.height < 300) {
    result = scanAtScale(img, canvas, ctx, 2)
    if (result) return result
  }
  
  // Strategy 4: Convert to grayscale with high contrast
  result = scanWithGrayscale(img, canvas, ctx)
  if (result) return result
  
  // Strategy 5: Invert colors (for inverted QR codes)
  result = scanWithInvertedColors(img, canvas, ctx)
  if (result) return result
  
  // Strategy 6: Try with binarization (black/white threshold)
  result = scanWithBinarization(img, canvas, ctx)
  if (result) return result
  
  return null
}

function scanAtScale(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  scale: number
): string | null {
  canvas.width = Math.floor(img.width * scale)
  canvas.height = Math.floor(img.height * scale)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  })
  
  return code?.data || null
}

function scanWithGrayscale(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): string | null {
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Convert to grayscale with contrast enhancement
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    // Increase contrast
    const enhanced = ((gray - 128) * 1.5) + 128
    const clamped = Math.max(0, Math.min(255, enhanced))
    data[i] = data[i + 1] = data[i + 2] = clamped
  }
  
  ctx.putImageData(imageData, 0, 0)
  const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(processedData.data, processedData.width, processedData.height, {
    inversionAttempts: 'attemptBoth',
  })
  
  return code?.data || null
}

function scanWithInvertedColors(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): string | null {
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Invert colors
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]
    data[i + 1] = 255 - data[i + 1]
    data[i + 2] = 255 - data[i + 2]
  }
  
  ctx.putImageData(imageData, 0, 0)
  const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(processedData.data, processedData.width, processedData.height)
  
  return code?.data || null
}

function scanWithBinarization(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): string | null {
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Adaptive binarization threshold (Otsu-like simplified)
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
  }
  const threshold = sum / (data.length / 4)
  
  // Apply threshold
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const binary = gray > threshold ? 255 : 0
    data[i] = data[i + 1] = data[i + 2] = binary
  }
  
  ctx.putImageData(imageData, 0, 0)
  const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(processedData.data, processedData.width, processedData.height, {
    inversionAttempts: 'attemptBoth',
  })
  
  return code?.data || null
}

export function QRScanner({ onScanSuccess, labelClass }: QRScannerProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(true) // Start open by default
  const [scanError, setScanError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [qrDetected, setQrDetected] = useState(false)
  const [lastScannedText, setLastScannedText] = useState<string | null>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const scannerStartedRef = useRef(false)

  const handleScanSuccess = (decodedText: string) => {
    if (decodedText) {
      setQrDetected(true)
      setLastScannedText(decodedText)
      // Auto-fill after a brief delay to show the success indicator
      setTimeout(() => {
        onScanSuccess(decodedText)
        stopScanner()
        setIsScannerOpen(false)
      }, 1000)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setScanError('Please upload an image file (PNG, JPG, etc.)')
      return
    }

    try {
      setScanError(null)
      setQrDetected(false)
      setIsScanning(true)

      // Try backend API first for better validation
      try {
        const result = await scanQRCodeFromFile(file)
        
        if (result.success && result.address) {
          handleScanSuccess(result.address)
          return
        } else if (result.error) {
          // If backend fails, fallback to frontend scanning
          throw new Error(result.error)
        }
      } catch (backendError) {
        // Fallback to frontend scanning if backend fails
        console.log('Backend scan failed, trying frontend scan:', backendError)
      }

      // Fallback: Use jsQR to scan from file (frontend) - doesn't require DOM element
      const decodedText = await scanFileWithJsQR(file)
      
      if (decodedText) {
        handleScanSuccess(decodedText)
      } else {
        throw new Error('No QR code found in the uploaded image')
      }
    } catch (err: any) {
      console.error('Failed to scan QR code from file:', err)
      setIsScanning(false)
      
      if (err.message?.includes('No QR code found') || err.message?.includes('not found')) {
        setScanError('No QR code found in the uploaded image. Please try another image.')
      } else if (err.message?.includes('valid withdrawal address')) {
        setScanError('QR code does not contain a valid withdrawal address. Please ensure the QR code contains a cryptocurrency address.')
      } else {
        setScanError(`Failed to scan QR code: ${err.message || 'Unknown error'}`)
      }
    } finally {
      // Reset file input
      event.target.value = ''
    }
  }

  const handleScanError = (error: string) => {
    // Ignore not found errors (just means no QR code in view)
    if (error && !error.includes('NotFoundException')) {
      console.error('QR Scanner Error:', error)
    }
  }

  const startScanner = async () => {
    if (!scannerContainerRef.current) return

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setScanError('Camera access requires a secure connection (HTTPS). Please use HTTPS or localhost.')
      setIsScanning(false)
      return
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError('Camera access is not supported in this browser. Please use a modern browser.')
      setIsScanning(false)
      return
    }

    // Check camera permission status if Permissions API is available
    let permissionStatus: PermissionState | null = null
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
        permissionStatus = result.state
      }
    } catch {
      // Permissions API might not be supported, continue anyway
    }

    try {
      setScanError(null)
      setIsScanning(false)
      setQrDetected(false)

      const html5QrCode = new Html5Qrcode(scannerContainerRef.current.id)
      html5QrCodeRef.current = html5QrCode

      // Get available cameras (this will also request permission)
      const devices = await Html5Qrcode.getCameras()
      
      if (devices && devices.length > 0) {
        // Try to use back camera first, fallback to first available
        const cameraId = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        )?.id || devices[0].id

        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          handleScanSuccess,
          handleScanError
        )
        scannerStartedRef.current = true
        setIsScanning(true)
      } else {
        throw new Error('No cameras found')
      }
    } catch (err: any) {
      console.error('Failed to start scanner:', err)
      setIsScanning(false)
      
      // Clean up if scanner was partially initialized
      if (html5QrCodeRef.current && scannerStartedRef.current) {
        try {
          const scannerState = html5QrCodeRef.current.getState()
          // Use string comparison instead of enum
          if (scannerState === 2 || scannerState === 'SCANNING') {
            await html5QrCodeRef.current.stop().catch(() => {})
          }
          html5QrCodeRef.current.clear()
        } catch {
          // Ignore cleanup errors
        }
        html5QrCodeRef.current = null
        scannerStartedRef.current = false
      } else if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
        scannerStartedRef.current = false
      }
      
      // Provide helpful error messages
      const isCursorBrowser = navigator.userAgent.includes('Cursor')
      
      if (err.name === 'NotAllowedError' || err.message?.includes('permission') || err.message?.includes('denied') || permissionStatus === 'denied') {
        if (isCursorBrowser) {
          setScanError(
            'Camera permission denied in Cursor browser. ' +
            'To enable camera access:\n\n' +
            '1. Go to Cursor Settings → Privacy & Security\n' +
            '2. Find "Site Settings" or "Camera" permissions\n' +
            '3. Allow camera access for this site\n' +
            '4. Refresh the page and try again'
          )
        } else {
          setScanError(
            'Camera permission denied. ' +
            'Please click the camera/lock icon in your browser\'s address bar and allow camera access, ' +
            'or check your browser settings and try again.'
          )
        }
      } else if (err.name === 'NotFoundError' || err.message?.includes('No cameras')) {
        setScanError('No camera found. Please connect a camera and try again.')
      } else if (err.message?.includes('secure connection')) {
        setScanError(err.message)
      } else {
        setScanError(`Failed to access camera: ${err.message || 'Unknown error'}`)
      }
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scannerStartedRef.current) {
      try {
        // Check if scanner is actually running before stopping
        const scannerState = html5QrCodeRef.current.getState()
        // Use string/number comparison instead of enum
        if (scannerState === 2 || scannerState === 'SCANNING' || String(scannerState).includes('SCANNING')) {
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
      } catch (err: any) {
        // Ignore "scanner is not running" errors - these are harmless
        const errorMessage = err?.message || err?.toString() || ''
        if (!errorMessage.includes('not running') && 
            !errorMessage.includes('not started') &&
            !errorMessage.includes('Cannot stop')) {
          console.error('Error stopping scanner:', err)
        }
      } finally {
        html5QrCodeRef.current = null
        scannerStartedRef.current = false
      }
    } else if (html5QrCodeRef.current) {
      html5QrCodeRef.current.clear()
      html5QrCodeRef.current = null
      scannerStartedRef.current = false
    }
    setIsScanning(false)
  }

  const handleToggleScanner = () => {
    if (isScannerOpen) {
      stopScanner()
      setIsScannerOpen(false)
    } else {
      setIsScannerOpen(true)
    }
  }

  // Start scanner when component mounts or when opened
  useEffect(() => {
    if (isScannerOpen && !scanError && scannerContainerRef.current) {
      const timer = setTimeout(() => {
        startScanner()
      }, 300)
      
      return () => {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  if (!isScannerOpen) {
    return (
      <motion.div className="mb-4" variants={ITEM_VARIANTS}>
        <div className="flex gap-2">
          <button
            onClick={handleToggleScanner}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300',
              'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700',
              'hover:bg-[#FFC828] hover:border-[#FFC828]',
              labelClass
            )}
          >
            <Scan className="w-5 h-5" />
            <span>Open QR Scanner</span>
          </button>
          <label
            htmlFor="qr-file-upload-collapsed"
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 cursor-pointer',
              'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700',
              'hover:bg-[#FFC828] hover:border-[#FFC828]',
              labelClass
            )}
            title="Upload QR code image"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload</span>
            <input
              id="qr-file-upload-collapsed"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload QR code image"
            />
          </label>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className="mb-4" variants={ITEM_VARIANTS}>
      <div className="flex items-center justify-between mb-2">
        <label className={cn('block text-sm font-medium transition-colors duration-300', labelClass)}>
          QR Code Scanner
        </label>
        <div className="flex items-center gap-2">
          {/* Upload QR Code Button */}
          <label
            htmlFor="qr-file-upload"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Upload QR code image"
          >
            <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <input
              id="qr-file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload QR code image"
            />
          </label>
          <button
            onClick={handleToggleScanner}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-black">
        {scanError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
            <div className="text-sm text-red-600 dark:text-red-400 text-center whitespace-pre-line mb-4">
              {scanError}
            </div>
            <button
              onClick={() => {
                setScanError(null)
                startScanner()
              }}
              className="px-4 py-2 bg-[#FFC828] text-black rounded-lg font-medium hover:bg-[#FFC828]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full aspect-square">
              <div 
                id="qr-reader"
                ref={scannerContainerRef}
                className="w-full h-full"
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-white text-center">
                    <Scan className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm">Initializing camera...</p>
                  </div>
                </div>
              )}
              
              {/* QR Detection Success Indicator */}
              <AnimatePresence>
                {qrDetected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-green-500/90 z-20"
                  >
                    <div className="text-white text-center">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-3" />
                      <p className="text-lg font-semibold mb-1">QR Code Detected!</p>
                      <p className="text-sm opacity-90">Filling address...</p>
                      {lastScannedText && (
                        <p className="text-xs mt-2 opacity-75 font-mono break-all px-4">
                          {lastScannedText.substring(0, 30)}...
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {isScanning && !qrDetected && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Scanning for QR code...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {isScanning && !qrDetected && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Point your camera at a QR code to scan
        </p>
      )}
    </motion.div>
  )
}

