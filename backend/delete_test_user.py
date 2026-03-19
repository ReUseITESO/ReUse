from core.models.email_verification import EmailVerificationToken
from core.models.user import User

email = "omar.ponce@iteso.mx"  # <-- CAMBIA ESTE CORREO

u = User.objects.filter(email=email).first()

if not u:
    print(f"[OK] No existe el usuario con email: {email} (ya estaba borrado).")
else:
    tokens_before = EmailVerificationToken.objects.filter(user=u).count()
    print(f"[INFO] Usuario encontrado: id={u.id}, email={u.email}")
    print(f"[INFO] Tokens antes: {tokens_before}")

    EmailVerificationToken.objects.filter(user=u).delete()
    u.delete()

    user_exists = User.objects.filter(email=email).exists()
    tokens_after = EmailVerificationToken.objects.filter(user__email=email).count()

    print(f"[OK] Usuario eliminado: {not user_exists}")
    print(f"[OK] Tokens restantes para ese email: {tokens_after}")
