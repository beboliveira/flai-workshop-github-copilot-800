from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.reverse import reverse
from octofit_tracker.models import User, Team, Activity, Workout
from octofit_tracker.serializers import (
    UserSerializer, TeamSerializer, TeamSimpleSerializer, ActivitySerializer,
    LeaderboardSerializer, WorkoutSerializer
)
import os


@api_view(['GET'])
def api_root(request, format=None):
    # Build base URL for Codespaces or localhost
    codespace_name = os.getenv('CODESPACE_NAME')
    if codespace_name:
        base_url = f'https://{codespace_name}-8000.app.github.dev'
    else:
        base_url = request.build_absolute_uri('/').rstrip('/')
    
    return Response({
        'users': f'{base_url}/api/users/',
        'teams': f'{base_url}/api/teams/',
        'activities': f'{base_url}/api/activities/',
        'leaderboard': f'{base_url}/api/leaderboard/',
        'workouts': f'{base_url}/api/workouts/',
    })


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    
    def get_serializer_class(self):
        """Use simple serializer if requested via query param"""
        if self.request.query_params.get('simple', '').lower() == 'true':
            return TeamSimpleSerializer
        return TeamSerializer
    
    @action(detail=False, methods=['post'], url_path='add-member')
    def add_member_action(self, request):
        """Add a user to a team - uses team_id from request body"""
        team_id = request.data.get('team_id')
        user_id = request.data.get('user_id')
        
        if not team_id or not user_id:
            return Response(
                {'error': 'team_id and user_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            team = Team.objects.get(team_id=int(team_id))
            user = User.objects.get(_id=user_id)
            user.team_id = team.team_id
            user.save()
            return Response(
                {'message': f'User {user.name} added to {team.name}'},
                status=status.HTTP_200_OK
            )
        except Team.DoesNotExist:
            return Response(
                {'error': 'Team not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {'error': 'Invalid team_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], url_path='remove-member')
    def remove_member_action(self, request):
        """Remove a user from a team - uses team_id from request body"""
        team_id = request.data.get('team_id')
        user_id = request.data.get('user_id')
        
        if not team_id or not user_id:
            return Response(
                {'error': 'team_id and user_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            team = Team.objects.get(team_id=int(team_id))
            user = User.objects.get(_id=user_id)
            if user.team_id != team.team_id:
                return Response(
                    {'error': 'User is not a member of this team'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.team_id = None
            user.save()
            return Response(
                {'message': f'User {user.name} removed from {team.name}'},
                status=status.HTTP_200_OK
            )
        except Team.DoesNotExist:
            return Response(
                {'error': 'Team not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {'error': 'Invalid team_id'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    
    def perform_create(self, serializer):
        """Auto-calculate points when creating an activity"""
        activity = serializer.save()
        activity.calculate_points()
        activity.save()
    
    def perform_update(self, serializer):
        """Recalculate points when updating an activity"""
        activity = serializer.save()
        activity.calculate_points()
        activity.save()


class LeaderboardViewSet(viewsets.ViewSet):
    """Dynamic leaderboard calculation based on team activities"""
    
    def list(self, request):
        leaderboard_data = []
        teams = Team.objects.all()
        
        for team in teams:
            # Get all users in this team
            team_members = User.objects.filter(team_id=team.team_id)
            member_emails = [member.email for member in team_members]
            
            # Get all activities from team members
            team_activities = Activity.objects.filter(user_email__in=member_emails)
            
            # Calculate totals
            total_points = sum(activity.points for activity in team_activities)
            total_activities = team_activities.count()
            
            leaderboard_data.append({
                'team_id': team.team_id,
                'team_name': team.name,
                'total_points': total_points,
                'total_activities': total_activities,
            })
        
        # Sort by total points (descending) and assign ranks
        leaderboard_data.sort(key=lambda x: x['total_points'], reverse=True)
        for idx, entry in enumerate(leaderboard_data):
            entry['rank'] = idx + 1
        
        serializer = LeaderboardSerializer(leaderboard_data, many=True)
        return Response(serializer.data)


class WorkoutViewSet(viewsets.ModelViewSet):
    queryset = Workout.objects.all()
    serializer_class = WorkoutSerializer
