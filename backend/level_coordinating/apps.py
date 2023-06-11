from django.apps import AppConfig


class LevelCoordinatorsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'level_coordinating'

    def ready(self):
        import level_coordinating.signals
