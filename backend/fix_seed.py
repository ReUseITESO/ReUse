import json

with open('seeds/seed_v1.json', encoding='utf-8') as f:
    data = json.load(f)

for obj in data:
    fields = obj['fields']
    
    # 1. Arreglar los campos de core.user
    if obj['model'] == 'core.user':
        if 'created_at' in fields:
            fields['date_joined'] = fields.pop('created_at')
        fields['username'] = fields['email'].split('@')[0]
        fields['password'] = 'pbkdf2_sha256$600000$test$test='
        fields['is_active'] = True
        fields['is_staff'] = False
        fields['is_superuser'] = False
        
    # 2. Arreglar todos los Foreign Keys (quitando el sufijo '_id')
    keys_to_change = [k for k in fields.keys() if k.endswith('_id')]
    for k in keys_to_change:
        new_key = k.replace('_id', '')
        # Ajuste específico: Django suele usar nombres en singular para relaciones
        if new_key == 'products':
            new_key = 'product'
        fields[new_key] = fields.pop(k)

with open('seeds/seed_v1_fixed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("¡Archivo JSON formateado y corregido con éxito!")