import type {RatingInput} from '../managers/RatingManager';
import {computeScore} from '../managers/RatingManager';
import {sortByPayout} from '../managers/SortingManager';

export function getTopThree(casinos:Array<any>, count = 3){
  const withScore = casinos.map(c=> ({...c, _score: computeScore(c.ratings as RatingInput)}));
  withScore.sort((a,b)=> b._score - a._score);
  return withScore.slice(0,count);
}

export function getFastPayouts(casinos:Array<any>, count = 6){
  const copy = [...casinos].sort(sortByPayout);
  return copy.slice(0,count);
}

export function getComparisonRows(casinos:Array<any>){
  return casinos.map(c=>({
    slug: c.slug,
    brand: c.brand,
    payout: c.payoutSpeedHours || null,
    bonusHeadline: c.bonuses?.welcome?.headline || null,
    score: computeScore(c.ratings as RatingInput)
  }));
}

export function getTopCasinos(casinos:Array<any>, count = 5){
  const withScore = casinos.map(c=> ({...c, _score: computeScore(c.ratings as RatingInput)}));
  withScore.sort((a,b)=> b._score - a._score);
  return withScore.slice(0,count);
}