# Chart.js Setup Guide for TaskTracker+

## ✅ Installation Status

Chart.js and react-chartjs-2 are already installed in your project:

```json
{
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0"
}
```

## 🚀 Quick Start

### 1. Import Required Components

```javascript
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
import { Line, Pie, Bar, Doughnut, Radar } from 'react-chartjs-2';
```

### 2. Register Chart.js Components

```javascript
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
```

### 3. Create Chart Data

```javascript
const data = {
  labels: ['Label 1', 'Label 2', 'Label 3'],
  datasets: [
    {
      label: 'Dataset',
      data: [12, 19, 3],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};
```

### 4. Configure Chart Options

```javascript
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
  },
};
```

### 5. Render the Chart

```javascript
<Line data={data} options={options} />
```

## 📊 Available Chart Types

### Pie Chart
```javascript
<Pie data={pieData} options={options} />
```

### Bar Chart
```javascript
<Bar data={barData} options={options} />
```

### Line Chart
```javascript
<Line data={lineData} options={options} />
```

### Doughnut Chart
```javascript
<Doughnut data={doughnutData} options={options} />
```

### Radar Chart
```javascript
<Radar data={radarData} options={options} />
```

## 🎨 Styling Best Practices

### Color Scheme
```javascript
const colors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
};
```

### Responsive Design
```javascript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500',
        },
      },
    },
  },
};
```

## 🔧 Commands to Run

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 File Structure

```
src/
├── components/
│   └── analytics/
│       └── TaskAnalytics.jsx          # Main analytics component
├── pages/
│   └── analytics/
│       └── AnalyticsPage.jsx          # Analytics page
└── CHARTJS_SETUP.md                   # This guide
```

## 🎯 Example Usage

### Task Status Distribution (Pie Chart)
```javascript
const statusData = {
  labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
  datasets: [{
    data: [5, 3, 12, 2],
    backgroundColor: ['#6b7280', '#2563eb', '#10b981', '#ef4444'],
  }],
};
```

### Priority Distribution (Bar Chart)
```javascript
const priorityData = {
  labels: ['Low', 'Medium', 'High'],
  datasets: [{
    label: 'Tasks by Priority',
    data: [8, 6, 4],
    backgroundColor: [
      'rgba(34, 197, 94, 0.8)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(239, 68, 68, 0.8)',
    ],
  }],
};
```

### Completion Trends (Line Chart)
```javascript
const trendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    label: 'Tasks Completed',
    data: [3, 5, 2, 8, 6, 4, 7],
    borderColor: 'rgb(34, 197, 94)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    fill: true,
  }],
};
```

## 🔄 Integration with Redux

The analytics components are designed to work with your existing Redux store:

```javascript
const { tasks, stats } = useSelector((state) => state.tasks);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(getTaskStats());
  dispatch(getTasks());
}, [dispatch]);
```

## 🎨 Customization

### Custom Tooltips
```javascript
const options = {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.parsed} tasks`;
        }
      }
    }
  }
};
```

### Custom Animations
```javascript
const options = {
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
  },
};
```

## 🚀 Next Steps

1. **Add Analytics Route**: Update your router to include the analytics page
2. **Real Data Integration**: Replace mock data with actual task completion history
3. **Advanced Charts**: Add more chart types like radar charts for team performance
4. **Interactive Features**: Add date range selectors and filtering options
5. **Export Functionality**: Add PDF/PNG export capabilities

## 📚 Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [react-chartjs-2 Documentation](https://react-chartjs-2.js.org/)
- [Chart.js Examples](https://www.chartjs.org/samples/)

## 🐛 Troubleshooting

### Common Issues

1. **Charts not rendering**: Make sure to register Chart.js components
2. **Responsive issues**: Set `maintainAspectRatio: false` and provide container height
3. **TypeScript errors**: Install `@types/chart.js` if using TypeScript

### Performance Tips

1. Use `useMemo` for chart data calculations
2. Implement proper loading states
3. Consider lazy loading for large datasets 