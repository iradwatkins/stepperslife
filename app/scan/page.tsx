'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CheckCircle, XCircle, AlertCircle, Camera, Flashlight, RefreshCw } from 'lucide-react';

interface ScanResult {
  id: string;
  eventId: string;
  userId: string;
  timestamp: number;
  backup: string;
  type: string;
}

export default function QRScannerPage() {
  const { user, isSignedIn } = useAuth();
  const router = useRouter();
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Check if user has permission to scan
  const checkInTicket = useMutation(api.tickets.checkInTicket);
  const validateBackupCode = useMutation(api.tickets.validateBackupCode);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (scannerRef.current && !scanner && isScanning) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      );

      html5QrcodeScanner.render(
        async (decodedText: string) => {
          try {
            // Parse QR code data
            const qrData: ScanResult = JSON.parse(decodedText);
            setScanResult(qrData);
            setIsScanning(false);
            
            // Stop scanning
            await html5QrcodeScanner.clear();
            
            // Process check-in
            await processCheckIn(qrData.id as Id<"tickets">);
          } catch (err) {
            // If not JSON, try as plain ticket ID
            if (typeof decodedText === 'string' && decodedText.length > 0) {
              setScanResult({ id: decodedText } as ScanResult);
              setIsScanning(false);
              await html5QrcodeScanner.clear();
              await processCheckIn(decodedText as Id<"tickets">);
            } else {
              setError('Invalid QR code format');
            }
          }
        },
        (errorMessage: string) => {
          // Ignore continuous scan errors
          if (!errorMessage.includes('NotFoundException')) {
            console.error('QR Scan error:', errorMessage);
          }
        }
      );

      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const processCheckIn = async (ticketId: Id<"tickets">) => {
    try {
      const result = await checkInTicket({
        ticketId,
        checkInBy: user?.emailAddresses[0]?.emailAddress || 'unknown',
        checkInMethod: 'qr',
      });

      if (result.success) {
        setScanResult(prev => ({ ...prev!, status: 'success' } as any));
      } else {
        setError(result.message || 'Check-in failed');
        setScanResult(prev => ({ ...prev!, status: 'error' } as any));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process check-in');
      setScanResult(prev => ({ ...prev!, status: 'error' } as any));
    }
  };

  const handleManualEntry = async () => {
    if (!manualCode) return;

    try {
      const cleanCode = manualCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const result = await validateBackupCode({
        backupCode: cleanCode,
        checkInBy: user?.emailAddresses[0]?.emailAddress || 'unknown',
      });

      if (result.success) {
        setScanResult({ 
          id: result.ticketId,
          status: 'success'
        } as any);
        setIsScanning(false);
      } else {
        setError(result.message || 'Invalid backup code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate backup code');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setManualCode('');
    setIsScanning(true);
  };

  const toggleFlashlight = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        });
        setFlashlightOn(!flashlightOn);
      }
    } catch (err) {
      console.error('Flashlight not supported:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Ticket Scanner</h1>
            <p className="text-purple-100">Scan QR codes or enter backup codes</p>
          </div>

          {/* Scanner Area */}
          <div className="p-6">
            {isScanning && !scanResult ? (
              <>
                <div id="qr-reader" ref={scannerRef} className="mb-6" />
                
                {/* Scanner Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={toggleFlashlight}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      flashlightOn 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Flashlight size={20} />
                    {flashlightOn ? 'Flashlight On' : 'Flashlight Off'}
                  </button>
                </div>

                {/* Manual Entry */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Manual Entry</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="Enter backup code (XXX-XXX)"
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={7}
                    />
                    <button
                      onClick={handleManualEntry}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </>
            ) : scanResult ? (
              <div className="text-center py-12">
                {scanResult.status === 'success' ? (
                  <>
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Check-in Successful!</h2>
                    <p className="text-gray-600 mb-6">Ticket ID: {scanResult.id}</p>
                  </>
                ) : scanResult.status === 'error' ? (
                  <>
                    <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Check-in Failed</h2>
                    <p className="text-gray-600 mb-6">{error || 'Invalid or already used ticket'}</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-yellow-600 mb-2">Processing...</h2>
                  </>
                )}
                
                <button
                  onClick={resetScanner}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition mx-auto"
                >
                  <RefreshCw size={20} />
                  Scan Another Ticket
                </button>
              </div>
            ) : null}

            {/* Error Display */}
            {error && !scanResult && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Scanner: {user?.emailAddresses[0]?.emailAddress}</span>
              <span>Mode: {flashlightOn ? 'Night' : 'Normal'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}