# FreelanceHub — Freelance Marketplace & Collaboration Platform

🚀 **FreelanceHub** is a full-stack freelance marketplace and collaboration platform designed to connect **clients and freelancers** in one complete project management environment.

The platform allows clients to create and manage projects, discover freelancers, review proposals, create project workspaces, manage milestones and review completed work.

Freelancers can discover available projects, submit proposals, collaborate with clients, upload project files and update milestone progress.

---

## 📌 Overview

FreelanceHub provides a complete workflow from **user authentication to project completion and client review**.

The application supports two primary user roles:

- 👤 **Client**
  - Creates and manages projects
  - Reviews freelancer proposals
  - Accepts freelancers
  - Creates and manages milestones
  - Monitors project progress
  - Reviews completed milestone work
  - Marks work as completed or requests changes

- 👨‍💻 **Freelancer**
  - Creates and manages a professional profile
  - Browses available projects
  - Submits proposals
  - Works on accepted projects
  - Accesses project workspaces
  - Uploads project files
  - Updates milestone progress
  - Submits completed milestone work

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- JWT authentication
- Access token and refresh token
- Protected API endpoints
- Role-based authentication
- Client and Freelancer roles
- Persistent authentication using local storage

---

## 👤 User Profiles

FreelanceHub provides separate profile functionality for clients and freelancers.

### Client Profile

Clients can manage their profile information and use the platform to create and manage projects.

### Freelancer Profile

Freelancers can maintain their professional information and showcase their skills and experience.

---

# 🏠 Dashboard

After authentication, users are redirected to their appropriate dashboard based on their role.

## Client Dashboard

The client dashboard provides an overview of:

- Total projects
- Open projects
- In-progress projects
- Completed projects
- Freelancer activity
- Project management options

## Freelancer Dashboard

The freelancer dashboard provides information about:

- Available projects
- Submitted proposals
- Accepted projects
- Active workspaces
- Project activity
- Milestone progress

---

# 📊 Project Management

Clients can create and manage freelance projects.

Each project contains information such as:

- Project title
- Project description
- Budget type
- Budget amount
- Priority
- Deadline
- Required skills
- Project status
- Creation date
- Updated date

### Project Status

Projects can have different statuses:

- `OPEN`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

---

# 🛠️ Project Creation

Clients can create projects by providing:

- Project title
- Description
- Budget
- Budget type
- Priority
- Deadline
- Required skills

Once a project is created, freelancers can view the project and submit proposals.

---

# 🔎 Freelancer Discovery

The platform allows clients to discover freelancers based on their professional information and skills.

Freelancer profiles can contain information such as:

- Name
- Profile picture
- Bio
- Skills
- Experience
- Professional information

This allows clients to find suitable freelancers for their projects.

---

# 📝 Proposal Management

Freelancers can submit proposals for available projects.

A proposal can contain:

- Project
- Freelancer
- Cover letter
- Proposed amount
- Estimated delivery time
- Proposal status

## Proposal Status

Proposals can move through different states depending on the project workflow.

Typical workflow:

```text
Freelancer submits proposal
          ↓
       Pending
          ↓
Client reviews proposal
          ↓
    ┌─────┴─────┐
    ↓           ↓
 Accepted     Rejected
    ↓
 Project Workspace
```

When a client accepts a proposal, the freelancer can begin working on the project.

---

# 🤝 Project Workspace

Once a freelancer is selected, a project workspace is created.

The workspace provides a centralized area for project collaboration.

Each workspace contains:

- Client
- Freelancer
- Project
- Project status
- Workspace creation date
- Project files
- Messages
- Activity
- Milestones

---

# 📁 Workspace Navigation

The project workspace contains different sections.

```text
Project Workspace
│
├── Overview
├── Milestones
├── Files
├── Messages
└── Activity
```

---

# 📌 Workspace Overview

The Overview section displays important project information.

It includes:

- Project title
- Project status
- Client
- Freelancer
- Workspace creation date
- Project information
- Project progress

---

# 🎯 Milestone Management

Milestones divide a project into smaller and manageable stages.

Clients can create milestones for their projects.

Each milestone contains:

- Milestone title
- Description
- Amount
- Due date
- Status
- Progress
- Created date
- Updated date

---

# 📈 Milestone Progress

Freelancers can update the progress of milestones assigned to them.

Progress can be tracked from:

```text
0% ─────────────── 25% ─────────────── 50% ─────────────── 75% ─────────────── 100%
```

