# Tech Stack

This document provides a comprehensive overview of all technologies used in the Henk project, explaining why each technology was chosen and how they work together.

## 🏗️ Architecture Overview

Henk uses a modern, scalable architecture built with the following technology stack:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│   (Vercel)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voice AI      │    │   Database      │    │   Monitoring    │
│   (ElevenLabs)  │    │   (PostgreSQL)  │    │   (Analytics)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telephony     │    │   Auth          │    │   Logging       │
│   (Twilio)      │    │   (Supabase)    │    │   (Pino)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Frontend Technologies

### Next.js 15

**Purpose**: Full-stack React framework with App Router
**Why Chosen**:

- Server-side rendering for better SEO
- API routes for backend functionality
- Built-in optimization and caching
- Excellent developer experience

**Key Features Used**:

- App Router for file-based routing
- Server Components for improved performance
- API Routes for backend endpoints
- Middleware for request processing

### React 19

**Purpose**: UI library for building user interfaces
**Why Chosen**:

- Declarative component-based architecture
- Large ecosystem and community
- Excellent TypeScript support
- Concurrent features for better UX

### TypeScript 5.7

**Purpose**: Type-safe JavaScript
**Why Chosen**:

- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code
- Improved refactoring capabilities

### Tailwind CSS v4

**Purpose**: Utility-first CSS framework
**Why Chosen**:

- Rapid UI development
- Consistent design system
- Small bundle size
- Excellent customization

## 🎨 UI & Styling

### Radix UI

**Purpose**: Accessible UI primitives
**Why Chosen**:

- WCAG 2.1 AA compliant
- Unstyled components for flexibility
- Excellent keyboard navigation
- Screen reader support

### Shadcn UI

**Purpose**: Pre-built component library
**Why Chosen**:

- Built on Radix UI primitives
- Consistent design patterns
- Easy customization
- Copy-paste components

### Lucide React

**Purpose**: Icon library
**Why Chosen**:

- Consistent icon style
- Tree-shakeable
- TypeScript support
- Lightweight

## 🗄️ Backend & Database

### Supabase

**Purpose**: Backend-as-a-Service
**Why Chosen**:

- PostgreSQL database
- Real-time subscriptions
- Built-in authentication
- Row-level security
- Auto-generated APIs

**Components Used**:

- **Database**: PostgreSQL 16
- **Auth**: Supabase Auth with MFA
- **Storage**: File storage
- **Edge Functions**: Serverless functions
- **Realtime**: Live data subscriptions

### PostgreSQL 16

**Purpose**: Primary database
**Why Chosen**:

- ACID compliance
- Excellent performance
- Rich feature set
- Strong community support

## 🔐 Authentication & Security

### Supabase Auth

**Purpose**: User authentication and authorization
**Features**:

- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- Row-level security (RLS)
- Session management

### CSRF Protection

**Purpose**: Cross-site request forgery protection
**Implementation**: `@edge-csrf/nextjs`
**Why Chosen**:

- Edge-compatible
- Lightweight
- Easy integration

### CAPTCHA

**Purpose**: Bot protection
**Implementation**: Cloudflare Turnstile
**Why Chosen**:

- Privacy-focused
- No cookies required
- Easy integration

## 🎤 Voice & AI Technologies

### ElevenLabs

**Purpose**: AI voice synthesis and conversation
**Features**:

- Natural speech synthesis
- Conversational AI
- Multi-language support
- Voice cloning capabilities

### Twilio

**Purpose**: Telephony and communication
**Services Used**:

- **Programmable Voice**: Outbound calls
- **TwiML**: Voice markup language
- **Webhooks**: Event handling
- **SMS**: Text messaging

## 📊 State Management & Data Fetching

### React Query (TanStack Query)

**Purpose**: Server state management
**Why Chosen**:

- Automatic caching
- Background updates
- Optimistic updates
- Error handling
- Loading states

### React Hook Form

**Purpose**: Form management
**Why Chosen**:

- Performance optimized
- TypeScript support
- Validation integration
- Easy testing

## 🌐 Internationalization

### React i18next

**Purpose**: Multi-language support
**Features**:

- Dynamic language switching
- Pluralization support
- Namespace organization
- TypeScript integration

## 🧪 Testing

### Jest

**Purpose**: Unit testing framework
**Why Chosen**:

- Fast execution
- Snapshot testing
- Mocking capabilities
- Excellent integration

### React Testing Library

