import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./Register";
import Login from "./Login";
import StudentProfile from "./StudentProfile";
import Explore from "./Explore";
import UniversityDashboard from "./UniversityDashboard";
import IndustryRequirements from "./IndustryRequirements";
import SkillGapAnalysis from "./SkillGapAnalysis";
import Notifications from "./Notifications";
import CompanyProfile from "./CompanyProfile";
import PostOpportunity from "./PostOpportunity";
import CareerDevelopment from "./CareerDevelopment";
import ReviewApplications from "./ReviewApplications";
import SpecifyRequiredSkills from "./SpecifyRequiredSkills";
import AdminDashboard from "./AdminDashboard";
import IndustryDashboard from "./IndustryDashboard";
import MyOpportunities from "./MyOpportunities";
import StudentDashboard from "./StudentDashboard";
import FindCandidates from "./FindCandidates";

// Protected Route Component to prevent unauthorized access
function RoleRoute({ children, allowedRoles }) {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  try {
    const user = JSON.parse(userStr);
    if (!allowedRoles.map(r => r.toLowerCase()).includes((user.role || "").toLowerCase())) {
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route
          path="/student-dashboard"
          element={
            <RoleRoute allowedRoles={["Student", "Admin"]}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student-profile"
          element={
            <RoleRoute allowedRoles={["Student", "Admin"]}>
              <StudentProfile />
            </RoleRoute>
          }
        />
        <Route
          path="/explore-opportunities"
          element={
            <RoleRoute allowedRoles={["Student", "Admin"]}>
              <Explore />
            </RoleRoute>
          }
        />

        {/* Industry Routes */}
        <Route
          path="/industry-dashboard"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <IndustryDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/company-profile"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <CompanyProfile />
            </RoleRoute>
          }
        />
        <Route
          path="/post-opportunity"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <PostOpportunity />
            </RoleRoute>
          }
        />
        <Route
          path="/my-opportunities"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <MyOpportunities />
            </RoleRoute>
          }
        />
        <Route
          path="/review-applications"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <ReviewApplications />
            </RoleRoute>
          }
        />
        <Route
          path="/find-candidates"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <FindCandidates />
            </RoleRoute>
          }
        />
        <Route
          path="/specify-required-skills"
          element={
            <RoleRoute allowedRoles={["Industry", "Admin"]}>
              <SpecifyRequiredSkills />
            </RoleRoute>
          }
        />

        {/* University Routes */}
        <Route
          path="/university-dashboard"
          element={
            <RoleRoute allowedRoles={["University", "Admin"]}>
              <UniversityDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/industry-requirements"
          element={
            <RoleRoute allowedRoles={["University", "Industry", "Admin"]}>
              <IndustryRequirements />
            </RoleRoute>
          }
        />
        <Route
          path="/career-development"
          element={
            <RoleRoute allowedRoles={["University", "Admin"]}>
              <CareerDevelopment />
            </RoleRoute>
          }
        />

        {/* Shared / Common Routes */}
        <Route
          path="/skill-gap"
          element={
            <RoleRoute allowedRoles={["Student", "University", "Admin"]}>
              <SkillGapAnalysis />
            </RoleRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <RoleRoute allowedRoles={["Student", "Industry", "University", "Admin"]}>
              <Notifications />
            </RoleRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <RoleRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </RoleRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
