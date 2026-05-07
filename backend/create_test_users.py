from core.models import User
from django.contrib.auth.hashers import make_password

# Update/create remaining test users
users_to_fix = [
    {'email': 'ana.martinez@iteso.mx', 'password': 'test', 'first_name': 'Ana', 'last_name': 'Martinez', 'points': 320},
    {'email': 'lucia.fernandez@iteso.mx', 'password': 'test', 'first_name': 'Lucia', 'last_name': 'Fernandez', 'points': 210},
]

for user_data in users_to_fix:
    user, created = User.objects.get_or_create(
        email=user_data['email'],
        defaults={
            'password': make_password(user_data['password']),
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'points': user_data['points'],
            'is_email_verified': True
        }
    )
    if not created:
        # Update existing user
        user.password = make_password(user_data['password'])
        user.points = user_data['points']
        user.is_email_verified = True
        user.save()
        print(f'Updated user: {user_data["email"]}')
    else:
        print(f'Created user: {user_data["email"]}')

print('Test users update completed')