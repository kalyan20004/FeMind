import subprocess
import webbrowser
import time
import sys
import os

def main():
    print("="*50)
    print("Starting FeMind Local Deployment...")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")
    
    # Safely locate executables to avoid Windows orphan process issues
    uvicorn_path = os.path.join(backend_dir, "venv", "Scripts", "uvicorn.exe")
    npm_path = "npm.cmd" if os.name == 'nt' else "npm"
    
    print("[1/3] Starting Backend (FastAPI on port 8000)...")
    backend_process = subprocess.Popen([uvicorn_path, "main:app", "--port", "8000"], cwd=backend_dir)
    
    print("[2/3] Starting Frontend (Vite on port 5173)...")
    frontend_process = subprocess.Popen([npm_path, "run", "dev"], cwd=frontend_dir)
    
    print("\nWaiting for servers to spin up...")
    time.sleep(5)  # Give Vite a few seconds to bind to the port
    
    print("[3/3] Opening browser to http://localhost:5173...")
    webbrowser.open("http://localhost:5173")
    
    print("\n" + "="*50)
    print("FeMind is now running live!")
    print("Press Ctrl+C in this terminal to safely stop both servers.")
    print("="*50 + "\n")
    
    try:
        # Keep the script alive while servers run
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down FeMind servers cleanly...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
