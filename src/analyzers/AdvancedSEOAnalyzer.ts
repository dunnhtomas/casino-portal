import { TechnicalSEOAnalyzer } from './TechnicalSEOAnalyzer';
import { PerformanceAnalyzer } from './PerformanceAnalyzer';
import { ContentAnalyzer } from './ContentAnalyzer';
import { CompetitorAnalyzer } from './CompetitorAnalyzer';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { SchemaAnalyzer } from './SchemaAnalyzer';
import { CoreWebVitalsAnalyzer } from './CoreWebVitalsAnalyzer';
import { MobileAnalyzer } from './MobileAnalyzer';
import { SecurityAnalyzer } from './SecurityAnalyzer';
import { LinkProfileAnalyzer } from './LinkProfileAnalyzer';
import { ReportGenerator } from './ReportGenerator';
import { mkdir } from 'fs/promises';
import { writeFileSync } from 'fs';

export class AdvancedSEOAnalyzer {
  private competitors = [
    'casino.ca',
    'askgamblers.com',
    'casino.guru',
    'casinomeister.com',
    'casinolistings.com',
    'onlinecasinos.com',
    'gamblingsites.com',
    'casino.org',
    'vegasslotsonline.com',
    'casinoguide.ca'
  ];

  private technicalSEOAnalyzer = new TechnicalSEOAnalyzer();
  private performanceAnalyzer = new PerformanceAnalyzer();
  private contentAnalyzer = new ContentAnalyzer();
  private competitorAnalyzer = new CompetitorAnalyzer();
  private keywordAnalyzer = new KeywordAnalyzer();
  private schemaAnalyzer = new SchemaAnalyzer();
  private coreWebVitalsAnalyzer = new CoreWebVitalsAnalyzer();
  private mobileAnalyzer = new MobileAnalyzer();
  private securityAnalyzer = new SecurityAnalyzer();
  private linkProfileAnalyzer = new LinkProfileAnalyzer();
  private reportGenerator = new ReportGenerator();

  async executeFullPowerParallelAnalysis() {
    console.log('🚀 Starting Full Power Parallel SEO Analysis...');
    await this.initializeParallelStreams();

    const results: any = {};

    const technicalSEOPromises = this.competitors.map(c => this.technicalSEOAnalyzer.analyze(c));
    const contentAnalysisPromises = this.competitors.map(c => this.contentAnalyzer.analyze(c));
    const competitorAnalysisPromises = this.competitors.map(c => this.competitorAnalyzer.analyze(c));
    const schemaAnalysisPromises = this.competitors.map(c => this.schemaAnalyzer.analyze(c));
    const mobileAnalysisPromises = this.competitors.map(c => this.mobileAnalyzer.analyze(c));
    const securityAnalysisPromises = this.competitors.map(c => this.securityAnalyzer.analyze(c));

    const [
      technicalSEOResults,
      contentAnalysisResults,
      competitorAnalysisResults,
      schemaAnalysisResults,
      mobileAnalysisResults,
      securityAnalysisResults
    ] = await Promise.all([
      Promise.all(technicalSEOPromises),
      Promise.all(contentAnalysisPromises),
      Promise.all(competitorAnalysisPromises),
      Promise.all(schemaAnalysisPromises),
      Promise.all(mobileAnalysisPromises),
      Promise.all(securityAnalysisPromises)
    ]);

    results.technicalSEO = this.mapResults(technicalSEOResults);
    results.contentAnalysis = this.mapResults(contentAnalysisResults);
    results.competitorGaps = this.mapResults(competitorAnalysisResults);
    results.schemaMarkup = this.mapResults(schemaAnalysisResults);
    results.mobileOptimization = this.mapResults(mobileAnalysisResults);
    results.securityAnalysis = this.mapResults(securityAnalysisResults);

    results.performanceMetrics = await this.performanceAnalyzer.analyze(['http://localhost:3000', 'http://localhost:8080']);
    results.keywordOpportunities = this.keywordAnalyzer.analyze();
    results.coreWebVitals = await this.coreWebVitalsAnalyzer.analyze('http://localhost:3000');
    results.linkProfile = this.linkProfileAnalyzer.analyze();

    const masterReport = this.reportGenerator.generate(results);
    const markdownReport = this.reportGenerator.generateMarkdown(masterReport);

    writeFileSync('./analysis-results/MASTER-SEO-ANALYSIS-REPORT.json', JSON.stringify(masterReport, null, 2));
    writeFileSync('./ADVANCED-SEO-ANALYSIS-COMPLETE.md', markdownReport);

    console.log('✅ Full Power Parallel Analysis Complete!');
    return results;
  }

  private async initializeParallelStreams() {
    await mkdir('./analysis-results', { recursive: true });
    await mkdir('./analysis-results/competitors', { recursive: true });
    await mkdir('./analysis-results/technical', { recursive: true });
    await mkdir('./analysis-results/performance', { recursive: true });
    await mkdir('./analysis-results/content', { recursive: true });
    await mkdir('./analysis-results/lighthouse', { recursive: true });
  }

  private mapResults(results: any[]) {
    const mappedResults: { [key: string]: any } = {};
    this.competitors.forEach((competitor, index) => {
      mappedResults[competitor] = results[index];
    });
    return mappedResults;
  }
}
