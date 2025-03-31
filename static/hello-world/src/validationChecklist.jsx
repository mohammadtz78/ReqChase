import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Input, Button, List } from "rsuite";
import Loader from "./loader";

const ValidationChecklist = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [loading, setLoading] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        // Fetch initial validation checklist items from storage
        invoke("getValidationChecklist").then(setItems);
    }, []);

    const addItem = async () => {
        if (newItem.trim()) {
            setLoading(true);
            const newChecklistItem = await invoke("addValidationChecklistItem", { name: newItem.trim() });
            setItems([...items, newChecklistItem]);
            setNewItem("");
            setLoading(false);
        }
    };

    const removeItem = async (id) => {
        setLoading(true);
        const response = await invoke("removeValidationChecklistItem", { id });
        setItems(response);
        setLoading(false);
    };

    const startEditing = (index) => {
        setEditIndex(index);
        setEditValue(items[index].name);
    };

    const saveEdit = async (index) => {
        if (editValue.trim()) {
            setLoading(true);
            const updatedItems = [...items];
            updatedItems[index].name = editValue.trim();
            setItems(updatedItems);
            setEditIndex(null);
            await invoke("updateValidationChecklistItem", { id: updatedItems[index].id, name: editValue.trim() });
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h2>Validation Checklist</h2>
            <br />
            <Input
                value={newItem}
                onChange={(value) => setNewItem(value)}
                placeholder="Enter a checklist item"
            />
            {loading ? <Loader /> :
                <>
                    <Button onClick={addItem} appearance="primary" style={{ marginTop: "10px" }}>
                        Add Item
                    </Button>
                    <List bordered style={{ marginTop: "20px" }}>
                        {items.map((item, index) => (
                            <List.Item key={item.id} style={{ display: "flex", alignItems: "center" }}>
                                {editIndex === index ? (
                                    <>
                                        <Input
                                            value={editValue}
                                            onChange={(value) => setEditValue(value)}
                                            autoFocus
                                            style={{ flex: 1 }}
                                        />
                                        <Button style={{ margin: "6px" }} onClick={() => saveEdit(index)} color="blue" appearance="primary">
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <span onClick={() => startEditing(index)} style={{ flex: 1 }}>{item.name}</span>
                                )}
                                <Button className="delete-btn" style={{ margin: "6px" }} onClick={() => removeItem(item.id)} color="red" appearance="subtle">
                                    Delete
                                </Button>
                            </List.Item>
                        ))}
                    </List>
                </>}
        </div>
    );
};

export default ValidationChecklist;