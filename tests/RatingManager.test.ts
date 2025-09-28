import {computeScore, explain} from '../src/managers/RatingManager';

const sample = {security:9, payout:8.5, bonusValue:7, games:8, mobile:7.5, support:8, reputation:9};
const score = computeScore(sample as any);
console.log('Sample score', score);
console.log('Explain', explain(sample as any));

// Minimal smoke test: score is a number
if(typeof score !== 'number') throw new Error('computeScore must return a number');
