from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os
import uuid
import shutil

from database import users_collections

# ======================================================
# Load Environment Variables
# ======================================================
# Purpose:
# Read values from .env file and make them available inside the application
# ======================================================
load_dotenv()

# ======================================================
# Read Environment Variables
# ======================================================
# Purpose:
# Sture important configurations in python variables
# ======================================================
SECRET_KEY=os.getenv("SECRET_KEY")
MONGODB_URI=os.getenv("MONGODB_URI")
DATABASE_NAME=os.getenv("DATABASE_NAME")


# ======================================================
# FastAPI Application
# ======================================================
app = FastAPI()


# ======================================================
# Session Middleware
# ======================================================
# Purpose:
# Enable secure session management for the application.
# It remembers the logged-in user by using a signed cookie.
# ======================================================
app.add_middleware(

SessionMiddleware,

# Secret key used to sign the session cookie.

#Read from the .env file.

secret_key=SECRET_KEY,

# Session cookie name.

# This name will appear in the browser cookies.

session_cookie="ums_session",

# Prevent JavaScript from reading the cookie.

# Helps protect against XSS attacks.

https_only=False,

# Prevent JavaScript access to the cookie.

# Always keep this True.

same_site="lax",

# Browser cannot access the cookie using JavaSc

# This improves security.

max_age=60 * 60 * 24, # 86400seconds
)



# ======================================================
# Static Files
# ======================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# ======================================================
# Upload Folder
# ======================================================

