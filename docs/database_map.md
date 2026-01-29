# Database Map (Entity Relationship Diagram)

This diagram visualizes the database structure and relationships between tables.

```mermaid
erDiagram
    %% USERS & ROLES
    User {
        int userid PK
        string fullname
        string email
        string password
        string role "admin, teacher, kid, parent"
        boolean isVerified
    }

    %% CLASSES & EVENTS
    SabbathSchoolClass {
        int id PK
        string name
        string ageGroup
        int teacherId FK
    }

    ClassEvent {
        int eventid PK "FK to SabbathSchoolClass"
        string title
        string description
        datetime eventDate
        string status "pending, approved, rejected"
        int createdBy FK
    }

    %% RESOURCES (Files)
    TeacherResource {
        int id PK
        string title
        string type
        string fileUrl "Path to file on disk"
        string description
        string status
        int uploadedBy FK
    }

    %% CONTENT (Sermons, etc.)
    Sermon {
        int id PK
        string title
        string preacher
        string fileUrl
        string videoUrl
        datetime entrytime
        int authorid FK
    }

    SermonComment {
        int id PK
        string content
        int userId FK
        int sermonId FK
    }

    SermonLike {
        int id PK
        int userId FK
        int sermonId FK
    }

    %% KIDS ACTIVITY
    ResourceView {
        int id PK
        string resourceType
        int resourceId
        datetime viewedAt
        int userId FK
    }

    QuizResult {
        int id PK
        int score
        int totalQuestions
        int kidId FK
    }

    %% PUBLIC / UTILS
    Donation {
        int id PK
        string donorName
        decimal amount
        string method
    }

    ContactMessage {
        int id PK
        string name
        string email
        string message
    }

    %% RELATIONSHIPS
    
    %% User Relationships
    User ||--o{ SabbathSchoolClass : "teaches (as teacher)"
    User ||--o{ TeacherResource : "uploads"
    User ||--o{ ClassEvent : "creates"
    User ||--o{ Sermon : "authors (as admin)"
    User ||--o{ SermonComment : "writes"
    User ||--o{ SermonLike : "likes"
    User ||--o{ ResourceView : "views"
    User ||--o{ QuizResult : "achieves"

    %% Class Relationships
    SabbathSchoolClass ||--|| ClassEvent : "has (One Event Per Class)"
    
    %% Sermon Relationships
    Sermon ||--o{ SermonComment : "has"
    Sermon ||--o{ SermonLike : "has"
    
```

## Key Constraints
- **One Event Per Class**: The `ClassEvent` table uses `eventid` as its Primary Key, which is also a Foreign Key to `SabbathSchoolClass.id`. This enforces a strict limit of one event per class.
- **Resource Storage**: `TeacherResource` stores the file path in `fileUrl`. Actual files are on the disk in `uploads/teacher-resources`.
