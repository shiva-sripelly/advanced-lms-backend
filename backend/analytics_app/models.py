from django.db import models


class User(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20)

    class Meta:
        db_table = "users"


class Course(models.Model):
    title = models.CharField(max_length=200)

    class Meta:
        db_table = "courses"


class Enrollment(models.Model):
    student_id = models.IntegerField()
    course_id = models.IntegerField()

    class Meta:
        db_table = "enrollments"


class Attendance(models.Model):
    student_id = models.IntegerField()
    course_id = models.IntegerField()
    date = models.DateField()
    status = models.CharField(max_length=20)

    class Meta:
        db_table = "attendance"


class Assignment(models.Model):
    course_id = models.IntegerField()
    title = models.CharField(max_length=255)

    class Meta:
        db_table = "assignments"


class Submission(models.Model):
    assignment_id = models.IntegerField()
    student_id = models.IntegerField()

    class Meta:
        db_table = "submissions"