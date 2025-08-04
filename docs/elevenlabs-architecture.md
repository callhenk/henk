# ElevenLabs Integration Architecture

## 🏗 Simplified Outbound Campaign Architecture

> **Architecture Decision**: This implementation uses **Supabase Scheduled Functions** with the **ElevenLabs Outbound Call API** for maximum simplicity and cost-effectiveness. No persistent servers or WebSocket management required.

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (React/Next.js)"
        A[Campaign Manager]
        B[Campaign Detail]
        C[Real-time Dashboard]
        D[Agent Configuration]
    end

    %% Next.js API Routes
    subgraph "Next.js API Routes"
        E[api/campaigns]
        F[api/campaigns/id/start]
        G[api/campaigns/id/status]
        H[api/agents]
    end

    %% Supabase Scheduled Functions
    subgraph "Supabase Scheduled Functions"
        I[campaign-processor<br/>Every 5 min]
        J[conversation-processor<br/>Every 10 min]
        K[elevenlabs/voices<br/>On-demand]
    end

    %% External Services
    subgraph "External Services"
        L[ElevenLabs Outbound API]
        M[ElevenLabs Conversations API]
        N[Twilio via ElevenLabs]
        O[Supabase Database]
    end

    %% Data Flow - Frontend
    A --> E
    B --> G
    C --> G
    D --> H

    %% Data Flow - API Routes
    F --> I
    E --> O
    G --> O
    H --> O

    %% Data Flow - Scheduled Functions
    I --> L
    I --> O
    J --> M
    J --> O
    K --> L

    %% Data Flow - External
    L --> N
    M --> O

    %% Styling
    classDef frontend fill:#e3f2fd
    classDef api fill:#f3e5f5
    classDef scheduled fill:#e8f5e8
    classDef external fill:#ffebee

    class A,B,C,D frontend
    class E,F,G,H api
    class I,J,K scheduled
    class L,M,N,O external
```

## 🔄 Detailed Flow Diagrams

### **Agent Voice Testing Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Next.js API
    participant E as Edge Function
    participant EL as ElevenLabs API

    U->>F: Test Agent Voice
    F->>N: POST api/agents/test-voice
    N->>E: Call elevenlabs/voices function
    E->>EL: GET /v1/voices (list available voices)
    EL-->>E: Voice List
    E->>EL: POST /v1/text-to-speech (test sample)
    EL-->>E: Audio Buffer
    E-->>N: Audio URL + Voice Options
    N-->>F: Voice Test Results
    F-->>U: Play Test Audio
```

### **Campaign Start Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Next.js API
    participant SF as Scheduled Function
    participant DB as Supabase Database

    U->>F: Start Campaign
    F->>N: POST api/campaigns/id/start
    N->>DB: Update Campaign Status = 'active'
    N->>DB: Queue Leads for Calling
    DB-->>N: Campaign & Leads Updated
    N-->>F: Campaign Started
    F-->>U: Success Message

    Note over SF,DB: campaign-processor runs every 5 minutes
    SF->>DB: Get Active Campaigns
    DB-->>SF: Campaign List
    SF->>DB: Get Queued Calls (respects calling hours)
    DB-->>SF: Ready-to-call Lead Queue
```

### **Outbound Call Processing Flow**

```mermaid
sequenceDiagram
    participant SF as campaign-processor
    participant EL as ElevenLabs API
    participant T as Twilio via ElevenLabs
    participant P as Prospect Phone
    participant DB as Supabase Database

    loop For Each Queued Call
        SF->>EL: POST /v1/convai/twilio/outbound-call
        Note over SF,EL: {agent_id, phone_number_id, to_number}
        EL-->>SF: {callSid, conversation_id, success}
        SF->>DB: Log Call Initiated

        EL->>T: Initiate Call via Twilio
        T->>P: Ring Prospect

        alt Call Answered
            P-->>T: Answer
            T-->>EL: Audio Stream Started
            EL->>P: AI Conversation
            P-->>EL: Natural Responses
            Note over EL,P: Real-time conversational AI
            EL->>DB: Conversation Complete (webhook)
        else Call Not Answered
            T-->>EL: No Answer
            EL->>DB: Call Failed (webhook)
        end
    end
```

### **Conversation Results Processing Flow**

```mermaid
sequenceDiagram
    participant CF as conversation-processor
    participant EL as ElevenLabs API
    participant DB as Supabase Database
    participant F as Frontend Dashboard

    Note over CF: Runs every 10 minutes
    CF->>DB: Get Completed Calls
    DB-->>CF: Call List with conversation_ids

    loop For Each Completed Call
        CF->>EL: GET /v1/convai/conversations/{id}
        EL-->>CF: Conversation Details
        Note over CF,EL: transcript, outcome, sentiment, duration

        CF->>DB: Update Call Results
        CF->>DB: Update Lead Status
        CF->>DB: Update Campaign Stats
    end

    DB->>F: Real-time Subscription Updates
    F-->>F: Update Dashboard
