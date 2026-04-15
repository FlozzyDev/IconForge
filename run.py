import subprocess
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(ROOT, ".venv", "Scripts", "python.exe")

BACKEND_PORT = 8000
FRONTEND_PORT = 5173


def _kill(pid: str, reason: str) -> None:
    print(f"Killing {reason} (pid {pid})")
    subprocess.run(
        ["taskkill", "/F", "/PID", pid],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def pids_on_port(port: int) -> set[str]:
    try:
        out = subprocess.check_output(
            ["netstat", "-ano", "-p", "tcp"], text=True, stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError:
        return set()

    pids = set()
    needle = f":{port}"
    for line in out.splitlines():
        parts = line.split()
        if len(parts) < 5 or parts[0] != "TCP":
            continue
        local, _remote, state, pid = parts[1], parts[2], parts[3], parts[4]
        if state == "LISTENING" and local.endswith(needle):
            pids.add(pid)
    return pids


def pids_matching_cmdline(needles: list[str]) -> set[str]:
    """Find python.exe PIDs whose command line contains any of the needles."""
    ps_cmd = (
        "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
        "Select-Object ProcessId,CommandLine | Format-Table -HideTableHeaders -AutoSize -Wrap"
    )
    try:
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return set()

    pids = set()
    for line in out.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split(None, 1)
        if len(parts) < 2 or not parts[0].isdigit():
            continue
        pid, cmdline = parts[0], parts[1]
        if any(n in cmdline for n in needles):
            pids.add(pid)
    return pids


def cleanup_stale() -> None:
    targets: dict[str, str] = {}
    for pid in pids_on_port(BACKEND_PORT):
        targets[pid] = f"listener on :{BACKEND_PORT}"
    for pid in pids_on_port(FRONTEND_PORT):
        targets[pid] = f"listener on :{FRONTEND_PORT}"
    for pid in pids_matching_cmdline(["uvicorn", "backend.api.app"]):
        targets.setdefault(pid, "orphan uvicorn process")
    for pid, reason in targets.items():
        _kill(pid, reason)


cleanup_stale()

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
