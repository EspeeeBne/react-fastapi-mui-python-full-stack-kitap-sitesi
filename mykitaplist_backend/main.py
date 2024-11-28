from fastapi import FastAPI, HTTPException, Depends, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import bcrypt
import jwt
from typing import List, Optional
import random
from uuid import uuid4
import requests
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from time import time

SECRET_KEY = "mysecretkey"
db_file = "books_db.json"
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT = 100
RATE_LIMIT_PERIOD = 2 
user_request_times = {}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time()
        request_times = user_request_times.get(client_ip, [])

        request_times = [t for t in request_times if current_time - t < RATE_LIMIT_PERIOD]
        user_request_times[client_ip] = request_times

        if len(request_times) >= RATE_LIMIT:
            return JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again later."})

        # Record this request
        user_request_times[client_ip].append(current_time)
        response = await call_next(request)
        return response

app.add_middleware(RateLimitMiddleware)

class Book(BaseModel):
    id: str
    title: str
    author: str
    cover_url: str
    completed_count: int = 0
    reading_count: int = 0
    to_read_count: int = 0

class User(BaseModel):
    id: str
    username: str
    password: str
    completed_books: List[str] = []
    to_read_books: List[str] = []
    currently_reading: List[str] = []
    weekly_stats: List[int] = []
    friends: List[str] = []
    profile_picture_url: Optional[str] = ""
    comments: List[dict] = []
    completed_count: int = 0
    reading_count: int = 0
    to_read_count: int = 0

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserPictureUpdate(BaseModel):
    profile_picture_url: str

class UserReadingStatusUpdate(BaseModel):
    book_id: str
    status: str 

class FriendUpdate(BaseModel):
    friend_username: str

class CommentUpdate(BaseModel):
    comment: str

def load_data():
    if not os.path.exists(db_file):
        with open(db_file, "w") as f:
            json.dump({"users": [], "books": []}, f, indent=4)
    try:
        with open(db_file, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        with open(db_file, "w") as f:
            json.dump({"users": [], "books": []}, f, indent=4)
        return {"users": [], "books": []}

def save_data(data):
    with open(db_file, "w") as f:
        json.dump(data, f, indent=4)


@app.put("/user_reading_status/{username}")
async def user_reading_status(username: str, update: UserReadingStatusUpdate):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    book = next((b for b in data["books"] if b["id"] == update.book_id), None)
    if user is None or book is None:
        raise HTTPException(status_code=404, detail="User or book not found.")


    if update.book_id in user["completed_books"]:
        user["completed_books"].remove(update.book_id)
        user["completed_count"] -= 1
        book["completed_count"] -= 1
    if update.book_id in user["to_read_books"]:
        user["to_read_books"].remove(update.book_id)
        user["to_read_count"] -= 1
        book["to_read_count"] -= 1
    if update.book_id in user["currently_reading"]:
        user["currently_reading"].remove(update.book_id)
        user["reading_count"] -= 1
        book["reading_count"] -= 1


    if update.status == "completed":
        user["completed_books"].append(update.book_id)
        user["completed_count"] += 1
        book["completed_count"] += 1
    elif update.status == "to_read":
        user["to_read_books"].append(update.book_id)
        user["to_read_count"] += 1
        book["to_read_count"] += 1
    elif update.status == "reading":
        user["currently_reading"].append(update.book_id)
        user["reading_count"] += 1
        book["reading_count"] += 1
    else:
        raise HTTPException(status_code=400, detail="Invalid status.")

    save_data(data)
    return {"message": "User reading status updated successfully."}


@app.get("/books")
async def get_books():
    data = load_data()
    return {"books": data["books"]}


@app.post("/register")
async def register(request: RegisterRequest):
    data = load_data()
    if any(u['username'] == request.username for u in data["users"]):
        raise HTTPException(status_code=400, detail="Username already taken.")
    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(id=str(uuid4()), username=request.username, password=hashed_password)
    data["users"].append(user.dict())
    save_data(data)
    return {"message": "User registered successfully."}


@app.post("/login")
async def login(request: LoginRequest):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == request.username), None)
    if user is None or not bcrypt.checkpw(request.password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = jwt.encode({"user_id": user["id"], "username": user["username"]}, SECRET_KEY, algorithm="HS256")
    return {"message": "Login successful.", "token": token, "username": user["username"]}
    

@app.get("/weekly_stats/{username}")
async def get_weekly_stats(username: str):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"weekly_stats": user["weekly_stats"]}


