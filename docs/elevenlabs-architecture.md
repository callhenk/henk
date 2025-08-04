# ElevenLabs Integration Architecture

## 🏗 Hybrid System Architecture Overview

> **Architecture Decision**: This implementation uses a **hybrid approach** combining Supabase Edge Functions for voice generation with a persistent Campaign Orchestrator service for complex campaign management.

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (React/Next.js)"
        A[Voice Test Component]
        B[Agent Form]
        C[Campaign Manager]
        D[Voice Selection UI]
        E[Campaign Detail]
        F[Real-time Dashboard]
    end

    %% Next.js API Routes
    subgraph "Next.js API Routes"
        G["/api/voice/test"]
        H["/api/voice/generate"]
        I["/api/voice/voices"]
        J["/api/agents"]
        K["/api/campaigns"]
        L["/api/campaigns/[id]/start"]
        M["/api/campaigns/[id]/status"]
        N["/api/twilio/webhook"]
    end

    %% Supabase Edge Functions
    subgraph "Supabase Edge Functions"
        O[elevenlabs/voices/index.ts]
        P[elevenlabs/generate/index.ts]
        Q[elevenlabs/voices/test.ts]
        R[audio/process/index.ts]
    end

    %% Campaign Orchestrator Service (EC2/Docker)
    subgraph "Campaign Orchestrator Service"
        S[Campaign Manager]
        T[Call Queue]
        U[Retry Logic Engine]
        V[Schedule Manager]
        W[Status Monitor]
        X[WebSocket Server]
    end

    %% External Services
    subgraph "External Services"
        Y[ElevenLabs API]
        Z[Twilio API]
        AA[Supabase Storage]
        BB[Supabase Database]
        CC[Redis Cache]
    end

    %% Data Flow - Frontend
    A --> G
    B --> J
    C --> K
    D --> I
    E --> M
    F --> X

    %% Data Flow - API Routes
    G --> Q
    H --> P
    I --> O
    L --> S
    M --> W
    N --> W

    %% Data Flow - Edge Functions
    Q --> Y
    P --> Y
    O --> Y
    P --> AA
    Q --> AA

    %% Data Flow - Campaign Orchestrator
    S --> T
    T --> U
    U --> V
    V --> Z
    T --> P
    W --> BB
    X --> F

    %% Data Flow - External
    Z --> N
    S --> BB
    T --> CC
    W --> CC

    %% Styling
    classDef frontend fill:#e3f2fd
    classDef api fill:#f3e5f5
    classDef edge fill:#fff3e0
    classDef orchestrator fill:#e8f5e8
    classDef external fill:#ffebee

    class A,B,C,D,E,F frontend
    class G,H,I,J,K,L,M,N api
    class O,P,Q,R edge
    class S,T,U,V,W,X orchestrator
    class Y,Z,AA,BB,CC external
```

## 🔄 Detailed Flow Diagrams

### **Voice Testing Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Next.js API
    participant E as Edge Function
    participant EL as ElevenLabs
    participant S as Supabase Storage

    U->>F: Test Voice
    F->>N: POST "/api/voice/test"
    N->>E: Call "elevenlabs/voices/test"
    E->>EL: Generate Speech
    EL-->>E: Audio Buffer
    E->>S: Store Audio File
    S-->>E: Audio URL
    E-->>N: Response with URL
    N-->>F: Audio URL + Metadata
    F-->>U: Play Audio
```

### **Campaign Start Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Next.js API
    participant O as Campaign Orchestrator
    participant Q as Call Queue
    participant E as Edge Function
    participant T as Twilio
    participant EL as ElevenLabs
    participant DB as Database
    participant WS as WebSocket

    U->>F: Start Campaign
    F->>N: POST "/api/campaigns/[id]/start"
    N->>O: Start Campaign Request
    O->>DB: Get Campaign & Leads
    DB-->>O: Campaign Data + Lead List
    O->>Q: Initialize Call Queue
    Q-->>O: Queue Ready
    O->>N: Campaign Started
    N-->>F: Success Response

    loop For Each Lead
        O->>E: Generate Speech
        E->>EL: Create Audio
        EL-->>E: Audio Buffer
        E-->>O: Audio URL
        O->>T: Make Call
        T-->>O: Call SID
        O->>DB: Log Call Attempt
        O->>WS: Send Status Update
        WS-->>F: Real-time Update
    end
