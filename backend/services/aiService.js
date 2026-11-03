const OpenAI = require('openai');

const JSON_PROMPT_SHAPE = `{
  "lifeboat": {
    "characterName": "Unique alliterative name (e.g. FirstName + the + vivid adjective + domain-tailored crisis animal metaphor)",
    "animal": "string (unexpected, evocative animal reflecting this buyer's specific distress posture in their industry)",
    "emoji": "one standard Unicode emoji matching that exact animal",
    "tagline": "one emotionally raw, gripping sentence capturing their state of panic, pressure, or urgency",
    "whyAnimal": "1-2 sentences explaining why this animal metaphor mirrors their exact behavioral posture in this industry",
    "currentState": "1-2 concrete, high-stakes sentences detailing their current crisis scene with specific operational realities",
    "desiredState": "1-2 vivid sentences describing the relief, safety, and operational stability they urgently seek",
    "stage": "specific job role, company size, and high-pressure operational environment in 1 sentence",
    "painPoints": ["3 highly specific, concrete operational pain points derived directly from the business domain"],
    "wants": ["3 exact, tangible relief deliverables they urgently demand"],
    "buyingBehaviour": ["3 realistic buying criteria: emergency turnaround time, pricing model, authority, decision speed"],
    "language": ["4 raw, authentic quotes spoken behind closed doors with genuine emotion and industry vocabulary, in quotes"],
    "nextSteps": ["3 immediate, tactical actions the business should take to rescue and close this customer"]
  },
  "yacht": {
    "characterName": "Unique alliterative name (e.g. FirstName + the + aspirational adjective + majestic category-altitude animal metaphor)",
    "animal": "string (distinct animal representing category altitude, mastery, and strategic vision)",
    "emoji": "one standard Unicode emoji matching that exact animal",
    "tagline": "one elevated, magnetic sentence capturing their hunger for market dominance and prestige",
    "whyAnimal": "1-2 sentences explaining why this animal metaphor mirrors their strategic ambition",
    "currentState": "1-2 concrete sentences on their solid baseline and hunger to elevate above the competition",
    "desiredState": "1-2 vivid sentences describing setting industry benchmarks, winning acclaim, and driving enterprise ROI",
    "stage": "executive leadership role, growth trajectory, and market ambition in 1 sentence",
    "painPoints": ["3 strategic barriers, differentiation challenges, or scaling bottlenecks"],
    "wants": ["3 transformational outcomes that set a new benchmark in their sector"],
    "buyingBehaviour": ["3 strategic evaluation habits: retainer models, executive alignment, creative chemistry"],
    "language": ["4 bold, ambitious quotes they would say to a trusted strategic partner with domain-specific vision, in quotes"],
    "nextSteps": ["3 strategic partnership moves the business should propose to win this high-value client"]
  },
  "bridge": {
    "headline": "A bold, compelling strategic headline bridging both personas (customized to this specific business, NO generic clichés)",
    "lifeboatOffer": "Concrete, bespoke rescue sprint named specifically for this business with fixed scope and timeline",
    "yachtOffer": "Bespoke annual strategic partnership retainer named specifically for this business",
    "journey": [
      {"tag": "Entry", "text": "Specific crisis entry point where the client is rescued with rapid stabilization"},
      {"tag": "Proof", "text": "How flawless execution under fire builds deep executive trust"},
      {"tag": "Upgrade", "text": "How the debrief reveals larger strategic gaps and long-term opportunities"},
      {"tag": "Retainer", "text": "How the client smoothly transitions into an annual flagship retainer"}
    ],
    "message": "A memorable, punchy one-sentence brand promise connecting rescue to transformation, tailored to this company"
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
      headline: `From ${lifePoints[0]?.slice(0, 45) || 'Critical Delivery'} to ${yachtPoints[0]?.slice(0, 45) || 'Category Leadership'}`,
      lifeboatOffer: both ? both.slice(0, 160) : `${brandName} Rapid Stabilization Sprint: A 48-hour fixed-scope intervention tackling ${lifePoints[0]?.slice(0, 60) || 'urgent delivery risks'}.`,
      yachtOffer: `${brandName} Flagship Retainer: An annual strategic partnership driving ${yachtPoints[0]?.slice(0, 60) || 'industry-defining benchmarks'}.`,
      journey: [
        { tag: "Entry", text: `Client enters facing acute friction: "${lifePoints[0]?.slice(0, 80) || 'urgent operational bottleneck'}", requiring immediate intervention.` },
        { tag: "Proof", text: `Rapid execution under pressure neutralizes "${lifePoints[1]?.slice(0, 80) || 'the crisis'}", establishing ironclad trust.` },
        { tag: "Upgrade", text: `A strategic debrief reveals high-altitude opportunities to address "${yachtPoints[0]?.slice(0, 80) || 'long-term market positioning'}".` },
        { tag: "Retainer", text: `The relationship expands into a year-round partnership achieving "${yachtPoints[1]?.slice(0, 80) || 'uncontested category status'}".` }
      ],
      message: `${brandName} anchors you through the immediate storm and propels you into market leadership.`
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

  const CREATIVE_LENSES = [
    "PSYCHOLOGICAL LENS: High-Stakes Career Liability & Executive Exposure (Lifeboat) vs Category Monopoly & Legacy Definition (Yacht).",
    "PSYCHOLOGICAL LENS: Immediate Tactical Vendor Bleed & Timeline Collapse (Lifeboat) vs Signature Global Masterwork & Industry Benchmark (Yacht).",
    "PSYCHOLOGICAL LENS: Relentless Operational Chokepoints & Budget Panic (Lifeboat) vs Long-Horizon Strategic Retainer & Category Hegemony (Yacht).",
    "PSYCHOLOGICAL LENS: Ticking Clock Crisis & Lost Stakeholder Faith (Lifeboat) vs Boundary-Pushing Creative Standard & Enterprise Transformation (Yacht).",
    "PSYCHOLOGICAL LENS: Exhausted Decision Paralysis & Team Friction (Lifeboat) vs Elite Multi-Year Partnership & Unrivaled Market Authority (Yacht)."
  ];
  const selectedLens = CREATIVE_LENSES[Math.floor(Math.random() * CREATIVE_LENSES.length)];
  const variationNonce = Math.floor(Math.random() * 1000000);

  const systemPrompt = `You are a world-class brand strategist and customer psychologist specializing in the Lifeboat vs Yacht customer segmentation framework.

