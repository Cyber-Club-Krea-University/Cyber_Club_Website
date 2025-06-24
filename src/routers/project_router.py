from fastapi import APIRouter, Depends, status, Response, HTTPException
from sqlalchemy.orm import Session
from src.database_management import schemas, database, tables
from src.repositories import project_rep
from src.routers.auth import get_current_user
from typing import List

router = APIRouter(
    tags=['projects'],
    prefix="/projects"
)

@router.get('/', response_model=List[schemas.project_view], status_code=status.HTTP_200_OK)
def get_all_projects(db: Session = Depends(database.get_db)):
    return project_rep.get_all(db)

@router.get('/{project_id}', response_model=schemas.project_view, status_code=status.HTTP_200_OK)
def get_project(project_id: int, db: Session = Depends(database.get_db)):
    project = db.query(tables.Project).filter(tables.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project

@router.post('/', status_code=status.HTTP_201_CREATED)
def create_project(
    request: schemas.project_create, 
    db: Session = Depends(database.get_db),
    current_user: tables.User = Depends(get_current_user)
):
    return project_rep.create_project(request, db, current_user.id)

@router.put('/{project_id}', status_code=status.HTTP_202_ACCEPTED)
def update_project(
    project_id: int, 
    request: schemas.project_create, 
    db: Session = Depends(database.get_db),
    current_user: tables.User = Depends(get_current_user)
):
    return project_rep.update(project_id, request, db, current_user.id)

@router.delete('/{project_id}', status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: tables.User = Depends(get_current_user)
):
    return project_rep.delete_project(project_id, db, current_user.id)

@router.post('/{project_id}/apply', status_code=status.HTTP_201_CREATED)
def apply_to_project(
    project_id: int,
    request: schemas.project_apply,
    db: Session = Depends(database.get_db),
    current_user: tables.User = Depends(get_current_user)
):
    # Check if project exists
    project = db.query(tables.Project).filter(tables.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    # Check if user already applied
    existing_application = db.query(tables.ProjectApplication).filter(
        tables.ProjectApplication.project_id == project_id,
        tables.ProjectApplication.user_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="You have already applied to this project"
        )
    
    # Create application
    application = tables.ProjectApplication(
        project_id=project_id,
        user_id=current_user.id,
        message=request.reason  # Map reason to message field
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {"message": "Application submitted successfully", "application_id": application.id}

@router.get('/{project_id}/applications', response_model=List[schemas.ProjectApplication])
def get_project_applications(
    project_id: int,
    db: Session = Depends(database.get_db),
    current_user: tables.User = Depends(get_current_user)
):
    # Check if user owns the project - Fixed field name
    project = db.query(tables.Project).filter(
        tables.Project.id == project_id,
        tables.Project.owner_id == current_user.id  # Changed from user_id to owner_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You can only view applications for your own projects"
        )
    
    applications = db.query(tables.ProjectApplication).filter(
        tables.ProjectApplication.project_id == project_id
    ).all()
    
    return applications

@router.put('/applications/{application_id}/status', status_code=status.HTTP_200_OK)
def update_application_status(
    application_id: int,
    new_status: str,
    db: Session = Depends(database.get_db),
    current_user: tables.User = Depends(get_current_user)
):
    if new_status not in ["approved", "rejected", "pending"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'approved', 'rejected', or 'pending'"
        )
    
    application = db.query(tables.ProjectApplication).filter(
        tables.ProjectApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    # Check if user owns the project - Fixed field name
    project = db.query(tables.Project).filter(
        tables.Project.id == application.project_id,
        tables.Project.owner_id == current_user.id  # Changed from user_id to owner_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage applications for your own projects"
        )
    
    application.status = new_status
    db.commit()
    
    return {"message": f"Application status updated to {new_status}"}