```

### **Call Execution Flow**

```mermaid
sequenceDiagram
    participant O as Campaign Orchestrator
    participant E as Edge Function
    participant T as Twilio
    participant P as Phone
    participant W as Webhook
    participant DB as Database

    O->>E: Generate Speech for Lead
    E-->>O: Audio URL
    O->>T: Initiate Call
    T->>P: Ring Phone

    alt Call Answered
        P-->>T: Answer
        T->>W: POST "/api/twilio/webhook"
        W->>O: Call Answered
        T->>P: Play Generated Audio
        P-->>T: Response/DTMF
        T->>W: Gather Response
        W->>DB: Log Conversation
        W->>O: Update Call Status
    else Call Not Answered
        T->>W: No Answer Event
        W->>O: Schedule Retry
        O->>DB: Log Failed Attempt
    end
```

## 🏗 Component Architecture

### **Edge Functions Layer**

```mermaid
graph LR
    subgraph "Supabase Edge Functions"
        A[elevenlabs/voices/index.ts]
        B[elevenlabs/generate/index.ts]
        C[elevenlabs/voices/test.ts]
        D[shared/elevenlabs-client.ts]
        E[shared/storage.ts]
        F[shared/twilio-helper.ts]
    end

    A --> D
    B --> D
    C --> D
    B --> E
    C --> E
    B --> F
    C --> F

    classDef edge fill:#fff3e0
    class A,B,C,D,E,F edge
```

### **Campaign Orchestrator Layer**

```mermaid
graph LR
    subgraph "Campaign Orchestrator Service"
        A[CampaignManager]
        B[CallQueue]
        C[RetryEngine]
        D[ScheduleManager]
        E[StatusMonitor]
        F[WebSocketServer]
        G[TwilioClient]
        H[AudioGenerator]
    end

    A --> B
    A --> C
    A --> D
    B --> E
    C --> B
    D --> B
    F --> E
    G --> A
    H --> A

    classDef orchestrator fill:#e8f5e8
    class A,B,C,D,E,F,G,H orchestrator
```

### **Frontend Layer**

```mermaid
graph LR
    subgraph "Next.js API Routes"
        A["/api/voice/test"]
        B["/api/voice/generate"]
        C["/api/voice/voices"]
        D["/api/campaigns/[id]/start"]
        E["/api/campaigns/[id]/status"]
        F["/api/twilio/webhook"]
    end

    subgraph "Frontend Hooks"
        G[useVoices]
        H[useGenerateSpeech]
        I[useVoiceTest]
        J[useCampaignStatus]
        K[useRealTimeUpdates]
    end

    subgraph "UI Components"
        L[VoiceTestComponent]
        M[VoiceSelection]
        N[AgentForm]
        O[CampaignManager]
        P[CampaignDetail]
        Q[RealTimeDashboard]
    end

    A --> I
    B --> H
    C --> G
    D --> O
    E --> J
    F --> K

    I --> L
    G --> M
    H --> N
    J --> P
    K --> Q
    O --> P

    classDef api fill:#f3e5f5
    classDef hook fill:#e8f5e8
    classDef ui fill:#e1f5fe

    class A,B,C,D,E,F api
    class G,H,I,J,K hook
    class L,M,N,O,P,Q ui
```

## 📊 Data Flow Architecture

### **Voice Testing Flow**

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}

    B -->|Test Voice| C[Voice Test UI]
    B -->|Generate Speech| D[Voice Generation UI]
    B -->|List Voices| E[Voice Selection UI]
    B -->|Start Campaign| F[Campaign Manager]

    C --> G["/api/voice/test"]
    D --> H["/api/voice/generate"]
    E --> I["/api/voice/voices"]
    F --> J["/api/campaigns/[id]/start"]

    G --> K[Edge Function: test.ts]
    H --> L[Edge Function: generate.ts]
    I --> M[Edge Function: voices/index.ts]
    J --> N[Campaign Orchestrator]

    K --> O[ElevenLabs API]
    L --> O
    M --> O

    O --> P[Audio Buffer / Voice List]
    P --> Q[Supabase Storage]
    Q --> R[Audio URL]
    R --> S[Frontend Response]

    N --> T[Call Queue]
    T --> U[Retry Engine]
    U --> V[Twilio Client]
    V --> W[Make Calls]
    W --> X[Webhook Handler]
    X --> Y[Real-time Updates]

    classDef user fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef edge fill:#fff3e0
    classDef external fill:#e8f5e8
    classDef orchestrator fill:#e0f7fa
    classDef storage fill:#fce4ec

    class A,S,Y user
    class G,H,I,J api
    class K,L,M edge
    class O external
    class N,T,U,V,W,X orchestrator
    class Q,R storage
```

