import React from 'react';

const getColor = (value, thresholds) => {
  if (value >= thresholds.green) return 'bg-green-100 text-green-700';
  if (value >= thresholds.yellow) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const TeamPerformanceCards = ({ teamAnalytics, loading }) => {
  if (loading) return <div className="my-8">Loading analytics...</div>;
  if (!teamAnalytics) return null;
  const { completionRate, avgCompletionTime, tasksCompletedThisWeek, tasksCompletedLastWeek, efficiencyScore } = teamAnalytics;
  const velocityDiff = (tasksCompletedThisWeek ?? 0) - (tasksCompletedLastWeek ?? 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className={`p-4 rounded-lg shadow ${getColor(completionRate, { green: 80, yellow: 50 })}`}>
        <div className="text-sm font-semibold">Completion Rate</div>
        <div className="text-2xl font-bold">{completionRate?.toFixed(1) ?? '--'}%</div>
        <div className="text-xs">{completionRate >= 80 ? 'Excellent' : completionRate >= 50 ? 'Moderate' : 'Needs Improvement'}</div>
      </div>
      <div className={`p-4 rounded-lg shadow ${getColor(avgCompletionTime ?? 0, { green: 12, yellow: 24 })}`}>
        <div className="text-sm font-semibold">Avg Completion Time</div>
        <div className="text-2xl font-bold">{avgCompletionTime ? avgCompletionTime.toFixed(1) : '--'} hrs</div>
        <div className="text-xs">{avgCompletionTime ? (avgCompletionTime < 12 ? 'Fast' : avgCompletionTime < 24 ? 'Average' : 'Slow') : ''}</div>
      </div>
      <div className={`p-4 rounded-lg shadow ${getColor(velocityDiff, { green: 1, yellow: 0 })}`}>
        <div className="text-sm font-semibold">Team Velocity</div>
        <div className="text-2xl font-bold">{tasksCompletedThisWeek ?? 0}</div>
        <div className="text-xs">{velocityDiff > 0 ? `▲ +${velocityDiff} vs last week` : velocityDiff < 0 ? `▼ ${velocityDiff} vs last week` : 'No change'}</div>
      </div>
      <div className={`p-4 rounded-lg shadow ${getColor(efficiencyScore ?? 0, { green: 60, yellow: 30 })}`}>
        <div className="text-sm font-semibold">Efficiency Score</div>
        <div className="text-2xl font-bold">{efficiencyScore ? efficiencyScore.toFixed(1) : '--'}</div>
        <div className="text-xs">{efficiencyScore ? (efficiencyScore > 60 ? 'Efficient' : efficiencyScore > 30 ? 'Moderate' : 'Low') : ''}</div>
      </div>
    </div>
  );
};

export default TeamPerformanceCards; 