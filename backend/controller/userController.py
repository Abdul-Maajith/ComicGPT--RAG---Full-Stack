from config.database import users_collection
from typing import Optional, List, Dict
from datetime import datetime, timezone
from models.userModel import llmKeySchema

# Adding a new user into to the database
async def register_User(user_data: dict) -> dict:
    try:
        # Check if the user already exists
        existing_user = await fetch_user_by_uid(user_data.get("uid"))
        if existing_user:
            print("User Already exists")
            try:
                await users_collection.update_one(
                    {"uid": user_data.get("uid")},
                    {"$set": {"lastLogin": datetime.now(tz=timezone.utc)}}
                )
                return {
                    "message": "User already exists, login updated",
                    "userOnBoarded": existing_user.get("userOnBoarded", False)
                }
            except Exception as e:
                error = f"BE | Error in updating last login time | unique_id {user_data.get("uid")} Error: {e}"
                print(error)
        else:
            print("New user")
            # Insert a new user with default credit limit
            try:
                user_data["credit_limit"] = 1000
                user_data["createdAt"] = datetime.now(tz=timezone.utc)
                user_data["userOnBoarded"] = False 
                await users_collection.insert_one(user_data)
                return {
                    "message": "User successfully created",
                    "userOnBoarded": False
                }
            except Exception as e:
                error = f"BE | Error in inserting new user | unique_id {user_data.get("uid")} | Error: {e}"
                print(error)
                
    except Exception as e:
        error = f"BE | Error in registering the user | unique_id {user_data.get("uid")} | Error: {e}"
        print(error)

# Fetching User details by their UID
async def fetch_user_by_uid(uid: str) -> Optional[dict]:
    try:
        user_details = await users_collection.find_one({"uid": uid})
        if not user_details:
            return {}
        user_details['_id'] = str(user_details['_id'])
        return user_details
    except Exception as e:
        error = f"BE|Error in fetching user details by its uid|unique_id {uid}"
        print(error)
        raise

async def fetch_all_users() -> Optional[List[Dict]]:
    try:
        users = await users_collection.find({}).to_list(length=None)
        for user in users:
            user['_id'] = str(user['_id'])
        return users
    except Exception as e:
        error = f"BE|Error in fetching all users|{e}"
        print(error)
        raise

async def configure_key(key_info: llmKeySchema):
    try:
        user_details = await users_collection.find_one({"uid": key_info.uid})
        if user_details:
            if "api_key" in user_details:
                update_result = await users_collection.update_one(
                    {"uid": key_info.uid},
                    {"$set": {"api_key": {"key": key_info.key, "provider": key_info.provider}}}
                )
                if update_result.modified_count > 0:
                    print(f"BE|APIKey updated successfully for user {key_info.uid}")
                else:
                    print(f"BE|No updates required for user {key_info.uid}")
            else:
                update_result = await users_collection.update_one(
                    {"uid": key_info.uid},
                    {"$set": {"api_key": {"key": key_info.key, "provider": key_info.provider}}}
                )
                if update_result.modified_count > 0:
                    print(f"BE|APIKey added successfully for user {key_info.uid}")
                else:
                    print(f"BE|Error adding APIKey for user {key_info.uid}")

            return {
                "Message": "API successully configured."
            }
        else:
            print(f"BE|Error: User document not found for {key_info.uid}")
    except Exception as e:
        error = f"BE|Error in saving APIKey user details by its uid|unique_id {key_info.uid}"
        print(error)
        raise