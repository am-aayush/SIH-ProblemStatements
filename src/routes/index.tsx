import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const ProblemsPage = lazy(() => import('../pages/Explorer/ProblemsPage'));
const ProblemDetails = lazy(() => import('../pages/Explorer/ProblemDetails'));
const OrgsPage = lazy(() => import('../pages/Organizations/OrgsPage'));
const ThemesPage = lazy(() => import('../pages/Themes/ThemesPage'));
const DepsPage = lazy(() => import('../pages/Departments/DepsPage'));
const FavoritesPage = lazy(() => import('../pages/Favorites/FavoritesPage'));
const ComparePage = lazy(() => import('../pages/Compare/ComparePage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));

// New Routes
const Login = lazy(() => import('../pages/Auth/Login'));
const LeaderSignup = lazy(() => import('../pages/Auth/LeaderSignup'));
const JoinTeam = lazy(() => import('../pages/Auth/JoinTeam'));
const JoinExistingTeam = lazy(() => import('../pages/Auth/JoinExistingTeam'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const TeamManagement = lazy(() => import('../pages/Team/TeamManagement'));
const SkillMatrix = lazy(() => import('../pages/Team/SkillMatrix'));
const TeamProgress = lazy(() => import('../pages/Team/TeamProgress'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const TasksPage = lazy(() => import('../pages/Project/TasksPage'));
const StandupPage = lazy(() => import('../pages/Project/StandupPage'));
const NotificationsPage = lazy(() => import('../pages/Project/NotificationsPage'));
const MeetingsPage = lazy(() => import('../pages/Project/MeetingsPage'));
const AnalyticsPage = lazy(() => import('../pages/Project/AnalyticsPage'));
const NotFound = lazy(() => import('../pages/Error/NotFound'));
const SubmissionTrackerPage = lazy(() => import('../pages/Project/SubmissionTrackerPage'));
const FilesPage = lazy(() => import('../pages/Project/FilesPage'));
const MeetingDetails = lazy(() => import('../pages/Project/MeetingDetails'));
const CustomProblemsPage = lazy(() => import('../pages/Project/CustomProblemsPage'));
const IdeasPage = lazy(() => import('../pages/Project/IdeasPage'));
const MemberProfile = lazy(() => import('../pages/Team/MemberProfile'));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/join-existing" element={<JoinExistingTeam />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemDetails />} />
          <Route path="/organizations" element={<OrgsPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/departments" element={<DepsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/team/member/:id" element={<MemberProfile />} />
          <Route path="/skill-matrix" element={<SkillMatrix />} />
          <Route path="/progress" element={<TeamProgress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/standup" element={<StandupPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/project/meetings/:id" element={<MeetingDetails />} />
          <Route path="/project/submission-tracker" element={<SubmissionTrackerPage />} />
          <Route path="/project/files" element={<FilesPage />} />
          <Route path="/custom-problems" element={<CustomProblemsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
        </Route>
      </Route>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<LeaderSignup />} />
        <Route path="/join" element={<JoinTeam />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
