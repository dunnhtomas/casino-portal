import {computeScore} from '../managers/RatingManager';

export function loadReview(casinos:Array<any>, slug:string){
  const c = casinos.find(x=> x.slug === slug);
  if(!c) return null;
  const score = computeScore(c.ratings);
  return {
    ...c,
    _score: score,
    related: [] // placeholder: populate by provider or tag in next iteration
  };
}