```

## 🏗 Component Architecture

### **Scheduled Functions Layer**

```mermaid
graph LR
    subgraph "Supabase Scheduled Functions"
        A[campaign-processor<br/>Cron: */5 9-17 * * 1-5]
        B[conversation-processor<br/>Cron: */10 * * * *]
        C[elevenlabs/voices<br/>On-demand]
        D[shared/elevenlabs-client.ts]
        E[shared/database-utils.ts]
    end

    A --> D
    B --> D
    C --> D
    A --> E
    B --> E

    classDef scheduled fill:#e8f5e8
    classDef shared fill:#fff3e0

    class A,B,C scheduled
    class D,E shared
```

### **API Routes Layer**

```mermaid
graph LR
    subgraph "Next.js API Routes"
        A[api/campaigns]
        B[api/campaigns/id/start]
        C[api/campaigns/id/status]
        D[api/agents]
        E[api/agents/test-voice]
    end

    subgraph "Frontend Hooks"
        F[useCampaigns]
        G[useCampaignStatus]
        H[useAgents]
        I[useVoiceTest]
        J[useRealTimeUpdates]
    end

    A --> F
    B --> F
    C --> G
    D --> H
    E --> I

    classDef api fill:#f3e5f5
    classDef hook fill:#e8f5e8

    class A,B,C,D,E api
    class F,G,H,I,J hook
```

### **Frontend Components Layer**

```mermaid
graph LR
    subgraph "UI Components"
        A[CampaignManager]
        B[CampaignDetail]
        C[RealTimeDashboard]
        D[AgentConfiguration]
        E[VoiceTestComponent]
        F[LeadManagement]
        G[CallResultsView]
    end

    subgraph "Frontend Hooks"
        H[useCampaigns]
        I[useCampaignStatus]
        J[useAgents]
        K[useVoiceTest]
        L[useRealTimeUpdates]
    end

    H --> A
    I --> B
    L --> C
    J --> D
    K --> E
    H --> F
    I --> G

    classDef ui fill:#e1f5fe
    classDef hook fill:#e8f5e8

    class A,B,C,D,E,F,G ui
    class H,I,J,K,L hook
```

## 📊 Simplified Data Flow Architecture

### **Campaign Processing Flow**

```mermaid
flowchart TD
    A[User Starts Campaign] --> B[Next.js API]
    B --> C[Update Campaign Status = 'active']
    C --> D[Queue Leads in Database]
    D --> E[Return Success to User]

    F[Scheduled Function<br/>Every 5 minutes] --> G[Get Active Campaigns]
    G --> H[Get Queued Calls<br/>Respecting calling hours]
    H --> I{Any Calls to Make?}

    I -->|Yes| J[Process Lead Batch<br/>25 calls max]
    I -->|No| K[Wait for Next Schedule]

    J --> L[ElevenLabs Outbound API<br/>POST /v1/convai/twilio/outbound-call]
    L --> M[ElevenLabs Handles<br/>Twilio + AI Conversation]
    M --> N[Log Call Initiated<br/>Store call_sid + conversation_id]

    N --> O{More Leads in Batch?}
    O -->|Yes| J
    O -->|No| K

    classDef user fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef scheduled fill:#e8f5e8
    classDef external fill:#ffebee
    classDef decision fill:#fce4ec

    class A,E user
    class B,C,D api
    class F,G,H,J,N scheduled
    class L,M external
    class I,O decision
```

### **Results Processing Flow**

```mermaid
flowchart TD
    A[Conversation Processor<br/>Every 10 minutes] --> B[Get Completed Calls<br/>With conversation_ids]
    B --> C{Any Completed Calls?}

    C -->|Yes| D[Get Conversation Details<br/>ElevenLabs API]
    C -->|No| E[Wait for Next Schedule]

    D --> F[Extract Results<br/>transcript, outcome, sentiment]
    F --> G[Update Call Log<br/>With conversation results]
    G --> H[Update Lead Status<br/>Based on outcome]
    H --> I[Update Campaign Stats<br/>Live metrics]

    I --> J[Real-time Database Updates]
    J --> K[Frontend Dashboard<br/>Via Supabase subscriptions]

    K --> L{More Calls to Process?}
    L -->|Yes| D
    L -->|No| E

    classDef scheduled fill:#e8f5e8
    classDef external fill:#ffebee
    classDef database fill:#f3e5f5
    classDef frontend fill:#e1f5fe
    classDef decision fill:#fce4ec

    class A,B,D,F,G,H,I scheduled
    class D external
    class G,H,I,J database
    class K frontend
    class C,L decision