The milestone progress is displayed visually inside the workspace.

---

# 🔄 Milestone Workflow

The milestone workflow supports multiple stages.

```text
PLANNED
   ↓
IN_PROGRESS
   ↓
SUBMITTED
   ↓
Client Review
   ↓
 ┌───────────────────┐
 ↓                   ↓
COMPLETED       NEEDS_CHANGES
                     ↓
                IN_PROGRESS
                     ↓
                 SUBMITTED
```

A milestone can also be cancelled when required.

---

# 👨‍💻 Freelancer Progress Update

The freelancer can update milestone progress when they are authorized to work on the project.

The system verifies whether the freelancer is associated with the project.

Authorized freelancers can update:

- Milestone progress
- Work status
- Submission status

The progress is reflected in the project workspace.

---

# 👩‍💼 Client Review

After the freelancer completes the required work, the milestone can be submitted for client review.

The client can review the submitted work and choose between:

### ✅ Completed

If the client is satisfied with the work:

```text
Submitted
    ↓
Client Review
    ↓
Completed
```

The milestone becomes completed.

### 🔄 Needs Changes

If changes are required:

```text
Submitted
    ↓
Client Review
    ↓
Needs Changes
    ↓
Freelancer Updates Work
    ↓
Submitted Again
```

This creates a complete review and revision workflow.

---

# 💰 Milestone Amount

Each milestone can have its own payment amount.

For example:

```text
Project Budget: ₹50,000

Milestone 1: Database Development     ₹10,000
Milestone 2: Backend Development      ₹15,000
Milestone 3: Frontend Development     ₹15,000
Milestone 4: Testing & Deployment     ₹10,000
```

This allows a large project to be divided into manageable financial stages.

---

# 📊 Overall Project Progress

FreelanceHub calculates and displays overall milestone progress.

For example:

```text
Total Milestones: 4

Completed: 2

Overall Progress: 50%
```

The workspace provides a visual representation of project progress.

---

# 📂 File Management

The Files section allows project participants to manage project-related files.

Users can upload project files into the workspace.

Each uploaded file contains:

- File
- Original filename
- Uploaded by
- Upload date
- Project

Files are associated with the corresponding project.

---

# 📎 File Upload

The application supports uploading project-related files.

Examples include:

- Documents
- Images
- Project resources
- Source files
- Reports
- Design files

Files are stored using Django's file handling system.

---

# 💬 Messages

The workspace includes a Messages section for project communication.

This provides a dedicated area for client and freelancer communication related to the project.

The messaging functionality can be used for:

- Project discussions
- Requirements
- Updates
- Questions
- Feedback
- Clarifications

---

# 📝 Activity

The Activity section provides project-related activity information.

It helps users understand changes and actions associated with the project.

Examples include:

- Project creation
- Proposal activity
- Workspace activity
- Milestone updates
- File uploads
- Project progress changes

---

# 🧑‍🤝‍🧑 Role-Based Workflow

FreelanceHub provides different workflows for Clients and Freelancers.

## Client Workflow

```text
Register / Login
       ↓
Client Dashboard
       ↓
Create Project
       ↓
Receive Proposals
       ↓
Review Proposals
       ↓
Accept Freelancer
       ↓
Project Workspace
       ↓
Create Milestones
       ↓
Monitor Progress
       ↓
Review Submitted Work
       ↓
 ┌───────────────┐
 ↓               ↓
Completed    Needs Changes
```

---

## Freelancer Workflow

```text
Register / Login
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
Project Workspace
       ↓
Work on Milestones
       ↓
Update Progress
       ↓
Submit Work
       ↓
Client Review
       ↓
 ┌───────────────┐
 ↓               ↓
Completed    Needs Changes
```

---

# 🔐 Authorization

FreelanceHub uses role-based authorization to control access to different features.

## Client Permissions

Clients can:

- Create projects
- Edit projects
- Manage projects
- Review proposals
- Accept freelancers
- Create milestones
- Review milestone submissions
- Mark milestones completed
- Request changes

## Freelancer Permissions

Freelancers can:

- View available projects
- Submit proposals
- Access accepted projects
- Access project workspaces
- Upload files
- Update milestone progress
- Submit milestone work

Users cannot access actions that are outside their assigned role.

---

# 🧰 Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

## Backend

- Python
- Django
- Django REST Framework

## Database

- MySQL

