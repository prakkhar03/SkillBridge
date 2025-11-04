from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging
from accounts.models import ClientCompany,Profile
from .models import FreelanceProject
from .serializer import FreelanceProjectSerializer

logger = logging.getLogger(__name__)


class FreelanceProjectCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if request.user.role != "client":
                return Response({'error': 'Only clients can post projects.'}, status=status.HTTP_403_FORBIDDEN)

            # Ensure client company exists
            try:
                client_company = request.user.client_company
            except ClientCompany.DoesNotExist:
                return Response({'error': 'Client company profile not found.'}, status=status.HTTP_404_NOT_FOUND)

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
            projects = FreelanceProject.objects.filter(is_open=True).order_by('-created_at')
            serializer = FreelanceProjectSerializer(projects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Unexpected error in FreelanceProjectListView: {str(e)}")
            return Response({'error': 'Unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            applicant_data = [{'id': applicant.id, 'email': applicant.email} for applicant in applicants]
            return Response(applicant_data, status=status.HTTP_200_OK)

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
