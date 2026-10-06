import { describe, it, expect } from 'vitest';
import { calculateCoastFire } from '../calculateCoastFire.js';

const BASE = {
  currentAge: 30,
  retirementAge: 65,
  currentPortfolio: 50_000,
  annualSpending: 60_000,
  returnRate: 8.0,
  inflationRate: 3.0,
  swr: 4.0,
  periods: [],
};

describe('calculateCoastFire', () => {
  it('FI Target equals spending divided by SWR', () => {
    const { fiTarget } = calculateCoastFire(BASE);
    expect(fiTarget).toBe(1_500_000); // 60_000 / 0.04
  });

  it('changes FI Target proportionally when SWR changes', () => {
    const at4 = calculateCoastFire(BASE);
    const at3 = calculateCoastFire({ ...BASE, swr: 3.0 });
    expect(at3.fiTarget).toBeCloseTo(at4.fiTarget * (4 / 3), 0);
  });

  it('isCoastNow is true when portfolio exceeds coast number', () => {
    const { coastNumber } = calculateCoastFire(BASE);
    const { isCoastNow } = calculateCoastFire({ ...BASE, currentPortfolio: coastNumber + 1 });
    expect(isCoastNow).toBe(true);
  });

  it('isCoastNow is false when portfolio is below coast number', () => {
    const { isCoastNow } = calculateCoastFire({ ...BASE, currentPortfolio: 1 });
    expect(isCoastNow).toBe(false);
  });

  it('coastAchievedAge equals currentAge when already coasting at start', () => {
    const { coastNumber } = calculateCoastFire(BASE);
    const { coastAchievedAge } = calculateCoastFire({
      ...BASE,
      currentPortfolio: coastNumber * 2,
    });
    expect(coastAchievedAge).toBe(BASE.currentAge);
  });

  it('coastAchievedAge is null when goal is unreachable with zero contributions', () => {
    const { coastAchievedAge } = calculateCoastFire({
      ...BASE,
      currentPortfolio: 0,
      periods: [],
    });
    expect(coastAchievedAge).toBeNull();
  });

  it('timeline spans from currentAge to retirementAge with yearly entries', () => {
    const { timeline } = calculateCoastFire(BASE);
    expect(timeline[0].age).toBe(30);
    expect(timeline.at(-1).age).toBe(65);
    // 35 years + 1 inclusive = 36 entries
    expect(timeline.length).toBe(36);
  });

  it('portfolio reaches FI Target at retirement when starting exactly at coast number', () => {
    const { coastNumber } = calculateCoastFire(BASE);
    const { timeline } = calculateCoastFire({
      ...BASE,
      currentPortfolio: coastNumber,
      periods: [],
    });
    const final = timeline.at(-1);
    // Floating-point compounding: within 0.1% of fiTarget
    expect(final.portfolioReal / final.fiTargetReal).toBeCloseTo(1, 2);
  });

  it('contributions increase the final portfolio compared to no contributions', () => {
    const withContrib = calculateCoastFire({
      ...BASE,
      currentPortfolio: 0,
      periods: [{ id: 1, durationMonths: 420, monthlyContribution: 1500 }],
    });
    const withoutContrib = calculateCoastFire({ ...BASE, currentPortfolio: 0 });
    expect(withContrib.timeline.at(-1).portfolioReal).toBeGreaterThan(
      withoutContrib.timeline.at(-1).portfolioReal,
    );
  });

  it('multi-phase contributions advance correctly through phases', () => {
    // Phase 1: 12 months at $1000, Phase 2: 12 months at $2000
    const result = calculateCoastFire({
      ...BASE,
      currentPortfolio: 0,
      periods: [
        { id: 1, durationMonths: 12, monthlyContribution: 1000 },
        { id: 2, durationMonths: 12, monthlyContribution: 2000 },
      ],
    });
    // Should have more portfolio than 24 months at $1000 due to higher phase-2 contribution
    const singlePhase = calculateCoastFire({
      ...BASE,
      currentPortfolio: 0,
      periods: [{ id: 1, durationMonths: 24, monthlyContribution: 1000 }],
    });
    expect(result.timeline[2].portfolioReal).toBeGreaterThan(
      singlePhase.timeline[2].portfolioReal,
    );
  });
});
