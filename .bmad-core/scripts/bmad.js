#!/usr/bin/env node

/**
 * BMAD Method v3.0 - Main CLI Script
 * Command-line interface for BMAD agent transformations and orchestrations
 */

const path = require('path');
const { PersonalityEngine } = require('../lib/personality-engine.js');
const orchestrationConfig = require('../config/orchestrations.config.js');
const agentConfig = require('../config/agents.config.js');

// Initialize personality engine
const engine = new PersonalityEngine();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

/**
 * Display help information
 */
function showHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚀 BMAD METHOD v3.0 CLI                      ║
╚══════════════════════════════════════════════════════════════════╝

USAGE:
  npm run bmad [command] [options]

COMMANDS:
  transform <agent>    Transform into a specific agent persona
  orchestrate <name>   Execute a multi-agent orchestration
  status              Show current engine status
  reset               Reset engine to initial state
  list-agents         List all available agents
  list-workflows      List all orchestration workflows
  help                Show this help message

QUICK AGENT COMMANDS:
  npm run bmad:analyst     Transform to Data Forensics Analyst
  npm run bmad:ui          Transform to Inclusive UI Designer
  npm run bmad:dev         Transform to Secure Systems Developer
  npm run bmad:qa          Transform to Bug Hunter QA Specialist
  npm run bmad:pm          Transform to Product Strategy Manager
  npm run bmad:architect   Transform to Scalability Architect
  npm run bmad:scrum       Transform to Agile Scrum Master

ORCHESTRATION EXAMPLES:
  npm run bmad orchestrate build-feature
  npm run bmad orchestrate create-component
  npm run bmad orchestrate research-plan

═══════════════════════════════════════════════════════════════════
  `);
}

/**
 * List all available agents
 */
function listAgents() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                     AVAILABLE BMAD AGENTS                       ║
╚══════════════════════════════════════════════════════════════════╝
`);
  
  const agents = agentConfig.agents;
  Object.values(agents).forEach(agent => {
    console.log(`${agent.icon} ${agent.name} (${agent.id})`);
    console.log(`   Experience: ${agent.yearsExperience} years`);
    console.log(`   Identity: "${agent.identity}"`);
    console.log(`   Primary Tools: ${agent.tools.primary.join(', ')}`);
    console.log('');
  });
}

/**
 * List all orchestration workflows
 */
function listWorkflows() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                  ORCHESTRATION WORKFLOWS                        ║
╚══════════════════════════════════════════════════════════════════╝
`);
  
  const workflows = orchestrationConfig.orchestrations;
  Object.entries(workflows).forEach(([key, workflow]) => {
    console.log(`📋 ${workflow.name} (${key})`);
    console.log(`   ${workflow.description}`);
    console.log(`   Sequence: ${workflow.sequence.join(' → ')}`);
    if (workflow.phases) {
      console.log(`   Phases: ${Object.keys(workflow.phases).join(', ')}`);
    }
    console.log('');
  });
}

/**
 * Transform to a specific agent
 */
async function transformToAgent(agentId) {
  if (!agentId) {
    console.error('❌ Error: Agent ID required');
    console.log('Available agents:');
    Object.keys(agentConfig.agents).forEach(id => {
      console.log(`  - ${id}`);
    });
    return;
  }

  try {
    const agent = await engine.transform(agentId);
    console.log(`
✅ Transformation successful!
You are now operating as ${agent.name}
Use 'npm run bmad status' to see current state
    `);
  } catch (error) {
    console.error(`❌ Transformation failed: ${error.message}`);
  }
}

/**
 * Execute an orchestration
 */
async function executeOrchestration(orchestrationName) {
  if (!orchestrationName) {
    console.error('❌ Error: Orchestration name required');
    console.log('Available orchestrations:');
    orchestrationConfig.listOrchestrations().forEach(name => {
      console.log(`  - ${name}`);
    });
    return;
  }

  const orchestration = orchestrationConfig.getOrchestration(orchestrationName);
  if (!orchestration) {
    console.error(`❌ Orchestration '${orchestrationName}' not found`);
    return;
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    EXECUTING ORCHESTRATION                      ║
╚══════════════════════════════════════════════════════════════════╝

📋 ${orchestration.name}
📝 ${orchestration.description}
🔄 Sequence: ${orchestration.sequence.join(' → ')}
`);

  // Simulate orchestration execution
  for (const agentId of orchestration.sequence) {
    console.log(`\n⏳ Transforming to ${agentId}...`);
    await engine.transform(agentId);
    
    // Simulate work being done
    console.log(`   ✅ ${agentConfig.getAgent(agentId).name} phase complete`);
    
    // Check quality gates if defined
    if (orchestration.qualityCheckpoints) {
      const phaseComplete = Object.keys(orchestration.phases || {}).find(phase => 
        orchestration.phases[phase].includes(agentId)
      );
      if (phaseComplete && orchestration.qualityCheckpoints[`after${phaseComplete.charAt(0).toUpperCase() + phaseComplete.slice(1)}`]) {
        console.log(`   🔍 Quality checkpoint validation...`);
      }
    }
  }

  console.log(`
═══════════════════════════════════════════════════════════════════
✅ ORCHESTRATION COMPLETE: ${orchestration.name}
═══════════════════════════════════════════════════════════════════
`);
}

/**
 * Show current engine status
 */
function showStatus() {
  const status = engine.getStatus();
  
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                     BMAD ENGINE STATUS                          ║
╚══════════════════════════════════════════════════════════════════╝
`);

  if (status.currentAgent) {
    console.log(`Current Agent: ${status.currentAgent.icon} ${status.currentAgent.name}`);
  } else {
    console.log('Current Agent: None (Initial State)');
  }

  if (status.transformationHistory.length > 0) {
    console.log('\nTransformation History:');
    status.transformationHistory.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.agent} at ${new Date(h.timestamp).toLocaleTimeString()}`);
    });
  }

  if (Object.keys(status.qualityMetrics).length > 0) {
    console.log('\nActive Quality Gates:');
    Object.entries(status.qualityMetrics).forEach(([metric, value]) => {
      console.log(`  - ${metric}: ${value}`);
    });
  }

  if (Object.keys(status.context).length > 0) {
    console.log('\nContext Data:');
    console.log(JSON.stringify(status.context, null, 2));
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
}

/**
 * Reset the engine
 */
function resetEngine() {
  engine.reset();
  console.log(`
✅ BMAD Engine has been reset to initial state
All agent transformations and context cleared
`);
}

/**
 * Main execution
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║            🚀 BMAD METHOD v3.0 - AUTONOMOUS AGENTS              ║
╚══════════════════════════════════════════════════════════════════╝
`);

  switch (command) {
    case 'transform':
      await transformToAgent(param);
      break;
    
    case 'orchestrate':
      await executeOrchestration(param);
      break;
    
    case 'status':
      showStatus();
      break;
    
    case 'reset':
      resetEngine();
      break;
    
    case 'list-agents':
      listAgents();
      break;
    
    case 'list-workflows':
      listWorkflows();
      break;
    
    case 'help':
    case undefined:
      showHelp();
      break;
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
  }
}

// Execute main function
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});