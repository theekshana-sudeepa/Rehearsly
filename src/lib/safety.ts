/**
 * Crisis-content safety intercept.
 *
 * A hard rule from day one (CLAUDE.md §2): Rehearsly is a confidence-building
 * rehearsal tool, not a therapy app or a crisis service. When a user's scenario
 * description or message indicates crisis-level distress — self-harm, suicidal
 * ideation, or abuse — the app must NOT generate a roleplay. It shows a warm
 * message pointing at real support instead.
 *
 * Design notes:
 *  - This runs client-side BEFORE any network call, so a crisis message is
 *    never sent to the model provider at all.
 *  - The Edge Function repeats the check server-side; a client check alone is
 *    bypassable, and this rule is not allowed to be bypassable.
 *  - It is deliberately tuned to over-trigger rather than under-trigger. A
 *    false positive costs a user one redirect to support. A false negative
 *    means we roleplayed someone's crisis back at them.
 *  - Patterns are word-boundary anchored to avoid substring accidents
 *    ("therapist" must not match "the rapist"-style overlaps, "kill the
 *    project" must not match self-harm).
 */

export type CrisisCategory = 'self_harm' | 'abuse' | 'harm_to_others';

export interface SafetyVerdict {
  /** True when roleplay must be blocked. */
  blocked: boolean;
  category: CrisisCategory | null;
  /** The pattern that matched, for logging and for tests. Never shown to users. */
  matchedPattern: string | null;
}

interface CrisisRule {
  category: CrisisCategory;
  pattern: RegExp;
}

/**
 * Phrase-level rules. These target expressions of intent or of being harmed,
 * not mere topic mentions, but we accept a wide net (see design notes).
 */
const CRISIS_RULES: readonly CrisisRule[] = [
  // --- Self-harm and suicidal ideation ---
  {
    category: 'self_harm',
    pattern: /\b(?:kill|killing)\s+(?:my|me)self\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\bsuicid(?:e|al)\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\b(?:end|ending|take|taking)\s+my\s+(?:own\s+)?life\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\bself[-\s]?harm(?:ing|ed)?\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\b(?:cut|cutting|hurt|hurting|harm|harming)\s+myself\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\b(?:want|wanted|wish|wishing)\s+(?:to\s+)?(?:be\s+dead|die|not\s+(?:be\s+)?(?:here|alive))\b/i,
  },
  {
    category: 'self_harm',
    // Separate from the "want to die" rule above because the subject pronoun
    // sits between the verb and the object: "wish I was dead".
    pattern: /\bwish(?:ed|es|ing)?\s+i\s+(?:was|were|wasn'?t|weren'?t)\s+(?:dead|gone|alive|here|never\s+born)\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\bdon'?t\s+want\s+to\s+(?:be\s+(?:here|alive)|live|wake\s+up)\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\b(?:better\s+off|everyone\s+would\s+be\s+better)\s+(?:dead|without\s+me)\b/i,
  },
  {
    category: 'self_harm',
    pattern: /\b(?:overdose|overdosing)\b/i,
  },

  // --- Abuse and violence directed at the user ---
  {
    category: 'abuse',
    pattern: /\b(?:he|she|they|husband|wife|partner|boyfriend|girlfriend|dad|father|mom|mother|parents?|brother|sister|boss)\s+(?:\w+\s+){0,2}?(?:hits?|hit|beats?|beat|strangl\w*|chok\w*|punch\w*|slaps?|slapped|threatens?|threatened)\s+me\b/i,
  },
  {
    category: 'abuse',
    pattern: /\b(?:domestic|physical|sexual|emotional)\s+(?:abuse|violence|assault)\b/i,
  },
  {
    category: 'abuse',
    pattern: /\b(?:being|been|am|was|getting)\s+(?:physically|sexually|emotionally|verbally)?\s*abused\b/i,
  },
  {
    category: 'abuse',
    pattern: /\b(?:rape|raped|raping|sexual\s+assault|molest\w*)\b/i,
  },
  {
    category: 'abuse',
    pattern: /\bafraid\s+(?:for\s+my\s+life|(?:he|she|they)(?:'ll| will)\s+(?:kill|hurt)\s+me)\b/i,
  },
  {
    category: 'abuse',
    pattern: /\b(?:i'?m\s+)?(?:not\s+safe|unsafe)\s+(?:at\s+home|in\s+my\s+(?:home|house|relationship|marriage))\b/i,
  },

  // --- Intent to harm another person ---
  {
    category: 'harm_to_others',
    pattern: /\b(?:want|going|plan(?:ning)?)\s+to\s+(?:kill|hurt|attack|stab|shoot)\s+(?:him|her|them|my\s+\w+|someone)\b/i,
  },
];

/**
 * Screen free text for crisis indicators.
 * Safe to call on every message and on scenario descriptions.
 */
export function checkForCrisisContent(text: string): SafetyVerdict {
  // Normalise unicode punctuation so smart apostrophes still match.
  const normalised = text.replace(/[‘’ʼ]/g, "'").replace(/\s+/g, ' ');

  for (const rule of CRISIS_RULES) {
    if (rule.pattern.test(normalised)) {
      return {
        blocked: true,
        category: rule.category,
        matchedPattern: rule.pattern.source,
      };
    }
  }

  return { blocked: false, category: null, matchedPattern: null };
}

/**
 * Sentinel the roleplay model is instructed to emit if crisis content somehow
 * reaches it. The app replaces any response containing this with the support
 * message rather than rendering model output.
 */
export const CRISIS_SENTINEL = '__REHEARSLY_CRISIS_STOP__';

/** True when a model response must be replaced by the support message. */
export function responseTrippedSafety(modelResponse: string): boolean {
  return modelResponse.includes(CRISIS_SENTINEL);
}

export interface SupportMessage {
  title: string;
  body: string;
  resources: readonly { label: string; detail: string }[];
  /** Shown on the button that returns the user to safety, not to roleplay. */
  dismissLabel: string;
}

/**
 * Copy shown instead of a roleplay. Warm and non-clinical, names the limit
 * honestly, and does not pretend to be a crisis service itself.
 */
export function getSupportMessage(category: CrisisCategory | null): SupportMessage {
  const shared = {
    resources: [
      {
        label: 'Find a helpline where you are',
        detail: 'findahelpline.com lists free, confidential lines in over 130 countries.',
      },
      {
        label: 'If you are in immediate danger',
        detail: 'Contact your local emergency number right away.',
      },
    ],
    dismissLabel: 'Back to safety',
  } as const;

  if (category === 'abuse') {
    return {
      title: "This deserves more than a rehearsal",
      body:
        "It sounds like someone may be hurting you. Rehearsly is built for practising everyday hard conversations, and it is not the right tool for this — you deserve support from someone trained to help, not a roleplay.",
      ...shared,
    };
  }

  if (category === 'harm_to_others') {
    return {
      title: 'Let’s pause here',
      body:
        "This isn't something Rehearsly can help you rehearse. If you're having thoughts about hurting someone, talking to a real person — a crisis line or a professional — is the right next step.",
      ...shared,
    };
  }

  return {
    title: "Let's pause the rehearsal",
    body:
      "What you've written sounds heavier than a difficult conversation, and I don't want to roleplay it back at you. Rehearsly isn't a substitute for real support — please talk to someone who can actually be there with you.",
    ...shared,
  };
}
