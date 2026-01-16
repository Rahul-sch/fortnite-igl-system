"""
Fast Screen Capture Module
Uses BetterCam (Desktop Duplication API) for 240+ FPS capable capture
Optimized for minimal CPU/GPU impact during Fortnite gameplay
"""

import time
import numpy as np
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class FastCapture:
      """
          High-performance screen capture using BetterCam.
              Desktop Duplication API captures directly from GPU framebuffer.
                  """

    def __init__(self, monitor: int = 0, target_fps: int = 3):
              self.monitor = monitor
              self.target_fps = target_fps
              self.frame_time = 1.0 / target_fps
              self.camera = None
              self.last_capture = 0
              self._initialized = False

    def initialize(self) -> bool:
              try:
                            import bettercam
                            self.camera = bettercam.create(output_idx=self.monitor, output_color="BGR")
                            self._initialized = True
                            logger.info(f"FastCapture initialized on monitor {self.monitor}")
                            return True
except ImportError:
            logger.error("BetterCam not installed. Run: pip install bettercam")
            return False
except Exception as e:
            logger.error(f"Failed to initialize capture: {e}")
            return False

    def capture(self) -> Optional[np.ndarray]:
              if not self._initialized:
                            if not self.initialize():
                                              return None
                                      try:
                                                    frame = self.camera.grab()
                                                    if frame is not None:
                                                                      self.last_capture = time.time()
                                                                  return frame
except Exception as e:
            logger.error(f"Capture error: {e}")
            return None

    def capture_region(self, x: int, y: int, width: int, height: int) -> Optional[np.ndarray]:
              if not self._initialized:
                            if not self.initialize():
                                              return None
                                      try:
                                                    region = (x, y, x + width, y + height)
                                                    frame = self.camera.grab(region=region)
                                                    return frame
except Exception as e:
            logger.error(f"Region capture error: {e}")
            return None

    def capture_with_throttle(self) -> Optional[np.ndarray]:
              current_time = time.time()
              elapsed = current_time - self.last_capture
              if elapsed < self.frame_time:
                            return None
                        return self.capture()

    def release(self):
              if self.camera:
                            try:
                                              self.camera.release()
                                          except:
                pass
            self.camera = None
        self._initialized = False
        logger.info("FastCapture released")

    def __enter__(self):
              self.initialize()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
              self.release()


class AdaptiveCapture(FastCapture):
      """Adaptive capture that adjusts FPS based on system load."""

    def __init__(self, monitor: int = 0, min_fps: int = 1, max_fps: int = 5):
              super().__init__(monitor, target_fps=max_fps)
        self.min_fps = min_fps
        self.max_fps = max_fps
        self.current_fps = max_fps
        self._load_samples = []
        self._max_samples = 10

    def update_fps_from_load(self, cpu_percent: float, gpu_percent: float):
              load = max(cpu_percent, gpu_percent) / 100.0
        self._load_samples.append(load)
        if len(self._load_samples) > self._max_samples:
                      self._load_samples.pop(0)
                  avg_load = sum(self._load_samples) / len(self._load_samples)
        if avg_load > 0.8:
                      self.current_fps = self.min_fps
elif avg_load > 0.6:
            self.current_fps = max(self.min_fps, self.max_fps // 2)
else:
            self.current_fps = self.max_fps
        self.target_fps = self.current_fps
        self.frame_time = 1.0 / self.current_fps

    def get_current_fps(self) -> int:
              return self.current_fps


class MockCapture:
      """Mock capture for testing without a display."""

    def __init__(self, width: int = 1920, height: int = 1080):
              self.width = width
        self.height = height
        self._initialized = True

    def initialize(self) -> bool:
              return True

    def capture(self) -> np.ndarray:
              return np.random.randint(0, 255, (self.height, self.width, 3), dtype=np.uint8)

    def capture_region(self, x: int, y: int, width: int, height: int) -> np.ndarray:
              return np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)

    def capture_with_throttle(self) -> np.ndarray:
              return self.capture()

    def release(self):
              pass

    def __enter__(self):
              return self

    def __exit__(self, exc_type, exc_val, exc_tb):
              pass
