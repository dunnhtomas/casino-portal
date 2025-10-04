import { SmartAgent365System, PageConfig } from './SmartAgent365System';
import { ArchitectAgent, FrontendAgent, BackendAgent, SEOAgent, QAAgent } from './SpecializedAgents';

/**
 * 🎯 Multi-Agent Coordination System
 * Orchestrates specialized agents working together for perfect page creation
 */
export class MultiAgentCoordinator {
  private smartSystem: SmartAgent365System;
  private agents: {
    architect: ArchitectAgent;
    frontend: FrontendAgent;
    backend: BackendAgent;
    seo: SEOAgent;
    qa: QAAgent;
  };

  constructor(projectPath: string) {
    this.smartSystem = new SmartAgent365System(projectPath);
    this.agents = {
      architect: new ArchitectAgent(this.smartSystem),
      frontend: new FrontendAgent(this.smartSystem),
      backend: new BackendAgent(this.smartSystem),
      seo: new SEOAgent(this.smartSystem),
      qa: new QAAgent(this.smartSystem)
    };
    
    console.log('🎯 MULTI-AGENT COORDINATION SYSTEM INITIALIZED');
    console.log('✅ All specialized agents ready for collaborative development');
  }

  /**
   * Create a page with full multi-agent validation and enhancement
   */
  public async createMultiAgentValidatedPage(config: PageConfig): Promise<MultiAgentResult> {
    console.log(`🎯 MULTI-AGENT PAGE CREATION: ${config.pageName}`);
    console.log('=' .repeat(60));

    const result: MultiAgentResult = {
      success: false,
      pageName: config.pageName,
      agentResults: {},
      finalConfig: config,
      validationSummary: {
        totalErrors: 0,
        totalWarnings: 0,
        agentsPassed: 0,
        agentsTotal: 5
      },
      message: ''
    };

    try {
      // Phase 1: Agent-specific config enhancement
      console.log('📋 Phase 1: Multi-agent config enhancement...');
      let enhancedConfig = { ...config };
      
      enhancedConfig = await this.agents.architect.enhanceConfig(enhancedConfig);
      enhancedConfig = await this.agents.frontend.enhanceConfig(enhancedConfig);
      enhancedConfig = await this.agents.backend.enhanceConfig(enhancedConfig);
      enhancedConfig = await this.agents.seo.enhanceConfig(enhancedConfig);
      enhancedConfig = await this.agents.qa.enhanceConfig(enhancedConfig);
      
      result.finalConfig = enhancedConfig;
      console.log('✅ Config enhanced by all agents');

      // Phase 2: Create initial content
      console.log('🔧 Phase 2: Smart content generation...');
      const pageResult = await this.smartSystem.createValidatedPage(enhancedConfig);
      
      if (!pageResult.success) {
        result.message = `Smart system failed: ${pageResult.message}`;
        return result;
      }

      const content = pageResult.content || '';

      // Phase 3: Multi-agent validation
      console.log('🧠 Phase 3: Multi-agent validation...');
      
      const architectResult = await this.agents.architect.validateContent(content, enhancedConfig);
      const frontendResult = await this.agents.frontend.validateContent(content, enhancedConfig);
      const backendResult = await this.agents.backend.validateContent(content, enhancedConfig);
      const seoResult = await this.agents.seo.validateContent(content, enhancedConfig);
      const qaResult = await this.agents.qa.validateContent(content, enhancedConfig);

      result.agentResults = {
        architect: architectResult,
        frontend: frontendResult,
        backend: backendResult,
        seo: seoResult,
        qa: qaResult
      };

      // Phase 4: Aggregate results
      console.log('📊 Phase 4: Results aggregation...');
      
      const allResults = [architectResult, frontendResult, backendResult, seoResult, qaResult];
      const totalErrors = allResults.reduce((sum, r) => sum + r.errors.length, 0);
      const totalWarnings = allResults.reduce((sum, r) => sum + r.warnings.length, 0);
      const agentsPassed = allResults.filter(r => r.isValid).length;

      result.validationSummary = {
        totalErrors,
        totalWarnings,
        agentsPassed,
        agentsTotal: 5
      };

      // Phase 5: Final verdict
      if (totalErrors === 0) {
        result.success = true;
        result.message = `✅ Multi-agent validation PASSED! ${agentsPassed}/5 agents approved`;
        console.log(`🎉 SUCCESS: ${result.message}`);
      } else {
        result.success = false;
        result.message = `❌ Multi-agent validation found ${totalErrors} errors across ${5 - agentsPassed} agents`;
        console.log(`⚠️ ISSUES: ${result.message}`);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.message = `Multi-agent coordination failed: ${errorMessage}`;
      return result;
    }
  }

  /**
   * Execute full multi-agent workflow on multiple pages
   */
  public async executeMultiAgentWorkflow(configs: PageConfig[]): Promise<MultiAgentWorkflowResult> {
    console.log('🚀 MULTI-AGENT WORKFLOW EXECUTION');
    console.log('=' .repeat(80));
    console.log(`📋 Processing ${configs.length} pages with 5 specialized agents`);
    console.log('');

    const results: MultiAgentResult[] = [];
    const startTime = Date.now();

    for (const config of configs) {
      const result = await this.createMultiAgentValidatedPage(config);
      results.push(result);
      console.log(''); // Add spacing between pages
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalErrors = results.reduce((sum, r) => sum + r.validationSummary.totalErrors, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.validationSummary.totalWarnings, 0);

    const workflowResult: MultiAgentWorkflowResult = {
      totalPages: configs.length,
      successful: successful.length,
      failed: failed.length,
      successRate: Math.round((successful.length / configs.length) * 100),
      totalErrors,
      totalWarnings,
      executionTime: duration,
      results,
      summary: this.generateWorkflowSummary(results)
    };

    this.displayWorkflowResults(workflowResult);
    return workflowResult;
  }

  private generateWorkflowSummary(results: MultiAgentResult[]): string {
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const successRate = Math.round((successful / total) * 100);
    
    return `Multi-agent workflow completed: ${successful}/${total} pages (${successRate}% success rate)`;
  }

  private displayWorkflowResults(workflow: MultiAgentWorkflowResult): void {
    console.log('🎯 MULTI-AGENT WORKFLOW RESULTS');
    console.log('=' .repeat(80));
    console.log(`📊 Success Rate: ${workflow.successRate}% (${workflow.successful}/${workflow.totalPages})`);
    console.log(`⚡ Execution Time: ${workflow.executionTime}s`);
    console.log(`❌ Total Errors: ${workflow.totalErrors}`);
    console.log(`⚠️ Total Warnings: ${workflow.totalWarnings}`);
    console.log('');

    if (workflow.successful > 0) {
      console.log('✅ SUCCESSFUL PAGES:');
      workflow.results.filter(r => r.success).forEach(result => {
        const agentsPassed = result.validationSummary.agentsPassed;
        console.log(`  • ${result.pageName} (${agentsPassed}/5 agents approved)`);
      });
      console.log('');
    }

    if (workflow.failed > 0) {
      console.log('❌ FAILED PAGES:');
      workflow.results.filter(r => !r.success).forEach(result => {
        const errors = result.validationSummary.totalErrors;
        console.log(`  • ${result.pageName} (${errors} errors)`);
      });
      console.log('');
    }

    console.log('🧠 AGENT PERFORMANCE SUMMARY:');
    console.log('  🏗️  Architect Agent: Project structure & architecture');
    console.log('  🎨 Frontend Agent: UI/UX & visual design');  
    console.log('  🗄️  Backend Agent: Data management & logic');
    console.log('  🚀 SEO Agent: Search engine optimization');
    console.log('  🧪 QA Agent: Quality assurance & testing');
    console.log('');
    console.log('🎉 MULTI-AGENT CASINO PORTAL DEVELOPMENT COMPLETE!');
  }
}

// Type definitions
interface MultiAgentResult {
  success: boolean;
  pageName: string;
  agentResults: {
    architect?: ValidationResult;
    frontend?: ValidationResult;
    backend?: ValidationResult;
    seo?: ValidationResult;
    qa?: ValidationResult;
  };
  finalConfig: PageConfig;
  validationSummary: {
    totalErrors: number;
    totalWarnings: number;
    agentsPassed: number;
    agentsTotal: number;
  };
  message: string;
}

interface MultiAgentWorkflowResult {
  totalPages: number;
  successful: number;
  failed: number;
  successRate: number;
  totalErrors: number;
  totalWarnings: number;
  executionTime: string;
  results: MultiAgentResult[];
  summary: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export { MultiAgentResult, MultiAgentWorkflowResult, ValidationResult };