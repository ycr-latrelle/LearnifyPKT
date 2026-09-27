import React from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import { useStudyData } from "../../context/StudyDataContext";
import { useAuth } from "../../context/AuthContext";

export default function ProgressPage() {
  const { user } = useAuth();
  const { subjects, notes, flashcards, quizzes, practiceExercises, tasks } = useStudyData();

  const streak = user?.streak || 0;
  const studyTimeMinutes = user?.studyTimeMinutes || 0;
  const targetDailyMinutes = user?.targetDailyMinutes || 60;
  const studyProgress =
    targetDailyMinutes > 0 ? Math.min(100, Math.round((studyTimeMinutes / targetDailyMinutes) * 100)) : 0;

  const completedTasks = tasks.filter((t) => t.done).length;
  const questProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const completedPractice = practiceExercises.filter((p) => p.completed).length;

  const contentBySubject = subjects.map((subject) => {
    const count =
      notes.filter((n) => n.subjectId === subject.id).length +
      flashcards.filter((c) => c.subjectId === subject.id).length +
      quizzes.filter((q) => q.subjectId === subject.id).length +
      practiceExercises.filter((p) => p.subjectId === subject.id).length;
    return { ...subject, count };
  });

  const maxCount = Math.max(1, ...contentBySubject.map((s) => s.count));

  return (
    <SectionShell activeTab="progress" title="Progress Stats" subtitle="How your studying is trending">
      <div className="progress-grid">
        <div className="progress-stat-card">
          <span className="progress-stat-card__value">🔥 {streak}</span>
          <span className="progress-stat-card__label">Day Streak</span>
        </div>

        <div className="progress-stat-card">
          <span className="progress-stat-card__value">
            {studyTimeMinutes}/{targetDailyMinutes}
          </span>
          <span className="progress-stat-card__label">Minutes Today</span>
        </div>

        <div className="progress-stat-card">
          <span className="progress-stat-card__value">
            {completedTasks}/{tasks.length}
          </span>
          <span className="progress-stat-card__label">Quests Done</span>
        </div>

        <div className="progress-stat-card">
          <span className="progress-stat-card__value">
            {completedPractice}/{practiceExercises.length}
          </span>
          <span className="progress-stat-card__label">Drills Done</span>
        </div>
      </div>

      <div>
        <div className="progress-bar-row">
          <div className="progress-bar-row__label">
            <span>DAILY EXP GOAL</span>
            <span>{studyProgress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${studyProgress}%` }} />
          </div>
        </div>

        <div className="progress-bar-row">
          <div className="progress-bar-row__label">
            <span>DAILY QUESTS</span>
            <span>{questProgress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${questProgress}%` }} />
          </div>
        </div>
      </div>

      <div>
        <p className="progress-section-title" style={{ marginBottom: "0.625rem" }}>
          Study Assets by Subject
        </p>

        {contentBySubject.length === 0 ? (
          <EmptyState message="ADD A SUBJECT TO SEE ITS PROGRESS HERE." />
        ) : (
          contentBySubject.map((subject) => (
            <div className="progress-bar-row" key={subject.id}>
              <div className="progress-bar-row__label">
                <span>{subject.name}</span>
                <span>{subject.count}</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(subject.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </SectionShell>
  );
}
