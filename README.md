# FreelanceHub — Freelance Marketplace & Collaboration Platform

🚀 FreelanceHub is a full-stack freelance marketplace and collaboration platform that connects clients and freelancers and provides a complete workflow for project creation, freelancer proposals, project workspaces, file sharing, milestone management, progress tracking and client review.

The platform is built using:

- Python
- Django
- Django REST Framework
- React.js
- MySQL
- JWT Authentication
- REST APIs

FreelanceHub provides separate workflows for **Clients** and **Freelancers**, allowing users to manage projects, proposals, collaboration, milestones and project-related files through a centralized platform.

---

# 📌 Overview

FreelanceHub supports two primary user roles:

- **Client** — creates and manages projects, reviews freelancer proposals, creates milestones, monitors progress and reviews completed work.
- **Freelancer** — discovers projects, submits proposals, works on accepted projects, accesses project workspaces, uploads files and updates milestone progress.

The application follows this general workflow:

```text
Register / Login
       ↓
JWT Authentication
       ↓
Client / Freelancer
       ↓
Project
       ↓
Freelancer Proposal
       ↓
Proposal Accepted
       ↓
Project Workspace
       ↓
Milestones
       ↓
Freelancer Progress
       ↓
Client Review
       ↓
Completed Project
```

✨ Features
🔐 Authentication
- User registration
- User login
- JWT authentication
- Access token and refresh token
- Protected API endpoints
- Role-based access
- Client and Freelancer workflows
- Secure authenticated requests
👤 Client Features
Clients can manage the complete project lifecycle.
Project Management
- Create projects
- Edit project details
- View projects
- Track project status
- Set project budget
- Set project priority
- Set project deadline
- Add required skills
- Manage project information
Freelancer Management
- View freelancer proposals
- Review submitted proposals
- Accept freelancer proposals
- Reject proposals
- Select freelancers for projects
Workspace Management
After accepting a freelancer, the project can have a dedicated workspace containing:
- Project overview
- Client information
- Freelancer information
- Project status
- Project files
- Messages
- Activity
- Milestones
Milestone Management
Clients can:
- Create milestones
- Define milestone title
- Add milestone description
- Set milestone amount
- Set milestone due date
- View milestone progress
- Review submitted milestones
- Approve completed work
- Request changes
- Cancel milestones
- Delete milestones where permitted
👨‍💻 Freelancer Features
Freelancers can discover projects and participate in project workflows.
Project Discovery
- View available projects
- View project details
- Check project requirements
- View required skills
- View budget
- View deadline
- View project priority
Proposal Management
Freelancers can:
- Submit proposals
- Add proposal information
- Track proposal status
- View accepted proposals
- View rejected proposals
Workspace
Once a proposal is accepted, the freelancer can access the project workspace.
The workspace provides access to:
- Project information
- Milestones
- Files
- Messages
- Activity
Milestone Progress
Freelancers can update their assigned milestone progress.
Progress follows the milestone workflow:
0%
 ↓
PLANNED

1% - 99%
 ↓
IN_PROGRESS

100%
 ↓
SUBMITTED

After submission, the client can review the milestone.
📊 Milestone Management
Milestones divide a project into manageable stages and allow both clients and freelancers to track project progress.
Each milestone contains:
- Title
- Description
- Amount
- Due date
- Status
- Progress
- Creation date
- Last updated date
Milestone Status
PLANNED
   ↓
IN_PROGRESS
   ↓
SUBMITTED
   ↓
COMPLETED

If changes are required:
SUBMITTED
   ↓
NEEDS_CHANGES
   ↓
IN_PROGRESS
   ↓
SUBMITTED

A milestone can also be:
PLANNED / IN_PROGRESS / SUBMITTED
              ↓
          CANCELLED

🔄 Milestone Review Process
The milestone workflow provides a clear client-freelancer review process.
Client Creates Milestone
          ↓
       PLANNED
          ↓
Freelancer Starts Work
          ↓
      IN_PROGRESS
          ↓
