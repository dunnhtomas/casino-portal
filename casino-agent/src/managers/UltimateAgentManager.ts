/**
 * Ultimate Agent Manager
 * Single responsibility: Coordinate ultimate agent operations
 * REPLACES: UltimateSmartAgent.ts (391 lines) god class
 */

import { MultiAgentCoordinator } from '../MultiAgentCoordinator';
import { PageConfigurationManager } from './PageConfigurationManager';
import { WorkflowExecutionManager } from './WorkflowExecutionManager';
import { CapabilitiesManager } from './CapabilitiesManager';
import { UltimateWorkflowCoordinator } from '../coordinators/UltimateWorkflowCoordinator';
import { PageConfig } from '../SmartAgent365System';

export class UltimateAgentManager {
  private coordinator: MultiAgentCoordinator;
  private configManager: PageConfigurationManager;
  private workflowManager: WorkflowExecutionManager;
  private capabilitiesManager: CapabilitiesManager;
  private workflowCoordinator: UltimateWorkflowCoordinator;
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || 'C:\\Users\\tamir\\Downloads\\cc23';
    this.coordinator = new MultiAgentCoordinator(this.projectPath);
    this.configManager = new PageConfigurationManager();
    this.workflowManager = new WorkflowExecutionManager(this.coordinator);
    this.capabilitiesManager = new CapabilitiesManager();
    this.workflowCoordinator = new UltimateWorkflowCoordinator();
    
    console.log('🎯 ULTIMATE AGENT MANAGER INITIALIZED');
    console.log('🤖 Multi-agent team ready for perfect development execution');
  }

  async executeUltimateWorkflow(): Promise<void> {
    console.log('🚀 ULTIMATE SMART AGENT EXECUTION STARTED');
    console.log('=' .repeat(80));
    console.log('🧠 Deploying 5 specialized agents for perfect casino portal development');
    
    const pageConfigs = await this.configManager.getAllPageConfigs();
    this.workflowCoordinator.initializeWorkflow(pageConfigs);
    
    await this.workflowManager.executeWorkflow(pageConfigs);
    
    if (this.workflowCoordinator.isWorkflowComplete()) {
      console.log('\n🎉 ULTIMATE WORKFLOW COMPLETED SUCCESSFULLY!');
    } else {
      this.workflowCoordinator.displayWorkflowStatus();
    }
  }

  async createUltimatePage(pageName: string): Promise<void> {
    const config = await this.configManager.getPageConfig(pageName);
    if (!config) {
      console.log(`❌ Unknown page: ${pageName}`);
      const availablePages = await this.configManager.getAvailablePages();
      console.log(`Available pages: ${availablePages.join(', ')}`);
      return;
    }

    this.workflowCoordinator.startPhase(`create-${pageName}`);
    
    try {
      // Note: Type compatibility issue with MultiAgentCoordinator.createMultiAgentValidatedPage
      // This needs to be resolved by updating the PageConfig interface compatibility
      const success = await this.workflowManager.executeSpecificWorkflow(pageName, config);
      
      if (success) {
        this.workflowCoordinator.completeStep(`create-${pageName}`);
        console.log(`\n🎉 SUCCESS: ${config.pageName} created!`);
        console.log(`📄 File: ${config.outputPath}`);
        console.log(`🔗 URL: ${config.path}`);
      } else {
        this.workflowCoordinator.addError(`Failed to create ${config.pageName}`);
        console.log(`\n❌ FAILED: ${config.pageName}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.workflowCoordinator.addError(`Exception creating ${pageName}: ${errorMessage}`);
      console.log(`\n💥 EXCEPTION creating ${pageName}:`);
      console.log(error);
    }
  }

  showUltimateCapabilities(): void {
    this.capabilitiesManager.displayCapabilities();
  }

  getProjectPath(): string {
    return this.projectPath;
  }

  getCoordinator(): MultiAgentCoordinator {
    return this.coordinator;
  }

  getWorkflowState(): any {
    return this.workflowCoordinator.getWorkflowState();
  }

  displayStatus(): void {
    this.workflowCoordinator.displayWorkflowStatus();
  }
}