### **Campaign Execution Architecture**

```mermaid
flowchart TD
    A[Campaign Start Request] --> B[Campaign Orchestrator]
    B --> C[Load Campaign Data]
    C --> D[Initialize Call Queue]
    D --> E[Schedule Manager]

    E --> F{Within Calling Hours?}
    F -->|Yes| G[Get Next Lead]
    F -->|No| H[Wait for Calling Window]
    H --> F

    G --> I[Generate Speech]
    I --> J[Edge Function: elevenlabs/generate]
    J --> K[ElevenLabs API]
    K --> L[Audio File]
    L --> M[Supabase Storage]

    M --> N[Make Call via Twilio]
    N --> O[Twilio Call]
    O --> P{Call Status}

    P -->|Answered| Q[Play Audio]
    P -->|No Answer| R[Retry Logic]
    P -->|Busy| R
    P -->|Failed| R

    Q --> S[Capture Response]
    S --> T[Log Conversation]
    R --> U[Schedule Retry]

    T --> V[Update Campaign Stats]
    U --> V
    V --> W[Real-time Dashboard Update]

    W --> X{More Leads?}
    X -->|Yes| G
    X -->|No| Y[Campaign Complete]

    classDef start fill:#e8f5e8
    classDef process fill:#fff3e0
    classDef decision fill:#fce4ec
    classDef external fill:#e1f5fe
    classDef complete fill:#f3e5f5

    class A,B,C start
    class D,E,G,I,J,N,Q,S,T,U,V,W process
    class F,P,X decision
    class K,L,M,O external
    class Y,R complete
```

## 🔧 Implementation Phases

```mermaid
gantt
    title Hybrid ElevenLabs + Campaign System Timeline
    dateFormat  YYYY-MM-DD

    section Phase 1: ElevenLabs Edge Functions
    Create Edge Functions Directory    :done, p1, 2024-01-01, 1d
    Implement ElevenLabs Client       :active, p2, 2024-01-02, 2d
    Create Voice Generation Functions :p3, 2024-01-04, 3d
    Test Edge Functions              :p4, 2024-01-07, 2d

    section Phase 2: Campaign Orchestrator
    Setup Docker Environment         :p5, 2024-01-09, 1d
    Build Campaign Manager Core      :p6, 2024-01-10, 3d
    Implement Call Queue System      :p7, 2024-01-13, 2d
    Create Retry Logic Engine        :p8, 2024-01-15, 2d
    Add Schedule Manager             :p9, 2024-01-17, 2d

    section Phase 3: Twilio Integration
    Setup Twilio Client             :p10, 2024-01-19, 1d
    Implement Call Logic            :p11, 2024-01-20, 2d
    Create Webhook Handlers         :p12, 2024-01-22, 2d
    Test Call Flow                  :p13, 2024-01-24, 2d

    section Phase 4: Next.js API Routes
    Campaign Start/Stop Routes      :p14, 2024-01-26, 2d
    Status & Monitoring Routes      :p15, 2024-01-28, 1d
    WebSocket Real-time Updates     :p16, 2024-01-29, 2d

    section Phase 5: Frontend Integration
    Update Campaign Components      :p17, 2024-01-31, 3d
    Real-time Dashboard            :p18, 2024-02-03, 2d
    Integration Testing            :p19, 2024-02-05, 3d

    section Phase 6: Deployment & Monitoring
    Deploy Campaign Orchestrator    :p20, 2024-02-08, 1d
    Setup Production Monitoring     :p21, 2024-02-09, 1d
    Load Testing                    :p22, 2024-02-10, 2d
    Go Live                        :p23, 2024-02-12, 1d
```

## 🎯 Key Benefits

### **Hybrid Architecture Benefits:**

#### **Edge Functions (Supabase) - Voice Generation:**

- **Performance**: Global distribution, sub-100ms voice generation
- **Security**: ElevenLabs API keys isolated in secure environment
- **Scalability**: Auto-scaling for voice synthesis requests
- **Cost Efficiency**: Pay-per-use for voice generation only
- **Reliability**: Built-in error handling and retries

#### **Campaign Orchestrator (EC2/Docker) - Campaign Management:**

- **Persistent State**: Maintains campaign progress across thousands of calls
- **Complex Scheduling**: Handles calling hours, daily caps, retry logic
- **Call Queue Management**: Efficient processing of large lead lists
- **Real-time Monitoring**: WebSocket connections for live updates
- **Cost Predictability**: Fixed cost regardless of campaign size

