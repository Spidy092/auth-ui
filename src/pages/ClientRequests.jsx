import { useState, useEffect } from 'react';
import { auth } from '@spidy092/auth-client';
import RequestCard from '../components/RequestCard';
import ApprovalModal from '../components/ApprovalModal';
import RejectionModal from '../components/RejectionModal';
import './ClientRequests.css';

export default function ClientRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadRequests();
    loadStats();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await auth.api.get(`/auth/admin/client-requests?status=${filter}`);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
      // You could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        auth.api.get('/auth/admin/client-requests?status=pending'),
        auth.api.get('/auth/admin/client-requests?status=approved'),
        auth.api.get('/auth/admin/client-requests?status=rejected')
      ]);
      
      setStats({
        pending: pending.data.requests.length,
        approved: approved.data.requests.length,
        rejected: rejected.data.requests.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const confirmApproval = async () => {
    try {
      await auth.api.post(`/auth/admin/client-requests/${selectedRequest.id}/approve`);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      loadRequests();
      loadStats();
      
      // Show success message
      console.log('Request approved successfully');
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const confirmRejection = async (reason) => {
    try {
      await auth.api.post(`/auth/admin/client-requests/${selectedRequest.id}/reject`, { reason });
      setShowRejectionModal(false);
      setSelectedRequest(null);
      loadRequests();
      loadStats();
      
      console.log('Request rejected successfully');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading client requests...</div>
      </div>
    );
  }

  return (
    <div className="client-requests-page">
      <div className="page-header">
        <h1>Client Registration Requests</h1>
        <div className="stats-bar">
          <div className="stat-item pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['pending', 'approved', 'rejected', 'all'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && stats[status] > 0 && (
              <span className="tab-badge">{stats[status]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="requests-container">
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No {filter === 'all' ? '' : filter} requests found</h3>
            <p>
              {filter === 'pending' 
                ? 'All caught up! No pending requests to review.' 
                : `No ${filter} requests at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request)}
                onReject={() => handleReject(request)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showApprovalModal && (
        <ApprovalModal
          request={selectedRequest}
          onConfirm={confirmApproval}
          onCancel={() => setShowApprovalModal(false)}
        />
      )}

      {showRejectionModal && (
        <RejectionModal
          request={selectedRequest}
          onConfirm={confirmRejection}
          onCancel={() => setShowRejectionModal(false)}
        />
      )}
    </div>
  );
}
