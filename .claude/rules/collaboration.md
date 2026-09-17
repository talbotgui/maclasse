---
globs: "**/*"
---

# Collaboration — Règle de validation préalable

Ne jamais modifier ou écrire du code sans avoir au préalable :

1. Reformulé le besoin ou la question pour confirmer la compréhension
2. Obtenu la validation explicite de l'utilisateur sur la conception de la solution

S'applique à chaque tâche d'implémentation, quelle que soit sa taille.

Pour les questions d'analyse ou d'exploration, répondre directement sans attendre de validation.

## Relecture systématique en fin d'incrément

À la fin de l'implémentation d'un incrément de code — un ensemble cohérent de modifications, typiquement la mise en œuvre complète d'un plan ou d'une tâche — invoquer l'agent `revue-increment` (`.claude/agents/revue-increment.md`) pour relire les fichiers modifiés/créés.

**Pourquoi un agent dédié plutôt qu'une auto-relecture :** un subagent démarre sans la mémoire de la session qui a écrit le code. Cette absence de contexte est la propriété recherchée : elle évite le biais d'ancrage de la session qui vient d'écrire le code et qui a du mal à remettre en question ses propres choix.

**Quand l'invoquer :**
- Une seule fois à la fin de l'incrément complet, jamais après chaque modification unitaire (fichier, méthode, petit correctif isolé).
- Avant de considérer l'incrément terminé et de le proposer à l'utilisateur.

**Quand ne pas l'invoquer :**
- En cours d'implémentation, entre deux étapes d'un même incrément.
- Pour une modification triviale ne constituant pas un incrément en soi (typo, renommage isolé).
