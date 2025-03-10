from sqlalchemy.orm import Session
from fastapi import HTTPException,status
from src.database_management import tables
from sqlalchemy.sql import func

def get_all(db: Session):
    p= db.query(tables.Project).all()
    return p

def create_project(request, db:Session):
    new_p = tables.Project(name=request.name, 
                           description=request.description,
                           type=request.type,
                           #status=request.status,
                           date=func.now())
    db.add(new_p)
    db.commit()
    db.refresh(new_p)
    return new_p

def update(id,request, db:Session):
    project =db.query(tables.Project).filter(tables.Project.id==id)
    select=project.first
    if not select:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Blog with id {id} does not exist"
        )
    project.update(request.model_dump())
    db.commit()
    return {'ok, updated'} 

