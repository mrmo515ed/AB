#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full Generator for Anime Black Games & Anime Hunter Engine
"""

import os
import re

def main():
    print("Generating Anime Black Games Module...")
    
    with open("build_anime_games.py", "r", encoding="utf-8") as f:
        # Run base patch first
        pass

    os.system("python3 build_anime_games.py")

if __name__ == "__main__":
    main()
