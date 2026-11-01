let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (e) {
  PDFDocument = null;
  console.warn("[PDF Service] Notice: 'pdfkit' module is not yet installed on this server. Run 'npm install' in the backend directory to enable server-side PDF generation.");
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

      // Important: margins 0 and overriding continueOnNewPage guarantees exactly 3 pages
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: data.title || 'Customer Avatar Dossier',
          Author: 'WOW Events Customer Avatar Creator',
          Subject: 'Lifeboat & Yacht Customer Avatars with Bridge Strategy',
          Creator: 'Customer Avatar Creator'
        }
      });

      // Completely disable internal automatic pagebreaks so PDFKit never adds unexpected blank/broken pages
      doc.continueOnNewPage = function() { return this; };

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 32;
      const contentWidth = pageWidth - (margin * 2); // 531.28 pt

      // Theme Colors
      const colors = {
        navy: '#13294b',
        ink: '#0f1d2e',
        muted: '#5a6878',
        line: '#d5dde6',
        bgSoft: '#f8fafc',
        life: '#e8590c',
        lifeSoft: '#fde7dc',
        yacht: '#0b7a75',
        yachtSoft: '#d8f0ee',
      };

      // Helper for drawing a header banner on each page
      function drawPageHeader(title, subtitle, pageNum, primaryColor, softBgColor) {
        doc.roundedRect(margin, 24, contentWidth, 36, 5)
          .fillAndStroke(softBgColor, primaryColor);

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .text(title.toUpperCase(), margin + 12, 31, { width: contentWidth - 100, lineBreak: false });

        doc.fillColor(colors.muted)
          .font('Helvetica')
          .fontSize(8.5)
          .text(subtitle, margin + 12, 44, { width: contentWidth - 100, lineBreak: false });

        doc.fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .text(`PAGE ${pageNum} OF 3`, margin + contentWidth - 90, 36, { width: 80, align: 'right', lineBreak: false });
      }

      // Helper for drawing page footer
      function drawPageFooter(pageNum) {
        const footerY = 816;
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
          .text(`Page ${pageNum} of 3`, margin + contentWidth - 60, footerY, { width: 60, align: 'right', lineBreak: false });
      }

      // Helper for text sanitization (translates unicode symbols into clean PDF-safe text)
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

      // -------------------------------------------------------------
      // PAGE 1: LIFEBOAT AVATAR (RESCUE ME)
      // -------------------------------------------------------------
      const lb = data.lifeboat || {};
      drawPageHeader(
        'Lifeboat Customer Avatar',
        'Situation: Urgent, In Crisis, High Pain, Needs Rapid Rescue',
        1,
        colors.life,
        colors.lifeSoft
      );

      // Hero Box
      let curY = 68;
      doc.roundedRect(margin, curY, contentWidth, 54, 5)
        .fillAndStroke('#ffffff', colors.line);

      doc.fillColor(colors.life)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(`LIFEBOAT ARCHETYPE: ${cleanText(lb.animal || 'RABBIT').toUpperCase()}`, margin + 12, curY + 8, { lineBreak: false });

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text(cleanText(lb.characterName || 'Rescue Rhea the Restless Rabbit'), margin + 12, curY + 20, { width: contentWidth - 24, lineBreak: false });

      doc.fillColor(colors.muted)
        .font('Helvetica-Oblique')
        .fontSize(9)
        .text(cleanText(lb.tagline || 'Ears up, heart racing, ready to bolt at the next bad message.'), margin + 12, curY + 38, { width: contentWidth - 24, lineBreak: false });

      curY += 60;

      // Why this animal box
      doc.roundedRect(margin, curY, contentWidth, 34, 4)
        .fillAndStroke(colors.bgSoft, colors.line);
      doc.fillColor(colors.life)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(`Why a ${cleanText(lb.animal || 'Rabbit')}?`, margin + 10, curY + 6, { lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8.5)
        .text(cleanText(lb.whyAnimal || 'A rabbit senses danger everywhere and is in constant alert mode.'), margin + 10, curY + 18, { width: contentWidth - 20, lineBreak: false });

      curY += 40;

      // Current State vs Desired State (Side by Side)
      const halfBoxWidth = (contentWidth - 10) / 2;
      // Current State
      doc.roundedRect(margin, curY, halfBoxWidth, 54, 4)
        .fillAndStroke('#fffaf8', colors.life);
      doc.fillColor(colors.life)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('CURRENT STATE (THE PAIN)', margin + 10, curY + 6, { lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(cleanText(lb.currentState || 'Vendor dropped the ball; leadership is furious.'), margin + 10, curY + 18, { width: halfBoxWidth - 20, height: 32 });

      // Desired State
      doc.roundedRect(margin + halfBoxWidth + 10, curY, halfBoxWidth, 54, 4)
        .fillAndStroke('#f6fbfb', colors.yacht);
      doc.fillColor(colors.yacht)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('DESIRED STATE (THE RELIEF)', margin + halfBoxWidth + 20, curY + 6, { lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(cleanText(lb.desiredState || 'Walking into the venue seeing everything set, on budget and praised.'), margin + halfBoxWidth + 20, curY + 18, { width: halfBoxWidth - 20, height: 32 });

      curY += 60;

      // Stage of Business / Life
      doc.roundedRect(margin, curY, contentWidth, 26, 4)
        .fillAndStroke(colors.bgSoft, colors.line);
      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('STAGE OF BUSINESS / LIFE: ', margin + 10, curY + 8, { continued: true, lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(cleanText(lb.stage || 'Mid-career marketing manager under high delivery pressure.'), { width: contentWidth - 140, lineBreak: false });

      curY += 34;

      // 2-Column Grid
      const colWidth = (contentWidth - 16) / 2;
      const col1X = margin;
      const col2X = margin + colWidth + 16;
      const gridStartY = curY;

      // Column 1: Top 3 Pain Points
      doc.fillColor(colors.life).font('Helvetica-Bold').fontSize(9.5).text('Top 3 Pain Points', col1X, gridStartY, { lineBreak: false });
      let col1Y = gridStartY + 14;
      const painPoints = Array.isArray(lb.painPoints) ? lb.painPoints : [];
      painPoints.slice(0, 3).forEach((p, idx) => {
        doc.fillColor(colors.life).font('Helvetica-Bold').fontSize(8).text(`${idx + 1}. `, col1X, col1Y, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(p), { width: colWidth - 16, height: 26 });
        col1Y += 28;
      });

      // Column 1: Buying Behaviour
      col1Y += 4;
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(9.5).text('Buying Behaviour', col1X, col1Y, { lineBreak: false });
      col1Y += 14;
      const buying = Array.isArray(lb.buyingBehaviour) ? lb.buyingBehaviour : [];
      buying.slice(0, 3).forEach(b => {
        doc.fillColor(colors.life).font('Helvetica').fontSize(8).text('• ', col1X, col1Y, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(b), { width: colWidth - 16, height: 26 });
        col1Y += 28;
      });

      // Column 2: What They Want
      doc.fillColor(colors.yacht).font('Helvetica-Bold').fontSize(9.5).text('What They Want', col2X, gridStartY, { lineBreak: false });
      let col2Y = gridStartY + 14;
      const wants = Array.isArray(lb.wants) ? lb.wants : [];
      wants.slice(0, 3).forEach(w => {
        doc.fillColor(colors.yacht).font('Helvetica').fontSize(8).text('• ', col2X, col2Y, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(w), { width: colWidth - 16, height: 26 });
        col2Y += 28;
      });

      // Column 2: Language They Use
      col2Y += 4;
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(9.5).text('Language They Use', col2X, col2Y, { lineBreak: false });
      col2Y += 14;
      const lang = Array.isArray(lb.language) ? lb.language : [];
      lang.slice(0, 3).forEach(l => {
        doc.fillColor(colors.muted).font('Helvetica-Oblique').fontSize(8).text(`"${cleanText(l)}"`, col2X + 4, col2Y, { width: colWidth - 16, height: 26 });
        col2Y += 28;
      });

      // Next Steps Card at the bottom of Page 1
      const actionY = 720;
      doc.roundedRect(margin, actionY, contentWidth, 80, 4)
        .fillAndStroke(colors.bgSoft, colors.line);
      doc.fillColor(colors.life).font('Helvetica-Bold').fontSize(9).text('Recommended Next Steps (Lifeboat Action Plan)', margin + 10, actionY + 8, { lineBreak: false });
      const steps = Array.isArray(lb.nextSteps) ? lb.nextSteps : [];
      let stepLineY = actionY + 22;
      steps.slice(0, 3).forEach((st, idx) => {
        doc.fillColor(colors.life).font('Helvetica-Bold').fontSize(8).text(`${idx + 1}. `, margin + 12, stepLineY, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(st), { width: contentWidth - 36, height: 16 });
        stepLineY += 18;
      });

      drawPageFooter(1);

      // -------------------------------------------------------------
      // PAGE 2: YACHT AVATAR (TAKE ME FURTHER)
      // -------------------------------------------------------------
      doc.addPage();
      const yc = data.yacht || {};
      drawPageHeader(
        'Yacht Customer Avatar',
        'Situation: Growing, Doing Well, High Ambition, Seeks Status & Scale',
        2,
        colors.yacht,
        colors.yachtSoft
      );

      // Hero Box
      let curY2 = 68;
      doc.roundedRect(margin, curY2, contentWidth, 54, 5)
        .fillAndStroke('#ffffff', colors.line);

      doc.fillColor(colors.yacht)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(`YACHT ARCHETYPE: ${cleanText(yc.animal || 'FALCON').toUpperCase()}`, margin + 12, curY2 + 8, { lineBreak: false });

      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text(cleanText(yc.characterName || 'Visionary Victor the Soaring Falcon'), margin + 12, curY2 + 20, { width: contentWidth - 24, lineBreak: false });

      doc.fillColor(colors.muted)
        .font('Helvetica-Oblique')
        .fontSize(9)
        .text(cleanText(yc.tagline || 'Scanning the entire horizon from 10,000 feet, ready for the next peak.'), margin + 12, curY2 + 38, { width: contentWidth - 24, lineBreak: false });

      curY2 += 60;

      // Why this animal box
      doc.roundedRect(margin, curY2, contentWidth, 34, 4)
        .fillAndStroke(colors.bgSoft, colors.line);
      doc.fillColor(colors.yacht)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text(`Why a ${cleanText(yc.animal || 'Falcon')}?`, margin + 10, curY2 + 6, { lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8.5)
        .text(cleanText(yc.whyAnimal || 'Falcons fly high above the noise, spotting strategic opportunities early.'), margin + 10, curY2 + 18, { width: contentWidth - 20, lineBreak: false });

      curY2 += 40;

      // Current State vs Desired State
      doc.roundedRect(margin, curY2, halfBoxWidth, 54, 4)
        .fillAndStroke('#f8fafc', colors.line);
      doc.fillColor(colors.muted)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('CURRENT SUCCESS BASELINE', margin + 10, curY2 + 6, { lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(cleanText(yc.currentState || 'Events are successful, but they want an industry benchmark.'), margin + 10, curY2 + 18, { width: halfBoxWidth - 20, height: 32 });

      doc.roundedRect(margin + halfBoxWidth + 10, curY2, halfBoxWidth, 54, 4)
        .fillAndStroke('#f6fbfb', colors.yacht);
      doc.fillColor(colors.yacht)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('DESIRED ASPIRATIONAL PEAK', margin + halfBoxWidth + 20, curY2 + 6, { lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(cleanText(yc.desiredState || 'A flagship annual brand property that sets the gold standard.'), margin + halfBoxWidth + 20, curY2 + 18, { width: halfBoxWidth - 20, height: 32 });

      curY2 += 60;

      // Stage of Business / Life
      doc.roundedRect(margin, curY2, contentWidth, 26, 4)
        .fillAndStroke(colors.bgSoft, colors.line);
      doc.fillColor(colors.navy)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text('STAGE OF BUSINESS / LIFE: ', margin + 10, curY2 + 8, { continued: true, lineBreak: false });
      doc.fillColor(colors.ink)
        .font('Helvetica')
        .fontSize(8)
        .text(cleanText(yc.stage || 'Established enterprise leader aiming for brand dominance.'), { width: contentWidth - 140, lineBreak: false });

      curY2 += 34;

      // 2-Column Grid
      const gridStartY2 = curY2;

      // Column 1: Top 3 Ambition Drivers
      doc.fillColor(colors.yacht).font('Helvetica-Bold').fontSize(9.5).text('Top 3 Ambition Drivers & Needs', col1X, gridStartY2, { lineBreak: false });
      let col1Y2 = gridStartY2 + 14;
      const yachtPains = Array.isArray(yc.painPoints) ? yc.painPoints : [];
      yachtPains.slice(0, 3).forEach((p, idx) => {
        doc.fillColor(colors.yacht).font('Helvetica-Bold').fontSize(8).text(`${idx + 1}. `, col1X, col1Y2, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(p), { width: colWidth - 16, height: 26 });
        col1Y2 += 28;
      });

      // Column 1: Buying Behaviour
      col1Y2 += 4;
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(9.5).text('Buying Behaviour', col1X, col1Y2, { lineBreak: false });
      col1Y2 += 14;
      const yachtBuying = Array.isArray(yc.buyingBehaviour) ? yc.buyingBehaviour : [];
      yachtBuying.slice(0, 3).forEach(b => {
        doc.fillColor(colors.yacht).font('Helvetica').fontSize(8).text('• ', col1X, col1Y2, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(b), { width: colWidth - 16, height: 26 });
        col1Y2 += 28;
      });

      // Column 2: What They Want
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(9.5).text('What They Want', col2X, gridStartY2, { lineBreak: false });
      let col2Y2 = gridStartY2 + 14;
      const yachtWants = Array.isArray(yc.wants) ? yc.wants : [];
      yachtWants.slice(0, 3).forEach(w => {
        doc.fillColor(colors.yacht).font('Helvetica').fontSize(8).text('• ', col2X, col2Y2, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(w), { width: colWidth - 16, height: 26 });
        col2Y2 += 28;
      });

      // Column 2: Language They Use
      col2Y2 += 4;
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(9.5).text('Language They Use', col2X, col2Y2, { lineBreak: false });
      col2Y2 += 14;
      const yachtLang = Array.isArray(yc.language) ? yc.language : [];
      yachtLang.slice(0, 3).forEach(l => {
        doc.fillColor(colors.muted).font('Helvetica-Oblique').fontSize(8).text(`"${cleanText(l)}"`, col2X + 4, col2Y2, { width: colWidth - 16, height: 26 });
        col2Y2 += 28;
      });

      // Next Steps Card at the bottom of Page 2
      doc.roundedRect(margin, actionY, contentWidth, 80, 4)
        .fillAndStroke(colors.bgSoft, colors.line);
      doc.fillColor(colors.yacht).font('Helvetica-Bold').fontSize(9).text('Recommended Next Steps (Yacht Growth Plan)', margin + 10, actionY + 8, { lineBreak: false });
      const yachtSteps = Array.isArray(yc.nextSteps) ? yc.nextSteps : [];
      let stepLineY2 = actionY + 22;
      yachtSteps.slice(0, 3).forEach((st, idx) => {
        doc.fillColor(colors.yacht).font('Helvetica-Bold').fontSize(8).text(`${idx + 1}. `, margin + 12, stepLineY2, { continued: true, lineBreak: false });
        doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(st), { width: contentWidth - 36, height: 16 });
        stepLineY2 += 18;
      });

      drawPageFooter(2);

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

      // Headline Card
      let curY3 = 68;
      doc.roundedRect(margin, curY3, contentWidth, 48, 5)
        .fillAndStroke('#ffffff', colors.line);
      doc.fillColor(colors.muted).font('Helvetica').fontSize(8).text('STRATEGIC HEADLINE', margin + 12, curY3 + 7, { lineBreak: false });
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(13.5).text(cleanText(br.headline || 'From Panic Room to Penthouse: Two Offers, One Trusted Partner'), margin + 12, curY3 + 20, { width: contentWidth - 24, height: 24 });

      curY3 += 56;

      // Two Offer Lanes (Side by side)
      doc.roundedRect(margin, curY3, halfBoxWidth, 126, 5)
        .fillAndStroke('#fffaf8', colors.life);
      doc.fillColor(colors.life).font('Helvetica-Bold').fontSize(10.5).text('LIFEBOAT OFFER (RESCUE)', margin + 10, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted).font('Helvetica-Oblique').fontSize(8).text('Fixed-scope emergency sprint', margin + 10, curY3 + 24, { lineBreak: false });
      doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(br.lifeboatOffer || 'Rapid response rescue package with clear pricing, fixed 48-hour turnarounds, and direct daily leadership updates.'), margin + 10, curY3 + 38, { width: halfBoxWidth - 20, height: 80 });

      doc.roundedRect(margin + halfBoxWidth + 10, curY3, halfBoxWidth, 126, 5)
        .fillAndStroke('#f6fbfb', colors.yacht);
      doc.fillColor(colors.yacht).font('Helvetica-Bold').fontSize(10.5).text('YACHT OFFER (TRANSFORMATION)', margin + halfBoxWidth + 20, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted).font('Helvetica-Oblique').fontSize(8).text('Strategic annual retainer partner', margin + halfBoxWidth + 20, curY3 + 24, { lineBreak: false });
      doc.fillColor(colors.ink).font('Helvetica').fontSize(8).text(cleanText(br.yachtOffer || 'Comprehensive annual brand experience architecture, dedicated concept lab, and multi-event strategic alignment.'), margin + halfBoxWidth + 20, curY3 + 38, { width: halfBoxWidth - 20, height: 80 });

      curY3 += 136;

      // The Transformation Journey (Ladder)
      doc.roundedRect(margin, curY3, contentWidth, 230, 5)
        .fillAndStroke(colors.bgSoft, colors.line);

      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(11.5).text('The Lifeboat -> Yacht Journey Ladder', margin + 12, curY3 + 10, { lineBreak: false });
      doc.fillColor(colors.muted).font('Helvetica').fontSize(8.5).text('How rescue clients naturally transition into long-term strategic relationships:', margin + 12, curY3 + 24, { lineBreak: false });

      let stepY = curY3 + 42;
      const journey = Array.isArray(br.journey) ? br.journey : [
        { tag: 'Rescue', text: 'You resolve an urgent high-stakes problem that other vendors dropped.' },
        { tag: 'Debrief', text: 'You present a root-cause breakdown of why the panic occurred and how to avoid it.' },
        { tag: 'Bridge', text: 'You architect a proactive roadmap for the remainder of their fiscal year.' },
        { tag: 'Retainer', text: 'The client signs an annual strategic retainer to guarantee peace of mind.' }
      ];

      journey.slice(0, 4).forEach((step, idx) => {
        const badgeColor = idx === 0 ? colors.life : idx === journey.length - 1 ? colors.yacht : colors.navy;
        doc.roundedRect(margin + 12, stepY, 66, 20, 3)
          .fillAndStroke(badgeColor, badgeColor);

        const rawTag = typeof step === 'string'
          ? (step.split(/[:\-–]/)[0] || `STEP ${idx + 1}`)
          : (step.tag || `STEP ${idx + 1}`);

        const rawText = typeof step === 'string'
          ? step.replace(/^[^:\-–]+[:\-–]\s*/, '')
          : (step.text || step.desc || '');

        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8).text(cleanText(rawTag).toUpperCase(), margin + 14, stepY + 5, { width: 62, align: 'center', lineBreak: false });

        doc.fillColor(colors.ink).font('Helvetica').fontSize(8.5).text(cleanText(rawText), margin + 86, stepY + 4, { width: contentWidth - 98, height: 28 });

        stepY += 44;
      });

      // Strategic Core Message Card
      const msgY = 720;
      doc.roundedRect(margin, msgY, contentWidth, 80, 5)
        .fillAndStroke('#ffffff', colors.navy);
      doc.fillColor(colors.navy).font('Helvetica-Bold').fontSize(9.5).text('STRATEGIC SUMMARY MESSAGE', margin + 12, msgY + 10, { lineBreak: false });
      doc.fillColor(colors.ink).font('Helvetica-Oblique').fontSize(9).text(
        `"${cleanText(br.message || 'We step in when you are in trouble to earn your trust; we stay when you are thriving to fuel your ambition.')}"`,
        margin + 12,
        msgY + 26,
        { width: contentWidth - 24, height: 46 }
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
};
