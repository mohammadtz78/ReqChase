import { useState, useEffect } from 'react';
import { invoke, view } from '@forge/bridge';
import { Button, Table, Modal, Input, Notification } from 'rsuite';
import Loader from './loader';

const Requirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
    
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

  const addRequirement = async () => {
    if (newRequirement.trim() === '') {
      Notification.warning({ title: 'Validation', description: 'Name is required.' });
      return;
    }
    try {
      setLoading(true);
      await invoke('addRequirement', { name: newRequirement, description: newDescription });
      await fetchRequirements();
      setNewRequirement('');
      setNewDescription('');

      setModalOpen(false);
      Notification.success({ title: 'Success', description: 'Requirement added successfully.' });
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to add requirement.' });
    }
    setLoading(false);

  };

  const deleteRequirement = async (id) => {
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


    return (
        <div style={{ padding: '20px' }}>
            <h1>User Requirements</h1>
            <Button appearance="primary" style={{ float: 'right', marginBottom: '10px' }} onClick={() => setModalOpen(true)}>
                Add Requirement
            </Button>
            {loading ? <Loader/> : (
                <Table
                    data={requirements}
                    autoHeight
                    bordered
                    cellBordered
                    hover
                    sortColumn='name'
                    style={{ marginTop: '20px', width: '100%' }}
                >
                    <Table.Column flexGrow={1} align="left">
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.Cell dataKey="name" />
                    </Table.Column>
                    <Table.Column flexGrow={1} align="left">
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.Cell dataKey="description" />
                    </Table.Column>
                    <Table.Column flexGrow={0.5} align="center" verticalAlign='middle' >
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                        <Table.Cell>
                            {rowData => (
                                <Button size='xs' appearance="primary" color="red" onClick={() => deleteRequirement(rowData.id)}>
                                    Delete
                                </Button>
                            )}
                        </Table.Cell>
                    </Table.Column>
                </Table>
            )}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Modal.Header>
                    <Modal.Title>Add User Requirement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Input
                        placeholder="Requirement Name"
                        value={newRequirement}
                        onChange={(value) => setNewRequirement(value)}
                    />
                    <br />
                    <Input
                        placeholder="Requirement Description"
                        value={newDescription}
                        onChange={(value) => setNewDescription(value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button appearance="primary" onClick={addRequirement}>Add</Button>
                    <Button onClick={() => setModalOpen(false)} appearance="subtle">Cancel</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Requirements