# ElevenLabs Integration Architecture

## 🏗 System Architecture Overview

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (React/Next.js)"
        A[Voice Test Component]
        B[Agent Form]
        C[Campaign Manager]
        D[Voice Selection UI]
    end

    %% Next.js API Routes
    subgraph "Next.js API Routes"
        E["/api/voice/test"]
        F["/api/voice/generate"]
        G["/api/voice/voices"]
        H["/api/agents"]
        I["/api/campaigns"]
    end

    %% Supabase Edge Functions
    subgraph "Supabase Edge Functions"
        J[elevenlabs/voices/index.ts]
        K[elevenlabs/generate/index.ts]
        L[elevenlabs/voices/test.ts]
        M[audio/process/index.ts]
    end

    %% External Services
    subgraph "External Services"
        N[ElevenLabs API]
        O[Supabase Storage]
        P[Supabase Database]
    end

    %% Data Flow
    A --> E
    B --> H
    C --> I
    D --> G

    E --> L
    F --> K
    G --> J

    L --> N
    K --> N
    J --> N

    K --> O
    L --> O

    H --> P
    I --> P

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef edge fill:#fff3e0
    classDef external fill:#e8f5e8

    class A,B,C,D frontend
    class E,F,G,H,I api
    class J,K,L,M edge
    class N,O,P external
```

## 🔄 Detailed Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Next.js API
    participant E as Edge Function
    participant EL as ElevenLabs
    participant S as Supabase Storage
    participant DB as Database

    %% Voice Testing Flow
    U->>F: Test Voice
    F->>N: POST "/api/voice/test"
    N->>E: Call Edge Function
    E->>EL: Generate Speech
    EL-->>E: Audio Buffer
    E->>S: Store Audio File
    S-->>E: Audio URL
    E-->>N: Response with URL
    N-->>F: Audio URL
    F-->>U: Play Audio

    %% Voice Generation Flow
    U->>F: Generate Campaign Audio
    F->>N: POST "/api/voice/generate"
    N->>E: Call Edge Function
    E->>EL: Generate Speech
    EL-->>E: Audio Buffer
    E->>S: Store Audio File
    S-->>E: Audio URL
    E->>DB: Log Generation
    E-->>N: Response with URL
    N-->>F: Audio URL
    F-->>U: Audio Ready

    %% Voice Listing Flow
    U->>F: Load Voice Options
    F->>N: GET "/api/voice/voices"
    N->>E: Call Edge Function
    E->>EL: Fetch Voices
    EL-->>E: Voice List
    E-->>N: Formatted Voices
    N-->>F: Voice Options
    F-->>U: Display Voices
```

## 🏗 Component Architecture

```mermaid
graph LR
    subgraph "Edge Functions (Supabase)"
        A[elevenlabs/voices/index.ts]
        B[elevenlabs/generate/index.ts]
        C[elevenlabs/voices/test.ts]
        D[shared/elevenlabs-client.ts]
        E[shared/storage.ts]
    end

    subgraph "Next.js API Routes"
        F["/api/voice/test"]
        G["/api/voice/generate"]
        H["/api/voice/voices"]
    end

    subgraph "Frontend Hooks"
        I[useVoices]
        J[useGenerateSpeech]
        K[useVoiceTest]
    end

    subgraph "UI Components"
        L[VoiceTestComponent]
        M[VoiceSelection]
        N[AgentForm]
    end

    A --> D
    B --> D
    C --> D
    B --> E
    C --> E

    F --> C
    G --> B
    H --> A

    I --> H
    J --> G
    K --> F

    L --> K
    M --> I
    N --> J

    classDef edge fill:#fff3e0
    classDef api fill:#f3e5f5
    classDef hook fill:#e8f5e8
    classDef ui fill:#e1f5fe

    class A,B,C,D,E edge
    class F,G,H api
    class I,J,K hook
    class L,M,N ui
```

## 📊 Data Flow Architecture

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}

    B -->|Test Voice| C[Voice Test UI]
    B -->|Generate Speech| D[Voice Generation UI]
    B -->|List Voices| E[Voice Selection UI]

    C --> F["/api/voice/test"]
    D --> G["/api/voice/generate"]
    E --> H["/api/voice/voices"]

    F --> I[Edge Function: test.ts]
    G --> J[Edge Function: generate.ts]
    H --> K[Edge Function: voices/index.ts]

    I --> L[ElevenLabs API]
    J --> L
    K --> L

    L --> M[Audio Buffer]
    L --> N[Voice List]

    M --> O[Supabase Storage]
    O --> P[Audio URL]

    P --> Q[Frontend Response]
    N --> Q

    Q --> R[User Feedback]

    classDef user fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef edge fill:#fff3e0
    classDef external fill:#e8f5e8
    classDef storage fill:#fce4ec

    class A,R user
    class F,G,H api
    class I,J,K edge
    class L external
    class O,P storage
```

## 🔧 Implementation Phases

```mermaid
gantt
    title ElevenLabs Integration Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Edge Functions
    Create Directory Structure    :done, p1, 2024-01-01, 1d
    Implement ElevenLabs Client  :active, p2, 2024-01-02, 2d
    Create Voice Functions       :p3, 2024-01-04, 3d
    Test Edge Functions          :p4, 2024-01-07, 2d

    section Phase 2: Next.js API
    Update Voice Test Route      :p5, 2024-01-09, 1d
    Create Voice Generation Route :p6, 2024-01-10, 1d
    Create Voice Listing Route   :p7, 2024-01-11, 1d

    section Phase 3: Frontend
    Create Voice Hooks          :p8, 2024-01-12, 2d
    Update UI Components        :p9, 2024-01-14, 3d
    Integration Testing         :p10, 2024-01-17, 2d

    section Phase 4: Deployment
    Deploy Edge Functions       :p11, 2024-01-19, 1d
    Update Environment          :p12, 2024-01-20, 1d
    Final Testing              :p13, 2024-01-21, 2d
```

## 🎯 Key Benefits

### **Edge Functions Benefits:**

- **Performance**: Global distribution, faster response times
- **Security**: API keys isolated in Supabase environment
- **Scalability**: Automatic scaling per request
- **Cost**: Pay-per-use pricing
- **Reliability**: Built-in error handling and retries

### **Next.js API Routes Benefits:**

- **Integration**: Seamless with existing frontend
- **Authentication**: Easy access to user context
- **Database**: Direct access to Supabase client
- **Type Safety**: Full TypeScript support
- **Development**: Easier debugging and testing

This architecture provides the best of both worlds: high-performance edge functions for external API calls and heavy processing, while maintaining the flexibility and integration capabilities of Next.js API routes for user-facing operations.
