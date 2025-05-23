from sqlalchemy.orm import Session
from fastapi import HTTPException,status
from src.database_management import tables
from src.routers import hashing
from sqlalchemy.sql import func

def create_user(request, db:Session):
    new_u = tables.User(name=request.name, 
                           email=request.email, password = hashing.Hash.bcrypt(request.password)
    )
    db.add(new_u)
    db.commit()
    db.refresh(new_u)
    return new_u

def get_all(db: Session):
    p= db.query(tables.User).all()
    return p

def destroy_user(id, db:Session):
    db.query(tables.User).filter(tables.User.id==id).delete(synchronize_session=False)
    db.commit()
    return{'deletion successful'}