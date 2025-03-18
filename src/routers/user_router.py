from fastapi import APIRouter
from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlalchemy.orm import Session
from src.database_management import schemas, database
from src.repositories import user_rep

router=APIRouter(
    tags=['user'],
    prefix="/user")

@router.post('/',status_code=status.HTTP_201_CREATED)
def create(request: schemas.user_create, db: Session = Depends(database.get_db)):  
    return user_rep.create_user(request, db)
@router.get('/',status_code=status.HTTP_200_OK)
def all(db: Session=Depends(database.get_db)):
    return user_rep.get_all(db)