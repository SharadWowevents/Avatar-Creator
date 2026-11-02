const OpenAI = require('openai');

const JSON_PROMPT_SHAPE = `{
  "lifeboat": {
    "characterName": "Creative alliterative human first name + the + vivid adjective + evocative animal (e.g. Battling Bhavna the Beaver, Hyper-Vigilant Harshit the Meerkat, Overwhelmed Oliver the Octopus)",
    "animal": "string (original animal matching their crisis psychology)",
    "emoji": "one standard Unicode emoji matching that exact animal",
    "tagline": "one emotionally resonant, vivid sentence capturing their state of panic/urgency",
    "whyAnimal": "1-2 sentences explaining why this animal metaphor mirrors their exact behavioral posture",
    "currentState": "1-2 concrete, high-stakes sentences detailing their current crisis scene",
    "desiredState": "1-2 vivid sentences describing the relief, safety, and triumph they want to feel",
    "stage": "specific job role, company size, and pressure environment in 1 sentence",
    "painPoints": ["3 highly specific, concrete operational pain points"],
    "wants": ["3 exact relief outcomes they urgently demand"],
    "buyingBehaviour": ["3 realistic buying criteria: turnaround time, pricing model, authority, decision speed"],
    "language": ["4 raw, authentic quotes they would actually say behind closed doors, in quotes"],
    "nextSteps": ["3 immediate, tactical actions the business should take to rescue and close this customer"]
  },
  "yacht": {
    "characterName": "Creative alliterative human first name + the + aspirational adjective + majestic animal (e.g. Apex Aditi the Orca, Swift Chetan the Cheetah, Prestigious Pooja the Peacock, Visionary Vikram the Wolf)",
    "animal": "string (distinct animal representing category altitude and mastery)",
    "emoji": "one standard Unicode emoji matching that exact animal",
    "tagline": "one inspiring, elevated sentence capturing their hunger for market dominance and prestige",
    "whyAnimal": "1-2 sentences explaining why this animal metaphor mirrors their strategic ambition",
    "currentState": "1-2 concrete sentences on their solid baseline and hunger to elevate above the competition",
    "desiredState": "1-2 vivid sentences describing setting industry benchmarks, winning acclaim, and driving enterprise ROI",
    "stage": "executive leadership role, growth trajectory, and market ambition in 1 sentence",
    "painPoints": ["3 strategic barriers, differentiation challenges, or scaling bottlenecks"],
    "wants": ["3 transformational outcomes that set a new benchmark in their sector"],
    "buyingBehaviour": ["3 strategic evaluation habits: retainer models, executive alignment, creative chemistry"],
    "language": ["4 bold, ambitious quotes they would say to a trusted strategic partner, in quotes"],
    "nextSteps": ["3 strategic partnership moves the business should propose to win this high-value client"]
  },
  "bridge": {
    "headline": "A bold, compelling strategic headline bridging both personas",
    "lifeboatOffer": "Concrete, fixed-scope, rapid-turnaround emergency rescue package",
    "yachtOffer": "Comprehensive annual strategic partnership retainer with continuous innovation",
    "journey": [
      {"tag": "Entry", "text": "Specific crisis entry point where the client is rescued with speed"},
      {"tag": "Proof", "text": "How flawless execution under fire builds unshakable executive trust"},
      {"tag": "Upgrade", "text": "How the debrief reveals larger strategic gaps and opportunities"},
      {"tag": "Retainer", "text": "How the client smoothly transitions into an annual flagship retainer"}
    ],
    "message": "A memorable, punchy one-sentence brand promise connecting rescue to transformation"
  }
}`;

