# SteppersLife Magazine (magazine.stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** magazine.stepperslife.com  
**Purpose:** Community content platform for Chicago Steppin articles, stories, and news

---

## Overview

### What This Website Does

magazine.stepperslife.com is a **content publishing platform** where:
- Community members write articles
- ADMIN approves/publishes content
- Readers browse and read articles
- Writers build portfolios
- Featured stories highlighted

**Business Model:** Free to read, free to write (builds community)

### How It Connects to Main Site

```
stepperslife.com (Consumer Portal)
  ↓ Pulls data via API
  ↓
magazine.stepperslife.com (This CMS)
  ↓ Stores all articles
  ↓
Provides API endpoints:
- GET /api/articles (list published articles)
- GET /api/articles/:slug (get article)
- Featured articles on homepage
```

---

## Authentication & Login Flow

### NextAuth SSO (Same Instance)

```bash
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9005
MINIO_ACCESS_KEY="magazine_minio"
MINIO_SECRET_KEY="magazine_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="magazine"
```

### User Roles on This Site

```
USER (Everyone)
├─ Read articles
├─ Comment on articles (optional feature)
└─ Share articles

MAGAZINE_WRITER (Self-signup)
├─ Write draft articles
├─ Submit for review
├─ View submission status
├─ Edit drafts (before submission)
├─ View article analytics (after published)
└─ Cannot: Publish directly

ADMIN (Platform Administrator)
├─ Review submitted articles
├─ Approve/reject articles
├─ Edit any article
├─ Publish articles
├─ Feature articles
├─ Manage categories
└─ Full content control
```

---

## Tech Stack

Same core stack:
- Next.js 15, React 18, TypeScript
- NextAuth (auth)
- PostgreSQL + Prisma
- Tailwind + shadcn/ui

**Additional:**
- **Rich Text Editor** (Tiptap or Lexical)
- **Image optimization** (Sharp)
- **SEO** (next-seo)

---

## Database Schema

```prisma
model Article {
  id            String   @id @default(cuid())
  
  // Author (from main site)
  authorId      String
  authorNextAuthId String
  authorName    String
  authorPhoto   String?
  authorBio     String?
  
  // Article content
  title         String
  slug          String   @unique
  subtitle      String?
  content       String   @db.Text // Rich text JSON or HTML
  excerpt       String?  // Short summary
  
  // Media
  featuredImage String?
  images        String[] // Additional images in article
  
  // Categorization
  category      ArticleCategory
  tags          String[]
  
  // SEO
  metaTitle     String?
  metaDescription String?
  
  // Publishing
  status        ArticleStatus
  
  // Review
  submittedAt   DateTime?
  reviewedBy    String?  // Admin nextauth ID
  reviewedAt    DateTime?
  reviewNotes   String?  // Feedback from admin
  
  publishedAt   DateTime?
  
  // Featured
  isFeatured    Boolean  @default(false)
  featuredUntil DateTime?
  
  // Stats
  viewCount     Int      @default(0)
  likeCount     Int      @default(0)
  shareCount    Int      @default(0)
  
  // Comments (if enabled)
  comments      Comment[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([authorId])
  @@index([status])
  @@index([category])
  @@index([publishedAt])
  @@map("articles")
}

enum ArticleStatus {
  DRAFT        // Writer is still editing
  SUBMITTED    // Submitted for review
  APPROVED     // Approved, ready to publish
  PUBLISHED    // Live on site
  REJECTED     // Not approved
  ARCHIVED     // Removed from public view
}

enum ArticleCategory {
  NEWS
  EVENTS
  INTERVIEWS
  HISTORY
  TUTORIALS
  LIFESTYLE
  FASHION
  MUSIC
  COMMUNITY
  OTHER
}

model Comment {
  id            String   @id @default(cuid())
  articleId     String
  article       Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  // Commenter
  userId        String
  userNextAuthId   String
  userName      String
  userPhoto     String?
  
  // Comment content
  content       String
  
  // Replies (threaded comments)
  parentId      String?
  parent        Comment? @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies       Comment[] @relation("CommentReplies")
  
  // Moderation
  isApproved    Boolean  @default(true)
  isFlagged     Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([articleId])
  @@index([userId])
  @@map("comments")
}

model Category {
  id            String   @id @default(cuid())
  name          String   @unique
  slug          String   @unique
  description   String?
  color         String?  // Hex color for category badge
  
  createdAt     DateTime @default(now())
  
  @@map("categories")
}

model WriterProfile {
  id            String   @id @default(cuid())
  
  // Writer (from main site)
  userId        String   @unique
  userNextAuthId   String   @unique
  
  // Profile
  displayName   String
  slug          String   @unique
  bio           String?
  photoUrl      String?
  
  // Social
  instagramUrl  String?
  twitterUrl    String?
  websiteUrl    String?
  
  // Status
  isApproved    Boolean  @default(false)
  
  // Stats
  totalArticles Int      @default(0)
  totalViews    Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("writer_profiles")
}
```

