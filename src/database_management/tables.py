#!/usr/bin/env python3
"""
Enhanced Database Tables with Additional Features
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime

Base = declarative_base()

# Enums - Updated to match database values
class ProjectStatus(enum.Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    OPEN = "open"  # Added to match existing data

class ApplicationStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class ProjectCategory(enum.Enum):
    WEB_DEVELOPMENT = "web-development"
    AI_ML = "ai-ml"
    MOBILE_APP = "mobile-app"
    DATA_SCIENCE = "data-science"
    CYBERSECURITY = "cybersecurity"
    BLOCKCHAIN = "blockchain"
    IOT = "iot"
    GAME_DEV = "game-dev"
    CLOUD_COMPUTING = "cloud-computing"
    ROBOTICS = "robotics"
    OTHER = "other"

class MemberRole(enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class NotificationType(enum.Enum):
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_APPROVED = "application_approved"
    APPLICATION_REJECTED = "application_rejected"
    PROJECT_UPDATED = "project_updated"
    MEMBER_ADDED = "member_added"
    MEMBER_REMOVED = "member_removed"
    SYSTEM_ANNOUNCEMENT = "system_announcement"

# Association table for many-to-many relationship between users and projects
project_members = Table(
    'project_members',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('role', Enum(MemberRole), default=MemberRole.MEMBER),
    Column('joined_at', DateTime, default=func.now()),
    Column('is_active', Boolean, default=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    google_id = Column(String(255), nullable=True, index=True)
    
    # Profile fields
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # JSON string of skills
    github_username = Column(String(100), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Status fields
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_active = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships - Fixed foreign key specifications
    owned_projects = relationship("Project", back_populates="owner", foreign_keys="Project.owner_id")
    applications = relationship("ProjectApplication", back_populates="user", foreign_keys="ProjectApplication.user_id")
    reviewed_applications = relationship("ProjectApplication", foreign_keys="ProjectApplication.reviewed_by")
    notifications = relationship("Notification", back_populates="user", foreign_keys="Notification.user_id")
    project_memberships = relationship("Project", secondary=project_members, back_populates="members")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Project details - Using String instead of Enum temporarily
    category = Column(String(50), default="other")
    status = Column(String(50), default="planning")
    technologies = Column(Text, nullable=True)  # JSON string of technologies
    required_skills = Column(Text, nullable=True)  # JSON string of required skills
    
    # Project settings
    max_members = Column(Integer, default=5)
    is_recruiting = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    
    # Timeline
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    
    # Links and resources
    github_url = Column(String(255), nullable=True)
    demo_url = Column(String(255), nullable=True)
    documentation_url = Column(String(255), nullable=True)
    
    # Metadata
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="owned_projects", foreign_keys=[owner_id])
    applications = relationship("ProjectApplication", back_populates="project", cascade="all, delete-orphan")
    members = relationship("User", secondary=project_members, back_populates="project_memberships")
    updates = relationship("ProjectUpdate", back_populates="project", cascade="all, delete-orphan")

class ProjectApplication(Base):
    __tablename__ = "project_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    skills = Column(Text, nullable=True)  # JSON string of relevant skills
    experience = Column(Text, nullable=True)
    availability = Column(String(100), nullable=True)
    
    # Status
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    reviewed_at = Column(DateTime, nullable=True)
    review_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships - Fixed foreign key specifications
    user = relationship("User", back_populates="applications", foreign_keys=[user_id])
    project = relationship("Project", back_populates="applications")
    reviewer = relationship("User", back_populates="reviewed_applications", foreign_keys=[reviewed_by])

class ProjectUpdate(Base):
    __tablename__ = "project_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    update_type = Column(String(50), default="general")  # general, milestone, announcement
    
    # Metadata
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Foreign keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="updates")
    author = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Links and metadata
    related_project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    related_application_id = Column(Integer, ForeignKey("project_applications.id"), nullable=True)
    action_url = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime, nullable=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])
    related_project = relationship("Project")
    related_application = relationship("ProjectApplication")

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
    description = Column(String(255), nullable=True)
    is_public = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    
    # Relationships
    user = relationship("User")
    project = relationship("Project")