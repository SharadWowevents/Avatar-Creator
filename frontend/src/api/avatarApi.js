const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('cac-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Healthcheck failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      mongoConnected: false,
      aiConfigured: false,
      aiModel: 'GPT-6 Luna',
      error: err.message
    };
  }
}

export async function generateAvatarApi(inputs) {
  try {
    const res = await fetch(`${API_BASE}/avatars/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inputs),
      signal: AbortSignal.timeout(25000),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Generation failed');
    }
    const output = data.data;
    if (output && typeof output === 'object') {
      output._emailSent = Boolean(data.email?.success);
    }
    return output;
  } catch (err) {
    console.warn('API generate failed or backend offline. Falling back to dynamic persona engine:', err);

    // Check offline input cache so identical inputs return the identical fallback
    const offlineFingerprint = 'cac-cached-' + Object.values(inputs).map(s => (s || '').trim()).join('|||');
    try {
      const cached = localStorage.getItem(offlineFingerprint);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    // Heuristic client fallback derived dynamically from user inputs using multi-archetype variety
    const brandName = (inputs.intro.match(/^([A-Z0-9a-z\s]+?)(?:\s+(?:is|provides|helps|offers|creates)|\b)/i) || [])[1] || 'Your business';
    const icpShort = (inputs.icp || '').split('\n')[0].slice(0, 70).trim() || 'decision makers and leaders';

    function hashStr(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    }

    const seed = hashStr(`${inputs.intro}||${inputs.icp}||${inputs.life}||${inputs.yacht}`);

    const LB_POOL = [
      { animal: "Meerkat", emoji: "🐾", adj: "Hyper-Vigilant", name: "Mansi", why: "A meerkat scans 360 degrees for danger, on extreme alert with zero room for error.", tagline: "Perched on high alert, eyes darting at every incoming message, expecting disaster at any moment." },
      { animal: "Beaver", emoji: "🦫", adj: "Battling", name: "Bhavna", why: "A beaver furiously shoves mud into a breaking dam while floodwaters rise.", tagline: "Exhausted from holding back the flood with bare hands, fighting to keep operations afloat." },
      { animal: "Octopus", emoji: "🐙", adj: "Overwhelmed", name: "Omkar", why: "An octopus flails eight tentacles trying to juggle eight slipping crises at once.", tagline: "Juggling eight urgent deliverables simultaneously, dropping balls because nobody can do eight jobs alone." },
      { animal: "Hedgehog", emoji: "🦔", adj: "Hedging", name: "Harsh", why: "A hedgehog curls into a spiky defensive ball to avoid leadership blame after vendors fail.", tagline: "Curled defensively against executive fallout, terrified that one more mistake will damage their career." },
      { animal: "Chameleon", emoji: "🦎", adj: "Compromised", name: "Charu", why: "A chameleon rapidly shifts colors to placate demanding bosses and unresponsive vendors.", tagline: "Constantly shifting promises to keep leadership calm while delivery stalls behind the scenes." },
      { animal: "Mule", emoji: "🫏", adj: "Overburdened", name: "Mohit", why: "A mule strains under double its rated pack-weight uphill with zero backup.", tagline: "Carrying the entire project stakes uphill alone, on the brink of total exhaustion." },
      { animal: "Squirrel", emoji: "🐿️", adj: "Scrambling", name: "Sameer", why: "A squirrel darts frantically through a storm, racing against an unyielding clock.", tagline: "Racing against time with scattered vendor resources, desperate for someone to restore order." }
    ];

    const YC_POOL = [
      { animal: "Orca", emoji: "🐋", adj: "Apex", name: "Aditi", why: "An orca leads a synchronized pod across vast oceans to dominate the entire ecosystem.", tagline: "Navigating deep waters with elite precision, orchestrating a presence that commands market respect." },
      { animal: "Cheetah", emoji: "🐆", adj: "Swift", name: "Chetan", why: "A cheetah coils its muscles, ready to accelerate from stable baseline to market velocity.", tagline: "Poised to accelerate into undisputed category velocity, turning every milestone into PR momentum." },
      { animal: "Peacock", emoji: "🦚", adj: "Prestigious", name: "Pooja", why: "A peacock unfurls iridescent plumage that demands awe and sets the category benchmark.", tagline: "Demanding a showcase so breathtaking that competitors fade and clients talk for years." },
      { animal: "Wolf", emoji: "🐺", adj: "Visionary", name: "Vikram", why: "A visionary wolf surveys the ridge, reading the terrain miles ahead to guide the pack to fertile ground.", tagline: "Scanning the 3-year horizon, building an iconic annual property that attracts top-tier clients." },
      { animal: "Owl", emoji: "🦉", adj: "Far-Sighted", name: "Ojas", why: "An owl operates above the tactical noise with silent 360-degree clarity and strategic wisdom.", tagline: "Operating above tactical chaos with deep strategic insight, creating lasting business equity." },
      { animal: "Dolphin", emoji: "🐬", adj: "Dynamic", name: "Dev", why: "A dolphin brings electric energy, intelligence, and human warmth to every swell.", tagline: "Infusing human warmth, creative energy, and memorable storytelling into every milestone." },
      { animal: "Falcon", emoji: "🦅", adj: "Soaring", name: "Farhan", why: "A falcon climbs to 10,000 feet and seizes the biggest market opportunities with surgical precision.", tagline: "Dominating the market airspace with sharp creative vision and zero tolerance for mediocrity." }
    ];

    const lbItem = LB_POOL[seed % LB_POOL.length];
    const ycItem = YC_POOL[(Math.floor(seed / 5) + 2) % YC_POOL.length];

    const lifeSplit = (inputs.life || '').split('\n').map(s => s.replace(/^[\d\-.*•]+\s*/, '').trim()).filter(Boolean);
    const yachtSplit = (inputs.yacht || '').split('\n').map(s => s.replace(/^[\d\-.*•]+\s*/, '').trim()).filter(Boolean);

    const fallbackOutput = {
      lifeboat: {
        characterName: `${lbItem.adj} ${lbItem.name} the ${lbItem.animal}`,
        animal: lbItem.animal,
        emoji: lbItem.emoji,
        tagline: lbItem.tagline,
        whyAnimal: lbItem.why,
        currentState: `Facing an urgent operational crisis: '${lifeSplit[0] || inputs.life.slice(0, 80) || 'tight delivery deadlines'}'.`,
        desiredState: `Having an expert rescue squad step in so '${lifeSplit[1] || 'all operational friction'}' is smoothly handled.`,
        stage: `Key stakeholder at ${icpShort}`,
        painPoints: [
          lifeSplit[0] || "Urgent deadline with failing execution",
          lifeSplit[1] || "High stakes and accountability to leadership",
          lifeSplit[2] || "Zero tolerance for unexpected surprises"
        ],
        wants: [
          "Rapid emergency triage within 24 hours",
          "Guaranteed fixed-scope turnaround agreement",
          "Complete peace of mind and leadership acclaim"
        ],
        buyingBehaviour: [
          "Decides within 48 hours when confidence and rapid responsiveness are established",
          "Prioritizes immediate operational relief over lengthy agency decks",
          "Requires transparent fixed pricing with zero hidden fees"
        ],
        language: [
          "\"Can this be fixed right away before leadership finds out?\"",
          "\"Just tell me you have an emergency team ready and give me the all-in price.\"",
          "\"We don't have time to start from scratch; we need someone to take over now.\"",
          "\"Give me the timeline and guarantee that we won't have surprises.\""
        ],
        nextSteps: [
          `Schedule a 20-minute rapid triage session with ${brandName}`,
          "Deliver a 48-hour fixed-scope turnaround proposal with SLA guarantee",
          "Deploy immediate rescue execution team"
        ]
      },
      yacht: {
        characterName: `${ycItem.adj} ${ycItem.name} the ${ycItem.animal}`,
        animal: ycItem.animal,
        emoji: ycItem.emoji,
        tagline: ycItem.tagline,
        whyAnimal: ycItem.why,
        currentState: `Stable baseline operations, but wants to achieve category dominance: '${yachtSplit[0] || inputs.yacht.slice(0, 80) || 'industry recognition'}'.`,
        desiredState: "Setting industry benchmarks, winning executive acclaim, and enjoying seamless partner alignment.",
        stage: `Visionary executive leading ${icpShort}`,
        painPoints: [
          yachtSplit[0] || "Current solutions feel generic and predictable",
          yachtSplit[1] || "Fragmented vendors consuming executive attention",
          yachtSplit[2] || "Need to prove measurable ROI and brand differentiation"
        ],
        wants: [
          "A signature experience that sets a new industry standard",
          "A single trusted strategic partner across the entire annual calendar",
          "Measurable, lasting business impact and executive PR buzz"
        ],
        buyingBehaviour: [
          "Takes 4–8 weeks with cross-functional leadership buy-in",
          "Values portfolio caliber, creative vision, and strategic chemistry over lowest cost",
          "Invests in annual partnership retainers"
        ],
        language: [
          "\"We want our next flagship milestone to set a new benchmark in our space.\"",
          "\"How do we turn ordinary execution into an iconic category property?\"",
          "\"We don't need another generic vendor; we need a true strategic partner.\"",
          "\"What is the boldest, most differentiated concept you have for us?\""
        ],
        nextSteps: [
          `Host an executive vision alignment session with ${brandName}`,
          "Present a multi-stage strategic roadmap with clear milestones",
          "Initiate an annual partnership retainer agreement"
        ]
      },
      bridge: {
        headline: `From Urgent Rescue to Strategic Elevation with ${brandName}`,
        lifeboatOffer: "Rapid Rescue Sprint: Immediate fixed-scope triage and guaranteed delivery for critical deadlines.",
        yachtOffer: "Strategic Flagship Retainer: An annual partnership providing continuous concept innovation and executive production.",
        journey: [
          { tag: "Entry", text: "Client enters with an urgent rescue problem requiring immediate stabilization." },
          { tag: "Proof", text: "Flawless execution under fire earns complete executive trust." },
          { tag: "Upgrade", text: "A post-project review reveals strategic opportunities for the year ahead." },
          { tag: "Retainer", text: "The relationship upgrades to an annual strategic retainer driving category dominance." }
        ],
        message: `${brandName} meets you where you are — rescuing you in the storm and navigating you to the horizon.`
      }
    };

    // Auto-save fallback in local storage
    try {
      const local = JSON.parse(localStorage.getItem('cac-saved-list') || '[]');
      const defaultTitle = `${fallbackOutput.lifeboat.characterName.split(' ')[1]} & ${fallbackOutput.yacht.characterName.split(' ')[1]}`;
      local.unshift({
        _id: 'local-' + Date.now(),
        title: defaultTitle,
        inputs,
        output: fallbackOutput,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('cac-saved-list', JSON.stringify(local));
      localStorage.setItem(offlineFingerprint, JSON.stringify(fallbackOutput));
    } catch {}

    return fallbackOutput;
  }
}

export async function fetchSavedAvatars() {
  try {
    const res = await fetch(`${API_BASE}/avatars`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch saved avatars');
    }
    return data;
  } catch (err) {
    try {
      const local = JSON.parse(localStorage.getItem('cac-saved-list') || '[]');
      return { success: true, source: 'local_storage', data: local };
    } catch {
      return { success: true, source: 'none', data: [] };
    }
  }
}

export async function saveAvatarApi({ title, inputs, output }) {
  try {
    const res = await fetch(`${API_BASE}/avatars`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, inputs, output }),
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save avatar');
    }
    return data.data;
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('cac-saved-list') || '[]');
    const newRecord = {
      _id: 'local-' + Date.now(),
      title: title || `${output.lifeboat?.characterName?.split(' ')[1] || 'Lifeboat'} & ${output.yacht?.characterName?.split(' ')[1] || 'Yacht'}`,
      inputs,
      output,
      createdAt: new Date().toISOString()
    };
    local.unshift(newRecord);
    localStorage.setItem('cac-saved-list', JSON.stringify(local));
    return newRecord;
  }
}

export async function deleteAvatarApi(id) {
  try {
    if (!id.startsWith('local-')) {
      await fetch(`${API_BASE}/avatars/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
    }
    const local = JSON.parse(localStorage.getItem('cac-saved-list') || '[]');
    const filtered = local.filter(item => item._id !== id);
    localStorage.setItem('cac-saved-list', JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Delete failed:', err);
    throw err;
  }
}

export async function sendAvatarEmailApi({ output, pdfBase64, pdfFilename, toEmail, recipientName, avatarId }) {
  try {
    const res = await fetch(`${API_BASE}/avatars/send-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ output, pdfBase64, pdfFilename, toEmail, recipientName, avatarId }),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send email');
    }
    return data;
  } catch (err) {
    console.warn('sendAvatarEmailApi failed:', err);
    throw err;
  }
}

export async function downloadAvatarPdfApi({ output }) {
  try {
    const res = await fetch(`${API_BASE}/avatars/download-pdf`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ output }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = ((output?.lifeboat?.characterName || 'avatar') + '').split(' ')[1] || 'avatar';
    a.download = `customer-avatars-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('Server downloadPdf failed, falling back to client jsPDF:', err);
    throw err;
  }
}
