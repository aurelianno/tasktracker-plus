/*
  Analytics.jsx
  Personal analytics dashboard for TaskTracker+.
  - Visualizes task completion, productivity, and trends for the current user.
  - Integrates with Redux and backend analytics API for real-time data.
  - Displays KPIs, charts, insights, and recent activity.
*/
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getTaskAnalytics, getTasks } from '../../store/slices/taskSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import Navbar from '../../components/common/Navbar';
import { logout } from '../../store/slices/authSlice';
import AnalyticsCharts from '../../components/analytics/AnalyticsCharts';
import KpiCard from '../../components/analytics/KpiCard';
import InsightsPanel from '../../components/analytics/InsightsPanel';
import ActivityFeed from '../../components/analytics/ActivityFeed';
import TaskAnalytics from '../../components/analytics/TaskAnalytics';
import ProductivityHeatmap from '../../components/analytics/ProductivityHeatmap';
import MonthlyGoals from '../../components/analytics/MonthlyGoals';
import PerformanceComparison from '../../components/analytics/PerformanceComparison';
import ExportFab from '../../components/analytics/ExportFab';
import PeakPerformanceHours from '../../components/analytics/PeakPerformanceHours';
import AchievementBadges from '../../components/analytics/AchievementBadges';
import { useTheme } from '../../ThemeContext.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Analytics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const analytics = useSelector((state) => state.tasks.analytics);
  const { tasks, archivedTasks } = useSelector((state) => state.tasks);
  const [personalTasks, setPersonalTasks] = React.useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    dispatch(getTaskAnalytics());
    // Always fetch personal, non-archived tasks for analytics display
    dispatch(getTasks({ view: 'personal', isArchived: 'false' })).then(res => {
      if (res && res.payload && res.payload.tasks) {
        setPersonalTasks(res.payload.tasks);
      }
    });
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: theme === 'dark' ? '#111215' : 'transparent',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    navbar: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    },
    navContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
    },
    brandText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1e293b',
      margin: 0
    },
    enterpriseText: {
      fontSize: '11px',
      color: '#64748b',
      fontWeight: '500',
      margin: 0
    },
    navLinks: {
      display: 'flex',
      gap: '32px',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navLink: {
      color: '#475569',
      textDecoration: 'none',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'color 0.2s ease'
    },
    navLinkActive: {
      color: '#2563eb',
      fontWeight: '600',
      borderBottom: '2px solid #2563eb',
      paddingBottom: '2px'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    userInfo: {
      textAlign: 'right'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    userRole: {
      fontSize: '12px',
      color: '#64748b',
      margin: 0
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
    },
    logoutBtn: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
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
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '40px auto'
    },
    error: {
      color: '#ef4444',
      background: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid #ef4444',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      textAlign: 'center'
    },
    // NEW: Section separator styles
    sectionSeparator: {
      height: '2px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
      margin: '48px 0 32px 0',
      borderRadius: '1px'
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#1e293b',
      textAlign: 'center',
      marginBottom: '24px',
      position: 'relative'
    }
  };

  // Dynamic insights and recommendations based on analytics
  const bestDay = analytics.completionTrend && analytics.completionTrend.length
    ? analytics.completionTrend.reduce((max, d) => d.count > max.count ? d : max, analytics.completionTrend[0])
    : null;
  const overdue = analytics.statusDistribution?.overdue || 0;
  const completionRate = analytics.performance?.completionRate || 0;
  const avgCompletionTime = analytics.performance?.avgCompletionTime || null;
  const totalTasks = analytics.performance?.totalTasks || 0;
  const improvement = analytics.monthly && analytics.monthly.completed && analytics.monthly.created
    ? Math.round(((analytics.monthly.completed - analytics.monthly.created) / (analytics.monthly.created || 1)) * 100)
    : 0;

  const insights = [
    bestDay ? { icon: '🚀', text: `Best day: ${new Date(bestDay.date).toLocaleDateString(undefined, { weekday: 'long' })} (${bestDay.count} tasks completed)` } : null,
    avgCompletionTime !== null ? { icon: '⏱️', text: `Avg completion time: ${avgCompletionTime.toFixed(1)}h` } : null,
    completionRate ? { icon: '✅', text: `Completion rate: ${completionRate.toFixed(1)}%` } : null,
    improvement ? { icon: '📈', text: `This month: ${improvement > 0 ? '+' : ''}${improvement}% vs last month` } : null,
  ].filter(Boolean);

  const recommendations = [
    overdue > 0 ? { icon: '⚠️', text: `Focus on ${overdue} overdue tasks` } : null,
    totalTasks > 0 && completionRate < 70 ? { icon: '🎯', text: 'Try to increase your completion rate above 70%' } : null,
    avgCompletionTime !== null && avgCompletionTime > 24 ? { icon: '⏰', text: 'Reduce average completion time below 1 day' } : null,
  ].filter(Boolean);

  // Combine and sort tasks by updatedAt/createdAt for recent activity
  const allTasks = [...(tasks || []), ...(archivedTasks || [])];
  const recentTaskActivities = allTasks
    .flatMap(task => {
      const activities = [];
      if (task.createdAt) {
        activities.push({
          action: 'created',
          task: task.title,
          time: new Date(task.createdAt).toLocaleString(),
          icon: '➕',
          date: new Date(task.createdAt)
        });
      }
      if (task.updatedAt && task.updatedAt !== task.createdAt) {
        activities.push({
          action: 'updated',
          task: task.title,
          time: new Date(task.updatedAt).toLocaleString(),
          icon: '✏️',
          date: new Date(task.updatedAt)
        });
      }
      if (task.status === 'completed' && task.completedAt) {
        activities.push({
          action: 'completed',
          task: task.title,
          time: new Date(task.completedAt).toLocaleString(),
          icon: '✅',
          date: new Date(task.completedAt)
        });
      }
      if (task.isArchived && task.archivedAt) {
        activities.push({
          action: 'archived',
          task: task.title,
          time: new Date(task.archivedAt).toLocaleString(),
          icon: '🗂️',
          date: new Date(task.archivedAt)
        });
      }
      return activities;
    })
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  // Build velocity data for last 12 weeks from analytics.completionTrend
  let velocityData = null;
  if (analytics.completionTrend && analytics.completionTrend.length > 0) {
    // Group by week (assume completionTrend is daily for at least 84 days)
    const weeks = [];
    let weekSum = 0;
    let weekLabel = '';
    for (let i = 0; i < analytics.completionTrend.length; i++) {
      const d = analytics.completionTrend[i];
      // Start of week: every 7th day
      if (i % 7 === 0) {
        if (i > 0) {
          weeks.push({ label: weekLabel, count: weekSum });
        }
        weekSum = 0;
        weekLabel = d.label || d.date;
      }
      weekSum += d.count;
      // Last week (may be incomplete)
      if (i === analytics.completionTrend.length - 1) {
        weeks.push({ label: weekLabel, count: weekSum });
      }
    }
    // Only last 12 weeks
    const last12 = weeks.slice(-12);
    velocityData = {
      labels: last12.map(w => w.label),
      datasets: [{
        label: 'Tasks Completed',
        data: last12.map(w => w.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };
  }

  return (
    <div className="analytics-root min-h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white">
      <style>{`html, body { overflow-x: hidden !important; }`}</style>
      <Navbar user={user} handleLogout={handleLogout} />
      <ExportFab analytics={analytics} />
      <div data-analytics-dashboard style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%', boxSizing: 'border-box' }}>
        {/* Main Analytics content (KPI, charts, insights, activity) goes here */}
        {/* KPI CARDS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
          width: '100%',
        }}>
          <KpiCard
            icon="📋"
            title="Total Tasks"
            value={analytics.performance.totalTasks}
            change={analytics.kpi?.tasksCompletedDiff !== undefined ? `${analytics.kpi.tasksCompletedDiff >= 0 ? '+' : ''}${analytics.kpi.tasksCompletedDiff} this week` : ''}
            changeType={analytics.kpi?.tasksCompletedDiff > 0 ? 'positive' : analytics.kpi?.tasksCompletedDiff < 0 ? 'negative' : 'neutral'}
          />
          <KpiCard
            icon="✅"
            title="Completion Rate"
            value={`${analytics.performance.completionRate.toFixed(0)}%`}
            change={analytics.kpi?.completionRateDiff !== undefined ? `${analytics.kpi.completionRateDiff >= 0 ? '+' : ''}${analytics.kpi.completionRateDiff.toFixed(1)}% vs last month` : ''}
            changeType={analytics.kpi?.completionRateDiff > 0 ? 'positive' : analytics.kpi?.completionRateDiff < 0 ? 'negative' : 'neutral'}
          />
          <KpiCard
            icon="⚠️"
            title="Overdue Tasks"
            value={analytics.statusDistribution.overdue}
            change={analytics.kpi?.overdueDiff !== undefined ? `${analytics.kpi.overdueDiff >= 0 ? '+' : ''}${analytics.kpi.overdueDiff} from yesterday` : ''}
            changeType={analytics.kpi?.overdueDiff < 0 ? 'positive' : analytics.kpi?.overdueDiff > 0 ? 'negative' : 'neutral'}
          />
          <KpiCard
            icon="⏱️"
            title="Avg Completion Time"
            value={analytics.performance.avgCompletionTime !== null ? `${analytics.performance.avgCompletionTime.toFixed(1)}h` : '—'}
            change={''}
            changeType="positive"
          />
          {/* New KPI Cards */}
          <KpiCard
            icon="💯"
            title="Productivity Score"
            value={analytics.performance.productivityScore || '—'}
            change={analytics.performance.productivityScoreChange || ''}
            changeType={analytics.performance.productivityScoreChangeType || 'positive'}
          />
          <KpiCard
            icon="📈"
            title="Tasks This Week"
            value={analytics.kpi?.tasksCompletedThisWeek ?? '—'}
            change={analytics.kpi?.tasksCompletedDiff !== undefined ? `${analytics.kpi.tasksCompletedDiff >= 0 ? '+' : ''}${analytics.kpi.tasksCompletedDiff} vs last week` : ''}
            changeType={analytics.kpi?.tasksCompletedDiff > 0 ? 'positive' : analytics.kpi?.tasksCompletedDiff < 0 ? 'negative' : 'neutral'}
          />
          <KpiCard
            icon="📅"
            title="Avg Daily Tasks"
            value={analytics.performance.avgDailyTasks || '—'}
            change={analytics.performance.avgDailyTasksChange || ''}
            changeType={analytics.performance.avgDailyTasksChangeType || 'positive'}
          />
          <KpiCard
            icon="🔥"
            title="Current Streak"
            value={analytics.performance.currentStreak || '—'}
            change={analytics.performance.currentStreakChange || ''}
            changeType={analytics.performance.currentStreakChangeType || 'positive'}
          />
        </div>

        {/* MAIN CHARTS SECTION */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box',
          marginLeft: -80,
          marginBottom: 40,
        }}>
          {/* Productivity Heatmap and Peak Performance Hours in the same box, heatmap always shown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 340, maxWidth: 520, width: '100%' }}>
            <ProductivityHeatmap data={analytics.completionCalendar} velocityData={velocityData} />
            <div style={{ marginTop: 32, width: '100%' }}>
              <PeakPerformanceHours hourlyData={(() => {
                // Build hourlyData from completionCalendar (last 90 days)
                if (!analytics.completionCalendar) return Array(24).fill(0);
                if (!Array.isArray(analytics.completedTasksLast90Days)) return Array(24).fill(0);
                const hours = Array(24).fill(0);
                analytics.completedTasksLast90Days.forEach(task => {
                  if (task.completedAt) {
                    const hour = new Date(task.completedAt).getHours();
                    hours[hour]++;
                  }
                });
                return hours;
              })()} />
            </div>
          </div>
          <AnalyticsCharts
            statusData={{
              labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
              datasets: [{
                data: [
                  analytics.statusDistribution.todo,
                  analytics.statusDistribution['in-progress'],
                  analytics.statusDistribution.completed,
                  analytics.statusDistribution.overdue || 0
                ],
                backgroundColor: ['#6b7280', '#2563eb', '#2ecc71', '#ef4444'],
                borderColor: ['#6b7280', '#2563eb', '#2ecc71', '#ef4444'],
                borderWidth: 2
              }]
            }}
            priorityData={{
              labels: ['High', 'Medium', 'Low'],
              datasets: [{
                data: [
                  analytics.priorityDistribution.high,
                  analytics.priorityDistribution.medium,
                  analytics.priorityDistribution.low
                ],
                backgroundColor: ['#e74c3c', '#f39c12', '#2ecc71'],
                borderColor: ['#e74c3c', '#f39c12', '#2ecc71'],
                borderWidth: 2
              }]
            }}
            weeklyTrendData={{
              labels: analytics.completionTrend.map(d => d.label || d.date),
              datasets: [{
                label: 'Tasks Completed',
                data: analytics.completionTrend.map(d => d.count),
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78,205,196,0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4ecdc4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
              }]
            }}
            monthlyProgressData={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Tasks Completed',
                  data: [65, 78, 90, 81, 96, 87],
                  backgroundColor: '#45b7d1'
                },
                {
                  label: 'Tasks Created',
                  data: [70, 85, 92, 78, 94, 89],
                  backgroundColor: '#96ceb4'
                }
              ]
            }}
            chartOptions={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { usePointStyle: true }
                },
                tooltip: {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  titleColor: '#fff',
                  bodyColor: '#fff'
                }
              }
            }}
            lineChartOptions={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { usePointStyle: true }
                },
                tooltip: {
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  titleColor: '#fff',
                  bodyColor: '#fff'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.1)' },
                  ticks: { stepSize: 1 }
                },
                x: {
                  grid: { color: 'rgba(0,0,0,0.1)' }
                }
              }
            }}
          />
        </div>

        {/* PERFORMANCE COMPARISON SECTION */}
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: 24 }}>
            Performance Comparison
          </div>
          <PerformanceComparison
            thisMonth={{
              totalTasks: analytics.performance?.totalTasks ?? '—',
              completionRate: (typeof analytics.performance?.completionRate === 'number' && !isNaN(analytics.performance.completionRate)) ? analytics.performance.completionRate.toFixed(2) + '%' : '—',
              tasksCompleted: analytics.monthly?.completed ?? '—',
              productivityScore: analytics.performance?.productivityScore ?? '—'
            }}
            lastMonth={{
              totalTasks: analytics.lastMonth?.performance?.totalTasks ?? '—',
              completionRate: (typeof analytics.lastMonth?.performance?.completionRate === 'number' && !isNaN(analytics.lastMonth.performance.completionRate)) ? analytics.lastMonth.performance.completionRate.toFixed(2) + '%' : '—',
              tasksCompleted: analytics.lastMonth?.completed ?? '—',
              productivityScore: analytics.lastMonth?.performance?.productivityScore ?? '—'
            }}
          />
        </div>

        {/* MONTHLY GOALS SECTION */}
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <MonthlyGoals goals={{
            tasksGoal: analytics.monthly?.created ?? 30,
            tasksCompleted: analytics.monthly?.completed ?? 0,
            completionRateGoal: 80,
            completionRate: analytics.performance?.completionRate ?? 0
          }} />
        </div>

        {/* INSIGHTS SECTION - Now clearly separated */}
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <InsightsPanel
            insights={insights}
            recommendations={recommendations}
          />
        </div>

        {/* ACTIVITY SECTION - Also clearly separated */}
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <ActivityFeed activities={recentTaskActivities} />
        </div>

        {/* Loading and Error States */}
        {analytics.analyticsLoading && (
          <div style={styles.loadingSpinner}></div>
        )}
        {analytics.analyticsError && (
          <div style={styles.error}>{analytics.analyticsError}</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;