// Diverse pool of 10 distinct Lifeboat archetypes
const LIFEBOAT_ARCHETYPES = [
  {
    animal: "Meerkat",
    emoji: "🐾",
    adjective: "Hyper-Vigilant",
    names: ["Mansi", "Marcus", "Maya", "Manav"],
    why: "A meerkat perches on edge, scanning 360 degrees for incoming predators, ears twitching at every sudden movement.",
    tagline: "Perched on high alert, eyes darting at every incoming notification, expecting disaster at any moment.",
    behavior: ["Decides within 24–48 hours once transparent pricing and rapid availability are proven", "Requires high-frequency status check-ins and single-point-of-contact accountability", "Prioritizes immediate triage over lengthy capability decks"]
  },
  {
    animal: "Beaver",
    emoji: "🦫",
    adjective: "Battling",
    names: ["Bhavna", "Benjamin", "Bikram", "Bela"],
    why: "A beaver furiously shoves mud and sticks into a breaking dam while the floodwaters rise up to its chest.",
    tagline: "Exhausted from holding back the flood with bare hands, fighting desperately to keep operations from collapsing.",
    behavior: ["Demands fixed milestones and ironclad deliverable guarantees with zero change-order surprises", "Looks for battle-tested operators who immediately take the heavy lifting off their shoulders", "Authorizes emergency budgets when a concrete 48-hour rescue plan is presented"]
  },
  {
    animal: "Octopus",
    emoji: "🐙",
    adjective: "Overwhelmed",
    names: ["Omkar", "Olivia", "Onkar", "Oliver"],
    why: "An octopus furiously flails eight tentacles trying to grab slipping tools, put out fires, and plug eight leaks at once.",
    tagline: "Juggling eight critical crises simultaneously, dropping essential balls because nobody can do eight jobs alone.",
    behavior: ["Values total delegation: wants a trusted partner to take complete end-to-end ownership", "Needs simplified executive summaries they can immediately forward to leadership", "Ready to sign rapidly to reclaim sanity and focus on core responsibilities"]
  },
  {
    animal: "Hedgehog",
    emoji: "🦔",
    adjective: "Hedging",
    names: ["Harsh", "Hannah", "Hemant", "Hazel"],
    why: "A hedgehog curls into a tight spiky ball to protect itself from leadership blame when previous vendors fail.",
    tagline: "Curled defensively against leadership fallout, terrified that one more vendor mistake will ruin their career.",
    behavior: ["Extremely risk-averse; requires verifiable case studies and ironclad SLAs before signing", "Needs leadership-safe proposals that justify vendor selection with documented safeguards", "Decides quickly once personal professional liability is completely derisked"]
  },
  {
    animal: "Chameleon",
    emoji: "🦎",
    adjective: "Compromised",
    names: ["Charu", "Chetan", "Chloe", "Chirag"],
    why: "A chameleon rapidly changes shades to placate demanding bosses and unresponsive vendors, losing its identity in the chaos.",
    tagline: "Constantly shifting promises to keep leadership happy while vendors fail behind the scenes.",
    behavior: ["Prioritizes partners who provide polished stakeholder decks and talking points", "Needs immediate timeline stabilization to reset unrealistic executive expectations", "Values transparent daily progress reporting that makes them look heroic to management"]
  },
  {
    animal: "Mule",
    emoji: "🫏",
    adjective: "Overburdened",
    names: ["Mohit", "Megan", "Mukund", "Meera"],
    why: "A mule strains under double its rated pack-weight on a steep crumbling trail, legs trembling under relentless pressure.",
    tagline: "Carrying the entire company's project stakes uphill with zero support, on the brink of complete exhaustion.",
    behavior: ["Seeks an immediate deployment squad that integrates with zero training overhead", "Values honest upfront feasibility advice over yes-men vendor promises", "Decides rapidly when given a fixed-scope, all-inclusive rescue proposal"]
  },
  {
    animal: "Hermit Crab",
    emoji: "🐚",
    adjective: "Hollow",
    names: ["Harshit", "Helena", "Hamza", "Hema"],
    why: "A hermit crab has outgrown its old shell and is caught exposed on open sand with waves crashing down.",
    tagline: "Exposed and vulnerable after outgrowing past vendors, desperate for a protective partner before the tide hits.",
    behavior: ["Recognizes past systems are broken; seeks modern, scalable execution capability", "Wants rapid turnaround proofs before committing to larger long-term restructuring", "Prioritizes high responsiveness and direct cell-phone access to project directors"]
  },
  {
    animal: "Squirrel",
    emoji: "🐿️",
    adjective: "Scrambling",
    names: ["Sameer", "Sophia", "Siddharth", "Simran"],
    why: "A squirrel darts erratically through a winter gale, burying and unburying acorns with freezing paws.",
    tagline: "Racing against an unyielding clock with scattered resources, desperate for someone to restore order.",
    behavior: ["Decides within 24 to 48 hours once trust and transparent pricing are demonstrated", "Prioritizes speed, availability, and low frictional overhead over extensive decks", "Seeks immediate proof of concept or high-confidence references"]
  },
  {
    animal: "Bee",
    emoji: "🐝",
    adjective: "Burned-Out",
    names: ["Bina", "Brandon", "Brijesh", "Brooke"],
    why: "A worker bee buzzes on depleted reserves in a heavy downpour, struggling to keep the hive's delivery timeline alive.",
    tagline: "Running on empty while the clock counts down, desperate for reinforcements before the system crashes.",
    behavior: ["Values rapid response guarantees and proactive communication", "Requires a single accountable lead to cut through internal cross-department noise", "Ready to greenlight fixed-price triage sprints without prolonged negotiations"]
  },
  {
    animal: "Badger",
    emoji: "🦡",
    adjective: "Besieged",
    names: ["Balraj", "Brittany", "Bhavesh", "Beth"],
    why: "A badger digs deep defensive trenches, growling under relentless scrutiny and impossible executive demands.",
    tagline: "Cornered by tight timelines and fierce leadership scrutiny, looking for a fearless rescue partner.",
    behavior: ["Demands straight talk, zero agency jargon, and battle-tested execution veterans", "Checks vendor track record under fire and demands client reference calls within hours", "Locks in fast agreements once absolute operational competence is confirmed"]
  }
];

