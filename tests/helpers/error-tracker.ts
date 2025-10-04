/**
 * Error Tracker Utility
 * Tracks errors across parallel test workers with a 5-error limit
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ERROR_FILE = path.join(__dirname, '../../test-results/errors.json');
const MAX_ERRORS = 5;

export interface ErrorRecord {
  section: string;
  type: string;
  message: string;
  timestamp: string;
  todos: string[];
}

export interface ErrorState {
  count: number;
  errors: ErrorRecord[];
  stopTesting: boolean;
}

/**
 * Initialize error tracking file
 */
export function initializeErrorTracker(): void {
  const dir = path.dirname(ERROR_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const initialState: ErrorState = {
    count: 0,
    errors: [],
    stopTesting: false
  };
  
  fs.writeFileSync(ERROR_FILE, JSON.stringify(initialState, null, 2));
}

/**
 * Get current error state
 */
export function getErrorState(): ErrorState {
  try {
    if (!fs.existsSync(ERROR_FILE)) {
      initializeErrorTracker();
    }
    const data = fs.readFileSync(ERROR_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading error state:', error);
    return { count: 0, errors: [], stopTesting: false };
  }
}

/**
 * Check if testing should stop (5+ errors)
 */
export function shouldStopTesting(): boolean {
  const state = getErrorState();
  return state.count >= MAX_ERRORS || state.stopTesting;
}

/**
 * Record a new error
 */
export function recordError(error: Omit<ErrorRecord, 'timestamp'>): void {
  const state = getErrorState();
  
  const newError: ErrorRecord = {
    ...error,
    timestamp: new Date().toISOString()
  };
  
  state.errors.push(newError);
  state.count++;
  
  if (state.count >= MAX_ERRORS) {
    state.stopTesting = true;
  }
  
  fs.writeFileSync(ERROR_FILE, JSON.stringify(state, null, 2));
  
  // Log to console for immediate feedback
  console.error(`\n❌ ERROR ${state.count}/${MAX_ERRORS}: ${error.section} - ${error.type}`);
  console.error(`   ${error.message}`);
  if (error.todos.length > 0) {
    console.error('   TODOs:');
    error.todos.forEach(todo => console.error(`   - ${todo}`));
  }
  
  if (state.count >= MAX_ERRORS) {
    console.error('\n🛑 STOPPING: Reached maximum error limit (5 errors)');
  }
}

/**
 * Get error summary report
 */
export function getErrorSummary(): string {
  const state = getErrorState();
  
  if (state.count === 0) {
    return '✅ All sections passed validation!';
  }
  
  let summary = `\n${'='.repeat(80)}\n`;
  summary += `SECTION AUDIT RESULTS - ${state.count} ERROR(S) FOUND\n`;
  summary += `${'='.repeat(80)}\n\n`;
  
  state.errors.forEach((error, index) => {
    summary += `${index + 1}. ${error.section} - ${error.type}\n`;
    summary += `   Time: ${new Date(error.timestamp).toLocaleString()}\n`;
    summary += `   Issue: ${error.message}\n`;
    if (error.todos.length > 0) {
      summary += `   TODOs:\n`;
      error.todos.forEach(todo => summary += `   - ${todo}\n`);
    }
    summary += `\n`;
  });
  
  if (state.stopTesting) {
    summary += `⚠️  Testing stopped after ${state.count} errors (limit: ${MAX_ERRORS})\n`;
  }
  
  summary += `${'='.repeat(80)}\n`;
  
  return summary;
}

/**
 * Reset error tracker (use before test run)
 */
export function resetErrorTracker(): void {
  initializeErrorTracker();
  console.log('✅ Error tracker initialized');
}
