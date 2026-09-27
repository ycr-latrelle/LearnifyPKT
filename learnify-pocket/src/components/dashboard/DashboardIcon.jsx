import React from "react";

const DashboardIcon = ({ name, size = 18, className = "" }) => {
  const icons = {
    dashboard: (
      <path
        d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    subjects: (
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    notes: (
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    cards: (
      <path
        d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9zm4-4h12"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    quiz: (
      <path
        d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    practice: (
      <path
        d="M16 18l6-6-6-6M8 6l-6 6 6 6"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    progress: (
      <path
        d="M18 20V10M12 20V4M6 20v-6"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    check: (
      <path
        d="M20 6L9 17l-5-5"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    fileUpload: (
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    ),

    plus: <path d="M12 5v14M5 12h14" strokeWidth="3" strokeLinecap="square" />,

    bot: (
      <path
        d="M12 2a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-3 8h.01M15 10h.01M9 14h6"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    trash: (
      <path
        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    ),

    menu: (
      <path
        d="M4 6h16M4 12h16M4 18h16"
        strokeWidth="3"
        strokeLinecap="square"
      />
    ),

    close: (
      <path d="M18 6L6 18M6 6l12 12" strokeWidth="3" strokeLinecap="square" />
    ),

    user: (
      <g>
        <circle cx="12" cy="7" r="4" strokeWidth="2.5" />

        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2.5" />
      </g>
    ),

    back: (
      <path
        d="M19 12H5M11 18l-6-6 6-6"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    chevronRight: (
      <path
        d="M9 18l6-6-6-6"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    send: (
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    edit: (
      <path
        d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    star: (
      <path
        d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7L12 17.3 5.7 20.9l1.7-7L2 9.2l7.1-.6L12 2z"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    lock: (
      <g>
        <rect x="4" y="10" width="16" height="10" strokeWidth="2.5" />

        <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeWidth="2.5" />
      </g>
    ),

    x: <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="square" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      {icons[name] || icons.bot}
    </svg>
  );
};

export default DashboardIcon;
