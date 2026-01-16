#!/usr/bin/env python3
"""
Fortnite Vision Agent Calibration Tool
Interactive tool to calibrate UI region coordinates for your resolution.
"""

import sys
import json
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


class CalibrationTool:
      """Interactive calibration tool for vision agent regions."""

    REGIONS = {
              '1': ('hp', 'Health Points'),
              '2': ('shield', 'Shield'),
              '3': ('wood', 'Wood Materials'),
              '4': ('brick', 'Brick Materials'),
              '5': ('metal', 'Metal Materials'),
              '6': ('storm_timer', 'Storm Timer'),
              '7': ('storm_phase', 'Storm Phase'),
              '8': ('player_count', 'Alive Players'),
              '9': ('surge_warning', 'Surge Warning'),
              '0': ('elimination_count', 'Eliminations'),
    }

    COLORS = {
              'hp': (0, 255, 0), 'shield': (255, 200, 0),
              'wood': (0, 150, 255), 'brick': (0, 100, 200), 'metal': (200, 200, 200),
              'storm_timer': (255, 0, 255), 'storm_phase': (255, 100, 255),
              'player_count': (0, 255, 255), 'surge_warning': (0, 0, 255),
              'elimination_count': (255, 255, 0),
    }

    def __init__(self):
              self.screenshot = None
              self.display_image = None
              self.regions = {}
              self.selecting = False
              self.start_point = None
              self.end_point = None
              self.window_name = "Fortnite Vision Agent Calibration"

    def capture_screenshot(self) -> bool:
              try:
                            import bettercam
                            camera = bettercam.create(output_color="BGR")
                            frame = camera.grab()
                            camera.release()
                            if frame is not None:
                                              self.screenshot = frame.copy()
                                              self.display_image = frame.copy()
                                              logger.info(f"Screenshot captured: {frame.shape[1]}x{frame.shape[0]}")
                                              return True
                                          return False
except ImportError:
            logger.error("BetterCam not installed. Run: pip install bettercam")
            return False

    def mouse_callback(self, event, x, y, flags, param):
              if event == cv2.EVENT_LBUTTONDOWN:
                            self.selecting = True
                            self.start_point = (x, y)
                            self.end_point = (x, y)
elif event == cv2.EVENT_MOUSEMOVE and self.selecting:
            self.end_point = (x, y)
            self._update_display()
elif event == cv2.EVENT_LBUTTONUP:
            self.selecting = False
            self.end_point = (x, y)
            self._update_display()

    def _update_display(self):
              self.display_image = self.screenshot.copy()
              for name, region in self.regions.items():
                            color = self.COLORS.get(name, (255, 255, 255))
                            x, y, w, h = region['x'], region['y'], region['width'], region['height']
                            cv2.rectangle(self.display_image, (x, y), (x+w, y+h), color, 2)
                            cv2.putText(self.display_image, name, (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
                        if self.start_point and self.end_point:
                                      cv2.rectangle(self.display_image, self.start_point, self.end_point, (0, 255, 0), 2)

    def assign_region(self, key: str):
              if not self.start_point or not self.end_point or key not in self.REGIONS:
                            return
                        name, desc = self.REGIONS[key]
        x1, y1 = self.start_point
        x2, y2 = self.end_point
        self.regions[name] = {
                      'x': min(x1, x2), 'y': min(y1, y2),
                      'width': abs(x2 - x1), 'height': abs(y2 - y1)
        }
        logger.info(f"Assigned: {name}")
        self.start_point = self.end_point = None
        self._update_display()

    def save_config(self, path: str = "config.json"):
              config = {'regions': {}}
        materials = {}
        for name, region in self.regions.items():
                      if name in ['wood', 'brick', 'metal']:
                                        materials[name] = region
else:
                config['regions'][name] = region
          if materials:
                        config['regions']['materials'] = materials
                    with open(path, 'w') as f:
                                  json.dump(config, f, indent=2)
                              logger.info(f"Saved to {path}")

    def run(self):
              logger.info("FORTNITE VISION AGENT CALIBRATION")
        if not self.capture_screenshot():
                      return
                  cv2.namedWindow(self.window_name, cv2.WINDOW_NORMAL)
        cv2.setMouseCallback(self.window_name, self.mouse_callback)
        self._update_display()
        while True:
                      cv2.imshow(self.window_name, self.display_image)
                      key = cv2.waitKey(1) & 0xFF
                      if chr(key) in self.REGIONS:
                                        self.assign_region(chr(key))
elif key == ord('s'):
                self.save_config()
elif key == ord('r'):
                self.start_point = self.end_point = None
                self._update_display()
elif key == ord('q') or key == 27:
                break
        cv2.destroyAllWindows()


def run_calibration():
      CalibrationTool().run()


if __name__ == "__main__":
      run_calibration()
