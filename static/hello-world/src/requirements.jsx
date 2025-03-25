import { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import { Button, Table, Notification, Progress, InputGroup, SelectPicker } from 'rsuite';
import { useNavigate } from "react-router";
import Loader from './loader';
import './app.css';
import './requirements.css';

const Requirements = ({history}) => {
  const [requirements, setRequirements] = useState([]);
  const [filteredRequirements, setFilteredRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [filterStage, setFilterStage] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [filterImportance, setFilterImportance] = useState(null);

  const navigate = useNavigate();

  // Fetch requirements on load
  useEffect(() => {
    fetchRequirements();
  }, []);

  // Filter requirements when requirements or filters change
  useEffect(() => {
    let filtered = requirements;
    
    if (filterType) {
      filtered = filtered.filter(req => req.type?.name === filterType);
    }
    
    if (filterStage) {
      filtered = filtered.filter(req => req.stage?.name === filterStage);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(req => req.status?.name === filterStatus);
    }
    
    if (filterPriority) {
      filtered = filtered.filter(req => req.priority === filterPriority.toLowerCase());
    }
    
    if (filterImportance) {
      filtered = filtered.filter(req => req.importance === filterImportance.toLowerCase());
    }
    
    setFilteredRequirements(filtered);
  }, [requirements, filterType, filterStage, filterStatus, filterPriority, filterImportance]);

  const fetchRequirements = async () => {
    setLoading(true);
    const res = await view.getContext()
    try {
      const fetchedRequirements = await invoke('getRequirements');
      console.log('Fetched requirements:', fetchedRequirements);
      setRequirements(fetchedRequirements);
      setFilteredRequirements(fetchedRequirements);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch requirements.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteRequirement = async (id, event) => {
    // Prevent the event from propagating to the row click handler
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    try {
      setLoading(true);

      await invoke('deleteRequirement', { id });
      await fetchRequirements();
      Notification.success({ title: 'Success', description: 'Requirement deleted successfully.' });
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to delete requirement.' });
    }
    setLoading(false);
  };

  const openRequirement = (data) => {
    navigate(`/requirement/${data?.id}`);
  };

  const addNewRequirement = () => {
    navigate('/requirement/new');
  };

  // Add priority and importance options
  const priorityColors = {
    low: '#87CEEB',
    medium: '#4682B4',
    high: '#CD5C5C',
    maximum: '#FF0000'
  };

  const importanceColors = {
    low: '#87CEEB',
    medium: '#4682B4',
    high: '#CD5C5C',
    maximum: '#FF0000'
  };

  // Get unique values for filter dropdowns
  const typeOptions = [
    { label: 'All Types', value: null },
    ...Array.from(new Set(requirements.map(req => req.type?.name)))
      .filter(Boolean)
      .map(type => ({ label: type, value: type }))
  ];
  
  const stageOptions = [
    { label: 'All Stages', value: null },
    ...Array.from(new Set(requirements.map(req => req.stage?.name)))
      .filter(Boolean)
      .map(stage => ({ label: stage, value: stage }))
  ];
  
  const statusOptions = [
    { label: 'All Statuses', value: null },
    ...Array.from(new Set(requirements.map(req => req.status?.name)))
      .filter(Boolean)
      .map(status => ({ label: status, value: status }))
  ];
  
  const priorityOptions = [
    { label: 'All Priorities', value: null },
    ...Array.from(new Set(requirements.map(req => req.priority)))
      .filter(Boolean)
      .map(priority => ({ 
        label: priority.charAt(0).toUpperCase() + priority.slice(1), 
        value: priority
      }))
  ];
  
  const importanceOptions = [
    { label: 'All Importance', value: null },
    ...Array.from(new Set(requirements.map(req => req.importance)))
      .filter(Boolean)
      .map(importance => ({ 
        label: importance.charAt(0).toUpperCase() + importance.slice(1), 
        value: importance
      }))
  ];

  return (
    <div className="requirements-container">
      <div className="requirements-header">
        <h1>User Requirements</h1>
        <Button appearance="primary" onClick={addNewRequirement}>
          Add Requirement
        </Button>
      </div>
      
      <div className="requirements-filters" style={{ 
        marginTop: '30px', 
        marginBottom: '30px', 
        padding: '20px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Type:</label>
          <SelectPicker 
            data={typeOptions}
            value={filterType}
            onChange={setFilterType}
            cleanable
            style={{ width: 150 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Stage:</label>
          <SelectPicker 
            data={stageOptions}
            value={filterStage}
            onChange={setFilterStage}
            cleanable
            style={{ width: 150 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Status:</label>
          <SelectPicker 
            data={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            cleanable
            style={{ width: 150 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Priority:</label>
          <SelectPicker 
            data={priorityOptions}
            value={filterPriority}
            onChange={setFilterPriority}
            cleanable
            style={{ width: 150 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Importance:</label>
          <SelectPicker 
            data={importanceOptions}
            value={filterImportance}
            onChange={setFilterImportance}
            cleanable
            style={{ width: 150 }}
          />
        </div>
      </div>
      
      {loading ? <Loader/> : (
        <Table
          data={filteredRequirements}
          autoHeight
          bordered
          cellBordered
          hover={true}
          onRowClick={(data) => openRequirement(data)}
          sortColumn='name'
          style={{ width: '100%' }}
          rowClassName="requirements-table-row"
        >
          <Table.Column flexGrow={1} align="left">
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.Cell dataKey="name" className="requirements-table-cell" />
          </Table.Column>
          <Table.Column flexGrow={0.6} align="left">
            <Table.HeaderCell>Assignee</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <span>
                  {rowData.assignee ? rowData.assignee.displayName : 'Unassigned'}
                </span>
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.4} align="center">
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <span 
                  className="type-tag"
                  style={{
                    backgroundColor: rowData.type?.color || '#e0e0e0',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {rowData.type?.name || '-'}
                </span>
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.4} align="center">
            <Table.HeaderCell>Stage</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <span 
                  className="stage-tag"
                  style={{
                    backgroundColor: rowData.stage?.color || '#e0e0e0',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {rowData.stage?.name || '-'}
                </span>
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.4} align="center">
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <span 
                  className="status-tag"
                  style={{
                    backgroundColor: rowData.status?.color || '#e0e0e0',
                    color: '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {rowData.status?.name || '-'}
                </span>
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.4} align="center">
            <Table.HeaderCell>Priority</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <span 
                  className="priority-tag"
                  style={{
                    backgroundColor: rowData.priority ? priorityColors[rowData.priority] : '#e0e0e0',
                    color: rowData.priority ? '#fff' : '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {rowData.priority ? (rowData.priority.charAt(0).toUpperCase() + rowData.priority.slice(1)) : '-'}
                </span>
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.4} align="center">
            <Table.HeaderCell>Importance</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <span 
                  className="importance-tag"
                  style={{
                    backgroundColor: rowData.importance ? importanceColors[rowData.importance] : '#e0e0e0',
                    color: rowData.importance ? '#fff' : '#666',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {rowData.importance ? (rowData.importance.charAt(0).toUpperCase() + rowData.importance.slice(1)) : '-'}
                </span>
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.5} align="center">
            <Table.HeaderCell>Progress</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <Progress.Line 
                  percent={rowData.progress || 0} 
                  status={rowData.progress === 100 ? 'success' : 'active'}
                  style={{ width: '100%' }}
                />
              )}
            </Table.Cell>
          </Table.Column>
          <Table.Column flexGrow={0.4} align="center" verticalAlign='middle' >
            <Table.HeaderCell>Actions</Table.HeaderCell>
            <Table.Cell>
              {rowData => (
                <Button size='xs' appearance="primary" color="red" onClick={(event) => deleteRequirement(rowData.id, event)}>
                  Delete
                </Button>
              )}
            </Table.Cell>
          </Table.Column>
        </Table>
      )}
    </div>
  )
}

export default Requirements