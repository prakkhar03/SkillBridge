# from django.contrib import admin
# from .models import SkillVerification

# @admin.register(SkillVerification)
# class SkillVerificationAdmin(admin.ModelAdmin):
#     list_display = ['user', 'verification_status', 'score', 'created_at', 'updated_at']
#     list_filter = ['verification_status', 'created_at']
#     search_fields = ['user__email', 'user__profile__full_name']
#     readonly_fields = ['created_at', 'updated_at']
    
#     fieldsets = (
#         ('User Information', {
#             'fields': ('user', 'verification_status')
#         }),
#         ('Test Data', {
#             'fields': ('test_questions', 'test_answers', 'score')
#         }),
#         ('Analysis Results', {
#             'fields': ('resume_analysis', 'github_analysis', 'gemini_recommendation')
#         }),
#         ('Admin Notes', {
#             'fields': ('admin_notes',)
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at'),
#             'classes': ('collapse',)
#         })
#     )
    
#     def get_readonly_fields(self, request, obj=None):
#         readonly = list(self.readonly_fields)
#         if obj:  # Editing existing object
#             readonly.extend(['user', 'test_questions', 'test_answers', 'score', 
#                            'resume_analysis', 'github_analysis', 'gemini_recommendation'])
#         return readonly