---

## APIs This Site Provides

### Public APIs

```typescript
// GET /api/articles - List published articles
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const authorId = searchParams.get('authorId');
  
  const articles = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category && { category: category as ArticleCategory }),
      ...(featured === 'true' && { isFeatured: true }),
      ...(authorId && { authorId })
    },
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      excerpt: true,
      featuredImage: true,
      category: true,
      tags: true,
      authorName: true,
      authorPhoto: true,
      publishedAt: true,
      viewCount: true,
      likeCount: true
    },
    orderBy: [
      { isFeatured: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: 20
  });
  
  return Response.json({ articles });
}

// GET /api/articles/:slug - Get article
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: {
      comments: {
        where: { 
          isApproved: true,
          parentId: null // Top-level comments only
        },
        include: {
          replies: {
            where: { isApproved: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  if (!article || article.status !== 'PUBLISHED') {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Increment view count
  await db.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } }
  });
  
  return Response.json({ article });
}
```

### Private APIs (Writer Dashboard)

```typescript
// POST /api/articles - Create draft article
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user has MAGAZINE_WRITER role
  const hasRole = await hasWriterRole(userId);
  if (!hasRole) {
    return Response.json({ 
      error: 'You must be a writer to create articles' 
    }, { status: 403 });
  }
  
  const {
    title,
    content,
    category,
    tags,
    featuredImage
  } = await req.json();
  
  // Get user info
  const user = await db.user.findUnique({
    where: { userId }
  });
  
  // Generate slug
  const slug = slugify(title);
  
  // Create article
  const article = await db.article.create({
    data: {
      authorId: user!.id,
      authorNextAuthId: userId,
      authorName: user!.name || 'Anonymous',
      authorPhoto: user!.photoUrl,
      title,
      slug,
      content,
      category,
      tags,
      featuredImage,
      status: 'DRAFT'
    }
  });
  
  return Response.json({ article });
}

// PATCH /api/articles/:id/submit - Submit for review
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  const article = await db.article.findUnique({
    where: { id: params.id }
  });
  
  if (!article || article.authorNextAuthId !== userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  if (article.status !== 'DRAFT') {
    return Response.json({ 
      error: 'Can only submit draft articles' 
    }, { status: 400 });
  }
  
  // Submit for review
  const updated = await db.article.update({
    where: { id: params.id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });
  
  // Notify admins
  await notifyAdmins('New article submission', {
    articleId: article.id,
    title: article.title,
    author: article.authorName
  });
  
  return Response.json({ 
    article: updated,
    message: 'Article submitted for review. You will be notified when reviewed.'
  });
}
```

### Admin APIs

```typescript
// PATCH /api/admin/articles/:id/approve - Approve article
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  // Check if admin
  const isAdmin = await hasAdminRole(userId);
  if (!isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const { action, reviewNotes } = await req.json();
  
  const article = await db.article.findUnique({
    where: { id: params.id }
  });
  
  if (!article) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  let newStatus: ArticleStatus;
  let publishedAt: Date | undefined;
  
  if (action === 'approve') {
    newStatus = 'APPROVED';
  } else if (action === 'publish') {
    newStatus = 'PUBLISHED';
    publishedAt = new Date();
  } else if (action === 'reject') {
    newStatus = 'REJECTED';
  } else {
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  }
  
  const updated = await db.article.update({
    where: { id: params.id },
    data: {
      status: newStatus,
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewNotes,
      ...(publishedAt && { publishedAt })
    }
  });
  
  // Notify author
  await sendEmail(article.authorEmail, {
    subject: `Your article "${article.title}" has been ${action}ed`,
    html: `
      <p>Hi ${article.authorName},</p>
      <p>Your article "${article.title}" has been ${action}ed.</p>
      ${reviewNotes ? `<p><strong>Notes from editor:</strong> ${reviewNotes}</p>` : ''}
      ${action === 'publish' ? `
        <p>Your article is now live!</p>
        <a href="https://magazine.stepperslife.com/articles/${article.slug}">View Article</a>
      ` : ''}
    `
  });
  
  // Webhook to main site (if published)
  if (action === 'publish') {
    await fetch('https://stepperslife.com/api/webhooks/magazine', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-webhook-signature': signWebhook(updated)
      },
      body: JSON.stringify({
        event: 'article.published',
        articleId: updated.id,
        title: updated.title,
        slug: updated.slug
      })
    });
  }
  
  return Response.json({ article: updated });
}
```

