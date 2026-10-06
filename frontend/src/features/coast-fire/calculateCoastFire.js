/**
 * Pure Coast FIRE calculation. No DOM reads, no side-effects.
 *
 * All rates are annual percentages (e.g. 8.0 for 8%).
 * The simulation runs month-by-month and records yearly snapshots.
 *
 * @returns {{ fiTarget, coastNumber, coastAchievedAge, isCoastNow, timeline }}
 */
export function calculateCoastFire({
  currentAge,
  retirementAge,
  currentPortfolio,
  annualSpending,
  returnRate,
  inflationRate,
  swr,
  periods = [],
}) {
  const monthsToRetirement = (retirementAge - currentAge) * 12;
  const nomRateM = returnRate / 100 / 12;
  const inflRateM = inflationRate / 100 / 12;
  // Fisher equation for real monthly rate
  const realRateM = (1 + nomRateM) / (1 + inflRateM) - 1;

  const fiTarget = annualSpending / (swr / 100);
  const coastNumber = fiTarget / Math.pow(1 + realRateM, monthsToRetirement);

  let balNom = currentPortfolio;
  let balReal = currentPortfolio;
  let pIdx = 0;
  let mInPeriod = 0;
  let coastAchievedAge = null;
  const timeline = [];

  for (let i = 0; i <= monthsToRetirement; i++) {
    const age = currentAge + i / 12;
    const mLeft = monthsToRetirement - i;
    const reqCoastReal = fiTarget / Math.pow(1 + realRateM, mLeft || 1e-10);

    if (balReal >= reqCoastReal && coastAchievedAge === null) {
      coastAchievedAge = age;
    }

    if (i % 12 === 0 || i === monthsToRetirement) {
      timeline.push({
        age,
        portfolioReal: balReal,
        portfolioNominal: balNom,
        coastTargetReal: reqCoastReal,
        coastTargetNominal: reqCoastReal * Math.pow(1 + inflRateM, i),
        fiTargetReal: fiTarget,
        fiTargetNominal: fiTarget * Math.pow(1 + inflRateM, i),
      });
    }

    if (i < monthsToRetirement) {
      let contrib = 0;
      if (pIdx < periods.length) {
        contrib = periods[pIdx].monthlyContribution;
        if (++mInPeriod >= periods[pIdx].durationMonths) {
          pIdx++;
          mInPeriod = 0;
        }
      }
      balNom = balNom * (1 + nomRateM) + contrib;
      balReal = balReal * (1 + realRateM) + contrib / Math.pow(1 + inflRateM, i + 1);
    }
  }

  return {
    fiTarget,
    coastNumber,
    coastAchievedAge,
    isCoastNow: currentPortfolio >= coastNumber,
    timeline,
  };
}