FRAMEWORK PRINCIPLES:
- The LIFEBOAT Customer: Arrives in a burning operational crisis. Panic, overwhelm, ticking clock, reputation on the line, let down by previous vendors. Needs rapid rescue, absolute operational certainty, fixed-price clarity, zero fluff, and immediate stabilization.
- The YACHT Customer: Operations are already solid. High ambition, seeking category prestige, scale, industry-defining benchmarks, and long-term transformation. Wants bold concepts, strategic alignment, executive caliber, and an annual partner.

MANDATORY ANTI-REPETITION & ANTI-CLICHÉ RULES:
1. STRICTLY FORBIDDEN CANNED PHRASES: Do NOT use formulaic corporate boilerplate such as:
   - "rapid-response tactical package" or "annual comprehensive strategic partnership"
   - "from rescue to reinvention" or "transforming crisis into visionary partnerships"
   - "targeted interventions" or "build trust by delivering results amid challenges"
   - "post-rescue analysis reveals areas ripe for strategic advancements"
   - "seamless transition into ongoing partnership"
   - "immediate resolution with clear actionable steps"
   - "fixed-price clarity that assures no more unexpected costs"
   - "if we don't act now we will lose everything" or "we need results now no fluff"
2. BESPOKE ANIMAL ARCHETYPES: DO NOT repeat cliché animals (like generic Rabbits or Eagles unless given a truly sharp, distinctive angle). Choose original, evocative animal metaphors that deeply mirror the exact psychological posture of this specific buyer in this exact industry. Pull from the full breadth of the animal kingdom (e.g. Honey Badger, Manta Ray, Peregrine Falcon, Snow Leopard, Komodo Dragon, Timber Wolf, Black Panther, Mountain Goat, Rhino, Barn Owl, Electric Eel, Archerfish, Border Collie, Sledge Husky, Hammerhead, Dragonfly, Meerkat, Beaver, Hedgehog, Chameleon, Pack Mule, Hermit Crab, Orca, Cheetah, Dolphin, Stallion, Elephant, Phoenix, Lion, Tiger).
3. DOMAIN-DEEP VOCABULARY & DETAIL: Embed the exact technical terms, tools, operational realities, metrics, and stakes provided in the user's business overview and ICP. Every single pain point, quote, and deliverable must feel authentic to this exact industry.
4. AUTHENTIC EXECUTIVE QUOTES: In the "language" field, generate 4 raw, candid quotes that sound like real people speaking behind closed doors under genuine stress or bold ambition.
5. BESPOKE OFFER ARCHITECTURE: In the "bridge" section, name concrete, branded packages (e.g. for event production: "48-Hour Technical Triage & Cue Recovery Sprint", "12-Month Flagship Summit Retainer").
6. Strictly return valid JSON conforming to the requested schema.`;

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
${selectedLens}
[VARIATION NONCE: ${variationNonce}]
Generate two fresh, highly original, deeply differentiated customer personas (one Lifeboat in crisis, one Yacht in high ambition) with a strategic bridge offer tailored specifically to this business. Avoid repetitive templates or generic corporate filler. Reply strictly with valid JSON matching this schema:
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
