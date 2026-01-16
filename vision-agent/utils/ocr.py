"""
Fortnite OCR Module
GPU-accelerated text extraction optimized for Fortnite UI elements
Uses EasyOCR with CUDA support for fast, accurate reading
"""

import re
import cv2
import numpy as np
from typing import Optional, Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)


class FortniteOCR:
      """Specialized OCR for Fortnite UI elements."""

    def __init__(self, gpu: bool = True, languages: List[str] = None):
              self.gpu = gpu
              self.languages = languages or ['en']
              self.reader = None
              self._initialized = False
              self._number_pattern = re.compile(r'\d+')
              self._time_pattern = re.compile(r'(\d+):(\d+)')

    def initialize(self) -> bool:
              try:
                            import easyocr
                            self.reader = easyocr.Reader(self.languages, gpu=self.gpu, verbose=False)
                            self._initialized = True
                            logger.info(f"FortniteOCR initialized (GPU: {self.gpu})")
                            return True
except ImportError:
            logger.error("EasyOCR not installed. Run: pip install easyocr")
            return False
except Exception as e:
            logger.error(f"Failed to initialize OCR: {e}")
            return False

    def preprocess_for_numbers(self, image: np.ndarray) -> np.ndarray:
              gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
              clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
              enhanced = clahe.apply(gray)
              _, binary = cv2.threshold(enhanced, 180, 255, cv2.THRESH_BINARY)
              kernel = np.ones((2, 2), np.uint8)
              dilated = cv2.dilate(binary, kernel, iterations=1)
              return dilated

    def preprocess_for_text(self, image: np.ndarray) -> np.ndarray:
              gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
              denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
              clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
              enhanced = clahe.apply(denoised)
              return enhanced

    def preprocess_surge_warning(self, image: np.ndarray) -> np.ndarray:
              hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
              lower_red1 = np.array([0, 100, 100])
              upper_red1 = np.array([10, 255, 255])
              lower_red2 = np.array([160, 100, 100])
              upper_red2 = np.array([180, 255, 255])
              mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
              mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
              red_mask = cv2.bitwise_or(mask1, mask2)
              gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
              _, white_mask = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
              combined = cv2.bitwise_or(red_mask, white_mask)
              return combined

    def read_number(self, image: np.ndarray, preprocess: bool = True) -> Optional[int]:
              if not self._initialized:
                            if not self.initialize():
                                              return None
                                      try:
                                                    processed = self.preprocess_for_numbers(image) if preprocess else image
                                                    results = self.reader.readtext(processed, detail=0, paragraph=False)
                                                    for text in results:
                                                                      matches = self._number_pattern.findall(text)
                                                                      if matches:
                                                                                            return int(matches[0])
                                                                                    return None
                            except Exception as e:
                                          logger.debug(f"Number extraction error: {e}")
                                          return None

                    def read_time(self, image: np.ndarray) -> Optional[Tuple[int, int]]:
                              if not self._initialized:
                                            if not self.initialize():
                                                              return None
                                                      try:
                                                                    processed = self.preprocess_for_numbers(image)
                                                                    results = self.reader.readtext(processed, detail=0, paragraph=False)
                                                                    for text in results:
                                                                                      match = self._time_pattern.search(text)
                                                                                      if match:
                                                                                                            return (int(match.group(1)), int(match.group(2)))
                                                                                                    return None
                                            except Exception as e:
                                                          logger.debug(f"Time extraction error: {e}")
                                                          return None

                                    def read_text(self, image: np.ndarray, preprocess: bool = True) -> str:
                                              if not self._initialized:
                                                            if not self.initialize():
                                                                              return ""
                                                                      try:
                                                                                    processed = self.preprocess_for_text(image) if preprocess else image
                                                                                    results = self.reader.readtext(processed, detail=0, paragraph=True)
                                                                                    return " ".join(results)
except Exception as e:
            logger.debug(f"Text extraction error: {e}")
            return ""

    def detect_surge_warning(self, image: np.ndarray, keywords: List[str] = None) -> Dict[str, Any]:
              keywords = keywords or ['SURGE', 'DAMAGE', 'BELOW', 'STORM SURGE']
        if not self._initialized:
                      if not self.initialize():
                                        return {'detected': False, 'text': ''}
                                try:
                                              processed = self.preprocess_surge_warning(image)
                                              results = self.reader.readtext(processed, detail=0, paragraph=True)
                                              text = " ".join(results).upper()
                                              for keyword in keywords:
                                                                if keyword in text:
                                                                                      return {'detected': True, 'text': text}
                                                                              return {'detected': False, 'text': text}
                                except Exception as e:
            logger.debug(f"Surge detection error: {e}")
            return {'detected': False, 'text': ''}

    def release(self):
              self.reader = None
        self._initialized = False
        logger.info("FortniteOCR released")
