from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re

class CustomPasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos 1 letra mayúscula (A-Z)."),
                code='password_no_upper',
            )
        if not re.findall('[0-9]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos 1 número (0-9)."),
                code='password_no_number',
            )
        if not re.findall('[^A-Za-z0-9]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos 1 carácter especial (@, #, $, etc)."),
                code='password_no_symbol',
            )

    def get_help_text(self):
        return _(
            "Tu contraseña debe contener al menos 1 mayúscula, 1 número y 1 carácter especial."
        )
