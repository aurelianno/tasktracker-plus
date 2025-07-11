import React from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

const TeamChartsSection = ({ selectedTeamId, teamAnalytics, teamWorkload, teamTrends, loading }) => {
  if (loading) return <div className="my-8">Loading charts...</div>;
  if (!teamAnalytics) return null;
  // Workload data
  const workloadData = {
    labels: teamWorkload?.workload?.map(w => w._id?.name || 'Unassigned') || [],
    datasets: [{
      data: teamWorkload?.workload?.map(w => w.count) || [],
      backgroundColor: ['#60a5fa', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#f472b6', '#facc15'],
    }]
  };
  // Productivity trend
  const trendData = {
    labels: teamTrends?.completionTrend?.map(t => t.date) || [],
    datasets: [{
      label: 'Tasks Completed',
      data: teamTrends?.completionTrend?.map(t => t.count) || [],
      fill: false,
      borderColor: '#2563eb',
      backgroundColor: '#60a5fa',
      tension: 0.3
    }]
  };
  // Status breakdown
  const statusData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
    datasets: [{
      data: [
        teamAnalytics.statusDistribution?.todo || 0,
        teamAnalytics.statusDistribution?.['in-progress'] || 0,
        teamAnalytics.statusDistribution?.completed || 0,
        teamAnalytics.statusDistribution?.overdue || 0
      ],
      backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f87171']
    }]
  };
  // Member performance
  const memberPerf = teamAnalytics.memberPerfAgg || [];
  const memberPerfData = {
    labels: memberPerf.map(m => m._id?.name || 'Unassigned'),
    datasets: [{
      label: 'Completed',
      data: memberPerf.map(m => m.completed),
      backgroundColor: '#34d399',
    }, {
      label: 'Total',
      data: memberPerf.map(m => m.total),
      backgroundColor: '#60a5fa',
    }]
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Workload Distribution</h3>
        <Doughnut data={workloadData} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Productivity Trends</h3>
        <Line data={trendData} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Status Breakdown</h3>
        <Bar data={statusData} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Member Performance</h3>
        <Bar data={memberPerfData} options={{ indexAxis: 'y' }} />
      </div>
    </div>
  );
};

export default TeamChartsSection; 