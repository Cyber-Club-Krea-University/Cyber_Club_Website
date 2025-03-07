from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base
from datetime import datetime
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__= "user"
    id= Column(Integer, primary_key=True, index=True)
    name= Column(String)
    email= Column(String)
    roll_no= Column(String, unique=True)

class Project(Base):
    __tablename__="project"
    id= Column(Integer, primary_key=True, index=True)
    name= Column(String)
    description=Column(String)
    type = Column(String)
    date= Column(datetime, default=datetime('now'))  
    status= Column(String)