```

## 🔧 Implementation Phases

```mermaid
gantt
    title 1-Week ElevenLabs Implementation Timeline
    dateFormat  YYYY-MM-DD

    section Day 1-2 Core Functions
    Setup ElevenLabs API Integration    :done, p1, 2025-08-05, 1d
    Create Campaign Processor Function  :active, p2, 2025-08-06, 1d
    Create Conversation Processor       :p3, 2025-08-06, 1d

    section Day 3-4 Database Integration
    Update Migration Schema            :p4, 2025-08-07, 1d
    Implement Database Helpers         :p5, 2025-08-07, 1d
    Add Results Processing            :p6, 2025-08-08, 1d

    section Day 5-6 Frontend Integration
    Update Campaign Start Logic        :p7, 2025-08-09, 1d
    Build Dashboard Updates            :p8, 2025-08-09, 1d
    Build Results Display             :p9, 2025-08-10, 1d

    section Day 7 Production Deploy
    Deploy Functions                  :p10, 2025-08-11, 1d
    Setup Environment                 :p11, 2025-08-11, 1d
    Testing and Go Live              :p12, 2025-08-11, 1d
```

## 🎯 Key Benefits

### **Simplified Architecture Benefits:**

#### **✅ Dramatically Reduced Complexity:**

- **No Infrastructure Management**: No servers, Docker, or WebSockets to manage
- **No Persistent State**: ElevenLabs handles all call state and conversation management
- **Single Deployment**: Just deploy Supabase Scheduled Functions
- **Built-in Reliability**: Automatic retries and error handling

#### **✅ Cost-Effective Scaling:**

- **Pay-per-Use**: Only pay when campaigns are running
- **No Fixed Costs**: No EC2 instances running 24/7
- **Efficient Resource Usage**: Functions sleep between scheduled runs
- **Predictable Pricing**: Know exactly what each call costs

#### **✅ ElevenLabs Handles the Heavy Lifting:**

- **Real-time Conversations**: Advanced conversational AI without WebSocket complexity
- **Twilio Integration**: ElevenLabs manages Twilio calls directly
- **Audio Processing**: No need to handle audio streams or buffering
- **Call Analytics**: Built-in conversation analysis and transcription

#### **✅ Perfect for MVP:**

- **Faster Development**: Deploy in 1 week, not months
- **Lower Risk**: Minimal infrastructure complexity
- **Easy Testing**: Test individual functions independently
- **Natural Scaling**: Automatically handles campaign growth

### **Architecture Comparison:**

| Aspect           | Simplified (Scheduled Functions) | Complex (Persistent Server) |
| ---------------- | -------------------------------- | --------------------------- |
| **Setup Time**   | ⭐⭐⭐⭐⭐ 1 week                | ⭐⭐ 2-3 weeks              |
| **Complexity**   | ⭐⭐ Very Simple                 | ⭐⭐⭐⭐⭐ Very Complex     |
| **Monthly Cost** | ⭐⭐⭐⭐⭐ $5-50                 | ⭐⭐ $100-500               |
| **Reliability**  | ⭐⭐⭐⭐⭐ Built-in              | ⭐⭐⭐ Custom setup         |
| **Scaling**      | ⭐⭐⭐⭐ Automatic               | ⭐⭐⭐ Manual               |
| **Maintenance**  | ⭐⭐⭐⭐⭐ Zero                  | ⭐⭐ High                   |

## 🚀 Implementation Details

### **Required Components:**

```yaml
# Supabase Scheduled Functions
functions/campaign-processor:
  schedule: '*/5 9-17 * * 1-5' # Every 5 min during business hours
  purpose: Process queued calls via ElevenLabs API

functions/conversation-processor:
  schedule: '*/10 * * * *' # Every 10 minutes
  purpose: Fetch completed conversation results

functions/elevenlabs/voices:
  trigger: 'on-demand' # For agent voice testing
  purpose: List and test available voices
```

### **Environment Variables:**

```bash
# ElevenLabs Integration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_default_agent_id

# Supabase Integration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Webhook endpoint for real-time updates
WEBHOOK_BASE_URL=https://your-app.vercel.app
```

### **Deployment Commands:**

```bash
# Deploy scheduled functions
supabase functions deploy campaign-processor --schedule "*/5 9-17 * * 1-5"
supabase functions deploy conversation-processor --schedule "*/10 * * * *"
supabase functions deploy elevenlabs/voices

# Set secrets
supabase secrets set ELEVENLABS_API_KEY=your_key
supabase secrets set ELEVENLABS_AGENT_ID=your_agent_id
```

## 🎯 Next Steps

1. **Deploy Database Migration**: Apply the campaign management schema
2. **Create Scheduled Functions**: Implement campaign and conversation processors
3. **Update Frontend**: Add campaign start/stop functionality
4. **Test with ElevenLabs**: Configure agents and test outbound calls
5. **Production Launch**: Deploy and monitor live campaigns

This simplified architecture leverages ElevenLabs' powerful outbound calling capabilities while maintaining the benefits of serverless functions - dramatically reducing complexity while providing enterprise-grade conversational AI for fundraising campaigns. **Implementation can be completed in just 1 week**, making it perfect for rapid MVP deployment.