// Diverse pool of 10 distinct Yacht archetypes
const YACHT_ARCHETYPES = [
  {
    animal: "Orca",
    emoji: "🐋",
    adjective: "Apex",
    names: ["Aditi", "Alexander", "Ananya", "Arjun"],
    why: "An orca leads a highly coordinated pod across vast oceans, using sophisticated strategy to dominate the entire ecosystem.",
    tagline: "Navigating deep waters with elite precision, orchestrating a world-class presence that commands category respect.",
    behavior: ["Invests in annual partnership retainers with shared KPI goals and continuous creative development", "Evaluates based on strategic depth, creative caliber, and collaborative chemistry", "Involves C-suite leadership to co-create flagship properties that drive enterprise ROI"]
  },
  {
    animal: "Cheetah",
    emoji: "🐆",
    adjective: "Swift",
    names: ["Chetan", "Claire", "Chirag", "Camilla"],
    why: "A cheetah sits atop the termite mound, muscles coiled, waiting for the perfect moment to break category speed records.",
    tagline: "Poised to accelerate from stable baseline to undisputed market velocity, turning every milestone into PR momentum.",
    behavior: ["Values creative agility, bold concepts, and high-impact differentiation over low bids or standard templates", "Moves fast when inspired by big, boundary-pushing strategic vision", "Seeks partners who can scale velocity and execute high-tempo campaigns"]
  },
  {
    animal: "Peacock",
    emoji: "🦚",
    adjective: "Prestigious",
    names: ["Pooja", "Patrick", "Pradeep", "Penelope"],
    why: "A peacock unfurls iridescent plumage that demands total awe, creating an unforgettable spectacle that sets the standard.",
    tagline: "Demanding a stage so breathtaking that competitors fade into the background and clients talk for years.",
    behavior: ["Prioritizes aesthetic perfection, VIP experience design, and multi-channel buzz", "Expects white-glove presentation and comprehensive concept renderings", "Willing to invest premium budgets for industry-defining showcase execution"]
  },
  {
    animal: "Wolf",
    emoji: "🐺",
    adjective: "Visionary",
    names: ["Vikram", "Victoria", "Varun", "Valerie"],
    why: "A visionary alpha wolf surveys the ridge under a full moon, reading the terrain miles ahead to guide the pack to fertile ground.",
    tagline: "Scanning the 3-year horizon, building an iconic annual property that rallies teams and attracts top-tier clients.",
    behavior: ["Seeks an intellectual sparring partner and strategic retainer to elevate brand presence year after year", "Focuses on pipeline attribution, enterprise audience retention, and long-term brand equity", "Values proactive innovation and quarterly trend reports from their core partner"]
  },
  {
    animal: "Owl",
    emoji: "🦉",
    adjective: "Far-Sighted",
    names: ["Omkar", "Olivia", "Ojas", "Ophelia"],
    why: "An owl sees through the dark with silent, 360-degree vision, identifying high-altitude shifts long before others notice.",
    tagline: "Operating above the tactical noise with deep strategic wisdom, creating lasting experiences that build pipeline.",
    behavior: ["Demands rigorous strategic methodology, data-backed impact measurements, and seamless execution mastery", "Engages in thorough multi-stakeholder evaluation cycles with high governance standards", "Establishes multi-year strategic alliances with proven specialist advisors"]
  },
  {
    animal: "Dolphin",
    emoji: "🐬",
    adjective: "Dynamic",
    names: ["Dev", "Diana", "Deepa", "Daniel"],
    why: "A dolphin rides the ocean swells with effortless grace and social intelligence, bringing energy and connection to everything.",
    tagline: "Infusing human warmth, electric energy, and immersive storytelling into every corporate milestone.",
    behavior: ["Prioritizes collaborative chemistry, experiential innovation, and seamless stakeholder delight", "Prefers agile co-creation sessions and interactive workshops over rigid corporate contracts", "Measures success by attendee sentiment, brand love, and cultural resonance"]
  },
  {
    animal: "Stallion",
    emoji: "🐎",
    adjective: "Stride",
    names: ["Sameer", "Serena", "Siddharth", "Stella"],
    why: "A thoroughbred stallion gallops across open plains with unstoppable momentum, setting a pace no competitor can match.",
    tagline: "Powering through expansion with limitless endurance, building signature annual events that define the industry standard.",
    behavior: ["Commits to annual retainers with shared KPI goals and continuous creative development", "Demands impeccable execution reliability across multiple cities and formats", "Builds enduring partnerships that grow alongside their revenue scaling"]
  },
  {
    animal: "Elephant",
    emoji: "🐘",
    adjective: "Eminent",
    names: ["Ekta", "Ethan", "Eshan", "Elena"],
    why: "An elephant leads the herd along legendary trails, possessing unshakeable authority, memory, and presence.",
    tagline: "Anchoring the brand's legacy with grand, dignified experiences that reinforce category leadership.",
    behavior: ["Operates with multi-quarter planning horizons and senior executive sponsorship", "Values governance, vendor stability, and seamless enterprise brand compliance", "Wants an established, Tier-1 partner capable of orchestrating massive corporate scale"]
  },
  {
    animal: "Albatross",
    emoji: "🪶",
    adjective: "Ascendant",
    names: ["Aarav", "Astrid", "Akash", "Alyssa"],
    why: "An albatross locks its 11-foot wings into high-altitude ocean updrafts, circling the globe without flapping once.",
    tagline: "Gliding on global thermal currents with effortless scale, transforming standard events into unforgettable summits.",
    behavior: ["Looks for full-service strategic partners capable of handling complex national or global productions", "Demands cutting-edge stagecraft, international production standards, and flawless hybrid delivery", "Signs premium annual retainers to secure dedicated creative pods"]
  },
  {
    animal: "Falcon",
    emoji: "🦅",
    adjective: "Soaring",
    names: ["Farhan", "Fiona", "Faisal", "Freya"],
    why: "A falcon climbs to 10,000 feet, dives with surgical accuracy, and seizes the biggest opportunities in plain sight.",
    tagline: "Dominating the market airspace with razor-sharp creative vision and zero margin for mediocre execution.",
    behavior: ["Values bold, boundary-pushing concepts, high production value, and guaranteed flawless delivery", "Expects continuous creative evolution so each event surpasses the last", "Partner selection driven by portfolio caliber, vision, and chemistry"]
  }
];

