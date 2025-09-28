export type RatingInput = {
  security:number; fairness?:number; payout:number; bonusValue:number;
  games:number; mobile:number; support:number; reputation:number
}

export const WEIGHTS = {
  security:0.2,
  fairness:0.2,
  payout:0.2,
  bonusValue:0.15,
  games:0.15,
  mobile:0.1,
  support:0.1,
  reputation:0.1
};

export function computeScore(r: RatingInput){
  const fairness = (typeof r.fairness === 'number') ? r.fairness : r.security;
  const w = WEIGHTS as Record<string, number>;
  const total =
    (r.security * w.security) +
    (fairness * w.fairness) +
    (r.payout * w.payout) +
    (r.bonusValue * w.bonusValue) +
    (r.games * w.games) +
    (r.mobile * w.mobile) +
    (r.support * w.support) +
    (r.reputation * w.reputation);
  return Math.round((total / (Object.values(w).reduce((s,n)=>s+n,0))) * 10) / 10;
}

export function explain(r: RatingInput){
  return [
    {k:'Security & Fairness', w:WEIGHTS.security, why:'Licences, T&Cs clarity, RNG audits'},
    {k:'Payout Speed', w:WEIGHTS.payout, why:'Avg hours, fees, limits'},
    {k:'Bonus Value', w:WEIGHTS.bonusValue, why:'Wagering, caps, fairness'},
    {k:'Games', w:WEIGHTS.games, why:'Top providers, variety'},
    {k:'Mobile', w:WEIGHTS.mobile, why:'Core flows usable on mobile'},
    {k:'Support', w:WEIGHTS.support, why:'Chat hours, quality'},
    {k:'Reputation', w:WEIGHTS.reputation, why:'Complaint ratios & resolutions'}
  ];
}