---

## Page Structure

```
app/
├── layout.tsx                    # Root layout (Blue theme - consumer content)
├── page.tsx                      # Magazine homepage
│
├── (public)/
│   ├── articles/
│   │   ├── page.tsx             # Article list
│   │   ├── [slug]/page.tsx      # Article detail
│   │   └── category/[category]/page.tsx # Category archive
│   ├── writers/
│   │   ├── page.tsx             # Writer directory
│   │   └── [slug]/page.tsx      # Writer profile
│   └── about/page.tsx           # About magazine
│
├── (writer)/                     # Writer dashboard
│   ├── dashboard/
│   │   ├── page.tsx             # Writer home
│   │   ├── articles/
│   │   │   ├── page.tsx         # My articles
│   │   │   ├── new/page.tsx     # Write new article
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx # Edit article
│   │   │       └── stats/page.tsx # Article analytics
│   │   ├── profile/page.tsx     # Edit writer profile
│   │   └── become-writer/page.tsx # Apply to be writer
│
├── (admin)/                      # Admin panel
│   ├── layout.tsx               # Admin theme (Orange)
│   └── admin/
│       ├── page.tsx             # Admin dashboard
│       ├── submissions/page.tsx # Review submissions
│       ├── articles/
│       │   ├── page.tsx         # All articles
│       │   └── [id]/page.tsx    # Edit any article
│       ├── writers/page.tsx     # Manage writers
│       └── categories/page.tsx  # Manage categories
│
└── api/
    ├── articles/
    │   ├── route.ts             # List/create articles
    │   ├── [slug]/route.ts      # Get article
    │   └── [id]/
    │       ├── submit/route.ts  # Submit for review
    │       └── update/route.ts  # Update article
    ├── writers/
    │   ├── route.ts             # Apply to be writer
    │   └── [slug]/route.ts      # Get writer profile
    ├── comments/route.ts        # Post comment
    └── admin/
        ├── articles/
        │   └── [id]/
        │       ├── approve/route.ts # Approve article
        │       └── feature/route.ts # Feature article
        └── writers/
            └── [id]/approve/route.ts # Approve writer
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_magazine"
REDIS_URL="redis://localhost:6379/6"

# NextAuth (SAME)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9005
MINIO_ACCESS_KEY="magazine_minio"
MINIO_SECRET_KEY="magazine_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="magazine"

# Email
RESEND_API_KEY="re_..."

# Main Site Integration
MAIN_SITE_WEBHOOK_URL="https://stepperslife.com/api/webhooks/magazine"
WEBHOOK_SECRET="..."

# Storage
MINIO_BUCKET="stepperslife-magazine"

# App Config
NEXT_PUBLIC_APP_URL="https://magazine.stepperslife.com"
PORT=3007
```

---

## Design System

### Public Pages: BLUE (Customer/Reader Mode)

```css
/* app/(public)/layout.tsx */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #1e9df1;  /* Blue - consumer content */
  --sidebar-primary: #1e9df1;
  --ring: #1da1f2;
}
```

### Writer Dashboard: GREEN (Business Mode)

```css
/* app/(writer)/layout.tsx */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #10b981;  /* Green - writer/creator mode */
  --sidebar-primary: #10b981;
  --ring: #10b981;
}
```

### Admin Panel: ORANGE (Admin Mode)

```css
/* app/(admin)/layout.tsx */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #f97316;  /* Orange - admin mode */
  --sidebar-primary: #f97316;
  --ring: #f97316;
}
```

---

## Rich Text Editor

### Using Tiptap

```typescript
// components/ArticleEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

export function ArticleEditor({ content, onChange }: { 
  content: string;
  onChange: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });
  
  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex gap-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        {/* More toolbar buttons */}
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  );
}
```

---

## Integration Checklist

**Before Launch:**

- [ ] NextAuth SSO configured
- [ ] Database schema implemented
- [ ] Writer application/approval flow
- [ ] Rich text editor working
- [ ] Article submission workflow
- [ ] Admin review system
- [ ] Publishing system
- [ ] Public article pages
- [ ] SEO optimization
- [ ] Image upload/optimization
- [ ] Comment system (optional)
- [ ] Writer profiles
- [ ] Categories management
- [ ] Featured articles
- [ ] Public APIs for main site
- [ ] Webhooks to main site
- [ ] Email notifications

---

**End of Magazine Platform Specification**