export const UI = {
  password: {
    CURRENT_LABEL: "Contraseña actual",
    NEW_LABEL: "Nueva contraseña",
    CONFIRM_LABEL: "Confirmar nueva contraseña",
    USERNAME_OR_EMAIL_LABEL: "Usuario o correo electrónico",
    CURRENT_REQUIRED: "La contraseña actual es obligatoria.",
    NEW_REQUIRED: "La nueva contraseña es obligatoria.",
    MIN_LENGTH: "La contraseña debe tener al menos 8 caracteres.",
    ONLY_NUMERIC: "La contraseña no puede ser completamente numérica.",
    CONFIRM_REQUIRED: "Confirma tu nueva contraseña.",
    PASSWORDS_MISMATCH: "Las contraseñas no coinciden.",
    USERNAME_OR_EMAIL_REQUIRED: "Ingresa tu usuario o correo electrónico.",
    CHANGE_BUTTON: "Cambiar contraseña",
    CHANGING: "Guardando…",
    CHANGE_SUCCESS: "Contraseña cambiada exitosamente.",
    CHANGE_ERROR: "Error al cambiar la contraseña. Por favor, inténtalo de nuevo.",
    RESET_BUTTON: "Restablecer contraseña",
    RESETTING: "Restableciendo…",
    RESET_SUCCESS: "Tu contraseña ha sido restablecida exitosamente.",
    RESET_LINK_INVALID: "Enlace inválido o expirado. Por favor, solicita uno nuevo.",
    REQUEST_NEW_LINK: "Solicitar un nuevo enlace",
    GO_TO_LOGIN: "Ir al inicio de sesión",
    SEND_LINK_BUTTON: "Enviar enlace",
    SENDING: "Enviando…",
    FORGOT_SUCCESS:
      "Si existe una cuenta con esa información, se ha enviado un enlace para restablecer la contraseña. Revisa tu correo electrónico.",
    FORGOT_ERROR: "Algo salió mal. Por favor, inténtalo de nuevo.",
  },
  pages: {
    resetPassword: {
      TITLE: "Restablecer contraseña",
      INVALID_LINK: "El enlace de restablecimiento es inválido o ha expirado.",
      REQUEST_NEW_LINK: "Solicitar un nuevo enlace",
      BACK_TO_LOGIN: "Volver al inicio de sesión",
    },
    forgotPassword: {
      TITLE: "¿Olvidaste tu contraseña?",
      SUBTITLE:
        "Ingresa tu usuario o correo electrónico y te enviaremos un enlace para restablecer tu contraseña.",
      BACK_TO_LOGIN: "Volver al inicio de sesión",
    },
  },
} as const;
