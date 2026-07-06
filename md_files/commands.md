python.exe -m pip install --upgrade pip

python -m venv envi
envi/Scripts/activate

python -m pip install fastapi uvicorn pymongo jinja2 python-multipart

python -m pip install bcrypt==4.0.1

pip install passlib

pip install python-dotenv

pip install itsdangerous

pip list

uvicorn main:app --reload

pip freeze > requirements.txt