# Vision Agent Setup Guide

100% FREE screen reader for Fortnite competitive coaching.

## What It Does

Automatically captures your Fortnite screen and extracts:
- HP & Shield values
- - Material counts (wood/brick/metal)
  - - Player count alive
    - - Storm timer
      - - Surge warnings
       
        - ## Requirements
       
        - - **Windows 10/11** (required)
          - - **Python 3.10+**
            - - **NVIDIA GPU** (recommended for fast OCR)
             
              - ## Installation
             
              - ```bash
                cd vision-agent
                pip install -r requirements.txt
                ```

                ## Calibration

                Run the calibration tool to set up UI regions for your resolution:

                ```bash
                python calibrate.py
                ```

                For 1920x1080, defaults should work. For other resolutions, calibration is required.

                ## Running

                ```bash
                # Start Discord bot first
                cd discord-bot && npm start

                # Then start Vision Agent
                cd vision-agent && python main.py
                ```

                ## Configuration

                Edit `config.json`:
                - `monitor_index`: Which monitor (0 = primary)
                - - `target_fps`: Captures per second (3 recommended)
                  - - `gpu`: Use GPU for OCR (true/false)
                   
                    - ## Performance
                   
                    - | Metric | Target |
                    - |--------|--------|
                    - | CPU | <8% |
                    - | GPU | <12% |
                    - | RAM | <600MB |
                   
                    - ## Is This Cheating?
                   
                    - **NO.** Only reads pixels from screen (like your eyes). Does not inject code or automate gameplay.
