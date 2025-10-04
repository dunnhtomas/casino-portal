import { sortByPayout } from './SortingManager';
import { computeScore } from './RatingManager';
import type { RatingInput } from './RatingManager';

export class CasinoManager {
  getTopThree(casinos: any[], count = 3) {
    const withScore = casinos.map(c => ({ ...c, _score: computeScore(c.ratings as RatingInput) }));
    withScore.sort((a, b) => b._score - a._score);
    return withScore.slice(0, count);
  }

  getFastPayouts(casinos: any[], count = 6) {
    const copy = [...casinos].sort(sortByPayout);
    return copy.slice(0, count);
  }

  getComparisonRows(casinos: any[]) {
    return casinos.map(c => ({
      slug: c.slug,
      brand: c.brand,
      payout: c.payoutSpeedHours || null,
      bonusHeadline: c.bonuses?.welcome?.headline || null,
      score: computeScore(c.ratings as RatingInput)
    }));
  }

  getTopCasinos(casinos: any[], count = 5) {
    const withScore = casinos.map(c => ({ ...c, _score: computeScore(c.ratings as RatingInput) }));
    withScore.sort((a, b) => b._score - a._score);
    return withScore.slice(0, count);
  }

  getRegionData(regions: any[], casinos: any[], regionId: string) {
    const region = regions.find(r => r.id === regionId);
    const local = casinos.filter(c => (c.restrictedGeos || []).indexOf(regionId.toUpperCase()) === -1);
    return {
      region,
      casinos: local
    };
  }

  loadReview(casinos: any[], slug: string) {
    const c = casinos.find(x => x.slug === slug);
    if (!c) return null;
    const score = computeScore(c.ratings);
    return {
      ...c,
      _score: score,
      related: []
    };
  }

  shapeToplist(casinos: any[], filters: { payoutMaxHours?: number, provider?: string } = {}) {
    let out = casinos.slice();
    if (filters.payoutMaxHours !== undefined && filters.payoutMaxHours !== null) {
      out = out.filter(c => typeof c.payoutSpeedHours === 'number' && c.payoutSpeedHours <= filters.payoutMaxHours!);
    }
    if (filters.provider) {
      out = out.filter(c => (c.providers || []).includes(filters.provider));
    }
    out.sort((a, b) => {
      const pa = a.payoutSpeedHours || 9999;
      const pb = b.payoutSpeedHours || 9999;
      if (pa !== pb) return pa - pb;
      return (a.brand || '').localeCompare(b.brand || '');
    });
    return out;
  }
}
