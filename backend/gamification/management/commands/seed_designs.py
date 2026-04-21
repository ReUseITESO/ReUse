from django.core.management.base import BaseCommand

# from gamification.models.avatar import DesignTemplate


class Command(BaseCommand):
    def handle(self, *args, **options):
        # media_path = 'initial_designs/'
        # full_path = os.path.join('media', media_path)

        # for filename in os.listdir(full_path):
        #     if filename.endswith(('.png', '.jpg')):
        #         DesignTemplate.objects.get_or_create(
        #             name=filename.split('.')[0],
        #             image=os.path.join(media_path, filename)
        #         )
        # self.stdout.write("Designs seeded successfully.")
        self.stdout.write("Seed command bypassed - DesignTemplate is disabled.")
