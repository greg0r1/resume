# Design

Système visuel du CV en ligne de Grégory Dernaucourt.
Monde retenu : **tirage risographie** — deux ou trois encres à plat superposées sur papier
teinté, trame de points dans les recouvrements, repérage légèrement décalé.

Ce fichier remplace l'identité précédente (papier crème, Playfair Display, accent terracotta,
simulation de feuille A4 posée sur fond gris). Cette identité n'est plus une référence.

## Contrat de direction

**THÈSE** — Le CV est un objet imprimé en trois encres, pas une feuille A4 posée sur un fond
gris. Il refuse la mise en scène du document Word que tout CV en ligne rejoue.

**MONDE PROPRE** — Papier chaud grainé, trois encres pleines (rose fluo, bleu fédéral,
tournesol) et deux recouvrements qui servent réellement : le violet (rose × bleu) trame la bande
profil, le vert (bleu × jaune) porte le statut. Les encres pleines tiennent des bandes entières ;
les aplats de contenu sont des trames de ces mêmes encres, et chaque champ d'encre est moucheté
à l'intérieur de lui-même. Chaque bloc porte une ombre dure décalée dans une seconde encre —
c'est le défaut de repérage de la riso, promu au rang de composant. Une seule famille
typographique à axe de largeur.

**HISTOIRE** — Un recruteur non technique ouvre le lien sur son téléphone. En trois secondes il
a le nom, le poste, la disponibilité, deux chiffres de preuve et un bouton d'appel. En trente
secondes il a la stack et la preuve datée. À tout moment il peut imprimer, exporter en ATS ou
enregistrer le contact.

**PREMIER ÉCRAN** — Bande pleine largeur sur papier. À gauche, le nom en capitales condensées
monumentales, prénom bleu et nom rose, chacun portant l'ombre d'encre de l'autre ; sous lui le
poste en cartouche tournesol et l'accroche. À droite, le portrait en bichromie riso rose/bleu
tramée sur fond papier, avec un double décalage de repérage (rose puis tournesol) — jamais posé
sur un aplat coloré, qui salirait la bichromie en multiply. Puis la pastille verte DISPONIBLE
IMMÉDIATEMENT, les deux chiffres de preuve en aplats tramés, et les cinq coordonnées en pavés
bordés dont quatre cliquables. La barre d'actions reste collée en haut.

Sur mobile, l'ordre change : identité, chiffres, coordonnées, portrait. `display: contents` sur
`.cv-header__identity` remonte le texte et le portrait au rang d'items de la grille d'en-tête
pour permettre ce réordonnancement. Un portrait en tête repoussait le premier bouton d'appel
sous la ligne de flottaison d'un écran de 812 px.

**FORME** — `risograph-web-system`, challenger fusionné, retenu par l'utilisateur contre la
direction assignée « L'itinéraire ». Mise en scène : la grammaire native du monde (bandes
d'encre empilées, rythme dense/calme). La mise en scène tirée au sort (`two-key commit`,
catalogue adressable à validation en deux temps) a été écartée sur un motif nommé : elle enferme
le contenu derrière une manipulation, ce qui est incompatible avec un tri en dix secondes par un
lecteur non technique. Clé de tirage : `d4917f17`.

## Couleur

Stratégie : **palette complète**, quatre rôles. Les encres pleines occupent des régions
entières (bandes pleine largeur, pied de page), jamais des accents dispersés sur un fond neutre.

Un jeton n'existe dans `:root` que s'il est imprimé quelque part. Les recouvrements orange
(rose × jaune) et les trames `rose-45` / `bleu-30` ont été retirés faute d'usage : une palette
déclarée mais non employée est une intention, pas un système.

