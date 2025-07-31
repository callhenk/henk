# Integrations Page Documentation

## Overview

The **Integrations** page allows users to connect and manage third-party tools and services to streamline their fundraising workflow. This page provides a centralized hub for managing all external integrations with AI voice fundraising campaigns.

## Page Structure

### **URL Path**

```
/home/integrations
```

### **Navigation**

- **Sidebar**: "Integrations" with Database icon
- **Active State**: Highlighted in blue when current page

## Components

### **1. Page Header**

```typescript
<PageHeader
  title="Integrations"
  description="Connect your favorite tools to streamline your fundraising workflow"
/>
```

### **2. Stats Cards Section**

Three key metrics displayed in a responsive grid:

#### **Connected Integrations**

- **Value**: Number of active integrations
- **Subtitle**: "Active connections"
- **Icon**: `CheckCircle`
- **Color**: Green theme

#### **Available Integrations**

- **Value**: Total number of integrations
- **Subtitle**: "Total integrations"
- **Icon**: `Puzzle`
- **Color**: Default theme

#### **Popular Integrations**

- **Value**: Number of popular integrations
- **Subtitle**: "Most used tools"
- **Icon**: `BarChart3`
- **Color**: Default theme

### **3. Category Tabs**

Filter integrations by category:

- **All** (default)
- **CRM**
- **Payments**
- **Marketing**
- **Communication**
- **Automation**
- **Scheduling**
- **Analytics**

### **4. Integration Cards Grid**

3-column responsive grid displaying integration cards.

## Integration Card Structure

### **Card Header**

- **Icon**: Service-specific icon in muted background
- **Name**: Integration name (e.g., "Salesforce CRM")
- **Tags**: Category and popularity badges
- **Status Indicator**: Green checkmark for connected integrations
- **Toggle Switch**: Enable/disable integration

### **Card Content**

- **Description**: Brief explanation of the integration
- **Status Text**: "Connected" or "Not Connected"
- **Configure Button**: Only shown for connected integrations

## Mock Data Structure

### **Integration Interface**

```typescript
interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  isConnected: boolean;
  isPopular?: boolean;
  tags: string[];
}
```

### **Sample Integrations**

#### **CRM Integrations**

```typescript
{
  id: 'salesforce',
  name: 'Salesforce CRM',
  description: 'Sync donor data and manage relationships',
  category: 'CRM',
  icon: Database,
  isConnected: true,
  isPopular: true,
  tags: ['CRM', 'Popular'],
},
{
  id: 'hubspot',
  name: 'HubSpot CRM',
  description: 'Customer relationship management platform',
  category: 'CRM',
  icon: Users,
  isConnected: false,
  isPopular: true,
  tags: ['CRM', 'Popular'],
}
```

#### **Payment Integrations**

```typescript
{
  id: 'stripe',
  name: 'Stripe',
  description: 'Process donations and recurring payments',
  category: 'Payments',
  icon: Database,
  isConnected: true,
  isPopular: true,
  tags: ['Payments', 'Popular'],
},
{
  id: 'paypal',
  name: 'PayPal',
  description: 'Alternative payment processing',
  category: 'Payments',
  icon: Database,
  isConnected: false,
  tags: ['Payments'],
}
```

#### **Marketing Integrations**

```typescript
{
  id: 'mailchimp',
  name: 'Mailchimp',
  description: 'Email marketing and automation',
  category: 'Marketing',
  icon: Mail,
  isConnected: false,
  isPopular: true,
  tags: ['Marketing', 'Popular'],
}
```

#### **Communication Integrations**

```typescript
{
  id: 'twilio',
  name: 'Twilio',
  description: 'SMS and voice communication platform',
  category: 'Communication',
  icon: Phone,
  isConnected: true,
  tags: ['Communication'],
}
```

#### **Automation Integrations**

```typescript
{
  id: 'zapier',
  name: 'Zapier',
  description: 'Automate workflows between apps',
  category: 'Automation',
  icon: Settings,
  isConnected: false,
  tags: ['Automation'],
}
```

#### **Scheduling Integrations**

```typescript
{
  id: 'calendly',
  name: 'Calendly',
  description: 'Schedule follow-up appointments',
  category: 'Scheduling',
  icon: Calendar,
  isConnected: false,
  tags: ['Scheduling'],
}
```

#### **Analytics Integrations**

```typescript
{
  id: 'google-analytics',
  name: 'Google Analytics',
  description: 'Track campaign performance and insights',
  category: 'Analytics',
  icon: BarChart3,
  isConnected: false,
  tags: ['Analytics'],
}
```

## State Management

### **Local State**

