import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const StatusPieChart = ({ stats }) => {
  const chartRef = useRef(null);
  
  // Get actual counts for data display - removing unused percentage calculations

  // Get actual counts for data display
  const counts = [
    stats.seenCount || 0,
    stats.unseenCount || 0,
    stats.resolvedCount || 0,
    stats.unresolvedCount || 0
  ];
  
  // Chart data
  const data = {
    labels: ['Seen', 'Unseen', 'Resolved', 'Unresolved'],
    datasets: [
      {
        // Use the actual count values for the pie chart
        data: counts,
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',  // Green for Seen
          'rgba(244, 67, 54, 0.8)',  // Red for Unseen
          'rgba(156, 39, 176, 0.8)', // Purple for Resolved
          'rgba(255, 152, 0, 0.8)',  // Orange for Unresolved
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 152, 0, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '40%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              // Get actual counts for each category
              const counts = [
                stats.seenCount || 0,
                stats.unseenCount || 0,
                stats.resolvedCount || 0,
                stats.unresolvedCount || 0
              ];
              
              // Calculate total for percentage calculation
              const total = counts.reduce((sum, count) => sum + count, 0) || 1;
              
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                const count = counts[i];
                const percentage = Math.round((count / total) * 100);
                
                return {
                  text: `${label}: ${count} (${percentage}%)`,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  hidden: isNaN(count) || meta.data[i].hidden,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const count = context.raw || 0;
            
            // Calculate total for consistent percentage calculation
            const total = [
              stats.seenCount || 0,
              stats.unseenCount || 0,
              stats.resolvedCount || 0,
              stats.unresolvedCount || 0
            ].reduce((sum, c) => sum + c, 0) || 1;
            
            // Calculate percentage based on the count
            const percentage = Math.round((count / total) * 100);
            
            return `${label}: ${count} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Apply 3D effect after chart renders
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      
      // Add 3D effect to the chart canvas
      if (chart.canvas) {
        chart.canvas.style.transform = 'perspective(1000px) rotateX(25deg)';
        chart.canvas.style.transition = 'transform 0.5s ease';
        chart.canvas.style.filter = 'drop-shadow(0px 20px 15px rgba(0, 0, 0, 0.3))';
      }
    }
  }, [chartRef]);

  return (
    <div className="status-pie-chart-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', marginTop: '40px' }}>Report Status Distribution</h2>
      
      <div className="chart-container" style={{ height: '450px', position: 'relative', marginTop: '-50px' }}>
        <Doughnut 
          data={data} 
          options={options} 
          ref={chartRef}
        />
      </div>
    </div>
  );
};

export default StatusPieChart;
