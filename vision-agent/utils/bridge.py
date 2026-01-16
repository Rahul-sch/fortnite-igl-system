"""
Vision Bridge - WebSocket client for Discord bot communication
Sends real-time game state via localhost connection
"""
import json
import time
import threading
import queue
import logging

logger = logging.getLogger(__name__)

class VisionBridge:
      def __init__(self, host="localhost", port=8765):
                self.host = host
                self.port = port
                self.uri = f"ws://{host}:{port}"
                self.ws = None
                self._connected = False
                self._send_queue = queue.Queue(maxsize=100)
                self.reconnect_delay = 5

      def connect(self):
                try:
                              import websocket
                              self.ws = websocket.WebSocket()
                              self.ws.connect(self.uri, timeout=10)
                              self._connected = True
                              logger.info(f"Connected to vision server at {self.uri}")
                              return True
except Exception as e:
            logger.warning(f"Could not connect: {e}")
            return False

    def disconnect(self):
              self._connected = False
              if self.ws:
                            try:
                                              self.ws.close()
                                          except:
                pass
                        logger.info("Disconnected from vision server")

    def send_state(self, state_data):
              if not self._connected or not self.ws:
                            return False
                        try:
                                      message = {'type': 'game_state', 'data': state_data, 'timestamp': time.time()}
                                      self.ws.send(json.dumps(message))
                                      return True
except Exception as e:
            logger.error(f"Send failed: {e}")
            self._connected = False
            return False

    def send_event(self, event_type, event_data):
              if not self._connected:
                            return False
                        try:
                                      message = {'type': event_type, 'data': event_data, 'timestamp': time.time()}
                                      self.ws.send(json.dumps(message))
                                      return True
                                  except:
            return False

    @property
    def is_connected(self):
              return self._connected

class MockBridge:
      def __init__(self):
                self._connected = True
            def connect(self): return True
                  def disconnect(self): pass
                        def send_state(self, data): return True
                              def send_event(self, t, d): return True
                                    @property
    def is_connected(self): return True
