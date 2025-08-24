/**
 * BMAD Method v3.0 - Actual Tools Configuration
 * Maps desired tools to what's actually available in the environment
 */

const actualTools = {
  /**
   * Currently Available Tools
   */
  available: {
    // Built-in Claude Code tools
    builtIn: [
      'Bash',           // Execute bash commands
      'Read',           // Read files
      'Write',          // Write files
      'Edit',           // Edit files
      'MultiEdit',      // Multiple edits
      'Grep',           // Search with ripgrep
      'Glob',           // File pattern matching
      'LS',             // List files
      'WebSearch',      // Web search
      'WebFetch',       // Fetch web content
      'TodoWrite',      // Task management
      'NotebookEdit',   // Jupyter notebooks
      'Task',           // Launch specialized agents
      'BashOutput',     // Get bash output
      'KillBash'        // Kill bash process
    ],
    
    // MCP IDE tools (actually available)
    mcp: [
      'mcp__ide__getDiagnostics',  // Get language diagnostics
      'mcp__ide__executeCode'       // Execute code in Jupyter
    ],
    
    // VS Code extensions (installed)
    vscodeExtensions: [
      'anthropic.claude-code',
      'dbaeumer.vscode-eslint',
      'eamodio.gitlens',
      'esbenp.prettier-vscode',
      'usernamehw.errorlens',
      'bradlc.vscode-tailwindcss',
      'ms-azuretools.vscode-docker',
      'sonarsource.sonarlint-vscode'
    ]
  },

  /**
   * Tool Mapping - Maps BMAD agent tools to actual available tools
   */
  mapping: {
    // Analyst tools mapping
    'EXA': 'WebSearch',           // Use WebSearch instead of EXA
    'Firecrawl': 'WebFetch',      // Use WebFetch instead of Firecrawl
    'Postgres': 'Bash',           // Use Bash for database operations
    'JSON Viewer': 'Read',        // Use Read for JSON files
    'Bookmarks': 'TodoWrite',     // Use TodoWrite for bookmarking
    
    // UI Designer tools mapping
    'Shadcn/UI': 'Write',         // Generate components with Write
    'Playwright': 'Bash',         // Run Playwright via Bash
    'Color Picker': 'Edit',       // Edit color values
    'Live Server': 'Bash',        // Start server via Bash
    
    // Developer tools mapping
    'Git': 'Bash',                // Git commands via Bash
    'Semgrep': 'Bash',            // Run Semgrep via Bash if installed
    'ESLint': 'mcp__ide__getDiagnostics', // Use IDE diagnostics
    'Error Lens': 'mcp__ide__getDiagnostics',
    'Coverage Gutters': 'Bash',   // Run coverage via Bash
    'GitLens': 'Bash',            // Git info via Bash
    
    // QA Tester tools mapping
    'Test Explorer': 'Bash',      // Run tests via Bash
    
    // PM tools mapping
    'Mindmap': 'Write',           // Create mindmap files
    'REF Tools': 'Write',         // Documentation generation
    'Markdown Editor': 'Edit',    // Edit markdown files
    'TODO Tree': 'TodoWrite',     // Task management
    
    // Architect tools mapping
    'PlantUML': 'Write',          // Generate PlantUML files
    'Dependency Graph': 'Bash',   // Analyze dependencies via Bash
    
    // Scrum Master tools mapping
    'Context7': 'Read'            // Read context files
  },

  /**
   * Tool Capabilities - What each actual tool can do
   */
  capabilities: {
    WebSearch: {
      canDo: ['Search current information', 'Research topics', 'Find documentation'],
      limitations: ['US only', 'No domain filtering in some regions']
    },
    WebFetch: {
      canDo: ['Fetch web pages', 'Convert HTML to markdown', 'Analyze content'],
      limitations: ['Read-only', 'May be rate limited']
    },
    Bash: {
      canDo: ['Run any command', 'Install packages', 'Run tests', 'Git operations'],
      limitations: ['120 second timeout', 'No interactive commands']
    },
    TodoWrite: {
      canDo: ['Track tasks', 'Manage progress', 'Organize work'],
      limitations: ['Single session persistence']
    },
    'mcp__ide__getDiagnostics': {
      canDo: ['Get TypeScript errors', 'Get ESLint warnings', 'Check syntax'],
      limitations: ['VS Code must be open']
    }
  },

  /**
   * Missing Tools - Tools referenced in BMAD but not available
   */
  missing: {
    mcpServers: [
      'Playwright MCP (24 tools)',
      'Shadcn/UI MCP (7 tools, 5 prompts)',
      'EXA MCP (6 tools)',
      'Firecrawl MCP (8 tools)',
      'REF Tools MCP (2 tools, 2 prompts)',
      'Context7 MCP (2 tools)',
      'Git MCP (25 tools)',
      'Postgres MCP',
      'Semgrep MCP',
      'Mindmap MCP',
      'N8N MCP'
    ],
    vscodeExtensions: [
      'JSON Viewer',
      'RegExp Preview',
      'CSV to Table',
      'Bookmarks',
      'Color Picker',
      'Live Server',
      'Coverage Gutters',
      'Test Explorer',
      'TODO Tree',
      'Markdown Editor',
      'PlantUML',
      'Dependency Graph'
    ]
  },

  /**
   * Installation Commands - How to add missing tools
   */
  installCommands: {
    vscodeExtensions: [
      'code --install-extension mechatroner.rainbow-csv',
      'code --install-extension alefragnani.Bookmarks',
      'code --install-extension anseki.vscode-color',
      'code --install-extension ritwickdey.LiveServer',
      'code --install-extension ryanluker.vscode-coverage-gutters',
      'code --install-extension hbenl.vscode-test-explorer',
      'code --install-extension Gruntfuggly.todo-tree',
      'code --install-extension yzhang.markdown-all-in-one',
      'code --install-extension jebbs.plantuml'
    ],
    npmPackages: [
      'npm install -g @playwright/test',
      'npm install -g semgrep'
    ]
  }
};

/**
 * Get the actual tool to use for a requested tool
 */
function getActualTool(requestedTool) {
  return actualTools.mapping[requestedTool] || requestedTool;
}

/**
 * Check if a tool is available
 */
function isToolAvailable(tool) {
  return actualTools.available.builtIn.includes(tool) ||
         actualTools.available.mcp.includes(tool) ||
         actualTools.available.vscodeExtensions.some(ext => ext.includes(tool.toLowerCase()));
}

/**
 * Get tool capabilities
 */
function getToolCapabilities(tool) {
  const actualTool = getActualTool(tool);
  return actualTools.capabilities[actualTool] || { canDo: [], limitations: [] };
}

/**
 * Generate installation script for missing tools
 */
function generateInstallScript() {
  const script = `#!/bin/bash
# BMAD Method v3.0 - Tool Installation Script

echo "Installing missing VS Code extensions..."
${actualTools.installCommands.vscodeExtensions.join('\n')}

echo "Installing NPM packages..."
${actualTools.installCommands.npmPackages.join('\n')}

echo "Installation complete!"
`;
  return script;
}

module.exports = {
  actualTools,
  getActualTool,
  isToolAvailable,
  getToolCapabilities,
  generateInstallScript
};