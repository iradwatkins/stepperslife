import { NextResponse } from "next/server";

export async function GET() {
  // Test WebSocket connectivity to Convex
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://youthful-porcupine-760.convex.cloud";
  
  // Create a test HTML page that attempts WebSocket connection
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>WebSocket Debug</title>
      <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .success { color: #0f0; }
        .error { color: #f00; }
        .info { color: #ff0; }
        pre { background: #000; padding: 10px; border: 1px solid #0f0; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>🔍 WebSocket Connection Test</h1>
      <div id="status">Testing...</div>
      <pre id="log"></pre>
      
      <script>
        const log = (msg, type = 'info') => {
          const logEl = document.getElementById('log');
          const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
          const className = type;
          logEl.innerHTML += '<span class="' + className + '">[' + timestamp + '] ' + msg + '</span>\\n';
        };
        
        const updateStatus = (msg, type = 'info') => {
          document.getElementById('status').innerHTML = '<span class="' + type + '">' + msg + '</span>';
        };
        
        async function testWebSocket() {
          const convexUrl = '${convexUrl}';
          
          log('Starting WebSocket test...', 'info');
          log('Convex URL: ' + convexUrl, 'info');
          log('Current location: ' + window.location.origin, 'info');
          log('Protocol: ' + window.location.protocol, 'info');
          
          // Test 1: Check if WebSocket is available
          if (!window.WebSocket) {
            log('❌ WebSocket not supported in this browser!', 'error');
            updateStatus('WebSocket not supported', 'error');
            return;
          }
          log('✅ WebSocket API available', 'success');
          
          // Test 2: Try HTTP request first
          try {
            log('Testing HTTP connection to Convex...', 'info');
            const response = await fetch(convexUrl + '/version');
            if (response.ok) {
              const data = await response.text();
              log('✅ HTTP connection successful: ' + data, 'success');
            } else {
              log('⚠️ HTTP returned status: ' + response.status, 'error');
            }
          } catch (err) {
            log('⚠️ HTTP connection failed: ' + err.message, 'error');
          }
          
          // Test 3: Try WebSocket connection
          const wsUrl = convexUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/sync';
          log('Attempting WebSocket connection to: ' + wsUrl, 'info');
          
          try {
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
              log('✅ WebSocket connection opened!', 'success');
              updateStatus('WebSocket Connected!', 'success');
              ws.send(JSON.stringify({ type: 'ping' }));
            };
            
            ws.onmessage = (event) => {
              log('📨 Received message: ' + event.data, 'success');
            };
            
            ws.onerror = (error) => {
              log('❌ WebSocket error occurred', 'error');
              console.error('WebSocket error:', error);
            };
            
            ws.onclose = (event) => {
              log('🔌 WebSocket closed. Code: ' + event.code + ', Reason: ' + event.reason, 'info');
              if (event.code === 1006) {
                log('⚠️ Abnormal closure - likely blocked by proxy or CORS', 'error');
                updateStatus('WebSocket Blocked', 'error');
              }
            };
            
            // Timeout after 10 seconds
            setTimeout(() => {
              if (ws.readyState === WebSocket.CONNECTING) {
                log('⏱️ Connection timeout - WebSocket may be blocked', 'error');
                updateStatus('Connection Timeout', 'error');
                ws.close();
              }
            }, 10000);
            
          } catch (err) {
            log('❌ Failed to create WebSocket: ' + err.message, 'error');
            updateStatus('WebSocket Failed', 'error');
          }
          
          // Test 4: Check Cloudflare headers
          try {
            const cfResponse = await fetch(window.location.origin + '/api/test-convex');
            const cfData = await cfResponse.json();
            log('API test response: ' + JSON.stringify(cfData, null, 2), 'info');
            if (cfData.success && cfData.data && cfData.data.eventCount) {
              log('✅ Backend API working - ' + cfData.data.eventCount + ' events found', 'success');
            }
          } catch (err) {
            log('API test failed: ' + err.message, 'error');
          }
        }
        
        // Run test on load
        testWebSocket();
        
        // Re-run test on button click
        document.addEventListener('DOMContentLoaded', () => {
          const button = document.createElement('button');
          button.textContent = 'Retry Test';
          button.style.marginTop = '20px';
          button.onclick = () => {
            document.getElementById('log').innerHTML = '';
            testWebSocket();
          };
          document.body.appendChild(button);
        });
      </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}