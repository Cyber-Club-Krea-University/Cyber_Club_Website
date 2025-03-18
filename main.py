from fastapi import FastAPI
from src.database_management.database import Base, engine
from src.routers import project_router, user_router
#Generate tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(project_router.router)
app.include_router(user_router.router)
