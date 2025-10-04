#!/usr/bin/env node

/**
 * Architecture Compliance Checker
 * Enforces strict OOP principles and file size limits
 * Run: node scripts/check-architecture-compliance.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RULES = {
  FILE_LENGTH: {
    IDEAL: 300,
    WARNING: 400,
    CRITICAL: 500,
    UNACCEPTABLE: 1000
  },
  CLASS_LENGTH: {
    IDEAL: 150,
    WARNING: 200,
    VIOLATION: 200
  },
  FUNCTION_LENGTH: {
    IDEAL: 30,
    WARNING: 40,
    VIOLATION: 40
  }
};

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.astro'];
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  'test-results',
  'playwright-report',
  '.backup.',
  'legacy'
];

class ArchitectureCompliance {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      compliantFiles: 0,
      filesOverLimit: 0,
      filesApproachingLimit: 0
    };
  }

  /**
   * Check if path should be ignored
   */
  shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
  }

  /**
   * Get all source files recursively
   */
  getSourceFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (this.shouldIgnore(filePath)) {
        return;
      }

      if (stat.isDirectory()) {
        this.getSourceFiles(filePath, fileList);
      } else {
        const ext = path.extname(file);
        if (EXTENSIONS.includes(ext)) {
          fileList.push(filePath);
        }
      }
    });

    return fileList;
  }

  /**
   * Count lines in a file
   */
  countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  }

  /**
   * Analyze a single file
   */
  analyzeFile(filePath) {
    const lines = this.countLines(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    this.stats.totalFiles++;

    // Check file length
    if (lines >= RULES.FILE_LENGTH.UNACCEPTABLE) {
      this.violations.push({
        type: 'UNACCEPTABLE_FILE_LENGTH',
        severity: 'CRITICAL',
        file: relativePath,
        lines,
        limit: RULES.FILE_LENGTH.CRITICAL,
        message: `File has ${lines} lines (max ${RULES.FILE_LENGTH.CRITICAL}). This is UNACCEPTABLE!`
      });
      this.stats.filesOverLimit++;
    } else if (lines > RULES.FILE_LENGTH.CRITICAL) {
      this.violations.push({
        type: 'FILE_LENGTH_EXCEEDED',
        severity: 'ERROR',
        file: relativePath,
        lines,
        limit: RULES.FILE_LENGTH.CRITICAL,
        message: `File exceeds ${RULES.FILE_LENGTH.CRITICAL} line limit by ${lines - RULES.FILE_LENGTH.CRITICAL} lines`
      });
      this.stats.filesOverLimit++;
    } else if (lines > RULES.FILE_LENGTH.WARNING) {
      this.warnings.push({
        type: 'FILE_LENGTH_WARNING',
        severity: 'WARNING',
        file: relativePath,
        lines,
        limit: RULES.FILE_LENGTH.CRITICAL,
        message: `File approaching limit (${lines}/${RULES.FILE_LENGTH.CRITICAL} lines). Refactor at ${RULES.FILE_LENGTH.WARNING} lines`
      });
      this.stats.filesApproachingLimit++;
    } else {
      this.stats.compliantFiles++;
    }

    // Check for class length (TypeScript/JSX files)
    if (['.ts', '.tsx'].includes(path.extname(filePath))) {
      this.checkClassLength(filePath, relativePath);
    }

    // Check for function length
    this.checkFunctionLength(filePath, relativePath);
  }

  /**
   * Check class length in file
   */
  checkClassLength(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const classMatches = content.match(/(?:class|interface)\s+\w+[^{]*\{/g);
    
    if (classMatches) {
      // Simple heuristic: check if file is too long and likely contains large class
      const lines = this.countLines(filePath);
      if (lines > RULES.CLASS_LENGTH.VIOLATION) {
        this.violations.push({
          type: 'CLASS_LENGTH_EXCEEDED',
          severity: 'ERROR',
          file: relativePath,
          lines,
          limit: RULES.CLASS_LENGTH.VIOLATION,
          message: `Component/Class exceeds ${RULES.CLASS_LENGTH.VIOLATION} line limit. Split into smaller classes`
        });
      }
    }
  }

  /**
   * Check function length in file
   */
  checkFunctionLength(filePath, relativePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let inFunction = false;
    let functionStart = 0;
    let braceCount = 0;
    let functionName = '';

    lines.forEach((line, index) => {
      // Simple function detection (not perfect but catches most cases)
      const funcMatch = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\(.*\)|async)?\s*(?:=>|\{))/);
      
      if (funcMatch && !inFunction) {
        inFunction = true;
        functionStart = index;
        functionName = funcMatch[1] || funcMatch[2] || 'anonymous';
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      } else if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        
        if (braceCount === 0) {
          const functionLength = index - functionStart + 1;
          
          if (functionLength > RULES.FUNCTION_LENGTH.VIOLATION) {
            this.violations.push({
              type: 'FUNCTION_LENGTH_EXCEEDED',
              severity: 'WARNING',
              file: relativePath,
              function: functionName,
              lines: functionLength,
              startLine: functionStart + 1,
              limit: RULES.FUNCTION_LENGTH.VIOLATION,
              message: `Function '${functionName}' is ${functionLength} lines (max ${RULES.FUNCTION_LENGTH.VIOLATION})`
            });
          }
          
          inFunction = false;
        }
      }
    });
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    const complianceRate = Math.round((this.stats.compliantFiles / this.stats.totalFiles) * 100);
    
    console.log('\n' + '='.repeat(80));
    console.log('🏗️  ARCHITECTURE COMPLIANCE REPORT');
    console.log('='.repeat(80) + '\n');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Files Scanned: ${this.stats.totalFiles}`);
    console.log(`   ✅ Compliant Files: ${this.stats.compliantFiles} (${complianceRate}%)`);
    console.log(`   ❌ Files Over Limit: ${this.stats.filesOverLimit}`);
    console.log(`   ⚠️  Files Approaching Limit: ${this.stats.filesApproachingLimit}\n`);

    // Violations
    if (this.violations.length > 0) {
      console.log('❌ VIOLATIONS FOUND:\n');
      this.violations
        .sort((a, b) => b.lines - a.lines)
        .forEach((violation, index) => {
          console.log(`   ${index + 1}. [${violation.severity}] ${violation.file}`);
          console.log(`      ${violation.message}`);
          if (violation.function) {
            console.log(`      Function: ${violation.function} (line ${violation.startLine})`);
          }
          console.log('');
        });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings
        .sort((a, b) => b.lines - a.lines)
        .forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning.file}`);
          console.log(`      ${warning.message}\n`);
        });
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS:\n');
    
    if (this.stats.filesOverLimit > 0) {
      console.log('   🚨 IMMEDIATE ACTION REQUIRED:');
      console.log('      - Split files exceeding 500 lines immediately');
      console.log('      - Create Manager classes for business logic');
      console.log('      - Extract ViewModels for data transformation\n');
    }

    if (this.stats.filesApproachingLimit > 0) {
      console.log('   ⚠️  PREVENTIVE ACTION:');
      console.log('      - Refactor files approaching 400 lines');
      console.log('      - Plan component splitting strategy');
      console.log('      - Review Single Responsibility Principle\n');
    }

    if (complianceRate === 100) {
      console.log('   ✅ EXCELLENT: All files comply with architecture rules!');
      console.log('      Keep maintaining these standards.\n');
    }

    // Exit code
    console.log('='.repeat(80));
    const exitCode = this.violations.length > 0 ? 1 : 0;
    
    if (exitCode === 1) {
      console.log('❌ COMPLIANCE CHECK FAILED - Fix violations before commit\n');
    } else if (this.warnings.length > 0) {
      console.log('⚠️  COMPLIANCE CHECK PASSED WITH WARNINGS\n');
    } else {
      console.log('✅ COMPLIANCE CHECK PASSED\n');
    }

    return exitCode;
  }

  /**
   * Run compliance check
   */
  run() {
    console.log('🔍 Scanning source files...\n');
    
    const srcPath = path.join(process.cwd(), 'src');
    const files = this.getSourceFiles(srcPath);

    files.forEach(file => this.analyzeFile(file));

    return this.generateReport();
  }
}

// Run if executed directly
const checker = new ArchitectureCompliance();
const exitCode = checker.run();
process.exit(exitCode);

export default ArchitectureCompliance;
