from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

#making engine
sqlite_file_name = "site.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

#making session
Sessionlocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    db = Sessionlocal()
    try:
        yield db
    finally:
        db.close()

# Import Base from tables to ensure it's available
from .tables import Base

