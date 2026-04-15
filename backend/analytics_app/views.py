from django.http import JsonResponse
from django.db.models import Count, Q

from .models import Course, Enrollment, Attendance, Assignment, Submission


def dashboard_analytics(request):
    course_id = request.GET.get("course_id")

    if not course_id:
        return JsonResponse({"error": "course_id is required"}, status=400)

    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return JsonResponse({"error": "Course not found"}, status=404)

    # Total students
    total_students = Enrollment.objects.filter(course_id=course_id).count()

    # Attendance calculations
    attendance_qs = Attendance.objects.filter(course_id=course_id)

    total_records = attendance_qs.count()
    present_count = attendance_qs.filter(status="Present").count()

    avg_attendance = (
        (present_count / total_records) * 100 if total_records > 0 else 0
    )

    # Assignments
    assignments_qs = Assignment.objects.filter(course_id=course_id)
    total_assignments = assignments_qs.count()

    # Submissions
    assignment_ids = assignments_qs.values_list("id", flat=True)

    submissions_count = Submission.objects.filter(
        assignment_id__in=assignment_ids
    ).count()

    return JsonResponse({
        "course_id": int(course_id),
        "course_title": course.title,
        "total_students": total_students,
        "avg_attendance": round(avg_attendance, 2),
        "total_assignments": total_assignments,
        "submissions_count": submissions_count
    })