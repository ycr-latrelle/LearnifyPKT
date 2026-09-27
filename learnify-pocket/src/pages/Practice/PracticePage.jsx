import React from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import { useStudyData } from "../../context/StudyDataContext";

export default function PracticePage() {
  const { subjects, practiceExercises, togglePracticeComplete } = useStudyData();

  const subjectName = (subjectId) => subjects.find((s) => s.id === subjectId)?.name;
  const completedCount = practiceExercises.filter((p) => p.completed).length;

  return (
    <SectionShell
      activeTab="practice"
      title="Practice Lab"
      subtitle={`${completedCount} / ${practiceExercises.length} drills completed`}
    >
      {practiceExercises.length === 0 ? (
        <EmptyState message="NO PRACTICE DRILLS YET. Upload a document to generate some." />
      ) : (
        <div className="pixel-card-list">
          {practiceExercises.map((exercise) => (
            <div className="pixel-card" key={exercise.id}>
              <div className="pixel-card__top">
                <div style={{ minWidth: 0 }}>
                  <h3 className="pixel-card__title">{exercise.title}</h3>
                  <p className="pixel-card__meta">
                    {exercise.instruction}
                    {subjectName(exercise.subjectId) ? ` · ${subjectName(exercise.subjectId)}` : ""}
                  </p>
                </div>

                <span
                  className={`pixel-card__badge ${exercise.completed ? "practice-card__badge--done" : ""}`}
                >
                  {exercise.completed ? "DONE" : "OPEN"}
                </span>
              </div>

              {exercise.starterCode && <pre className="practice-code">{exercise.starterCode}</pre>}

              <button
                type="button"
                className={`pixel-button ${exercise.completed ? "pixel-button--ghost" : "pixel-button--blue"}`}
                style={{ marginTop: "0.75rem" }}
                onClick={() => togglePracticeComplete(exercise.id)}
              >
                <DashboardIcon name="check" size={12} />{" "}
                {exercise.completed ? "Mark as Open" : "Mark as Complete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
