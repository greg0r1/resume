/**
 * CV — Grégory Dernaucourt
 * Interactions vanilla JS (sans framework, sans dépendance).
 *
 * Responsabilités :
 *  1. Impression / export PDF via [data-action="print"] / .cv-print-btn.
 *  2. Ne pas interférer avec le raccourci natif Ctrl/Cmd + P.
 *  3. Animation d'apparition subtile des .cv-page (respecte prefers-reduced-motion).
 *  4. Robustesse : guards partout, aucune erreur si un sélecteur manque.
 *
 * Le contenu daté du CV (2026, etc.) est volontaire : ce script n'altère AUCUN texte.
 */
(function () {
  'use strict';

  /* ----------------------------------------------------------------
   * Helpers & garde-fous
   * ---------------------------------------------------------------- */

  // Préférence utilisateur : animations réduites ?
  var reducedMotionMQ =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  function prefersReducedMotion() {
    return !!(reducedMotionMQ && reducedMotionMQ.matches);
  }

  // Sommes-nous en contexte d'impression ?
  function isPrintContext() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('print').matches
    );
  }

  /* ----------------------------------------------------------------
   * 1 & 2. Impression / export PDF
   *
   * Au clic sur tout [data-action="print"] (inclut .cv-print-btn),
   * on appelle window.print(). Le CSS @media print gère la mise en
   * page A4 ; « Enregistrer au format PDF » produit le PDF 2 pages.
   *
   * Le raccourci natif Ctrl/Cmd + P n'est PAS intercepté : il reste
   * géré par le navigateur (même résultat, aucune interférence).
   * ---------------------------------------------------------------- */

  function triggerPrint(sourceButton) {
    if (typeof window.print !== 'function') {
      return;
    }

    // Petit feedback visuel optionnel sur le bouton déclencheur.
    if (sourceButton) {
      sourceButton.classList.add('is-printing');
      sourceButton.setAttribute('aria-busy', 'true');
    }

    // Nettoyage du feedback une fois la boîte d'impression refermée.
    var clearFeedback = function () {
      if (sourceButton) {
        sourceButton.classList.remove('is-printing');
        sourceButton.removeAttribute('aria-busy');
      }
      window.removeEventListener('afterprint', clearFeedback);
    };
    window.addEventListener('afterprint', clearFeedback);
    // Filet de sécurité si l'événement afterprint n'est pas émis.
    window.setTimeout(clearFeedback, 4000);

    window.print();
  }

  function initPrint() {
    // Délégation d'événement : couvre tout [data-action="print"]
    // présent maintenant ou ajouté ultérieurement.
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') {
        return;
      }

      var trigger = target.closest('[data-action="print"], .cv-print-btn');
      if (!trigger) {
        return;
      }

      // Les boutons ATS partagent la classe .cv-print-btn pour le style,
      // mais ne doivent PAS déclencher l'impression du CV stylisé.
      if (trigger.matches('[data-action="ats-pdf"], [data-action="ats-txt"]')) {
        return;
      }

      event.preventDefault();
      triggerPrint(trigger);
    });
  }

  /* ----------------------------------------------------------------
   * 3. Animation d'apparition des .cv-page
   *
   * Fade + translation légère. Styles posés en JS uniquement pour
   * l'animation (autonomie vis-à-vis du CSS). Désactivée si
   * prefers-reduced-motion ou en contexte d'impression.
   * On utilise IntersectionObserver quand disponible ; sinon, on
   * révèle tout immédiatement (dégradation gracieuse).
   * ---------------------------------------------------------------- */

  function revealPage(page) {
    page.classList.add('is-visible');
    page.style.opacity = '1';
    page.style.transform = 'none';
  }

  function initPageAnimation() {
    var pages = document.querySelectorAll('.cv-page');
    if (!pages.length) {
      return;
    }

    // Pas d'animation : on s'assure simplement que tout est visible.
    if (prefersReducedMotion() || isPrintContext()) {
      Array.prototype.forEach.call(pages, revealPage);
      return;
    }

    // État initial (caché) + transition, posés en JS.
    Array.prototype.forEach.call(pages, function (page, index) {
      page.style.opacity = '0';
      page.style.transform = 'translateY(16px)';
      page.style.transition =
        'opacity 0.6s ease, transform 0.6s ease';
      // Léger décalage par page pour un effet en cascade.
      page.style.transitionDelay = index * 0.12 + 's';
      page.style.willChange = 'opacity, transform';
    });

    // Sécurité : si l'impression démarre pendant l'animation,
    // on révèle tout instantanément pour ne pas tronquer le PDF.
    if (typeof window.matchMedia === 'function') {
      var printMQ = window.matchMedia('print');
      var onPrintChange = function (e) {
        if (e.matches) {
          Array.prototype.forEach.call(pages, function (page) {
            page.style.transition = 'none';
            revealPage(page);
          });
        }
      };
      if (typeof printMQ.addEventListener === 'function') {
        printMQ.addEventListener('change', onPrintChange);
      } else if (typeof printMQ.addListener === 'function') {
        printMQ.addListener(onPrintChange); // compat anciens navigateurs
      }
    }

    // Révélation au scroll via IntersectionObserver si disponible.
    if (typeof window.IntersectionObserver === 'function') {
      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealPage(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
      );
      Array.prototype.forEach.call(pages, function (page) {
        observer.observe(page);
      });
    } else {
      // Pas d'IntersectionObserver : on révèle après le premier paint.
      window.requestAnimationFrame(function () {
        Array.prototype.forEach.call(pages, revealPage);
      });
    }
  }

  /* ----------------------------------------------------------------
   * 4. Génération de la version ATS (à partir du DOM)
   *
   * Le CV affiché est en deux colonnes — illisible pour un robot ATS,
   * qui lit de gauche à droite et mélange les colonnes. On reconstruit
   * donc, à la volée, une version mono-colonne en flux linéaire à
   * partir du même contenu (source unique = ce DOM). Deux sorties :
   *   - PDF  : on ouvre une fenêtre HTML mono-colonne et on l'imprime.
   *   - .txt : on télécharge le texte brut (champs « coller votre CV »).
   *
   * Robustesse : chaque extraction est protégée par des guards ; si une
   * section manque, elle est simplement ignorée.
   * ---------------------------------------------------------------- */

  // Normalise un texte : espaces compactés, lignes nettoyées.
  function cleanText(node) {
    if (!node) {
      return '';
    }
    var txt = node.textContent || '';
    return txt.replace(/\s+/g, ' ').trim();
  }

  // Retire les accents (sécurité maximale pour les vieux parseurs ATS).
  function deburr(str) {
    if (!str) {
      return '';
    }
    // Normalisation Unicode si disponible, sinon table de repli.
    if (typeof str.normalize === 'function') {
      return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
    return str
      .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
      .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
      .replace(/[ÀÂÄ]/g, 'A').replace(/[ÉÈÊË]/g, 'E')
      .replace(/[ÎÏ]/g, 'I').replace(/[ÔÖ]/g, 'O')
      .replace(/[ÙÛÜ]/g, 'U').replace(/Ç/g, 'C');
  }

  // Remplace les séparateurs/caractères décoratifs par des équivalents ATS.
  function atsSafe(str) {
    return deburr(str)
      .replace(/[·•]/g, ', ')   // points médians -> virgules
      .replace(/—/g, '-')        // tirets cadratins -> tirets simples
      .replace(/\s*,\s*,\s*/g, ', ')
      .replace(/\(\s*,\s*/g, '(') // « ( , Stage » -> « (Stage »
      .replace(/\s*,\s*\)/g, ')') // « Stage , ) » -> « Stage) »
      .replace(/\s+,/g, ',')      // espace avant virgule orpheline
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Construit le modèle de données ATS en parcourant le DOM.
  function buildAtsModel() {
    var model = {
      name: '',
      role: '',
      contact: [],
      summary: '',
      sections: [] // { title, blocks: [{ heading, meta, paragraphs[], bullets[] }] }
    };

    model.name = atsSafe(cleanText(document.querySelector('.cv-name')));
    model.role = atsSafe(cleanText(document.querySelector('.cv-role')));

    // Contacts : libellé + valeur ATS via data-attributs.
    var contactLines = document.querySelectorAll('.cv-contact__line');
    Array.prototype.forEach.call(contactLines, function (line) {
      var label = line.getAttribute('data-ats-label');
      var value = line.getAttribute('data-ats-value');
      if (label && value) {
        model.contact.push(atsSafe(label) + ' : ' + atsSafe(value));
      }
    });

    model.summary = atsSafe(cleanText(document.querySelector('.cv-summary')));

    // --- Compétences (colonne latérale) regroupées par bloc ---
    var skills = { title: 'Competences techniques', blocks: [] };
    var sideBlocks = document.querySelectorAll('.cv-side-block');
    Array.prototype.forEach.call(sideBlocks, function (block) {
      var titleEl = block.querySelector('.cv-side-title');
      var title = atsSafe(cleanText(titleEl));
      // On ne garde dans « Compétences » que les blocs de tags.
      var tags = block.querySelectorAll('.cv-tag');
      if (tags.length) {
        var list = Array.prototype.map
          .call(tags, function (t) { return atsSafe(cleanText(t)); })
          .join(', ');
        skills.blocks.push({ heading: title, paragraphs: [list], bullets: [], meta: '' });
      }
    });
    if (skills.blocks.length) {
      model.sections.push(skills);
    }

    // --- Expérience professionnelle (postes principaux + timeline) ---
    var exp = { title: 'Experience professionnelle', blocks: [] };

    // Postes détaillés (.cv-job, page 1).
    var jobs = document.querySelectorAll('.cv-job');
    Array.prototype.forEach.call(jobs, function (job) {
      var heading = atsSafe(cleanText(job.querySelector('.cv-job__title')));
      var date = atsSafe(cleanText(job.querySelector('.cv-job__date')));
      var company = atsSafe(cleanText(job.querySelector('.cv-job__company')));
      var desc = atsSafe(cleanText(job.querySelector('.cv-job__desc')));
      var meta = [company, date].filter(Boolean).join(' | ');

      var paragraphs = [];
      if (desc) {
        paragraphs.push(desc);
      }
      var bullets = Array.prototype.map.call(
        job.querySelectorAll('.cv-bullet'),
        function (b) { return atsSafe(cleanText(b)); }
      );
      var stackVal = job.querySelector('.cv-stack__value');
      if (stackVal) {
        paragraphs.push('Technologies : ' + atsSafe(cleanText(stackVal)));
      }
      exp.blocks.push({ heading: heading, meta: meta, paragraphs: paragraphs, bullets: bullets });
    });

    // Timeline (page 2) : postes plus anciens.
    var timelineItems = document.querySelectorAll('.cv-timeline-item');
    Array.prototype.forEach.call(timelineItems, function (item) {
      var heading = atsSafe(cleanText(item.querySelector('.cv-timeline-item__title')));
      var date = atsSafe(cleanText(item.querySelector('.cv-timeline-item__date')));
      var company = atsSafe(cleanText(item.querySelector('.cv-timeline-item__company')));
      var desc = atsSafe(cleanText(item.querySelector('.cv-timeline-item__desc')));
      var meta = [company, date].filter(Boolean).join(' | ');
      exp.blocks.push({
        heading: heading,
        meta: meta,
        paragraphs: desc ? [desc] : [],
        bullets: []
      });
    });
    if (exp.blocks.length) {
      model.sections.push(exp);
    }

    // --- Formation ---
    var edu = { title: 'Formation', blocks: [] };
    var eduItems = document.querySelectorAll('.cv-edu-item');
    Array.prototype.forEach.call(eduItems, function (item) {
      var heading = atsSafe(cleanText(item.querySelector('.cv-edu-item__title')));
      var meta = atsSafe(cleanText(item.querySelector('.cv-edu-item__meta')));
      edu.blocks.push({ heading: heading, meta: meta, paragraphs: [], bullets: [] });
    });
    if (edu.blocks.length) {
      model.sections.push(edu);
    }

    // --- Listes en chevrons (Certifications, Centres d'intérêt) ---
    var bottomCols = document.querySelectorAll('.cv-bottom-col');
    Array.prototype.forEach.call(bottomCols, function (col) {
      var title = atsSafe(cleanText(col.querySelector('.cv-side-title')));
      var chevrons = col.querySelectorAll('.cv-chevron-item');
      if (title && chevrons.length) {
        var bullets = Array.prototype.map.call(chevrons, function (c) {
          return atsSafe(cleanText(c));
        });
        model.sections.push({
          title: title,
          blocks: [{ heading: '', meta: '', paragraphs: [], bullets: bullets }]
        });
      }
    });

    // --- Langues ---
    var langItems = document.querySelectorAll('.cv-lang-item');
    if (langItems.length) {
      var langBullets = Array.prototype.map.call(langItems, function (item) {
        var n = atsSafe(cleanText(item.querySelector('.cv-lang-item__name')));
        var lvl = atsSafe(cleanText(item.querySelector('.cv-lang-item__level')));
        return n + ' : ' + lvl;
      });
      model.sections.push({
        title: 'Langues',
        blocks: [{ heading: '', meta: '', paragraphs: [], bullets: langBullets }]
      });
    }

    return model;
  }

  // Rend le modèle en texte brut (.txt).
  function modelToText(model) {
    var lines = [];
    lines.push(model.name);
    if (model.role) {
      lines.push(model.role);
    }
    lines.push('');
    model.contact.forEach(function (c) { lines.push(c); });
    if (model.summary) {
      lines.push('');
      lines.push('PROFIL');
      lines.push(model.summary);
    }
    model.sections.forEach(function (section) {
      lines.push('');
      lines.push(section.title.toUpperCase());
      section.blocks.forEach(function (block) {
        if (block.heading) {
          lines.push('');
          lines.push(block.heading);
        }
        if (block.meta) {
          lines.push(block.meta);
        }
        (block.paragraphs || []).forEach(function (p) { lines.push(p); });
        (block.bullets || []).forEach(function (b) { lines.push('- ' + b); });
      });
    });
    return lines.join('\n');
  }

  // Échappe le HTML pour l'injection sûre dans le document PDF.
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Rend le modèle en document HTML mono-colonne (pour impression PDF).
  function modelToHtml(model) {
    var parts = [];
    parts.push('<header><h1>' + escapeHtml(model.name) + '</h1>');
    if (model.role) {
      parts.push('<p class="role">' + escapeHtml(model.role) + '</p>');
    }
    parts.push('<div class="contact">');
    model.contact.forEach(function (c) {
      parts.push('<p>' + escapeHtml(c) + '</p>');
    });
    parts.push('</div></header>');

    if (model.summary) {
      parts.push('<section><h2>Profil</h2><p>' + escapeHtml(model.summary) + '</p></section>');
    }

    model.sections.forEach(function (section) {
      parts.push('<section><h2>' + escapeHtml(section.title) + '</h2>');
      section.blocks.forEach(function (block) {
        if (block.heading) {
          parts.push('<h3>' + escapeHtml(block.heading) + '</h3>');
        }
        if (block.meta) {
          parts.push('<p class="meta">' + escapeHtml(block.meta) + '</p>');
        }
        (block.paragraphs || []).forEach(function (p) {
          parts.push('<p>' + escapeHtml(p) + '</p>');
        });
        if (block.bullets && block.bullets.length) {
          parts.push('<ul>');
          block.bullets.forEach(function (b) {
            parts.push('<li>' + escapeHtml(b) + '</li>');
          });
          parts.push('</ul>');
        }
      });
      parts.push('</section>');
    });

    var css =
      '*{margin:0;padding:0;box-sizing:border-box}' +
      'body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45;' +
      'color:#000;background:#fff;max-width:800px;margin:0 auto;padding:30px 40px}' +
      'h1{font-size:22pt;margin-bottom:4px}' +
      '.role{font-size:13pt;font-weight:bold;margin-bottom:10px}' +
      '.contact{font-size:10.5pt;margin-bottom:6px}.contact p{margin-bottom:2px}' +
      'h2{font-size:13pt;text-transform:uppercase;border-bottom:1px solid #000;' +
      'margin:20px 0 10px;padding-bottom:3px}' +
      'h3{font-size:11.5pt;margin-top:12px}.meta{font-weight:bold;margin-bottom:4px}' +
      'p{margin-bottom:6px}ul{margin:0 0 8px 20px}li{margin-bottom:4px}' +
      '@media print{body{padding:0;max-width:none}}';

    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">' +
      '<title>' + escapeHtml(model.name) + ' - CV (version ATS)</title>' +
      '<style>' + css + '</style></head><body>' +
      parts.join('') +
      '</body></html>';
  }

  // Déclenche le téléchargement d'un fichier texte.
  function downloadTextFile(filename, content) {
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function exportAtsPdf() {
    var model = buildAtsModel();

    // On imprime dans un iframe caché (et non une pop-up) : pas de blocage
    // pop-up, et surtout l'impression cible le bon document. La fenêtre
    // principale (CV stylisé) n'est jamais imprimée par erreur.
    var existing = document.getElementById('cv-ats-frame');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    var iframe = document.createElement('iframe');
    iframe.id = 'cv-ats-frame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    var doc = iframe.contentWindow.document;
    // Le HTML ATS contient un script d'auto-impression destiné à window.open ;
    // ici on imprime nous-mêmes l'iframe, donc on injecte sans ce script.
    doc.open();
    doc.write(modelToHtml(model));
    doc.close();

    var printFrame = function () {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        // Repli : si l'impression de l'iframe échoue, on télécharge le .txt.
        exportAtsTxt();
      }
    };

    // On attend que le document de l'iframe soit prêt avant d'imprimer.
    if (iframe.contentWindow.document.readyState === 'complete') {
      window.setTimeout(printFrame, 200);
    } else {
      iframe.addEventListener('load', function () {
        window.setTimeout(printFrame, 200);
      });
    }
  }

  function exportAtsTxt() {
    var model = buildAtsModel();
    var slug = (model.name || 'cv').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    downloadTextFile(slug + '-ats.txt', modelToText(model));
  }

  function initAts() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      if (target.closest('[data-action="ats-pdf"]')) {
        event.preventDefault();
        exportAtsPdf();
      } else if (target.closest('[data-action="ats-txt"]')) {
        event.preventDefault();
        exportAtsTxt();
      }
    });
  }

  /* ----------------------------------------------------------------
   * Initialisation
   * ---------------------------------------------------------------- */

  function init() {
    initPrint();
    initAts();
    initPageAnimation();
    // Log discret.
    if (window.console && typeof window.console.log === 'function') {
      console.log('CV Grégory Dernaucourt — prêt');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Le script est chargé avec defer, mais on couvre tous les cas.
    init();
  }
})();
