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

      // Les boutons ATS et Partager partagent la classe .cv-print-btn pour
      // le style, mais ne doivent PAS déclencher l'impression du CV stylisé.
      if (trigger.matches('[data-action="ats-pdf"], [data-action="ats-txt"], [data-action="share"]')) {
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
   * 5. Partage du CV (pensé pour le smartphone)
   *
   * Sur mobile, navigator.share ouvre la feuille de partage native
   * (WhatsApp, SMS, mail, AirDrop…). À défaut (desktop), on copie le
   * lien dans le presse-papiers avec un feedback sur le bouton.
   * ---------------------------------------------------------------- */

  function showShareFeedback(button, message) {
    if (!button) {
      return;
    }
    // Le bouton contient une icône SVG + libellés : on mémorise le
    // markup complet pour le restaurer après le feedback.
    if (!button.hasAttribute('data-original-html')) {
      button.setAttribute('data-original-html', button.innerHTML);
    }
    button.classList.add('is-copied');
    button.textContent = message;
    window.setTimeout(function () {
      button.classList.remove('is-copied');
      button.innerHTML = button.getAttribute('data-original-html');
    }, 2000);
  }

  function copyShareLink(button, url) {
    var done = function () { showShareFeedback(button, 'Lien copié !'); };
    var fail = function () { showShareFeedback(button, url); };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(url).then(done, fail);
      return;
    }

    // Repli pour les anciens navigateurs : zone de texte temporaire.
    var textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) {
      fail();
    }
    document.body.removeChild(textarea);
  }

  function shareCv(button) {
    var url = window.location.href;
    var data = {
      title: document.title,
      text: 'CV de Grégory Dernaucourt — Développeur Angular / TypeScript',
      url: url
    };

    if (navigator.share) {
      // L'utilisateur peut annuler la feuille de partage : ce n'est pas
      // une erreur, on l'ignore silencieusement.
      navigator.share(data).catch(function () {});
      return;
    }

    copyShareLink(button, url);
  }

  function initShare() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') {
        return;
      }
      var trigger = target.closest('[data-action="share"]');
      if (!trigger) {
        return;
      }
      event.preventDefault();
      shareCv(trigger);
    });
  }

  /* ----------------------------------------------------------------
   * 6. Sommaire mobile (table des matières)
   *
   * Construit le panneau de navigation à partir des sections marquées
   * [data-nav-label], groupées par page ([data-nav-group]). Source
   * unique = ce DOM : ajouter une section au CV suffit à l'inscrire
   * au sommaire. Le bouton flottant n'apparaît qu'en mobile (CSS).
   * ---------------------------------------------------------------- */

  function buildNavPanel(panelBody) {
    var groups = document.querySelectorAll('.cv-page[data-nav-group]');
    var built = false;

    Array.prototype.forEach.call(groups, function (page) {
      var items = page.querySelectorAll('[data-nav-label]');
      if (!items.length) {
        return;
      }

      var groupEl = document.createElement('section');
      groupEl.className = 'cv-nav-group';

      var titleEl = document.createElement('h3');
      titleEl.className = 'cv-nav-group__title';
      titleEl.textContent = page.getAttribute('data-nav-group');
      groupEl.appendChild(titleEl);

      var listEl = document.createElement('ol');
      listEl.className = 'cv-nav-list';

      Array.prototype.forEach.call(items, function (section) {
        if (!section.id) {
          return;
        }
        var li = document.createElement('li');
        li.className = 'cv-nav-item';
        var a = document.createElement('a');
        a.className = 'cv-nav-link';
        a.href = '#' + section.id;
        a.textContent = section.getAttribute('data-nav-label');
        li.appendChild(a);
        listEl.appendChild(li);
      });

      groupEl.appendChild(listEl);
      panelBody.appendChild(groupEl);
      built = true;
    });

    return built;
  }

  // Marque comme « courante » la dernière section passée sous la toolbar.
  function highlightCurrentSection(panel) {
    var links = panel.querySelectorAll('.cv-nav-link');
    if (!links.length) {
      return;
    }
    var offset = window.scrollY + 120; // hauteur toolbar + marge
    var currentId = '';
    Array.prototype.forEach.call(links, function (link) {
      var id = (link.getAttribute('href') || '').slice(1);
      var section = id ? document.getElementById(id) : null;
      link.classList.remove('is-current');
      if (section) {
        var top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= offset) {
          currentId = id;
        }
      }
    });
    if (currentId) {
      var current = panel.querySelector('.cv-nav-link[href="#' + currentId + '"]');
      if (current) {
        current.classList.add('is-current');
      }
    }
  }

  function initSectionNav() {
    var fab = document.querySelector('[data-action="nav-toggle"]');
    var panel = document.getElementById('cv-nav-panel');
    var backdrop = document.querySelector('.cv-nav-backdrop');
    var panelBody = panel ? panel.querySelector('.cv-nav-panel__body') : null;

    if (!fab || !panel || !backdrop || !panelBody) {
      return;
    }

    if (!buildNavPanel(panelBody)) {
      // Aucune section marquée : on retire l'UI pour ne pas afficher
      // un sommaire vide.
      fab.parentNode.removeChild(fab);
      return;
    }

    var isOpen = false;

    function openNav() {
      if (isOpen) {
        return;
      }
      isOpen = true;
      highlightCurrentSection(panel);
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      fab.setAttribute('aria-expanded', 'true');
      var closeBtn = panel.querySelector('.cv-nav-panel__close');
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeNav(restoreFocus) {
      if (!isOpen) {
        return;
      }
      isOpen = false;
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      fab.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        fab.focus();
      }
    }

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') {
        return;
      }

      if (target.closest('[data-action="nav-toggle"]')) {
        event.preventDefault();
        if (isOpen) {
          closeNav(true);
        } else {
          openNav();
        }
        return;
      }

      if (target.closest('[data-action="nav-close"]')) {
        event.preventDefault();
        closeNav(true);
        return;
      }

      // Clic sur un lien du sommaire : on laisse l'ancre faire le
      // défilement (scroll-behavior: smooth) et on referme le panneau.
      if (target.closest('.cv-nav-link')) {
        closeNav(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNav(true);
      }
    });
  }

  /* ----------------------------------------------------------------
   * Toolbar escamotable (mobile)
   * Sur smartphone, la barre d'actions se masque quand on défile
   * vers le bas (lecture) et réapparaît dès qu'on remonte. Sur
   * desktop elle reste fixe : le document a la place de respirer.
   * ---------------------------------------------------------------- */

  function initToolbarAutoHide() {
    var toolbar = document.querySelector('.cv-toolbar');
    if (!toolbar || typeof window.matchMedia !== 'function') {
      return;
    }

    var mobileMQ = window.matchMedia('(max-width: 900px)');
    var lastY = window.scrollY || 0;
    var ticking = false;

    function update() {
      ticking = false;

      if (!mobileMQ.matches) {
        toolbar.classList.remove('cv-toolbar--hidden');
        lastY = window.scrollY || 0;
        return;
      }

      var y = window.scrollY || 0;
      var delta = y - lastY;

      // Près du haut de page : toujours visible.
      if (y < 80) {
        toolbar.classList.remove('cv-toolbar--hidden');
      } else if (delta > 4) {
        toolbar.classList.add('cv-toolbar--hidden');
      } else if (delta < -4) {
        toolbar.classList.remove('cv-toolbar--hidden');
      }

      lastY = y;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------------
   * Initialisation
   * ---------------------------------------------------------------- */

  function init() {
    initPrint();
    initAts();
    initShare();
    initSectionNav();
    initPageAnimation();
    initToolbarAutoHide();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Le script est chargé avec defer, mais on couvre tous les cas.
    init();
  }
})();
