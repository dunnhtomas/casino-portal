import type {RatingInput} from './RatingManager';

export function sortByPayout(a:{payoutSpeedHours?:number}, b:{payoutSpeedHours?:number}){
  const aHours = a.payoutSpeedHours || 999; // default to slow for missing data
  const bHours = b.payoutSpeedHours || 999; // default to slow for missing data
  return aHours - bHours; // ascending -> faster first
}

export function sortByRating(a:{ratings:Partial<RatingInput>}, b:{ratings:Partial<RatingInput>}, computeScore:(r:RatingInput)=>number){
  const scoreA = computeScore(a.ratings as RatingInput);
  const scoreB = computeScore(b.ratings as RatingInput);
  return scoreB - scoreA; // descending
}

export function sortByBonusEV(a:{bonuses:any}, b:{bonuses:any}){
  // placeholder: sort by presence of welcome bonus then by wagering multiplier (lower better)
  const wa = a.bonuses?.welcome?.wagering || '999x';
  const wb = b.bonuses?.welcome?.wagering || '999x';
  const parse = (w:string)=> parseInt(w.replace(/[^0-9]/g,'') || '999',10);
  return parse(wa) - parse(wb);
}