UPLOAD_FOLDER = os.path.join(
    "static",
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ======================================================
# Jinja2 Templates
# ======================================================

templates = Jinja2Templates(
    directory="templates"
)


# ======================================================
# Password Hashing (bcrypt)
# ======================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ======================================================
# Home Page
# ======================================================

@app.get("/")
def home(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


# ======================================================
# Login Page
# ======================================================

@app.get("/login")
def login_page(req: Request):

    return templates.TemplateResponse(
        request=req,
        name="login.html"
    )

@app.post("/login")
def login(
    request:Request,
    email:str =Form(...),
    password:str =Form(...)
    ):
    # ======================================================
    # Finding the user
    # ======================================================
    user=users_collections.find_one({"email":email})

    # ======================================================
    # User not found
    # ======================================================
    if not user:
        return{"success":False,"message":"Email is not regestered."}
    # ======================================================
    # Checking password
    # ======================================================    
    password_matchd=pwd_context.verify(password,user["password"])

    # ======================================================
    # Incorrect password
    # ======================================================   
    if not password_matchd:
        return{"success":False,"message":"Incorrect password"}
    
    # ======================================================
    # Check Role
    # ======================================================   
    role=user["role"]
    request.session["user_id"]=str(user["_id"])
    request.session["role"]=user["role"]
    if role=="admin":
        return RedirectResponse(url="/admin-dashboard",status_code=303)
    else:
        return RedirectResponse(url="/student-dashboard",status_code=303)
    

# ======================================================
# Admin Dashboard
# ======================================================
@app.get("/admin-dashboard")
def admin_dashboard(req:Request):
    if "user_id" not in req.session:
        return RedirectResponse(url="/login",status_code=303)
    if req.session["role"]!="admin":
        return RedirectResponse(url="/student-dashboard",status_code=303)
    return templates.TemplateResponse(request=req,name="admin_dashboard.html")


# ======================================================
# Student Dashboard
# ======================================================
@app.get("/student-dashboard")
def student_dashboard(req:Request):
    if "user_id" not in req.session:
        return RedirectResponse(url="/login",status_code=303)
    if req.session["role"]!="student":
        return RedirectResponse(url="/admin-dashboard",status_code=303)
    return templates.TemplateResponse(request=req,name="student_dashboard.html")

# ======================================================
# Register Page
# ======================================================

@app.get("/register")
def register_page(req: Request):

    return templates.TemplateResponse(
        request=req,
        name="register.html"
    )

# ======================================================
# Register User
# ======================================================

@app.post("/register")
def register(

    role: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    mobile: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    department: str = Form(...),
    profile_image: UploadFile = File(...),
    terms: str = Form(...)

):

    # ======================================================
    # Check Password Match
    # ======================================================
    # Purpose:
    # Make sure Password and Confirm Password are same.
    # ======================================================

    if password != confirm_password:

        return {

            "success": False,

            "message": "Password and Confirm Password do not match."

        }

    # ======================================================
    # Check Duplicate Email
    # ======================================================
    # Purpose:
    # Prevent users from registering with the same email.
    # ======================================================

    existing_user = users_collections.find_one(

        {

            "email": email

        }

    )

    if existing_user:

        return {

            "success": False,

            "message": "Email is already registered."

        }

    # ======================================================
    # Check Profile Image
    # ======================================================
    # Purpose:
    # Make sure user selected a profile image.
    # ======================================================

    if not profile_image.filename:

        return {

            "success": False,

            "message": "Please select a profile image."

        }

    # ======================================================
    # Generate Unique Image Name (UUID)
    # ======================================================
    # Purpose:
    # Create a unique filename so that no two users
    # can overwrite each other's images.
    # ======================================================

    file_extension = os.path.splitext(

        profile_image.filename

    )[1]

    unique_filename = (

        f"{uuid.uuid4().hex}"

        f"{file_extension}"

    )

    image_path = os.path.join(

        UPLOAD_FOLDER,

        unique_filename

    )

    # ======================================================
    # Save Uploaded Image
    # ======================================================
    # Purpose:
    # Save the uploaded image into static/uploads folder.
    # ======================================================

    with open(

        image_path,

        "wb"

    ) as buffer:

        shutil.copyfileobj(

            profile_image.file,

            buffer

        )

    # ======================================================
    # Hash Password
    # ======================================================
    # Purpose:
    # Convert plain password into encrypted bcrypt hash.
    # Never store the original password.
    # ======================================================

    hashed_password = pwd_context.hash(

        password

    )

    # ======================================================
    # Create User Document
    # ======================================================
    # Purpose:
    # Prepare the data that will be stored in MongoDB.
    # ======================================================

    user = {

        "role": role,

        "full_name": full_name,

        "email": email,

        "mobile": mobile,

        "password": hashed_password,

        "department": department,

        "profile_image": unique_filename

    }

    # ======================================================
    # Save User in MongoDB
    # ======================================================
    # Purpose:
    # Insert the user document into users collection.
    # ======================================================

    users_collections.insert_one(

        user

    )

    # ======================================================
    # Redirect to Login Page
    # ======================================================
    # Purpose:
    # After successful registration,
    # redirect user to Login page.
    # ======================================================

    return RedirectResponse(

        url="/login",

        status_code=303

    )

@app.get("/logout")
def logout(request:Request):
    pass














# # ======================================================
# # Admin Dashboard
# # ======================================================
# @app.get("/admin-dashboard")
# def admin_dashboard(req:Request):
#     if "user_id" not in req.session:
#         return RedirectResponse(url="/login",status_code=303)
#     if req.session["role"]!="admin":
#         return RedirectResponse(url="/student-dashboard",status_code=303)
#     user = users_collections.find_one(
#         {
#             "_id": ObjectId(req.session["user_id"])
#         }
#     )
#     return templates.TemplateResponse(request=req,name="admin_dashboard.html",context={"user":user})

# # ======================================================
# # Student Dashboard
# # ======================================================
# @app.get("/student-dashboard")
# def student_dashboard(req:Request):
#     if "user_id" not in req.session:
#         return RedirectResponse(url="/login",status_code=303)
#     if req.session["role"]!="student":
#         return RedirectResponse(url="/admin-dashboard",status_code=303)
#     user = users_collections.find_one(
#         {
#             "_id": ObjectId(req.session["user_id"])
#         }
#     )
#     return templates.TemplateResponse(request=req,name="student_dashboard.html",context={"user":user})
