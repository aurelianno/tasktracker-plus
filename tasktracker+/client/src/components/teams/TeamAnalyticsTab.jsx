/*
  TeamAnalyticsTab.jsx
  Team analytics dashboard tab for TaskTracker+.
  - Visualizes team performance, workload, and member insights for the selected team.
  - Integrates with Redux and backend analytics API for real-time team data.
  - Displays KPIs, charts, insights, and member selector for admins/owners.
*/
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeamAnalytics, getTeamWorkload, getTeamTrends, getTeamMemberAnalytics, setSelectedMember } from '../../store/slices/taskAssignmentSlice';
import { Pie, Bar, Line } from 'react-chartjs-2';
import ProductivityHeatmap from '../analytics/ProductivityHeatmap';
import { isTeamAdmin } from '../../utils/roleValidation';
import { useTheme } from '../../ThemeContext.jsx';

// Utility: Generate a unique color for a string (e.g., member name)
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

const TeamAnalyticsTab = ({ selectedTeamId }) => {
  const dispatch = useDispatch();
  const { teamAnalytics, teamWorkload, teamTrends, teamMemberAnalytics, selectedMemberId, analyticsLoading } = useSelector((state) => state.taskAssignment);
  const { teams, currentTeam } = useSelector((state) => state.teams);
  const { user } = useSelector((state) => state.auth);
  
  const team = teams?.find(t => t._id === selectedTeamId) || currentTeam;
  // Find the current user's membership in the team
  let myMember = team?.members?.find(m => {
    // Support both string and object for m.userId
    const memberId = typeof m.userId === 'object' ? m.userId._id : m.userId;
    return memberId === user?._id || memberId === user?.id;
  });
  // Best practice: If not found, but user is team creator (by _id or id), treat as owner
  if (!myMember && (team?.createdBy === user?._id || team?.createdBy === user?.id)) {
    myMember = { userId: user._id || user.id, role: 'owner' };
  }
  const myRole = myMember?.role || 'collaborator';
  // Use computed myRole for access checks, not just user.role
  const canViewIndividualAnalytics = myRole === 'admin' || myRole === 'owner';

  const showMemberSelector = canViewIndividualAnalytics && team?.members?.length > 0;

  useEffect(() => {
    if (selectedTeamId) {
      dispatch(getTeamAnalytics(selectedTeamId));
      dispatch(getTeamWorkload(selectedTeamId));
      dispatch(getTeamTrends(selectedTeamId));
    }
  }, [dispatch, selectedTeamId]);

  useEffect(() => {
    if (selectedMemberId && selectedTeamId && canViewIndividualAnalytics) {
      dispatch(getTeamMemberAnalytics({ teamId: selectedTeamId, memberId: selectedMemberId }));
    }
  }, [dispatch, selectedTeamId, selectedMemberId, canViewIndividualAnalytics]);

  const handleMemberSelect = (memberId) => {
    if (memberId === selectedMemberId) {
      dispatch(setSelectedMember(null)); // Deselect if clicking the same member
    } else {
      dispatch(setSelectedMember(memberId));
    }
  };

  if (!selectedTeamId || !team) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: '#64748b',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        Select a team to view analytics.
      </div>
    );
  }

  // Determine which analytics to show
  const analyticsData = selectedMemberId && teamMemberAnalytics ? teamMemberAnalytics : teamAnalytics;
  const isShowingMemberAnalytics = selectedMemberId && teamMemberAnalytics;

  // Prepare chart data
  const statusData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [
          analyticsData?.statusDistribution?.todo || 0,
          analyticsData?.statusDistribution?.['in-progress'] || 0,
          analyticsData?.statusDistribution?.completed || 0,
          analyticsData?.statusDistribution?.overdue || 0,
        ],
        backgroundColor: ['#6b7280', '#2563eb', '#10b981', '#ef4444'],
        borderColor: ['#4b5563', '#1d4ed8', '#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const completionTrendData = {
    labels: (isShowingMemberAnalytics ? teamMemberAnalytics?.completionTrend : teamTrends?.completionTrend)?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Tasks Completed',
        data: (isShowingMemberAnalytics ? teamMemberAnalytics?.completionTrend : teamTrends?.completionTrend)?.map(d => d.count) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Priority distribution (for member analytics)
  const priorityData = isShowingMemberAnalytics ? {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [
          teamMemberAnalytics?.priorityDistribution?.low || 0,
          teamMemberAnalytics?.priorityDistribution?.medium || 0,
          teamMemberAnalytics?.priorityDistribution?.high || 0,
          teamMemberAnalytics?.priorityDistribution?.critical || 0,
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#7c3aed'],
        borderColor: ['#059669', '#d97706', '#dc2626', '#6d28d9'],
        borderWidth: 2,
      },
    ],
  } : null;

  // Member performance comparison (only for team analytics, owner/admin only)
  const memberPerf = teamAnalytics?.memberPerfAgg || [];
  const memberPerfData = {
    labels: memberPerf.map(m => m._id?.name || 'Unassigned'),
    datasets: [
      {
        label: 'Completed',
        data: memberPerf.map(m => m.completed),
        backgroundColor: '#10b981',
      },
      {
        label: 'Total',
        data: memberPerf.map(m => m.total),
        backgroundColor: '#2563eb',
      },
    ],
  };

  // My performance in team
  const myPerf = memberPerf.find(m => (m._id?._id || m._id) === user?._id);

  // Generate insights and recommendations
  const generateInsights = () => {
    const totalTasks = (analyticsData?.statusDistribution?.todo || 0) +
      (analyticsData?.statusDistribution?.['in-progress'] || 0) +
      (analyticsData?.statusDistribution?.completed || 0) +
      (analyticsData?.statusDistribution?.overdue || 0);
    const completedTasks = analyticsData?.statusDistribution?.completed || 0;
    const overdueTasks = analyticsData?.statusDistribution?.overdue || 0;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    
    const insights = [];
    if (isShowingMemberAnalytics) {
      const memberName = teamMemberAnalytics?.member?.name || 'Member';
      if (completionRate > 70) {
        insights.push({ icon: '🚀', text: `${memberName} is highly productive! Tasks are being completed efficiently.` });
      } else if (completionRate > 50) {
        insights.push({ icon: '📈', text: `Good progress by ${memberName}! Focus on completing pending tasks.` });
      } else {
        insights.push({ icon: '💪', text: `${memberName} can improve. Focus on task completion strategies.` });
      }
    } else {
      if (completionRate > 70) {
        insights.push({ icon: '🚀', text: "Team is highly productive! Tasks are being completed efficiently." });
      } else if (completionRate > 50) {
        insights.push({ icon: '📈', text: "Good team progress! Focus on completing pending tasks." });
      } else {
        insights.push({ icon: '💪', text: "Team can improve. Focus on task completion strategies." });
      }
    }
    
    if (overdueTasks > 0) {
      insights.push({ icon: '⚠️', text: `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''} need${overdueTasks === 1 ? 's' : ''} immediate attention.` });
    } else {
      insights.push({ icon: '✅', text: "No overdue tasks. Great job!" });
    }
    return insights;
  };

  const generateRecommendations = () => {
    const recommendations = [];
    const overdueTasks = analyticsData?.statusDistribution?.overdue || 0;
    const inProgressTasks = analyticsData?.statusDistribution?.['in-progress'] || 0;
    const highPriorityTasks = analyticsData?.priorityDistribution?.high || 0;
    
    if (isShowingMemberAnalytics) {
      const memberName = teamMemberAnalytics?.member?.name || 'Member';
      if (overdueTasks > 0) {
        recommendations.push({ icon: '🎯', text: `${memberName} should prioritize overdue tasks` });
      }
      if (inProgressTasks > 5) {
        recommendations.push({ icon: '📋', text: `${memberName} has too many tasks in progress. Focus on completing them` });
      }
      if (highPriorityTasks > 2) {
        recommendations.push({ icon: '🚨', text: `${memberName} should break down high-priority tasks into smaller steps` });
      }
    } else {
      if (overdueTasks > 0) {
        recommendations.push({ icon: '🎯', text: "Prioritize overdue tasks as a team" });
      }
      if (inProgressTasks > 10) {
        recommendations.push({ icon: '📋', text: "Too many tasks in progress. Focus on completing them before starting new ones" });
      }
      if (highPriorityTasks > 3) {
        recommendations.push({ icon: '🚨', text: "Break down high-priority tasks into smaller, manageable steps" });
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push({ icon: '🌟', text: isShowingMemberAnalytics ? "Keep up the great work!" : "Team is on track! Keep up the great work" });
    }
    return recommendations;
  };

  const insights = generateInsights();
  const recommendations = generateRecommendations();

  const { theme } = useTheme();
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' }, ticks: { stepSize: 1 } },
      x: { grid: { color: 'rgba(0,0,0,0.1)' } },
    },
  };

  // --- Member Selector Bar (Admins/Owners Only) ---

  const styles = {
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    headerSubtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0
    },
    memberSelector: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    memberCard: {
      padding: '12px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    memberCardSelected: {
      borderColor: '#2563eb',
      background: 'rgba(37, 99, 235, 0.1)',
      color: '#2563eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    },
    memberCardHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    teamCard: {
      padding: '12px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    teamCardSelected: {
      borderColor: '#10b981',
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
      width: '100%'
    },
    kpiCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    kpiIcon: {
      fontSize: '24px',
      marginBottom: '12px'
    },
    kpiTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '8px'
    },
    kpiValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '4px'
    },
    kpiChange: {
      fontSize: '12px',
      color: '#10b981',
      fontWeight: '500'
    },
    myPerformanceCard: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      marginBottom: '32px',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
      width: '100%'
    },
    chartContainer: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.08)',
      width: '100%',
      boxSizing: 'border-box'
    },
    chartTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px',
      textAlign: 'center'
    },
    chartWrapper: {
      height: '300px',
      position: 'relative'
    },
    insightsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    insightsBox: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
    },
    recommendationsBox: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '16px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    insightItem: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '8px',
      fontSize: '14px',
      lineHeight: '1.5',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ ...styles.header, border: `1.5px solid ${borderColor}` }}>
        <h1 style={styles.headerTitle}>
          {isShowingMemberAnalytics 
            ? `${teamMemberAnalytics?.member?.name || 'Member'} Analytics` 
            : `Team Analytics - ${team.name}`
          }
        </h1>
        <p style={styles.headerSubtitle}>
          {isShowingMemberAnalytics 
            ? `Individual performance insights for ${teamMemberAnalytics?.member?.name || 'team member'}`
            : 'Track your team\'s performance and productivity'
          }
        </p>

        {/* Member Selector Bar */}
        {showMemberSelector ? (
          <div style={{
            display: 'flex',
            gap: '12px',
            margin: '56px 0 24px 0',
            overflowX: 'auto',
            paddingBottom: 8,
          }}>
            {/* Team Button */}
            <button
              key="team"
              onClick={() => handleMemberSelect(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 999,
                border: 'none',
                background: !selectedMemberId ? 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)' : '#f3f4f6',
                color: !selectedMemberId ? 'white' : '#1e293b',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: !selectedMemberId ? '0 2px 8px rgba(37,99,235,0.10)' : 'none',
                cursor: 'pointer',
                outline: 'none',
                borderWidth: !selectedMemberId ? 2 : 1,
                borderColor: !selectedMemberId ? '#1d4ed8' : '#e5e7eb',
                transition: 'all 0.15s',
              }}
              aria-label="Show team analytics"
            >
              <span style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                marginRight: 6,
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)'
              }}>👥</span>
              Team
            </button>
            {/* Member Buttons */}
            {team.members.map(member => {
              const key = member._id || (typeof member.userId === 'object' ? member.userId._id : String(member.userId)) + '-' + member.role;
              // Handle both populated and unpopulated member data
              const name = member.userId?.name || (typeof member.userId === 'string' ? 'Loading...' : 'Unknown Member');
              const id = typeof member.userId === 'object' ? member.userId._id : member.userId;
              const color = stringToColor(name);
              const selected = selectedMemberId === id;
              return (
                <button
                  key={key}
                  onClick={() => handleMemberSelect(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 9999,
                    border: selected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    background: selected ? '#eff6ff' : '#fff',
                    color: selected ? '#2563eb' : '#111',
                    fontWeight: selected ? 600 : 400,
                    padding: '6px 16px',
                    cursor: 'pointer',
                    boxShadow: selected ? '0 2px 8px rgba(37,99,235,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    marginRight: 8,
                  }}>{name[0]?.toUpperCase() || '?'}</span>
                  {name}
                </button>
              );
            })}
          </div>
        ) : (
          <>
          </>
        )}
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.kpiIcon}>📊</div>
          <div style={styles.kpiTitle}>Completion Rate</div>
          <div style={styles.kpiValue}>{analyticsData?.completionRate?.toFixed(1) || '--'}%</div>
          <div style={styles.kpiChange}>
            {analyticsData?.completionRate >= 80 ? 'Excellent' : analyticsData?.completionRate >= 50 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>
        <div style={{ ...styles.kpiCard, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.kpiIcon}>⏱️</div>
          <div style={styles.kpiTitle}>Avg Completion Time</div>
          <div style={styles.kpiValue}>
            {analyticsData?.avgCompletionTime ? analyticsData.avgCompletionTime.toFixed(1) + 'h' : '--'}
          </div>
          <div style={styles.kpiChange}>
            {analyticsData?.avgCompletionTime < 12 ? 'Fast' : analyticsData?.avgCompletionTime < 24 ? 'Average' : 'Slow'}
          </div>
        </div>
        <div style={{ ...styles.kpiCard, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.kpiIcon}>🚀</div>
          <div style={styles.kpiTitle}>
            {isShowingMemberAnalytics ? 'Tasks This Week' : 'Team Velocity'}
          </div>
          <div style={styles.kpiValue}>
            {isShowingMemberAnalytics 
              ? teamMemberAnalytics?.tasksCompletedThisWeek ?? 0
              : analyticsData?.tasksCompletedThisWeek ?? 0
            }
          </div>
          <div style={styles.kpiChange}>
            {isShowingMemberAnalytics 
              ? (teamMemberAnalytics?.tasksCompletedThisWeek > teamMemberAnalytics?.tasksCompletedLastWeek ? '▲ Improving' : '▼ Declining')
              : (analyticsData?.tasksCompletedThisWeek > analyticsData?.tasksCompletedLastWeek ? '▲ Improving' : '▼ Declining')
            }
          </div>
        </div>
        <div style={{ ...styles.kpiCard, border: `1.5px solid ${borderColor}` }}>
          <div style={styles.kpiIcon}>💯</div>
          <div style={styles.kpiTitle}>Efficiency Score</div>
          <div style={styles.kpiValue}>{analyticsData?.efficiencyScore ? analyticsData.efficiencyScore.toFixed(1) : '--'}</div>
          <div style={styles.kpiChange}>
            {analyticsData?.efficiencyScore > 60 ? 'Efficient' : analyticsData?.efficiencyScore > 30 ? 'Moderate' : 'Low'}
          </div>
        </div>
      </div>

      {/* My Performance Card (only for team view) */}
      {!isShowingMemberAnalytics && myPerf && (
        <div style={styles.myPerformanceCard}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>My Performance in Team</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <div><span style={{ fontWeight: '600' }}>Completed:</span> {myPerf.completed}</div>
            <div><span style={{ fontWeight: '600' }}>Total:</span> {myPerf.total}</div>
            <div><span style={{ fontWeight: '600' }}>Completion Rate:</span> {myPerf.total > 0 ? ((myPerf.completed / myPerf.total) * 100).toFixed(1) + '%' : '--'}</div>
            <div><span style={{ fontWeight: '600' }}>Role:</span> {myRole}</div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        <div style={{ ...styles.chartContainer, border: `1.5px solid ${borderColor}` }}>
          <h3 style={styles.chartTitle}>Task Status Distribution</h3>
          <div style={styles.chartWrapper}>
            <Pie data={statusData} options={chartOptions} />
          </div>
        </div>
        <div style={{ ...styles.chartContainer, border: `1.5px solid ${borderColor}` }}>
          <h3 style={styles.chartTitle}>Completion Trends (Last 7 Days)</h3>
          <div style={styles.chartWrapper}>
            <Line data={completionTrendData} options={lineChartOptions} />
          </div>
        </div>
        {/* Priority Distribution (for member analytics) */}
        {isShowingMemberAnalytics && priorityData && (
          <div style={{ ...styles.chartContainer, border: `1.5px solid ${borderColor}` }}>
            <h3 style={styles.chartTitle}>Priority Distribution</h3>
            <div style={styles.chartWrapper}>
              <Pie data={priorityData} options={chartOptions} />
            </div>
          </div>
        )}
        {/* Member Performance Comparison (only for team analytics, owner/admin only) */}
        {!isShowingMemberAnalytics && canViewIndividualAnalytics && (
          <div style={{ ...styles.chartContainer, gridColumn: 'span 2', border: `1.5px solid ${borderColor}` }}>
            <h3 style={styles.chartTitle}>Member Performance Comparison</h3>
            <div style={styles.chartWrapper}>
              <Bar data={memberPerfData} options={{ ...chartOptions, indexAxis: 'y' }} />
            </div>
          </div>
        )}
      </div>

      {/* Productivity Heatmap (if available) */}
      {teamAnalytics?.completionCalendar && teamAnalytics.completionCalendar.length > 0 && !isShowingMemberAnalytics && (
        <div style={{ marginBottom: '32px' }}>
          <ProductivityHeatmap data={teamAnalytics.completionCalendar} />
        </div>
      )}

      {/* Insights and Recommendations */}
      <div style={styles.insightsGrid}>
        <div style={styles.insightsBox}>
          <h3 style={styles.sectionTitle}>
            {isShowingMemberAnalytics ? '📊 Member Insights' : '📊 Team Insights'}
          </h3>
          <div>
            {insights.map((insight, idx) => (
              <div key={idx} style={styles.insightItem}>
                <span style={{ marginRight: '8px' }}>{insight.icon}</span>
                {insight.text}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.recommendationsBox}>
          <h3 style={styles.sectionTitle}>
            {isShowingMemberAnalytics ? '💡 Member Recommendations' : '💡 Recommendations'}
          </h3>
          <div>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={styles.insightItem}>
                <span style={{ marginRight: '8px' }}>{rec.icon}</span>
                {rec.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalyticsTab; 