## Authentication

- JWT Authentication
- Access Tokens
- Refresh Tokens

## API

- REST API
- Axios
- JSON

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- Swagger

---

# 🏗️ Architecture

FreelanceHub follows a frontend-backend architecture.

```text
                 ┌─────────────────────┐
                 │       User          │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │                     │
                 │ React.js            │
                 │ React Router        │
                 │ Axios               │
                 └──────────┬──────────┘
                            │
                       REST API
                            │
                            ↓
                 ┌─────────────────────┐
                 │ Django REST API     │
                 │                     │
                 │ Authentication      │
                 │ Projects            │
                 │ Proposals           │
                 │ Workspaces          │
                 │ Milestones          │
                 │ Files               │
                 └──────────┬──────────┘
                            │
                            ↓
                 ┌─────────────────────┐
                 │       MySQL         │
                 │      Database       │
                 └─────────────────────┘
```

---

# 📁 Project Structure

The project is divided into frontend and backend applications.

```text
Freelance-Hub/
│
├── backend/
│   │
│   ├── accounts/
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
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🗂️ Backend Applications

The Django backend is divided into multiple applications.

## `accounts`

Responsible for:

- User registration
- Login
- JWT authentication
- User roles
- Authentication-related APIs

---

## `profiles`

Responsible for:

- Client profiles
- Freelancer profiles
- Profile information
- Profile pictures
- Professional information

---

## `skills`

Responsible for:

- Skill management
- Freelancer skills
- Project required skills

---

## `projects`

Responsible for:

- Project creation
- Project listing
- Project updates
- Project status
- Project management

---

## `proposals`

Responsible for:

- Freelancer proposals
- Proposal submission
- Proposal review
- Proposal acceptance/rejection

---

## `collaborations`

Responsible for:

- Freelancer-client collaboration
- Accepted project relationships
- Collaboration workflows

---

## `workspace`

Responsible for:

- Project workspaces
- Workspace information
- Project files
- File uploads

---

## `milestones`

Responsible for:

- Milestone creation
- Milestone listing
- Progress tracking
- Freelancer progress updates
- Client review
- Completion
- Change requests

---

# 🔌 API Structure

The backend exposes REST API endpoints under:

```text
/api/
```

Main API groups include:

```text
/api/auth/
/api/profiles/
/api/skills/
/api/projects/
/api/proposals/
/api/collaborations/
/api/workspaces/
/api/milestones/
```

---

# 🔑 Authentication API

Authentication endpoints are available under:

```text
/api/auth/
```

Authentication provides:

- Registration
- Login
- Token generation
- Token refresh
- Protected requests

The frontend sends the access token using:

```text
Authorization: Bearer <access-token>
```

---

# 📁 Project API

Project-related endpoints are available under:

```text
/api/projects/
```

Project functionality includes:

- Create project
- List projects
- Retrieve project
- Update project
- Delete project
- Project status management

---

# 📝 Proposal API

Proposal-related endpoints are available under:

```text
/api/proposals/
```

Proposal functionality includes:

- Submit proposal
- View proposals
- Review proposal
- Accept proposal
- Reject proposal

---

# 🤝 Workspace API

Workspace functionality is available under:

```text
/api/workspaces/
```

Workspace functionality includes:

- Create workspace
- Retrieve workspace
- View project workspace
- Manage project files

---

# 🎯 Milestone API

Milestone functionality is available under:

```text
/api/milestones/
```

The milestone system supports:

```text
Project Milestones
        ↓
Milestone Detail
        ↓
Freelancer Progress
        ↓
Client Review
```

The API supports milestone operations such as:

- List milestones
- Create milestone
- View milestone
- Update milestone
- Delete milestone
- Update progress
- Review milestone
- Mark completed
- Request changes

---

# 🗄️ Database Models

The main database entities include:

```text
User
 │
 ├── Client Profile
 └── Freelancer Profile

Project
 │
 ├── Required Skills
 ├── Proposals
 ├── Workspace
 │      └── Files
 │
 └── Milestones
