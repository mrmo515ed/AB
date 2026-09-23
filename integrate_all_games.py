#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Master Integration Script for Anime Black Games
"""

import os
import sys

def main():
    print("Starting master integration...")

    # Step 1: Run More Hub card insertion
    os.system("python3 build_anime_games.py")

    # Step 2: Read all games JS parts
    parts = [
        "games_core.js",
        "games_engine.js",
        "games_user_pages.js",
        "games_user_pages_part2.js",
        "games_admin_pages.js"
    ]

    all_code = []
    for p in parts:
        with open(p, "r", encoding="utf-8") as f:
            all_code.append(f.read())

    combined_games_code = "\n\n/* ==================== ANIME BLACK GAMES SYSTEM ==================== */\n" + "\n\n".join(all_code)

    # Step 3: Inject into index.html
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    marker = "/* ==================== ANIME BLACK GAMES SYSTEM ==================== */"
    if marker in html:
        # Replace existing games block
        print("Replacing existing games block in index.html...")
        idx = html.find(marker)
        # Find where window.showPwaGuideModal or end of script is
        pwa_marker = "window.showPwaGuideModal = function()"
        if pwa_marker in html:
            end_idx = html.find(pwa_marker)
            html = html[:idx] + combined_games_code + "\n\n" + html[end_idx:]
        else:
            last_script = html.rfind("</script>")
            html = html[:idx] + combined_games_code + "\n" + html[last_script:]
    else:
        # Inject before window.showPwaGuideModal or before </script>
        pwa_marker = "window.showPwaGuideModal = function()"
        if pwa_marker in html:
            html = html.replace(pwa_marker, combined_games_code + "\n\n" + pwa_marker, 1)
        else:
            last_script = html.rfind("</script>")
            html = html[:last_script] + "\n\n" + combined_games_code + "\n" + html[last_script:]

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)

    print("Master integration complete. Total index.html size:", len(html))

if __name__ == "__main__":
    main()
