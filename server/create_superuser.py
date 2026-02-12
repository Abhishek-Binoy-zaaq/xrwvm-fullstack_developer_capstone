import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
django.setup()

from django.contrib.auth.models import User

def create_superuser():
    username = 'root'
    password = 'root'
    email = 'root@example.com'

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser: {username}")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created successfully.")
    else:
        print(f"Superuser {username} already exists.")

if __name__ == '__main__':
    create_superuser()
