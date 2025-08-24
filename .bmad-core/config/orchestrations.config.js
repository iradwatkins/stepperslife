/**
 * BMAD Method v3.0 - Orchestration Sequences Configuration
 * Defines multi-agent workflows for complex tasks
 */

const orchestrations = {
  /**
   * Feature Development Workflows
   */
  'build-feature': {
    name: 'Complete Feature Development',
    description: 'Full feature development from research to deployment',
    sequence: ['analyst', 'product-manager', 'architect', 'ui-designer', 'developer', 'qa-tester'],
    phases: {
      research: ['analyst'],
      planning: ['product-manager', 'architect'],
      implementation: ['ui-designer', 'developer'],
      validation: ['qa-tester']
    },
    qualityCheckpoints: {
      afterResearch: ['data_validated', 'requirements_clear'],
      afterPlanning: ['architecture_approved', 'user_stories_complete'],
      afterImplementation: ['code_complete', 'ui_accessible'],
      afterValidation: ['tests_passing', 'security_verified']
    }
  },

  'create-component': {
    name: 'Component Creation',
    description: 'Design and implement a new UI component',
    sequence: ['ui-designer', 'developer', 'qa-tester'],
    phases: {
      design: ['ui-designer'],
      build: ['developer'],
      test: ['qa-tester']
    },
    deliverables: ['component_design', 'component_code', 'component_tests', 'documentation']
  },

  'research-plan': {
    name: 'Research and Planning',
    description: 'Comprehensive research and strategic planning',
    sequence: ['analyst', 'product-manager', 'architect'],
    phases: {
      discovery: ['analyst'],
      strategy: ['product-manager'],
      technical: ['architect']
    },
    outputs: ['research_report', 'product_strategy', 'technical_design']
  },

  'implement-secure': {
    name: 'Secure Implementation',
    description: 'Security-focused development and testing',
    sequence: ['developer', 'qa-tester'],
    phases: {
      secure_coding: ['developer'],
      security_testing: ['qa-tester']
    },
    securityChecks: ['vulnerability_scan', 'penetration_test', 'code_review']
  },

  'design-system': {
    name: 'Design System Creation',
    description: 'Establish comprehensive design system',
    sequence: ['architect', 'ui-designer', 'developer'],
    phases: {
      architecture: ['architect'],
      design: ['ui-designer'],
      implementation: ['developer']
    },
    components: ['design_tokens', 'component_library', 'documentation', 'guidelines']
  },

  'user-testing': {
    name: 'User Testing Cycle',
    description: 'Complete user testing and analysis',
    sequence: ['ui-designer', 'qa-tester', 'analyst'],
    phases: {
      preparation: ['ui-designer'],
      execution: ['qa-tester'],
      analysis: ['analyst']
    },
    metrics: ['usability_score', 'accessibility_rating', 'performance_metrics']
  },

  'sprint-planning': {
    name: 'Sprint Planning Session',
    description: 'Plan and organize sprint work',
    sequence: ['scrum-master', 'product-manager', 'architect'],
    phases: {
      backlog: ['product-manager'],
      technical: ['architect'],
      coordination: ['scrum-master']
    },
    artifacts: ['sprint_backlog', 'story_points', 'dependency_map']
  },

  /**
   * Emergency Response Workflows
   */
  'hotfix': {
    name: 'Emergency Hotfix',
    description: 'Rapid fix for production issue',
    sequence: ['developer', 'qa-tester'],
    phases: {
      fix: ['developer'],
      verify: ['qa-tester']
    },
    urgency: 'critical',
    skipChecks: ['full_test_suite'],
    requiredChecks: ['smoke_tests', 'rollback_plan']
  },

  'incident-response': {
    name: 'Incident Response',
    description: 'Respond to production incident',
    sequence: ['analyst', 'developer', 'qa-tester', 'scrum-master'],
    phases: {
      investigate: ['analyst'],
      fix: ['developer'],
      verify: ['qa-tester'],
      communicate: ['scrum-master']
    },
    timeline: 'immediate',
    documentation: ['incident_report', 'root_cause', 'prevention_plan']
  },

  /**
   * Strategic Workflows
   */
  'mvp-launch': {
    name: 'MVP Launch',
    description: 'Minimum Viable Product development',
    sequence: ['product-manager', 'architect', 'ui-designer', 'developer', 'qa-tester'],
    phases: {
      definition: ['product-manager'],
      architecture: ['architect'],
      prototype: ['ui-designer', 'developer'],
      validation: ['qa-tester']
    },
    milestones: ['concept_validation', 'prototype_complete', 'user_feedback', 'launch_ready']
  },

  'technical-debt': {
    name: 'Technical Debt Resolution',
    description: 'Address and resolve technical debt',
    sequence: ['analyst', 'architect', 'developer', 'qa-tester'],
    phases: {
      assessment: ['analyst'],
      planning: ['architect'],
      refactoring: ['developer'],
      validation: ['qa-tester']
    },
    priorities: ['performance', 'maintainability', 'security', 'scalability']
  },

  'accessibility-audit': {
    name: 'Accessibility Audit',
    description: 'Comprehensive accessibility review and fixes',
    sequence: ['ui-designer', 'developer', 'qa-tester'],
    phases: {
      audit: ['ui-designer'],
      remediation: ['developer'],
      verification: ['qa-tester']
    },
    standards: ['WCAG_2.1_AA', 'Section_508', 'ADA_compliance']
  }
};

