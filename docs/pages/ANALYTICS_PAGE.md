# 📈 Analytics Page

## 📋 Overview

The Analytics page provides real-time and historical insights into campaign performance, agent efficiency, and donor engagement. It enables data-driven decisions through interactive charts, key metrics, filtering tools, and export features. The page tracks KPIs like conversion rate, revenue, and engagement trends to help optimize fundraising campaigns.

---

## 📄 Page Details

- **Route:** `/home/analytics`
- **Component:** `<AnalyticsPage />`
- **Permissions:** Accessible to users with `admin` or `analyst` roles
- **Data Sources:** Supabase (campaigns, agents, conversations, payments)
- **Layout:** Full-width dashboard layout with cards, charts, and filters

---

## 🎨 UI/UX Features

### 🔢 Metric Cards (Top Summary)

```typescript
interface AnalyticsMetrics {
  totalCalls: number;
  successfulCalls: number;
  conversionRate: number;
  revenueGenerated: number;
  averageCallDuration: number;
  topPerformingAgent: string;
}
```

- **Total Calls Made** - Total number of calls across all campaigns
- **Successful Calls** - Calls that resulted in a pledge or callback
- **Conversion Rate** - Percentage of successful calls vs total calls
- **Revenue Generated** - Total pledged amount (in USD)
- **Average Call Duration** - Mean call length in minutes
- **Top Performing Agent** - Agent with highest conversion rate

### 📊 Interactive Charts

#### Campaign Performance Over Time

```typescript
interface PerformanceChart {
  date: string;
  calls: number;
  conversions: number;
  revenue: number;
}
```

- Line chart with metric toggles: `Calls`, `Conversions`, `Revenue`
- Date range selector (7 days, 30 days, custom)
- Hover tooltips with detailed metrics

#### Conversion by Time of Day

```typescript
interface TimeOfDayData {
  hour: number;
  calls: number;
  conversions: number;
  conversionRate: number;
}
```

- Heatmap showing conversion rates by hour
- Helps identify optimal calling hours
- Color-coded: green (high conversion) to red (low conversion)

#### Agent Comparison

```typescript
interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalCalls: number;
  conversions: number;
  conversionRate: number;
  averageCallDuration: number;
  revenue: number;
}
```

- Bar chart comparing agent performance
- Sortable by different metrics
- Filter by campaign and date range

#### Lead Funnel Analysis

```typescript
interface FunnelData {
  stage: 'leads' | 'contacted' | 'pledged' | 'paid';
  count: number;
  percentage: number;
  dropoffRate: number;
}
```

- Visual funnel showing conversion at each stage
- Drop-off analysis with reasons
- Revenue impact at each stage

### 📅 Date Range Selector

```typescript
interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: '7d' | '30d' | '90d' | 'thisMonth' | 'custom';
}
```

- Presets: `Last 7 Days`, `Last 30 Days`, `Last 90 Days`, `This Month`, `Custom`
- Date picker for custom ranges
- Quick comparison with previous period

### 🗂 Filters

```typescript
interface AnalyticsFilters {
  campaignId?: string;
  agentId?: string;
  voiceType?: 'elevenlabs' | 'custom';
  outcomeType?: 'pledged' | 'callback' | 'not_interested';
  dateRange: DateRange;
}
```

- **Campaign** - Dropdown with all campaigns
- **Agent** - Dropdown with all agents
- **Voice Type** - ElevenLabs vs Custom voice
- **Outcome Type** - Pledged, Callback Requested, Not Interested

### 📤 Export Options

- **CSV Export** - Summary metrics or detailed call logs
- **Chart Export** - PNG or PDF format
- **Report Generation** - Scheduled weekly/monthly reports

---

## 🔧 Technical Implementation

### File Structure

```
apps/web/app/home/analytics/
├── page.tsx                    # Main analytics page
├── _components/
│   ├── analytics-metrics.tsx   # Top metric cards
│   ├── performance-chart.tsx   # Campaign performance chart
│   ├── time-of-day-chart.tsx  # Conversion by time chart
│   ├── agent-comparison.tsx   # Agent performance chart
│   ├── funnel-analysis.tsx    # Lead funnel chart
│   ├── analytics-filters.tsx  # Filter controls
│   └── export-controls.tsx    # Export functionality
└── loading.tsx                # Loading state
```

