import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { invoke, view } from '@forge/bridge';
import { Button, Input, Notification, Panel, Checkbox, Divider, Grid, Row, Col, SelectPicker, Tag, Modal, Progress } from 'rsuite';
import Loader from './loader';
import IssuesModal from './IssuesModal';
import ActivityLog from './ActivityLog';
import './app.css';
import './requirement.css';

const RequirementViewEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewRequirement = id === 'new';
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isNewRequirement);
  const [types, setTypes] = useState([]);
  const [stages, setStages] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [issues, setIssues] = useState([]);
  const [editedRequirement, setEditedRequirement] = useState({ 
    name: '', 
    description: '', 
    validationChecks: [], 
    verificationChecks: [],
    typeId: null,
    stageId: null,
    statusId: null,
    priority: null,
    importance: null,
    size: ''
  });
  const [validationChecklist, setValidationChecklist] = useState([]);
  const [verificationChecklist, setVerificationChecklist] = useState([]);

  // Add priority and importance options
  const priorityOptions = [
    { label: 'Low', value: 'low', color: '#3498db' },
    { label: 'Medium', value: 'medium', color: '#2ecc71' },
    { label: 'High', value: 'high', color: '#f1c40f' },
    { label: 'Maximum', value: 'maximum', color: '#c0392b' }
  ];

  const importanceOptions = [
    { label: 'Low', value: 'low', color: '#3498db' },
    { label: 'Medium', value: 'medium', color: '#2ecc71' },
    { label: 'High', value: 'high', color: '#f1c40f' },
    { label: 'Maximum', value: 'maximum', color: '#c0392b' }
  ];

  useEffect(() => {
    if (!isNewRequirement) {
      fetchRequirement();
      fetchIssues();
    }
    fetchChecklists();
    fetchTypes();
    fetchStages();
    fetchStatuses();
  }, [id]);

  const fetchTypes = async () => {
    try {
      const fetchedTypes = await invoke('getTypes');
      setTypes(fetchedTypes);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch types.' });
    }
  };

  const fetchStages = async () => {
    try {
      const fetchedStages = await invoke('getStages');
      setStages(fetchedStages);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch stages.' });
    }
  };

  const fetchStatuses = async () => {
    try {
      const fetchedStatuses = await invoke('getStatuses');
      setStatuses(fetchedStatuses);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch statuses.' });
    }
  };

  // Helper function to determine if a color is dark
  const isColorDark = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  // Get current type object
  const getCurrentType = () => {
    return types.find(t => t.id === (editedRequirement.typeId || requirement?.typeId));
  };

  // Get current stage object
  const getCurrentStage = () => {
    return stages.find(s => s.id === (editedRequirement.stageId || requirement?.stageId));
  };

  // Get current status object
  const getCurrentStatus = () => {
    return statuses.find(s => s.id === (editedRequirement.statusId || requirement?.statusId));
  };

  // Get current size
  const getCurrentSize = () => {
    return editedRequirement.size || requirement?.size || 'Not specified';
  };

  // Helper function to get current priority/importance object
  const getCurrentPriority = () => {
    const value = editedRequirement.priority || requirement?.priority;
    return value ? priorityOptions.find(p => p.value === value) : null;
  };

  const getCurrentImportance = () => {
    const value = editedRequirement.importance || requirement?.importance;
    return value ? importanceOptions.find(i => i.value === value) : null;
  };

  // Format types for SelectPicker
  const typeOptions = types.map(type => ({
    label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
    value: type.id,
    style: {
      backgroundColor: type.color,
      color: isColorDark(type.color) ? '#fff' : '#000'
    }
  }));

  // Format stages for SelectPicker
  const stageOptions = stages.map(stage => ({
    label: stage.name.charAt(0).toUpperCase() + stage.name.slice(1),
    value: stage.id,
    style: {
      backgroundColor: stage.color,
      color: isColorDark(stage.color) ? '#fff' : '#000'
    }
  }));

  // Format statuses for SelectPicker
  const statusOptions = statuses.map(status => ({
    label: status.name.charAt(0).toUpperCase() + status.name.slice(1),
    value: status.id,
    style: {
      backgroundColor: status.color,
      color: isColorDark(status.color) ? '#fff' : '#000'
    }
  }));

  const fetchChecklists = async () => {
    try {
      const [validationItems, verificationItems] = await Promise.all([
        invoke('getValidationChecklist'),
        invoke('getVerificationChecklist')
      ]);
      setValidationChecklist(validationItems);
      setVerificationChecklist(verificationItems);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch checklists.' });
    }
  };

  const fetchRequirement = async () => {
    setLoading(true);
    try {
      const fetchedRequirement = await invoke('getRequirement', { id });
      setRequirement(fetchedRequirement);
      setEditedRequirement({ 
        name: fetchedRequirement?.name, 
        description: fetchedRequirement?.description,
        validationChecks: fetchedRequirement?.validationChecks || [],
        verificationChecks: fetchedRequirement?.verificationChecks || [],
        typeId: fetchedRequirement.typeId,
        stageId: fetchedRequirement.stageId,
        statusId: fetchedRequirement.statusId,
        priority: fetchedRequirement.priority,
        importance: fetchedRequirement.importance,
        size: fetchedRequirement.size || ''
      });
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch requirement.' });
    } finally {
      setLoading(false);
    }
  };

  const saveRequirement = async () => {
    if (!editedRequirement.name.trim()) {
      Notification.warning({ title: 'Validation', description: 'Name is required.' });
      return;
    }

    setLoading(true);
    try {
      if (isNewRequirement) {
        const newRequirement = await invoke('addRequirement', { 
          name: editedRequirement.name, 
          description: editedRequirement.description,
          validationChecks: editedRequirement.validationChecks,
          verificationChecks: editedRequirement.verificationChecks,
          typeId: editedRequirement.typeId,
          stageId: editedRequirement.stageId,
          statusId: editedRequirement.statusId,
          priority: editedRequirement.priority,
          importance: editedRequirement.importance,
          size: editedRequirement.size
        });
        setIsEditing(false);
        navigate(`/requirement/${newRequirement.id}`);
      } else {
        const updatedRequirement = await invoke('updateRequirement', { 
          id, 
          name: editedRequirement.name, 
          description: editedRequirement.description,
          validationChecks: editedRequirement.validationChecks,
          verificationChecks: editedRequirement.verificationChecks,
          typeId: editedRequirement.typeId,
          stageId: editedRequirement.stageId,
          statusId: editedRequirement.statusId,
          priority: editedRequirement.priority,
          importance: editedRequirement.importance,
          size: editedRequirement.size
        });
        setRequirement(updatedRequirement);
        setIsEditing(false);
        Notification.success({ title: 'Success', description: 'Requirement updated successfully.' });
      }
    } catch (error) {
      Notification.error({ title: 'Error', description: `Failed to ${isNewRequirement ? 'add' : 'update'} requirement.` });
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistChange = (type, itemId) => {
    const field = type === 'validation' ? 'validationChecks' : 'verificationChecks';
    const currentChecks = [...editedRequirement[field]];
    const index = currentChecks.indexOf(itemId);
    
    if (index === -1) {
      currentChecks.push(itemId);
    } else {
      currentChecks.splice(index, 1);
    }

    setEditedRequirement({
      ...editedRequirement,
      [field]: currentChecks
    });

    if (!isEditing) {
      // If not in editing mode, save immediately
      invoke('updateRequirement', {
        id,
        name: requirement.name,
        description: requirement.description,
        validationChecks: field === 'validationChecks' ? currentChecks : requirement.validationChecks,
        verificationChecks: field === 'verificationChecks' ? currentChecks : requirement.verificationChecks
      }).then(() => {
        setRequirement({
          ...requirement,
          [field]: currentChecks
        });
        Notification.success({ title: 'Success', description: 'Checklist updated successfully.' });
      }).catch(() => {
        Notification.error({ title: 'Error', description: 'Failed to update checklist.' });
      });
    }
  };

  const ChecklistSection = ({ title, items, checkedItems, type }) => (
    <div className="checklist-section">
      <h3>{title}</h3>
      <div className="checklist-content">
        <Grid fluid>
          <Col xs={24}>
            {items.map((item) => (
              <Row key={item.id} className="checklist-item">
                <Checkbox
                  checked={checkedItems.includes(item.id)}
                  onChange={() => handleChecklistChange(type, item.id)}
                >
                  {item.name}
                </Checkbox>
              </Row>
            ))}
          </Col>
        </Grid>
      </div>
    </div>
  );

  const calculateProgress = (checkedItems, totalItems) => {
    if (!totalItems || totalItems.length === 0) return 0;
    return Math.round((checkedItems?.length || 0) * 100 / totalItems.length);
  };

  const ChecklistCard = ({ title, checkedItems, totalItems, onClick }) => {
    const progress = calculateProgress(checkedItems, totalItems);
    
    return (
      <div className="checklist-card" onClick={onClick}>
        <h3>{title}</h3>
        <div className="progress-circle">
          <Progress.Circle percent={progress} strokeColor="#4CAF50" strokeWidth={8} />
        </div>
        <p>{checkedItems?.length || 0} of {totalItems.length} checked</p>
      </div>
    );
  };

  const ChecklistModal = ({ show, onClose, title, items, checkedItems, type }) => (
    <Modal size="lg" open={show} onClose={onClose}>
      <Modal.Body>
        <ChecklistSection
          title={title}
          items={items}
          checkedItems={checkedItems}
          type={type}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="primary" className="cream-primary-btn">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const fetchIssues = async () => {
    try {
      const fetchedIssues = await invoke('getRequirementIssues', { requirementId: id });
      setIssues(fetchedIssues);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch issues.' });
    }
  };

  const IssuesCard = ({ onClick }) => {
    const completedIssues = issues.filter(issue => issue.isDone);
    const progress = calculateProgress(completedIssues, issues);
    
    return (
      <div className="checklist-card issues-card" onClick={onClick}>
        <h3>Related Issues</h3>
        <div className="progress-circle">
          <Progress.Circle percent={progress} strokeColor="#3498db" strokeWidth={8} />
        </div>
        <p>{completedIssues.length} of {issues.length} completed</p>
      </div>
    );
  };

  if (loading) return <Loader />;
  if (!isNewRequirement && !requirement) return <p>No requirement found.</p>;

  const currentType = getCurrentType();
  const currentStage = getCurrentStage();
  const currentStatus = getCurrentStatus();

  return (
    <div className="requirement-container">
      <Panel bordered header={<div style={{display:'flex'}}>
        <h2>{isNewRequirement ? 'New Requirement' : requirement.name}</h2>
        <div className="button-container">
          {isEditing && (
            <Button appearance="primary" onClick={saveRequirement} className="save-button">
              {isNewRequirement ? 'Create' : 'Save'}
            </Button>
          )}
          <Button appearance="primary" onClick={() => isNewRequirement ? navigate('/') : setIsEditing(!isEditing)} className="cream-primary-btn">
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>}>
        
        <br /><br />
        {isEditing ? (
          <>
            <Input 
              value={editedRequirement.name} 
              onChange={(value) => setEditedRequirement({ ...editedRequirement, name: value })}
              placeholder="Enter requirement name"
            />
            <br /><br />
            <Grid fluid>
              <Row>
                <Col xs={6}>
                  <div className="selector-label">Type:</div>
                  <SelectPicker 
                    data={typeOptions}
                    value={editedRequirement.typeId}
                    onChange={(value) => setEditedRequirement({ ...editedRequirement, typeId: value })}
                    className="type-selector"
                    renderMenuItem={(label, item) => (
                      <div className="type-menu-item" style={item.style}>
                        {label}
                      </div>
                    )}
                    menuClassName="type-selector-menu"
                    placeholder="Select Type"
                    block
                  />
                </Col>
                <Col xs={6}>
                  <div className="selector-label">Stage:</div>
                  <SelectPicker 
                    data={stageOptions}
                    value={editedRequirement.stageId}
                    onChange={(value) => setEditedRequirement({ ...editedRequirement, stageId: value })}
                    className="type-selector"
                    renderMenuItem={(label, item) => (
                      <div className="type-menu-item" style={item.style}>
                        {label}
                      </div>
                    )}
                    menuClassName="type-selector-menu"
                    placeholder="Select Stage"
                    block
                  />
                </Col>
                <Col xs={4}>
                  <div className="selector-label">Status:</div>
                  <SelectPicker 
                    data={statusOptions}
                    value={editedRequirement.statusId}
                    onChange={(value) => setEditedRequirement({ ...editedRequirement, statusId: value })}
                    className="type-selector"
                    renderMenuItem={(label, item) => (
                      <div className="type-menu-item" style={item.style}>
                        {label}
                      </div>
                    )}
                    menuClassName="type-selector-menu"
                    placeholder="Select Status"
                    block
                  />
                </Col>
                <Col xs={4}>
                  <div className="selector-label">Priority:</div>
                  <SelectPicker 
                    data={priorityOptions}
                    value={editedRequirement.priority}
                    onChange={(value) => setEditedRequirement({ ...editedRequirement, priority: value })}
                    className="type-selector"
                    renderMenuItem={(label, item) => (
                      <div className="type-menu-item" style={item.style}>
                        {label}
                      </div>
                    )}
                    menuClassName="type-selector-menu"
                    placeholder="Select Priority"
                    block
                  />
                </Col>
                <Col xs={4}>
                  <div className="selector-label">Importance:</div>
                  <SelectPicker 
                    data={importanceOptions}
                    value={editedRequirement.importance}
                    onChange={(value) => setEditedRequirement({ ...editedRequirement, importance: value })}
                    className="type-selector"
                    renderMenuItem={(label, item) => (
                      <div className="type-menu-item" style={item.style}>
                        {label}
                      </div>
                    )}
                    menuClassName="type-selector-menu"
                    placeholder="Select Importance"
                    block
                  />
                </Col>
              </Row>
              <Row style={{ marginTop: '10px' }}>
                <Col xs={24}>
                  <div className="selector-label">Size:</div>
                  <Input 
                    value={editedRequirement.size}
                    onChange={(value) => setEditedRequirement({ ...editedRequirement, size: value })}
                    placeholder="Enter project size"
                    className="size-input"
                  />
                </Col>
              </Row>
            </Grid>
            <br /><br />
            <Input 
              as="textarea" 
              rows={6} 
              value={editedRequirement?.description} 
              onChange={(value) => setEditedRequirement({ ...editedRequirement, description: value })} 
              className="description-textarea"
              placeholder="Enter a detailed description of the requirement..."
            />
          </>
        ) : (
          <>
            <div className="requirement-info-grid">
              <div className="info-item">
                <div className="info-label">Type:</div>
                {currentType && (
                  <Button 
                    className="type-button"
                    style={{
                      backgroundColor: currentType.color,
                      color: isColorDark(currentType.color) ? '#fff' : '#000'
                    }}
                    disabled
                  >
                    {currentType.name.charAt(0).toUpperCase() + currentType.name.slice(1)}
                  </Button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">Stage:</div>
                {currentStage && (
                  <Button 
                    className="type-button"
                    style={{
                      backgroundColor: currentStage.color,
                      color: isColorDark(currentStage.color) ? '#fff' : '#000'
                    }}
                    disabled
                  >
                    {currentStage.name.charAt(0).toUpperCase() + currentStage.name.slice(1)}
                  </Button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">Status:</div>
                {currentStatus && (
                  <Button 
                    className="type-button"
                    style={{
                      backgroundColor: currentStatus.color,
                      color: isColorDark(currentStatus.color) ? '#fff' : '#000'
                    }}
                    disabled
                  >
                    {currentStatus.name.charAt(0).toUpperCase() + currentStatus.name.slice(1)}
                  </Button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">Priority:</div>
                {getCurrentPriority() && (
                  <Button 
                    className="type-button"
                    style={{
                      backgroundColor: getCurrentPriority().color,
                      color: '#fff'
                    }}
                    disabled
                  >
                    {getCurrentPriority().label}
                  </Button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">Importance:</div>
                {getCurrentImportance() && (
                  <Button 
                    className="type-button"
                    style={{
                      backgroundColor: getCurrentImportance().color,
                      color: '#fff'
                    }}
                    disabled
                  >
                    {getCurrentImportance().label}
                  </Button>
                )}
              </div>
              <div className="info-item">
                <div className="info-label">Size:</div>
                <div className="size-display">{getCurrentSize()}</div>
              </div>
            </div>
            <div className="description-content">
              <div className="info-label">Description:</div>
              <div className="description-text">{requirement?.description}</div>
            </div>
          </>
        )}
        
        {!isNewRequirement && (
          <>
            <Divider />
            <div className="checklist-cards">
              <Grid fluid>
                <Row gutter={10}>
                  <Col xs={8}>
                    <ChecklistCard
                      title="Validation Checklist"
                      checkedItems={requirement.validationChecks}
                      totalItems={validationChecklist}
                      onClick={() => setShowValidationModal(true)}
                    />
                  </Col>
                  <Col xs={8}>
                    <ChecklistCard
                      title="Verification Checklist"
                      checkedItems={requirement.verificationChecks}
                      totalItems={verificationChecklist}
                      onClick={() => setShowVerificationModal(true)}
                    />
                  </Col>
                  <Col xs={8}>
                    <IssuesCard onClick={() => setShowIssuesModal(true)} />
                  </Col>
                </Row>
              </Grid>
            </div>
            <Divider />
            <ActivityLog logs={requirement.logs} />
          </>
        )}
      </Panel>

      {!isNewRequirement && (
        <>
          <ChecklistModal 
            show={showValidationModal}
            onClose={() => setShowValidationModal(false)}
            title="Validation Checklist"
            items={validationChecklist}
            checkedItems={requirement.validationChecks || []}
            type="validation"
          />

          <ChecklistModal 
            show={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            title="Verification Checklist"
            items={verificationChecklist}
            checkedItems={requirement.verificationChecks || []}
            type="verification"
          />

          <IssuesModal
            show={showIssuesModal}
            onClose={() => setShowIssuesModal(false)}
            issues={issues}
          />
        </>
      )}
    </div>
  );
};

export default RequirementViewEdit;