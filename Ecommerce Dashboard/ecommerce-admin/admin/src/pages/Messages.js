import React, { useState, useEffect } from 'react';
import { 
  FiMail, 
  FiSend,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCornerUpLeft,
  FiTrash2,
  FiArchive,
  FiStar,
  FiClock,
  FiUser,
  FiCheck,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const Messages = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: ''
  });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ unread: 0, read: 0, replied: 0, total: 0 });

  // Fetch enquiries from API
  useEffect(() => {
    fetchEnquiries();
  }, [filterStatus, searchTerm]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      // Only add search param if search term is not empty
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }

      const response = await apiClient.get('/messages/enquiries', { params });

      if (response.data.success) {
        // Transform the data to match our existing structure
        const transformedMessages = response.data.data.map(enquiry => ({
          id: enquiry.id,
          from: enquiry.email,
          fromName: enquiry.name,
          subject: enquiry.subject,
          content: enquiry.message,
          timestamp: enquiry.created_at,
          status: enquiry.status,
          priority: 'medium',
          type: 'customer_inquiry',
          phone: enquiry.phone,
          admin_notes: enquiry.admin_notes
        }));
        
        setMessages(transformedMessages);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages;

  const unreadCount = stats.unread;

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    
    // Mark as read in the backend
    if (message.status === 'unread') {
      try {
        await apiClient.get(`/messages/enquiries/${message.id}`);
        
        // Update local state
        setMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, status: 'read' } : m
        ));
        setStats(prev => ({ ...prev, unread: prev.unread - 1, read: prev.read + 1 }));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleReplyToEnquiry = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSending(true);
    try {
      const response = await apiClient.post(
        `/messages/enquiries/${selectedMessage.id}/reply`,
        {
          reply_message: replyMessage,
          admin_name: 'Admin Support'
        }
      );

      if (response.data.success) {
        toast.success('Reply sent successfully!');
        setReplyOpen(false);
        setReplyMessage('');
        
        // Update the message status
        setMessages(prev => prev.map(m => 
          m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
        ));
        setSelectedMessage(prev => ({ ...prev, status: 'replied' }));
        setStats(prev => ({ ...prev, replied: prev.replied + 1 }));
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.error || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    
    try {
      // Send email via API
      const response = await apiClient.post('/messages/send', {
        to: newMessage.to,
        subject: newMessage.subject,
        content: newMessage.content,
        admin_name: 'System Administrator'
      });

      if (response.data.success) {
        // Create a new message object for local display
        const newMsg = {
          id: Date.now(),
          from: 'admin@ecommerce.com',
          fromName: 'System Administrator',
          subject: newMessage.subject,
          content: newMessage.content,
          timestamp: new Date().toISOString(),
          status: 'sent',
          priority: 'medium',
          type: 'outgoing_message',
          to: newMessage.to
        };

        // Add the new message to the messages list
        setMessages(prev => [newMsg, ...prev]);
        
        // Show success message
        toast.success(`Email sent successfully to ${newMessage.to}`);
        
        // Close compose modal and reset form
        setComposeOpen(false);
        setNewMessage({ to: '', subject: '', content: '' });
      } else {
        toast.error(response.data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to send email. Please check your internet connection.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      const response = await apiClient.delete(
        `/messages/enquiries/${messageId}`
      );

      if (response.data.success) {
        toast.success('Enquiry deleted successfully');
        setMessages(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
        // Refresh stats
        fetchEnquiries();
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('Failed to delete enquiry');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'customer_inquiry': return <FiUser />;
      case 'payment_issue': return <FiCheckCircle />;
      case 'return_request': return <FiArchive />;
      case 'bulk_order': return <FiStar />;
      case 'system_notification': return <FiMail />;
      default: return <FiMail />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Manage customer communications and support requests</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Messages List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Inbox ({unreadCount} unread)</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setComposeOpen(true)}
            >
              <FiSend />
              Compose
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <FiSearch style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="form-input"
                  style={{ paddingLeft: '35px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={`btn ${filterStatus === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus('unread')}
              >
                Unread
              </button>
              <button 
                className={`btn ${filterStatus === 'read' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus('read')}
              >
                Read
              </button>
              <button 
                className={`btn ${filterStatus === 'replied' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterStatus('replied')}
              >
                Replied
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <p>Loading enquiries...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <p>No enquiries found</p>
              </div>
            ) : (
              filteredMessages.map(message => (
              <div
                key={message.id}
                className="message-item"
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  background: selectedMessage?.id === message.id ? '#f8fafc' : 
                    message.type === 'outgoing_message' ? '#f0f9ff' : 'white',
                  borderLeft: message.status === 'unread' ? '4px solid #3b82f6' : '4px solid transparent'
                }}
                onClick={() => handleMessageClick(message)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getTypeIcon(message.type)}
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {message.type === 'outgoing_message' ? `To: ${message.to}` : message.fromName}
                    </span>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getPriorityColor(message.priority)
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(message.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: '14px', 
                  fontWeight: message.status === 'unread' ? '600' : '500',
                  color: message.status === 'unread' ? '#1e293b' : '#64748b'
                }}>
                  {message.subject}
                </h4>
                
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#64748b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {message.content}
                </p>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="card">
          {selectedMessage ? (
            <>
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>{selectedMessage.subject}</h3>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: selectedMessage.status === 'unread' ? '#3b82f6' : 
                                selectedMessage.status === 'replied' ? '#10b981' : '#6b7280',
                      color: 'white'
                    }}>
                      {selectedMessage.status}
                    </div>
                  </div>
                  <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                    From: {selectedMessage.fromName} ({selectedMessage.from})
                    {selectedMessage.phone && ` • Phone: ${selectedMessage.phone}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setReplyOpen(true)}
                  >
                    <FiCornerUpLeft />
                    Reply
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getTypeIcon(selectedMessage.type)}
                      <span style={{ fontWeight: '600' }}>{selectedMessage.fromName}</span>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: getPriorityColor(selectedMessage.priority) + '20',
                        color: getPriorityColor(selectedMessage.priority)
                      }}>
                        {selectedMessage.priority.toUpperCase()}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      <FiClock style={{ marginRight: '5px' }} />
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ margin: 0, lineHeight: '1.6', color: '#374151' }}>
                      {selectedMessage.content}
                    </p>
                  </div>

                  {/* Admin Notes Section */}
                  {selectedMessage.admin_notes && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                        Admin Notes:
                      </h4>
                      <div style={{
                        padding: '15px',
                        background: '#fef3c7',
                        borderRadius: '8px',
                        border: '1px solid #fcd34d'
                      }}>
                        <p style={{ margin: 0, lineHeight: '1.6', color: '#78350f', whiteSpace: 'pre-wrap' }}>
                          {selectedMessage.admin_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <FiMail style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }} />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">Compose Message</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setComposeOpen(false)}
              >
                <FiX />
                Close
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">To</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newMessage.to}
                    onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Enter subject"
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input"
                    rows={8}
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    placeholder="Enter your message"
                    required
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    {newMessage.content.length} characters
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setComposeOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending}
                  >
                    <FiSend />
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyOpen && selectedMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">Reply to {selectedMessage.fromName}</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setReplyOpen(false)}
              >
                <FiX />
                Close
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b' }}>Original Message:</h4>
                <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>{selectedMessage.subject}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>{selectedMessage.content}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Your Reply</label>
                <textarea
                  className="form-input"
                  rows={8}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  required
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Reply will be sent to: {selectedMessage.from}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReplyOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReplyToEnquiry}
                  disabled={sending}
                >
                  <FiSend />
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
