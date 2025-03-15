import React, { useState } from 'react';
import { Modal, Table, Button, Tag } from 'rsuite';
import { router } from '@forge/bridge';
import UserAvatar from './components/UserAvatar';
import './requirement.css';

const { Column, HeaderCell, Cell } = Table;

const StatusCell = ({ rowData, dataKey, ...props }) => {
  const isDone = rowData.isDone;
  return (
    <Cell {...props}>
      <Tag color={isDone ? 'green' : 'orange'}>
        {rowData[dataKey]}
      </Tag>
    </Cell>
  );
};

const AssigneeCell = ({ rowData, ...props }) => {
  return (
    <Cell {...props}>
      <UserAvatar user={rowData.assignee} />
    </Cell>
  );
};

const IssuesModal = ({ show, onClose, issues = [] }) => {
  const handleRowClick = (rowData) => {
    router.open(`/browse/${rowData.key}`);
  };

  return (
    <Modal size="xl" open={show} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>Requirement Issues</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table
          height={400}
          data={issues}
          autoHeight
          hover={true}
          bordered
          cellBordered
          onRowClick={handleRowClick}
          rowClassName="clickable-row"
        >
          <Column flexGrow={1}>
            <HeaderCell>Issue Key</HeaderCell>
            <Cell dataKey="key" />
          </Column>
          <Column flexGrow={2}>
            <HeaderCell>Summary</HeaderCell>
            <Cell dataKey="summary" />
          </Column>
          <Column flexGrow={1}>
            <HeaderCell>Status</HeaderCell>
            <StatusCell dataKey="status" />
          </Column>
          <Column flexGrow={1}>
            <HeaderCell>Priority</HeaderCell>
            <Cell dataKey="priority" />
          </Column>
          <Column flexGrow={1}>
            <HeaderCell>Assignee</HeaderCell>
            <AssigneeCell />
          </Column>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="primary">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IssuesModal; 