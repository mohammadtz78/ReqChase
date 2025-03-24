import { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import { Button, Table, Notification, Progress } from 'rsuite';
import { useNavigate } from "react-router";
import Loader from './loader';
import './app.css';
import './requirements.css';

const Requirements = ({history}) => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch requirements on load
  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    setLoading(true);
    const res = await view.getContext()
    try {
      const fetchedRequirements = await invoke('getRequirements');
      setRequirements(fetchedRequirements);
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

  return (
    <div className="requirements-container">
      <div className="requirements-header">
        <h1>User Requirements</h1>
        <Button appearance="primary" onClick={addNewRequirement}>
          Add Requirement
        </Button>
      </div>
      {loading ? <Loader/> : (
        <Table
          data={requirements}
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
          <Table.Column flexGrow={1} align="left">
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.Cell dataKey="description" className="requirements-table-cell" />
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