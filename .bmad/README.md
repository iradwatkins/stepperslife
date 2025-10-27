# 🤖 BMAD v5.1.3 + MCP Integration Guide

## ✅ What's Installed

**BMAD Version:** v5.1.3
**MCPs Available:** 11 total
**Projects Configured:** All 11 websites

---

## 🎯 How BMAD Works in Claude Code

You're using **BMAD-METHOD v5.1.3** directly in **Claude Code CLI** (not in a browser).

### **BMAD Agents Available:**
1. **Analyst** - Research & requirements
2. **PM** - Product planning
3. **Architect** - System design
4. **Scrum Master** - Story creation
5. **Dev** - Implementation
6. **QA** - Testing

### **Each Agent Has Access to Specific MCPs:**
See `.bmad/config/mcp-config.json` for full mapping.

---

## 🚀 COMPLETE WORKFLOW

### **Step 1: Start Protected Session**
```bash
ssh root@72.60.28.175
cd ~/websites/agistaffers
claude-safe
```

### **Step 2: Activate BMAD Analyst Agent**
```
You: "Act as BMAD Analyst agent. Read .bmad/agents/analyst-agent.md 
     and research checkout flow best practices for e-commerce."

Claude (as Analyst):
- Uses brave-search MCP to research
- Uses fetch MCP to check competitor APIs
- Uses memory MCP to store findings
- Creates docs/bmad/analyst/checkout-flow-research.md
```

### **Step 3: Activate BMAD PM Agent**
```
You: "Act as BMAD PM agent. Read the Analyst's research in 
     docs/bmad/analyst/checkout-flow-research.md and create a PRD."

Claude (as PM):
- Uses filesystem MCP to read Analyst's research
- Uses sequential-thinking MCP for planning
- Uses memory MCP to track decisions
- Creates docs/bmad/pm/checkout-flow-prd.md
```

### **Step 4: Activate BMAD Architect Agent**
```
You: "Act as BMAD Architect agent. Read the PRD and design 
     the technical architecture."

Claude (as Architect):
- Uses serena MCP to understand current codebase
- Uses filesystem MCP to read PRD
- Uses sequential-thinking MCP for design decisions
- Uses git MCP to check current code structure
- Creates docs/bmad/architect/checkout-flow-architecture.md
```

### **Step 5: Activate BMAD Scrum Master Agent**
```
You: "Act as BMAD Scrum Master. Read the architecture docs
     and break this into implementable stories."

Claude (as Scrum Master):
- Uses filesystem MCP to read architecture
- Uses memory MCP to track context
- Creates docs/bmad/stories/current/checkout-flow-story-1.md
- Creates docs/bmad/stories/current/checkout-flow-story-2.md
```

### **Step 6: Activate BMAD Dev Agent**
```
You: "Act as BMAD Dev agent. Read .bmad/agents/dev-agent.md
     and implement story checkout-flow-story-1.md"

Claude (as Dev):
- Uses serena MCP to navigate codebase
- Uses filesystem MCP to read/write code
- Uses sequential-thinking MCP for complex logic
- Uses git MCP to create branch, commit, push
- Creates docs/bmad/dev/checkout-flow-implementation.md
```

### **Step 7: Activate BMAD QA Agent**
```
You: "Act as BMAD QA agent. Read .bmad/agents/qa-agent.md
     and test the checkout flow implementation."

Claude (as QA):
- Uses filesystem MCP to read implementation
- Uses playwright MCP to write E2E tests
- Uses chrome-devtools MCP to debug
- Uses git MCP to commit test files
- Creates docs/bmad/qa/test-plans/checkout-flow-tests.md
```

---

## 📁 Project Structure

```
/root/websites/agistaffers/
├── .bmad/
│   ├── agents/
│   │   ├── analyst-agent.md    ← Agent instructions + MCPs
│   │   ├── dev-agent.md
│   │   └── qa-agent.md
│   └── config/
│       └── mcp-config.json     ← MCP-to-Agent mapping
├── docs/
│   └── bmad/
│       ├── analyst/            ← Research outputs
│       ├── pm/                 ← PRDs
│       ├── architect/          ← Architecture docs
│       ├── stories/
│       │   ├── current/        ← Active stories
│       │   └── archive/        ← Completed stories
│       ├── dev/                ← Implementation docs
│       └── qa/
│           ├── test-plans/     ← Test plans
│           └── bugs/           ← Bug reports
└── src/                        ← Your code
```

---

## 🔧 MCP Usage by Agent

### **Analyst Agent** (Research)
- brave-search: Market research
- fetch: API research
- mcp-youtube: Video tutorials
- memory: Store findings
- sequential-thinking: Complex analysis

### **Dev Agent** (Implementation)
- git: Version control
- serena: Code navigation
- filesystem: Read/write files
- sequential-thinking: Problem solving
- memory: Remember patterns

### **QA Agent** (Testing)
- playwright: E2E tests
- puppeteer: Browser automation
- chrome-devtools: Debugging
- git: Test commits
- filesystem: Write test files

---

## 💡 QUICK EXAMPLES

### **Example 1: Simple Feature**
```
You: "Act as BMAD Dev. Implement a loading spinner on the 
     checkout button when payment is processing."

Claude: "I'll use serena to find the checkout button component,
        then implement the loading state..."
```

### **Example 2: Complex Feature (Full BMAD Cycle)**
```
1. You: "Act as Analyst. Research payment gateway options."
2. You: "Act as PM. Create PRD for Stripe integration."
3. You: "Act as Architect. Design the payment architecture."
4. You: "Act as Scrum Master. Break into stories."
5. You: "Act as Dev. Implement story 1."
6. You: "Act as QA. Test Stripe integration."
```

### **Example 3: Bug Fix**
```
You: "Act as QA. Use chrome-devtools and playwright to debug
     why checkout fails on Safari."

Claude: "I'll use playwright to reproduce the issue and 
        chrome-devtools to inspect..."
```

---

## ✅ VERIFICATION

Check your setup:
```bash
ls -la /root/websites/agistaffers/.bmad/
ls -la /root/websites/agistaffers/docs/bmad/
```

Should see:
```
.bmad/agents/analyst-agent.md
.bmad/agents/dev-agent.md
.bmad/agents/qa-agent.md
.bmad/config/mcp-config.json
docs/bmad/ (full structure)
```

---

## 🎓 TRAINING TIPS

### **For Small Tasks:**
Skip BMAD, just tell Claude directly:
```
You: "Add a loading spinner to the checkout button"
```

### **For Medium Tasks:**
Use Dev agent:
```
You: "Act as BMAD Dev. Implement feature X."
```

### **For Large Features:**
Use full BMAD cycle (Analyst → PM → Architect → Scrum Master → Dev → QA)

---

## 🚨 IMPORTANT REMINDERS

✅ Always start with `claude-safe` (project isolation!)
✅ Tell Claude which BMAD agent to act as
✅ Tell Claude to read the agent file (`.bmad/agents/[agent]-agent.md`)
✅ MCPs are AUTOMATIC - Claude will use them based on agent role
✅ All docs stay in `docs/bmad/` (version controlled)

---

## 📚 More Info

- Agent prompts: `/root/websites/PROJECT/.bmad/agents/`
- MCP config: `/root/websites/PROJECT/.bmad/config/mcp-config.json`
- BMAD official docs: https://github.com/bmad-code-org/BMAD-METHOD

---

**You're all set! BMAD v5.1.3 + MCPs are configured on all 11 projects.**
