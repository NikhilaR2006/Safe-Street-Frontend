import React, { useState } from 'react';
import ReportsTable from '../components/ReportsTable';
import ReportDetailCard from '../components/ReportDetailCard';
import '../components/ReportDetailCard.css';

const ReportsPage = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      profile: 'https://t4.ftcdn.net/jpg/13/52/79/05/360_F_1352790598_0zmu2UfeR328Dw53Zgeu1IJzOTMsL9vI.jpg',
      username: 'john_doe',
      date: '2025-04-05',
      time: '14:35',
      status: 'Unseen',
      description: 'Large pothole near signal.',
      location: 'MG Road, Bangalore',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUWageVSRjau6EoYNRyWBUx5oeMAevWgFtQA&s',
      predictedImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGcap01PcLPzOdtUTeSdiWznJ_323SrYlTZQ&s',
      predicted: false,
    },
    {
      id: 2,
      profile: 'https://t4.ftcdn.net/jpg/13/52/79/05/360_F_1352790598_0zmu2UfeR328Dw53Zgeu1IJzOTMsL9vI.jpg',
      username: 'jane_smith',
      date: '2025-04-04',
      time: '11:20',
      status: 'Unseen',
      description: 'Crack on the left lane.',
      location: 'JP Nagar, Bangalore',
      image: 'https://via.placeholder.com/400x200',
      predictedImage: 'https://via.placeholder.com/400x200/ff4444/ffffff?text=Predicted+Boxes',
      predicted: false,
    },
    {
      id: 3,
      profile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1l64sXWUQ47qMGOVXiOjl5p4xUGTeOOWjSuJN1lhl_qQVHP59r18ln7gAMHhNOvIHEss&usqp=CAU0',
      username: 'rajesh_k',
      date: '2025-04-03',
      time: '16:45',
      status: 'Unseen',
      description: 'Road worn out near metro station.',
      location: 'Indiranagar, Bangalore',
      image: 'https://via.placeholder.com/400x200',
      predictedImage: 'https://via.placeholder.com/400x200/ff4444/ffffff?text=Predicted+Boxes',
      predicted: false,
    },
    {
      id: 4,
      profile: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740',
      username: 'anita_rao',
      date: '2025-04-02',
      time: '10:05',
      status: 'Unseen',
      description: 'Surface cracks forming daily.',
      location: 'Koramangala, Bangalore',
      image: 'https://via.placeholder.com/400x200',
      predictedImage: 'https://via.placeholder.com/400x200/ff4444/ffffff?text=Predicted+Boxes',
      predicted: false,
    },
    {
      id: 5,
      profile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1l64sXWUQ47qMGOVXiOjl5p4xUGTeOOWjSuJN1lhl_qQVHP59r18ln7gAMHhNOvIHEss&usqp=CAU',
      username: 'naveen_m',
      date: '2025-04-01',
      time: '09:50',
      status: 'Unseen',
      description: 'Pothole keeps getting bigger.',
      location: 'Hebbal, Bangalore',
      image: 'https://via.placeholder.com/400x200',
      predictedImage: 'https://via.placeholder.com/400x200/ff4444/ffffff?text=Predicted+Boxes',
      predicted: false,
    },
  ]);

  const [selectedReportId, setSelectedReportId] = useState(null);

  const handleView = (id) => {
    setSelectedReportId(id);
  };

  const handleClose = () => {
    setSelectedReportId(null);
  };

  const handlePredict = (id) => {
    const updatedReports = reports.map((report) =>
      report.id === id ? { ...report, predicted: true, status: 'Seen' } : report
    );
    setReports(updatedReports);
    // Optionally, make a backend call here if these reports are fetched from the backend in production
  };

  const selectedReport = reports.find((r) => r.id === selectedReportId);

  return (
    <div style={{ position: 'relative' }}>
      <ReportsTable reports={reports} onView={handleView} />
      {selectedReport && (
        <div className="report-detail-wrapper">
          <ReportDetailCard
            report={selectedReport}
            onClose={handleClose}
            onPredict={() => handlePredict(selectedReport.id)}
          />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

