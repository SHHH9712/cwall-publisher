from django.db import models

# Create your models here.
class Image(models.Model):
    # ...other image-related fields ... 
    image_file = models.ImageField(upload_to='uploads/')