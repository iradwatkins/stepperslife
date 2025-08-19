#!/usr/bin/env python3
import subprocess
import sys
import os
import time
import select

# Change to project directory
os.chdir("/Users/irawatkins/Documents/Coolify Managment Folder/stepperslife")

# Clear CONVEX_DEPLOYMENT to try anonymous mode
os.environ["CONVEX_DEPLOYMENT"] = ""

print("Starting Convex deployment...")
print("=" * 50)

# Create a process with pseudo-terminal
import pty
import termios
import tty

master, slave = pty.openpty()

# Start the convex process
process = subprocess.Popen(
    ["npx", "convex", "dev", "--once"],
    stdin=slave,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=0
)

# Close slave in parent
os.close(slave)

# Set non-blocking on master
import fcntl
flags = fcntl.fcntl(master, fcntl.F_GETFL)
fcntl.fcntl(master, fcntl.F_SETFL, flags | os.O_NONBLOCK)

output_buffer = ""
responded_to_login = False
responded_to_account = False

try:
    while True:
        # Check if process has terminated
        if process.poll() is not None:
            break
            
        # Try to read output
        try:
            chunk = os.read(master, 1024).decode('utf-8', errors='ignore')
            if chunk:
                output_buffer += chunk
                print(chunk, end='', flush=True)
                
                # Auto-respond to prompts
                if "Would you like to login to your account?" in output_buffer and not responded_to_login:
                    print("\n[Auto-responding: No - Try without account]")
                    os.write(master, b"n\n")
                    responded_to_login = True
                    
                elif "Try Convex without an account" in output_buffer and not responded_to_account:
                    print("\n[Auto-responding: Yes - Try without account]")
                    os.write(master, b"y\n")
                    responded_to_account = True
                    
                elif "Device name:" in output_buffer:
                    print("\n[Auto-responding: Device name]")
                    os.write(master, b"stepperslife-server\n")
                    
                elif "project name" in output_buffer.lower():
                    print("\n[Auto-responding: Project name]")
                    os.write(master, b"stepperslife\n")
                    
        except OSError:
            # No data available
            time.sleep(0.1)
            
except KeyboardInterrupt:
    print("\n\nDeployment interrupted by user")
    process.terminate()
    
finally:
    os.close(master)
    process.wait()
    
print("\n" + "=" * 50)
print("Convex deployment process completed!")

# Check if .env.local was updated
if os.path.exists(".env.local"):
    with open(".env.local", "r") as f:
        content = f.read()
        if "NEXT_PUBLIC_CONVEX_URL=https://" in content:
            print("✅ Success! Convex URL has been configured.")
            print("\nYou can now run: npm run dev")
        else:
            print("⚠️  Convex URL not found in .env.local")
            print("You may need to run: npx convex dev")