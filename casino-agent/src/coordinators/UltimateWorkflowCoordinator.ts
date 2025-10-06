/**
 * Ultimate Workflow Coordinator
 * Single responsibility: Coordinate ultimate workflow execution and state
 */

import { PageConfig } from '../core/SmartAgent365Core';

export interface WorkflowState {
  currentPhase: string;
  completedSteps: string[];
  pendingSteps: string[];
  errors: string[];
  warnings: string[];
}

export class UltimateWorkflowCoordinator {
  private workflowState: WorkflowState;

  constructor() {
    this.workflowState = {
      currentPhase: 'initialization',
      completedSteps: [],
      pendingSteps: [],
      errors: [],
      warnings: []
    };
  }

  initializeWorkflow(pageConfigs: PageConfig[]): void {
    console.log('🎯 Initializing Ultimate Workflow...');
    
    this.workflowState = {
      currentPhase: 'planning',
      completedSteps: ['initialization'],
      pendingSteps: pageConfigs.map(config => `create-${config.pageName}`),
      errors: [],
      warnings: []
    };

    console.log(`📋 Workflow initialized with ${pageConfigs.length} page creation tasks`);
  }

  startPhase(phaseName: string): void {
    this.workflowState.currentPhase = phaseName;
    console.log(`🔄 Starting phase: ${phaseName}`);
  }

  completeStep(stepName: string): void {
    const index = this.workflowState.pendingSteps.indexOf(stepName);
    if (index > -1) {
      this.workflowState.pendingSteps.splice(index, 1);
      this.workflowState.completedSteps.push(stepName);
      console.log(`✅ Completed step: ${stepName}`);
    }
  }

  addError(error: string): void {
    this.workflowState.errors.push(error);
    console.log(`❌ Workflow error: ${error}`);
  }

  addWarning(warning: string): void {
    this.workflowState.warnings.push(warning);
    console.log(`⚠️  Workflow warning: ${warning}`);
  }

  getWorkflowState(): WorkflowState {
    return { ...this.workflowState };
  }

  getProgress(): number {
    const total = this.workflowState.completedSteps.length + this.workflowState.pendingSteps.length;
    return total > 0 ? (this.workflowState.completedSteps.length / total) * 100 : 0;
  }

  isWorkflowComplete(): boolean {
    return this.workflowState.pendingSteps.length === 0 && this.workflowState.errors.length === 0;
  }

  displayWorkflowStatus(): void {
    console.log('\n🎯 ULTIMATE WORKFLOW STATUS');
    console.log('=' .repeat(50));
    console.log(`Current Phase: ${this.workflowState.currentPhase}`);
    console.log(`Progress: ${this.getProgress().toFixed(1)}%`);
    console.log(`Completed: ${this.workflowState.completedSteps.length}`);
    console.log(`Pending: ${this.workflowState.pendingSteps.length}`);
    console.log(`Errors: ${this.workflowState.errors.length}`);
    console.log(`Warnings: ${this.workflowState.warnings.length}`);
    
    if (this.workflowState.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.workflowState.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('=' .repeat(50));
  }

  resetWorkflow(): void {
    this.workflowState = {
      currentPhase: 'initialization',
      completedSteps: [],
      pendingSteps: [],
      errors: [],
      warnings: []
    };
    console.log('🔄 Workflow reset to initial state');
  }
}