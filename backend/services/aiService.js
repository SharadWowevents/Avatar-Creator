const OpenAI = require('openai');

const WOW_EXAMPLE_OUT = {
  lifeboat: {
    characterName: "Rescue Rhea the Restless Rabbit",
    animal: "Rabbit",
    emoji: "🐇",
    tagline: "Ears up, heart racing, ready to bolt at the next bad message.",
    whyAnimal: "A rabbit senses danger everywhere and can't settle. Rhea is in constant alert mode, watching every deadline and every message from her boss.",
    currentState: "Three weeks to the dealer meet, the vendor isn't answering, and her CMO has already asked twice if 'everything is on track'.",
    desiredState: "Walking into the venue the evening before and seeing everything set, on budget, with her CMO saying 'this is the best one yet'.",
    stage: "Mid-career marketing manager in a growing company, under pressure to prove herself",
    painPoints: [
      "A vendor has gone silent with the event weeks away",
      "Her credibility with leadership depends on this one event",
      "A fixed budget with zero room for surprises"
    ],
    wants: [
      "A partner who takes charge and replies within the hour",
      "A clear plan and costing she can show her boss tomorrow",
      "To sleep properly the week before the event"
    ],
    buyingBehaviour: [
      "Decides fast once trust is built, often within a week",
      "Needs one strong reference or case study, not a long deck",
      "Pushes hard on fixed pricing and no hidden costs"
    ],
    language: [
      "\"We're running out of time.\"",
      "\"I can't go back to my boss with excuses.\"",
      "\"Just tell me it'll be done.\"",
      "\"What's the all-inclusive number?\""
    ],
    nextSteps: [
      "Offer a free 30-minute rescue call within 24 hours",
      "Send a 48-hour fixed-scope plan with a single all-in price",
      "Share a short case study of a last-minute rescue event"
    ]
  },
  yacht: {
    characterName: "Visionary Vikram the Soaring Eagle",
    animal: "Eagle",
    emoji: "🦅",
    tagline: "Flying high, already looking at the next mountain.",
    whyAnimal: "Eagles see the whole landscape from above and pick their moment. Vikram plans the year ahead and wants a partner who matches his altitude.",
    currentState: "Events go well but feel predictable. He manages five vendors and spends too much time on coordination instead of ideas.",
    desiredState: "His flagship event is the one competitors copy, with one partner across the year and clear numbers on brand impact.",
    stage: "Established brand or CMO in a market-leading company, scaling and building brand legacy",
    painPoints: [
      "Events look like everyone else's in the industry",
      "Too many vendors, too much coordination",
      "No way to show the ROI of event spend to the board"
    ],
    wants: [
      "A signature experience that gets talked about",
      "One strategic partner with a creative point of view",
      "Content and PR value well beyond event day"
    ],
    buyingBehaviour: [
      "Takes 4–8 weeks and involves procurement and leadership",
      "Buys on creative vision and portfolio quality more than price",
      "Values long-term relationships and annual contracts"
    ],
    language: [
      "\"We want to set the benchmark.\"",
      "\"What's the big idea?\"",
      "\"How do we make this memorable?\"",
      "\"Think of it as a year-long partnership.\""
    ],
    nextSteps: [
      "Invite him to a Concept Lab session for his flagship event",
      "Present 2–3 bold theme directions with mood boards",
      "Propose an annual partnership with a quarterly impact report"
    ]
  },
  bridge: {
    headline: "Rescue the Rabbit today, fly with the Eagle tomorrow",
    lifeboatOffer: "Rapid Rescue: a 48-hour fixed-scope plan, one all-in price and daily updates for events under 4 weeks away.",
    yachtOffer: "Annual Experience Partnership: concept labs, design-led themes and post-event impact reports across the year.",
    journey: [
      { tag: "Entry", text: "A Lifeboat client calls in a crisis; we deliver fast and calmly." },
      { tag: "Proof", text: "The rescued event lands well, and the client gets credit in front of leadership." },
      { tag: "Upgrade", text: "Within 30 days, offer a debrief and a preview of next year's calendar." },
      { tag: "Retainer", text: "Convert to an annual partnership: the Rabbit becomes an Eagle." }
    ],
    message: "Whether you're sinking or sailing, WOW Events gets you to a standing ovation."
  }
};

