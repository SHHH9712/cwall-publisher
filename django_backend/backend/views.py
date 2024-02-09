from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image as PILImage, UnidentifiedImageError, ImageOps
from .models import Image
from django.conf import settings
import os
from googleapiclient.http import MediaFileUpload


class TestConnectionView(APIView):
    def get(self, request):
        data = {'message': 'Connection to Django backend successful!'}
        return Response(data, status=status.HTTP_200_OK)

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        files = request.FILES.getlist('images')
        processed_images = []

        for f in files:
            try:
                img = PILImage.open(f)
                # Square Conversion with Padding
                img = ImageOps.pad(img, (max(img.size), max(img.size)), color='black')

                # Image Processing - Adjust for Your Use Case
                if img.format != 'JPEG':  
                    img = img.convert('RGB')
                    output_name = f.name.split('.')[0] + '.jpg' 
                    img.save(os.path.join(settings.MEDIA_ROOT, 'uploads',output_name), quality=95)
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
                
        # ... Google Drive connection and authorization logic ...
        drive_service = ... # (Code to create Drive service)

        for processed_image in processed_images:
            file_metadata = {
                'name': processed_image['name'], 
                # 'parents': ['folder_id'] - If you want specific folder uploads 
            }
            media = MediaFileUpload(os.path.join(settings.MEDIA_ROOT, processed_image['name'])) 
            file = drive_service.files().create(body=file_metadata,
                                                media_body=media,
                                                fields='id, webContentLink').execute() 

            # Update 'Image' object in database to store additional Drive info
            image_instance = Image.objects.get(id=processed_image['id'])
            image_instance.google_drive_id = file.get('id')
            image_instance.google_drive_link = file.get('webContentLink')
            image_instance.save() 

        return Response("Images Processed", status=status.HTTP_200_OK)
