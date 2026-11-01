let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (e) {
  PDFDocument = null;
  console.warn("[PDF Service] Notice: 'pdfkit' module is not yet installed on this server. Run 'npm install' in the backend directory to enable server-side PDF generation.");
}

/**
 * Remove enclosing double, single, or backtick quotation marks from text
 * @param {string} str
 * @returns {string}
 */
function stripQuotes(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, '')
    .trim();
}

/**
 * Clean and normalize text into ASCII-safe PDF text
 * @param {string} txt
 * @returns {string}
 */
function cleanText(txt) {
  if (!txt) return '';
  return String(txt)
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/[\u2192\u21D2\u2794\u27A1]/g, '->')
    .replace(/[\u2022\u2023\u25E6\u2043]/g, '-')
    .replace(/₹/g, 'Rs. ')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a clean, executive 3-page PDF dossier buffer from avatar data
 * @param {Object} data - Avatar output data { lifeboat, yacht, bridge, title }
 * @returns {Promise<Buffer|null>} - Resolves with PDF file Buffer or null if pdfkit is unavailable
 */
function generateAvatarPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    try {
      if (!data) {
        return reject(new Error('No avatar data provided for PDF generation'));
      }

      if (!PDFDocument) {
        return resolve(null);
      }

      // Margins 0 and overriding continueOnNewPage guarantees strictly 3 pages
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: data.title || 'Customer Avatar Dossier',
          Author: 'WOW Events Customer Avatar Creator',
          Subject: 'Lifeboat & Yacht Customer Avatars with Strategic Bridge',
          Creator: 'Customer Avatar Creator'
        }
      });

      // Disable internal automatic page breaks so PDFKit never adds unexpected blank pages
      doc.continueOnNewPage = function() { return this; };

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 28;
      const contentWidth = pageWidth - (margin * 2); // 539.28 pt

      // Theme Colors
      const colors = {
        navy: '#13294b',
        ink: '#0f1d2e',
        muted: '#5a6878',
        line: '#d5dde6',
        cardBg: '#ffffff',
        bgSoft: '#f8fafc',
        pillBg: '#f1f5f9',
        life: '#e8590c',
        lifeSoft: '#fde7dc',
        lifeSubtle: '#fff8f4',
        yacht: '#0b7a75',
        yachtSoft: '#d8f0ee',
        yachtSubtle: '#f4fbfb',
        bridgeIndigo: '#29497a',
      };

      // Header Banner
      function drawPageHeader(title, subtitle, pageNum, primaryColor, softBgColor) {
        doc.roundedRect(margin, 24, contentWidth, 36, 5)
          .fillAndStroke(softBgColor, primaryColor);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .text(title.toUpperCase(), margin + 12, 31, { width: contentWidth - 110, lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8.5)
          .text(subtitle, margin + 12, 44, { width: contentWidth - 110, lineBreak: false });

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(`PAGE ${pageNum} OF 3`, margin + contentWidth - 95, 36, { width: 85, align: 'right', lineBreak: false });
      }

      // Page Footer
      function drawPageFooter(pageNum) {
        const footerY = 818;
        doc.strokeColor(colors.line)
          .lineWidth(0.5)
          .moveTo(margin, footerY - 4)
          .lineTo(margin + contentWidth, footerY - 4)
          .stroke();

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8)
          .text('WOW Events | Customer Avatar Creator Dossier', margin, footerY, { lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8)
          .text(`Page ${pageNum} of 3`, margin + contentWidth - 70, footerY, { width: 70, align: 'right', lineBreak: false });
      }

      // -------------------------------------------------------------
      // HELPER: RENDER PERSONA PAGE (PAGE 1: LIFEBOAT, PAGE 2: YACHT)
      // -------------------------------------------------------------
      function renderPersonaPage(avatar, isLifeboat) {
        const pageNum = isLifeboat ? 1 : 2;
        const primaryColor = isLifeboat ? colors.life : colors.yacht;
        const softBg = isLifeboat ? colors.lifeSoft : colors.yachtSoft;
        const subtleBg = isLifeboat ? colors.lifeSubtle : colors.yachtSubtle;
        const defaultAnimal = isLifeboat ? 'RABBIT' : 'FALCON';
        const defaultName = isLifeboat ? 'Rescue Rhea the Restless Rabbit' : 'Visionary Victor the Soaring Falcon';
        const defaultTagline = isLifeboat
          ? 'Ears up, heart racing, ready to bolt at the next bad message.'
          : 'Scanning the entire horizon from 10,000 feet, ready for the next peak.';
        const defaultWhy = isLifeboat
          ? 'A rabbit senses danger everywhere and stays in constant survival mode.'
          : 'Falcons fly high above the tactical noise, spotting strategic opportunities early.';

        drawPageHeader(
          isLifeboat ? 'Lifeboat Customer Avatar' : 'Yacht Customer Avatar',
          isLifeboat ? 'Situation: Urgent, In Crisis, High Pain, Needs Rapid Rescue' : 'Situation: Growing, Doing Well, High Ambition, Seeks Status & Scale',
          pageNum,
          primaryColor,
          softBg
        );

        // 1. Hero Box (Y: 68 -> 142, Height: 74)
        let curY = 68;
        doc.roundedRect(margin, curY, contentWidth, 74, 5)
          .fillAndStroke(colors.cardBg, colors.line);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`${isLifeboat ? 'LIFEBOAT' : 'YACHT'} ARCHETYPE: ${stripQuotes(cleanText(avatar.animal || defaultAnimal)).toUpperCase()}`, margin + 12, curY + 9, { lineBreak: false });

        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(15)
          .text(stripQuotes(cleanText(avatar.characterName || defaultName)), margin + 12, curY + 23, { width: contentWidth - 24, lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica-Oblique')
          .fontSize(9)
          .text(stripQuotes(cleanText(avatar.tagline || defaultTagline)), margin + 12, curY + 44, { width: contentWidth - 24, height: 24 });

        // 2. Why Animal Box (Y: 150 -> 198, Height: 48)
        curY = 150;
        doc.roundedRect(margin, curY, contentWidth, 48, 4)
          .fillAndStroke(colors.bgSoft, colors.line);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(`Why a ${stripQuotes(cleanText(avatar.animal || defaultAnimal))}?`, margin + 10, curY + 7, { lineBreak: false });

        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.whyAnimal || defaultWhy)), margin + 10, curY + 20, { width: contentWidth - 20, height: 24 });

        // 3. Current State vs Desired State (Y: 206 -> 298, Height: 92)
        curY = 206;
        const halfWidth = (contentWidth - 12) / 2;

        // Current State Card
        doc.roundedRect(margin, curY, halfWidth, 92, 5)
          .fillAndStroke(isLifeboat ? '#fffaf8' : '#f8fafc', isLifeboat ? colors.life : colors.line);
        doc.fillColor(isLifeboat ? colors.life : colors.muted)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(isLifeboat ? 'CURRENT STATE (THE PAIN)' : 'CURRENT SUCCESS BASELINE', margin + 10, curY + 9, { lineBreak: false });
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.currentState || (isLifeboat ? 'Facing immediate delivery crisis with failing vendor.' : 'Baseline events are functional, but lack category impact.'))), margin + 10, curY + 24, { width: halfWidth - 20, height: 62 });

        // Desired State Card
        doc.roundedRect(margin + halfWidth + 12, curY, halfWidth, 92, 5)
          .fillAndStroke(isLifeboat ? '#f6fbfb' : '#f6fbfb', colors.yacht);
        doc.fillColor(colors.yacht)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(isLifeboat ? 'DESIRED STATE (THE RELIEF)' : 'DESIRED ASPIRATIONAL PEAK', margin + halfWidth + 22, curY + 9, { lineBreak: false });
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.desiredState || (isLifeboat ? 'Smooth project stabilization, fixed-scope budget, and praise from executive team.' : 'A signature flagship benchmark event that earns executive acclaim.'))), margin + halfWidth + 22, curY + 24, { width: halfWidth - 20, height: 62 });

        // 4. Stage of Business / Life (Y: 306 -> 338, Height: 32)
        curY = 306;
        doc.roundedRect(margin, curY, contentWidth, 32, 4)
          .fillAndStroke(colors.bgSoft, colors.line);
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text('STAGE OF BUSINESS / LIFE: ', margin + 10, curY + 10, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(avatar.stage || 'Mid-career executive under delivery pressure.')), { width: contentWidth - 170, lineBreak: false });

        // 5. Two-Column Structured Grid (Y: 346 -> 628, Height: 282)
        curY = 346;
        const col1X = margin;
        const col2X = margin + halfWidth + 12;

        // --- LEFT COLUMN ---
        // Top 3 Pain Points / Ambition Drivers
        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(isLifeboat ? 'Top 3 Pain Points' : 'Top 3 Ambition Drivers & Needs', col1X, curY, { lineBreak: false });

        const pains = Array.isArray(avatar.painPoints) ? avatar.painPoints : [];
        let painY = curY + 16;
        pains.slice(0, 3).forEach((p, idx) => {
          doc.roundedRect(col1X, painY, halfWidth, 36, 4)
            .fillAndStroke(colors.bgSoft, colors.line);
          doc.fillColor(primaryColor)
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .text(`${idx + 1}.`, col1X + 8, painY + 7, { lineBreak: false });
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8)
            .text(stripQuotes(cleanText(p)), col1X + 22, painY + 7, { width: halfWidth - 30, height: 24 });
          painY += 40;
        });

        // Buying Behaviour
        const buyHeaderY = curY + 142;
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('Buying Behaviour', col1X, buyHeaderY, { lineBreak: false });

        const buying = Array.isArray(avatar.buyingBehaviour) ? avatar.buyingBehaviour : [];
        let buyY = buyHeaderY + 16;
        buying.slice(0, 3).forEach(b => {
          doc.roundedRect(col1X, buyY, halfWidth, 36, 4)
            .fillAndStroke(colors.cardBg, colors.line);
          doc.fillColor(primaryColor)
            .font('Helvetica')
            .fontSize(8.5)
            .text('-', col1X + 8, buyY + 7, { lineBreak: false });
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8)
            .text(stripQuotes(cleanText(b)), col1X + 18, buyY + 7, { width: halfWidth - 26, height: 24 });
          buyY += 40;
        });

        // --- RIGHT COLUMN ---
        // What They Want
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('What They Want', col2X, curY, { lineBreak: false });

        const wants = Array.isArray(avatar.wants) ? avatar.wants : [];
        let wantY = curY + 16;
        wants.slice(0, 3).forEach(w => {
          doc.roundedRect(col2X, wantY, halfWidth, 36, 4)
            .fillAndStroke(subtleBg, colors.line);
          doc.fillColor(colors.yacht)
            .font('Helvetica')
            .fontSize(8.5)
            .text('-', col2X + 8, wantY + 7, { lineBreak: false });
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8)
            .text(stripQuotes(cleanText(w)), col2X + 18, wantY + 7, { width: halfWidth - 26, height: 24 });
          wantY += 40;
        });

        // Language They Use
        doc.fillColor(colors.navy)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text('Language They Use', col2X, buyHeaderY, { lineBreak: false });

        const quotes = Array.isArray(avatar.language) ? avatar.language : [];
        let quoteY = buyHeaderY + 16;
        quotes.slice(0, 3).forEach(q => {
          doc.roundedRect(col2X, quoteY, halfWidth, 36, 4)
            .fillAndStroke(colors.cardBg, colors.line);
          const cleanedQuote = stripQuotes(cleanText(q));
          doc.fillColor(colors.muted)
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text(`"${cleanedQuote}"`, col2X + 8, quoteY + 7, { width: halfWidth - 16, height: 24 });
          quoteY += 40;
        });

        // 6. Recommended Next Steps (Y: 636 -> 804, Height: 168)
        curY = 636;
        doc.roundedRect(margin, curY, contentWidth, 168, 6)
          .fillAndStroke(colors.bgSoft, primaryColor);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(isLifeboat ? 'Recommended Next Steps (Lifeboat Action Plan)' : 'Recommended Next Steps (Yacht Growth Plan)', margin + 12, curY + 9, { lineBreak: false });

        const steps = Array.isArray(avatar.nextSteps) ? avatar.nextSteps : [];
        let stepCardY = curY + 26;
        steps.slice(0, 3).forEach((st, idx) => {
          doc.roundedRect(margin + 12, stepCardY, contentWidth - 24, 40, 4)
            .fillAndStroke(colors.cardBg, colors.line);

          // Step Number Badge
          doc.roundedRect(margin + 20, stepCardY + 8, 24, 24, 3)
            .fillAndStroke(primaryColor, primaryColor);
          doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(String(idx + 1), margin + 20, stepCardY + 15, { width: 24, align: 'center', lineBreak: false });

          // Step Action Text
          doc.fillColor(colors.ink)
            .font('Helvetica')
            .fontSize(8.5)
            .text(stripQuotes(cleanText(st)), margin + 54, stepCardY + 8, { width: contentWidth - 76, height: 26 });

          stepCardY += 46;
        });

        drawPageFooter(pageNum);
      }

      // -------------------------------------------------------------
      // PAGE 1: LIFEBOAT AVATAR
      // -------------------------------------------------------------
      renderPersonaPage(data.lifeboat || {}, true);

      // -------------------------------------------------------------
      // PAGE 2: YACHT AVATAR
      // -------------------------------------------------------------
      doc.addPage();
      renderPersonaPage(data.yacht || {}, false);

      // -------------------------------------------------------------
      // PAGE 3: HOW YOU SERVE BOTH (STRATEGIC BRIDGE)
      // -------------------------------------------------------------
      doc.addPage();
      const br = data.bridge || {};
      drawPageHeader(
        'Strategic Offer Architecture',
        'How to Serve Both: Moving Clients from Emergency Rescue to Retainer Mastery',
        3,
        colors.navy,
        '#eef2f6'
      );

      // 1. Strategic Headline Card (Y: 68 -> 134, Height: 66)
      let curY3 = 68;
      doc.roundedRect(margin, curY3, contentWidth, 66, 5)
        .fillAndStroke(colors.cardBg, colors.line);

      doc.fillColor(colors.muted)
        .font('Helvetica')
        .fontSize(8.5)
        .text('STRATEGIC HEADLINE', margin + 12, curY3 + 8, { lineBreak: false });

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(13.5)
        .text(stripQuotes(cleanText(br.headline || 'From Emergency Fire Drill to Market-Defining Benchmark')), margin + 12, curY3 + 22, { width: contentWidth - 24, height: 38 });

      // 2. Two Offer Cards Side by Side (Y: 142 -> 292, Height: 150)
      curY3 = 142;
      const halfBoxWidth = (contentWidth - 12) / 2;

      // Lifeboat Offer Card
      doc.roundedRect(margin, curY3, halfBoxWidth, 150, 5)
        .fillAndStroke('#fffaf8', colors.life);
      doc.fillColor(colors.life)
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text('LIFEBOAT OFFER (RESCUE)', margin + 12, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted)
        .font('Helvetica-Oblique')
        .fontSize(8.5)
        .text('Fixed-scope emergency sprint', margin + 12, curY3 + 25, { lineBreak: false });
      doc.strokeColor(colors.lifeSoft)
        .lineWidth(0.5)
        .moveTo(margin + 12, curY3 + 38)
        .lineTo(margin + halfBoxWidth - 12, curY3 + 38)
        .stroke();
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8.5)
        .text(stripQuotes(cleanText(br.lifeboatOffer || 'Rapid-response emergency rescue package with fixed pricing, transparent 48-hour sprints, and direct daily leadership reports.')), margin + 12, curY3 + 46, { width: halfBoxWidth - 24, height: 96 });

      // Yacht Offer Card
      doc.roundedRect(margin + halfBoxWidth + 12, curY3, halfBoxWidth, 150, 5)
        .fillAndStroke('#f6fbfb', colors.yacht);
      doc.fillColor(colors.yacht)
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .text('YACHT OFFER (TRANSFORMATION)', margin + halfBoxWidth + 24, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted)
        .font('Helvetica-Oblique')
        .fontSize(8.5)
        .text('Strategic annual retainer partner', margin + halfBoxWidth + 24, curY3 + 25, { lineBreak: false });
      doc.strokeColor(colors.yachtSoft)
        .lineWidth(0.5)
        .moveTo(margin + halfBoxWidth + 24, curY3 + 38)
        .lineTo(margin + contentWidth - 12, curY3 + 38)
        .stroke();
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8.5)
        .text(stripQuotes(cleanText(br.yachtOffer || 'Comprehensive annual brand experience architecture, dedicated concept lab, and multi-event strategic category leadership.')), margin + halfBoxWidth + 24, curY3 + 46, { width: halfBoxWidth - 24, height: 96 });

      // 3. Transformation Journey Ladder (Y: 300 -> 636, Height: 336)
      curY3 = 300;
      doc.roundedRect(margin, curY3, contentWidth, 336, 6)
        .fillAndStroke(colors.bgSoft, colors.line);

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(11.5)
        .text('The Lifeboat to Yacht Journey Ladder', margin + 14, curY3 + 10, { lineBreak: false });

      doc.fillColor(colors.muted)
        .font('Helvetica')
        .fontSize(8.5)
        .text('How rescue clients naturally transition into long-term strategic relationships:', margin + 14, curY3 + 25, { lineBreak: false });

      const journey = Array.isArray(br.journey) ? br.journey : [
        { tag: 'ENTRY', text: 'Client enters with an urgent rescue problem requiring immediate stabilization.' },
        { tag: 'PROOF', text: 'Flawless execution under fire earns complete executive trust and relief.' },
        { tag: 'UPGRADE', text: 'A post-project review reveals strategic opportunities for the year ahead.' },
        { tag: 'RETAINER', text: 'The relationship upgrades to an annual strategic retainer driving category dominance.' }
      ];

      const ladderColors = [colors.life, colors.navy, colors.bridgeIndigo, colors.yacht];
      let stepRowY = curY3 + 44;
      journey.slice(0, 4).forEach((step, idx) => {
        const badgeColor = ladderColors[idx] || colors.navy;

        // Sub-card for this journey stage
        doc.roundedRect(margin + 12, stepRowY, contentWidth - 24, 64, 4)
          .fillAndStroke(colors.cardBg, colors.line);

        const rawTag = typeof step === 'string'
          ? (step.split(/[:\-–]/)[0] || `STEP ${idx + 1}`)
          : (step.tag || `STEP ${idx + 1}`);

        const rawText = typeof step === 'string'
          ? step.replace(/^[^:\-–]+[:\-–]\s*/, '')
          : (step.text || step.desc || '');

        // Badge pill
        doc.roundedRect(margin + 20, stepRowY + 18, 70, 26, 3)
          .fillAndStroke(badgeColor, badgeColor);

        doc.fillColor('#ffffff')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text(stripQuotes(cleanText(rawTag)).toUpperCase(), margin + 20, stepRowY + 26, { width: 70, align: 'center', lineBreak: false });

        // Step explanation narrative
        doc.fillColor(colors.ink)
          .font('Helvetica')
          .fontSize(9)
          .text(stripQuotes(cleanText(rawText)), margin + 102, stepRowY + 12, { width: contentWidth - 124, height: 42 });

        stepRowY += 70;
      });

      // 4. Strategic Summary Card (Y: 646 -> 804, Height: 158)
      curY3 = 646;
      doc.roundedRect(margin, curY3, contentWidth, 158, 6)
        .fillAndStroke(colors.cardBg, colors.navy);

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text('STRATEGIC SUMMARY MESSAGE', margin + 14, curY3 + 12, { lineBreak: false });

      doc.strokeColor(colors.line)
        .lineWidth(0.5)
        .moveTo(margin + 14, curY3 + 26)
        .lineTo(margin + contentWidth - 14, curY3 + 26)
        .stroke();

      const summaryPromise = stripQuotes(cleanText(br.message || 'We step in when you are in trouble to earn your trust; we stay when you are thriving to fuel your ambition.'));
      doc.fillColor(colors.ink)
        .font('Helvetica-Oblique')
        .fontSize(10.5)
        .text(
          `"${summaryPromise}"`,
          margin + 20,
          curY3 + 42,
          { width: contentWidth - 40, height: 100 }
        );

      drawPageFooter(3);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateAvatarPdfBuffer,
  stripQuotes,
  cleanText,
};
