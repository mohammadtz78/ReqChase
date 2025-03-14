import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { invoke, view } from '@forge/bridge';
import { Button, Input, Notification, Panel, Checkbox, Divider, Grid, Row, Col, SelectPicker, Tag } from 'rsuite';
import Loader from './loader';
import './requirement.css';

const RequirementViewEdit = () => {
  const { id } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [types, setTypes] = useState([]);
  const [editedRequirement, setEditedRequirement] = useState({ 
    name: '', 
    description: '', 
    validationChecks: [], 
    verificationChecks: [],
    typeId: null
  });
  const [validationChecklist, setValidationChecklist] = useState([]);
  const [verificationChecklist, setVerificationChecklist] = useState([]);

  useEffect(() => {
    fetchRequirement();
    fetchChecklists();
    fetchTypes();
  }, [id]);

  const fetchTypes = async () => {
    try {
      const fetchedTypes = await invoke('getTypes');
      setTypes(fetchedTypes);
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch types.' });
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

  // Format types for SelectPicker
  const typeOptions = types.map(type => ({
    label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
    value: type.id,
    style: {
      backgroundColor: type.color,
      color: isColorDark(type.color) ? '#fff' : '#000'
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
        name: fetchedRequirement.name, 
        description: fetchedRequirement.description,
        validationChecks: fetchedRequirement.validationChecks || [],
        verificationChecks: fetchedRequirement.verificationChecks || [],
        typeId: fetchedRequirement.typeId
      });
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to fetch requirement.' });
    } finally {
      setLoading(false);
    }
  };

  const saveRequirement = async () => {
    setLoading(true);
    try {
      await invoke('updateRequirement', { 
        id, 
        name: editedRequirement.name, 
        description: editedRequirement.description,
        validationChecks: editedRequirement.validationChecks,
        verificationChecks: editedRequirement.verificationChecks,
        typeId: editedRequirement.typeId
      });
      setRequirement(editedRequirement);
      setIsEditing(false);
      Notification.success({ title: 'Success', description: 'Requirement updated successfully.' });
    } catch (error) {
      Notification.error({ title: 'Error', description: 'Failed to update requirement.' });
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

  if (loading) return <Loader />;
  if (!requirement) return <p>No requirement found.</p>;

  const currentType = getCurrentType();

  return (
    <div className="requirement-container">
      <Panel bordered header={<h2>{requirement.name}</h2>}>
        <div className="button-container">
          {isEditing && (
            <Button appearance="primary" onClick={saveRequirement} className="save-button">
              Save
            </Button>
          )}
          <Button appearance="subtle" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        <br /><br />
        {isEditing ? (
          <>
            <Input value={editedRequirement.name} onChange={(value) => setEditedRequirement({ ...editedRequirement, name: value })} />
            <br /><br />
            <SelectPicker 
              data={typeOptions}
              value={editedRequirement.typeId}
              onChange={(value) => setEditedRequirement({ ...editedRequirement, typeId: value })}
              className="type-selector"
              renderMenuItem={(label, item) => (
                <div 
                  className="type-menu-item"
                  style={item.style}
                >
                  {label}
                </div>
              )}
              menuClassName="type-selector-menu"
              placeholder="Select Type"
            />
            <br /><br />
            <Input as="textarea" rows={3} value={editedRequirement.description} onChange={(value) => setEditedRequirement({ ...editedRequirement, description: value })} />
            <br /><br />
          </>
        ) : (
          <>
            {currentType ? (
              <Tag 
                className="type-tag"
                style={{
                  backgroundColor: currentType.color,
                  color: isColorDark(currentType.color) ? '#fff' : '#000'
                }}
              >
                {currentType.name.charAt(0).toUpperCase() + currentType.name.slice(1)}
              </Tag>
            ) : (
              <Tag className="type-tag type-tag-placeholder">
                No type selected
              </Tag>
            )}
            <p><strong>Description:</strong> {requirement.description}</p>
          </>
        )}
        
        <Divider />
        
        <ChecklistSection
          title="Validation Checklist"
          items={validationChecklist}
          checkedItems={requirement.validationChecks || []}
          type="validation"
        />
        
        <Divider />
        
        <ChecklistSection
          title="Verification Checklist"
          items={verificationChecklist}
          checkedItems={requirement.verificationChecks || []}
          type="verification"
        />
      </Panel>
    </div>
  );
};

export default RequirementViewEdit;