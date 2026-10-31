import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));
}

const li = arr => (arr || []).map(x => `<li>${esc(x)}</li>`).join('');

function avatarHTML(a, kind) {
  const k = kind === 'lifeboat' ? 'l' : 'y';
  return `<article class="card ${k}">
    <div class="hero">
      <div class="portrait" aria-hidden="true">${esc(a.emoji || '🐾')}</div>
      <div style="min-width:0">
        <p class="kicker">${kind === 'lifeboat' ? 'Lifeboat customer' : 'Yacht customer'} · ${esc(a.animal)}</p>
        <h2 class="name">${esc(a.characterName)}</h2>
        <p class="tagline">${esc(a.tagline)}</p>
      </div>
    </div>
    <div class="why"><strong>Why a ${esc((a.animal || '').toLowerCase())}?</strong> ${esc(a.whyAnimal)}</div>
    <div class="shift">
      <div><h4>Current state</h4><p>${esc(a.currentState)}</p></div>
      <div class="arrow" aria-hidden="true">→</div>
      <div class="to"><h4>Desired state</h4><p>${esc(a.desiredState)}</p></div>
    </div>
    <div class="secs">
      <div class="sec full"><h4>Stage of business / life</h4><p class="stage">${esc(a.stage)}</p></div>
      <div class="sec"><h4>Top 3 pain points</h4><ol>${li(a.painPoints)}</ol></div>
      <div class="sec"><h4>What they want</h4><ul>${li(a.wants)}</ul></div>
      <div class="sec"><h4>Buying behaviour</h4><ul>${li(a.buyingBehaviour)}</ul></div>
      <div class="sec"><h4>Language they use</h4><div class="quotes">${(a.language || []).map(q => `<span class="q">${esc(q)}</span>`).join('')}</div></div>
      <div class="sec full"><h4>Next steps</h4><ol class="steps">${li(a.nextSteps)}</ol></div>
    </div>
  </article>`;
}

function bridgeHTML(b) {
  return `<article class="card"><div class="bridge">
    <div><p class="kicker" style="color:var(--muted)">How you help both</p><h3>${esc(b.headline)}</h3></div>
    <div class="lanes">
      <div class="lane l"><h4>Lifeboat offer</h4><p>${esc(b.lifeboatOffer)}</p></div>
      <div class="lane y"><h4>Yacht offer</h4><p>${esc(b.yachtOffer)}</p></div>
    </div>
    <div><h4 class="kicker" style="color:var(--muted);margin-bottom:10px">Lifeboat → Yacht journey</h4>
      <ol class="ladder">${(b.journey || []).map(j => `<li><span class="tag">${esc(j.tag)}</span><span>${esc(j.text)}</span></li>`).join('')}</ol></div>
    <p class="tagline" style="font-size:16px">${esc(b.message)}</p>
  </div></article>`;
}

export async function buildPdfDocument(data) {
  if (!data || !data.lifeboat || !data.yacht || !data.bridge) {
    throw new Error('Avatar data is incomplete');
  }

  const sheet = document.createElement('div');
  sheet.className = 'pdfsheet';
  document.body.append(sheet);

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pages = [
      ['lifeboat', 'Lifeboat avatar'],
      ['yacht', 'Yacht avatar'],
      ['bridge', 'How you help both']
    ];

    for (let i = 0; i < pages.length; i++) {
      const [k, label] = pages[i];
      sheet.innerHTML = `<div class="pdfhead"><b>Customer Avatar</b><span>${label} · ${i + 1} / 3</span></div>` +
        (k === 'bridge' ? bridgeHTML(data.bridge) : avatarHTML(data[k], k));

      const canvas = await html2canvas(sheet, {
        scale: 2,
        backgroundColor: '#eef2f6',
        logging: false,
        useCORS: true
      });

      if (i > 0) pdf.addPage();
      pdf.setFillColor(238, 242, 246);
      pdf.rect(0, 0, 210, 297, 'F');
      
      let w = 194;
      let h = (canvas.height * w) / canvas.width;
      if (h > 281) {
        h = 281;
        w = (canvas.width * h) / canvas.height;
      }
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', (210 - w) / 2, 8, w, h);
    }

    const name = ((data.lifeboat?.characterName || 'avatar') + '').split(' ')[1] || 'avatar';
    const filename = `customer-avatars-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    return { pdf, filename };
  } finally {
    sheet.remove();
  }
}

export async function exportToPdf(data) {
  const { pdf, filename } = await buildPdfDocument(data);
  pdf.save(filename);
  return filename;
}

export async function generatePdfBase64(data) {
  const { pdf, filename } = await buildPdfDocument(data);
  const rawUri = pdf.output('datauristring');
  const cleanBase64 = rawUri.includes('base64,') ? rawUri.split('base64,')[1] : rawUri;
  return {
    dataUri: `data:application/pdf;base64,${cleanBase64}`,
    rawBase64: cleanBase64,
    filename
  };
}

