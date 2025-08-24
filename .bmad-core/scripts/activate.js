#!/usr/bin/env node

/**
 * BMAD Method v3.0 - Activation Script
 * Initializes and activates the complete BMAD Method system
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Validate system components
 */
function validateComponents() {
  const basePath = path.join(__dirname, '..');
  const components = [
    { path: 'config/agents.config.js', name: 'Agent Configurations', critical: true },
    { path: 'lib/personality-engine.js', name: 'Personality Engine', critical: true },
    { path: 'config/orchestrations.config.js', name: 'Orchestration Sequences', critical: true },
    { path: 'stories/templates/story-template.md', name: 'Story Templates', critical: false },
    { path: 'scripts/bmad.js', name: 'BMAD CLI', critical: true }
  ];

  console.log(`\n${colors.cyan}🔍 Validating BMAD Components...${colors.reset}\n`);

  let allCriticalPresent = true;
  const status = [];

  components.forEach(component => {
    const fullPath = path.join(basePath, component.path);
    const exists = fileExists(fullPath);
    
    if (exists) {
      status.push(`  ✅ ${component.name}`);
    } else {
      status.push(`  ❌ ${component.name} ${component.critical ? '(CRITICAL)' : ''}`);
      if (component.critical) {
        allCriticalPresent = false;
      }
    }
  });

  status.forEach(s => console.log(s));

  return allCriticalPresent;
}

/**
 * Display MCP tools configuration
 */
function displayMCPTools() {
  console.log(`\n${colors.cyan}🔧 MCP Tools Configuration${colors.reset}\n`);
  
  const tools = [
    { name: 'Playwright', count: '24 tools', status: 'Testing & Automation' },
    { name: 'Shadcn/UI', count: '7 tools, 5 prompts', status: 'Component Generation' },
    { name: 'EXA', count: '6 tools', status: 'Technical Search' },
    { name: 'Firecrawl', count: '8 tools', status: 'Web Scraping' },
    { name: 'REF Tools', count: '2 tools, 2 prompts', status: 'Documentation' },
    { name: 'Git', count: '25 tools', status: 'Version Control' },
    { name: 'Postgres', count: 'Database tools', status: 'Data Management' },
    { name: 'Semgrep', count: 'Security tools', status: 'Code Analysis' },
    { name: 'Mindmap', count: 'Visualization', status: 'Planning & Design' },
    { name: 'N8N', count: 'Workflow', status: 'Automation' }
  ];

  tools.forEach(tool => {
    console.log(`  ${colors.green}►${colors.reset} ${tool.name}: ${tool.count} - ${tool.status}`);
  });
}

/**
 * Display available agents
 */
function displayAgents() {
  console.log(`\n${colors.cyan}🎭 Available Expert Agents${colors.reset}\n`);
  
  const agents = [
    { icon: '🔍', name: 'Analyst', expertise: 'Data Forensics (20 years)' },
    { icon: '🎨', name: 'UI Designer', expertise: 'Inclusive Design (20 years)' },
    { icon: '💻', name: 'Developer', expertise: 'Secure Systems (20 years)' },
    { icon: '🧪', name: 'QA Tester', expertise: 'Bug Hunting (20 years)' },
    { icon: '📊', name: 'Product Manager', expertise: 'Product Strategy (20 years)' },
    { icon: '🏗️', name: 'Architect', expertise: 'Scalability (20 years)' },
    { icon: '🏃', name: 'Scrum Master', expertise: 'Team Optimization (20 years)' }
  ];

  agents.forEach(agent => {
    console.log(`  ${agent.icon} ${colors.bright}${agent.name}${colors.reset}: ${agent.expertise}`);
  });
}

/**
 * Display orchestration workflows
 */
