from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from octofit_tracker.models import User, Team, Activity, Leaderboard, Workout
from datetime import datetime


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            name="Test User",
            email="test@example.com",
            team_id=1
        )

    def test_user_creation(self):
        self.assertEqual(self.user.name, "Test User")
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.team_id, 1)

    def test_user_str(self):
        self.assertEqual(str(self.user), "Test User")


class TeamModelTest(TestCase):
    def setUp(self):
        self.team = Team.objects.create(
            team_id=1,
            name="Test Team",
            description="A test team"
        )

    def test_team_creation(self):
        self.assertEqual(self.team.team_id, 1)
        self.assertEqual(self.team.name, "Test Team")

    def test_team_str(self):
        self.assertEqual(str(self.team), "Test Team")


class ActivityModelTest(TestCase):
    def setUp(self):
        self.activity = Activity.objects.create(
            user_email="test@example.com",
            activity_type="Running",
            duration=30,
            calories=300,
            date=datetime.now()
        )

    def test_activity_creation(self):
        self.assertEqual(self.activity.user_email, "test@example.com")
        self.assertEqual(self.activity.activity_type, "Running")
        self.assertEqual(self.activity.duration, 30)


class LeaderboardModelTest(TestCase):
    def setUp(self):
        self.leaderboard = Leaderboard.objects.create(
            team_id=1,
            team_name="Test Team",
            total_calories=1000,
            total_activities=10,
            rank=1
        )

    def test_leaderboard_creation(self):
        self.assertEqual(self.leaderboard.team_id, 1)
        self.assertEqual(self.leaderboard.rank, 1)


class WorkoutModelTest(TestCase):
    def setUp(self):
        self.workout = Workout.objects.create(
            name="Test Workout",
            description="A test workout",
            difficulty="Medium",
            duration=45,
            calories_per_session=400
        )

    def test_workout_creation(self):
        self.assertEqual(self.workout.name, "Test Workout")
        self.assertEqual(self.workout.difficulty, "Medium")


class UserAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(
            name="API Test User",
            email="api@example.com",
            team_id=1
        )

    def test_get_users(self):
        url = reverse('user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TeamAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.team = Team.objects.create(
            team_id=1,
            name="API Test Team",
            description="Test"
        )

    def test_get_teams(self):
        url = reverse('team-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ActivityAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.activity = Activity.objects.create(
            user_email="api@example.com",
            activity_type="Cycling",
            duration=60,
            calories=500,
            date=datetime.now()
        )

    def test_get_activities(self):
        url = reverse('activity-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
