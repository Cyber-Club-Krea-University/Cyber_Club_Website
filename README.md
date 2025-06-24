# Cyber Club Website

A full-stack web application for the Cyber Club at Krea University, featuring project management, user authentication, and community collaboration.

## Features

### Frontend
- Modern, responsive web design
- Firebase authentication integration
- Interactive project management dashboard
- User profile management
- Mobile-friendly hamburger navigation

### Backend
- FastAPI REST API
- JWT-based authentication
- SQLite database with SQLAlchemy ORM
- Project CRUD operations
- Project application system
- User management

### Project Management System
- Create and manage projects
- Apply to join existing projects
- View application status
- Project categorization (Web Dev, Data Science, AI/ML, etc.)
- User-based project ownership

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python, FastAPI
- **Database**: SQLite with SQLAlchemy
- **Authentication**: JWT tokens + Firebase (dual auth system)
- **Styling**: Custom CSS with responsive design

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cyber_Club_Website
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r src/requirements.txt
   ```

3. **Run the application**
   ```bash
   python run.py
   ```

4. **Access the website**
   - Open your browser and go to `http://localhost:8000`
   - The database will be automatically created on first run

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Projects
- `GET /projects/` - Get all projects
- `POST /projects/` - Create a new project (authenticated)
- `GET /projects/{id}` - Get specific project
- `PUT /projects/{id}` - Update project (owner only)
- `DELETE /projects/{id}` - Delete project (owner only)

### Project Applications
- `POST /projects/{id}/apply` - Apply to join a project
- `GET /projects/{id}/applications` - View project applications (owner only)
- `PUT /applications/{id}/status` - Update application status (project owner only)

### Users
- `GET /user/me` - Get current user profile
- `PUT /user/me` - Update user profile
- `GET /user/me/projects` - Get user's projects
- `GET /user/me/applications` - Get user's applications

## Usage

### For Students

1. **Registration/Login**
   - Visit the website and use the login/registration form
   - Or use Google Sign-In (Firebase) with Krea email

2. **Browse Projects**
   - View available projects on the dashboard
   - See project descriptions, types, and requirements

3. **Apply to Projects**
   - Click "Apply to Join" on any project
   - Write a compelling application explaining your interest and skills

4. **Create Projects**
   - Use the "Create New Project" form
   - Specify project type, description, and requirements

5. **Manage Applications**
   - Track status of your applications
   - View your created projects and applicants

### For Project Owners

1. **Project Management**
   - View applications to your projects
   - Approve or reject applicants
   - Update project details

2. **Collaboration**
   - Work with approved team members
   - Update project status as needed

## Project Structure

```
Cyber_Club_Website/
├── main.py                     # FastAPI application entry point
├── run.py                      # Application startup script
├── site.db                     # SQLite database (auto-generated)
├── src/
│   ├── database_management/
│   │   ├── database.py         # Database configuration
│   │   ├── schemas.py          # Pydantic models
│   │   └── tables.py           # SQLAlchemy models
│   ├── repositories/
│   │   ├── project_rep.py      # Project data operations
│   │   └── user_rep.py         # User data operations
│   ├── routers/
│   │   ├── auth.py             # Authentication routes
│   │   ├── project_router.py   # Project management routes
│   │   ├── user_router.py      # User management routes
│   │   └── hashing.py          # Password hashing utilities
│   └── requirements.txt        # Python dependencies
└── views/
    ├── index.html              # Main webpage
    └── static/
        ├── styles.css          # Website styling
        ├── script.js           # Original JavaScript
        ├── api.js              # Backend API integration
        └── images/             # Website assets
```

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- password (Hashed)

### Projects Table
- id (Primary Key)
- name
- description
- type
- status
- date (Created)
- user_id (Foreign Key)

### Project Applications Table
- id (Primary Key)
- project_id (Foreign Key)
- user_id (Foreign Key)
- reason
- status (pending/approved/rejected)
- applied_date

## Development

### Adding New Features

1. **Backend**: Add new routes in the appropriate router file
2. **Database**: Update schemas.py and tables.py for new models
3. **Frontend**: Add JavaScript functions in api.js for new endpoints

### Testing

- The application includes basic error handling
- API endpoints can be tested using the automatic docs at `http://localhost:8000/docs`
- Frontend testing can be done in the browser console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, contact the Cyber Club at:
- Email: sias.cyberclub@krea.ac.in
- Instagram: @cyber_club_krea

---

**Built with ❤️ by the Cyber Club Team at Krea University**
