#!/usr/bin/env python3
"""
Fortnite IGL Vision Agent
100% FREE Local AI Screen Reader

Captures Fortnite gameplay, extracts game state via OCR,
and sends real-time data to Discord bot for IGL coaching.

FAIR-PLAY: This is a passive screen reader only.
No memory reading, no input injection - like a coach watching your stream.
"""

import sys
import json
import time
import signal
import argparse
import logging
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent))

from utils.capture import FastCapture, AdaptiveCapture
from utils.ocr import FortniteOCR
from utils.extractor import StateExtractor, GameState
from utils.bridge import VisionBridge, MockBridge

def setup_logging(debug: bool = False):
      level = logging.DEBUG if debug else logging.INFO
      logging.basicConfig(level=level, format='%(asctime)s | %(levelname)7s | %(name)s | %(message)s', datefmt='%H:%M:%S')

logger = logging.getLogger(__name__)

class VisionAgent:
      def __init__(self, config_path: str = "config.json", test_mode: bool = False):
                self.config = self._load_config(config_path)
                self.test_mode = test_mode
                self.extractor = StateExtractor(self.config)
                if test_mode:
                              self.bridge = MockBridge()
else:
            ws_config = self.config.get('websocket', {})
              self.bridge = VisionBridge(host=ws_config.get('host', 'localhost'), port=ws_config.get('port', 8765))
        self._running = False
        self._last_state = None
        self._state_count = 0
        self._start_time = 0
        self._fps_samples = []
        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)

    def _load_config(self, config_path: str) -> dict:
              try:
                            with open(config_path, 'r') as f:
                                              return json.load(f)
                                      except:
                            return {"capture": {"target_fps": 3}, "websocket": {"host": "localhost", "port": 8765}, "ocr": {"gpu": True}, "regions": {}}

    def _handle_shutdown(self, signum, frame):
              self._running = False

    def start(self) -> bool:
              logger.info("=" * 50)
        logger.info("FORTNITE IGL VISION AGENT - 100% FREE Local AI")
        logger.info("=" * 50)
        if not self.extractor.initialize():
                      return False
                  if not self.test_mode:
                                self.bridge.connect()
                            self._running = True
        self._start_time = time.time()
        return True

    def run(self):
              if not self.start():
                            return
                        target_fps = self.config.get('capture', {}).get('target_fps', 3)
        frame_time = 1.0 / target_fps
        try:
                      while self._running:
                                        loop_start = time.time()
                                        state = self.extractor.extract_state()
                                        if state:
                                                              self._state_count += 1
                                                              if self.bridge.is_connected:
                                                                                        self.bridge.send_state(state.to_dict())
                                                                                    if self._state_count % 30 == 0:
                                                                                                              logger.info(f"HP:{state.hp} Shield:{state.shield} Mats:{state.total_mats} Alive:{state.alive_players}")
                                                                                                      elapsed = time.time() - loop_start
                                                          if elapsed < frame_time:
                                                                                time.sleep(frame_time - elapsed)
        except KeyboardInterrupt:
            pass
finally:
            self.stop()

    def stop(self):
              self._running = False
        self.extractor.release()
        self.bridge.disconnect()
        logger.info("Vision Agent stopped")

def main():
      parser = argparse.ArgumentParser(description="Fortnite IGL Vision Agent")
    parser.add_argument('--config', '-c', default='config.json')
    parser.add_argument('--test', '-t', action='store_true')
    parser.add_argument('--debug', '-d', action='store_true')
    args = parser.parse_args()
    setup_logging(args.debug)
    agent = VisionAgent(config_path=args.config, test_mode=args.test)
    agent.run()

if __name__ == "__main__":
      main()
