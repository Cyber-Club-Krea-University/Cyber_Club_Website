from typing import List, Optional
from pydantic import BaseModel


class project_create(BaseModel):
    name:str
    description: str
    type: str
    #status: str
    
    


class project_view(project_create):
    members: Optional[str] = None
    class Config:
        from_attributes = True

class user_create(BaseModel):
    name: str
    email: str
    password: str

class user_full(BaseModel):
    name: str
    email: str
    projects: str

class login(BaseModel):
    email:str
    password:str
