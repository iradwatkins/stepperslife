# SteppersLife Classes Platform (classes.stepperslife.com) - Technical Specification

**Version:** 1.0  
**Domain:** classes.stepperslife.com  
**Purpose:** Video learning platform for Chicago Steppin dance instruction

---

## Overview

### What This Website Does

classes.stepperslife.com is a **video learning SaaS** where instructors:
- Upload dance tutorial videos
- Create course curriculums
- Set pricing (one-time or subscription)
- Track student progress
- Engage with students (comments, Q&A)
- View earnings analytics

### How It Connects to Main Site

```
stepperslife.com (Consumer Portal)
  ↓ Pulls data via API
  ↓
classes.stepperslife.com (This SaaS)
  ↓ Stores videos, courses, enrollments
  ↓
Provides API endpoints:
- GET /api/classes (list all classes)
- GET /api/instructors/:slug (get instructor + classes)
- POST /api/enrollments (enroll in class)
- Provides video streaming URLs
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
MINIO_PORT=9004
MINIO_ACCESS_KEY="classes_minio"
MINIO_SECRET_KEY="classes_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="classes"
```

### User Roles on This Site

```
INSTRUCTOR (Primary Role)
├─ Upload video lessons
├─ Create courses
├─ Set pricing
├─ View student enrollments
├─ Respond to student questions
├─ View analytics & earnings
└─ No staff roles (instructors work solo)

STUDENT (Enrolled Users)
├─ Watch enrolled classes
├─ Track progress
├─ Ask questions
├─ Download resources
└─ Rate/review classes
```

---

## Tech Stack

Same core stack plus:
- **Video hosting** (Mux, Vimeo, or MinIO + HLS)
- **Video processing** (FFmpeg for transcoding)
- **CDN** (CloudFlare for video delivery)

---

## Database Schema

```prisma
model Instructor {
  id            String   @id @default(cuid())
  
  // Instructor (from main site)
  userId        String   @unique
  userNextAuthId   String   @unique
  
  // Profile
  displayName   String
  slug          String   @unique
  bio           String?
  photoUrl      String?
  
  // Credentials
  yearsExperience Int?
  certifications  String[]
  
  // Social
  instagramUrl  String?
  youtubeUrl    String?
  websiteUrl    String?
  
  // Payment
  stripeAccountId String? @unique
  stripeChargesEnabled Boolean @default(false)
  
  paypalMerchantId String? @unique
  
  paymentProcessors PaymentProcessor[]
  
  // Platform fee
  platformFeePercent Decimal @default(10.0)
  
  // Content
  courses       Course[]
  lessons       Lesson[]
  
  // Status
  isApproved    Boolean  @default(false)
  isActive      Boolean  @default(true)
  
  // Stats
  totalStudents Int      @default(0)
  totalRevenue  Decimal  @default(0)
  averageRating Decimal?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("instructors")
}

model Course {
  id            String   @id @default(cuid())
  instructorId  String
  instructor    Instructor @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  
  // Course details
  title         String
  slug          String
  description   String
  shortDescription String?
  
  // Pricing
  priceType     PriceType
  price         Decimal?  // One-time price
  monthlyPrice  Decimal?  // Subscription price
  
  // Content
  lessons       Lesson[]
  
  // Media
  thumbnailUrl  String?
  promoVideoUrl String?
  
  // Categorization
  level         SkillLevel  // Beginner, Intermediate, Advanced
  tags          String[]
  
  // Settings
  isPublished   Boolean  @default(false)
  isFeatured    Boolean  @default(false)
  
  // Stats
  totalLessons  Int      @default(0)
  totalDuration Int      @default(0)  // In minutes
  enrollmentCount Int    @default(0)
  averageRating Decimal?
  
  // SEO
  metaTitle     String?
  metaDescription String?
  
  // Relations
  enrollments   Enrollment[]
  reviews       Review[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([instructorId, slug])
  @@index([instructorId])
  @@index([isPublished])
  @@map("courses")
}

enum PriceType {
  FREE
  ONE_TIME
  SUBSCRIPTION
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  ALL_LEVELS
}

model Lesson {
  id            String   @id @default(cuid())
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  instructorId  String
  instructor    Instructor @relation(fields: [instructorId], references: [id])
  
  // Lesson details
  title         String
  description   String?
  
  // Video
  videoUrl      String   // Mux playback URL or MinIO URL
  videoId       String?  // Mux asset ID
  duration      Int      // In seconds
  thumbnailUrl  String?
  
  // Resources
  resources     Json?    // [{name: "PDF Guide", url: "..."}]
  
  // Ordering
  moduleNumber  Int      @default(1)
  lessonNumber  Int
  
  // Settings
  isFree        Boolean  @default(false)  // Preview lesson
  isPublished   Boolean  @default(false)
  
  // Relations
  progress      LessonProgress[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([courseId])
  @@index([instructorId])
  @@map("lessons")
}

model Enrollment {
  id            String   @id @default(cuid())
  
  // Student (from main site)
  studentId     String
  studentNextAuthId String
  studentName   String
  studentEmail  String
  
  // Course
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id])
  
  // Payment
  paymentProcessor PaymentProcessor
  paymentIntentId  String?
  
  // Subscription (if applicable)
  subscriptionId   String?  // Stripe subscription ID
  subscriptionStatus String? // active, canceled, etc.
  
  // Amounts
  amountPaid    Decimal
  platformFee   Decimal
  instructorPayout Decimal
  
  // Access
  hasAccess     Boolean  @default(true)
  expiresAt     DateTime? // For subscriptions
  
  // Progress
  progress      LessonProgress[]
  completionPercent Decimal @default(0)
  
  // Timestamps
  enrolledAt    DateTime @default(now())
  completedAt   DateTime?
  lastAccessedAt DateTime?
  
  @@unique([studentId, courseId])
  @@index([courseId])
  @@index([studentId])
  @@map("enrollments")
}

model LessonProgress {
  id            String   @id @default(cuid())
  
  enrollmentId  String
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  
  lessonId      String
  lesson        Lesson   @relation(fields: [lessonId], references: [id])
  
  // Progress
  completed     Boolean  @default(false)
  watchedSeconds Int     @default(0)
  watchedPercent Decimal @default(0)
  
  // Timestamps
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  lastWatchedAt DateTime @default(now())
  
  @@unique([enrollmentId, lessonId])
  @@index([enrollmentId])
  @@map("lesson_progress")
}

model Review {
  id            String   @id @default(cuid())
  
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  // Student
  studentId     String
  studentName   String
  
  // Review
  rating        Int      // 1-5
  title         String?
  comment       String?
  
  // Status
  isApproved    Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([courseId, studentId])
  @@index([courseId])
  @@map("reviews")
}
```

