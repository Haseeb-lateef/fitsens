import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from app.config import settings


SECRET_KEY = settings.secret_key
ALGORITHIM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES  =300




def create_token(data: dict):
    data_to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    data_to_encode.update({"exp": expire})

    token = jwt.encode(data_to_encode,SECRET_KEY,ALGORITHIM)


    return token


def verify_token(token: str, credential_exception):

    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHIM])
        user_id : int = payload.get("user_id")

        if user_id is None:
            raise credential_exception

        return user_id
        
    except InvalidTokenError:
        raise credential_exception

    




    