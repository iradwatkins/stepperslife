# SteppersLife Documentation & Prompt Guide

**Created:** 2025-10-09
**Purpose:** Guide to using the documentation and prompts for subdomain development

---

## 📚 Available Documentation

### 1. **For Human Developers**

#### [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)
**Use When:** Starting a new subdomain from scratch
**Audience:** Developers, team members
**Length:** Comprehensive (full guide)
**Contains:**
- Complete architecture explanation
- Environment variable templates
- Code examples for all patterns
- Database schema requirements
- MinIO setup instructions
- API endpoint specifications
- Troubleshooting guide

---

#### [SUBDOMAIN_QUICK_START.md](SUBDOMAIN_QUICK_START.md)
**Use When:** Quick reference for experienced developers
**Audience:** Developers who understand the basics
**Length:** Concise (quick reference)
**Contains:**
- Port assignments table
- Essential code snippets
- Critical rules (DO/DON'T)
- Quick start commands
- SSO testing steps

---

### 2. **For AI Assistants**

#### [AI_AGENT_SUBDOMAIN_PROMPT.txt](AI_AGENT_SUBDOMAIN_PROMPT.txt)
**Use When:** Working with AI coding assistants (Claude, GPT, etc.)
**Audience:** AI agents
**Length:** Optimized for AI consumption
**Contains:**
- Clear, directive language
- All critical information
- Code templates
- Strict rules
- Success criteria

**How to Use:**
```
Copy the entire contents of AI_AGENT_SUBDOMAIN_PROMPT.txt
Paste at the start of your conversation with AI assistant
Then ask: "Build the restaurants subdomain for SteppersLife"
```

---

### 3. **Architecture Documentation**

#### [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)
**Use When:** Understanding the overall system
**Audience:** Architects, senior developers, stakeholders
**Contains:**
- Visual architecture diagrams
- Data flow examples
- Resource allocation strategy
- Shared vs isolated resources
- Deployment strategies

---

#### [MICROSERVICES_COMPLETE.md](MICROSERVICES_COMPLETE.md)
**Use When:** Setting up infrastructure
**Audience:** DevOps, system administrators
**Contains:**
- Complete resource allocation table
- Database setup instructions
- MinIO instance setup
- Production readiness checklist
- Environment configuration per subdomain

---

### 4. **Migration Documentation**

#### [MIGRATION_SUMMARY.md](../MIGRATION_SUMMARY.md)
**Use When:** Understanding what changed
**Audience:** Anyone familiar with old Clerk setup
**Contains:**
- What was updated (all files)
- Before/after comparison (Clerk → NextAuth)
- Verification results
- Next steps required
- Tech stack changes

---

## 🚀 Usage Scenarios

### Scenario 1: "I'm starting the restaurant subdomain"

**Step 1:** Read [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)
**Step 2:** Check port assignment (Port 3010, MinIO 9001, DB: stepperslife_restaurants)
**Step 3:** Copy environment variable template and fill in values
**Step 4:** Follow setup instructions
**Step 5:** Use [SUBDOMAIN_QUICK_START.md](SUBDOMAIN_QUICK_START.md) as reference

---

### Scenario 2: "I'm using Claude to build the events subdomain"

**Step 1:** Open [AI_AGENT_SUBDOMAIN_PROMPT.txt](AI_AGENT_SUBDOMAIN_PROMPT.txt)
**Step 2:** Copy entire contents
**Step 3:** Start new conversation with Claude
**Step 4:** Paste the prompt
**Step 5:** Say: "Build the events subdomain. It should handle event listings, ticket sales, and venue management."
**Step 6:** Claude will build following the exact architecture

---

### Scenario 3: "I need to explain the architecture to a new team member"

**Show them:**
1. [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) - Start here for big picture
2. [MICROSERVICES_COMPLETE.md](MICROSERVICES_COMPLETE.md) - Then implementation details
3. [SUBDOMAIN_QUICK_START.md](SUBDOMAIN_QUICK_START.md) - Finally the quick reference

---

### Scenario 4: "I'm confused about NextAuth vs Clerk"

**Read:** [MIGRATION_SUMMARY.md](../MIGRATION_SUMMARY.md)

Shows:
- We migrated from Clerk to NextAuth
- All documentation updated
- What changed in code
- Why we made the change

---

### Scenario 5: "I need to set up production infrastructure"

**Use:** [MICROSERVICES_COMPLETE.md](MICROSERVICES_COMPLETE.md)

Contains:
- Database creation commands (7 databases)
- MinIO setup (6 instances)
- Port assignments
- PM2 configuration
- Production checklist

---

## 🎯 Quick Decision Tree

```
START: What do you need?

├─ Building a subdomain?
│  ├─ Human developer → SUBDOMAIN_DEVELOPMENT_PROMPT.md
│  ├─ AI assistant → AI_AGENT_SUBDOMAIN_PROMPT.txt
│  └─ Quick reference → SUBDOMAIN_QUICK_START.md
│
├─ Understanding architecture?
│  ├─ Overview → MICROSERVICES_ARCHITECTURE.md
│  └─ Implementation → MICROSERVICES_COMPLETE.md
│
├─ Migration questions?
│  └─ MIGRATION_SUMMARY.md
│
└─ Setting up infrastructure?
   └─ MICROSERVICES_COMPLETE.md
```

---

## 📋 Subdomain Development Checklist

Use this when starting ANY subdomain:

### Pre-Development
- [ ] Read [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)
- [ ] Check port assignments in [MICROSERVICES_COMPLETE.md](MICROSERVICES_COMPLETE.md)
- [ ] Understand SSO flow in [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)

### Setup
- [ ] Create PostgreSQL database (stepperslife_SUBDOMAIN)
- [ ] Setup MinIO instance (assigned port)
- [ ] Create MinIO bucket (subdomain name)
- [ ] Copy environment variable template
- [ ] Configure NextAuth with shared credentials

### Development
- [ ] Install required packages (Next.js 15, NextAuth, Prisma, MinIO)
- [ ] Setup NextAuth API route
- [ ] Create Prisma schema (User tables + business tables)
- [ ] Implement role-based access
- [ ] Create public API endpoints
- [ ] Test file uploads to MinIO

### Integration
- [ ] Test SSO (login on main site, access subdomain)
- [ ] Verify main site can fetch your data via API
- [ ] Test transactions from main site
- [ ] Confirm data isolated in your database
- [ ] Confirm files isolated in your MinIO

### Deployment
- [ ] Configure PM2 ecosystem
- [ ] Setup Nginx reverse proxy
- [ ] Configure SSL certificate
- [ ] Test production SSO
- [ ] Verify all environment variables

---

## 💡 Tips for Working with AI Assistants

### When using the AI prompt:

**DO:**
✅ Copy the entire [AI_AGENT_SUBDOMAIN_PROMPT.txt](AI_AGENT_SUBDOMAIN_PROMPT.txt)
✅ Paste at start of conversation
✅ Be specific about which subdomain you're building
✅ Reference the prompt if AI suggests wrong approach
✅ Ask AI to explain if unclear

**DON'T:**
❌ Paraphrase the prompt
❌ Mix different architectural approaches
❌ Let AI use Clerk/Supabase/Vercel-specific features
❌ Skip the environment variable setup
❌ Forget to test SSO

### Example AI Conversations:

**Good:**
```
[Paste entire AI_AGENT_SUBDOMAIN_PROMPT.txt]

Build the restaurant subdomain. It should allow:
- Restaurant owners to create profiles
- Menu management (items, prices, images)
- Receive pickup orders
- View analytics
```

**Bad:**
```
Build a restaurant management system with Clerk auth
```
*(Will use wrong stack)*

---

## 🔄 Keeping Documentation Updated

When making changes:

1. **Architecture changes** → Update [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)
2. **New requirements** → Update [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)
3. **AI prompt changes** → Update [AI_AGENT_SUBDOMAIN_PROMPT.txt](AI_AGENT_SUBDOMAIN_PROMPT.txt)
4. **Quick reference** → Update [SUBDOMAIN_QUICK_START.md](SUBDOMAIN_QUICK_START.md)

**Keep all docs in sync!**

---

## 📞 Getting Help

**Question about architecture?**
→ Check [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)

**Question about implementation?**
→ Check [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)

**SSO not working?**
→ Check "Common Issues" in [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)

**Using AI assistant?**
→ Use [AI_AGENT_SUBDOMAIN_PROMPT.txt](AI_AGENT_SUBDOMAIN_PROMPT.txt)

**Setting up infrastructure?**
→ Check [MICROSERVICES_COMPLETE.md](MICROSERVICES_COMPLETE.md)

---

## 🎓 Learning Path

### For New Developers:

1. **Day 1:** Read [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)
2. **Day 2:** Read [SUBDOMAIN_DEVELOPMENT_PROMPT.md](SUBDOMAIN_DEVELOPMENT_PROMPT.md)
3. **Day 3:** Build a test subdomain following the prompt
4. **Day 4:** Test SSO integration
5. **Day 5:** Start building your assigned subdomain

### For Experienced Developers:

1. **10 min:** Skim [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md)
2. **15 min:** Review [SUBDOMAIN_QUICK_START.md](SUBDOMAIN_QUICK_START.md)
3. **Start building** with quick reference open

---

## 📊 Document Summary

| Document | Length | Audience | Purpose |
|----------|--------|----------|---------|
| SUBDOMAIN_DEVELOPMENT_PROMPT.md | Long | Humans | Complete guide |
| SUBDOMAIN_QUICK_START.md | Short | Humans | Quick reference |
| AI_AGENT_SUBDOMAIN_PROMPT.txt | Medium | AI | AI assistant prompt |
| MICROSERVICES_ARCHITECTURE.md | Long | All | Architecture overview |
| MICROSERVICES_COMPLETE.md | Long | DevOps | Implementation guide |
| MIGRATION_SUMMARY.md | Medium | All | Migration history |

---

**All documentation is in `/root/websites/stepperslife/docs/`**

**Use the right document for the right purpose, and you'll build subdomains that perfectly integrate with the SteppersLife ecosystem!**
