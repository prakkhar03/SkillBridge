from django.urls import path
from .views import (
    FreelanceProjectCreateView, FreelanceProjectUpdateView, FreelanceProjectDetailView,
    FreelanceProjectListView, FreelanceProjectDeleteView, FreelanceProjectApplyView,ApplicantDetails,
    OpenProjectView, CloseProjectView,AcceptApplicantView,RejectApplicantView,ListAppliedProjectsView
)

urlpatterns = [
    path("", FreelanceProjectListView.as_view(), name="project-list"),
    path("create/", FreelanceProjectCreateView.as_view(), name="project-create"),
    path("<uuid:project_id>/", FreelanceProjectDetailView.as_view(), name="project-detail"),
    path("<uuid:project_id>/update/", FreelanceProjectUpdateView.as_view(), name="project-update"),
    path("<uuid:project_id>/delete/", FreelanceProjectDeleteView.as_view(), name="project-delete"),
    path("<uuid:project_id>/apply/", FreelanceProjectApplyView.as_view(), name="project-apply"),
    path("<uuid:project_id>/applicants/", ApplicantDetails.as_view(), name="project-apply"),
    path("<uuid:project_id>/accept/<int:applicant_id>/", AcceptApplicantView.as_view(), name="accept-applicant"),
    path("<uuid:project_id>/reject/<int:applicant_id>/", RejectApplicantView.as_view(), name="reject-applicant"),
    path("open/", OpenProjectView.as_view(), name="open-projects"),
    path("closed/", CloseProjectView.as_view(), name="closed-projects"),
    path("applied/", ListAppliedProjectsView.as_view(), name="applied-projects"),
    
]
