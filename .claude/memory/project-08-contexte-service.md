---
name: project-08-contexte-service
description: États globaux UI gérés par ContexteService — signaux, méthodes et dépendances
metadata:
  type: project
  updated: 2026-06-05
related:
  - project-02-architecture
  - project-04-json-historique-pattern
---

`ContexteService` (`providedIn: 'root'`) gère les états globaux de l'application qui ne sont pas des données métier : thème actif, sauvegarde automatique, période en cours.

**Why:** Centraliser les états UI partagés entre composants pour éviter de les dupliquer ou de les faire transiter par des inputs/outputs.

**How to apply:** Injecter `ContexteService` (via `inject()`) dans tout composant ayant besoin du thème, de l'état de chargement, ou de la période en cours. Ne pas recréer ces signaux localement.

## Signaux exposés

| Signal | Type | Description |
|--------|------|-------------|
| `motDePasseChiffrement` | `Signal<string \| null>` | Mot de passe en mémoire vive (null si non défini) |
| `sauvegardeAutomatiqueActive` | `Signal<boolean>` | Sauvegarde auto toutes les 5 min active ou non |
| `donneesChargees` | `Signal<boolean>` *(computed)* | `true` si le JSON est non vide — utilisé par le guard de route |
| `themeActif` | `Signal<IdentifiantTheme>` | Thème actuellement appliqué, persisté en `localStorage('ma-classe:theme')` |
| `periodeEnCours` | `Signal<Periode \| null>` *(computed)* | Période dont `debut <= aujourd'hui <= fin`, ou `null` |

## Méthodes publiques

| Méthode | Rôle |
|---------|------|
| `activerSauvegardeAutomatique(motDePasse: string)` | Stocke le mot de passe et active la sauvegarde auto |
| `basculerSauvegardeAutomatique()` | Bascule actif ↔ inactif |
| `definirTheme(id: IdentifiantTheme)` | Applique le thème et le persiste en localStorage |

## Dépendances injectées

- `JsonHistoriqueService` — pour lire l'état JSON (données chargées, période en cours)
