import React from 'react';
import { Timeline } from 'rsuite';
import './app.css';

const ActivityLog = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="activity-log">
        <h3>Activity Log</h3>
        <p>No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <Timeline>
        {logs.map((log, index) => {
          const [message, datePart] = log.split(' {{#');
          const date = datePart ? datePart.replace('#}}', '') : '';
          
          return (
            <Timeline.Item key={index}>
              <div className="activity-item">
                <div className="activity-message">{message}</div>
                <div className="activity-date">{date}</div>
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
};

export default ActivityLog; 