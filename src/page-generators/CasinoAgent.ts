import { NavigationGenerator } from './NavigationGenerator';
import { BonusesPageGenerator } from './BonusesPageGenerator';
import { GamesPageGenerator } from './GamesPageGenerator';
import { BestCasinosPageGenerator } from './BestCasinosPageGenerator';
import { GenericPageGenerator } from './GenericPageGenerator';

export class CasinoPortalExecutableAgent {
  private navigationGenerator: NavigationGenerator;
  private bonusesPageGenerator: BonusesPageGenerator;
  private gamesPageGenerator: GamesPageGenerator;
  private bestCasinosPageGenerator: BestCasinosPageGenerator;
  private genericPageGenerator: GenericPageGenerator;

  constructor(private projectPath: string = 'C:\\Users\\tamir\\Downloads\\cc23') {
    this.navigationGenerator = new NavigationGenerator(this.projectPath);
    this.bonusesPageGenerator = new BonusesPageGenerator(this.projectPath);
    this.gamesPageGenerator = new GamesPageGenerator(this.projectPath);
    this.bestCasinosPageGenerator = new BestCasinosPageGenerator(this.projectPath);
    this.genericPageGenerator = new GenericPageGenerator(this.projectPath);
  }

  async executeAllTasks() {
    console.log('🚀 EXECUTING COMPLETE TODO LIST...');
    await this.navigationGenerator.generate();
    await this.bonusesPageGenerator.generate();
    await this.gamesPageGenerator.generate();
    await this.bestCasinosPageGenerator.generate();
    const additionalPages = [
      { path: 'bonus/index.astro', title: 'Casino Bonus Codes' },
      { path: 'free-games/index.astro', title: 'Free Casino Games' },
      { path: 'payments/index.astro', title: 'Casino Payment Methods' },
      { path: 'mobile/index.astro', title: 'Mobile Casino Guide' },
      { path: 'live-dealer/index.astro', title: 'Live Dealer Casinos' },
      { path: 'slots/index.astro', title: 'Online Slot Games' }
    ];
    for (const page of additionalPages) {
      await this.genericPageGenerator.generate(page);
    }
    console.log('✅ All tasks completed successfully!');
  }
}
