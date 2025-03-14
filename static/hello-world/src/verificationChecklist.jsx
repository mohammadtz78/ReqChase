import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Input, Button, List } from "rsuite";

const VerificationChecklist = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        // Fetch initial validation checklist items from storage
        invoke("getVerificationChecklist").then(setItems);
    }, []);

    const addItem = async () => {
        if (newItem.trim()) {
            const newChecklistItem = await invoke("addVerificationChecklistItem", { name: newItem.trim() });
            setItems([...items, newChecklistItem]);
            setNewItem("");
        }
    };

    const removeItem = async (id) => {
        const response = await invoke("removeVerificationChecklistItem", { id });
        setItems(response);
    };

    const startEditing = (index) => {
        setEditIndex(index);
        setEditValue(items[index].name);
    };

    const saveEdit = async (index) => {
        if (editValue.trim()) {
            const updatedItems = [...items];
            updatedItems[index].name = editValue.trim();
            setItems(updatedItems);
            setEditIndex(null);
            await invoke("updateVerificationChecklistItem", { id: updatedItems[index].id, name: editValue.trim() });
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <Input
                value={newItem}
                onChange={(value) => setNewItem(value)}
                placeholder="Enter a checklist item"
            />
            <Button onClick={addItem} appearance="primary" style={{ marginTop: "10px" }}>
                Add Item
            </Button>
            <List bordered style={{ marginTop: "20px" }}>
                {items.map((item, index) => (
                    <List.Item key={item.id}>
                        {editIndex === index ? (
                            <>
                            <Input
                                value={editValue}
                                onChange={(value) => setEditValue(value)}
                                autoFocus
                            />
                             <Button style={{margin:"6px"}} onClick={() => saveEdit(index)} color="blue" appearance="primary">
                            Save
                        </Button>
                            </>
                        ) : (
                            <span onClick={() => startEditing(index)}>{item.name}</span>
                        )}
                        <Button style={{margin:"6px"}} onClick={() => removeItem(item.id)} color="red" appearance="subtle">
                            Delete
                        </Button>
                    </List.Item>
                ))}
            </List>
        </div>
    );
};

export default VerificationChecklist;