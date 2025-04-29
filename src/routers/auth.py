from fastapi import APIRouter, Depends,HTTPException, status
from src.database_management import schemas, database, tables
from sqlalchemy.orm import Session

router = APIRouter(tags=['authentication'])

@router.post('/login)')
def login(request:schemas.login, db:Session=Depends(database.get_db)):
    user= db.query(tables.User).filter(tables.User.email==request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User with email not found')
    return user