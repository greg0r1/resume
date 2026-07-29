# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Utilisateur principal : **recruteur RH ou chargé de recrutement en ESN**, non technique.
Situation réelle : il reçoit le lien par mail ou depuis un profil LinkedIn, l'ouvre souvent sur
mobile entre deux entretiens, et arbitre en quelques secondes entre retenir le profil ou passer
au suivant. Son travail ensuite : transmettre le document à un décideur technique, et/ou
l'injecter dans un ATS.

Lecteur secondaire confirmé : le décideur technique (CTO, lead) à qui le recruteur transmet
le CV. Il n'est pas la cible du tri, mais il ne doit rien perdre du contenu technique.

## Product Purpose

CV en ligne de Grégory Dernaucourt, développeur Angular / TypeScript, en recherche active
(disponibilité immédiate affichée). Le site remplace le CV PDF attaché : une URL unique qui se
lit à l'écran, s'imprime en A4 et s'exporte pour les ATS.

Succès défini par l'auteur : **être mémorisé**. Un CV qu'un recruteur montre à un collègue, dont
la forme atteste du niveau de craft front-end avant même que le contenu soit lu.

## Positioning

Deux faits que peu de CV de dev Angular peuvent revendiquer ensemble :

1. Trois ans d'Angular en production sur une plateforme SaaS critique (supervision de parkings
   temps réel, 1000+ installations), pas des projets d'école ;
2. Vingt ans de parcours terrain avant le code — support hotline, technicien bureautique
   secteur, infographie PAO, armée — soit un développeur qui a passé sa carrière du côté de
   l'utilisateur final avant d'écrire son interface.

Le site lui-même est une preuve : zéro dépendance, zéro build, versions ATS générées à la volée
depuis le même DOM.

## Operating Context

- Point d'entrée dominant : lien partagé (LinkedIn, mail, SMS) → première lecture souvent mobile.
- Le document est imprimé ou exporté en PDF pour être joint à un dossier de candidature.
- Le contenu est aspiré par des ATS (Workday, Taleo…) qui lisent un PDF en flux linéaire
  gauche → droite : toute mise en page multi-colonnes casse leur parsing, d'où une version ATS
  mono-colonne dédiée.
- Trois exports coexistent volontairement : PDF stylisé (humain), PDF ATS, texte brut ATS.

## Capabilities and Constraints

Contraintes durables, confirmées par l'auteur, qu'aucune refonte ne peut casser :

- **Impression A4, 2 pages, pixel-perfect** (`@media print`, `@page`).
- **Exports ATS (PDF mono-colonne + .txt)** générés à la volée depuis le DOM affiché — source
  unique, aucune duplication de contenu à maintenir.
- **Zéro dépendance, zéro build** : HTML5 + CSS3 + JavaScript vanilla, déployé tel quel sur
  GitHub Pages (`greg0r1.github.io/resume/`).
- **Contenu factuel inchangé** : textes, chiffres, dates, parcours et photo restent tels quels ;
  seule la forme est en jeu.

Fonctionnalités existantes à préserver : bouton impression/PDF, menu versions ATS, téléchargement
vCard, partage (Web Share API), lightbox photo, sommaire de navigation mobile, suivi GA4
(`G-9NL3SLVE1T`), balisage `schema.org/Person` en JSON-LD, favicons et Open Graph.

Langue de l'interface : français (`lang="fr"`).

## Brand Commitments

- Nom, photo de portrait et coordonnées réelles.
- Le monogramme « G. » sert de favicon (`favicon.svg`) — actuellement anthracite/crème/terracotta,
  à réaligner si la palette change.
- Aucun engagement de palette ou de typographie : l'identité crème + terracotta + Playfair du
  site actuel est explicitement remise en jeu.

## Evidence on Hand

Matériel réel disponible :

- Portrait : `assets/images/profile-photo.jpeg`.
- Chiffres vérifiés cités par l'auteur : 3 ans+ d'Angular en production, 1000+ installations en
  prod, 50+ sites WordPress/PrestaShop livrés, +120 % de trafic organique moyen, 98 % de
  satisfaction client (auto-entrepreneur), 92 % de satisfaction et +50 K€/an de cross-selling
  (APOJE LEASYS), 75 % de résolution au 1er appel et 80 % de NPS positif (CCA International).
- Profils publics : `github.com/greg0r1`, `linkedin.com/in/gregory-dernaucourt`.
- Certifications nommées : CodinGame JavaScript et PHP, OpenClassrooms (RNCP niv. 5 et 6),
  ITECOM Art Design, CAP Réseaux & Télécoms, CAP Infographie/PAO.

Absences à ne jamais combler par invention : aucun témoignage, aucun logo client autorisé,
aucune capture d'écran de SevenBox (produit propriétaire), aucune métrique de performance
technique (Lighthouse, temps de build, couverture de tests) n'a été fournie.

## Product Principles

1. **Le tri passe avant la lecture.** Un recruteur non technique doit savoir en quelques secondes
   qui c'est, quelle stack, quelle disponibilité, comment le joindre.
2. **Une seule source de vérité.** Écran, impression et exports ATS dérivent du même DOM ; tout
   contenu ajouté visuellement doit rester exploitable en flux linéaire.
3. **La forme est une pièce du dossier.** Sur un CV de développeur front-end, la qualité de
   l'interface est une compétence démontrée, pas une décoration.
4. **Rien à installer, rien à compiler.** La contrainte vanilla est un parti pris assumé et une
   preuve, pas une limitation subie.
5. **Aucune invention.** Les chiffres et le parcours sont vérifiables ; le design ne fabrique
   jamais de preuve qui n'existe pas.

## Accessibility & Inclusion

Le site actuel vise déjà : HTML sémantique, attributs ARIA sur les dialogues et menus, respect de
`prefers-reduced-motion`, navigation clavier. À conserver comme plancher. Aucune exigence de
conformité normative (RGAA/WCAG niveau X) n'a été formulée à ce stade.
