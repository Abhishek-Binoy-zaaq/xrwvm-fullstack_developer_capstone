import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
django.setup()

from django.contrib.auth.models import User

def reset_password():
    username = 'root'
    password = 'root'
    
    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"Password for user '{username}' has been successfully reset to '{password}'.")
    except User.DoesNotExist:
        print(f"User '{username}' does not exist. Creating it now.")
        User.objects.create_superuser(username=username, email='root@example.com', password=password)
        print(f"Superuser '{username}' created with password '{password}'.")

if __name__ == '__main__':
    reset_password()
