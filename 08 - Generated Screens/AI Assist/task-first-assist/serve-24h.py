"""Serve site/ locally for review, then stop by itself.

    python3 build.py
    nohup python3 serve-24h.py > /tmp/assist-review.log 2>&1 &

Defaults: port 4331, 24 hours, every network interface (so a phone on the same Wi-Fi can open it).
Args: [port] [hours]. Stop early: kill the PID in serve-24h.pid.
"""
import functools, http.server, os, socket, sys, threading
from pathlib import Path

HERE = Path(__file__).resolve().parent
port = int(sys.argv[1]) if len(sys.argv) > 1 else 4331
hours = float(sys.argv[2]) if len(sys.argv) > 2 else 24

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *a): pass

srv = http.server.ThreadingHTTPServer(('0.0.0.0', port), functools.partial(H, directory=str(HERE / 'site')))
(HERE / 'serve-24h.pid').write_text(str(os.getpid()))
threading.Timer(hours * 3600, srv.shutdown).start()
try:
    lan = socket.gethostbyname(socket.gethostname())
except OSError:
    lan = '?'
print(f'Serving {HERE / "site"} on http://localhost:{port}/date-night/ (LAN {lan}) for {hours} h', flush=True)
srv.serve_forever()
(HERE / 'serve-24h.pid').unlink(missing_ok=True)
