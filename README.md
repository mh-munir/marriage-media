# Marriage Media 🤵👰

Bangladesh's most trusted matrimony platform. Find your perfect life partner with advanced AI matching, verified profiles, and real-time communication features.

## 🚀 Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- Email verification with OTP
- Phone OTP verification
- CSRF protection, XSS prevention, SQL injection prevention
- Rate limiting per endpoint
- Secure HTTP headers (Helmet-like)
- Session management with device tracking
- Login history and audit logs

### Profile Management
- Comprehensive profile creation with 50+ fields
- Photo upload with Cloudinary integration
- Profile boost for premium visibility
- Profile completion tracking
- Horoscope matching
- Contact info visibility controls

### AI-Powered Features
- **AI Match Recommendation** - Smart matching based on preferences and behavior
- **AI Compatibility Score** - Calculate compatibility between profiles
- **AI Bio Generator** - Generate engaging profile bios
- **AI Conversation Starter** - AI-suggested conversation openers
- **AI Fake Profile Detection** - Detect suspicious profiles
- **AI Image Analysis** - Profile photo quality analysis

### Payment System
- **Stripe** - International payments
- **SSLCommerz** - Bangladesh local payments
- **bKash** - Mobile financial service
- **Nagad** - Digital payment platform
- **PayPal** - International payments
- Checkout, webhooks, invoices, payment history
- Refund support with 30-day window
- Failed payment recovery

### Premium Membership
- **Free** - Basic features
- **Silver** - View contacts, 30 interests/day
- **Gold** - Unlimited interests, AI matching, priority support
- **Platinum** - Video calling, verification badge, dedicated manager
- Auto-renewal, upgrade/downgrade support

### Communication
- Real-time messaging with Socket.io
- Audio/Video calling with WebRTC
- Screen sharing
- Call history tracking
- Incoming call UI with accept/decline

### Notifications
- In-app notifications
- Browser push notifications (FCM/Web Push)
- Email notifications (SMTP)
- Notification preferences with quiet hours
- Real-time notification panel

### Verification
- Email verification
- Phone OTP verification
- NID verification (admin approval workflow)
- Face verification
- Blue verified badge

### Admin Panel
- Dashboard analytics
- User management (block/unblock)
- Verification approval workflow
- Fraud detection logs
- CMS management
- Coupon management
- Audit log viewer

### SEO
- Comprehensive metadata
- Open Graph tags
- Twitter Card support
- JSON-LD structured data
- Breadcrumb schema
- Dynamic sitemap
- Robots.txt
- Canonical URLs

### Performance
- Next.js 16 with Turbopack
- Lazy loading components
- Infinite scroll
- Image optimization with Sharp
- Redis caching with in-memory fallback
- Code splitting
- Bundle optimization

### Dark Mode
- System preference detection
- Manual toggle
- Persistent theme selection

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose
- **Cache**: Redis (with in-memory fallback)
- **Auth**: JWT with refresh tokens
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **State**: Zustand, React Query
- **Real-time**: Socket.io
- **Video**: WebRTC
- **Email**: Nodemailer (SMTP)
- **Payments**: Stripe, SSLCommerz, bKash, Nagad, PayPal
- **Storage**: Cloudinary
- **Notifications**: Firebase Cloud Messaging, Web Push
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- Node.js 18+ (recommended: 20)
- MongoDB (Atlas or local)
- Redis (optional, falls back to in-memory cache)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mh-munir/marriage-media.git
   cd marriage-media
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables in `.env.local`.

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

### Required
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `NEXTAUTH_SECRET` | NextAuth secret |

### Optional
| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `SSLCOMMERZ_STORE_ID` | SSLCommerz store ID |
| `BKASH_APP_KEY` | bKash app key |
| `FIREBASE_PROJECT_ID` | Firebase project ID |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── chat/              # Chat components
│   ├── layout/            # Layout components
│   ├── notifications/     # Notification components
│   ├── search/            # Search components
│   ├── seo/               # SEO components
│   ├── ui/                # UI primitives
│   └── video/             # Video call components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── ai-*.ts            # AI feature implementations
│   ├── auth.ts            # Authentication utilities
│   ├── mongodb.ts         # Database connection
│   ├── notifications.ts   # Notification service
│   ├── payment-gateway.ts # Payment integrations
│   ├── redis.ts           # Cache layer
│   └── security.ts        # Security utilities
├── models/                # Mongoose models
├── providers/             # React context providers
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
```

## 🚢 Deployment

### Docker
```bash
docker build -t marriage-media .
docker run -p 3000:3000 marriage-media
```

### Docker Compose
```bash
docker-compose up -d
```

### Vercel
```bash
npx vercel
```

## 📄 License

All rights reserved. This is proprietary software.

## 📞 Support

- **Email**: support@marriagemedia.com
- **Phone**: +880-1XXXXXXXXX
- **Documentation**: https://docs.marriagemedia.com