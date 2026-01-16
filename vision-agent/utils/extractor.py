"""
Game State Extractor Module
Combines capture and OCR to extract complete Fortnite game state
Provides structured data for the Discord bot analyzer
"""

import time
import json
from dataclasses import dataclass, asdict, field
from typing import Optional, Dict, Any
import numpy as np
import logging

from .capture import FastCapture, AdaptiveCapture
from .ocr import FortniteOCR

logger = logging.getLogger(__name__)


@dataclass
class GameState:
      """Complete Fortnite game state extracted from screen."""
      hp: Optional[int] = None
      shield: Optional[int] = None
      wood: Optional[int] = None
      brick: Optional[int] = None
      metal: Optional[int] = None
      storm_phase: Optional[int] = None
      storm_timer: Optional[str] = None
      storm_seconds: Optional[int] = None
      alive_players: Optional[int] = None
      eliminations: Optional[int] = None
      surge_active: bool = False
      surge_text: str = ""
      timestamp: float = field(default_factory=time.time)
      capture_fps: float = 0.0
      confidence: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
              return asdict(self)

    def to_json(self) -> str:
              return json.dumps(self.to_dict())

    @property
    def total_mats(self) -> int:
              return (self.wood or 0) + (self.brick or 0) + (self.metal or 0)

    @property
    def effective_hp(self) -> int:
              return (self.hp or 0) + (self.shield or 0)

    @property
    def is_low_hp(self) -> bool:
              return self.effective_hp < 100

    @property
    def is_low_mats(self) -> bool:
              return self.total_mats < 300


class StateExtractor:
      """Extracts game state from Fortnite screen."""

    def __init__(self, config: Dict[str, Any]):
              self.config = config
              self.regions = config.get('regions', {})
              capture_config = config.get('capture', {})
              ocr_config = config.get('ocr', {})

        if capture_config.get('adaptive_fps', True):
                      self.capture = AdaptiveCapture(
                                        monitor=capture_config.get('monitor_index', 0),
                                        min_fps=capture_config.get('min_fps', 1),
                                        max_fps=capture_config.get('max_fps', 5)
                      )
else:
              self.capture = FastCapture(
                                monitor=capture_config.get('monitor_index', 0),
                                target_fps=capture_config.get('target_fps', 3)
              )

        self.ocr = FortniteOCR(
                      gpu=ocr_config.get('gpu', True),
                      languages=ocr_config.get('languages', ['en'])
        )

        self.last_state: Optional[GameState] = None
        self._frame_times = []

    def initialize(self) -> bool:
              capture_ok = self.capture.initialize()
              ocr_ok = self.ocr.initialize()
              if capture_ok and ocr_ok:
                            logger.info("StateExtractor initialized successfully")
                            return True
                        logger.error("StateExtractor initialization failed")
        return False

    def extract_state(self) -> Optional[GameState]:
              start_time = time.time()
        frame = self.capture.capture()
        if frame is None:
                      return None

        state = GameState()
        state.timestamp = start_time
        state.hp = self._extract_number(frame, 'hp')
        state.shield = self._extract_number(frame, 'shield')

        mat_regions = self.regions.get('materials', {})
        if mat_regions:
                      state.wood = self._extract_number_from_config(frame, mat_regions.get('wood'))
                      state.brick = self._extract_number_from_config(frame, mat_regions.get('brick'))
                      state.metal = self._extract_number_from_config(frame, mat_regions.get('metal'))

        storm_timer_text = self._extract_time(frame, 'storm_timer')
        if storm_timer_text:
                      state.storm_timer = storm_timer_text
                      state.storm_seconds = self._timer_to_seconds(storm_timer_text)

        state.storm_phase = self._extract_number(frame, 'storm_phase')
        state.alive_players = self._extract_number(frame, 'player_count')
        state.eliminations = self._extract_number(frame, 'elimination_count')

        surge_result = self._check_surge(frame)
        state.surge_active = surge_result.get('detected', False)
        state.surge_text = surge_result.get('text', '')

        elapsed = time.time() - start_time
        self._frame_times.append(elapsed)
        if len(self._frame_times) > 30:
                      self._frame_times.pop(0)

        avg_time = sum(self._frame_times) / len(self._frame_times)
        state.capture_fps = 1.0 / avg_time if avg_time > 0 else 0

        self.last_state = state
        return state

    def _extract_number(self, frame: np.ndarray, region_name: str) -> Optional[int]:
              region = self.regions.get(region_name)
        if not region:
                      return None
                  return self._extract_number_from_config(frame, region)

    def _extract_number_from_config(self, frame: np.ndarray, region: Dict) -> Optional[int]:
              if not region:
                            return None
                        x, y = region.get('x', 0), region.get('y', 0)
        w, h = region.get('width', 100), region.get('height', 50)
        roi = frame[y:y+h, x:x+w]
        if roi.size == 0:
                      return None
                  return self.ocr.read_number(roi)

    def _extract_time(self, frame: np.ndarray, region_name: str) -> Optional[str]:
              region = self.regions.get(region_name)
        if not region:
                      return None
                  x, y = region.get('x', 0), region.get('y', 0)
        w, h = region.get('width', 100), region.get('height', 50)
        roi = frame[y:y+h, x:x+w]
        if roi.size == 0:
                      return None
                  time_result = self.ocr.read_time(roi)
        if time_result:
                      return f"{time_result[0]}:{time_result[1]:02d}"
                  return None

    def _timer_to_seconds(self, timer_str: str) -> Optional[int]:
              try:
                            parts = timer_str.split(':')
                            if len(parts) == 2:
                                              return int(parts[0]) * 60 + int(parts[1])
                                      except:
            pass
        return None

    def _check_surge(self, frame: np.ndarray) -> Dict[str, Any]:
              region = self.regions.get('surge_warning')
        if not region:
                      return {'detected': False, 'text': ''}
        x, y = region.get('x', 0), region.get('y', 0)
        w, h = region.get('width', 100), region.get('height', 50)
        roi = frame[y:y+h, x:x+w]
        if roi.size == 0:
                      return {'detected': False, 'text': ''}
        keywords = self.config.get('detection', {}).get('surge_keywords', ['SURGE', 'DAMAGE'])
        return self.ocr.detect_surge_warning(roi, keywords)

    def release(self):
              self.capture.release()
        self.ocr.release()
        logger.info("StateExtractor released")
