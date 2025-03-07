from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from src.database_management import schemas, database
from src.repositories import project_rep
from typing import List
router=APIRouter(
    tags=['projects'],
    prefix="/projects")

@router.get('/', response_model=List[schemas.project_view], status_code=status.HTTP_200_OK)
def all(db: Session=Depends(database.get_db)):
    return project_rep.get_all(db)

@router.post('/',status_code=status.HTTP_201_CREATED)
# def create(db:Session=Depends(database.get_db), request=schemas.project_create):
#     return project_rep.create_project(request,db )
def create(request: schemas.project_create, db: Session = Depends(database.get_db)):  
    return project_rep.create_project(request, db)