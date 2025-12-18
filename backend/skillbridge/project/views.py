from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging
from accounts.models import ClientCompany,Profile
from .models import FreelanceProject
from .serializer import FreelanceProjectSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import FreelanceProject
from .serializer import FreelanceProjectSerializer
import logging

logger = logging.getLogger(__name__)
logger = logging.getLogger(__name__)


class FreelanceProjectCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if request.user.role != "client":
                return Response({'error': 'Only clients can post projects.'}, status=status.HTTP_403_FORBIDDEN)

            # Ensure client company exists (Auto-create a basic one if missing for ease of use)
            client_company, _ = ClientCompany.objects.get_or_create(
                user=request.user,
                defaults={'company_name': f"{request.user.email.split('@')[0]}'s Company"}
            )

            serializer = FreelanceProjectSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                project = serializer.save(created_by=request.user, client_company=client_company)
                return Response({
                    'message': 'Project created successfully',
                    'project': FreelanceProjectSerializer(project).data
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception(f"Unexpected error in FreelanceProjectCreateView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FreelanceProjectUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            serializer = FreelanceProjectSerializer(project, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                updated_project = serializer.save()
                return Response({
                    'message': 'Project updated successfully',
                    'project': FreelanceProjectSerializer(updated_project).data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Unexpected error in FreelanceProjectUpdateView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FreelanceProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            serializer = FreelanceProjectSerializer(project)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)



class FreelanceProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Clients should see THEIR projects (Active or Closed)
            if request.user.role == "client":
                projects = FreelanceProject.objects.filter(created_by=request.user).order_by('-created_at')
                serializer = FreelanceProjectSerializer(projects, many=True)
                return Response(serializer.data, status=200)

            # Admins or others
            if request.user.role != "freelancer":
                projects = FreelanceProject.objects.filter(is_open=True).order_by('-created_at')
                serializer = FreelanceProjectSerializer(projects, many=True)
                return Response(serializer.data, status=200)

            profile = request.user.profile

            # Combine freelancer profile text
            profile_text = " ".join([
                profile.skills or "",
                profile.experience_level or "",
                profile.bio or "",
                profile.portfolio_links or ""
            ])

            # Fetch open projects
            projects = FreelanceProject.objects.filter(is_open=True)

            # Build project text list
            project_texts = []
            for proj in projects:
                text = " ".join([
                    proj.title or "",
                    proj.description or "",
                    getattr(proj, "required_skills", "") or ""
                ])
                project_texts.append(text)

            # Apply TF-IDF
            vectorizer = TfidfVectorizer()
            vectors = vectorizer.fit_transform([profile_text] + project_texts)

            # Compute cosine similarity
            similarity_scores = cosine_similarity(vectors[0:1], vectors[1:]).flatten()

            # Sort projects by similarity
            ranked_projects = [
                proj for _, proj in sorted(
                    zip(similarity_scores, projects),
                    key=lambda x: x[0],
                    reverse=True
                )
            ]

            serializer = FreelanceProjectSerializer(ranked_projects, many=True)
            return Response(serializer.data, status=200)

        except Exception as e:
            logger.exception(f"Error ranking projects: {str(e)}")
            return Response(
                {"error": "Unexpected error occurred", "details": str(e)},
                status=500
            )


class FreelanceProjectDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            project.delete()
            return Response({'message': 'Project deleted successfully.'}, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)


class FreelanceProjectApplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)

            if request.user.role != "freelancer":
                return Response({'error': 'Only freelancers can apply.'}, status=status.HTTP_403_FORBIDDEN)

            if not project.is_open:
                return Response({'error': 'This project is closed.'}, status=status.HTTP_400_BAD_REQUEST)

            if request.user in project.applicants.all():
                return Response({'message': 'You already applied.'}, status=status.HTTP_400_BAD_REQUEST)

            project.applicants.add(request.user)
            return Response({'message': 'Applied successfully.'}, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
class ApplicantDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if request.user.role != "client" or project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            applicants = project.applicants.all()
            from .serializer import DetailedApplicantSerializer
            serializer = DetailedApplicantSerializer(applicants, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Unexpected error in ApplicantDetails: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AcceptApplicantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id, applicant_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if request.user.role != "client" or project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            try:
                applicant = Profile.objects.get(id=applicant_id, role="freelancer")
            except Profile.DoesNotExist:
                return Response({'error': 'Applicant not found or not a freelancer.'}, status=status.HTTP_404_NOT_FOUND)

            if applicant not in project.applicants.all():
                return Response({'error': 'This user did not apply for the project.'}, status=status.HTTP_400_BAD_REQUEST)

            project.accepted_freelancer = applicant
            project.is_open = False  
            project.save()

            return Response({'message': 'Applicant accepted successfully.'}, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Unexpected error in AcceptApplicantView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CloseProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if request.user.role != "client" or project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            project.is_open = False
            project.save()
            return Response({'message': 'Project closed successfully.'}, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Unexpected error in CloseProjectView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class OpenProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if request.user.role != "client" or project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            if project.accepted_freelancer is not None:
                return Response({'error': 'Cannot reopen a project with an accepted freelancer.'}, status=status.HTTP_400_BAD_REQUEST)

            project.is_open = True
            project.save()
            return Response({'message': 'Project reopened successfully.'}, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Unexpected error in OpenProjectView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class RejectApplicantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id, applicant_id):
        try:
            project = FreelanceProject.objects.get(id=project_id)
            if request.user.role != "client" or project.created_by != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            try:
                applicant = Profile.objects.get(id=applicant_id, role="freelancer")
            except Profile.DoesNotExist:
                return Response({'error': 'Applicant not found or not a freelancer.'}, status=status.HTTP_404_NOT_FOUND)

            if applicant not in project.applicants.all():
                return Response({'error': 'This user did not apply for the project.'}, status=status.HTTP_400_BAD_REQUEST)

            project.applicants.remove(applicant)
            return Response({'message': 'Applicant rejected successfully.'}, status=status.HTTP_200_OK)

        except FreelanceProject.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception(f"Unexpected error in RejectApplicantView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListAppliedProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "freelancer":
            return Response(
                {"error": "Only freelancers can view applied projects."},
                status=status.HTTP_403_FORBIDDEN
            )

        projects = FreelanceProject.objects.filter(
            applicants=request.user
        ).select_related("client_company", "created_by")

        serializer = FreelanceProjectSerializer(projects, many=True)

        return Response({
            "count": projects.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)
