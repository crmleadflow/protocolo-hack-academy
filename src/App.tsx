import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import CatalogPage from "./pages/CatalogPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import ProducerDashboardPage from "./pages/ProducerDashboardPage";
import ProducerCoursesPage from "./pages/ProducerCoursesPage";
import ProducerNewCoursePage from "./pages/ProducerNewCoursePage";
import ProducerCourseEditPage from "./pages/ProducerCourseEditPage";
import AdminStudentsPage from "./pages/AdminStudentsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AchievementsPage from "./pages/AchievementsPage";
import CommunityPage from "./pages/CommunityPage";
import MentorPage from "./pages/MentorPage";
import ProducerMentorPage from "./pages/ProducerMentorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalog"
              element={
                <ProtectedRoute>
                  <CatalogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute>
                  <CoursePlayerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AchievementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor"
              element={
                <ProtectedRoute>
                  <MentorPage />
                </ProtectedRoute>
              }
            />
            {/* Admin/Producer Routes */}
            <Route
              path="/producer"
              element={
                <ProtectedRoute requireAdmin>
                  <ProducerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/producer/courses"
              element={
                <ProtectedRoute requireAdmin>
                  <ProducerCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/producer/new-course"
              element={
                <ProtectedRoute requireAdmin>
                  <ProducerNewCoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/producer/course/:courseId/edit"
              element={
                <ProtectedRoute requireAdmin>
                  <ProducerCourseEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/producer/students"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminStudentsPage />
                </ProtectedRoute>
              }
            />
            {/* Alias for /producer/upload - redirects to courses list */}
            <Route
              path="/producer/upload"
              element={
                <ProtectedRoute requireAdmin>
                  <ProducerCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/producer/mentor"
              element={
                <ProtectedRoute requireAdmin>
                  <ProducerMentorPage />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
