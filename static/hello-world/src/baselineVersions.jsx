import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { Button, Table, Modal, Form, Message, ButtonToolbar } from 'rsuite';
import { Panel } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

const BaselineVersions = ({ notifier,loadingState }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newVersion, setNewVersion] = useState({ key: '', description: '' });
    const [restoring, setRestoring] = useState(false);

    const [isMainLoading, setMainLoading] = loadingState;

    const loadVersions = async () => {
        try {
            setLoading(true);
            const result = await invoke('getVersions');
            setVersions(result);
        } catch (err) {
            notifier('error', 'Failed to load versions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVersions();
    }, []);

    const handleCreateVersion = async () => {
        try {
            setLoading(true);
            await invoke('createVersion', { key: newVersion.key, description: newVersion.description });
            setShowCreateModal(false);
            setNewVersion({ key: '', description: '' });
            await loadVersions();
            notifier('success', 'Version created successfully');
        } catch (err) {
            notifier('error', 'Failed to create version');
            
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveVersion = async (versionKey) => {
        try {
            setLoading(true);
            await invoke('removeVersion', { versionKey });
            await loadVersions();
            
            notifier('success', 'Version removed successfully');
        } catch (err) {
            notifier('error', 'Failed to remove version');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreVersion = async (versionKey) => {
        try {
            setRestoring(true);
            setMainLoading(true);
            await invoke('restoreVersion', { versionKey });
            setMainLoading(false);
            notifier('success', 'Version restored successfully');
            // Show success message or handle UI update
        } catch (err) {
            setMainLoading(false);
            notifier('error', 'Failed to restore version');
            console.error(err);
        } finally {

            setRestoring(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Panel header="Baseline Versions" bordered>
                <ButtonToolbar style={{ marginBottom: '20px' }}>
                    <Button appearance="primary" onClick={() => setShowCreateModal(true)}>
                        Create New Version
                    </Button>
                </ButtonToolbar>

                <Table
                    height={400}
                    data={versions}
                    loading={loading}
                    bordered
                    cellBordered
                >
                    <Column flexGrow={1}>
                        <HeaderCell>Version Key</HeaderCell>
                        <Cell dataKey="key" />
                    </Column>

                    <Column flexGrow={2}>
                        <HeaderCell>Description</HeaderCell>
                        <Cell dataKey="description" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Created Date</HeaderCell>
                        <Cell>
                            {rowData => new Date(rowData.createdDate).toLocaleString()}
                        </Cell>
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Actions</HeaderCell>
                        <Cell>
                            {rowData => (
                                <ButtonToolbar style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        appearance="primary"
                                        size="xs"
                                        onClick={() => handleRestoreVersion(rowData.key)}
                                        disabled={restoring}
                                    >
                                        Restore
                                    </Button>
                                    <Button
                                        appearance="subtle"
                                        color="red"
                                        size="xs"
                                        onClick={() => handleRemoveVersion(rowData.key)}
                                        disabled={loading}
                                    >
                                        Remove
                                    </Button>
                                </ButtonToolbar>
                            )}
                        </Cell>
                    </Column>
                </Table>

                <Modal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                >
                    <Modal.Header>
                        <Modal.Title>Create New Version</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form fluid>
                            <Form.Group>
                                <Form.ControlLabel>Version Key</Form.ControlLabel>
                                <Form.Control
                                    name="key"
                                    value={newVersion.key}
                                    onChange={value => setNewVersion({ ...newVersion, key: value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Description</Form.ControlLabel>
                                <Form.Control
                                    name="description"
                                    value={newVersion.description}
                                    onChange={value => setNewVersion({ ...newVersion, description: value })}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => setShowCreateModal(false)} appearance="subtle">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateVersion} appearance="primary" loading={loading}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Panel>
        </div>
    );
};

export default BaselineVersions; 