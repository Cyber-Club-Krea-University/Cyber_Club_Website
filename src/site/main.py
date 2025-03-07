from fastapi import FastAPI
app = FastAPI()

# Base.metadata.create_all(bind=engine)
@app.get('/check')
def check():
    return {"check this": "title"}