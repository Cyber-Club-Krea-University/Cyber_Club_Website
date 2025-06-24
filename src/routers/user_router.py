from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from src.database_management import schemas, database, tables
from src.repositories import user_rep, project_rep
from src.routers.auth import get_current_user
from typing import List

router = APIRouter(
    tags=['user'],
    prefix="/user"
)

@router.post('/', status_code=status.HTTP_201_CREATED)
def create_user(request: schemas.user_create, db: Session = Depends(database.get_db)):  
    return user_rep.create_user(request, db)

@router.get('/', status_code=status.HTTP_200_OK)
def get_all_users(db: Session = Depends(database.get_db)):
    return user_rep.get_all(db)

@router.get('/me', response_model=schemas.user_full, status_code=status.HTTP_200_OK)
def get_current_user_profile(
    current_user: tables.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "projects": None  # You can expand this to show user's projects
    }

@router.put('/me', status_code=status.HTTP_200_OK)
def update_profile(
    request: schemas.user_update,
    current_user: tables.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    return user_rep.update_user(current_user.id, request, db)

@router.get('/me/projects', response_model=List[schemas.project_view], status_code=status.HTTP_200_OK)
def get_my_projects(
    current_user: tables.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    return project_rep.get_user_projects(current_user.id, db)

@router.get('/me/applications', response_model=List[schemas.ProjectApplication], status_code=status.HTTP_200_OK)
def get_my_applications(
    current_user: tables.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    applications = db.query(tables.ProjectApplication).filter(
        tables.ProjectApplication.user_id == current_user.id
    ).all()
    return applications

@router.delete('/{user_id}/', status_code=status.HTTP_200_OK)
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    return user_rep.destroy_user(user_id, db)