```

---

# 📌 Milestone Model

A milestone contains:

```text
Milestone
│
├── Project
├── Title
├── Description
├── Amount
├── Due Date
├── Status
├── Progress
├── Created At
└── Updated At
```

Milestone statuses include:

```text
PLANNED
IN_PROGRESS
SUBMITTED
NEEDS_CHANGES
COMPLETED
CANCELLED
```

---

# 🧑‍💻 Local Development Setup

Follow these steps to run FreelanceHub locally.

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

---

## 2. Navigate to the Project

```bash
cd Freelance-Hub-main
```

---

# ⚙️ Backend Setup

## 3. Navigate to Backend

```bash
cd backend
```

---

## 4. Create a Virtual Environment

### Windows

```bash
python -m venv venv
```

---

## 5. Activate Virtual Environment

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### Windows Command Prompt

```cmd
venv\Scripts\activate
```

---

## 6. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

If a `requirements.txt` file is not available, install the main dependencies:

```bash
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install mysqlclient
pip install pillow
pip install django-cors-headers
```

---

# 🗄️ MySQL Database Setup

FreelanceHub uses MySQL as the primary database.

Create a database in MySQL:

```sql
CREATE DATABASE freelancehub;
```

Update the Django database configuration according to your local MySQL credentials.

Example:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "freelancehub",
        "USER": "root",
        "PASSWORD": "your_password",
        "HOST": "localhost",
        "PORT": "3306",
    }
}
```

Do not commit your real database password to GitHub.

---

# 🔄 Database Migrations

Run migrations:

```bash
python manage.py makemigrations
```

Then:

```bash
python manage.py migrate
```

---

# 👤 Create Django Superuser

To access Django Admin:

```bash
python manage.py createsuperuser
```

Follow the prompts to create the administrator account.

---

# ▶️ Start Django Backend

Run:

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# 💻 Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

---

# 📦 Install Frontend Dependencies

Run:

```bash
npm install
```

---

# ▶️ Start React Development Server

Run:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

---

# 🔗 Frontend and Backend

When running locally:

```text
React Frontend
http://localhost:5173
        │
        │ Axios / REST API
        ↓
Django Backend
http://127.0.0.1:8000
        │
        ↓
MySQL Database
```

---

# 🔧 Axios Configuration

The frontend communicates with the backend using Axios.

The API base URL is configured as:

```text
http://127.0.0.1:8000/api
```

Authentication tokens are sent through the Authorization header:

```text
Authorization: Bearer <accessToken>
```

---

# 🌐 CORS Configuration

During local development, the Django backend must allow requests from the React development server.

The frontend normally runs on:

```text
http://localhost:5173
```

The backend normally runs on:

```text
http://127.0.0.1:8000
```

Django CORS configuration should allow the frontend development origin.

---

# 🧪 Testing

The APIs can be tested using tools such as:

- Postman
- Swagger
- Browser Developer Tools

Testing should cover:

- Registration
- Login
- Authentication
- Project creation
- Project listing
- Proposal submission
- Proposal acceptance
- Workspace creation
- File upload
- Milestone creation
- Progress updates
- Client review
- Completion
- Change requests

---

# 🛠️ Troubleshooting

## Pillow Not Installed

If Django shows:

```text
Cannot use ImageField because Pillow is not installed.
```

Install Pillow:

```bash
python -m pip install Pillow
```

Then run:

```bash
python manage.py migrate
```

---

## MySQLdb Error

If you see:

```text
ModuleNotFoundError: No module named 'MySQLdb'
```

Install the MySQL client:

```bash
pip install mysqlclient
```

Then restart the Django server.

---

## Vite Not Recognized

If you see:

```text
'vite' is not recognized as an internal or external command
```

Navigate to the frontend folder and run:

```bash
npm install
```

Then:

```bash
npm run dev
```

---

## Authentication Issues

If the frontend returns a `401 Unauthorized` response:

1. Check that the backend is running.
2. Check that the access token exists.
3. Check browser local storage.
4. Log in again if the token has expired.
5. Verify the Authorization header.

Expected format:

```text
Authorization: Bearer <access-token>
```

---

## CORS Error

If the browser reports a CORS error:

1. Make sure Django is running.
2. Make sure the frontend URL is allowed by Django.
3. Check the CORS configuration.
4. Restart the Django server.

---

# 🔒 Security Considerations

The project uses JWT-based authentication to protect API endpoints.

For production deployment:

- Use environment variables for secrets.
- Do not commit passwords.
- Do not commit JWT secrets.
- Do not commit database credentials.
- Use HTTPS.
- Configure secure cookies where applicable.
- Restrict CORS to trusted domains.
- Configure Django `DEBUG=False`.
- Use a secure production database.
- Configure proper media and static file handling.

---

# 🚀 Production Deployment

