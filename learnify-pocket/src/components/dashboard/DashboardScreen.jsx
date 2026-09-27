import React, { useState } from "react";

import DashboardHeader from "./DashboardHeader";
import DashboardMenu from "./DashboardMenu";
import PlayerProfileCard from "./PlayerProfileCard";
import QuickStatsGrid from "./QuickStatsGrid";
import StudyAssetsBanner from "./StudyAssetsBanner";
import DailyQuests from "./DailyQuests";

import "../../styles/dashboard.css";

export default function DashboardScreen({
  userProfile = {},
  subjects = [],
  notes = [],
  flashcards = [],
  quizzes = [],
  tasks = [],
  onToggleTask = () => {},
  onDeleteTask = () => {},
  onAddTask = () => {},
  onNavigate = () => {},
  onOpenUpload = () => {},
  onLogout = () => {},
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="dashboard-screen">
      <DashboardHeader
        onMenuOpen={() => setIsMenuOpen(true)}
        onProfile={() => onNavigate("profile")}
      />

      <DashboardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <PlayerProfileCard
        userProfile={userProfile}
        onAskTutor={() => onNavigate("tutor")}
      />

      <QuickStatsGrid
        subjects={subjects}
        notes={notes}
        flashcards={flashcards}
        quizzes={quizzes}
        onNavigate={onNavigate}
      />

      <StudyAssetsBanner onOpenUpload={onOpenUpload} />

      <DailyQuests
        tasks={tasks}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onAddTask={onAddTask}
      />
    </main>
  );
}
