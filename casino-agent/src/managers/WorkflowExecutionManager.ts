/**
 * Workflow Execution Manager
 * Single responsibility: Execute multi-agent workflows
 */

import { MultiAgentCoordinator } from '../MultiAgentCoordinator';
import { PageConfig } from '../SmartAgent365System';

export class WorkflowExecutionManager {
  private coordinator: MultiAgentCoordinator;

  constructor(coordinator: MultiAgentCoordinator) {
    this.coordinator = coordinator;
  }

  async executeWorkflow(pageConfigs: PageConfig[]): Promise<void> {
    console.log('🔄 Starting ultimate workflow execution...');
    console.log(`📋 Processing ${pageConfigs.length} page configurations`);

    for (const config of pageConfigs) {
      await this.executePageWorkflow(config);
    }

    console.log('✅ Ultimate workflow execution completed!');
  }

  private async executePageWorkflow(config: PageConfig): Promise<void> {
    console.log(`\n🎯 Executing workflow for: ${config.pageName}`);
    
    try {
      const result = await this.coordinator.createMultiAgentValidatedPage(config);
      
      if (result.success) {
        console.log(`  ✅ ${config.pageName} - SUCCESS`);
        console.log(`  📄 Output: ${config.outputPath}`);
      } else {
        console.log(`  ❌ ${config.pageName} - FAILED`);
        console.log(`  🔍 Reason: ${result.message}`);
      }
    } catch (error) {
      console.log(`  💥 ${config.pageName} - EXCEPTION`);
      console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async executeSpecificWorkflow(pageName: string, config: PageConfig): Promise<boolean> {
    console.log(`🎯 Executing specific workflow: ${pageName}`);
    
    try {
      const result = await this.coordinator.createMultiAgentValidatedPage(config);
      return result.success;
    } catch (error) {
      console.error(`Workflow execution failed for ${pageName}:`, error);
      return false;
    }
  }

  getCoordinator(): MultiAgentCoordinator {
    return this.coordinator;
  }
}