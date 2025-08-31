"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Check, X, QrCode, Hash, Users, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function EventScannerPage() {
  const params = useParams();
  const eventId = params.eventId as Id<"events">;
  const { user, isSignedIn } = useAuth();
  
  const event = useQuery(api.events.getById, { eventId });
  const attendance = useQuery(api.scanning.getEventAttendance, { eventId });
  const scanTicket = useMutation(api.scanning.scanTicket);
  const manualCheckIn = useMutation(api.scanning.manualCheckIn);
  
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error" | "warning" | null;
    message: string;
    details?: any;
  }>({ type: null, message: "" });
  
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  
  // Initialize QR scanner
  useEffect(() => {
    if (showScanner && !isScanning) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById("qr-reader");
        if (!element) {
          console.log("QR reader element not found yet");
          return;
        }
        
        try {
          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
              // Mobile-friendly settings
              videoConstraints: {
                facingMode: "environment", // Use back camera on mobile
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 }
              },
              rememberLastUsedCamera: true,
              showTorchButtonIfSupported: true, // Show flashlight button on mobile
            },
            false
          );
          
          scanner.render(
            async (decodedText) => {
              // Extract ticket ID from URL if it's a full URL
              let ticketId = decodedText;
              if (decodedText.includes("/ticket/")) {
                const parts = decodedText.split("/ticket/");
                ticketId = parts[parts.length - 1];
              }
              
              await handleScan(ticketId, "qr");
              scanner.clear();
              setIsScanning(false);
            },
            (error) => {
              // Ignore scan errors - they happen frequently when no QR code is in view
            }
          );
          
          setIsScanning(true);
        } catch (err) {
          console.error("Failed to initialize QR scanner:", err);
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        try {
          const scanner = Html5QrcodeScanner.getCameras();
          if (scanner) {
            // Clean up scanner if it exists
          }
        } catch (err) {
          // Ignore cleanup errors
        }
        setIsScanning(false);
      };
    }
  }, [showScanner]);
  
  const handleScan = async (ticketIdentifier: string, scanType: "qr" | "manual") => {
    if (!session?.user) {
      setScanResult({
        type: "error",
        message: "Not authenticated",
      });
      return;
    }
    
    try {
      const result = await scanTicket({
        ticketIdentifier,
        eventId,
        scannedBy: session.user.id || session.user.email || "unknown",
        scannerName: session.user.name || "Staff Member",
        scanType,
        deviceInfo: navigator.userAgent,
      });
      
      if (result.scanResult === "valid") {
        setScanResult({
          type: "success",
          message: "✓ Valid Ticket",
          details: result.ticket,
        });
        
        // Add to recent scans
        setRecentScans(prev => [{
          time: new Date().toLocaleTimeString(),
          result: "valid",
          ticket: result.ticket,
        }, ...prev.slice(0, 9)]);
      } else if (result.scanResult === "already_used") {
        setScanResult({
          type: "warning",
          message: "⚠ Already Scanned",
          details: result.ticket,
        });
      } else {
        setScanResult({
          type: "error",
          message: "✗ Invalid Ticket",
        });
      }
    } catch (error) {
      setScanResult({
        type: "error",
        message: "Scan failed",
      });
    }
    
    // Clear result after 5 seconds
    setTimeout(() => {
      setScanResult({ type: null, message: "" });
      setShowScanner(true);
    }, 5000);
  };
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      await handleScan(manualCode.trim().toUpperCase(), "manual");
      setManualCode("");
    }
  };
  
  if (!event || !attendance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <p className="text-gray-600">Event Check-In Scanner</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{attendance.scannedTickets}/{attendance.totalTickets}</div>
              <div className="text-sm text-gray-600">Checked In</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Scanner/Manual Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setShowScanner(true);
                    setShowManual(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                    showScanner && !showManual
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  QR Scanner
                </button>
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setShowManual(true);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                    showManual
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Hash className="w-5 h-5" />
                  Manual Entry
                </button>
              </div>
              
              {/* Scanner Area */}
              {showScanner && !scanResult.type && (
                <div id="qr-reader" className="w-full"></div>
              )}
              
              {/* Manual Entry */}
              {showManual && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter 6-Character Ticket Code
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      placeholder="ABC123"
                      className="w-full px-4 py-3 text-2xl font-mono text-center border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={manualCode.length !== 6}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Check In
                  </button>
                </form>
              )}
              
              {/* Scan Result */}
              {scanResult.type && (
                <div
                  className={`p-6 rounded-lg text-center ${
                    scanResult.type === "success"
                      ? "bg-green-50 border-2 border-green-500"
                      : scanResult.type === "warning"
                      ? "bg-yellow-50 border-2 border-yellow-500"
                      : "bg-red-50 border-2 border-red-500"
                  }`}
                >
                  <div
                    className={`text-4xl font-bold mb-2 ${
                      scanResult.type === "success"
                        ? "text-green-600"
                        : scanResult.type === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {scanResult.message}
                  </div>
                  {scanResult.details && (
                    <div className="mt-4 text-left space-y-2">
                      <p className="font-semibold">{scanResult.details.tableName}</p>
                      {scanResult.details.seatLabel && (
                        <p>{scanResult.details.seatLabel}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-4">Recent Scans</h3>
                <div className="space-y-2">
                  {recentScans.map((scan, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">{scan.ticket?.tableName}</p>
                          <p className="text-sm text-gray-600">{scan.ticket?.seatLabel}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{scan.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Attendance Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Attendance Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Check-in Progress</span>
                    <span>{Math.round(attendance.attendanceRate)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${attendance.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {attendance.scannedTickets}
                    </div>
                    <div className="text-xs text-gray-600">Checked In</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendance.validTickets}
                    </div>
                    <div className="text-xs text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Table Breakdown */}
            {attendance.tableStats && Object.keys(attendance.tableStats).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold mb-4">Table Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(attendance.tableStats).map(([tableName, stats]: [string, any]) => (
                    <div key={tableName}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{tableName}</span>
                        <span>{stats.scanned}/{stats.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(stats.scanned / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}