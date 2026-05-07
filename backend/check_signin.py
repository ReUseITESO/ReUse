import requests

users = [
    {'email': 'test@iteso.mx', 'password': 'test1234'},
    {'email': 'rodrigo@iteso.mx', 'password': 'rodrigo1234'},
    {'email': 'carlos@iteso.mx', 'password': 'carlos1234'},
    {'email': 'maria@iteso.mx', 'password': 'maria1234'},
    {'email': 'jose.chavez@iteso.mx', 'password': 'ReUse2026!'},
    {'email': 'ana.martinez@iteso.mx', 'password': 'test'},
    {'email': 'lucia.fernandez@iteso.mx', 'password': 'test'},
]

for u in users:
    r = requests.post('http://localhost:8000/api/auth/signin/', json=u)
    print(u['email'], r.status_code, r.text)
