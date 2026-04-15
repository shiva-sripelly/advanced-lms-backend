from django.urls import path
from .views import dashboard_analytics

urlpatterns = [
    path("dashboard/", dashboard_analytics),
]