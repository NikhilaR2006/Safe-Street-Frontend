import React, { useEffect, useRef } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const WeeklyUploadsChart = ({ reports }) => {
  const chartRef = useRef(null);
  
  // Process data to count uploads for each day of the last week
  const processData = () => {
    const days = [];
    const counts = [];
    
    // Create array of last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format date as day name (e.g., "Mon", "Tue")
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      days.push(dayName);
      counts.push(0);
    }
    
    // Count uploads for each day
    if (reports && reports.length > 0) {
      reports.forEach(report => {
        const uploadDate = new Date(report.uploadedAt);
        // Check if the upload date is within the last 7 days
        const diffTime = today - uploadDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < 7) {
          counts[6 - diffDays]++;
        }
      });
    }
    
    return { days, counts };
  };
  
  const { days, counts } = processData();
  
  // Chart data
  const data = {
    labels: days,
    datasets: [
      {
        label: 'Number of Uploads',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Uploads in the Last Week',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            return `${value} upload${value !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Number of Uploads',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Day',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  };
  
  // Apply shadow effect after chart renders
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      
      // Add shadow effect to the chart canvas
      if (chart.canvas) {
        chart.canvas.style.filter = 'drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.2))';
      }
    }
  }, [chartRef]);
  
  return (
    <div className="weekly-uploads-chart-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: '20px' }}>Weekly Uploads</h2>
      <div className="chart-container" style={{ 
        height: '350px', 
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        margin: '0 auto'
      }}>
        <Bar 
          data={data} 
          options={options} 
          ref={chartRef}
        />
      </div>
    </div>
  );
};

export default WeeklyUploadsChart;
