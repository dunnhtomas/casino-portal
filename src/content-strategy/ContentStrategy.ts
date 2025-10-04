import { OverviewGenerator } from './OverviewGenerator';
import { ContentTypeBreakdownGenerator } from './ContentTypeBreakdownGenerator';
import { KeywordStrategyGenerator } from './KeywordStrategyGenerator';
import { TechnicalRequirementsGenerator } from './TechnicalRequirementsGenerator';
import { DetailedCalendarGenerator } from './DetailedCalendarGenerator';
import { QualityGuidelinesGenerator } from './QualityGuidelinesGenerator';
import { ImplementationPhasesGenerator } from './ImplementationPhasesGenerator';
import { writeFileSync } from 'fs';

export class CasinoContentStrategy {
  private overviewGenerator = new OverviewGenerator();
  private contentTypeBreakdownGenerator = new ContentTypeBreakdownGenerator();
  private keywordStrategyGenerator: KeywordStrategyGenerator;
  private technicalRequirementsGenerator = new TechnicalRequirementsGenerator();
  private detailedCalendarGenerator = new DetailedCalendarGenerator();
  private qualityGuidelinesGenerator = new QualityGuidelinesGenerator();
  private implementationPhasesGenerator = new ImplementationPhasesGenerator();

  constructor(keywordCategories: any) {
    this.keywordStrategyGenerator = new KeywordStrategyGenerator(keywordCategories);
  }

  async generateContentPlan() {
    console.log('🎯 Generating comprehensive content strategy for 2000+ pages...');
    const plan = {
      overview: this.overviewGenerator.generate(),
      contentTypes: this.contentTypeBreakdownGenerator.generate(),
      keywordStrategy: this.keywordStrategyGenerator.generate(),
      technicalRequirements: this.technicalRequirementsGenerator.generate(),
      contentCalendar: this.detailedCalendarGenerator.generate(),
      qualityGuidelines: this.qualityGuidelinesGenerator.generate(),
      implementationPhases: this.implementationPhasesGenerator.generate()
    };
    writeFileSync('./content-strategy/master-content-plan.json', JSON.stringify(plan, null, 2));
    return plan;
  }
}
