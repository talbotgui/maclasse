---
name: projet-16-themes
description: Variables CSS des thèmes visuels de MaClasse — 14 variables par thème, 5 thèmes proposés
metadata:
  type: project
  updated: 2026-06-15
related:
  - projet-15-architectureApplicative
  - feedback-05-scss
---

## Principe

Chaque thème est défini par **14 variables CSS** sur `:root`. Le thème contraste surcharge sur `[data-theme="contraste"]`. Les variantes hover peuvent être calculées via `color-mix()` sans variable supplémentaire.

Les 3 types de bouton ne nécessitent pas de variables dédiées — ils combinent les variables existantes :
- **Primaire** → `background: --couleur-primaire ; color: --texte-sur-primaire`
- **Secondaire** (fantôme) → `border: --couleur-primaire ; color: --couleur-primaire ; background: transparent`
- **Tertiaire** (texte seul) → `color: --couleur-primaire ; background: transparent`
- **Danger** → `background: --erreur ; color: white`

---

## Liste des 14 variables CSS

| Variable | Rôle |
|---|---|
| `--couleur-primaire` | Bouton primaire, navigation active, accents |
| `--couleur-primaire-sombre` | Hover/focus du bouton primaire |
| `--fond-global` | Fond de toute l'application |
| `--fond-entete` | Fond de la barre d'en-tête |
| `--fond-colonne` | Fond des colonnes latérales |
| `--fond-section` | Fond des cartes/sections internes |
| `--texte-principal` | Texte courant |
| `--texte-secondaire` | Labels, métadonnées, texte atténué |
| `--texte-sur-primaire` | Texte sur fond primaire et en-tête |
| `--bordure` | Bordures légères, séparateurs |
| `--couleur-focus` | Anneau de focus RGAA (rapport ≥ 3:1) |
| `--chip-actif` | Fond des chips/filtres sélectionnés |
| `--avertissement` | Triangles warning, icônes orange |
| `--erreur` | Messages d'erreur, bouton danger |

---

## 5 thèmes proposés

### Océan *(thème par défaut)*

```css
:root {
  --couleur-primaire:        #2563EB;
  --couleur-primaire-sombre: #1D4ED8;
  --fond-global:             #F8FAFC;
  --fond-entete:             #1E3A8A;
  --fond-colonne:            #EFF6FF;
  --fond-section:            #FFFFFF;
  --texte-principal:         #0F172A;
  --texte-secondaire:        #475569;
  --texte-sur-primaire:      #FFFFFF;
  --bordure:                 #CBD5E1;
  --couleur-focus:           #F59E0B;
  --chip-actif:              #BFDBFE;
  --avertissement:           #F59E0B;
  --erreur:                  #DC2626;
}
```

### Forêt

```css
:root[data-theme="foret"] {
  --couleur-primaire:        #16A34A;
  --couleur-primaire-sombre: #15803D;
  --fond-global:             #F0FDF4;
  --fond-entete:             #14532D;
  --fond-colonne:            #DCFCE7;
  --fond-section:            #FFFFFF;
  --texte-principal:         #14532D;
  --texte-secondaire:        #4D7C0F;
  --texte-sur-primaire:      #FFFFFF;
  --bordure:                 #BBF7D0;
  --couleur-focus:           #F59E0B;
  --chip-actif:              #86EFAC;
  --avertissement:           #D97706;
  --erreur:                  #DC2626;
}
```

### Crépuscule

```css
:root[data-theme="crepuscule"] {
  --couleur-primaire:        #7C3AED;
  --couleur-primaire-sombre: #6D28D9;
  --fond-global:             #FAF5FF;
  --fond-entete:             #3B0764;
  --fond-colonne:            #F3E8FF;
  --fond-section:            #FFFFFF;
  --texte-principal:         #1E1B4B;
  --texte-secondaire:        #6D28D9;
  --texte-sur-primaire:      #FFFFFF;
  --bordure:                 #DDD6FE;
  --couleur-focus:           #F59E0B;
  --chip-actif:              #C4B5FD;
  --avertissement:           #D97706;
  --erreur:                  #DC2626;
}
```

### Terre

```css
:root[data-theme="terre"] {
  --couleur-primaire:        #B45309;
  --couleur-primaire-sombre: #92400E;
  --fond-global:             #FFFBEB;
  --fond-entete:             #451A03;
  --fond-colonne:            #FEF3C7;
  --fond-section:            #FFFBF0;
  --texte-principal:         #292524;
  --texte-secondaire:        #78716C;
  --texte-sur-primaire:      #FFFBEB;
  --bordure:                 #FDE68A;
  --couleur-focus:           #7C3AED;
  --chip-actif:              #FCD34D;
  --avertissement:           #D97706;
  --erreur:                  #DC2626;
}
```

### Contraste *(accessibilité)*

```css
:root[data-theme="contraste"] {
  --couleur-primaire:        #000000;
  --couleur-primaire-sombre: #111111;
  --fond-global:             #FFFFFF;
  --fond-entete:             #000000;
  --fond-colonne:            #F5F5F5;
  --fond-section:            #FFFFFF;
  --texte-principal:         #000000;
  --texte-secondaire:        #333333;
  --texte-sur-primaire:      #FFFFFF;
  --bordure:                 #000000;
  --couleur-focus:           #FF0000;
  --chip-actif:              #000000;
  --avertissement:           #CC7700;
  --erreur:                  #CC0000;
}
```

---

## Identifiants de thème (pour `ContexteService.themeActif`)

| Identifiant | Thème |
|---|---|
| `'defaut'` | Océan (pas d'attribut sur `:root`) |
| `'foret'` | Forêt |
| `'crepuscule'` | Crépuscule |
| `'terre'` | Terre |
| `'contraste'` | Contraste |

Le thème actif est appliqué via `document.documentElement.setAttribute('data-theme', id)`. Pour le thème par défaut, l'attribut est absent (ou supprimé).
