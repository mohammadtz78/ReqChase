import { useState, useEffect } from 'react';
import { Table } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

import Loader from './loader';
import { invoke } from '@forge/bridge';

const dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Add priority colors the same as in requirements.jsx
    const priorityColors = {
        low: '#87CEEB',
        medium: '#4682B4',
        high: '#CD5C5C',
        maximum: '#FF0000'
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        try {
            const data = await invoke('getDashboardData');
            setData(data?.data || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    }

    // Custom row class function to style parent rows
    const rowClassName = (rowData) => {
        return rowData?.children && rowData?.children?.length ? 'parent-row' : '';
    };

    return (
        <div>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <h5>Dashboard</h5>
                    <br />
                    <Table 
                        data={data} 
                        bordered 
                        cellBordered 
                        isTree 
                        rowKey="id" 
                        rowClassName={rowClassName}
                        minHeight={400}
                    >
                        <Column flexGrow={1}>
                            <HeaderCell>Name</HeaderCell>
                            <Cell dataKey='name' />
                        </Column>
                        <Column flexGrow={2}>
                            <HeaderCell>Description</HeaderCell>
                            <Cell dataKey='description' />
                        </Column>
                        <Column flexGrow={1}>
                            <HeaderCell>Assignee</HeaderCell>
                            <Cell>
                                {rowData => (
                                    <span>
                                        {rowData.assignee ? rowData.assignee.displayName : 'Unassigned'}
                                    </span>
                                )}
                            </Cell>
                        </Column>
                        <Column flexGrow={1}>
                            <HeaderCell>Status</HeaderCell>
                            <Cell>
                                {rowData => (
                                    <span 
                                        className="status-tag"
                                        style={{
                                            backgroundColor: rowData.status?.color || '#e2e2e2',
                                            color: '#666',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {rowData.status?.name || '-'}
                                    </span>
                                )}
                            </Cell>
                        </Column>
                        <Column flexGrow={1}>
                            <HeaderCell>Priority</HeaderCell>
                            <Cell>
                                {rowData => (
                                    <span 
                                        className="priority-tag"
                                        style={{
                                            backgroundColor: rowData.priority ? priorityColors[rowData.priority]||'#393939' : '#e0e0e0',
                                            color: rowData.priority ? '#fff' : '#666',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {rowData.priority ? (rowData.priority.charAt(0).toUpperCase() + rowData.priority.slice(1)) : '-'}
                                    </span>
                                )}
                            </Cell>
                        </Column>
                    </Table>
                </>
            )}
        </div>
    )
}

export default dashboard