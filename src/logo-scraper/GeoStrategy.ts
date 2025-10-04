export class GeoStrategy {
  private geoStrategies = {
    userAgents: {
      'CA': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'AU': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'DE': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'FI': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15'
    },
    locales: {
      'CA': { locale: 'en-CA', language: 'en-CA,en;q=0.9' },
      'AU': { locale: 'en-AU', language: 'en-AU,en;q=0.9' },
      'DE': { locale: 'de-DE', language: 'de-DE,de;q=0.9,en;q=0.8' },
      'FI': { locale: 'fi-FI', language: 'fi-FI,fi;q=0.9,en;q=0.8' },
      'NO': { locale: 'nb-NO', language: 'nb-NO,nb;q=0.9,en;q=0.8' },
      'SE': { locale: 'sv-SE', language: 'sv-SE,sv;q=0.9,en;q=0.8' }
    },
    commonAllowed: [
      'CA', 'AU', 'NZ', 'NO', 'FI', 'SE', 'DK', 'DE', 'AT', 'CH', 'JP', 'BR', 'MX', 'ZA'
    ]
  };

  getBestCountryForCasino(casino: any) {
    const restricted = casino.restrictedGeos || [];
    const allowed = this.geoStrategies.commonAllowed.filter(country => !restricted.includes(country));
    const preferredOrder = ['CA', 'AU', 'NZ', 'FI', 'NO', 'SE', 'DE', 'AT'];
    for (const preferred of preferredOrder) {
      if (allowed.includes(preferred)) {
        return preferred;
      }
    }
    return allowed[0] || 'CA';
  }

  getHeadersForCountry(country: string) {
    const userAgent = this.geoStrategies.userAgents[country] || this.geoStrategies.userAgents['CA'];
    const locale = this.geoStrategies.locales[country] || this.geoStrategies.locales['CA'];
    return {
      'User-Agent': userAgent,
      'Accept-Language': locale.language,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };
  }
}
