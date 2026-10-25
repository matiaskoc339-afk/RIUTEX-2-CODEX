"""Servidor efímero local para que las pruebas no dependan de procesos anteriores."""
from contextlib import contextmanager
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import os

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

def start_new_game(page, first_person=None):
    """Recorre la elección real; conserva la preferencia que esperaba cada suite."""
    if first_person is None:
        first_person = page.evaluate("typeof FirstPerson!=='undefined'&&FirstPerson.enabled")
    page.click('#bNew')
    if page.locator('#perspectiveChoice').count():
        page.wait_for_selector('#perspectiveChoice:not(.hidden)')
        page.click('#bPerspectivePOV' if first_person else '#bPerspectiveTopdown')

@contextmanager
def local_server(root):
    configured = os.environ.get('RIUTEX_TEST_URL')
    if configured:
        yield configured.rstrip('/')
        return
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=1)