| Jeton | Valeur | Rôle |
|---|---|---|
| `--paper` | `#FFF3E2` | Papier. Fond dominant. |
| `--paper-deep` | `#F6E7D1` | Deuxième teinte de papier, pour distinguer deux bandes voisines. |
| `--ink` | `#16225E` | Encre de texte, bleu très chargé. Tout le corps de texte. |
| `--rose` | `#FF3DA6` | Rose fluo. Ombres de repérage, filets, display, trames. |
| `--rose-deep` | `#C2005F` | Rose sur-encré. **Obligatoire dès que le rose porte du texte sous 24 px** : le fluo ne fait que 3,2:1 sur papier, le sur-encré 6,6:1. Entreprises, libellés d'action, niveaux de langue, exposants. |
| `--bleu` | `#2A5BFF` | Bleu fédéral. Display, bandes pleines, bordures de composant. |
| `--jaune` | `#FFD100` | Tournesol. Aplats, surlignages, pastilles de chiffre. |
| `--violet` | `#7A3BFF` | Recouvrement rose × bleu. Trame de la bande profil : le recouvrement rendu littéralement visible, encre sur encre. |
| `--vert` | `#1FAE6E` | Recouvrement bleu × jaune. Réservé au statut « disponible ». |

Trames (encre imprimée en pourcentage sur le papier) : `--rose-10/25`, `--bleu-12`,
`--jaune-25/50`, `--vert-25`, `--violet-20`. Les blocs de contenu utilisent les trames ; les
encres pleines sont réservées au display, aux bandes et aux composants d'action.

### Règles de contraste, mesurées sur le build

- Encre sur papier : **13,46:1**. Encre sur tournesol plein : **10,09:1**.
- Rose sur-encré sur papier : **5,54:1** — d'où l'obligation de l'utiliser sous 24 px.
- **Encre sur bleu plein : 2,7:1 — interdit.** Sur bleu plein, le texte est en papier (**4,75:1**).
- **Papier sur vert : 2,3:1 — interdit.** Sur vert, le texte est en encre (**5,15:1**).
- **Tournesol sur papier : 1,33:1 — interdit.** L'anneau de focus tournesol n'existe QUE sur
  encre pleine (`.cv-summary`, `.cv-footer`). Partout ailleurs il est bleu fédéral, qui fait
  4,75:1 sur papier. Le sommaire mobile est sur papier : y mettre du tournesol supprimerait
  l'indicateur de focus du seul composant navigué exclusivement au clavier.
- Rose fluo sur papier : 3,2:1 — display uniquement (nom, filets), jamais sous 24 px.

## Typographie

Une seule famille : **Archivo variable** (axes `wght` 100–900 et `wdth` 62–125, plus italique).
L'axe de largeur est l'instrument : il porte à lui seul les trois registres de l'affiche.

| Registre | Réglage | Usage |
|---|---|---|
| Display | `wght 900`, `wdth 62`, `line-height .82`, `letter-spacing -.02em`, capitales | Nom, titres de section |
| Libellé | `wght 700`, `wdth 100`, `letter-spacing .18em`, capitales | Numéros de section, métadonnées, boutons |
| Corps | `wght 400`, `wdth 100`, `line-height 1.6` | Paragraphes, puces |
| Accent | `wght 600`, `wdth 87`, capitales | Dates, entreprises, niveaux |

Chiffres tabulaires (`font-variant-numeric: tabular-nums`) partout où des dates s'alignent.

## Matière

- **Grain papier** : bruit `feTurbulence` en data-URI, fixe, plein écran, `mix-blend-mode:
  multiply`, opacité ≤ 0,14. Supprimé à l'impression.
- **Trame de points** : `radial-gradient` de 1 px sur pas de 4 px, appliqué aux aplats d'encre.
- **Défaut de repérage** : ombre dure décalée de 5 px (`box-shadow: 5px 5px 0`) dans une seconde
  encre sur les blocs, et `text-shadow: 3px 3px 0` sur le display. L'état actif augmente le
  décalage ; `prefers-reduced-motion` verrouille le repérage.
- **Bichromie du portrait** : filtre SVG `#riso-duotone` en ligne, `feColorMatrix` en niveaux de
  gris puis `feComponentTransfer` mappant les ombres sur le bleu fédéral et les hautes lumières
  sur le rose fluo, surmonté d'une trame en `multiply`.

Le décalage de repérage est un matériau natif de ce monde : ne jamais l'interdire au motif qu'il
ressemble à un défaut d'alignement.

## Composition

Bandes empilées pleine largeur, contenu contraint par
`padding-inline: max(1.5rem, (100% - 1180px) / 2)`. Rythme imposé : une bande dense est suivie
d'une bande calme. Toujours plus d'espace au-dessus d'un titre qu'en dessous.

