from django.db import models
from djongo import models as djongo_models


class User(models.Model):
    _id = djongo_models.ObjectIdField(primary_key=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    team_id = models.IntegerField(null=True, blank=True)
    
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
    activity_type = models.CharField(max_length=100)
    duration = models.IntegerField()  # in minutes
    calories = models.IntegerField()
    date = models.DateTimeField()
    
    class Meta:
        db_table = 'activities'
    
    def __str__(self):
        return f"{self.user_email} - {self.activity_type}"


class Leaderboard(models.Model):
    _id = djongo_models.ObjectIdField(primary_key=True)
    team_id = models.IntegerField()
    team_name = models.CharField(max_length=200)
    total_calories = models.IntegerField()
    total_activities = models.IntegerField()
    rank = models.IntegerField()
    
    class Meta:
        db_table = 'leaderboard'
    
    def __str__(self):
        return f"{self.team_name} - Rank {self.rank}"


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
