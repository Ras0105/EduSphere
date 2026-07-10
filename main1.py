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
import random
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from database import users_collections
from datetime import datetime, timedelta
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
EMAIL_ADDRESS=os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD=os.getenv("EMAIL_APP_PASSWORD")


# ======================================================
# Temporary OTP Storage
# ======================================================
reset_otp={}


# ======================================================
# Send OTP Email
# ======================================================

def send_otp_email(
    receiver_email: str,
    otp: int
):
    subject = "EduSphere Password Reset OTP"
    body = f"""
        Hello,
        Your OTP for resetting your EduSphere account password is:
        {otp}
        This OTP is valid for 2 minutes.
        If you did not request a password reset, please ignore this email.
        Thank you,
        EduSphere Team
"""

    message = MIMEMultipart()
    message["From"] = EMAIL_ADDRESS
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(
        MIMEText(
            body,
            "plain"
        ) )
    with smtplib.SMTP(

        "smtp.gmail.com",
        587
    ) as server:
        server.starttls()
        server.login(
            EMAIL_ADDRESS,
            EMAIL_APP_PASSWORD
        )
        server.send_message(message)




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
    request.session.clear()
    return RedirectResponse(
        url="/login",
        status_code=303
    )


@app.get("/forgot-password")
def forgot_password_page(request: Request):
    message = request.session.pop("flash_message", "")
    return templates.TemplateResponse(
        request=request,
        name="forgot.html",
        context={"message": message}
    )   

@app.post("/forgot-password")
def forgot_password(
    request:Request,
    email: str = Form(...)                     
    ):
    existing_user = users_collections.find_one({"email": email})
    if existing_user:
        otp = random.randint(100000,999999)
        print(otp)
        created_time = datetime.now()

        reset_otp[email] = {
            "otp": str(otp),
            "created_at": created_time,
            "expiry_time": created_time + timedelta(minutes=1)
        }
        print(reset_otp)
        send_otp_email(email,otp)
        request.session["reset_email"]=email
        return RedirectResponse(
            url="/verify-otp",
            status_code=303
        )
        # return templates.TemplateResponse(
        #     request=request,
        #     name="change_password.html",
        #     context={
        #         "request": request,
        #         "email": email
        #     }
        # )  
    else:
        return {
            "success": False,
            "message": "Email not registered."
        } 


@app.get("/verify-otp")
def verify_otp_page(request: Request):
    email = request.session.get("reset_email")
    if not email:
        return RedirectResponse(url="/forgot-password", status_code=303)
    stored_otp = reset_otp.get(email)

    if stored_otp:

        return templates.TemplateResponse(
            request=request,
            name="verify_otp.html",
            context={
                "message":"",
                "expiry_time": stored_otp["expiry_time"].timestamp()
            }
        )

    return templates.TemplateResponse(
        request=request,
        name="verify_otp.html",
        context={
            "message":"",
            "expiry_time": 0
        }
    )

@app.post("/verify-otp")
def verify_otp(
    request:Request,
    otp:str=Form(...)):

    email=request.session.get("reset_email")

    # session expired
    if not email:
        return templates.TemplateResponse(
            request=request,
            name="verify_otp.html",
            context={
                "message":"Session Expired, Try Again",
                "expiry_time": 0
            }
        )
    stored_otp = reset_otp.get(email)

    if stored_otp is None:
        return templates.TemplateResponse(
            request=request,
            name="verify_otp.html",
            context={
                "message": "OTP expired. Please request a new OTP.",
                "expiry_time": 0
            }
        )

    current_time = datetime.now()

    expiry_time = stored_otp["expiry_time"]

    print("=" * 50)
    print("Current Time :", current_time)
    print("Created Time :", stored_otp["created_at"])
    print("Expiry Time  :", expiry_time)
    print("=" * 50)

    if current_time > expiry_time:
        reset_otp.pop(email, None)

        # OTP expired
        return templates.TemplateResponse(
            request=request,
            name="verify_otp.html",
            context={
                "message":"OTP expired. Please request a new OTP.",
                "expiry_time": 0.00
            }
        )

    if stored_otp["otp"] != otp:
        return templates.TemplateResponse(
            request=request,
            name="verify_otp.html",
            context={
                "message": "Invalid OTP",
                "expiry_time": stored_otp["expiry_time"].timestamp()
            }
        )

    del reset_otp[email]
    return templates.TemplateResponse(
        request=request,
        name="change_password.html",
    )

@app.post("/resend-otp")
def resend_otp(request: Request):

    email = request.session.get("reset_email")

    if not email:
        return RedirectResponse(
            url="/forgot-password",
            status_code=303
        )

    otp = random.randint(100000,999999)
    print(otp)
    created_time = datetime.now()

    reset_otp[email] = {
        "otp": str(otp),
        "created_at": created_time,
        "expiry_time": created_time + timedelta(minutes=1)
    }

    send_otp_email(email, otp)

    return templates.TemplateResponse(
        request=request,
        name="verify_otp.html",
        context={
            "message": "New OTP has been sent to your email.",
            "expiry_time": reset_otp[email]["expiry_time"].timestamp()
        }
    )



@app.post("/change-password")
def change_password(
    request:Request,
    new_password: str = Form(...),
    confirm_password: str = Form(...),
):
    email=request.session.get("reset_email")
    if not email:
        return RedirectResponse(
            url="/forgot-password",
            status_code=303
        )
    
    if new_password != confirm_password:
        return {
            "success": False,
            "message": "Password and Confirm Password do not match."
    }
    hashed_password = pwd_context.hash(new_password)

    users_collections.update_one({"email":email},{"$set":{"password":hashed_password}})

    # Cleanup
    reset_otp.pop(email, None)
    request.session.pop("reset_email", None)
    request.session.clear()
    return RedirectResponse(
        url="/login",
        status_code=303
    )
   

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
