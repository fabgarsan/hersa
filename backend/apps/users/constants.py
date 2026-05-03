HERSA_APP_LABELS: frozenset[str] = frozenset({"users", "modules"})

MESSAGES: dict[str, dict[str, str]] = {
    "success": {
        "PASSWORD_CHANGED": "Contraseña cambiada exitosamente.",
        "PASSWORD_RESET": "Contraseña restablecida exitosamente.",
        "PASSWORD_RESET_EMAIL_SENT": "Si existe una cuenta con esa información, se ha enviado un enlace para restablecer la contraseña.",
    },
    "forbidden": {
        "INACTIVE_ACCOUNT": "La cuenta está inactiva.",
    },
    "validation": {
        "PASSWORDS_DO_NOT_MATCH": "Las contraseñas no coinciden.",
        "WRONG_CURRENT_PASSWORD": "Contraseña incorrecta.",
        "SAME_AS_CURRENT_PASSWORD": "La nueva contraseña no puede ser igual a la contraseña actual.",
    },
    "not_found": {
        "INVALID_RESET_LINK": "Enlace de restablecimiento inválido.",
        "INVALID_OR_EXPIRED_RESET_LINK": "Enlace de restablecimiento inválido o expirado.",
    },
}
