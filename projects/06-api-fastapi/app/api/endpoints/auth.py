from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_async_db
from app.models import User
from app.schemas import (
    RegisterRequest, LoginRequest, AuthData, TokenRefreshData, UserResponse,
    SuccessResponse, MessageData
)
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_refresh_token
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=SuccessResponse[AuthData])
async def register(req: RegisterRequest, response: Response, db: AsyncSession = Depends(get_async_db)):
    # Check if email exists
    stmt = select(User).where(User.email == req.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists")

    # Create User
    hashed_pwd = get_password_hash(req.password)
    user = User(email=req.email, password_hash=hashed_pwd, name=req.name)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        path="/api/v1/auth"
    )

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        createdAt=user.created_at.isoformat() if user.created_at else None
    )

    return SuccessResponse(data=AuthData(user=user_resp, accessToken=access_token))


@router.post("/login", response_model=SuccessResponse[AuthData])
async def login(req: LoginRequest, response: Response, db: AsyncSession = Depends(get_async_db)):
    stmt = select(User).where(User.email == req.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        path="/api/v1/auth"
    )

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        createdAt=user.created_at.isoformat() if user.created_at else None
    )

    return SuccessResponse(data=AuthData(user=user_resp, accessToken=access_token))


@router.post("/refresh", response_model=SuccessResponse[TokenRefreshData])
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_async_db)):
    cookie_refresh_token = request.cookies.get("refreshToken")
    if not cookie_refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token cookie missing")

    user_id = decode_refresh_token(cookie_refresh_token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access_token = create_access_token(user.id)
    return SuccessResponse(data=TokenRefreshData(accessToken=new_access_token))


@router.post("/logout", response_model=SuccessResponse[MessageData])
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="refreshToken", path="/api/v1/auth")
    return SuccessResponse(data=MessageData(message="Successfully logged out"))


@router.get("/me", response_model=SuccessResponse[UserResponse])
async def get_me(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        createdAt=current_user.created_at.isoformat() if current_user.created_at else None
    )
    return SuccessResponse(data=user_resp)