const JSON_PROMPT_SHAPE = `{
 "lifeboat": {
   "characterName": "Alliterative human first name + the + adjective + animal (e.g. Rescue Rhea the Restless Rabbit)",
   "animal": "string",
   "emoji": "one standard Unicode emoji of exactly that animal",
   "tagline": "one vivid line",
   "whyAnimal": "1-2 sentences on why this animal mirrors their situation",
   "currentState": "1-2 sentences, concrete scene",
   "desiredState": "1-2 sentences, concrete scene",
   "stage": "stage of business/life in one line",
   "painPoints": ["3 strings"],
   "wants": ["3 strings"],
   "buyingBehaviour": ["3 strings"],
   "language": ["4 short phrases they actually say, in quotes"],
   "nextSteps": ["3 concrete actions the business should take to win this customer"]
 },
 "yacht": {
   "characterName": "Alliterative human first name + the + adjective + animal (e.g. Visionary Vikram the Soaring Eagle)",
   "animal": "string",
   "emoji": "one standard Unicode emoji of exactly that animal",
   "tagline": "one vivid line",
   "whyAnimal": "1-2 sentences on why this animal mirrors their situation",
   "currentState": "1-2 sentences, concrete scene",
   "desiredState": "1-2 sentences, concrete scene",
   "stage": "stage of business/life in one line",
   "painPoints": ["3 strings"],
   "wants": ["3 strings"],
   "buyingBehaviour": ["3 strings"],
   "language": ["4 short phrases they actually say, in quotes"],
   "nextSteps": ["3 concrete actions the business should take to win this customer"]
 },
 "bridge": {
   "headline": "catchy headline combining both personas",
   "lifeboatOffer": "concrete fast rescue solution",
   "yachtOffer": "premium transformational solution",
   "journey": [
     {"tag": "Entry", "text": "how they enter"},
     {"tag": "Proof", "text": "how trust is proven"},
     {"tag": "Upgrade", "text": "how they transition"},
     {"tag": "Retainer", "text": "how they become ongoing partners"}
   ],
   "message": "one-line closing brand promise"
 }
}`;

/**
 * Intelligent Fallback Generator when API key is not supplied or fails
 */
function generateFallback({ intro = '', icp = '', life = '', yacht = '', both = '' }) {
  const text = `${intro} ${icp}`.toLowerCase();
  
  if (text.includes('wow') || (text.includes('event') && text.includes('agency'))) {
    return WOW_EXAMPLE_OUT;
  }

  const splitBullets = (str, fallback) => {
    const lines = str
      .split('\n')
      .map(s => s.replace(/^[\d\-.*•]+\s*/, '').trim())
      .filter(Boolean);
    return lines.length >= 3 ? lines.slice(0, 3) : fallback;
  };

  const lifePoints = splitBullets(life, [
    "Critical deadline approaching without reliable vendor execution",
    "Pressure from leadership to deliver immediate, flawless results",
    "Budget constraints with strict risk aversion"
  ]);

  const yachtPoints = splitBullets(yacht, [
    "Outgrowing current baseline and needing tier-one market leadership",
    "Fragmented systems or partners consuming executive time",
    "Desire to build measurable, long-term brand equity and ROI"
  ]);

  const brandMatch = intro.match(/^([A-Z0-9a-z\s]+?)(?:\s+(?:is|provides|helps|offers|creates|designs)|\b)/i);
  const brandName = brandMatch ? brandMatch[1].trim() : 'Your business';

  return {
    lifeboat: {
      characterName: "Frantic Farhan the Scrambling Squirrel",
      animal: "Squirrel",
      emoji: "🐿️",
      tagline: "Gathering nuts mid-blizzard, eyes darting at every falling branch.",
      whyAnimal: "A squirrel is hyper-aware of impending scarcity and danger, constantly reacting to immediate threats instead of calmly executing.",
      currentState: `Overwhelmed by urgent deadlines, struggling with '${lifePoints[0]}', and worried about reputational fallout.`,
      desiredState: `Handing off the crisis to a reliable partner and breathing easy knowing '${lifePoints[1]}' is fully resolved.`,
      stage: `Direct stakeholder or team lead in ${icp.slice(0, 70) || 'a high-pressure operational environment'}`,
      painPoints: lifePoints,
      wants: [
        "Immediate emergency onboarding within 24–48 hours",
        "Clear milestone clarity with zero surprise invoices",
        "Direct assurance that deliverables won't miss the deadline"
      ],
      buyingBehaviour: [
        "Makes rapid purchasing decisions when trust and quick responsiveness are demonstrated",
        "Prioritizes speed, availability, and low frictional overhead over extensive presentations",
        "Seeks immediate proof of concept or high-confidence references"
      ],
      language: [
        "\"Can we get this sorted by this week?\"",
        "\"I don't have time to explain everything from scratch.\"",
        "\"Just tell me what it takes to get it done right now.\"",
        "\"Give me the fixed-cost breakdown.\""
      ],
      nextSteps: [
        `Book a 20-minute rapid-triage discovery session with ${brandName}`,
        "Deliver a scoped turnaround agreement with guaranteed SLA within 48 hours",
        "Assign a dedicated lead for continuous progress updates"
      ]
    },
    yacht: {
      characterName: "Pioneering Priya the Majestic Panther",
      animal: "Panther",
      emoji: "🐆",
      tagline: "Poised on the high branch, spotting opportunities miles ahead.",
      whyAnimal: "Panthers move with deliberate grace and high strategic intent. They do not scavenge in a panic; they select high-value targets and scale.",
      currentState: `Operations are stable, but ${yachtPoints[0]}. Seeking a strategic leap rather than incremental maintenance.`,
      desiredState: `Operating as an industry benchmark, with seamless partner alignment driving sustainable growth.`,
      stage: `Executive or strategic leader aiming to elevate their category presence`,
      painPoints: yachtPoints,
      wants: [
        "Proactive strategic guidance rather than reactive task execution",
        "Integrated high-tier experience and measurable business outcomes",
        "A true long-term partner who scales alongside their ambitions"
      ],
      buyingBehaviour: [
        "Evaluates based on strategic depth, creative caliber, and collaborative chemistry",
        "Involves multiple cross-functional stakeholders with 3–6 week deliberative cycles",
        "Willing to invest premium budgets for proven, transformative outcomes"
      ],
      language: [
        "\"How do we redefine this category?\"",
        "\"What's the strategic roadmap for the next 12 months?\"",
        "\"Show me the bigger vision.\"",
        "\"We want a true collaborative partner, not just another vendor.\""
      ],
      nextSteps: [
        "Facilitate an executive discovery workshop to co-create the high-level vision",
        "Present a multi-tiered strategic partnership proposal with clear milestones",
        "Share an in-depth case study showcasing transformational ROI"
      ]
    },
    bridge: {
      headline: `From Immediate Rescue to Strategic Altitude with ${brandName}`,
      lifeboatOffer: both ? both.slice(0, 120) : "Rapid-response turnaround package delivering immediate stabilization within 48–72 hours.",
      yachtOffer: "Comprehensive strategic partnership providing ongoing optimization, high-tier execution, and measurable growth.",
      journey: [
        { tag: "Entry", text: "The client enters via an urgent Lifeboat problem requiring immediate stabilization." },
        { tag: "Proof", text: "Flawless execution under pressure earns deep executive trust and credibility." },
        { tag: "Upgrade", text: "A post-project review highlights strategic opportunities for ongoing elevation." },
        { tag: "Retainer", text: "The relationship converts into an ongoing Yacht partnership driving category dominance." }
      ],
      message: `${brandName} meets you where you are — rescuing you in the storm and navigating you to the horizon.`
    }
  };
}

