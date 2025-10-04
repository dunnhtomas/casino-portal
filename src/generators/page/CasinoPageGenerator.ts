/**
 * CasinoPageGenerator
 * Single Responsibility: Generate all casino-related pages efficiently
 */

import { CasinoPageFactory, type CasinoPageConfig } from '../../factories/page/CasinoPageFactory';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CasinoPageGenerator {
  private factory: CasinoPageFactory;
  private outputDir: string;

  constructor(outputDir: string = 'src/pages/casinos') {
    this.factory = new CasinoPageFactory();
    this.outputDir = outputDir;
  }

  async generateAllCasinoPages(casinos: CasinoPageConfig[]): Promise<void> {
    console.log(`Generating pages for ${casinos.length} casinos...`);

    for (const casino of casinos) {
      await this.generateCasinoPages(casino);
    }

    console.log('Casino page generation complete!');
  }

  private async generateCasinoPages(casino: CasinoPageConfig): Promise<void> {
    // Create casino directory
    const casinoDir = path.join(this.outputDir, casino.slug);
    await this.ensureDirectoryExists(casinoDir);

    // Generate game pages
    const gamePages = this.factory.createGamePages(casino);

    for (const [fileName, content] of gamePages) {
      const filePath = path.join(casinoDir, fileName);
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Generated: ${filePath}`);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Generate configuration for existing casino data
  static generateCasinoConfigs(): CasinoPageConfig[] {
    const gameTypes = [
      'slots', 'blackjack', 'roulette', 'poker', 'baccarat',
      'craps', 'live-dealer', 'video-poker', 'table-games',
      'progressive-jackpots'
    ];

    const casinos = [
      'aerobet', 'jet4bet', 'kings-chip', 'larabet', 'lucki-casino',
      'malina-casino', 'mr-pacho', 'my-empire', 'n1-bet-casino',
      'rizz-casino', 'rolling-slots', 'rollxo', 'roman-casino',
      'romibet', 'sagaspins', 'samba-slots', 'skyhills', 'slotlair',
      'spellwin', 'spincastle', 'trino', 'unlimluck', 'vipzino',
      'wildrobin-casino', 'willdsino', 'winitbet', 'winrolla', 'wonthere'
    ];

    return casinos.map(casino => ({
      slug: casino,
      name: casino.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      gameTypes,
      features: gameTypes.reduce((acc, gameType) => {
        acc[gameType] = [
          'High-quality graphics',
          'Mobile optimized',
          'Secure gameplay',
          'Fair play certified'
        ];
        return acc;
      }, {} as Record<string, string[]>)
    }));
  }
}