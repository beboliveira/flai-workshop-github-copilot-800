from django.db import models
from djongo import models as djongo_models


class User(models.Model):
    _id = djongo_models.ObjectIdField(primary_key=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    team_id = models.IntegerField(null=True, blank=True)
    fitness_level = models.CharField(max_length=50, default='Beginner', choices=[
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
        ('Expert', 'Expert')
    ])
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.name


class Team(models.Model):
    _id = djongo_models.ObjectIdField(primary_key=True)
    team_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'teams'
    
    def __str__(self):
        return self.name


class Activity(models.Model):
    _id = djongo_models.ObjectIdField(primary_key=True)
    user_email = models.EmailField()
    workout_id = models.CharField(max_length=50, null=True, blank=True)  # Reference to Workout._id
    duration = models.IntegerField()  # in minutes
    points = models.IntegerField(default=0)  # Points earned from this activity
    date = models.DateTimeField()
    
    class Meta:
        db_table = 'activities'
    
    def __str__(self):
        return f"{self.user_email} - Workout Activity"
    
    def calculate_points(self):
        """Calculate points based on workout calories_per_session"""
        if self.workout_id:
            try:
                from bson import ObjectId
                # Convert string ID to ObjectId for querying
                workout_oid = ObjectId(self.workout_id) if isinstance(self.workout_id, str) else self.workout_id
                workout = Workout.objects.get(_id=workout_oid)
                # Points based on workout difficulty and duration
                base_points = workout.calories_per_session
                duration_multiplier = self.duration / workout.duration
                self.points = int(base_points * duration_multiplier)
            except (Workout.DoesNotExist, Exception) as e:
                print(f"Error calculating points: {e}")
                self.points = 0
        return self.points


# Leaderboard is now calculated dynamically - no longer a database table
# See LeaderboardViewSet for the dynamic calculation


class Workout(models.Model):
    _id = djongo_models.ObjectIdField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=50)
    duration = models.IntegerField()  # in minutes
    calories_per_session = models.IntegerField()
    
    class Meta:
        db_table = 'workouts'
    
    def __str__(self):
        return self.name