#### **Next.js API Routes - User Interface:**

- **Seamless Integration**: Direct frontend-to-backend communication
- **Authentication**: Secure user context and permissions
- **Database Access**: Direct Supabase client integration
- **Type Safety**: Full TypeScript support throughout
- **Developer Experience**: Easy debugging and testing

### **Architecture Decision Rationale:**

| Component                  | Why Not Edge Functions Alone?                | Why Hybrid Approach? |
| -------------------------- | -------------------------------------------- | -------------------- |
| **Voice Generation**       | ✅ Perfect fit - stateless, fast             | Use Edge Functions   |
| **Campaign Orchestration** | ❌ Need persistent state, complex scheduling | Use EC2 Service      |
| **Call Management**        | ❌ Long-running processes, queue management  | Use EC2 Service      |
| **Real-time Updates**      | ❌ WebSocket connections not supported       | Use EC2 + WebSockets |
| **User APIs**              | ✅ Great for CRUD operations                 | Use Next.js Routes   |

## 🚀 Implementation Details

### **Required Infrastructure:**

```yaml
# Infrastructure Requirements
Edge Functions (Supabase):
  - elevenlabs/voices/index.ts
  - elevenlabs/generate/index.ts
  - elevenlabs/voices/test.ts
  - shared/elevenlabs-client.ts

Campaign Orchestrator (EC2 t3.medium):
  - Docker container
  - Redis for queue management
  - WebSocket server for real-time updates
  - Persistent storage for campaign state

Next.js Application:
  - API routes for user-facing operations
  - Real-time dashboard components
  - Campaign management interface
```

### **Environment Variables:**

```bash
# ElevenLabs Integration
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=default_voice_id

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_CALLER_ID=your_twilio_number

# Campaign Orchestrator
ORCHESTRATOR_URL=https://your-ec2-instance.com
ORCHESTRATOR_API_KEY=your_orchestrator_key
REDIS_URL=redis://your-redis-instance:6379

# Webhook URLs
WEBHOOK_BASE_URL=https://your-app.vercel.app
```

### **Deployment Strategy:**

1. **Phase 1**: Deploy Edge Functions for voice testing
2. **Phase 2**: Setup EC2 instance with Campaign Orchestrator
3. **Phase 3**: Update Next.js API routes to communicate with orchestrator
4. **Phase 4**: Deploy frontend updates with real-time dashboard
5. **Phase 5**: Production testing and monitoring setup

This hybrid architecture provides optimal performance, cost efficiency, and maintainability by using each technology for its strengths while avoiding their limitations.

## 📊 Architecture Comparison

### **Before: Edge Functions Only**

```mermaid
graph LR
    A[Frontend] --> B[Next.js API] --> C[Edge Functions] --> D[ElevenLabs]
    C --> E[Supabase Storage]

    classDef limitation fill:#ffebee
    class C limitation
```

**Limitations:**

- ❌ No persistent state for campaigns
- ❌ Cannot handle complex scheduling logic
- ❌ No real-time monitoring capabilities
- ❌ Expensive for long-running processes
- ❌ No call queue management

### **After: Hybrid Architecture**

```mermaid
graph TB
    A[Frontend] --> B[Next.js API]
    B --> C[Edge Functions]
    B --> D[Campaign Orchestrator]

    C --> E[ElevenLabs]
    D --> F[Call Queue]
    D --> G[Twilio]
    D --> H[WebSocket Server]

    E --> I[Supabase Storage]
    F --> C
    G --> B
    H --> A

    classDef edge fill:#fff3e0
    classDef orchestrator fill:#e8f5e8
    classDef external fill:#e1f5fe

    class C edge
    class D,F,H orchestrator
    class E,G,I external
```

**Capabilities:**

- ✅ Persistent campaign state management
- ✅ Complex scheduling and retry logic
- ✅ Real-time monitoring and updates
- ✅ Cost-efficient call processing
- ✅ Scalable call queue management
- ✅ Full telephony integration
- ✅ Production-ready monitoring

## 🎯 Next Steps

1. **Start with Edge Functions**: Implement voice generation first
2. **Build Campaign Orchestrator**: Create the EC2 service for campaign management
3. **Integrate Twilio**: Add calling capabilities
4. **Frontend Updates**: Build real-time dashboard
5. **Production Deployment**: Deploy and monitor the complete system

This updated architecture addresses all the limitations identified in the original Edge Functions-only approach while maintaining the benefits of serverless voice generation.