Freelancer Completes Work
          ↓
       SUBMITTED
          ↓
      Client Review
       /       \
      /         \
 Approve       Changes
    ↓             ↓
COMPLETED    NEEDS_CHANGES
                  ↓
            Freelancer Updates
                  ↓
              SUBMITTED
                  ↓
             Client Review

Client Actions
When a freelancer submits a milestone, the client can:
- Approve → milestone becomes COMPLETED
- Request Changes → milestone becomes NEEDS_CHANGES
- Cancel → milestone becomes CANCELLED
📁 File Management
FreelanceHub provides project file management functionality.
Users can upload files related to a project.
File Features
- Upload project files
- Store original file names
- Track uploader
- Track upload date
- View uploaded files
- Access file URLs
- Delete files uploaded by the current user
Files are associated with the relevant project.
💬 Workspace
Each project workspace provides a centralized area for project collaboration.
The workspace contains sections such as:
Project Workspace
│
├── Overview
├── Milestones
├── Files
├── Messages
└── Activity

Overview
Displays important project information such as:
- Project title
- Client
- Freelancer
- Project status
- Workspace creation date
Milestones
Displays:
- Total milestones
- Completed milestones
- Overall progress
- Individual milestone details
- Freelancer progress
- Milestone status
Files
Provides access to project-related files.
Messages
Provides a dedicated area for project communication.
Activity
Provides a project activity area for tracking project-related actions.
📈 Project Progress Tracking
FreelanceHub provides progress tracking at the milestone level.
For example:
Milestone 1 → 100%
Milestone 2 → 50%
Milestone 3 → 0%

The workspace can display:
- Total milestones
- Completed milestones
- Overall progress
- Individual milestone progress
- Freelancer progress
- Current milestone status
🏗️ Technology Stack
Frontend
- React.js
- JavaScript
- HTML
- CSS
- Axios
- React Router
Backend
- Python
- Django
- Django REST Framework
Database
- MySQL
Authentication
- JWT
- Access Token
- Refresh Token
API
- REST APIs
- Axios
- Swagger / API documentation
Development Tools
- Git
- GitHub
- VS Code
- Postman
- Browser Developer Tools
🗂️ Project Structure
The project is divided into frontend and backend applications.
FreelanceHub/
│
├── backend/
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── profiles/
│   │
│   ├── skills/
│   │
│   ├── projects/
│   │
│   ├── proposals/
│   │
│   ├── collaborations/
│   │
│   ├── workspace/
│   │
│   ├── milestones/
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md

🧩 Backend Modules
FreelanceHub backend is divided into multiple Django applications.
Accounts
Responsible for:
- User registration
- Login
- JWT authentication
- User roles
- Authentication-related APIs
Profiles
Responsible for:
- Client profiles
- Freelancer profiles
- Profile information
- Profile pictures
- User-specific profile data
Skills
Responsible for:
- Skill management
- Freelancer skills
- Project required skills
- Skill-based project requirements
Projects
Responsible for:
- Project creation
- Project details
- Project editing
- Project status
- Project budget
- Project priority
- Project deadline
- Required skills
Proposals
Responsible for:
- Freelancer proposals
- Proposal submission
- Proposal status
- Proposal acceptance
- Proposal rejection
Collaborations
Responsible for project collaboration workflows between clients and freelancers.
Workspace
Responsible for:
- Project workspace
- Client information
- Freelancer information
- Project files
- Workspace information
Milestones
Responsible for:
- Milestone creation
- Milestone details
- Milestone progress
- Milestone status
- Freelancer submission
- Client review
- Milestone completion
- Change requests
- Milestone cancellation
🔌 API Structure
The backend exposes REST APIs under the /api/ prefix.
/api/auth/
/api/profiles/
/api/skills/
/api/projects/
/api/proposals/
/api/collaborations/
/api/workspaces/
/api/milestones/

🔐 Authentication API
Authentication endpoints are available under:
/api/auth/

Typical authentication flow:
Register
   ↓
