
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./Register";
import Login from "./Login";
import StudentProfile from "./StudentProfile";
import Explore from "./Explore";
import UniversityDashboard from "../UniversityDashboard";
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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/student-profile"
          element={<StudentProfile />}
        />

        <Route
          path="/explore-opportunities"
          element={<Explore />}
        />

        <Route
          path="/university-dashboard"
          element={<UniversityDashboard />}
        />

        <Route
          path="/industry-requirements"
          element={<IndustryRequirements />}
        />

        <Route
          path="/skill-gap"
          element={<SkillGapAnalysis />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />
        <Route
  path="/company-profile"
  element={<CompanyProfile />}
/>

    <Route
  path="/post-opportunity"
  element={<PostOpportunity />}
/>
    <Route
  path="/career-development"
  element={<CareerDevelopment />}
/>
    <Route
  path="/review-applications"
  element={<ReviewApplications />}
/>

<Route
  path="/find-candidates"
  element={<FindCandidates />}
/>

<Route
  path="/specify-required-skills"
  element={<SpecifyRequiredSkills />}
/>

<Route path="/admin-dashboard" element={<AdminDashboard />} />

<Route
  path="/industry-dashboard"
  element={<IndustryDashboard />}
/>

<Route
  path="/my-opportunities"
  element={<MyOpportunities />}
/>
<Route
  path="/student-dashboard"
  element={<StudentDashboard />}
/>
   
      </Routes>
    </BrowserRouter>
  );
}

export default App;
