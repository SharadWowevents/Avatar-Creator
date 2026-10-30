import { EX_OUT } from '../data/defaultData';

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
    return data.data;
  } catch (err) {
    console.warn('API generate failed or backend offline. Falling back to local persona engine:', err);
    
    // If input is WOW Events or matches keywords
    const text = `${inputs.intro || ''} ${inputs.icp || ''}`.toLowerCase();
    if (text.includes('wow') || text.includes('event')) {
      return EX_OUT;
    }

    // Heuristic client fallback
    const brandName = (inputs.intro.match(/^([A-Z0-9a-z\s]+?)(?:\s+(?:is|provides|helps|offers|creates)|\b)/i) || [])[1] || 'Your business';
    return {
      lifeboat: {
        characterName: "Rescue Rachel the Restless Rabbit",
        animal: "Rabbit",
        emoji: "🐇",
        tagline: "Ears pinned back, eyes darting, needing an immediate rescue team.",
        whyAnimal: "A rabbit in panic seeks immediate safety and shelter before taking another breath.",
        currentState: `Facing an urgent operational crisis around '${inputs.life.slice(0, 80) || 'tight deadlines'}'.`,
        desiredState: "Having an expert step in and resolve the chaos so normal operations resume.",
        stage: `Key stakeholder at ${inputs.icp.slice(0, 60) || 'a growing enterprise'}`,
        painPoints: [
          inputs.life.split('\n')[0] || "Urgent deadline with failing execution",
          "High stakes and accountability to leadership",
          "Zero tolerance for unexpected surprises"
        ],
        wants: [
          "Rapid response within hours",
          "Guaranteed turnaround timeline",
          "Total peace of mind"
        ],
        buyingBehaviour: [
          "Decides within 48 hours when confidence is established",
          "Prioritizes immediate availability over long decks",
          "Requires transparent fixed pricing"
        ],
        language: [
          "\"Can this be fixed right away?\"",
          "\"Just tell me you've got this handled.\"",
          "\"Give me the timeline and all-in price.\""
        ],
        nextSteps: [
          `Schedule a 20-minute rapid triage session with ${brandName}`,
          "Deliver a 48-hour fixed-scope turnaround proposal",
          "Deploy immediate rescue execution team"
        ]
      },
      yacht: {
        characterName: "Visionary Victor the Soaring Falcon",
        animal: "Falcon",
        emoji: "🦅",
        tagline: "Scanning the entire horizon from 10,000 feet, ready for the next peak.",
        whyAnimal: "Falcons fly above the noise and spot transformational opportunities from distance.",
        currentState: `Stable operations, but wants to achieve category dominance: '${inputs.yacht.slice(0, 80)}'.`,
        desiredState: "Setting industry benchmarks and enjoying seamless partner alignment.",
        stage: "Senior leadership building long-term category legacy",
        painPoints: [
          inputs.yacht.split('\n')[0] || "Current solutions feel generic and predictable",
          "Fragmented vendors consuming executive attention",
          "Need to prove measurable ROI to the board"
        ],
        wants: [
          "A signature experience that sets industry standards",
          "A single strategic partner across the entire year",
          "Measurable, lasting business impact"
        ],
        buyingBehaviour: [
          "Takes 4–8 weeks with cross-functional leadership buy-in",
          "Values portfolio caliber and strategic vision over lowest cost",
          "Invests in annual partnership retainers"
        ],
        language: [
          "\"How do we redefine this space?\"",
          "\"What's the big idea?\"",
          "\"Let's think of this as an annual partnership.\""
        ],
        nextSteps: [
          "Host an executive vision alignment session",
          "Present a multi-stage strategic roadmap",
          "Initiate an annual partnership retainer agreement"
        ]
      },
      bridge: {
        headline: `Rescue the Lifeboat today, navigate the Yacht tomorrow with ${brandName}`,
        lifeboatOffer: "Rapid Rescue: immediate triage and guaranteed delivery for urgent deadlines.",
        yachtOffer: "Annual Retainer: ongoing strategic partnership driving benchmark performance.",
        journey: [
          { tag: "Entry", text: "Client enters with an urgent rescue problem requiring immediate stabilization." },
          { tag: "Proof", text: "Flawless execution under pressure earns complete executive trust." },
          { tag: "Upgrade", text: "A post-project review reveals strategic opportunities for the year ahead." },
          { tag: "Retainer", text: "The relationship upgrades to an annual strategic retainer." }
        ],
        message: `${brandName} gets you from the emergency lifeboat to the luxury yacht.`
      }
    };
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