FreelanceHub can be deployed using services suitable for Django, React and MySQL.

Possible deployment architecture:

```text
                    Users
                      │
                      ↓
              React Frontend
                      │
                      ↓
               REST API
                      │
                      ↓
             Django Backend
                      │
                      ↓
                 MySQL DB
```

The frontend and backend can be deployed separately.

Possible frontend hosting platforms include:

- Vercel
- Netlify

Possible backend hosting platforms include:

- Render
- Railway
- AWS
- Other Django-compatible hosting services

---

# 📦 Production Frontend Build

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a production build:

```bash
npm run build
```

The production files will be generated in the build output directory configured by Vite.

To preview the production build locally:

```bash
npm run preview
```

---

# 🧹 Git and GitHub

Initialize Git if required:

```bash
git init
```

Add project files:

```bash
git add .
```

Commit:

```bash
git commit -m "Initial commit"
```

Add the GitHub repository:

```bash
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
```

Push the project:

```bash
git branch -M main
git push -u origin main
```

---

# 🚫 Files That Should Not Be Committed

The following files should generally not be pushed to GitHub:

```text
venv/
.env
__pycache__/
*.pyc
node_modules/
dist/
build/
media/
```

Example `.gitignore` entries:

```text
# Python
venv/
__pycache__/
*.pyc

# Django
*.sqlite3
media/

# Environment
.env

# Node
node_modules/
dist/

# IDE
.vscode/
.idea/
```

---

# 📸 Application Workflow

The overall FreelanceHub workflow can be summarized as:

```text
                 ┌──────────────────┐
                 │ Register / Login │
                 └────────┬─────────┘
                          │
                  JWT Authentication
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
        Client Dashboard       Freelancer Dashboard
              │                       │
              ↓                       ↓
       Create Project          Browse Projects
              │                       │
              │                       ↓
              │                 Submit Proposal
              │                       │
              └───────────┬───────────┘
                          ↓
                  Client Reviews
                     Proposal
                          │
                          ↓
                  Accept Freelancer
                          │
                          ↓
                 Project Workspace
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          Files       Messages      Milestones
                                       │
                                       ↓
                               Update Progress
                                       │
                                       ↓
                                   Submitted
                                       │
                                       ↓
                                Client Review
                                       │
                          ┌────────────┴────────────┐
                          ↓                         ↓
                     Completed                Needs Changes
                                                    │
                                                    ↓
                                             Work Updated
                                                    │
                                                    ↓
                                                Submitted
```

---

# 📋 Complete Feature Summary

| Feature | Client | Freelancer |
|---|:---:|:---:|
| Registration | ✅ | ✅ |
| Login | ✅ | ✅ |
| JWT Authentication | ✅ | ✅ |
| Profile Management | ✅ | ✅ |
| Browse Projects | — | ✅ |
| Create Project | ✅ | — |
| Manage Project | ✅ | — |
| Submit Proposal | — | ✅ |
| Review Proposal | ✅ | — |
| Accept Freelancer | ✅ | — |
| Project Workspace | ✅ | ✅ |
| File Management | ✅ | ✅ |
| Messages | ✅ | ✅ |
| Activity | ✅ | ✅ |
| Create Milestones | ✅ | — |
| Update Milestone Progress | — | ✅ |
| Submit Milestone | — | ✅ |
| Review Milestone | ✅ | — |
| Mark Completed | ✅ | — |
| Request Changes | ✅ | — |

---

# 🎯 Project Objectives

The main objectives of FreelanceHub are:

1. Create a centralized freelance marketplace.
2. Connect clients with suitable freelancers.
3. Simplify project and proposal management.
4. Provide a structured collaboration workspace.
5. Track project progress through milestones.
6. Allow freelancers to submit work progressively.
7. Allow clients to review completed work.
8. Support a clear completed/needs-changes workflow.
9. Provide secure role-based access.
10. Demonstrate full-stack web development skills.

---

# 💡 What This Project Demonstrates

FreelanceHub demonstrates practical knowledge of:

- Full-stack web development
- Python programming
- Django development
- Django REST Framework
- React.js
- REST API development
- JWT authentication
- Role-based authorization
- CRUD operations
- MySQL database integration
- Database relationships
- Frontend-backend integration
- Axios
- File uploads
- Project management workflows
- Milestone management
- Progress tracking
- Client-freelancer collaboration
- Git and GitHub

---

