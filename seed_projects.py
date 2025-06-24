#!/usr/bin/env python3
"""
Seed script to add sample projects to the Cyber Club database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from src.database_management.database import Sessionlocal, engine
from src.database_management.tables import Base, User, Project
from src.routers.hashing import Hash
from datetime import datetime, timedelta
import random

# Sample projects data
SAMPLE_PROJECTS = [
    {
        "name": "AI-Powered Study Buddy",
        "description": "A machine learning application that helps students create personalized study schedules, generates quiz questions from lecture notes, and tracks learning progress. Perfect for data science enthusiasts!",
        "type": "ai-ml",
        "status": "open"
    },
    {
        "name": "Krea Campus Social Network",
        "description": "A modern social platform specifically for Krea students to share projects, find study groups, organize events, and connect with peers across different programs. Built with React and Node.js.",
        "type": "web-development",
        "status": "open"
    },
    {
        "name": "Smart IoT Dorm Room System",
        "description": "An Internet of Things project to automate dorm rooms - smart lighting, temperature control, security alerts, and energy monitoring using Raspberry Pi and Arduino.",
        "type": "iot",
        "status": "open"
    },
    {
        "name": "Cybersecurity Awareness Game",
        "description": "An interactive mobile game that teaches cybersecurity best practices through engaging challenges, puzzles, and real-world scenarios. Help make cybersecurity education fun!",
        "type": "game-dev",
        "status": "open"
    },
    {
        "name": "Blockchain Voting System",
        "description": "A secure, transparent voting system for student elections using blockchain technology. Ensures vote integrity and enables real-time result tracking.",
        "type": "blockchain",
        "status": "open"
    },
    {
        "name": "Campus Food Delivery App",
        "description": "A mobile app connecting students with local food vendors around campus. Features real-time tracking, group ordering, and student discount integration.",
        "type": "mobile-app",
        "status": "open"
    },
    {
        "name": "Academic Performance Analytics",
        "description": "Data visualization dashboard analyzing student performance trends, course difficulty metrics, and predictive modeling for academic success.",
        "type": "data-science",
        "status": "open"
    },
    {
        "name": "Virtual Reality Campus Tour",
        "description": "An immersive VR experience showcasing Krea University campus for prospective students and virtual events. Built with Unity and WebVR.",
        "type": "other",
        "status": "open"
    },
    {
        "name": "Smart Library Management",
        "description": "Web application for efficient library resource management with book recommendations, study space booking, and automated reminder systems.",
        "type": "web-development",
        "status": "open"
    },
    {
        "name": "Environmental Monitoring Network",
        "description": "IoT sensor network to monitor air quality, temperature, and noise levels across campus. Contribute to sustainability initiatives!",
        "type": "iot",
        "status": "open"
    }
]

# Sample admin user
ADMIN_USER = {
    "name": "Cyber Club Admin",
    "email": "admin@krea.edu.in",
    "password": "cyberclubrocks2024",
    "google_id": "admin_google_id"
}

def create_admin_user(db: Session):
    """Create an admin user if it doesn't exist"""
    existing_admin = db.query(User).filter(User.email == ADMIN_USER["email"]).first()
    if existing_admin:
        print(f"Admin user already exists: {existing_admin.email}")
        return existing_admin
    
    admin = User(
        name=ADMIN_USER["name"],
        email=ADMIN_USER["email"],
        hashed_password=Hash.bcrypt(ADMIN_USER["password"]),
        google_id=ADMIN_USER["google_id"]
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"Created admin user: {admin.email}")
    return admin

def seed_projects(db: Session):
    """Seed the database with sample projects"""
    # Create admin user first
    admin_user = create_admin_user(db)
    
    # Check if projects already exist
    existing_projects = db.query(Project).count()
    if existing_projects > 0:
        print(f"Database already has {existing_projects} projects. Skipping seed.")
        return
    
    print("Seeding sample projects...")
    
    for project_data in SAMPLE_PROJECTS:
        # Create project with random dates in the past 30 days
        days_ago = random.randint(1, 30)
        created_date = datetime.now() - timedelta(days=days_ago)
        
        project = Project(
            title=project_data["name"],
            description=project_data["description"],
            category=project_data["type"],
            status=project_data["status"],
            owner_id=admin_user.id,
            created_at=created_date
        )
        db.add(project)
        print(f"Added project: {project.title}")
    
    db.commit()
    print(f"Successfully seeded {len(SAMPLE_PROJECTS)} projects!")

def seed_database():
    """Function to be called by main.py for seeding database on startup"""
    try:
        print("🌱 Starting database seeding...")
        
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        # Create database session
        db = Sessionlocal()
        try:
            seed_projects(db)
            print("✅ Database seeding completed successfully!")
        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            db.rollback()
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Seeding skipped due to error: {e}")

def main():
    """Main function to run the seeding process"""
    print("🌱 Starting database seeding...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables ensured")
    
    # Create database session
    db = Sessionlocal()
    try:
        seed_projects(db)
        print("🎉 Database seeding completed successfully!")
        print("\n📊 Current database stats:")
        users_count = db.query(User).count()
        projects_count = db.query(Project).count()
        print(f"   Users: {users_count}")
        print(f"   Projects: {projects_count}")
        
        print("\n🚀 You can now:")
        print("   1. Start the application: python run.py")
        print("   2. Visit http://localhost:8000")
        print("   3. Sign in with Google using a Krea email")
        print("   4. Explore the sample projects!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main() 