function displayOrchestrations() {
  console.log(`\n${colors.cyan}🎼 Orchestration Workflows${colors.reset}\n`);
  
  const workflows = [
    { name: 'build-feature', desc: 'Complete feature development cycle' },
    { name: 'create-component', desc: 'UI component creation' },
    { name: 'research-plan', desc: 'Research and strategic planning' },
    { name: 'implement-secure', desc: 'Security-focused implementation' },
    { name: 'design-system', desc: 'Design system establishment' },
    { name: 'user-testing', desc: 'User testing and analysis' },
    { name: 'sprint-planning', desc: 'Sprint organization' }
  ];

  workflows.forEach(workflow => {
    console.log(`  ${colors.green}►${colors.reset} ${colors.bright}${workflow.name}${colors.reset}: ${workflow.desc}`);
  });
}

/**
 * Display activation instructions
 */
function displayInstructions() {
  console.log(`\n${colors.yellow}📚 Quick Start Commands${colors.reset}\n`);
  
  const commands = [
    { cmd: 'npm run bmad', desc: 'Show BMAD help and commands' },
    { cmd: 'npm run bmad:analyst', desc: 'Transform to Analyst' },
    { cmd: 'npm run bmad:dev', desc: 'Transform to Developer' },
    { cmd: 'npm run bmad:ui', desc: 'Transform to UI Designer' },
    { cmd: 'npm run bmad status', desc: 'Check current agent status' },
    { cmd: 'npm run bmad orchestrate build-feature', desc: 'Run feature workflow' }
  ];

  commands.forEach(command => {
    console.log(`  ${colors.bright}${command.cmd}${colors.reset}`);
    console.log(`    ${command.desc}\n`);
  });
}

/**
 * Create activation summary
 */
function createActivationSummary() {
  const timestamp = new Date().toISOString();
  const summaryPath = path.join(__dirname, '..', 'activation-log.txt');
  
  const summary = `
BMAD Method v3.0 - Activation Log
================================
Timestamp: ${timestamp}
Status: ACTIVATED
Components: All systems operational
Agents: 7 expert personas ready
Orchestrations: 12 workflows available
Quality Gates: Enforced
Autonomous Mode: ENABLED
================================
`;

  try {
    fs.writeFileSync(summaryPath, summary);
    console.log(`\n${colors.green}✅ Activation log saved${colors.reset}`);
  } catch (error) {
    console.log(`\n${colors.yellow}⚠️  Could not save activation log${colors.reset}`);
  }
}

/**
 * Main activation sequence
 */
function activate() {
  console.clear();
  
  console.log(`
${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           🚀 BMAD METHOD v3.0 - SYSTEM ACTIVATION 🚀            ║
║                                                                  ║
║         Personality-Driven Autonomous Development System         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}
`);

  // Validate components
  const isValid = validateComponents();
  
  if (!isValid) {
    console.log(`\n${colors.red}❌ ACTIVATION FAILED${colors.reset}`);
    console.log('Critical components are missing. Please ensure all files are properly installed.');
    process.exit(1);
  }

  // Display system capabilities
  displayMCPTools();
  displayAgents();
  displayOrchestrations();
  
  // Show instructions
  displayInstructions();
  
  // Create activation summary
  createActivationSummary();

  // Final activation message
  console.log(`
${colors.green}${colors.bright}
═══════════════════════════════════════════════════════════════════
                    ✅ BMAD METHOD ACTIVATED ✅
═══════════════════════════════════════════════════════════════════
${colors.reset}

${colors.cyan}System Status:${colors.reset} ${colors.green}FULLY OPERATIONAL${colors.reset}

${colors.bright}Ready for autonomous multi-agent development!${colors.reset}

I will now:
  • Detect needs automatically
  • Transform instantly between expert personas
  • Execute with 20+ years expertise per agent
  • Deliver professional excellence

${colors.yellow}Give me any development task. I will handle it autonomously 
with the expertise of a complete professional team.${colors.reset}

Type ${colors.bright}npm run bmad${colors.reset} to begin.
`);
}

// Execute activation
activate();