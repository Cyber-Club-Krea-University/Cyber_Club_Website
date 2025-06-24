from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.database_management import tables
from src.routers import hashing
from sqlalchemy.sql import func

def create_user(request, db: Session):
    # Check if user already exists
    existing_user = db.query(tables.User).filter(tables.User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    new_user = tables.User(
        name=request.name, 
        email=request.email, 
        hashed_password=hashing.Hash.bcrypt(request.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_all(db: Session):
    users = db.query(tables.User).all()
    return users

def get_by_id(user_id: int, db: Session):
    user = db.query(tables.User).filter(tables.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} does not exist"
        )
    return user

def get_by_email(email: str, db: Session):
    user = db.query(tables.User).filter(tables.User.email == email).first()
    return user

def update_user(user_id: int, request, db: Session):
    user_query = db.query(tables.User).filter(tables.User.id == user_id)
    user = user_query.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} does not exist"
        )
    
    # Check if email is being updated and if it already exists
    if request.email and request.email != user.email:
        existing_user = db.query(tables.User).filter(
            tables.User.email == request.email,
            tables.User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
    
    # Update only provided fields
    update_data = {}
    if request.name:
        update_data["name"] = request.name
    if request.email:
        update_data["email"] = request.email
    
    if update_data:
        user_query.update(update_data)
        db.commit()
    
    return {"message": "User updated successfully"}

def destroy_user(user_id: int, db: Session):
    user = db.query(tables.User).filter(tables.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} does not exist"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, request):
        return create_user(request, self.db)
    
    def get_all(self):
        return get_all(self.db)
    
    def get_by_id(self, user_id: int):
        return get_by_id(user_id, self.db)
    
    def get_by_email(self, email: str):
        return get_by_email(email, self.db)
    
    def get_user_by_email(self, email: str):
        """Alias for get_by_email to match auth.py expectations"""
        return get_by_email(email, self.db)
    
    def update(self, user_id: int, request):
        return update_user(user_id, request, self.db)
    
    def delete(self, user_id: int):
        return destroy_user(user_id, self.db)
    
    def create_or_update_from_google(self, google_user_info):
        """Create or update user from Google OAuth info"""
        existing_user = self.get_by_email(google_user_info['email'])
        
        if existing_user:
            # Update existing user with any new info from Google
            if 'picture' in google_user_info:
                # Note: Need to add avatar_url field to User table if not present
                pass  # Skip avatar update for now
            self.db.commit()
            return existing_user
        else:
            # Create new user
            new_user = tables.User(
                name=google_user_info['name'],
                email=google_user_info['email'],
                hashed_password="google_oauth_user"  # Placeholder for OAuth users
            )
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            return new_user