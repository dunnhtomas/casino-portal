/**
 * Page Configuration Manager
 * Single responsibility: Manage page configuration loading and access
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { PageConfig } from '../SmartAgent365System';

interface PageConfigData {
  ultimatePageConfigs: Record<string, PageConfig>;
}

export class PageConfigurationManager {
  private configPath: string;
  private configs: PageConfigData | null = null;

  constructor() {
    this.configPath = path.join(__dirname, '../config/pageConfigurations.json');
  }

  async loadConfigurations(): Promise<void> {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      this.configs = JSON.parse(configContent);
    } catch (error) {
      console.error('Failed to load page configurations:', error);
      this.configs = { ultimatePageConfigs: {} };
    }
  }

  async getPageConfig(pageName: string): Promise<PageConfig | null> {
    if (!this.configs) {
      await this.loadConfigurations();
    }
    
    return this.configs?.ultimatePageConfigs[pageName.toLowerCase()] || null;
  }

  async getAllPageConfigs(): Promise<PageConfig[]> {
    if (!this.configs) {
      await this.loadConfigurations();
    }
    
    return Object.values(this.configs?.ultimatePageConfigs || {});
  }

  async getAvailablePages(): Promise<string[]> {
    if (!this.configs) {
      await this.loadConfigurations();
    }
    
    return Object.keys(this.configs?.ultimatePageConfigs || {});
  }

  async updatePageConfig(pageName: string, config: PageConfig): Promise<void> {
    if (!this.configs) {
      await this.loadConfigurations();
    }
    
    if (this.configs) {
      this.configs.ultimatePageConfigs[pageName.toLowerCase()] = config;
      await this.saveConfigurations();
    }
  }

  private async saveConfigurations(): Promise<void> {
    if (this.configs) {
      try {
        await fs.writeFile(
          this.configPath,
          JSON.stringify(this.configs, null, 2),
          'utf-8'
        );
      } catch (error) {
        console.error('Failed to save page configurations:', error);
      }
    }
  }
}