function hashInputs(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Intelligent Fallback Generator with 100 Combinations
 * Dynamically selects unique personas based on the hash of user inputs
 * Consistent for identical inputs, highly varied across different inputs
 */
function generateFallback({ intro = '', icp = '', life = '', yacht = '', both = '' }) {
  const splitBullets = (str, fallback) => {
    const lines = str
      .split('\n')
      .map(s => s.replace(/^[\d\-.*•]+\s*/, '').trim())
      .filter(Boolean);
    return lines.length >= 3 ? lines.slice(0, 3) : (lines.length > 0 ? lines : fallback);
  };

  const lifePoints = splitBullets(life, [
    "Critical deadline approaching without reliable vendor execution",
    "High operational pressure with executive credibility on the line",
    "Budget constraints with strict risk aversion and fear of surprises"
  ]);

  const yachtPoints = splitBullets(yacht, [
    "Outgrowing current baseline and aiming for market-defining benchmarks",
    "Fragmented vendors consuming executive bandwidth without creative vision",
    "Desire to build measurable, long-term brand equity and lasting PR buzz"
  ]);

  // Extract company/brand name dynamically
  const brandMatch = intro.match(/^([A-Z0-9a-z\s]+?)(?:\s+(?:is|provides|helps|offers|creates|designs)|\b)/i);
  const brandName = brandMatch ? brandMatch[1].trim() : 'Your business';
  const icpShort = (icp || '').split('\n')[0].slice(0, 80).trim() || 'enterprise and growth leaders';

  // Compute deterministic seed from user inputs
  const fullInputString = `${intro}||${icp}||${life}||${yacht}||${both}`;
  const seed = hashInputs(fullInputString);

  const lbIndex = seed % LIFEBOAT_ARCHETYPES.length;
  // Offset yacht index so Lifeboat and Yacht are never from identical seeds
  const ycIndex = (Math.floor(seed / 7) + 3) % YACHT_ARCHETYPES.length;

  const lbArch = LIFEBOAT_ARCHETYPES[lbIndex];
  const ycArch = YACHT_ARCHETYPES[ycIndex];

  const lbName = lbArch.names[seed % lbArch.names.length];
  const ycName = ycArch.names[(Math.floor(seed / 3)) % ycArch.names.length];

  return {
    lifeboat: {
      characterName: `${lbArch.adjective} ${lbName} the ${lbArch.animal}`,
      animal: lbArch.animal,
      emoji: lbArch.emoji,
      tagline: lbArch.tagline,
      whyAnimal: lbArch.why,
      currentState: `Facing acute operational crisis: '${lifePoints[0]}', with leadership credibility directly at stake.`,
      desiredState: `Handing off the emergency to a trusted rescue team so '${lifePoints[1] || 'all operational chaos'}' is completely resolved.`,
      stage: `Direct stakeholder at ${icpShort}`,
      painPoints: lifePoints,
      wants: [
        "Immediate emergency onboarding with guaranteed response times",
        "Transparent fixed pricing with zero surprise change orders",
        "Ironclad assurance that deliverables land smoothly and leadership is thrilled"
      ],
      buyingBehaviour: lbArch.behavior,
      language: [
        "\"Can you step in and fix this before leadership finds out?\"",
        "\"We have only weeks left and the previous approach completely broke down.\"",
        "\"Just tell me you have an emergency team ready and give me the all-in number.\"",
        "\"I cannot afford a single mistake or surprise right now.\""
      ],
      nextSteps: [
        `Schedule a 20-minute rapid triage session with ${brandName}`,
        "Deliver a 48-hour fixed-scope turnaround proposal with SLA guarantee",
        "Deploy immediate emergency execution team to take over all delivery friction"
      ]
    },
    yacht: {
      characterName: `${ycArch.adjective} ${ycName} the ${ycArch.animal}`,
      animal: ycArch.animal,
      emoji: ycArch.emoji,
      tagline: ycArch.tagline,
      whyAnimal: ycArch.why,
      currentState: `Operations are stable, but hungry to achieve category dominance: '${yachtPoints[0]}'.`,
      desiredState: "Setting industry benchmarks, driving lasting executive buzz, and enjoying seamless partner alignment.",
      stage: `Visionary executive driving ${icpShort}`,
      painPoints: yachtPoints,
      wants: [
        "A signature, market-defining experience that sets the industry standard",
        "A single trusted strategic partner across the entire annual calendar",
        "Measurable PR buzz, executive acclaim, and strategic business impact"
      ],
      buyingBehaviour: ycArch.behavior,
      language: [
        "\"We want our next flagship milestone to blow the entire industry away.\"",
        "\"How do we turn this from an ordinary delivery into our signature category property?\"",
        "\"We don't need another generic vendor; we need a strategic creative partner.\"",
        "\"What's the boldest vision you have for our brand this year?\""
      ],
      nextSteps: [
        `Facilitate an executive vision alignment workshop with ${brandName}`,
        "Present a multi-tiered strategic partnership roadmap with clear milestones",
        "Initiate an annual retainer partnership agreement to secure dedicated creative leads"
      ]
    },
    bridge: {
      headline: `From Fire-Drill Rescue to Industry-Defining Retainer with ${brandName}`,
      lifeboatOffer: both ? both.slice(0, 140) : "Rapid Rescue Sprint: A fixed-scope emergency triage package executed in 48–72 hours with guaranteed delivery.",
      yachtOffer: "Strategic Flagship Retainer: An annual partnership providing concept lab innovation, master planning, and executive production.",
      journey: [
        { tag: "Entry", text: "Client enters with an urgent rescue problem requiring immediate stabilization." },
        { tag: "Proof", text: "Flawless execution under fire builds deep, unshakable executive trust." },
        { tag: "Upgrade", text: "A post-project review reveals strategic opportunities for the year ahead." },
        { tag: "Retainer", text: "The relationship upgrades to an ongoing strategic retainer driving category leadership." }
      ],
      message: `${brandName} meets you where you are — rescuing you in the storm and navigating you to the horizon.`
    }
  };
}

/**
 * Execute completion call on Luna 6 (gpt-6-luna) or standard OpenAI models.
 * Handles reasoning models, developer role, and sampling parameter compatibility for maximum creative variation.
 */
async function executeOpenAICall(openai, model, systemPrompt, userPrompt) {
  const isLuna = model.toLowerCase().includes('luna');
  const isReasoning = isLuna || model.toLowerCase().includes('o1') || model.toLowerCase().includes('o3');

  // Multi-tier attempt payloads tailored for Luna 6 and standard models
  const payloads = [];

  if (isReasoning) {
    // 1. Luna 6 with unlocked sampling: reasoning_effort 'none' + high temperature for maximum creative diversity
    payloads.push({
      model,
      messages: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      reasoning_effort: 'none',
      temperature: 1.0,
    });

    // 2. Luna 6 in fast reasoning mode (low reasoning effort, omit temperature)
    payloads.push({
      model,
      messages: [
        { role: 'developer', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      reasoning_effort: 'low',
    });

    // 3. Luna 6 with system role fallback
    payloads.push({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
    });
  } else {
    // Standard chat models (gpt-4o, gpt-4o-mini)
    payloads.push({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 1.0,
      presence_penalty: 0.45,
      frequency_penalty: 0.3,
    });
  }

  let lastError = null;
  for (const payload of payloads) {
    try {
      const completion = await openai.chat.completions.create(payload);
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response content received from OpenAI');
      const parsed = JSON.parse(content);
      if (parsed.lifeboat && parsed.yacht && parsed.bridge) {
        return parsed;
      }
      throw new Error('Incomplete avatar JSON structure returned from model');
    } catch (err) {
      lastError = err;
      const msg = (err.message || '').toLowerCase();
      // If error is due to an unsupported parameter or role in reasoning mode, gracefully attempt next payload shape
      if (
        msg.includes('unsupported') ||
        msg.includes('parameter') ||
        msg.includes('reasoning') ||
        msg.includes('temperature') ||
        msg.includes('developer') ||
        msg.includes('sampling')
      ) {
        continue;
      }
      // If auth, network, or fatal error, throw immediately
      throw err;
    }
  }

  throw lastError || new Error('All model execution payloads failed');
}

/**
 * Main Avatar Generator with high creative variation and model resilience
 */
async function generateAvatars(inputData) {
  const { intro, icp, life, yacht, both } = inputData;
  const apiKey = process.env.OPENAI_API_KEY;
  const configuredModel = process.env.OPENAI_MODEL || 'gpt-6-luna';

  if (!apiKey || apiKey.trim() === '') {
    console.log(`[OpenAI Service] No OPENAI_API_KEY detected. Using dynamic multi-archetype persona engine.`);
    return generateFallback(inputData);
  }

  const systemPrompt = `You are a world-class brand strategist and customer psychologist specializing in the Lifeboat vs Yacht customer segmentation framework.

FRAMEWORK PRINCIPLES:
- The LIFEBOAT Customer: Arrives in a burning crisis. Panic, overwhelm, ticking clock, reputation on the line, let down by previous vendors/solutions. Needs rapid rescue, absolute certainty, fixed-price clarity, zero fluff, and immediate stabilization.
- The YACHT Customer: Operations are already solid. High ambition, seeking category prestige, scale, industry-defining benchmarks, and long-term transformation. Wants bold concepts, strategic alignment, executive caliber, and an annual partner.

MAXIMUM CREATIVE VARIATION & BESPOKE TAILORING:
1. UNBOUNDED ANIMAL ARCHETYPES: DO NOT repeat cliché animals (like generic Rabbits or Eagles unless given a truly sharp, distinctive angle). Explore the full breadth of the animal kingdom to mirror the exact psychological posture of this specific buyer:
   - Crisis / Rescue Metaphors: Meerkat, Octopus, Beaver, Hedgehog, Chameleon, Pack Mule, Hermit Crab, Honey Badger, Praying Mantis, Electric Eel, Scrambling Squirrel, Worker Bee, Badger, Armadillo, Sledge Dog, Camel, Barn Owl, Lynx.
   - Growth / Ambition Metaphors: Orca, Cheetah, Wolf, Peacock, Dolphin, Stallion, Elephant, Phoenix, Lion, Royal Bengal Tiger, Peregrine Falcon, Snow Leopard, Golden Eagle, Blue Whale, Osprey, Jaguar, Black Panther.
2. ALLITERATIVE CHARACTER NAMES: Create vivid, memorable names combining diverse human first names (Indian or global as fitting the ICP) + "the" + descriptive adjective + animal (e.g. "Hyper-Vigilant Harshit the Meerkat", "Overwhelmed Omkar the Octopus", "Apex Aditi the Orca", "Prestigious Pooja the Peacock", "Battling Bikram the Beaver").
3. RAW VERBATIM SPOKEN LANGUAGE: The 4 quotes in the "language" field must sound like authentic words spoken behind closed doors by real executives in this specific sector — filled with genuine emotional tension, frustration, or visionary ambition, not sanitized corporate marketing jargon.
4. DEEP INDUSTRY TAILORING: Embed the exact terminology, operational realities, and metrics from the user's input.
5. Strictly return valid JSON conforming to the requested schema.`;

  const userPrompt = `BUSINESS OVERVIEW:
${intro}

TARGET ICP (IDEAL CUSTOMER PROFILE):
${icp}

AS A LIFEBOAT - TOP 3 ISSUES YOU RESCUE THEM FROM:
${life}

AS A YACHT - TOP 3 ISSUES YOU SOLVE FOR THEIR GROWTH/STATUS:
${yacht}

HOW YOU HELP BOTH (BRIDGE METHOD):
${both || "(Propose a compelling strategic 2-speed method to transition rescue clients into long-term retainer partners)"}

CREATIVE VARIATION DIRECTIVE:
Generate two fresh, highly original, deeply differentiated customer personas (one Lifeboat in crisis, one Yacht in high ambition) with a strategic bridge offer. Ensure rich creative variation in animal metaphor, quotes, and tactical steps. Reply strictly with valid JSON matching this schema:
${JSON_PROMPT_SHAPE}`;

  try {
    const openai = new OpenAI({
      apiKey: apiKey.trim(),
    });

    try {
      console.log(`[OpenAI Service] Calling Luna 6 configured model: ${configuredModel}`);
      const result = await executeOpenAICall(openai, configuredModel, systemPrompt, userPrompt);
      console.log(`[OpenAI Service] Successfully generated avatars using ${configuredModel}!`);
      return result;
    } catch (primaryErr) {
      console.warn(`[OpenAI Service] Primary model '${configuredModel}' failed: ${primaryErr.message}`);
      // Fallback to standard production model if configured model fails
      if (configuredModel !== 'gpt-4o-mini' && configuredModel !== 'gpt-4o') {
        console.warn(`[OpenAI Service] Retrying with production model 'gpt-4o-mini'...`);
        return await executeOpenAICall(openai, 'gpt-4o-mini', systemPrompt, userPrompt);
      }
      throw primaryErr;
    }
  } catch (err) {
    console.warn(`[OpenAI Service] OpenAI generation failed: ${err.message}. Generating via dynamic multi-archetype persona engine.`);
    return generateFallback(inputData);
  }
}

module.exports = {
  generateAvatars,
  generateFallback,
};
