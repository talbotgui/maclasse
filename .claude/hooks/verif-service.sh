#!/usr/bin/env bash
# Vérifie compilation TypeScript + tests + couverture ≥ 80% après modification d'un service.
# Appelé par le hook PostToolUse de Claude Code. Reçoit le JSON de l'outil sur stdin.
# Exit 0 → succès silencieux. Exit 2 → réveille Claude avec le détail de l'erreur.

set -euo pipefail

FILE=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('tool_input', {}).get('file_path', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")

# Ne rien faire si le fichier modifié n'est ni un service ni un modèle
if ! echo "$FILE" | grep -qE '\.(service|modele|component)\.ts$'; then
  exit 0
fi

echo "Fichier modifié : $FILE"
echo "Lancement de la vérification (compilation + tests + couverture ≥ 80%)..."

cd /workspaces/maclasse

# ── 1. Compilation TypeScript ───────────────────────────────────────────────
echo ""
echo "=== 1/2  Compilation TypeScript (tsc --noEmit) ==="
if ! COMPILE_OUT=$(npx tsc --noEmit 2>&1); then
  echo "ÉCHEC — Erreurs de compilation :"
  echo "$COMPILE_OUT"
  exit 2
fi
echo "OK"

# ── 2. Tests unitaires + couverture ─────────────────────────────────────────
echo ""
echo "=== 2/2  Tests et couverture (ng test --coverage) ==="
if ! TEST_OUT=$(ng test --watch=false --coverage 2>&1); then
  echo "ÉCHEC — Tests en erreur ou couverture < 80% sur au moins une métrique :"
  echo "$TEST_OUT"
  exit 2
fi
echo "OK"

echo ""
echo "Compilation OK · Tests OK · Couverture ≥ 80%"
exit 0