Ordre des bandes : en-tête (papier) → profil (bleu plein, texte papier) → expérience (papier) →
compétences (grille d'aplats tramés) → parcours (papier) → certifications / intérêts / vision
(trois colonnes tramées) → pied de page (encre pleine, nom en tournesol).

Les grilles de cartes sont en `align-items: start` : un aplat d'encre étiré à vide ne lit pas
comme un plan de couleur mais comme un bloc pas fini.

Le compteur CSS (`01`, `02`…) ne porte que sur les **titres de chapitre** (`.cv-section-title`,
deux occurrences). Posé aussi sur les titres de bloc, il annonçait onze sections de même rang
alors qu'il n'y a que deux chapitres, et numérotait le second « 08 ». Les titres de bloc portent
un carré d'encre, le même signe que les puces. Numéros et marqueurs sont des pseudo-éléments :
ils n'entrent jamais dans le `textContent` que lit le générateur ATS.

## Contraintes structurelles non négociables

Ces règles priment sur toute décision visuelle.

1. **L'écran n'est pas une feuille A4.** Le format A4 n'existe que dans `@media print`. Simuler
   une feuille de papier à l'écran est précisément ce que cette identité remplace.
2. **L'impression est l'autre artefact du même monde** : feuille imprimée, deux colonnes, deux
   pages A4, encres réduites aux filets et aux cartouches pour rester économique et lisible.
   `@page { size: A4; margin: 0 }`, `.cv-page` en `210mm × (297mm − 1mm)`.
3. **Les contrats de classe du DOM sont figés.** `js/main.js` construit les exports ATS, la
   vCard et le sommaire en lisant `.cv-name`, `.cv-role`, `.cv-availability`,
   `.cv-contact__line`, `.cv-summary`, `.cv-side-block`, `.cv-side-title`, `.cv-tag`, `.cv-job`
   et ses sous-classes, `.cv-bullet`, `.cv-stack__value`, `.cv-timeline-item` et ses
   sous-classes, `.cv-edu-item`, `.cv-bottom-col`, `.cv-chevron-item`, `.cv-lang-item`, plus les
   attributs `data-ats-label` / `data-ats-value` / `data-nav-label` / `data-nav-group`. Aucun
   renommage, aucune suppression, aucun changement d'ordre sémantique.
4. **Zéro dépendance, zéro build.** Une seule requête de police, aucun script tiers hors gtag.
5. **Le contenu factuel ne change pas.** Le design ne fabrique aucune preuve.

## Ce que le premier build a fixé

- **Marqueur de liste unique.** Puces d'expérience, listes en chevrons et items de formation
  portent tous le même carré plein de 8 px (4 px à l'impression). Aucune bordure latérale
  épaisse : la barre d'accent sur un seul côté n'appartient pas à ce monde, qui travaille en
  aplats découpés et en défauts de repérage. Un bloc qui doit se détacher prend une bordure
  complète plus une ombre décalée.
- **Échelles d'impression par feuille.** `#page-1` et `#page-2` portent chacun leur propre
  échelle typographique dans `@media print`. Un réglage global est impossible : les deux feuilles
  se remplissent à des rythmes différents.
  **Mesurer chaque colonne, pas la page.** La hauteur de `.cv-page` est aveugle au déséquilibre :
  une première passe affichait 20 mm de blanc en pied de feuille 1 alors que la colonne latérale
  en laissait 59 mm sous « Anglais » et la colonne principale 6 mm. La vérification correcte
  relève, pour la feuille 1, le bas de `.cv-main` **et** celui de `.cv-side` ; pour la feuille 2,
  l'écart entre `.cv-timeline` et `.cv-bottom-cols`. Cibles constatées après réglage : colonnes à
  23-26 mm, écart de chronologie à 6 mm, aucun débordement. Le padding de page vaut 13 mm.
- **Pas de `margin-top: auto` sur `.cv-bottom-cols`.** Il poussait les trois colonnes en pied de
  feuille 2 et ouvrait 30 mm de trou après la chronologie. L'espace se redistribue dans les
  étapes elles-mêmes.
- **Pas de numéros de section sur papier.** En deux colonnes, la colonne latérale afficherait
  02 au-dessus du 01 de la colonne principale. Le catalogue numéroté est une figure d'écran, où
  l'ordre de lecture est linéaire.
- **Photo d'origine à l'impression, bichromie à l'écran.** Décision révisée après le premier
  build : sur un document que le recruteur imprime ou joint à un dossier, un portrait
  reconnaissable prime sur la signature décorative. `.cv-photo` passe donc `filter: none` en
  `@media print`. La bichromie riso reste la valeur par défaut à l'écran, avec une bascule
  discrète dans la lightbox (`data-action="photo-toggle-original"`) pour qui veut voir l'original
  sans imprimer — l'état ne doit jamais persister d'une ouverture à l'autre.
- **Lien vers le site en ligne dans le pied de page, sur les deux médias.** `.cv-footer__link`
  hérite `color: inherit` plutôt qu'une couleur propre : papier à l'écran (fond encre), encre à
  l'impression (fond blanc), sans recalculer un contraste par média. Seul le soulignement et la
  flèche restent en rose de repérage, un accent décoratif non soumis aux mêmes seuils que le
  texte. À l'impression, le pied de page passe en `flex-wrap` et le lien prend
  `flex-basis: 100%` pour tomber sur sa propre ligne sous nom/rôle plutôt que s'intercaler entre
  eux — et la marge du pied de feuille 2 a dû être rognée de 5 à 3,5 mm pour absorber cette
  troisième ligne sans repousser le contenu en 3ᵉ page.
- **Les chiffres de preuve vivent dans l'en-tête, pas dans le poste.** `.cv-stats` a été sorti de
  `.cv-job` : un recruteur qui trie en dix secondes doit avoir une raison de continuer avant la
  ligne de flottaison. Le déplacement est neutre pour les exports — `buildAtsModel` n'extrait d'un
  `.cv-job` que titre, dates, société, description, puces et stack, et ne lit jamais `.cv-stat`.
- **Le bouton flottant du sommaire s'efface en haut de page.** `js/main.js` pose
  `cv-nav-fab--idle` tant que le défilement est sous 120 px : posé en bas à droite, le bouton
  recouvrait le premier pavé d'appel sur mobile.
- **Le surlignage tournesol s'ancre sur la ligne de base** (`0 100% / 100% 0.3em`). Ancré à 82 %
  de la boîte, il traversait la moitié basse des glyphes et « expertise full-stack » se lisait
  barré, à l'écran comme dans le PDF.
- **Les pseudo-éléments ne doivent jamais porter de contenu lu par l'ATS.** Numéros de section,
  marqueurs de liste et libellés `attr(data-ats-label)` sont tous en `::before` : `textContent`,
  que lit `js/main.js`, les ignore. Vérifié sur les onze contrats de classe.

### Signalements du détecteur volontairement conservés

Le détecteur mécanique (`scripts/detect.mjs`) signale trois points sur ce projet. Aucun n'est un
défaut ; ne pas « corriger » sans relire ceci.

- `single-font` — une seule famille est un parti pris : Archivo variable porte la hiérarchie par
  le poids **et** par l'axe de largeur (62 % à 125 %), pas seulement par la taille.
- `em-dash-overuse` — 19 tirets cadratins dans le texte du CV. Le contenu factuel est une
  contrainte produit : il n'est pas réécrit.
- `codex-grid-background` — la trame de points du pied de page, de la bande profil et de chaque
  aplat de contenu est le matériau natif de la risographie, pas une grille décorative de fond.
- `overused-font` sur `js/main.js` — le document ATS généré est en `Arial, Helvetica, sans-serif`.
  C'est le bon choix : ce document n'est pas lu par un humain mais analysé par un parseur, et
  Arial maximise la compatibilité. Il ne partage rien avec l'identité du site.

## Accessibilité

Plancher conservé : HTML sémantique, ARIA sur les dialogues et menus, navigation clavier,
`prefers-reduced-motion`. Ajouts propres à ce monde : anneau de focus visible en rose fluo
d'au moins 3 px avec décalage, et respect des règles de contraste ci-dessus, qui interdisent
plusieurs combinaisons pourtant séduisantes.
