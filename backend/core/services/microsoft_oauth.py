import json
import urllib.error
import urllib.parse
import urllib.request

import jwt
from django.conf import settings

MICROSOFT_AUTHORITY = "https://login.microsoftonline.com"
MICROSOFT_SCOPES = "openid email profile"


def get_authorization_url(state: str) -> str:
    tenant_id = getattr(settings, "MICROSOFT_TENANT_ID", "common")
    params = urllib.parse.urlencode(
        {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
            "scope": MICROSOFT_SCOPES,
            "state": state,
            "response_mode": "query",
        }
    )
    return f"{MICROSOFT_AUTHORITY}/{tenant_id}/oauth2/v2.0/authorize?{params}"


def exchange_code(code: str) -> dict:
    tenant_id = getattr(settings, "MICROSOFT_TENANT_ID", "common")
    token_url = f"{MICROSOFT_AUTHORITY}/{tenant_id}/oauth2/v2.0/token"

    payload = urllib.parse.urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "scope": MICROSOFT_SCOPES,
        }
    ).encode("utf-8")

    req = urllib.request.Request(token_url, data=payload, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req) as response:
            token_data = json.loads(response.read())
    except urllib.error.HTTPError as exc:
        error_body = json.loads(exc.read().decode("utf-8"))
        raise ValueError(error_body.get("error_description", "Microsoft token exchange failed")) from exc

    if "error" in token_data:
        raise ValueError(token_data.get("error_description", "Microsoft authentication failed"))

    id_token = token_data.get("id_token", "")
    if not id_token:
        raise ValueError("No id_token received from Microsoft")

    claims = jwt.decode(id_token, options={"verify_signature": False})

    email = (claims.get("email") or claims.get("preferred_username") or "").lower().strip()
    first_name = claims.get("given_name", "")
    last_name = claims.get("family_name", "")

    return {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
    }