@app.get("/search_book")
async def search_book(query: str):
    response = requests.get(f"https://openlibrary.org/search.json?q={query}")
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching data from book API.")
    books = response.json().get("docs", [])
    found_books = [{
        "id": book.get("key"),
        "title": book.get("title"),
        "author": book.get("author_name", ["Unknown"])[0],
        "cover_url": f"https://covers.openlibrary.org/b/id/{book.get('cover_i', '')}-L.jpg" if book.get("cover_i") else ""
    } for book in books]
    if not found_books:
        return {"message": "No books found. You can add it manually."}
    return {"books": found_books}

@app.get("/recommend_book")
async def recommend_book():
    response = requests.get("https://openlibrary.org/search.json?q=random")
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching random book from API.")
    books = response.json().get("docs", [])
    if not books:
        raise HTTPException(status_code=404, detail="No books available for recommendation.")
    book = random.choice(books)
    return {
        "id": book.get("key"),
        "title": book.get("title"),
        "author": book.get("author_name", ["Unknown"])[0],
        "cover_url": f"https://covers.openlibrary.org/b/id/{book.get('cover_i', '')}-L.jpg" if book.get("cover_i") else ""
    }


@app.post("/add_book")
async def add_book(book: Book):
    data = load_data()
    if any(b['id'] == book.id for b in data["books"]):
        raise HTTPException(status_code=400, detail="Book already exists.")
    book.id = str(uuid4())
    data["books"].append(book.dict())
    save_data(data)
    return {"message": "Book added successfully."}


@app.get("/profile/{username}")
async def get_profile(username: str):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.put("/update_profile_picture/{username}")
async def update_profile_picture(username: str, profile_data: UserPictureUpdate):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    user["profile_picture_url"] = profile_data.profile_picture_url
    save_data(data)
    return {"message": "Profile picture updated successfully."}


@app.put("/add_comment/{username}")
async def add_comment(username: str, comment_update: CommentUpdate):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    if not comment_update.comment:
        raise HTTPException(status_code=422, detail="Invalid comment data.")
    commenter = next((u for u in data["users"] if u["username"] == username), None)
    if commenter is None:
        raise HTTPException(status_code=404, detail="Commenter not found.")
    user["comments"].append({
        "commenter_id": commenter["id"],
        "commenter_username": commenter["username"],
        "commenter_profile_picture": commenter["profile_picture_url"],
        "comment": comment_update.comment
    })
    save_data(data)
    return {
        "message": "Comment added successfully.",
        "commenter_username": commenter["username"],
        "commenter_profile_picture": commenter["profile_picture_url"],
        "comment": comment_update.comment
    }



@app.get("/users")
async def get_users():
    data = load_data()
    return {"users": [{"id": user["id"], "username": user["username"]} for user in data["users"]]}


@app.put("/add_friend/{username}")
async def add_friend(username: str, friend_update: FriendUpdate):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    friend = next((u for u in data["users"] if u["username"] == friend_update.friend_username), None)
    if user is None or friend is None:
        raise HTTPException(status_code=404, detail="User or friend not found.")
    if any(f["id"] == friend["id"] for f in user["friends"]):
        raise HTTPException(status_code=400, detail="Friend already added.")
    user["friends"].append({
        "id": friend["id"],
        "username": friend["username"],
        "profile_picture_url": friend["profile_picture_url"] or "https://via.placeholder.com/150"
    })
    save_data(data)
    return {"message": "Friend added successfully."}


@app.get("/reading_status/{username}")
async def reading_status(username: str):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "completed_books": user["completed_books"],
        "to_read_books": user["to_read_books"],
        "currently_reading": user["currently_reading"]
    }


@app.put("/add_user_book/{username}")
async def add_user_book(username: str, book_id: str, status: str):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    book = next((b for b in data["books"] if b["id"] == book_id), None)
    if user is None or book is None:
        raise HTTPException(status_code=404, detail="User or book not found.")
    if status == "completed":
        user["completed_books"].append(book_id)
        book["completed_count"] += 1
    elif status == "to_read":
        user["to_read_books"].append(book_id)
        book["to_read_count"] += 1
    elif status == "reading":
        user["currently_reading"].append(book_id)
        book["reading_count"] += 1
    else:
        raise HTTPException(status_code=400, detail="Invalid status.")
    save_data(data)
    return {"message": "Book added to user's list successfully."}


@app.post("/update_weekly_stats/{username}")
async def update_weekly_stats(username: str):
    data = load_data()
    user = next((u for u in data["users"] if u["username"] == username), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    user["weekly_stats"].append(len(user["completed_books"]))
    if len(user["weekly_stats"]) > 4:
        user["weekly_stats"].pop(0)
    save_data(data)
    return {"message": "Weekly stats updated successfully."}
