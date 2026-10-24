#!/usr/bin/env bash
# Contrôle qualité : bash scripts/qa.sh [mp4]
set -e
cd "$(dirname "$0")/.."
"${PY:-/root/venvs/cb/bin/python}" scripts/qa.py "${1:-exports/prospectify_fr_meta_conversion_ad_v1.mp4}"