---

## APIs This Site Provides

### Public APIs

```typescript
// GET /api/classes - List all classes
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  const instructorId = searchParams.get('instructorId');
  
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      ...(level && { level: level as SkillLevel }),
      ...(instructorId && { instructorId })
    },
    include: {
      instructor: {
        select: {
          displayName: true,
          slug: true,
          photoUrl: true
        }
      }
    },
    take: 50
  });
  
  return Response.json({ courses });
}

// GET /api/instructors/:slug - Get instructor profile
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const instructor = await db.instructor.findUnique({
    where: { slug: params.slug },
    include: {
      courses: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            take: 1
          }
        }
      }
    }
  });
  
  if (!instructor) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  return Response.json({ instructor });
}

// GET /api/courses/:slug - Get course details
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      instructor: true,
      lessons: {
        where: { isPublished: true },
        orderBy: [
          { moduleNumber: 'asc' },
          { lessonNumber: 'asc' }
        ],
        select: {
          id: true,
          title: true,
          duration: true,
          isFree: true,
          moduleNumber: true,
          lessonNumber: true
        }
      },
      reviews: {
        where: { isApproved: true },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  return Response.json({ course });
}

// POST /api/enrollments - Enroll in course
export async function POST(req: Request) {
  const {
    courseId,
    studentId,
    studentName,
    studentEmail,
    paymentIntentId,
    paymentProcessor
  } = await req.json();
  
  // Verify payment
  const paymentVerified = await verifyPayment(paymentIntentId, paymentProcessor);
  if (!paymentVerified) {
    return Response.json({ error: 'Payment not verified' }, { status: 400 });
  }
  
  // Get course
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { lessons: true }
  });
  
  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  
  // Check if already enrolled
  const existing = await db.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId
      }
    }
  });
  
  if (existing) {
    return Response.json({ error: 'Already enrolled' }, { status: 400 });
  }
  
  // Calculate amounts
  const platformFee = course.price! * 0.10; // 10%
  const instructorPayout = course.price! * 0.90;
  
  // Create enrollment
  const enrollment = await db.enrollment.create({
    data: {
      studentId,
      studentNextAuthId: studentId,
      studentName,
      studentEmail,
      courseId,
      paymentProcessor,
      paymentIntentId,
      amountPaid: course.price!,
      platformFee,
      instructorPayout,
      hasAccess: true
    }
  });
  
  // Create progress tracking for each lesson
  for (const lesson of course.lessons) {
    await db.lessonProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id
      }
    });
  }
  
  // Update course stats
  await db.course.update({
    where: { id: courseId },
    data: {
      enrollmentCount: { increment: 1 }
    }
  });
  
  // Send enrollment email
  await sendEnrollmentEmail(studentEmail, course);
  
  // Webhook to main site
  await fetch('https://stepperslife.com/api/webhooks/classes', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-webhook-signature': signWebhook(enrollment)
    },
    body: JSON.stringify({
      event: 'enrollment.created',
      enrollmentId: enrollment.id,
      courseId: enrollment.courseId,
      studentId: enrollment.studentId
    })
  });
  
  return Response.json({ enrollment });
}

// GET /api/lessons/:id/stream - Get video stream URL
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get lesson
  const lesson = await db.lesson.findUnique({
    where: { id: params.id },
    include: { course: true }
  });
  
  if (!lesson) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Check if user has access (enrolled or free preview)
  if (!lesson.isFree) {
    const enrollment = await db.enrollment.findFirst({
      where: {
        studentNextAuthId: userId,
        courseId: lesson.courseId,
        hasAccess: true
      }
    });
    
    if (!enrollment) {
      return Response.json({ error: 'Not enrolled' }, { status: 403 });
    }
    
    // Update last accessed
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() }
    });
  }
  
  // Generate signed video URL (if using Mux)
  const streamUrl = generateSignedVideoUrl(lesson.videoUrl);
  
  return Response.json({ 
    streamUrl,
    duration: lesson.duration,
    title: lesson.title
  });
}

// POST /api/lessons/:id/progress - Update lesson progress
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { watchedSeconds, completed } = await req.json();
  
  // Find enrollment
  const enrollment = await db.enrollment.findFirst({
    where: {
      studentNextAuthId: userId,
      course: {
        lessons: {
          some: { id: params.id }
        }
      }
    }
  });
  
  if (!enrollment) {
    return Response.json({ error: 'Not enrolled' }, { status: 403 });
  }
  
  // Update progress
  const lesson = await db.lesson.findUnique({ where: { id: params.id } });
  const watchedPercent = (watchedSeconds / lesson!.duration) * 100;
  
  const progress = await db.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: params.id
      }
    },
    update: {
      watchedSeconds,
      watchedPercent,
      completed: completed || watchedPercent >= 90,
      completedAt: completed ? new Date() : undefined,
      lastWatchedAt: new Date()
    },
    create: {
      enrollmentId: enrollment.id,
      lessonId: params.id,
      watchedSeconds,
      watchedPercent,
      completed
    }
  });
  
  // Update overall course progress
  await updateCourseProgress(enrollment.id);
  
  return Response.json({ progress });
}
```

