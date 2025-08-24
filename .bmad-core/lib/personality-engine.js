/**
 * BMAD Method v3.0 - Personality Transformation Engine
 * Enables instant transformation between expert agent personas
 */

const agentConfig = require('../config/agents.config.js');

class PersonalityEngine {
  constructor() {
    this.currentAgent = null;
    this.context = {};
    this.orchestrationStack = [];
    this.qualityMetrics = {};
    this.transformationHistory = [];
  }

  /**
   * Transform into a specific agent persona
   */
  async transform(agentId, preserveContext = true) {
    const agent = agentConfig.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Store previous agent in history
    if (this.currentAgent) {
      this.transformationHistory.push({
        agent: this.currentAgent,
        timestamp: new Date(),
        context: preserveContext ? { ...this.context } : {}
      });
    }

    // Load new agent personality
    this.currentAgent = agent;
    
    // Initialize agent-specific tools
    await this.initializeTools(agent);
    
    // Load agent mindset and patterns
    this.loadMindset(agent);
    
    // Apply quality gates
    this.applyQualityGates(agent);

    console.log(`
🎭 TRANSFORMATION COMPLETE
═══════════════════════════════════════
${agent.icon} Now operating as: ${agent.name}
📊 Experience: ${agent.yearsExperience} years
💭 Identity: "${agent.identity}"
🎯 Catchphrase: "${agent.personality.catchphrase}"
═══════════════════════════════════════
    `);

    return agent;
  }

  /**
   * Initialize agent-specific tools
   */
  async initializeTools(agent) {
    const tools = {
      primary: agent.tools.primary,
      secondary: agent.tools.secondary,
      apis: agent.tools.apis || {},
      specialized: agent.tools.specialized || {}
    };

    // Simulate tool activation (in real implementation, would connect to actual tools)
    console.log(`⚡ Activating tools for ${agent.name}:`);
    console.log(`  Primary: ${tools.primary.join(', ')}`);
    console.log(`  Secondary: ${tools.secondary.join(', ')}`);
    
    if (Object.keys(tools.apis).length > 0) {
      console.log(`  APIs: ${Object.keys(tools.apis).join(', ')}`);
    }

    return tools;
  }

  /**
   * Load agent-specific mindset and behavioral patterns
   */
  loadMindset(agent) {
    const mindset = {
      traits: agent.personality.traits,
      style: agent.personality.style,
      instincts: agent.instincts,
      priorities: this.extractPriorities(agent)
    };

    this.currentMindset = mindset;
    
    console.log(`🧠 Mindset loaded:`);
    console.log(`  Traits: ${mindset.traits.join(', ')}`);
    console.log(`  Instincts: ${mindset.instincts.length} behavioral patterns`);
    
    return mindset;
  }

  /**
   * Apply agent-specific quality gates
   */
  applyQualityGates(agent) {
    this.qualityMetrics = agent.qualityGates;
    
    console.log(`✅ Quality gates active:`);
    Object.entries(this.qualityMetrics).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    return this.qualityMetrics;
  }

  /**
   * Execute a multi-agent orchestration
   */
  async orchestrate(orchestrationName, task) {
    const sequence = agentConfig.getOrchestration(orchestrationName);
    if (!sequence) {
      throw new Error(`Orchestration ${orchestrationName} not found`);
    }

    console.log(`
🎼 ORCHESTRATION: ${orchestrationName}
═══════════════════════════════════════
Task: ${task}
Sequence: ${sequence.join(' → ')}
═══════════════════════════════════════
    `);

    const results = [];
    
    for (const agentId of sequence) {
      // Transform to next agent
      await this.transform(agentId, true);
      
      // Execute agent-specific task
      const result = await this.executeAgentTask(task);
      results.push({
        agent: agentId,
        result: result,
        qualityMet: this.validateQuality()
      });
      
      // Pass context to next agent
      this.context = { ...this.context, ...result.context };
    }

    return {
      orchestration: orchestrationName,
      results: results,
      finalContext: this.context
    };
  }

  /**
   * Execute task with current agent personality
   */
  async executeAgentTask(task) {
    if (!this.currentAgent) {
      throw new Error('No agent currently active');
    }

    console.log(`\n${this.currentAgent.icon} ${this.currentAgent.name} executing: ${task}`);
    
    // Apply agent instincts
    for (const instinct of this.currentAgent.instincts) {
      console.log(`  → Applying: ${instinct}`);
    }

    // Simulate task execution with agent expertise
    const result = {
      agent: this.currentAgent.id,
      task: task,
      timestamp: new Date(),
      context: {
        expertise: this.currentAgent.yearsExperience,
        approach: this.currentAgent.personality.style,
        toolsUsed: this.currentAgent.tools.primary
      },
      quality: this.validateQuality()
    };

    return result;
  }

  /**
   * Validate current work against quality gates
   */
  validateQuality() {
    if (!this.qualityMetrics) return { passed: false, reason: 'No quality gates defined' };

    const validation = {
      passed: true,
      metrics: {},
      failures: []
    };

    for (const [metric, requirement] of Object.entries(this.qualityMetrics)) {
      // Simulate quality check (in real implementation, would run actual checks)
      const passed = Math.random() > 0.2; // 80% pass rate for demo
      validation.metrics[metric] = {
        requirement: requirement,
        passed: passed
      };
      
      if (!passed) {
        validation.passed = false;
        validation.failures.push(`${metric}: requires ${requirement}`);
      }
    }

    return validation;
  }

  /**
   * Detect which agent is needed based on input
   */
  detectRequiredAgent(input) {
    return agentConfig.detectAgent(input);
  }

  /**
   * Extract priorities from agent configuration
   */
  extractPriorities(agent) {
    const priorities = [];
    
    if (agent.qualityGates) {
      Object.keys(agent.qualityGates).forEach(gate => {
        priorities.push(gate.replace(/([A-Z])/g, ' $1').toLowerCase());
      });
    }
    
    return priorities;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      currentAgent: this.currentAgent ? {
        id: this.currentAgent.id,
        name: this.currentAgent.name,
        icon: this.currentAgent.icon
      } : null,
      context: this.context,
      orchestrationStack: this.orchestrationStack,
      transformationHistory: this.transformationHistory.map(h => ({
        agent: h.agent.id,
        timestamp: h.timestamp
      })),
      qualityMetrics: this.qualityMetrics
    };
  }

  /**
   * Reset engine to initial state
   */
  reset() {
    this.currentAgent = null;
    this.context = {};
    this.orchestrationStack = [];
    this.qualityMetrics = {};
    this.transformationHistory = [];
    console.log('🔄 Personality Engine reset to initial state');
  }
}

// Singleton instance
let engineInstance = null;

/**
 * Get or create personality engine instance
 */
function getEngine() {
  if (!engineInstance) {
    engineInstance = new PersonalityEngine();
  }
  return engineInstance;
}

/**
 * Quick transformation helper
 */
async function become(agentId) {
  const engine = getEngine();
  return await engine.transform(agentId);
}

/**
 * Quick orchestration helper
 */
async function orchestrate(name, task) {
  const engine = getEngine();
  return await engine.orchestrate(name, task);
}

module.exports = {
  PersonalityEngine,
  getEngine,
  become,
  orchestrate
};