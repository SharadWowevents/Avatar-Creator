const OpenAI = require('openai');

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
 * Dynamically derives personas strictly from user's actual inputs
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
    "Critical deadline approaching without reliable execution",
    "High operational pressure and credibility on the line",
    "Budget constraints with strict risk aversion"
  ]);

  const yachtPoints = splitBullets(yacht, [
    "Outgrowing current baseline and aiming for market leadership",
    "Fragmented systems or vendors consuming executive bandwidth",
    "Desire to build measurable, long-term brand equity and ROI"
  ]);

  // Extract company/brand name dynamically
  const brandMatch = intro.match(/^([A-Z0-9a-z\s]+?)(?:\s+(?:is|provides|helps|offers|creates|designs)|\b)/i);
  const brandName = brandMatch ? brandMatch[1].trim() : 'Your business';

  return {
    lifeboat: {
      characterName: "Frantic Farhan the Scrambling Squirrel",
      animal: "Squirrel",
      emoji: "🐿️",
      tagline: "Gathering nuts mid-blizzard, eyes darting at every falling branch.",
      whyAnimal: "A squirrel is hyper-aware of impending scarcity and danger, constantly reacting to immediate threats instead of calmly executing.",
      currentState: `Overwhelmed by urgent demands: '${lifePoints[0]}', and worried about operational failure.`,
      desiredState: `Handing off the crisis to a reliable partner and breathing easy knowing '${lifePoints[1] || 'the crisis'}' is fully resolved.`,
      stage: `Direct stakeholder in ${icp.slice(0, 70) || 'a high-pressure operational environment'}`,
      painPoints: lifePoints,
      wants: [
        "Immediate emergency onboarding and response",
        "Clear milestone clarity with zero surprise costs",
        "Direct guarantee that deliverables will land smoothly on time"
      ],
      buyingBehaviour: [
        "Makes rapid purchasing decisions when trust and quick responsiveness are demonstrated",
        "Prioritizes speed, availability, and low frictional overhead over extensive decks",
        "Seeks immediate proof of concept or high-confidence references"
      ],
      language: [
        "\"Can we get this sorted by this week?\"",
        "\"I don't have time to explain everything from scratch.\"",
        "\"Just tell me what it takes to get it done right now.\"",
        "\"Give me the fixed-cost breakdown.\""
      ],
      nextSteps: [
        `Book a 20-minute rapid triage discovery session with ${brandName}`,
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
      currentState: `Operations are stable, but aiming for category leadership: '${yachtPoints[0]}'.`,
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
      temperature: 0.7,
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
};
