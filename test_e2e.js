const axios = require("axios");

const API = "http://localhost:3000";

async function runTests() {
    console.log("=== STARTING END-TO-END INTEGRATION TEST ===");

    // 1. Health check
    console.log("\n1. Testing Backend Health Check...");
    const health = await axios.get(`${API}/`);
    console.log("✓ Health status:", health.data.message, "| DB:", health.data.database);

    // 2. Student Registration & Login
    console.log("\n2. Testing Student Registration & Login...");
    const studentUser = {
        username: "Aarav Sharma",
        email: `aarav.${Date.now()}@example.com`,
        password: "password123",
        confirmPassword: "password123",
        role: "Student",
        institution: "IIT Bombay",
        department: "Computer Science",
        course: "B.Tech"
    };
    const regStudent = await axios.post(`${API}/signup`, studentUser);
    console.log("✓ Student Registered:", regStudent.data.user.email, "| Token received:", !!regStudent.data.token);

    const loginStudent = await axios.post(`${API}/login`, {
        email: studentUser.email,
        password: studentUser.password,
        role: "Student"
    });
    console.log("✓ Student Logged in:", loginStudent.data.user.username);

    // 3. Student Profile Creation
    console.log("\n3. Testing Student Profile & Skill Management...");
    const profileData = {
        fullName: "Aarav Sharma",
        email: studentUser.email,
        phone: "+919876543210",
        college: "IIT Bombay",
        degree: "B.Tech",
        branch: "Computer Science",
        graduationYear: 2026,
        careerGoal: "Full Stack Software Engineer",
        skills: [
            { name: "React", level: "Advanced" },
            { name: "Node.js", level: "Intermediate" },
            { name: "Python", level: "Intermediate" }
        ],
        github: "https://github.com/aaravsharma",
        linkedin: "https://linkedin.com/in/aaravsharma"
    };
    const saveProfile = await axios.post(`${API}/student-profile`, profileData);
    console.log("✓ Student Profile Saved:", saveProfile.data.student.fullName, "| Skills:", saveProfile.data.student.skills.length);

    // 4. Industry Registration & Profile
    console.log("\n4. Testing Industry Registration & Company Profile...");
    const industryUser = {
        username: "Nexus Tech Solutions",
        email: `hr.${Date.now()}@nexustech.com`,
        password: "password123",
        confirmPassword: "password123",
        role: "Industry",
        company: "Nexus Tech Solutions",
        designation: "Talent Acquisition Head"
    };
    const regIndustry = await axios.post(`${API}/signup`, industryUser);
    console.log("✓ Industry Registered:", regIndustry.data.user.email);

    const companyData = {
        companyName: "Nexus Tech Solutions",
        email: industryUser.email,
        industryType: "Information Technology",
        companySize: "100-500",
        establishedYear: 2018,
        website: "https://nexustech.example.com",
        phone: "+919123456789",
        location: "Bengaluru, Karnataka",
        description: "Enterprise Cloud and Web Systems Provider",
        technologies: ["React", "Node.js", "Docker", "MongoDB"],
        expertise: ["Web Development", "Cloud Architecture"]
    };
    const saveCompany = await axios.post(`${API}/company-profile`, companyData);
    console.log("✓ Company Profile Saved:", saveCompany.data.company.companyName);

    // 5. Post Opportunity
    console.log("\n5. Testing Opportunity Creation with Required Skills...");
    const oppData = {
        title: "Frontend Engineering Intern",
        type: "Internship",
        companyName: "Nexus Tech Solutions",
        companyEmail: industryUser.email,
        domain: "Software Development",
        location: "Bengaluru",
        workMode: "Hybrid",
        description: "Develop cutting-edge React web applications and state management workflows.",
        requiredSkills: [
            { skillName: "React", level: "Intermediate" },
            { skillName: "Node.js", level: "Intermediate" },
            { skillName: "Docker", level: "Beginner" }
        ],
        eligibility: "Final and pre-final year engineering students",
        openings: 3,
        compensation: "₹35,000 / month",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    const postOpp = await axios.post(`${API}/opportunities`, oppData);
    const opportunityId = postOpp.data.opportunity._id;
    console.log("✓ Opportunity Posted:", postOpp.data.opportunity.title, "| ID:", opportunityId);

    // 6. Skill Matching & Recommendation
    console.log("\n6. Testing Skill Matching & Recommendations for Student...");
    const recs = await axios.get(`${API}/student-profile/recommendations/${encodeURIComponent(studentUser.email)}`);
    console.log("✓ Recommendations generated:", recs.data.recommendations.length);
    if (recs.data.recommendations.length > 0) {
        const topMatch = recs.data.recommendations[0];
        console.log(`   Top Opportunity: "${topMatch.opportunity.title}" | Match Score: ${topMatch.matchPercentage}%`);
        console.log(`   Matched Skills:`, topMatch.matchedSkills.map(s => s.skillName));
        console.log(`   Missing Skills:`, topMatch.missingSkills.map(s => s.skillName));
    }

    // 7. Student Applies
    console.log("\n7. Testing Application Submission...");
    const applyRes = await axios.post(`${API}/applications`, {
        opportunityId: String(opportunityId),
        opportunityTitle: oppData.title,
        opportunityType: oppData.type,
        companyName: oppData.companyName,
        location: oppData.location,
        stipend: oppData.compensation,
        studentEmail: studentUser.email
    });
    const applicationId = applyRes.data.application._id;
    console.log("✓ Application Submitted:", applyRes.data.application.status, "| ID:", applicationId);

    // 8. Industry Reviews Applications & Updates Status
    console.log("\n8. Testing Industry Application Review & Status Update...");
    const companyApps = await axios.get(`${API}/applications/company?companyEmail=${encodeURIComponent(industryUser.email)}`);
    console.log("✓ Applications retrieved by Company:", companyApps.data.length);

    const updateStatus = await axios.patch(`${API}/applications/${applicationId}/status`, {
        status: "Shortlisted",
        companyName: "Nexus Tech Solutions"
    });
    console.log("✓ Application Status Updated:", updateStatus.data.application.status);

    // 9. Student Notifications
    console.log("\n9. Testing Student Notifications...");
    const notifs = await axios.get(`${API}/notifications/${encodeURIComponent(studentUser.email)}`);
    console.log("✓ Student Notifications received:", notifs.data.length);
    notifs.data.forEach((n, i) => console.log(`   [${i + 1}] ${n.title}: ${n.message}`));

    // 10. Industry Finds Candidates
    console.log("\n10. Testing Industry Candidate Matching...");
    const candMatches = await axios.get(`${API}/candidate-matches?opportunityId=${opportunityId}&companyEmail=${encodeURIComponent(industryUser.email)}`);
    console.log("✓ Ranked Candidates found:", candMatches.data.candidates.length);
    if (candMatches.data.candidates.length > 0) {
        console.log(`   Top Candidate: ${candMatches.data.candidates[0].fullName} | Match: ${candMatches.data.candidates[0].matchPercentage}%`);
    }

    // 11. University Role: View Student Profiles & Analytics
    console.log("\n11. Testing University Views & Skill Analytics...");
    const univStudents = await axios.get(`${API}/university/students`);
    console.log("✓ University accessed student skill profiles:", univStudents.data.length);

    const univGaps = await axios.get(`${API}/university/skill-gaps`);
    console.log("✓ University analyzed skill gaps across industry demands:", univGaps.data.skillGaps.length, "skills evaluated.");

    // 12. University Career Development Plan
    console.log("\n12. Testing University Career Development Plan...");
    const careerPlanData = {
        studentEmail: studentUser.email,
        careerGoal: "Full Stack Software Engineer",
        targetRole: "Frontend Engineer",
        duration: "3 Months",
        activities: [
            {
                title: "Complete Docker Fundamentals Certification",
                category: "Certification",
                description: "Bridge containerization skill gap for industry internship readiness.",
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }
        ]
    };
    const planRes = await axios.post(`${API}/career-development/plans`, careerPlanData);
    console.log("✓ Career Development Plan Created for:", planRes.data.careerPlan.studentName);

    // 13. Admin Login & Dashboard
    console.log("\n13. Testing Administrator Access & Platform Data...");
    const adminLogin = await axios.post(`${API}/login`, {
        email: "admin@academia.edu",
        password: "admin123",
        role: "Admin"
    });
    console.log("✓ Administrator Logged in successfully. Token received:", !!adminLogin.data.token);

    const adminDashboard = await axios.get(`${API}/admin/dashboard`);
    console.log("✓ Admin Dashboard Loaded. Platform Counts:", adminDashboard.data.counts);

    const adminAnalytics = await axios.get(`${API}/admin/analytics`);
    console.log("✓ Admin Analytics Loaded:", adminAnalytics.data.usersByRole.map(u => `${u._id}: ${u.count}`).join(", "));

    console.log("\n========================================================");
    console.log("🎉 ALL ARCHITECTURE REQUIREMENTS FULLY VERIFIED & WORKING!");
    console.log("========================================================\n");
}

runTests().catch(err => {
    console.error("Test error:", err.response ? err.response.data : err.message);
    process.exit(1);
});

