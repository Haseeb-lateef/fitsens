from pydantic import BaseModel, EmailStr, ConfigDict

class RegisterData(BaseModel):
    username: str
    password: str
    email: EmailStr

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

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)

    