import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardScreen from "../../components/dashboard/DashboardScreen";
import UploadFileModal from "../../components/modals/UploadFileModal";
import { useStudyData } from "../../context/StudyDataContext";
import { SECTION_ROUTES } from "../../utils/sectionNavigation";

export default function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const {
    subjects,
    notes,
    flashcards,
    quizzes,
    tasks,
    toggleTask,
    deleteTask,
    addTask,
    generateAssetsFromUpload,
  } = useStudyData();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleNavigate = (section) => {
    const route = SECTION_ROUTES[section];
    if (route) navigate(route);
  };

  const userProfile = {
    name: user?.name || user?.displayName || "Player",
    streak: user?.streak || 0,
    studyTimeMinutes: user?.studyTimeMinutes || 0,
    targetDailyMinutes: user?.targetDailyMinutes || 60,
  };

  return (
    <>
      <DashboardScreen
        userProfile={userProfile}
        subjects={subjects}
        notes={notes}
        flashcards={flashcards}
        quizzes={quizzes}
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onAddTask={addTask}
        onNavigate={handleNavigate}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLogout={onLogout}
      />

      {isUploadOpen && (
        <UploadFileModal
          subjects={subjects}
          onClose={() => setIsUploadOpen(false)}
          onUpload={generateAssetsFromUpload}
        />
      )}
    </>
  );
}
