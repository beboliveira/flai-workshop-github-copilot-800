from rest_framework import serializers
from octofit_tracker.models import User, Team, Activity, Workout


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='name', read_only=True)
    team_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['_id', 'name', 'full_name', 'email', 'team_id', 'team_name', 'fitness_level']
        read_only_fields = ['_id', 'full_name', 'team_name']
    
    def get_team_name(self, obj):
        if obj.team_id:
            try:
                team = Team.objects.get(team_id=obj.team_id)
                return team.name
            except Team.DoesNotExist:
                return 'No Team'
        return 'No Team'


class TeamSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['_id', 'team_id', 'name', 'description', 'members', 'member_count']
    
    def get_members(self, obj):
        members = User.objects.filter(team_id=obj.team_id)
        return [{'_id': str(member._id), 'name': member.name, 'email': member.email, 'fitness_level': member.fitness_level} for member in members]
    
    def get_member_count(self, obj):
        return User.objects.filter(team_id=obj.team_id).count()


class TeamSimpleSerializer(serializers.ModelSerializer):
    """Simplified serializer that returns only member IDs"""
    member_ids = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['_id', 'team_id', 'name', 'description', 'member_ids', 'member_count']
    
    def get_member_ids(self, obj):
        members = User.objects.filter(team_id=obj.team_id)
        return [str(member._id) for member in members]
    
    def get_member_count(self, obj):
        return User.objects.filter(team_id=obj.team_id).count()


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    workout_name = serializers.SerializerMethodField()
    workout_difficulty = serializers.SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = ['_id', 'user_email', 'workout_id', 'workout_name', 'workout_difficulty', 'duration', 'points', 'date']
    
    def get_workout_name(self, obj):
        if obj.workout_id:
            try:
                from bson import ObjectId
                workout_oid = ObjectId(obj.workout_id) if isinstance(obj.workout_id, str) else obj.workout_id
                workout = Workout.objects.get(_id=workout_oid)
                return workout.name
            except (Workout.DoesNotExist, Exception):
                return 'Unknown Workout'
        return 'No Workout'
    
    def get_workout_difficulty(self, obj):
        if obj.workout_id:
            try:
                from bson import ObjectId
                workout_oid = ObjectId(obj.workout_id) if isinstance(obj.workout_id, str) else obj.workout_id
                workout = Workout.objects.get(_id=workout_oid)
                return workout.difficulty
            except (Workout.DoesNotExist, Exception):
                return 'Unknown'
        return 'N/A'


class LeaderboardSerializer(serializers.Serializer):
    """Dynamic serializer for calculated leaderboard data"""
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    total_points = serializers.IntegerField()
    total_activities = serializers.IntegerField()
    rank = serializers.IntegerField()
