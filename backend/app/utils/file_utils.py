import os
import uuid
from fastapi import UploadFile

BASE_UPLOAD_DIR = r"C:\Users\ASDMIN\LMS_PROJECT\uploads"


def save_uploaded_file(file: UploadFile, folder_name: str) -> str:
    folder_path = os.path.join(BASE_UPLOAD_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(folder_path, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return file_path