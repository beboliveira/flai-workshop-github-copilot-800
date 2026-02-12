from django.core.management.base import BaseCommand
from octofit_tracker.models import User, Team, Activity, Workout
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Deleting existing data...')
        
        # Delete existing data
        User.objects.all().delete()
        Team.objects.all().delete()
        Activity.objects.all().delete()
        Workout.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('Existing data deleted'))
        
        # Create teams
        self.stdout.write('Creating teams...')
        team_marvel = Team.objects.create(
            team_id=1,
            name='Team Marvel',
            description='Earth\'s Mightiest Heroes fighting for fitness'
        )
        team_dc = Team.objects.create(
            team_id=2,
            name='Team DC',
            description='Justice League members staying in peak condition'
        )
        self.stdout.write(self.style.SUCCESS(f'Created teams: {team_marvel.name}, {team_dc.name}'))
        
        # Create Marvel users
        self.stdout.write('Creating Marvel heroes...')
        marvel_users = [
            User.objects.create(name='Iron Man', email='tony.stark@marvel.com', team_id=1, fitness_level='Expert'),
            User.objects.create(name='Captain America', email='steve.rogers@marvel.com', team_id=1, fitness_level='Expert'),
            User.objects.create(name='Thor', email='thor.odinson@marvel.com', team_id=1, fitness_level='Expert'),
            User.objects.create(name='Black Widow', email='natasha.romanoff@marvel.com', team_id=1, fitness_level='Advanced'),
            User.objects.create(name='Hulk', email='bruce.banner@marvel.com', team_id=1, fitness_level='Expert'),
            User.objects.create(name='Spider-Man', email='peter.parker@marvel.com', team_id=1, fitness_level='Intermediate'),
        ]
        
        # Create DC users
        self.stdout.write('Creating DC heroes...')
        dc_users = [
            User.objects.create(name='Superman', email='clark.kent@dc.com', team_id=2, fitness_level='Expert'),
            User.objects.create(name='Batman', email='bruce.wayne@dc.com', team_id=2, fitness_level='Expert'),
            User.objects.create(name='Wonder Woman', email='diana.prince@dc.com', team_id=2, fitness_level='Expert'),
            User.objects.create(name='Flash', email='barry.allen@dc.com', team_id=2, fitness_level='Advanced'),
            User.objects.create(name='Aquaman', email='arthur.curry@dc.com', team_id=2, fitness_level='Advanced'),
            User.objects.create(name='Green Lantern', email='hal.jordan@dc.com', team_id=2, fitness_level='Intermediate'),
        ]
        
        all_users = marvel_users + dc_users
        self.stdout.write(self.style.SUCCESS(f'Created {len(all_users)} users'))
        
        # Create workouts
        self.stdout.write('Creating workouts...')
        workouts = [
            Workout.objects.create(
                name='Super Strength Training',
                description='Build incredible strength like the Hulk',
                difficulty='Hard',
                duration=45,
                calories_per_session=500
            ),
            Workout.objects.create(
                name='Speed Force Cardio',
                description='Run faster than ever with Flash-inspired cardio',
                difficulty='Medium',
                duration=30,
                calories_per_session=400
            ),
            Workout.objects.create(
                name='Warrior HIIT',
                description='High-intensity training for warriors',
                difficulty='Hard',
                duration=40,
                calories_per_session=550
            ),
            Workout.objects.create(
                name='Web-Slinger Yoga',
                description='Flexibility training inspired by Spider-Man',
                difficulty='Easy',
                duration=25,
                calories_per_session=200
            ),
            Workout.objects.create(
                name='Shield Defense Circuit',
                description='Full-body circuit training',
                difficulty='Medium',
                duration=35,
                calories_per_session=450
            ),
            Workout.objects.create(
                name='Kryptonian Power Lifting',
                description='Heavy lifting for maximum strength',
                difficulty='Hard',
                duration=50,
                calories_per_session=600
            ),
        ]
        self.stdout.write(self.style.SUCCESS(f'Created {len(workouts)} workouts'))
        
        # Create activities linked to workouts
        self.stdout.write('Creating activities linked to workouts...')
        
        marvel_total_points = 0
        marvel_total_activities = 0
        
        for user in marvel_users:
            num_activities = random.randint(5, 10)
            for i in range(num_activities):
                activity_date = datetime.now() - timedelta(days=random.randint(0, 30))
                # Select a random workout
                workout = random.choice(workouts)
                # Duration can vary from the workout's recommended duration
                duration = random.randint(
                    max(10, workout.duration - 15),
                    workout.duration + 15
                )
                
                activity = Activity.objects.create(
                    user_email=user.email,
                    workout_id=str(workout._id),
                    duration=duration,
                    date=activity_date
                )
                # Calculate points based on workout
                activity.calculate_points()
                activity.save()
                
                marvel_total_points += activity.points
                marvel_total_activities += 1
        
        dc_total_points = 0
        dc_total_activities = 0
        
        for user in dc_users:
            num_activities = random.randint(5, 10)
            for i in range(num_activities):
                activity_date = datetime.now() - timedelta(days=random.randint(0, 30))
                workout = random.choice(workouts)
                duration = random.randint(
                    max(10, workout.duration - 15),
                    workout.duration + 15
                )
                
                activity = Activity.objects.create(
                    user_email=user.email,
                    workout_id=str(workout._id),
                    duration=duration,
                    date=activity_date
                )
                activity.calculate_points()
                activity.save()
                
                dc_total_points += activity.points
                dc_total_activities += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {marvel_total_activities + dc_total_activities} activities'))
        
        # Note: Leaderboard is now calculated dynamically, no need to create entries
        self.stdout.write(self.style.SUCCESS('Leaderboard will be calculated dynamically'))
        
        self.stdout.write(self.style.SUCCESS('\n=== Database Population Summary ==='))
        self.stdout.write(f'Teams: {Team.objects.count()}')
        self.stdout.write(f'Users: {User.objects.count()}')
        self.stdout.write(f'Workouts: {Workout.objects.count()}')
        self.stdout.write(f'Activities: {Activity.objects.count()}')
        self.stdout.write(f'\nTeam Marvel: {marvel_total_activities} activities, {marvel_total_points} points')
        self.stdout.write(f'Team DC: {dc_total_activities} activities, {dc_total_points} points\n')
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))