Login
   ↓
Access Token
   ↓
Authenticated API Requests

The frontend stores the JWT access token and sends it with API requests using the Authorization header.
Authorization: Bearer <access_token>

📋 Project API
Project-related APIs are available under:
/api/projects/

Project functionality includes:
- Create project
- List projects
- View project
- Update project
- Delete project
- Project status management
- Project filtering
📝 Proposal API
Proposal APIs are available under:
/api/proposals/

Proposal workflow:
Freelancer
    ↓
View Project
    ↓
Submit Proposal
    ↓
Client Reviews Proposal
    ↓
Accept / Reject

🏢 Workspace API
Workspace APIs are available under:
/api/workspaces/

The workspace connects an accepted project with its collaboration area.
Workspace information includes:
- Project
- Client
- Freelancer
- Created date
- Updated date
🎯 Milestone API
Milestone APIs are available under:
/api/milestones/

Project Milestones
GET /api/milestones/project/<project_id>/

Returns milestones associated with a project.
Create Milestone
POST /api/milestones/project/<project_id>/

The project owner can create a milestone.
Example request:
{
    "title": "Database Development",
    "description": "Complete database design and implementation",
    "amount": "10000.00",
    "due_date": "2026-10-31"
}

Milestone Detail
GET /api/milestones/<milestone_id>/

Returns milestone details.
Update Milestone
PATCH /api/milestones/<milestone_id>/

Used for permitted milestone detail updates.
Delete Milestone
DELETE /api/milestones/<milestone_id>/

Used when the authenticated user has permission to delete the milestone.
Update Freelancer Progress
PATCH /api/milestones/<milestone_id>/progress/

Used by the assigned freelancer to update milestone progress.
Example:
{
    "progress": 50
}

Progress automatically corresponds to milestone status.
0%
 ↓
PLANNED

1% - 99%
 ↓
IN_PROGRESS

100%
 ↓
SUBMITTED

Client Review
PATCH /api/milestones/<milestone_id>/review/

The client can review submitted milestone work.
Supported actions include:
approve
changes
cancel

Example:
{
    "action": "approve"
}

After approval:
SUBMITTED
    ↓
COMPLETED

🗃️ Database Models
The application uses Django ORM with MySQL.
Important models include:
User
 │
 ├── Client Profile
 └── Freelancer Profile

Project
 │
 ├── Required Skills
 ├── Proposals
 ├── Workspace
 ├── Files
 └── Milestones

Proposal
 │
 └── Freelancer

ProjectWorkspace
 │
 ├── Client
 └── Freelancer

Milestone
 │
 └── Project

ProjectFile
 │
 ├── Project
 └── Uploaded By

🔗 Project Relationships
The major relationships can be represented as:
User
 │
 ├───────────────┐
 │               │
Client        Freelancer
 │               │
 │               │
 └────── Project ┘
          │
          ├── Proposals
          │
          ├── Workspace
          │      │
          │      ├── Client
          │      └── Freelancer
          │
          ├── Milestones
          │
          └── Project Files

🖥️ Frontend Pages
The React frontend contains different pages for managing the application.
Typical pages include:
Login
Register
Dashboard
Projects
Project Details
Proposals
Profile
Workspace
Milestones
Files
Messages
Activity

📊 Workspace Milestone Dashboard
The workspace milestone page provides a visual summary of project progress.
Example:
Total Milestones       Completed       Overall Progress
       3                   1                  67%

Individual milestones display:
Milestone
Title
Amount
Due Date
Description
Status
Progress
Freelancer Progress

👥 Role-Based Workflow
FreelanceHub separates actions based on the user's role.
Client
Login
 ↓
Client Dashboard
 ↓
Create Project
 ↓
Review Proposals
 ↓
Accept Freelancer
 ↓
Workspace
 ↓
Create Milestones
 ↓
Monitor Progress
 ↓
Review Submitted Work
 ↓
Approve / Request Changes
 ↓
Complete Project

Freelancer
Login
 ↓