/**
 * Main Avatar Generator using OpenAI (GPT-6 Luna)
 */
async function generateAvatars(inputData) {
  const { intro, icp, life, yacht, both } = inputData;
  const apiKey = process.env.OPENAI_API_KEY;
  const modelName = process.env.OPENAI_MODEL || 'gpt-6-luna';

  if (!apiKey || apiKey.trim() === '') {
    console.log(`[OpenAI Service] No OPENAI_API_KEY detected. Using intelligent heuristic persona generator (Target model: ${modelName}).`);
    return generateFallback(inputData);
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey.trim(),
    });

    const systemPrompt = `You are a sharp marketing strategist. Build two customer avatars for this business using the Lifeboat vs Yacht model.
Lifeboat customer = in trouble, urgent, needs rescue. Yacht customer = doing well, wants to go further, status and growth.
Give each avatar an animal character that relates to their situation, current state and desired state. Choose two different animals. Be specific to this business and ICP; no generic filler.
You must respond strictly with valid JSON conforming to the requested schema.`;

    const userPrompt = `BUSINESS INTRO:
${intro}

ICP:
${icp}

AS A LIFEBOAT, TOP 3 ISSUES WE SOLVE:
${life}

AS A YACHT, TOP 3 ISSUES WE SOLVE:
${yacht}

HOW WE HELP BOTH:
${both || "(not given — propose it)"}

Reply strictly with valid JSON conforming exactly to this shape:
${JSON_PROMPT_SHAPE}`;

    console.log(`[OpenAI Service] Calling OpenAI model: ${modelName}`);

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from OpenAI');
    }

    const parsed = JSON.parse(content);
    if (parsed.lifeboat && parsed.yacht && parsed.bridge) {
      return parsed;
    } else {
      throw new Error('Incomplete avatar JSON structure returned from OpenAI');
    }
  } catch (err) {
    console.warn(`[OpenAI Service] OpenAI generation failed with model '${modelName}': ${err.message}. Falling back to heuristic generator.`);
    return generateFallback(inputData);
  }
}

module.exports = {
  generateAvatars,
  generateFallback,
  WOW_EXAMPLE_OUT,
};
