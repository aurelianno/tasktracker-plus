/*
  TeamInsightsPanel.jsx
  Panel component for displaying team insights and recommendations in TaskTracker+.
  - Summarizes team performance, trends, and actionable insights.
  - Integrates with Redux and backend analytics API for real-time data.
  - Provides a clear, actionable UI for team improvement.
*/

import React, { useState } from 'react';

const CollapsibleSection = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button className="w-full text-left font-semibold py-2 px-4 bg-gray-100 rounded hover:bg-gray-200" onClick={() => setOpen(o => !o)}>
        {title} <span className="float-right">{open ? '-' : '+'}</span>
      </button>
      {open && <div className="p-4 bg-white border rounded-b">{children}</div>}
    </div>
  );
};

const TeamInsightsPanel = ({ teamAnalytics, teamWorkload }) => {
  if (!teamAnalytics) return null;
  // Bottleneck: member with most overdue
  const bottleneck = teamAnalytics.overdueAgg?.[0];
  // Top performer: member with most completed
  const topPerformer = teamAnalytics.memberPerfAgg?.[0];
  return (
    <div className="mb-8">
      <CollapsibleSection title="Bottleneck Analysis">
        {bottleneck ? (
          <div>{bottleneck._id?.name || 'Unassigned'} has the most overdue tasks ({bottleneck.count}).</div>
        ) : (
          <div>No overdue tasks detected.</div>
        )}
      </CollapsibleSection>
      <CollapsibleSection title="Collaboration Insights">
        <div>Most tasks are assigned to: {teamWorkload?.workload?.[0]?._id?.name || 'N/A'}.</div>
        <div>Consider balancing assignments for better collaboration.</div>
      </CollapsibleSection>
      <CollapsibleSection title="Productivity Recommendations">
        <ul className="list-disc pl-5">
          <li>Encourage regular task updates to avoid bottlenecks.</li>
          <li>Review overdue tasks weekly.</li>
          <li>Celebrate top performers to boost morale.</li>
        </ul>
      </CollapsibleSection>
      <CollapsibleSection title="Recent Team Activity">
        <div>Activity feed integration coming soon.</div>
      </CollapsibleSection>
      <CollapsibleSection title="Top Performer of the Week">
        {topPerformer ? (
          <div>{topPerformer._id?.name || 'Unassigned'} completed the most tasks ({topPerformer.completed}).</div>
        ) : (
          <div>No completed tasks this week.</div>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default TeamInsightsPanel; 