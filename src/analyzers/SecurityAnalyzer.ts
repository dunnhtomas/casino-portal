import fetch from 'node-fetch';

export class SecurityAnalyzer {
  async analyze(competitor: string) {
    try {
      const response = await fetch(`https://${competitor}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Casino-Portal-Security-Audit/1.0'
        }
      });
      const headers = Object.fromEntries(response.headers.entries());
      return {
        https: response.url.startsWith('https://'),
        hsts: !!headers['strict-transport-security'],
        contentSecurityPolicy: !!headers['content-security-policy'],
        xFrameOptions: !!headers['x-frame-options'],
        xContentTypeOptions: !!headers['x-content-type-options'],
        referrerPolicy: !!headers['referrer-policy'],
        featurePolicy: !!headers['feature-policy'] || !!headers['permissions-policy'],
        securityScore: this.calculateSecurityScore(headers),
        responseHeaders: headers
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  private calculateSecurityScore(headers: { [key: string]: any }) {
    let score = 0;
    if (headers['strict-transport-security']) score += 20;
    if (headers['content-security-policy']) score += 20;
    if (headers['x-frame-options']) score += 15;
    if (headers['x-content-type-options']) score += 15;
    if (headers['referrer-policy']) score += 15;
    if (headers['feature-policy'] || headers['permissions-policy']) score += 15;
    return score;
  }
}
