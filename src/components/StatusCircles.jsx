import React from 'react';
import './StatusCircles.css';

const Circle = ({ label, percentage, count, color }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circle-container">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="percentage">
          {percentage}%
        </text>
      </svg>
      <div className="label">{label} ({count})</div>
    </div>
  );
};

const StatusCircles = ({ stats }) => {
  // Calculate mutually exclusive counts directly from raw data
  const getExclusiveCounts = () => {
    // For testing, log the raw stats we received
    console.log('StatusCircles received stats:', stats);
    
    // Calculate cleaner counts to avoid double-counting
    // Calculate seen reports that are NOT resolved
    const seenNotResolvedCount = Math.min(
      stats.seenCount || 0, 
      (stats.unresolvedCount || 0)
    );
    
    // Calculate unseen reports that are NOT resolved
    const unseenNotResolvedCount = Math.max(
      (stats.unresolvedCount || 0) - (stats.seenCount || 0),
      0
    );
    
    // Get resolved reports count
    const resolvedCount = stats.resolvedCount || 0;
    
    // Calculate total from our exclusive categories
    const totalReports = seenNotResolvedCount + unseenNotResolvedCount + resolvedCount;
    
    console.log('StatusCircles calculated mutually exclusive counts:');
    console.log('- Seen (not resolved):', seenNotResolvedCount);
    console.log('- Unseen (not resolved):', unseenNotResolvedCount);
    console.log('- Resolved:', resolvedCount);
    console.log('- Total reports:', totalReports);
    
    return {
      seenNotResolvedCount,
      unseenNotResolvedCount,
      resolvedCount,
      totalReports: totalReports || 1 // Avoid division by zero
    };
  };
  
  // Get our clean counts
  const {
    seenNotResolvedCount,
    unseenNotResolvedCount,
    resolvedCount,
    totalReports
  } = getExclusiveCounts();
  
  // Define our categories including Unresolved/Pending
  const allMetrics = [
    {
      key: 'seenNotResolved',
      label: 'Seen',
      color: '#4caf50',
      count: seenNotResolvedCount,
      percentage: Math.round((seenNotResolvedCount / totalReports) * 100)
    },
    {
      key: 'unseenNotResolved',
      label: 'Unseen',
      color: '#f44336',
      count: unseenNotResolvedCount,
      percentage: Math.round((unseenNotResolvedCount / totalReports) * 100)
    },
    {
      key: 'resolved',
      label: 'Resolved',
      color: '#9c27b0',
      count: resolvedCount,
      percentage: Math.round((resolvedCount / totalReports) * 100)
    },
    {
      key: 'unresolved',
      label: 'Unresolved',
      color: '#ff9800',
      count: seenNotResolvedCount + unseenNotResolvedCount, // All unresolved reports
      percentage: Math.round(((seenNotResolvedCount + unseenNotResolvedCount) / totalReports) * 100)
    }
  ];
  
  console.log('StatusCircles metrics to display:', allMetrics);

  return (
    <div className="status-circles">
      {allMetrics.map(({ key, label, percentage, count, color }) => (
        <Circle key={key} label={label} percentage={percentage} count={count} color={color} />
      ))}
    </div>
  );
};

export default StatusCircles;
