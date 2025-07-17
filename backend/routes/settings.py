from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from main import (
    get_db, get_current_user, User, UserUpdate, PasswordUpdate,
    hash_password, verify_password
)

router = APIRouter()

@router.put("/profile")
def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update user fields
    for field, value in user_update.dict(exclude_unset=True).items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile updated successfully"}

@router.put("/password")
def update_password(password_update: PasswordUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify current password
    if not verify_password(password_update.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    current_user.password_hash = hash_password(password_update.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.get("/privacy")
def get_privacy_settings(current_user: User = Depends(get_current_user)):
    return {
        "profile_visibility": current_user.profile_visibility,
        "post_visibility": current_user.post_visibility,
        "story_visibility": current_user.story_visibility,
        "is_active": current_user.is_active
    }

@router.put("/privacy")
def update_privacy_settings(
    profile_visibility: str = None, 
    post_visibility: str = None,
    story_visibility: str = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    valid_privacy_levels = ["public", "friends", "private"]
    
    if profile_visibility and profile_visibility not in valid_privacy_levels:
        raise HTTPException(status_code=400, detail="Invalid profile visibility")
    if post_visibility and post_visibility not in valid_privacy_levels:
        raise HTTPException(status_code=400, detail="Invalid post visibility")
    if story_visibility and story_visibility not in valid_privacy_levels:
        raise HTTPException(status_code=400, detail="Invalid story visibility")
    
    if profile_visibility:
        current_user.profile_visibility = profile_visibility
    if post_visibility:
        current_user.post_visibility = post_visibility
    if story_visibility:
        current_user.story_visibility = story_visibility
    
    db.commit()
    
    return {"message": "Privacy settings updated successfully"}

@router.delete("/account")
def deactivate_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_active = False
    db.commit()
    
    return {"message": "Account deactivated successfully"}
