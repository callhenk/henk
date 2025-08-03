# Project Overview

## What is Henk?

**Henk** is an AI-powered voice fundraising platform that enables charities to engage donors through natural phone conversations at scale. By combining synthetic speech, CRM integration, and compliance-centric design, Henk reduces operational costs while improving donor experience and conversion rates.

### 🎯 Mission

Transform traditional fundraising by making AI-powered phone calls that feel human, personal, and effective. We help charities reach more donors, have meaningful conversations, and increase donation rates through intelligent voice technology.

### 🚀 Key Features

- **AI-Powered Voice Calls**: Natural, conversational AI that can engage donors in meaningful dialogue
- **CRM Integration**: Seamless connection with existing donor management systems
- **Compliance-First Design**: Built with fundraising regulations and best practices in mind
- **Scalable Architecture**: Handle thousands of concurrent calls with intelligent routing
- **Real-time Analytics**: Track call performance, donor engagement, and conversion metrics
- **Multi-language Support**: Reach donors in their preferred language

## 🏗️ Technical Architecture

### Monorepo Structure

This project uses a **Turbo monorepo** architecture with the following structure:

```
henk/
├── apps/
│   ├── web/                 # Next.js web application
│   └── e2e/                 # End-to-end testing
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── auth/                # Authentication system
│   ├── accounts/            # User account management
│   ├── supabase/            # Database and backend services
│   ├── i18n/                # Internationalization
│   ├── next/                # Next.js utilities
│   └── shared/              # Shared utilities and types
└── tooling/                 # Development tools and configs
```

### Core Technologies

| Layer                | Technology              | Purpose                                      |
| -------------------- | ----------------------- | -------------------------------------------- |
| **Frontend**         | Next.js 15 + TypeScript | Modern React framework with App Router       |
| **Styling**          | Tailwind CSS v4         | Utility-first CSS framework                  |
| **UI Components**    | Radix UI + Shadcn UI    | Accessible, customizable components          |
| **Database**         | Supabase (PostgreSQL)   | Backend-as-a-Service with real-time features |
| **Authentication**   | Supabase Auth           | Built-in auth with MFA support               |
| **Voice AI**         | ElevenLabs              | Natural speech synthesis and conversation    |
| **Telephony**        | Twilio                  | Voice calls, SMS, and webhook handling       |
| **State Management** | React Query             | Server state management and caching          |
| **Deployment**       | Vercel                  | Serverless deployment platform               |

## 🎨 Design Philosophy

### User Experience

- **Accessibility First**: WCAG 2.1 AA compliant components
- **Mobile Responsive**: Optimized for all device sizes
- **Performance**: Fast loading times and smooth interactions
- **Intuitive**: Clear navigation and user flows

### Code Quality

- **Type Safety**: Full TypeScript coverage
- **Modularity**: Reusable components and utilities
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear, up-to-date documentation

## 🔒 Security & Compliance

### Data Protection

- **GDPR Compliant**: European data protection standards
- **SOC 2 Ready**: Security controls and monitoring
- **Encryption**: Data encrypted in transit and at rest
- **Access Control**: Role-based permissions and audit logs

### Fundraising Compliance

- **PCI DSS**: Secure payment processing
- **Charity Regulations**: Built-in compliance features
- **Audit Trails**: Complete activity logging
- **Data Retention**: Configurable retention policies

## 🚀 Performance Goals

### Scalability

- **Concurrent Calls**: Support 10,000+ simultaneous calls
- **Response Time**: <100ms API response times
- **Uptime**: 99.9% availability target
- **Global Reach**: Multi-region deployment

### User Experience

- **Page Load**: <2 seconds initial load time
- **Interactive**: <100ms interaction response
- **Mobile**: Optimized for mobile devices
- **Offline**: Graceful degradation when offline

## 📈 Success Metrics

### Technical Metrics

- **System Uptime**: 99.9%
- **API Response Time**: <100ms average
- **Error Rate**: <0.1% of requests
- **Test Coverage**: >90% code coverage

### Business Metrics

- **Donor Engagement**: Increased call completion rates
- **Conversion Rates**: Higher donation conversion
- **Cost Reduction**: Lower operational costs
- **User Satisfaction**: High user satisfaction scores

---

## 🎯 Getting Started

Ready to dive in? Start with:

1. **[Quick Start Guide](./quick-start.md)** - Get up and running in 10 minutes
2. **[Development Setup](./development-setup.md)** - Complete development environment
3. **[Project Structure](./project-structure.md)** - Understand the codebase organization

---

_This documentation is maintained by the Henk development team. For questions or contributions, please refer to the [Development Workflow](./development-workflow.md)._
