# University Management System

A simple **University Management System** built using **FastAPI**, **MongoDB**, **HTML**, **CSS**, and **Jinja2**. This project allows an admin to manage student records and provides separate login pages for Admin and Student.

## Features

* Admin Login
* Student Login
* Add Student
* View All Students
* Update Student Password
* Delete Selected Students
* Delete All Students
* MongoDB Database Integration
* Simple HTML & CSS Interface

## Technologies Used

* Python
* FastAPI
* MongoDB
* PyMongo
* Jinja2 Templates
* HTML
* CSS
* Uvicorn

## Project Structure

```
FastAPI-Project/
│── static/
│   └── style.css
│
│── templates/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── read.html
│   └── delete.html
│
│── main.py
│── database.py
│── requirements.txt
│── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ras0105/FastAPI-Project.git
cd FastAPI-Project
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure MongoDB

Make sure MongoDB is running or update your MongoDB connection string in `database.py`.

### 6. Run the application

```bash
uvicorn main:app --reload
```

### 7. Open in your browser

```
http://127.0.0.1:8000
```

## Future Improvements

* Password hashing
* Session-based authentication
* Role-based access control
* Search and filter students
* Responsive UI
* Edit student details

## Author

**Rasshi Ashish Srivastav**

GitHub: https://github.com/Ras0105
