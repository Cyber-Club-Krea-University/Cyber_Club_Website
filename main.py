from fastapi import FastAPI
from src.database_management.database import Base, engine

#Generate tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Base.metadata.create_all(bind=engine)
@app.get('/check')
def check():
    return {"check this": "title"}
