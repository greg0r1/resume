<div align="center">

# 📄 CV — Grégory Dernaucourt

**Développeur Angular / TypeScript** · Saint-Laurent-du-Var, France

CV en ligne, imprimable et **compatible ATS** — HTML / CSS / JavaScript vanilla, sans framework ni build.

<br />

[![Voir le CV en ligne](https://img.shields.io/badge/▶_Voir_le_CV-greg0r1.github.io%2Fresume-C75B3D?style=for-the-badge)](https://greg0r1.github.io/resume/)

<br />

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Zéro dépendance](https://img.shields.io/badge/dépendances-0-success?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/déployé_sur-GitHub_Pages-222?style=flat-square&logo=github&logoColor=white)
![Compatible ATS](https://img.shields.io/badge/ATS-friendly-2EA44F?style=flat-square)

</div>

---

## ✨ Fonctionnalités

- 🎨 **Mise en page deux colonnes** soignée, pensée pour l'impression (A4, 2 pages).
- 📤 **Trois exports** depuis la barre d'outils :

  | Export | Description |
  |---|---|
  | 🖨️ **Imprimer / PDF** | Le CV stylisé, pour un envoi à un humain. |
  | 🤖 **Version ATS (PDF)** | Mono-colonne, désaccentuée, flux linéaire — optimisée pour le parsing des ATS. |
  | 📋 **Version ATS (.txt)** | Texte brut, pour les champs « collez votre CV ». |

- ♻️ **Source unique** — les versions ATS sont générées **à la volée** depuis le même DOM. Modifier le CV met à jour automatiquement les exports : aucune duplication à maintenir.
- ♿ **Accessible** — HTML sémantique, attributs ARIA, respect de `prefers-reduced-motion`.

---

## 🤖 Pourquoi une version ATS ?

Les **ATS** (*Applicant Tracking Systems*) lisent un PDF de gauche à droite, ligne par ligne. Une mise en page deux colonnes leur fait **mélanger les colonnes**, produisant un texte illisible.

La version ATS reconstruit le contenu en **une seule colonne**, remplace les caractères décoratifs (`·`, `—`), désaccentue le texte et explicite les libellés de contact (`LinkedIn :`, `GitHub :`…).

> **Quelle version envoyer ?**
>
> | Situation | Version |
> |---|---|
> | 🌐 Formulaire / portail en ligne (Workday, Taleo…) | 🤖 ATS (PDF) |
> | 📝 Champ « coller votre CV » | 📋 ATS (.txt) |
> | ✉️ Email direct à un recruteur, réseau | 🎨 Stylisée (PDF) |

---

## 🗂️ Structure

```
.
├── index.html        # Source unique : contenu + structure + boutons
├── css/
│   └── style.css     # Styles écran & impression (@media print, @page A4)
└── js/
    └── main.js       # Impression, animations, générateur ATS
```

Le générateur ATS ([js/main.js](js/main.js)) parcourt le DOM dans l'ordre sémantique et reconstruit un document mono-colonne, **sans jamais toucher au CV affiché**.

---

## 🚀 Lancer en local

Ouvrir [index.html](index.html) dans un navigateur — **aucune installation requise**.

Pour le rechargement automatique pendant l'édition :

```bash
npx serve .
# ou l'extension VS Code « Live Server »
```

---

## 🛠️ Stack

`HTML5` · `CSS3` · `JavaScript (vanilla, ES5-safe)` · **zéro dépendance, zéro build**

<div align="center">
<sub>Conçu et développé par Grégory Dernaucourt</sub>
</div>
