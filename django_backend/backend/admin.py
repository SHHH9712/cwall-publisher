from django.contrib import admin
from .models import GoogleToken

@admin.register(GoogleToken)
class GoogleTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'access_token', 'refresh_token', 'expires_at')  # Adjust fields as necessary
    search_fields = ['user__email']