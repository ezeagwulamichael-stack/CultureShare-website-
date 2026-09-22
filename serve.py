#!/usr/bin/env python3
"""Dev preview server for the CultureShare site.

Plain `http.server` lets the browser cache CSS/JS aggressively, which means
edits can silently fail to show up. This sends no-store on every response so
the preview is always the files as they are on disk.
"""
import functools
import http.server
import socketserver

PORT = 5173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the terminal quiet
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=".")
    with Server(("127.0.0.1", PORT), handler) as httpd:
        print(f"CultureShare preview → http://localhost:{PORT}")
        httpd.serve_forever()
