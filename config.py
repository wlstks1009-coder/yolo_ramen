<<<<<<< HEAD
DB_USER = "ramen"
DB_PASSWORD = "1234"
DB_DSN = "localhost:1521/XEPDB1"
=======
from sqlalchemy import create_engine

id='root'
pw='1234'
host='localhost:3306'
db='test'
url= f'mysql+pymysql://{id}:{pw}@{host}/{db}'

def get_engine():
    return create_engine(url)
>>>>>>> origin/master
