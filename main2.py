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

from database import users_collection



# ======================================================
# Load Environment Variables
# ======================================================
# Purpose:
# Read values from the .env file and make them available
# inside the application.
# ======================================================

load_dotenv()


# ======================================================
# Read Environment Variables
# ======================================================
# Purpose:
# Store important configuration values in Python variables.
# ======================================================

SECRET_KEY = os.getenv("SECRET_KEY")

MONGODB_URI = os.getenv("MONGODB_URI")

DATABASE_NAME = os.getenv("DATABASE_NAME")

# ======================================================
# Email Configuration
# ======================================================

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")

EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")


# ======================================================
# Temporary OTP Storage
# ======================================================

reset_otp = {}

def send_otp_email(
    receiver_email: str,
    otp: int
):
    subject = "EduSphere Password Reset OTP"

    body = f"""

Hello,

Your OTP for resetting your EduSphere account password is:

{otp}

This OTP is valid for 10 minutes.

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
    # Read from the .env file.
    secret_key=SECRET_KEY,

    # Session cookie name.
    # This name will appear in the browser cookies.
    session_cookie="ums_session",

    # Prevent JavaScript from reading the cookie.
    # Helps protect against XSS attacks.
    https_only=False,

    # Prevent JavaScript access to the cookie.
    # Always keep this True.
    same_site="lax", #strict/lax/none

    # Browser cannot access the cookie using JavaScript.
    # This improves security.
    max_age=60 * 60 * 24,
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


@app.get("/login")
def login_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="login.html"
    )



@app.post("/login")
def login(

    request: Request,

    email: str = Form(...),

    password: str = Form(...)

):

    # ======================================================
    # Search User by Email
    # ======================================================

    user = users_collection.find_one(

        {

            "email": email

        }

    )

    # ======================================================
    # Email Not Found
    # ======================================================

    if not user:

        return {

            "success": False,

            "message": "Email is not registered."

        }

    # ======================================================
    # Verify Password
    # ======================================================

    password_matched = pwd_context.verify(

        password,

        user["password"]

    )

    # ======================================================
    # Invalid Password
    # ======================================================

    if not password_matched:

        return {

            "success": False,

            "message": "Incorrect password."

        }

    # ======================================================
    # Check User Role
    # ======================================================

    role = user["role"]


    # ======================================================
    # Create User Session
    # ======================================================
    # Purpose:
    # Remember the logged-in user.
    # Only store the minimum information needed.
    # ======================================================

    request.session["user_id"] = str(user["_id"])

    request.session["role"] = user["role"]

    # ======================================================
    # Redirect According to Role
    # ======================================================

    if role == "admin":

        return RedirectResponse(

            url="/admin-dashboard",

            status_code=303

        )

    else:

        return RedirectResponse(

            url="/student-dashboard",

            status_code=303

        )


# ======================================================
# Admin Dashboard
# ======================================================

# ======================================================
# Admin Dashboard
# ======================================================

@app.get("/admin-dashboard")
def admin_dashboard(request: Request):

    # ======================================================
    # Check Login Session
    # ======================================================
    # Purpose:
    # Allow access only if the user is logged in.
    # ======================================================

    if "user_id" not in request.session:

        return RedirectResponse(

            url="/login",

            status_code=303

        )

    # ======================================================
    # Check User Role
    # ======================================================
    # Purpose:
    # Only Admin can access Admin Dashboard.
    # ======================================================

    if request.session["role"] != "admin":

        return RedirectResponse(

            url="/student-dashboard",

            status_code=303

        )

    # ======================================================
    # Show Admin Dashboard
    # ======================================================

    return templates.TemplateResponse(

        request=request,

        name="admin_dashboard.html"

    )

# ======================================================
# Student Dashboard
# ======================================================

@app.get("/student-dashboard")
def student_dashboard(request: Request):

    # ======================================================
    # Check Login Session
    # ======================================================
    # Purpose:
    # Allow access only if the user is logged in.
    # ======================================================

    if "user_id" not in request.session:

        return RedirectResponse(

            url="/login",

            status_code=303

        )

    # ======================================================
    # Check User Role
    # ======================================================
    # Purpose:
    # Only Student can access Student Dashboard.
    # ======================================================

    if request.session["role"] != "student":

        return RedirectResponse(

            url="/admin-dashboard",

            status_code=303

        )

    # ======================================================
    # Show Student Dashboard
    # ======================================================

    return templates.TemplateResponse(

        request=request,

        name="student_dashboard.html"

    )



# ======================================================
# Register Page
# ======================================================

@app.get("/register")
def register_page(request: Request):

    return templates.TemplateResponse(
        request=request,
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

    existing_user = users_collection.find_one(

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

    users_collection.insert_one(

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


# ======================================================
# Logout User
# ======================================================

@app.get("/logout")
def logout(request: Request):

    # ======================================================
    # Clear User Session
    # ======================================================
    # Purpose:
    # Remove all session data.
    # After this, FastAPI no longer remembers
    # the logged-in user.
    # ======================================================

    request.session.clear()

    # ======================================================
    # Redirect to Login Page
    # ======================================================

    return RedirectResponse(

        url="/login",

        status_code=303

    )





# ======================================================
# Forgot Password Page
# ======================================================

@app.get("/forgot-password")
def forgot_password_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="forgot_password.html"
    )


# ======================================================
# Forgot Password
# ======================================================
@app.post("/forgot-password")
def forgot_password(
    request: Request,
    email: str = Form(...)

):

    # ==========================================
    # Check whether the email exists
    # ==========================================

    user = users_collection.find_one(

        {

            "email": email

        }

    )

    # ==========================================
    # Email not found
    # ==========================================

    if not user:

        return {

            "success": False,

            "message": "This email is not registered."

        }

    # ==========================================
    # Generate 6-Digit OTP
    # ==========================================

    otp = random.randint(

        100000,

        999999

    )

    # ==========================================
    # Store OTP
    # ==========================================

    reset_otp[email] = otp

    print(

        f"\nGenerated OTP : {otp}\n"

    )

    print(reset_otp)

    # ==========================================
    # Send OTP Email
    # ==========================================

    send_otp_email(email, otp)

    request.session["reset_email"] = email

    return RedirectResponse(

    url="/verify-otp",

    status_code=303

    )  





# ======================================================
# Verify OTP Page
# ======================================================

@app.get("/verify-otp")
def verify_otp_page(request: Request):

    return templates.TemplateResponse(

        request=request,

        name="verify_otp.html"

    )



# ======================================================
# Verify OTP
# ======================================================

@app.post("/verify-otp")
def verify_otp(

    request: Request,

    otp: str = Form(...)

):

    # ==========================================
    # Get Email from Session
    # ==========================================

    email = request.session.get(

        "reset_email"

    )

    # ==========================================
    # Check Session
    # ==========================================

    if not email:

        return {

            "success": False,

            "message": "Session expired. Please try again."

        }

    # ==========================================
    # Get Stored OTP
    # ==========================================

    stored_otp = reset_otp.get(

        email

    )

    # ==========================================
    # OTP Not Found
    # ==========================================

    if stored_otp is None:

        return {

            "success": False,

            "message": "OTP not found."

        }

    # ==========================================
    # Compare OTP
    # ==========================================

    if str(stored_otp) != otp:

        return {

            "success": False,

            "message": "Invalid OTP."

        }

    # ==========================================
    # OTP Verified
    # ==========================================

    return {

        "success": True,

        "message": "OTP verified successfully."

    }