### Data Models

```typescript
// Analytics data interfaces
interface AnalyticsData {
  metrics: AnalyticsMetrics;
  performanceChart: PerformanceChart[];
  timeOfDayData: TimeOfDayData[];
  agentPerformance: AgentPerformance[];
  funnelData: FunnelData[];
}

// API response
interface AnalyticsResponse {
  data: AnalyticsData;
  filters: AnalyticsFilters;
  lastUpdated: string;
}
```

### State Management

```typescript
// Analytics page state
interface AnalyticsState {
  data: AnalyticsData | null;
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
  selectedMetrics: string[];
  exportFormat: 'csv' | 'png' | 'pdf';
}
```

### API Integration

```typescript
// Server action for fetching analytics
export async function getAnalyticsData(
  filters: AnalyticsFilters,
): Promise<AnalyticsResponse> {
  // Supabase query with filters
  // Aggregate data for charts
  // Return formatted response
}
```

---

## 📊 Performance & Scalability

### Caching Strategy

- **Redis caching** for aggregated metrics (5-minute TTL)
- **Supabase RLS** for data security
- **CDN** for static chart assets

### Optimization Techniques

- **Lazy loading** for charts (only render when in viewport)
- **Debounced filters** (300ms delay)
- **Pagination** for large result sets
- **Virtual scrolling** for long lists

### Reusable Components

- **Chart components** from `@kit/ui/charts`
- **Filter components** shared across pages
- **Export utilities** in `packages/shared`

---

## 🎯 User Experience Highlights

### Key Features

- 📌 **Pinnable metrics** - Pin important metrics to top
- 🎯 **Actionable insights** - "Wednesdays at 5PM = best call time"
- 🔍 **Deep drill-down** - Click chart elements to see detailed data
- 📥 **Clean exports** - Professional reports for stakeholders
- 📱 **Mobile responsive** - All charts adapt to mobile view

### Interactive Elements

- **Hover tooltips** with detailed metrics
- **Click-to-filter** from chart elements
- **Real-time updates** (optional auto-refresh)
- **Keyboard navigation** for accessibility

---

## 🔮 Future Enhancements

### Planned Features

- [ ] **Cohort Analysis** - Track donor behavior over time
- [ ] **A/B Testing Visualization** - Compare script/tone performance
- [ ] **AI-Generated Insights** - Automated recommendations
- [ ] **Forecasting** - Revenue and conversion projections
- [ ] **Custom Dashboards** - User-defined metric combinations

### Advanced Analytics

- [ ] **Sentiment Analysis** - Track call sentiment trends
- [ ] **Geographic Performance** - Location-based insights
- [ ] **Donor Segmentation** - Behavioral analysis
- [ ] **Predictive Modeling** - ML-powered insights

---

## 📚 Implementation Checklist

### Phase 1: Core Analytics

- [ ] Create analytics page route (`/home/analytics`)
- [ ] Implement metric cards component
- [ ] Add basic performance chart
- [ ] Create filter controls
- [ ] Set up data fetching from Supabase

### Phase 2: Advanced Charts

- [ ] Add time-of-day heatmap
- [ ] Implement agent comparison chart
- [ ] Create funnel analysis
- [ ] Add export functionality

### Phase 3: Optimization

- [ ] Implement caching strategy
- [ ] Add lazy loading for charts
- [ ] Optimize for mobile devices
- [ ] Add accessibility features

### Phase 4: Advanced Features

- [ ] Real-time updates
- [ ] Custom date ranges
- [ ] Advanced filtering
- [ ] Scheduled reports

---

## 📋 Documentation Standards

- ✅ **Complete data models** with TypeScript interfaces
- ✅ **Component structure** with file organization
- ✅ **API integration** patterns documented
- ✅ **Performance considerations** outlined
- ✅ **User experience** workflows mapped
- ✅ **Implementation roadmap** with phases
- ✅ **Future enhancements** planned
