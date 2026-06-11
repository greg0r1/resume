# CV — Grégory Dernaucourt

CV en ligne, imprimable, et **compatible ATS**, construit en HTML / CSS / JavaScript **vanilla** — sans framework, sans dépendance, sans build.

🔗 **Développeur Angular / TypeScript** · Saint-Laurent-du-Var

---

## Pourquoi pas un framework ?

Choix assumé : un CV est un document statique de deux pages. Y appliquer Angular ou React serait du sur-dimensionnement — un `node_modules` de 200 Mo et une étape de build pour afficher du texte.

Le vanilla apporte ici de vrais avantages :

- **Zéro dépendance, zéro build** — le fichier s'ouvre directement dans un navigateur.
- **Performance maximale** — pas de runtime de framework à charger.
- **Compatible ATS** — le contenu est dans le HTML, lisible par les robots de recrutement (une SPA rendue en JS ne l'est souvent pas).
- **Accessibilité** — HTML sémantique, ARIA, respect de `prefers-reduced-motion`.

Pour démontrer mes compétences Angular/TypeScript, je préfère un vrai projet applicatif — pas un CV déguisé en SPA.

## Fonctionnalités

- **Mise en page deux colonnes** soignée, pensée pour le print (format A4, 2 pages).
- **Trois exports**, depuis la barre d'outils :
  - **Imprimer / PDF** — le CV stylisé.
  - **Version ATS (PDF)** — une version mono-colonne, désaccentuée, en flux linéaire, optimisée pour le parsing des ATS.
  - **Version ATS (.txt)** — texte brut, pour les champs « collez votre CV ».
- **Source unique** : les versions ATS sont générées à la volée depuis le même DOM. Modifier le CV met à jour automatiquement les exports — aucune duplication à maintenir.

### Pourquoi une version ATS séparée ?

Les ATS (Applicant Tracking Systems) lisent un PDF de gauche à droite, ligne par ligne. Une mise en page deux colonnes leur fait **mélanger les colonnes**, produisant un texte illisible. La version ATS reconstruit le contenu en une seule colonne, remplace les caractères décoratifs (`·`, `—`), désaccentue le texte et explicite les libellés de contact (`LinkedIn :`, `GitHub :`…).

| Situation | Version à envoyer |
|---|---|
| Formulaire / portail en ligne (Workday, Taleo…) | Version ATS (PDF) |
| Champ « coller votre CV » | Version ATS (.txt) |
| Email direct à un recruteur, réseau | Version stylisée (PDF) |

## Structure

```
.
├── index.html        # Source unique : contenu + structure + boutons
├── css/style.css     # Styles écran & impression (@media print, @page A4)
└── js/main.js        # Impression, animations, générateur ATS
```

Le générateur ATS ([js/main.js](js/main.js)) parcourt le DOM dans l'ordre sémantique et reconstruit un document mono-colonne, sans toucher au CV affiché.

## Lancer en local

Ouvrir [index.html](index.html) dans un navigateur. Aucune installation requise.

Pour le rechargement automatique pendant l'édition, un serveur statique au choix :

```bash
npx serve .
# ou l'extension VS Code « Live Server »
```

## Stack

`HTML5` · `CSS3` · `JavaScript (vanilla, ES5-safe)` · zéro dépendance
