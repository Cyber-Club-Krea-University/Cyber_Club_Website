from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class project_create(BaseModel):
    title: str
    description: str
    category: str
    status: Optional[str] = "open"
    
    


class project_apply(BaseModel):
    project_id: int
    reason: str

class project_view(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    created_at: datetime
    owner_id: Optional[int] = None
    
    # Optional fields from the Project table
    max_members: Optional[int] = None
    is_recruiting: Optional[bool] = None
    is_public: Optional[bool] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class user_create(BaseModel):
    name: str
    email: str
    password: str

# Capitalized version for auth imports
class UserCreate(BaseModel):
    name: str
    email: str
    password: Optional[str] = None

class user_update(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class user_full(BaseModel):
    id: int
    name: str
    email: str
    projects: Optional[str] = None
    class Config:
        from_attributes = True

# Capitalized version for auth imports
class User(BaseModel):
    id: int
    name: str
    email: str
    is_admin: Optional[bool] = False
    bio: Optional[str] = None
    skills: Optional[str] = None
    github_username: Optional[str] = None
    portfolio_url: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class login(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectApplication(BaseModel):
    id: int
    project_id: int
    user_id: int
    message: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
