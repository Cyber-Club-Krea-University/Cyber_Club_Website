from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from .database import Base
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

class User(Base):
    __tablename__= "user"
    id= Column(Integer, primary_key=True, index=True)
    name= Column(String)
    email= Column(String)
    projects = relationship("Project", back_populates="member")
    password = Column(String)

class Project(Base):
    __tablename__="project"
    id= Column(Integer, primary_key=True, index=True)
    name= Column(String)
    description=Column(String)
    type = Column(String)
    date= Column(DateTime, default=func.now()) 
    status= Column(String)
    user_id = Column(Integer, ForeignKey('user.id'))
    member = relationship("User", back_populates="projects")

class Roles(Base):
    __tablename__="roles"
    id= Column(Integer, primary_key=True, index=True)
    role_name=Column(String)
    desc=Column(String)