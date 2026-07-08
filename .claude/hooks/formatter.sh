#!/usr/bin/env bash
# Formate le fichier modifié avec Prettier après une édition de Claude Code.
# Appelé par le hook PostToolUse (Edit|Write). Reçoit le JSON de l'outil sur stdin.
# Toujours exit 0 : un échec de formatage ne doit jamais bloquer Claude Code.

set -uo pipefail

FILE=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

if ! echo "$FILE" | grep -qE '\.(ts|html|scss|json)$'; then
  exit 0
fi

if [ ! -f "$FILE" ]; then
  exit 0
fi

cd /workspaces/maclasse || exit 0

npx prettier --write "$FILE" >/dev/null 2>&1

exit 0
