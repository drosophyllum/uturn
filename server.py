import threading
import BaseHTTPServer
import SimpleHTTPServer
import os
import subprocess
PORT = 8080


class TestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    """The test example handler."""

    def do_POST(self):
        """Handle a post request by returning the square of the number."""
        length = int(self.headers.getheader('content-length'))
        data_string = self.rfile.read(length)

        try:
            subprocess.call(['./youtube2png.py', data_string])
            result = data_string
        except Exception as e:
            result = 'error'+e.strerror
        self.wfile.write(result)

def start_server():
    """Start the server."""
    server_address = ("", PORT)
    server = BaseHTTPServer.HTTPServer(server_address, TestHandler)
    server.serve_forever()

if __name__ == "__main__":
    start_server()
