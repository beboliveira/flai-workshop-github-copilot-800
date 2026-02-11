from django.contrib import admin
from octofit_tracker.models import User, Team, Activity, Leaderboard, Workout


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'team_id')
    search_fields = ('name', 'email')
    list_filter = ('team_id',)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('team_id', 'name', 'description')
    search_fields = ('name',)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'activity_type', 'duration', 'calories', 'date')
    search_fields = ('user_email', 'activity_type')
    list_filter = ('activity_type', 'date')


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('rank', 'team_name', 'total_calories', 'total_activities')
    ordering = ('rank',)
    search_fields = ('team_name',)


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('name', 'difficulty', 'duration', 'calories_per_session')
    search_fields = ('name',)
    list_filter = ('difficulty',)