---

## Page Structure

```
app/
├── layout.tsx                    # Root layout (Green theme)
├── page.tsx                      # Landing/marketing
│
├── (onboarding)/
│   └── become-instructor/
│       ├── page.tsx             # Application form
│       ├── profile/page.tsx     # Create instructor profile
│       └── first-course/page.tsx # Upload first course
│
├── (dashboard)/                  # Instructor dashboard
│   ├── page.tsx                 # Dashboard home
│   │
│   └── instructor/
│       ├── courses/
│       │   ├── page.tsx         # Course list
│       │   ├── create/page.tsx  # Create course
│       │   └── [courseId]/
│       │       ├── page.tsx     # Course overview
│       │       ├── curriculum/page.tsx # Manage lessons
│       │       ├── students/page.tsx # Enrolled students
│       │       ├── reviews/page.tsx # Reviews
│       │       └── settings/page.tsx # Course settings
│       ├── lessons/
│       │   ├── upload/page.tsx  # Upload video
│       │   └── [lessonId]/page.tsx # Edit lesson
│       ├── students/page.tsx    # All students
│       ├── earnings/page.tsx    # Revenue analytics
│       └── profile/page.tsx     # Instructor profile
│
├── (student)/                    # Student interface
│   ├── my-classes/page.tsx      # Enrolled courses
│   └── learn/[courseId]/
│       ├── page.tsx             # Course player
│       └── [lessonId]/page.tsx  # Lesson player
│
└── api/
    ├── classes/route.ts         # List classes
    ├── instructors/
    │   └── [slug]/route.ts      # Get instructor
    ├── courses/
    │   └── [slug]/route.ts      # Get course
    ├── enrollments/route.ts     # Enroll
    ├── lessons/
    │   ├── [id]/
    │   │   ├── stream/route.ts  # Get video URL
    │   │   └── progress/route.ts # Update progress
    │   └── upload/route.ts      # Upload video
    ├── dashboard/
    │   ├── courses/route.ts     # Instructor's courses
    │   ├── students/route.ts    # Enrolled students
    │   └── earnings/route.ts    # Revenue data
    └── webhooks/
        ├── stripe/route.ts
        ├── paypal/route.ts
        └── mux/route.ts         # Video processing webhooks
```

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stepperslife_classes"
REDIS_URL="redis://localhost:6379/4"

