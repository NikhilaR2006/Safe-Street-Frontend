import React from 'react';
import StatusCircles from '../components/StatusCircles';

const Status = () => {
  const stats = {
    seen: 60,
    unseen: 40,
    reviewed: 45,
    pending: 30,
    resolved: 25,
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.row}>
        <StatusCircles stats={{ seen: stats.seen, unseen: stats.unseen }} />
      </div>
      <div style={styles.row}>
        <StatusCircles stats={{ reviewed: stats.reviewed, pending: stats.pending, resolved: stats.resolved }} />
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: '60px 60px',
    display: 'flex',
    flexDirection: 'column',
    gap: '60px',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '80px',
    width: '100%',
    maxWidth: '1200px',
  },
};

export default Status;