/**
 * Workflow selection logic
 */
const workflowSelector = {
  selectByKeywords: (input) => {
    const keywords = {
      'new feature': 'build-feature',
      'create component': 'create-component',
      'research': 'research-plan',
      'security': 'implement-secure',
      'design system': 'design-system',
      'user testing': 'user-testing',
      'sprint': 'sprint-planning',
      'hotfix': 'hotfix',
      'incident': 'incident-response',
      'mvp': 'mvp-launch',
      'technical debt': 'technical-debt',
      'accessibility': 'accessibility-audit'
    };

    const lowered = input.toLowerCase();
    for (const [keyword, workflow] of Object.entries(keywords)) {
      if (lowered.includes(keyword)) {
        return orchestrations[workflow];
      }
    }
    return null;
  },

  selectByComplexity: (taskCount) => {
    if (taskCount <= 2) return orchestrations['create-component'];
    if (taskCount <= 4) return orchestrations['implement-secure'];
    if (taskCount <= 6) return orchestrations['build-feature'];
    return orchestrations['mvp-launch'];
  },

  selectByUrgency: (urgencyLevel) => {
    const urgencyMap = {
      critical: 'hotfix',
      high: 'incident-response',
      medium: 'sprint-planning',
      low: 'technical-debt'
    };
    return orchestrations[urgencyMap[urgencyLevel]] || orchestrations['sprint-planning'];
  }
};

/**
 * Orchestration execution helpers
 */
const executionHelpers = {
  /**
   * Get next agent in sequence
   */
  getNextAgent: (workflow, currentAgent) => {
    const index = workflow.sequence.indexOf(currentAgent);
    if (index === -1 || index === workflow.sequence.length - 1) {
      return null;
    }
    return workflow.sequence[index + 1];
  },

  /**
   * Check if phase is complete
   */
  isPhaseComplete: (workflow, phase, completedAgents) => {
    const phaseAgents = workflow.phases[phase];
    return phaseAgents.every(agent => completedAgents.includes(agent));
  },

  /**
   * Get current phase
   */
  getCurrentPhase: (workflow, completedAgents) => {
    for (const [phase, agents] of Object.entries(workflow.phases)) {
      if (!agents.every(agent => completedAgents.includes(agent))) {
        return phase;
      }
    }
    return 'completed';
  },

  /**
   * Validate quality checkpoint
   */
  validateCheckpoint: (workflow, checkpoint) => {
    if (!workflow.qualityCheckpoints) return true;
    const checks = workflow.qualityCheckpoints[checkpoint];
    if (!checks) return true;
    
    // In real implementation, would run actual checks
    console.log(`Validating checkpoint: ${checkpoint}`);
    console.log(`Required checks: ${checks.join(', ')}`);
    return true;
  }
};

module.exports = {
  orchestrations,
  workflowSelector,
  executionHelpers,
  
  // Quick access functions
  getOrchestration: (name) => orchestrations[name],
  listOrchestrations: () => Object.keys(orchestrations),
  getOrchestrationInfo: (name) => {
    const orch = orchestrations[name];
    if (!orch) return null;
    return {
      name: orch.name,
      description: orch.description,
      agentCount: orch.sequence.length,
      phases: Object.keys(orch.phases || {})
    };
  }
};