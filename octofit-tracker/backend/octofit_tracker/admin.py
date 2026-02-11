from django.contrib import admin
from octofit_tracker.models import User, Team, Activity, Workout


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'team_id', 'fitness_level')
    search_fields = ('name', 'email')
    list_filter = ('team_id', 'fitness_level')


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('team_id', 'name', 'description')
    search_fields = ('name',)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'workout_id', 'duration', 'points', 'date')
    search_fields = ('user_email',)
    list_filter = ('date',)
    readonly_fields = ('points',)


# Leaderboard is now calculated dynamically - no admin needed


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('name', 'difficulty', 'duration', 'calories_per_session')
    search_fields = ('name',)
    list_filter = ('difficulty',)
