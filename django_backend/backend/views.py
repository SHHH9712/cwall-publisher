from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image as PILImage, UnidentifiedImageError, ImageOps
from .models import Image
from django.conf import settings
import os
from googleapiclient.http import MediaFileUpload
from django.contrib.auth import get_user_model
from .models import GoogleToken
from django.core.exceptions import ObjectDoesNotExist
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

User = get_user_model()
class TestConnectionView(APIView):
    def get(self, request):
        data = {'message': 'Connection to Django backend successful!'}
        return Response(data, status=status.HTTP_200_OK)

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        files = request.FILES.getlist('images')
        processed_images = []
        print(request.user)
        try:
            user = request.email
            google_token = GoogleToken.objects.get(user=user)  # Adjust based on your token storage logic
        except ObjectDoesNotExist:
            return Response("Google token not found.", status=status.HTTP_404_NOT_FOUND)

        credentials = Credentials(
            token=google_token.access_token,
            refresh_token=google_token.refresh_token,
            client_id='YOUR_CLIENT_ID',  # Replace with actual client ID
            client_secret='YOUR_CLIENT_SECRET',  # Replace with actual client secret
            token_uri='https://oauth2.googleapis.com/token',
        )
        drive_service = build('drive', 'v3', credentials=credentials)
        folder_id = self.get_or_create_drive_folder(drive_service, "cwall_uploads_directory")
        
        for f in files:
            try:
                img = PILImage.open(f)
                # Square Conversion with Padding
                img = ImageOps.pad(img, (max(img.size), max(img.size)), color='black')

                # Image Processing - Adjust for Your Use Case
                if img.format != 'JPEG':  
                    img = img.convert('RGB')
                    output_name = f.name.split('.')[0] + '.jpg' 
                    img.save(os.path.join(settings.MEDIA_ROOT, 'uploads', output_name), quality=95)
                else:  # No conversion if already JPEG
                    output_name = f.name

                # Saving details into Database
                image_instance = Image.objects.create(image_file=output_name) 
                processed_images.append({
                    'name': output_name, 
                    'original_format': img.format,
                    'id': image_instance.id 
                })

            except UnidentifiedImageError:
                print(f"{f.name} is not a valid image file.")
                
        for processed_image in processed_images:
            file_metadata = {
                'name': processed_image['name'], 
                'parents': ['cwall_publisher_uploads'] # - If you want specific folder uploads 
            }
            media = MediaFileUpload(os.path.join(settings.MEDIA_ROOT, 'uploads', processed_image['name'])) 
            file = drive_service.files().create(body=file_metadata,
                                                media_body=media,
                                                fields='id, webContentLink').execute() 

            # Update 'Image' object in database to store additional Drive info
            image_instance = Image.objects.get(id=processed_image['id'])
            image_instance.google_drive_id = file.get('id')
            image_instance.google_drive_link = file.get('webContentLink')
            image_instance.save()

        return Response("Images Processed", status=status.HTTP_200_OK)

class StoreTokenView(APIView):
    def post(self, request, format=None):
        email = request.data.get('email')
        access_token = request.data.get('access_token')
        refresh_token = request.data.get('refresh_token')
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': email}  # or any other defaults you'd like to set
        )

        GoogleToken.objects.update_or_create(
            user=user,
            defaults={
                'access_token': access_token,
                'refresh_token': refresh_token,
            }
        )
        
        if created:
            message = 'User and token stored successfully'
        else:
            message = 'Token updated successfully'

        return Response({'message': message}, status=status.HTTP_200_OK)