```typescript
const [selectedCategory, setSelectedCategory] = useState('All');
const [integrations, setIntegrations] = useState(mockIntegrations);
```

### **Computed Values**

```typescript
const connectedIntegrations = integrations.filter(
  (int) => int.isConnected,
).length;
const availableIntegrations = integrations.length;
const popularIntegrations = integrations.filter((int) => int.isPopular).length;
```

### **Filtering Logic**

```typescript
const filteredIntegrations =
  selectedCategory === 'All'
    ? integrations
    : integrations.filter((int) => int.category === selectedCategory);
```

## User Interactions

### **1. Category Filtering**

- Click on category tabs to filter integrations
- "All" shows all integrations
- Other categories show only relevant integrations

### **2. Integration Toggle**

- Click toggle switch to connect/disconnect integration
- Updates local state immediately
- Shows/hides configure button based on connection status

### **3. Configuration**

- Click "Configure" button for connected integrations
- Opens integration-specific configuration modal (future feature)

## Responsive Design

### **Desktop (lg+)**

- 3-column grid for integration cards
- Full-width category tabs
- Side-by-side stats cards

### **Tablet (md)**

- 2-column grid for integration cards
- Wrapped category tabs
- Stacked stats cards

### **Mobile (sm)**

- 1-column grid for integration cards
- Scrollable category tabs
- Stacked stats cards

## Accessibility Features

### **Keyboard Navigation**

- Tab navigation through all interactive elements
- Enter/Space to toggle integration switches
- Arrow keys for category tab navigation

### **Screen Reader Support**

- Proper ARIA labels for toggle switches
- Descriptive text for integration status
- Clear heading hierarchy

### **Visual Indicators**

- Color-coded status indicators
- Clear visual distinction between connected/disconnected
- High contrast for important actions

## Future Enhancements

### **Planned Features**

1. **Integration Configuration Modal**
   - API key management
   - Webhook configuration
   - Data mapping settings

2. **Real-time Status**
   - Live connection status
   - Error reporting
   - Health monitoring

3. **Advanced Filtering**
   - Search functionality
   - Sort by popularity/status
   - Filter by connection status

4. **Integration Analytics**
   - Usage statistics
   - Performance metrics
   - Error rates

5. **Bulk Operations**
   - Select multiple integrations
   - Bulk enable/disable
   - Batch configuration

### **API Integration**

```typescript
// Future API endpoints
GET /api/integrations
POST /api/integrations/:id/connect
POST /api/integrations/:id/disconnect
GET /api/integrations/:id/status
PUT /api/integrations/:id/config
```

## Error Handling

### **Connection Failures**

- Display error messages for failed connections
- Retry mechanisms for temporary failures
- Graceful degradation for unavailable services

### **Configuration Errors**

- Validation for required fields
- Clear error messages for invalid settings
- Help text for complex configurations

## Performance Considerations

### **Optimizations**

- Lazy loading of integration details
- Cached integration status
- Debounced toggle actions
- Optimistic UI updates

### **Bundle Size**

- Dynamic imports for integration-specific components
- Icon optimization
- Minimal dependencies

## Testing Strategy

### **Unit Tests**

- Integration card rendering
- Toggle functionality
- Category filtering
- Stats calculation

### **Integration Tests**

- End-to-end connection flow
- Error handling scenarios
- Responsive behavior

### **Accessibility Tests**

- Keyboard navigation
- Screen reader compatibility
- Color contrast validation

## Dependencies

### **Core Dependencies**

- `@kit/ui/page` - Page layout components
- `@kit/ui/card` - Card components
- `@kit/ui/switch` - Toggle switches
- `@kit/ui/tabs` - Category filtering
- `@kit/ui/badge` - Status badges
- `@kit/ui/button` - Action buttons

### **Shared Components**

- `StatsCard` - Metrics display
- `LoadingOverlay` - Loading states

### **Icons**

- `lucide-react` - All interface icons

## File Structure

```
apps/web/app/home/integrations/
├── page.tsx                    # Main page component
├── layout.tsx                  # Layout wrapper
├── loading.tsx                 # Loading component
└── _components/
    └── integrations-list.tsx   # Main integrations component
```

## Related Documentation

- [Campaigns Page](./CAMPAIGNS_PAGE.md) - Campaign management
- [Agents Page](./AGENT_PAGE.md) - AI agent management
- [Conversations Page](./CONVERSATIONS_PAGE.md) - Call tracking
- [Dashboard Page](./DASHBOARD_PAGE.md) - Overview metrics
- [Documentation Index](./DOCUMENTATION_INDEX.md) - Complete documentation guide
