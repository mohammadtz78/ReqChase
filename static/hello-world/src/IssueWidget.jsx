import { useState, useEffect } from 'react';
import Loader from './loader';
import { invoke, view } from '@forge/bridge'; // Import 'view' for context
import { Button, CheckPicker, TagGroup, Tag, Modal } from 'rsuite';

const IssueWidget = () => {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequirements, setSelectedRequirements] = useState([]);
    const [minHeight, setMinHeight] = useState('250px');
    const [issueId, setIssueId] = useState('');
    const [assignedRequirements, setAssignedRequirements] = useState([]);

    useEffect(() => {
        fetchIssueContext(); // Get issue ID
        fetchRequirements();
    }, []);

    useEffect(() => {
        getAssignedRequirements();
    }, [issueId])

    const getAssignedRequirements = async () => {
        setLoading(true);
        
        try {
            const assignedReqs = await invoke('getAssignedRequirements', { issueId });
            setAssignedRequirements(assignedReqs);
            setSelectedRequirements(assignedReqs.map(req => req.id));   
            
        } catch (error) {
            console.error('Error fetching assigned requirements:', error);
        }
        setLoading(false);
    };

    const fetchIssueContext = async () => {
        try {
            const context = await view.getContext(); // Fetch issue context
            setIssueId(context?.extension?.issue?.id || ''); // Set issue ID
        } catch (error) {
            console.error('Error fetching issue context:', error);
        }
    };

    const fetchRequirements = async () => {
        setLoading(true);

        try {
            const fetchedRequirements = await invoke('getRequirements');
            const formattedRequirements = fetchedRequirements.map((req) => ({
                value: req.id,
                label: req.name,
            }));
            setRequirements(formattedRequirements);
        } catch (error) {
            console.error('Error fetching requirements:', error);
          
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        setLoading(true)
        try {
            // Invoke backend function with issue ID and selected requirements
            await invoke('assignRequirements', {
                issueId,
                requirements: selectedRequirements,
            });
            await getAssignedRequirements();
            resetModal();
        } catch (error) {
            console.error('Error assigning requirements:', error);
        }
        setLoading(false)
    };

    const resetModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            {loading ? (
                <div style={{ minHeight: minHeight }}>
                <Loader  />
                </div>
            ) : (
                <div style={{ minHeight: minHeight }}>
                    <br />
                    <h5>Assigned Requirements</h5>
                    <br />
                    <TagGroup>
                        {assignedRequirements.map(item => (<Tag size="lg" color="violet">{item.name}</Tag>))}
                    </TagGroup>
                    <br />
                    <Button
                        appearance="primary"
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                    >
                        Assign Requirements
                    </Button>
                </div>
            )}

            <Modal  open={isModalOpen} onClose={resetModal} size="md">
                <Modal.Header>
                    <Modal.Title>Assign Requirements</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckPicker
                        data={requirements}
                        value={selectedRequirements}
                        onChange={setSelectedRequirements}
                        placeholder="Select requirements..."
                        style={{ width: '100%' }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleAssign} appearance="primary">
                        Assign
                    </Button>
                    <Button onClick={resetModal} appearance="subtle">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default IssueWidget;