# NextAuth (SAME)
NEXTAUTH_URL="https://stepperslife.com"
NEXTAUTH_SECRET="your-secret-key"
# Optional OAuth providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# MinIO (File Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9004
MINIO_ACCESS_KEY="classes_minio"
MINIO_SECRET_KEY="classes_secret"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="classes"

# Stripe/PayPal (SAME)
STRIPE_SECRET_KEY="sk_live_..."
PAYPAL_CLIENT_ID="..."

# Video Hosting (Choose one)
# Option 1: Mux (Recommended)
MUX_TOKEN_ID="..."
MUX_TOKEN_SECRET="..."
MUX_WEBHOOK_SECRET="..."

# Option 2: MinIO + FFmpeg
MINIO_BUCKET="stepperslife-videos"
FFMPEG_PATH="/usr/bin/ffmpeg"

# Email
RESEND_API_KEY="re_..."

# Main Site Integration
MAIN_SITE_WEBHOOK_URL="https://stepperslife.com/api/webhooks/classes"
WEBHOOK_SECRET="..."

# App Config
NEXT_PUBLIC_APP_URL="https://classes.stepperslife.com"
PORT=3009
```

---

## Design System

```css
/* app/globals.css */
@import '@stepperslife/ui/styles/globals.css';

:root {
  --primary: #10b981;  /* Green */
  --sidebar-primary: #10b981;
  --ring: #10b981;
}
```

---

## Video Handling

### Using Mux (Recommended)

```typescript
// lib/video/mux.ts
import Mux from '@mux/mux-node';

const mux = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function uploadVideoToMux(videoFile: File) {
  // Create upload URL
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['signed'],
      encoding_tier: 'baseline'
    }
  });
  
  // Upload video
  const formData = new FormData();
  formData.append('file', videoFile);
  
  await fetch(upload.url, {
    method: 'PUT',
    body: formData
  });
  
  return upload.asset_id;
}

export function generateSignedPlaybackUrl(playbackId: string) {
  // Generate signed URL (expires in 24 hours)
  const signedUrl = mux.video.assets.createPlaybackId(playbackId, {
    policy: 'signed',
    expires_at: Date.now() + 86400000 // 24 hours
  });
  
  return signedUrl;
}
```

### Video Upload Flow

```typescript
// app/api/lessons/upload/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const formData = await req.formData();
  
  const videoFile = formData.get('video') as File;
  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  
  // Verify instructor owns this course
  const course = await db.course.findFirst({
    where: {
      id: courseId,
      instructor: { userNextAuthId: userId }
    }
  });
  
  if (!course) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Upload to Mux
  const assetId = await uploadVideoToMux(videoFile);
  
  // Create lesson (status: processing)
  const lesson = await db.lesson.create({
    data: {
      courseId,
      instructorId: course.instructorId,
      title,
      videoId: assetId,
      videoUrl: '', // Will be updated by webhook
      duration: 0,  // Will be updated by webhook
      isPublished: false
    }
  });
  
  return Response.json({ 
    lesson,
    status: 'processing',
    message: 'Video is being processed. You will be notified when ready.'
  });
}

// Webhook from Mux when video is ready
// app/api/webhooks/mux/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('mux-signature');
  
  // Verify webhook
  const isValid = Mux.webhooks.verifyHeader(
    body,
    signature!,
    process.env.MUX_WEBHOOK_SECRET!
  );
  
  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  if (event.type === 'video.asset.ready') {
    const asset = event.data;
    
    // Update lesson with video details
    await db.lesson.updateMany({
      where: { videoId: asset.id },
      data: {
        videoUrl: asset.playback_ids[0].id,
        duration: Math.round(asset.duration),
        thumbnailUrl: `https://image.mux.com/${asset.playback_ids[0].id}/thumbnail.jpg`,
        isPublished: true
      }
    });
    
    // Notify instructor
    const lesson = await db.lesson.findFirst({
      where: { videoId: asset.id },
      include: { instructor: true }
    });
    
    await sendEmail(lesson!.instructor.email, {
      subject: 'Video Processing Complete',
      message: `Your lesson "${lesson!.title}" is ready!`
    });
  }
  
  return Response.json({ received: true });
}
```

---

## Integration Checklist

**Before Launch:**

- [ ] NextAuth SSO configured
- [ ] Database schema implemented
- [ ] Video hosting setup (Mux)
- [ ] Stripe/PayPal integration
- [ ] Instructor onboarding flow
- [ ] Course creation wizard
- [ ] Video upload system
- [ ] Video player (with progress tracking)
- [ ] Enrollment system
- [ ] Student dashboard
- [ ] Instructor analytics
- [ ] Email notifications
- [ ] Public APIs for main site
- [ ] Webhooks to main site
- [ ] Mobile responsive

---

**End of Classes Platform Specification**