Freelancer Dashboard
 ↓
Browse Projects
 ↓
View Project
 ↓
Submit Proposal
 ↓
Proposal Accepted
 ↓
Workspace
 ↓
View Milestones
 ↓
Work on Milestone
 ↓
Update Progress
 ↓
Submit Milestone
 ↓
Client Review

🔄 Complete Project Lifecycle
The complete FreelanceHub workflow is:
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │
                           ▼
                    Create Project
                           │
                           ▼
                  Project Available
                           │
                           ▼
                    Freelancer
                           │
                           ▼
                   Submit Proposal
                           │
                           ▼
                    Client Review
                       /        \
                      /          \
                  Reject        Accept
                    │              │
                    │              ▼
                    │          Workspace
                    │              │
                    │              ▼
                    │         Create Milestones
                    │              │
                    │              ▼
                    │       Freelancer Works
                    │              │
                    │              ▼
                    │       Update Progress
                    │              │
                    │              ▼
                    │         Submit Work
                    │              │
                    │              ▼
                    │       Client Review
                    │          /       \
                    │         /         \
                    │    Changes       Approve
                    │       │             │
                    │       ▼             ▼
                    │   Update Work    Completed
                    │       │
                    │       └──────► Review
                    │
                    ▼
                 Rejected

🛡️ Permissions
FreelanceHub uses role-based permissions to control access to project functionality.
Client Permissions
Clients can:
- Create projects
- Manage their projects
- Review proposals
- Accept or reject proposals
- Create milestones
- Review milestone submissions
- Approve milestones
- Request changes
- Cancel milestones
Freelancer Permissions
Freelancers can:
- Browse projects
- Submit proposals
- Access accepted project workspaces
- View milestones
- Update milestone progress
- Submit completed milestone work
- Upload project files
🧪 Testing & Development
During development, APIs can be tested using:
- Postman
- Swagger
- Browser Developer Tools
- Django development server
- React development server
Frontend API requests can be inspected through the browser Network and Console tabs.
⚙️ Installation
1. Clone the Repository
git clone https://github.com/Shreyavk28/Freelance-Hub.git

Navigate into the project:
cd Freelance-Hub

🐍 Backend Setup
Navigate to the backend:
cd backend

Create a virtual environment:
python -m venv venv

Activate the virtual environment on Windows:
venv\Scripts\activate

Install dependencies:
pip install -r requirements.txt

🗄️ Database Configuration
FreelanceHub uses MySQL.
Create a database:
CREATE DATABASE freelancehub;

Update the Django database configuration according to your local MySQL credentials.
Example:
DATABASES = {    "default": {        "ENGINE": "django.db.backends.mysql",        "NAME": "freelancehub",        "USER": "root",        "PASSWORD": "your_password",        "HOST": "localhost",        "PORT": "3306",    }}


🔄 Run Migrations
From the backend directory:
python manage.py makemigrations

Then:
python manage.py migrate

👤 Create Django Superuser
python manage.py createsuperuser

Follow the prompts to create the administrator account.
▶️ Start Django Backend
Run:
python manage.py runserver

The backend will normally run at:
http://127.0.0.1:8000/

API base URL:
http://127.0.0.1:8000/api/

⚛️ Frontend Setup
Open another terminal and navigate to the frontend:
cd frontend

Install dependencies:
npm install

Start the development server:
npm run dev

The frontend will normally run at:
http://localhost:5173/

🔗 Frontend and Backend
The frontend communicates with Django through REST APIs.
The Axios API client uses:
http://127.0.0.1:8000/api

Authenticated requests include the JWT access token:
Authorization: Bearer <access_token>

🔑 Environment Configuration
For production, sensitive configuration values should be stored in environment variables instead of directly inside source code.
Examples include:
SECRET_KEY
DEBUG
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD
DATABASE_HOST
DATABASE_PORT