# 📚 Learning Outcomes

Through this project, the following concepts were implemented and practiced:

### Backend

- Django project structure
- Django models
- Model relationships
- Serializers
- API views
- URL routing
- Authentication
- Authorization
- Database migrations
- File handling
- REST API design

### Frontend

- React components
- React Router
- State management
- API integration
- Axios
- Form handling
- Conditional rendering
- Role-based UI
- Responsive layouts
- Error handling

### Database

- Relational database design
- Foreign keys
- One-to-one relationships
- Many-to-many relationships
- Database migrations
- CRUD operations

---

# 🔮 Future Improvements

Possible future improvements include:

- Real-time chat using WebSockets
- Real-time notifications
- Online payment integration
- Freelancer ratings and reviews
- Advanced freelancer search
- Advanced project filtering
- Email notifications
- Project deadline notifications
- File preview
- Cloud file storage
- Automated invoice generation
- Payment tracking
- Admin analytics dashboard
- Advanced reporting
- Search optimization
- Improved accessibility
- Production deployment
- Automated testing
- CI/CD integration

---

# 📈 Future Project Workflow

A future expanded workflow could be:

```text
Project
   ↓
Proposal
   ↓
Freelancer Selection
   ↓
Workspace
   ↓
Milestones
   ↓
Development
   ↓
File Submission
   ↓
Client Review
   ↓
Payment
   ↓
Completion
   ↓
Rating & Review
```

---

# 🧪 Recommended Testing Workflow

For testing the complete application:

### Step 1 — Create Client

Register a new client account.

### Step 2 — Create Freelancer

Register a new freelancer account.

### Step 3 — Client Creates Project

Create a project with:

- Title
- Description
- Budget
- Deadline
- Required skills

### Step 4 — Freelancer Views Project

Log in as the freelancer and browse available projects.

### Step 5 — Submit Proposal

Submit a proposal for the project.

### Step 6 — Client Reviews Proposal

Log in as the client and review the submitted proposal.

### Step 7 — Accept Proposal

Accept the freelancer.

### Step 8 — Workspace

Open the generated project workspace.

### Step 9 — Create Milestones

Client creates one or more milestones.

### Step 10 — Freelancer Updates Progress

Freelancer updates milestone progress.

Example:

```text
0%
 ↓
25%
 ↓
50%
 ↓
75%
 ↓
100%
```

### Step 11 — Submit Work

Freelancer submits the milestone for client review.

### Step 12 — Client Review

Client chooses:

```text
Completed
```

or:

```text
Needs Changes
```

### Step 13 — Complete Project

Once all milestones are completed, the project can be marked as completed.

---

# 🏆 Project Highlights

⭐ Full-stack freelance marketplace

⭐ Client and freelancer role-based workflows

⭐ JWT authentication

⭐ Project management

⭐ Proposal management

⭐ Freelancer discovery

⭐ Collaboration workspace

⭐ File management

⭐ Milestone management

⭐ Progress tracking

⭐ Client review workflow

⭐ REST API integration

⭐ MySQL database

⭐ React frontend

⭐ Django REST backend

---

# 📌 Project Status

🚧 **FreelanceHub is a full-stack project developed for learning, portfolio development and demonstrating practical software development skills.**

The major workflow includes:

```text
Authentication
     ↓
Projects
     ↓
Proposals
     ↓
Workspace
     ↓
Files / Messages / Activity
     ↓
Milestones
     ↓
Progress Tracking
     ↓
Client Review
     ↓
Completed / Needs Changes
```

---

# 👩‍💻 Developer

## Shreya V K

**Python Full Stack Developer**

B.E. Computer Science and Engineering

Global Academy of Technology  
Bangalore, Karnataka

---

# 🔗 Connect

### GitHub

https://github.com/Shreyavk28

### LinkedIn

https://www.linkedin.com/in/shreya-vk-softwareengineer/

### Email

shreyavkumar5344@gmail.com

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

Your feedback and suggestions are always welcome.

---

# 📄 License

This project was created for educational, portfolio and demonstration purposes.

---

# ❤️ Acknowledgement

This project was developed as a practical full-stack application to demonstrate frontend development, backend development, database integration, authentication, REST APIs and real-world project management workflows.

---

## 🚀 FreelanceHub

**Connect. Collaborate. Build. Deliver.**

Built with ❤️ using **Python, Django REST Framework, React.js and MySQL**.

© 2026 Shreya V K
