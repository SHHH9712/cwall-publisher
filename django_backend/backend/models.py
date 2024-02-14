from django.db import models
from django.contrib.auth.models import User
class Image(models.Model):
    # ...other image-related fields ... 
    image_file = models.ImageField(upload_to='uploads/')

class GoogleToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_token = models.TextField() 
    refresh_token = models.TextField()  
    expires_at = models.DateTimeField(null=True) 
    token_type = models.CharField(max_length=50) 