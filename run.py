import subprocess
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(ROOT, ".venv", "Scripts", "python.exe")

BACKEND_PORT = 8000
FRONTEND_PORT = 5173


def kill_port(port: int) -> None:
    """Kill any process listening on the given TCP port (Windows)."""
    try:
        out = subprocess.check_output(
            ["netstat", "-ano", "-p", "tcp"], text=True, stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError:
        return

    pids = set()
    needle = f":{port}"
    for line in out.splitlines():
        parts = line.split()
        if len(parts) < 5 or parts[0] != "TCP":
            continue
        local, _remote, state, pid = parts[1], parts[2], parts[3], parts[4]
        if state == "LISTENING" and local.endswith(needle):
            pids.add(pid)

    for pid in pids:
        print(f"Killing stale process on port {port} (pid {pid})")
        subprocess.run(
            ["taskkill", "/F", "/PID", pid],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


kill_port(BACKEND_PORT)
kill_port(FRONTEND_PORT)

backend = subprocess.Popen(
    [VENV_PYTHON, "-m", "uvicorn", "backend.api.app:app", "--reload"],
    cwd=ROOT,
)

frontend = subprocess.Popen(
    ["pnpm", "dev"],
    cwd=os.path.join(ROOT, "frontend"),
    shell=True,
)

try:
    backend.wait()
except KeyboardInterrupt:
    backend.terminate()
    frontend.terminate()
    backend.wait()
    frontend.wait()
