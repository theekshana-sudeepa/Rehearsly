import {
  CRISIS_SENTINEL,
  checkForCrisisContent,
  getSupportMessage,
  responseTrippedSafety,
} from './safety';

describe('checkForCrisisContent', () => {
  describe('blocks crisis content', () => {
    const selfHarm = [
      'I want to kill myself',
      "I've been thinking about suicide",
      'I feel suicidal lately',
      'I want to end my life',
      'I have been self-harming again',
      'I keep cutting myself when it gets bad',
      'I just want to die',
      "I don't want to be here anymore",
      'Everyone would be better off without me',
      'I thought about an overdose',
      'I wish I was dead',
      "I wish I wasn't here",
      'I wish I was never born',
    ];

    it.each(selfHarm)('flags self-harm: %s', (input) => {
      const verdict = checkForCrisisContent(input);
      expect(verdict.blocked).toBe(true);
      expect(verdict.category).toBe('self_harm');
    });

    const abuse = [
      'My husband hits me when he drinks',
      'My boss threatened me physically',
      'My dad beats me',
      'This is domestic violence and I need to confront him',
      "I've been emotionally abused for years",
      'I am afraid for my life',
      "I'm not safe at home",
      'He strangled me last night',
    ];

    it.each(abuse)('flags abuse: %s', (input) => {
      const verdict = checkForCrisisContent(input);
      expect(verdict.blocked).toBe(true);
      expect(verdict.category).toBe('abuse');
    });

    it('flags intent to harm others', () => {
      const verdict = checkForCrisisContent('I want to hurt him for what he did');
      expect(verdict.blocked).toBe(true);
      expect(verdict.category).toBe('harm_to_others');
    });

    it('matches through smart apostrophes', () => {
      // Mobile keyboards substitute U+2019 automatically.
      const verdict = checkForCrisisContent('I don’t want to be alive');
      expect(verdict.blocked).toBe(true);
    });

    it('matches regardless of case and extra whitespace', () => {
      expect(checkForCrisisContent('I   WANT  TO   KILL   MYSELF').blocked).toBe(true);
    });
  });

  describe('allows ordinary hard conversations', () => {
    const benign = [
      'I need to tell my manager their feedback style is hurting the team',
      'I want to set a boundary with my mother about visiting unannounced',
      'I have to say no to taking on another project this quarter',
      'My coworker keeps missing deadlines and I need to confront him',
      'I want to kill the project before it wastes more budget',
      'This deadline is killing me and I need to push back',
      'I need to tell my landlord I am moving out',
      'I want to ask for a raise but I freeze up',
      'My friend said something cutting and I want to address it',
      'I need to end my contract with a difficult client',
      'I have to give critical feedback about repeated lateness',
      'I want to talk to my sister about how she speaks to our parents',
      'I am dead tired of being interrupted in meetings',
      'I need to fire someone for the first time',
    ];

    it.each(benign)('allows: %s', (input) => {
      const verdict = checkForCrisisContent(input);
      expect(verdict.blocked).toBe(false);
      expect(verdict.category).toBeNull();
    });

    it('does not flag talking about getting therapy', () => {
      expect(checkForCrisisContent('My therapist suggested I rehearse this').blocked).toBe(false);
    });

    it('returns no matched pattern when clean', () => {
      expect(checkForCrisisContent('I need to ask for more time').matchedPattern).toBeNull();
    });
  });

  it('handles empty input', () => {
    expect(checkForCrisisContent('').blocked).toBe(false);
  });
});

describe('responseTrippedSafety', () => {
  it('detects the sentinel in a model response', () => {
    expect(responseTrippedSafety(`some preamble ${CRISIS_SENTINEL}`)).toBe(true);
  });

  it('passes normal roleplay responses through', () => {
    expect(responseTrippedSafety("Look, I've been busy. What do you want me to say?")).toBe(false);
  });
});

describe('getSupportMessage', () => {
  it('gives abuse-specific copy', () => {
    expect(getSupportMessage('abuse').body).toMatch(/hurting you/i);
  });

  it('always offers a way to find real support', () => {
    for (const category of ['self_harm', 'abuse', 'harm_to_others', null] as const) {
      const message = getSupportMessage(category);
      expect(message.resources.length).toBeGreaterThan(0);
      expect(message.title).not.toBe('');
      expect(message.dismissLabel).not.toBe('');
    }
  });

  it('never suggests continuing the roleplay', () => {
    for (const category of ['self_harm', 'abuse', 'harm_to_others', null] as const) {
      expect(getSupportMessage(category).body).not.toMatch(/continue|carry on|try again/i);
    }
  });
});
