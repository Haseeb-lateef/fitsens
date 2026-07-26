from pydantic import BaseModel

class RegisterData(BaseModel):
    username: str
    password: str
    email: str

class RegisterResponse(BaseModel):
    id: int
    username: str
    email: str
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int

    