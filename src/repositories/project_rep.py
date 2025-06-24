from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.database_management import tables
from sqlalchemy.sql import func

def get_all(db: Session):
    projects = db.query(tables.Project).all()
    return projects

def get_by_id(project_id: int, db: Session):
    project = db.query(tables.Project).filter(tables.Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} does not exist"
        )
    return project

def create_project(request, db: Session, user_id: int):
    new_project = tables.Project(
        title=request.title,
        description=request.description,
        category=request.category,
        status=request.status,
        owner_id=user_id,
        created_at=func.now()
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

def update(project_id: int, request, db: Session, user_id: int):
    project_query = db.query(tables.Project).filter(tables.Project.id == project_id)
    project = project_query.first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Project with id {project_id} does not exist"
        )
    
    # Check if user owns the project
    if project.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own projects"
        )
    
    project_query.update(request.model_dump())
    db.commit()
    return {"message": "Project updated successfully"}

def delete_project(project_id: int, db: Session, user_id: int):
    project = db.query(tables.Project).filter(tables.Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} does not exist"
        )
    
    # Check if user owns the project
    if project.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own projects"
        )
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

def get_user_projects(user_id: int, db: Session):
    projects = db.query(tables.Project).filter(tables.Project.owner_id == user_id).all()
    return projects

