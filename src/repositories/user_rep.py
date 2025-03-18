from sqlalchemy.orm import Session
from fastapi import HTTPException,status
from src.database_management import tables
from sqlalchemy.sql import func

def create_user(request, db:Session):
    new_u = tables.User(name=request.name, 
                           email=request.email,
    )
    db.add(new_u)
    db.commit()
    db.refresh(new_u)
    return new_u

def get_all(db: Session):
    p= db.query(tables.User).all()
    return p