**Purpose**: Component testing
**Why Chosen**:

- User-centric testing
- Accessibility testing
- Real DOM testing
- Best practices

### Playwright

**Purpose**: End-to-end testing
**Why Chosen**:

- Cross-browser testing
- Reliable automation
- Network interception
- Visual testing

## 🚀 Deployment & Infrastructure

### Vercel

**Purpose**: Hosting and deployment
**Why Chosen**:

- Zero-config deployment
- Automatic preview deployments
- Edge functions
- Global CDN
- Analytics integration

### Docker

**Purpose**: Local development environment
**Used For**:

- Supabase local development
- Consistent environments
- Easy setup

## 📈 Monitoring & Analytics

### Pino

**Purpose**: Logging
**Why Chosen**:

- High performance
- JSON output
- Child loggers
- Request logging

### Vercel Analytics

**Purpose**: Web analytics
**Features**:

- Core Web Vitals
- Performance monitoring
- User behavior tracking

### Logtail

**Purpose**: Log aggregation
**Features**:

- Centralized logging
- Real-time monitoring
- Alerting

## 🛠️ Development Tools

### Turbo

**Purpose**: Monorepo build system
**Why Chosen**:

- Incremental builds
- Parallel execution
- Caching
- Task dependencies

### pnpm

**Purpose**: Package manager
**Why Chosen**:

- Disk space efficient
- Fast installation
- Workspace support
- Strict dependency resolution

### ESLint

**Purpose**: Code linting
**Configuration**:

- TypeScript support
- React rules
- Accessibility rules
- Import sorting

### Prettier

**Purpose**: Code formatting
**Features**:

- Opinionated formatting
- Editor integration
- Git hooks integration

## 📦 Package Architecture

### Monorepo Structure

```
henk/
├── apps/
│   ├── web/          # Next.js application
│   └── e2e/          # End-to-end tests
├── packages/
│   ├── ui/           # Shared UI components
│   ├── auth/         # Authentication
│   ├── accounts/     # User management
│   ├── supabase/     # Database utilities
│   ├── i18n/         # Internationalization
│   ├── next/         # Next.js utilities
│   └── shared/       # Common utilities
└── tooling/          # Development tools
```

## 🔧 Build & Development Tools

### TypeScript Configuration

- **Strict mode**: Enabled for type safety
- **Path mapping**: For clean imports
- **Incremental builds**: For faster compilation

### Build Optimization

- **Tree shaking**: Remove unused code
- **Code splitting**: Dynamic imports
- **Bundle analysis**: Size monitoring
- **Minification**: Production builds

## 🚀 Performance Optimizations

### Frontend

- **Code splitting**: Dynamic imports
- **Image optimization**: Next.js Image component
- **Font optimization**: Next.js font loading
- **Caching**: React Query caching

### Backend

- **Database indexing**: Optimized queries
- **Connection pooling**: Efficient database connections
- **Caching**: Redis for session storage
- **CDN**: Global content delivery

## 🔒 Security Measures

### Data Protection

- **Encryption**: Data encrypted in transit and at rest
- **Row-level security**: Database-level access control
- **Input validation**: Zod schema validation
- **CSRF protection**: Cross-site request forgery prevention

### Authentication

- **Multi-factor authentication**: Enhanced security
- **Session management**: Secure session handling
- **Password policies**: Strong password requirements
- **Rate limiting**: API abuse prevention

## 📊 Scalability Considerations

### Horizontal Scaling

- **Stateless design**: Easy horizontal scaling
- **Database sharding**: For large datasets
- **CDN**: Global content delivery
- **Load balancing**: Traffic distribution

### Performance Monitoring

- **Real-time metrics**: Application performance
- **Error tracking**: Bug monitoring
- **User analytics**: Behavior tracking
- **Infrastructure monitoring**: System health

---

## 🎯 Technology Decisions

### Why This Stack?

1. **Developer Experience**: Modern tools with excellent DX
2. **Performance**: Fast loading and smooth interactions
3. **Scalability**: Built for growth from day one
4. **Security**: Enterprise-grade security measures
5. **Maintainability**: Clean architecture and best practices

### Future Considerations

- **Microservices**: For complex features
- **GraphQL**: For flexible data fetching
- **WebRTC**: For real-time communication
- **WebAssembly**: For performance-critical code

---

_This tech stack provides a solid foundation for building a scalable, maintainable, and performant application. For implementation details, see the individual documentation files._
