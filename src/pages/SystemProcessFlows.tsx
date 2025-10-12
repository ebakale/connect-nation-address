import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Shield, Users, Workflow, Database, GitBranch } from 'lucide-react';

const SystemProcessFlows: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Workflow className="h-8 w-8" />
            System Process Flow Diagrams
          </CardTitle>
          <CardDescription className="text-lg">
            Visual representation of all system workflows and processes in the Biakam platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nar" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="nar" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                NAR
              </TabsTrigger>
              <TabsTrigger value="car" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                CAR
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Quality
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nar" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>NAR Process - National Address Registry</CardTitle>
                  <CardDescription>Address creation and verification workflow</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
graph TD
    A[Citizen Submits Request] --> B[System Auto-Verification]
    B --> C{Valid Data?}
    C -->|Yes| D[Generate UAC]
    C -->|No| E[Return to Citizen]
    D --> F[Assign to Verifier]
    F --> G{Verifier Review}
    G -->|Approve| H[Assign to Registrar]
    G -->|Flag Issues| I[Request Changes]
    G -->|Reject| J[Rejected]
    I --> E
    H --> K{Registrar Decision}
    K -->|Approve| L[Publish Address]
    K -->|Reject| J
    L --> M[Address Active in NAR]
    
    style A fill:#e3f2fd
    style M fill:#c8e6c9
    style J fill:#ffcdd2
    style L fill:#fff9c4
                  </lov-mermaid>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="car" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CAR Process - Citizen Address Repository</CardTitle>
                  <CardDescription>Citizen address declaration and verification</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
graph TD
    A[Citizen Login] --> B{Has Account?}
    B -->|No| C[Create Account]
    B -->|Yes| D[Access Portal]
    C --> D
    D --> E[Declare Address]
    E --> F[Search UAC in NAR]
    F --> G{UAC Found?}
    G -->|Yes| H[Link Address]
    G -->|No| I[Create New Request]
    H --> J[Status: SELF_DECLARED]
    I --> K[Submit to NAR]
    J --> L{Request Verification}
    L -->|Yes| M[Verification Process]
    L -->|No| N[Remains Self-Declared]
    M --> O{Verified?}
    O -->|Approved| P[Status: CONFIRMED]
    O -->|Rejected| Q[Status: REJECTED]
    P --> R[Primary/Secondary Address]
    
    style A fill:#e3f2fd
    style P fill:#c8e6c9
    style Q fill:#ffcdd2
    style R fill:#fff9c4
                  </lov-mermaid>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Management Process</CardTitle>
                  <CardDescription>Incident reporting and response workflow</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
graph TD
    A[Emergency Reported] --> B[System Receives Alert]
    B --> C[Classify Emergency]
    C --> D{Critical?}
    D -->|Yes| E[Immediate Priority]
    D -->|No| F[Normal Priority]
    E --> G[Locate Nearest UAC]
    F --> G
    G --> H[Encrypt Sensitive Data]
    H --> I[Assign Dispatcher]
    I --> J[Notify Units]
    J --> K{Unit Available?}
    K -->|Yes| L[Dispatch Unit]
    K -->|No| M[Request Backup]
    M --> N[Notify Other Units]
    N --> L
    L --> O[Unit Responds]
    O --> P[Arrive on Scene]
    P --> Q[Handle Incident]
    Q --> R{Resolved?}
    R -->|Yes| S[Close Incident]
    R -->|No| T[Escalate]
    T --> M
    S --> U[Generate Report]
    
    style A fill:#ffcdd2
    style S fill:#c8e6c9
    style E fill:#ff9800
    style T fill:#ffc107
                  </lov-mermaid>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Integration Flow</CardTitle>
                  <CardDescription>How NAR, CAR, and Emergency systems work together</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
graph LR
    A[NAR - Address Base] --> B[CAR - Citizen Data]
    B --> C[Emergency Response]
    C -->|Address Verification| A
    B -->|New Locations| A
    A -->|Verified UACs| C
    B -->|Resident Info| C
    
    D[Field Agents] --> A
    E[Citizens] --> B
    F[Dispatchers] --> C
    
    A --> G[Shared Database]
    B --> G
    C --> G
    G --> H[Analytics & Reports]
    G --> I[Quality Audits]
    I -->|Feedback| A
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#ffcdd2
    style G fill:#fff9c4
                  </lov-mermaid>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Flow & Synchronization</CardTitle>
                  <CardDescription>Sequence of operations between modules</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
sequenceDiagram
    participant Citizen
    participant CAR
    participant NAR
    participant Emergency
    participant QualityAudit
    
    Citizen->>CAR: Declare Address
    CAR->>NAR: Search UAC
    NAR-->>CAR: Return UAC Data
    CAR->>CAR: Create Self-Declared
    CAR->>NAR: Request Verification
    NAR->>NAR: Verify Address
    NAR-->>CAR: Confirm Address
    
    Emergency->>NAR: Request Location
    NAR-->>Emergency: Provide UAC
    Emergency->>CAR: Get Resident Info
    CAR-->>Emergency: Provide Contact
    
    QualityAudit->>NAR: Daily Scan
    QualityAudit->>CAR: Validate Data
    QualityAudit-->>NAR: Report Issues
                  </lov-mermaid>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quality" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Assurance Workflow</CardTitle>
                  <CardDescription>Automated quality checks and maintenance</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
graph TD
    A[Daily Automated Scan] --> B[Check All Addresses]
    B --> C{Quality Issues?}
    C -->|No| D[Generate Report]
    C -->|Yes| E[Flag Issues]
    E --> F[Categorize Problems]
    F --> G{Critical?}
    G -->|Yes| H[Immediate Alert]
    G -->|No| I[Queue for Review]
    H --> J[Assign to Verifier]
    I --> J
    J --> K[Manual Review]
    K --> L{Fix Needed?}
    L -->|Yes| M[Update Address]
    L -->|No| N[Close Issue]
    M --> O[Verify Fix]
    O --> P{Fixed?}
    P -->|Yes| N
    P -->|No| Q[Escalate]
    Q --> R[Admin Review]
    R --> M
    N --> D
    D --> S[Weekly Analytics]
    
    style A fill:#e3f2fd
    style H fill:#ff9800
    style N fill:#c8e6c9
    style S fill:#fff9c4
                  </lov-mermaid>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preventive Maintenance</CardTitle>
                  <CardDescription>Proactive system health monitoring</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <lov-mermaid>
graph LR
    A[Usage Analytics] --> B[High-Activity Addresses]
    B --> C[Schedule Verification]
    C --> D[Field Agent Review]
    D --> E{Still Accurate?}
    E -->|Yes| F[Update Timestamp]
    E -->|No| G[Update Data]
    G --> H[Re-verify]
    F --> I[Maintenance Complete]
    H --> I
    
    J[Error Patterns] --> K[System Issues]
    K --> L[Developer Review]
    L --> M[Code Fixes]
    M --> N[Deploy Updates]
    
    style A fill:#e3f2fd
    style I fill:#c8e6c9
    style N fill:#fff9c4
                  </lov-mermaid>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemProcessFlows;