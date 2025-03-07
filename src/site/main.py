from fastapi import FastAPI
from . import tables
from .database import Base, engine

#Generate tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Base.metadata.create_all(bind=engine)
@app.get('/check')
def check():
    return {"check this": "title"}
