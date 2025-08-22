from django.urls import path
from .views import (
    FreelanceProjectCreateView, FreelanceProjectUpdateView, FreelanceProjectDetailView,
    FreelanceProjectListView, FreelanceProjectDeleteView, FreelanceProjectApplyView,ApplicantDetails
)

urlpatterns = [
    path("", FreelanceProjectListView.as_view(), name="project-list"),
    path("create/", FreelanceProjectCreateView.as_view(), name="project-create"),
    path("<uuid:project_id>/", FreelanceProjectDetailView.as_view(), name="project-detail"),
    path("<uuid:project_id>/update/", FreelanceProjectUpdateView.as_view(), name="project-update"),
    path("<uuid:project_id>/delete/", FreelanceProjectDeleteView.as_view(), name="project-delete"),
    path("<uuid:project_id>/apply/", FreelanceProjectApplyView.as_view(), name="project-apply"),
    path("<uuid:project_id>/applicants/", ApplicantDetails.as_view(), name="project-apply"),
]