📱 Responsive Interface
The application interface is designed to provide a clear workflow for both clients and freelancers.
Important UI areas include:
- Dashboard
- Project cards
- Project details
- Proposal management
- Workspace
- Milestone cards
- Progress indicators
- File management
- Profile management
- Navigation
🎯 Project Objectives
The main objectives of FreelanceHub are:
- Build a complete freelance marketplace
- Connect clients and freelancers
- Simplify project management
- Provide proposal management
- Provide centralized project workspaces
- Track project milestones
- Track freelancer progress
- Support client review workflows
- Manage project files
- Implement role-based access
- Build RESTful backend APIs
- Integrate a React frontend with Django
💡 Key Learning Outcomes
Through this project, the following concepts were implemented and practiced:
Backend Development
- Python
- Django
- Django REST Framework
- Django ORM
- Model relationships
- Serializers
- API views
- URL routing
- Authentication
- Permissions
- CRUD operations
Frontend Development
- React.js
- Components
- Props
- State management
- React Router
- API integration
- Axios
- Forms
- Conditional rendering
- Dynamic UI updates
Database
- MySQL
- Relational database design
- Foreign keys
- Many-to-many relationships
- One-to-one relationships
- Django migrations
Authentication
- JWT authentication
- Access tokens
- Refresh tokens
- Protected routes
- Role-based workflows
Software Development
- Git
- GitHub
- REST API architecture
- Frontend-backend integration
- Debugging
- API testing
- Project structure
🚀 Future Enhancements
Possible future improvements include:
- Real-time chat using WebSockets
- Email notifications
- Push notifications
- Online payment integration
- Freelancer ratings and reviews
- Client ratings
- Advanced project search
- Skill-based freelancer recommendations
- Advanced analytics
- Admin dashboard
- Project activity notifications
- Real-time workspace updates
- Cloud file storage
- Production deployment
- Automated testing and CI/CD
📸 Application Screens
The application includes interfaces for:
- Login and Registration
- Client Dashboard
- Freelancer Dashboard
- Project Management
- Proposal Management
- Project Workspace
- Milestone Management
- File Management
- Profile Management
- Project Activity
Screenshots can be added to this README using:
![Login Page](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Workspace](screenshots/workspace.png)
![Milestones](screenshots/milestones.png)

📂 Repository Structure
FreelanceHub
│
├── backend
│   ├── accounts
│   ├── collaborations
│   ├── milestones
│   ├── profiles
│   ├── projects
│   ├── proposals
│   ├── skills
│   ├── workspace
│   ├── manage.py
│   └── requirements.txt
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── context
│   ├── package.json
│   └── vite.config.js
│
└── README.md

🧑‍💻 Development Workflow
The project was developed using a frontend-backend architecture.
React.js Frontend
       │
       │ Axios / REST API
       ▼
Django REST Framework
       │
       │ Django ORM
       ▼
     MySQL

Authentication:
React
  ↓
Login API
  ↓
Django Authentication
  ↓
JWT Access Token
  ↓
Protected API Requests

🌟 Highlights
FreelanceHub demonstrates practical implementation of:
- Full-stack web development
- REST API development
- JWT authentication
- Role-based access
- Project management
- Proposal management
- Workspace management
- Milestone management
- Progress tracking
- File management
- React and Django integration
- MySQL database integration
👩‍💻 Developer
Shreya V K
🐍 Python Full Stack Developer
🎓 B.E. Computer Science and Engineering — 2026
I am a Computer Science graduate and aspiring Python Full Stack Developer interested in building practical web applications using Python, Django, React.js, REST APIs and SQL.
🔗 Connect With Me
GitHub
https://github.com/Shreyavk28
LinkedIn
https://www.linkedin.com/in/shreya-vk-softwareengineer/
Email
shreyavkumar5344@gmail.com
⭐ Support
If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
📄 License
This project was developed as a full-stack software development project for learning, portfolio and demonstration purposes.

This version follows the **same README style as your portfolio reference**: introduction → overview → features → roles → projects/workflow → technical stack → structure → APIs → installation → learning outcomes → future enhancements → developer/contact.



