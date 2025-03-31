import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Input, Button, List } from "rsuite";
import './app.css';
import Loader from "./loader";

const PREDEFINED_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
    "#D4A5A5", "#9B59B6", "#3498DB", "#E67E22", "#2ECC71"
];

const Status = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [loading, setLoading] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);

    useEffect(() => {
        invoke("getStatuses").then(setItems);
    }, []);

    const addItem = async () => {
        if (newItem.trim()) {
            setLoading(true);
            const newStatusItem = await invoke("addStatus", {
                name: newItem.trim(),
                color: selectedColor
            });
            setItems([...items, newStatusItem]);
            setNewItem("");
            setSelectedColor(PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)]);
            setLoading(false);
        }
    };

    const removeItem = async (id) => {
        setLoading(true);
        const response = await invoke("removeStatus", { id });
        setItems(response);
        setLoading(false);
    };

    const startEditing = (index) => {
        setEditIndex(index);
        setEditValue(items[index].name);
        setSelectedColor(items[index].color);
    };

    const saveEdit = async (index) => {
        if (editValue.trim()) {
            setLoading(true);
            const updatedItems = [...items];
            updatedItems[index].name = editValue.trim();
            updatedItems[index].color = selectedColor;
            setItems(updatedItems);
            setEditIndex(null);
            await invoke("updateStatus", {
                id: updatedItems[index].id,
                name: editValue.trim(),
                color: selectedColor
            });
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h2>Status</h2>
            <br />
            <div>
                <Input
                    value={newItem}
                    onChange={(value) => setNewItem(value)}
                    placeholder="Enter a status name"
                />
                <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {PREDEFINED_COLORS.map((color) => (
                        <div
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: color,
                                cursor: "pointer",
                                border: selectedColor === color ? "3px solid black" : "none",
                                borderRadius: "4px"
                            }}
                        />
                    ))}

                </div>

            </div>
            {loading ? <Loader /> :
                <>
                    <div style={{ marginBottom: "20px" }}>
                        <Button onClick={addItem} appearance="primary" style={{ marginTop: "10px" }}>
                            Add Status
                        </Button>
                    </div>
                    <List bordered>
                        {items.map((item, index) => (
                            <List.Item key={item.id} style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: item.color,
                                        marginRight: "10px",
                                        borderRadius: "4px"
                                    }}
                                />
                                {editIndex === index ? (
                                    <>
                                        <Input
                                            value={editValue}
                                            onChange={(value) => setEditValue(value)}
                                            autoFocus
                                        />
                                        <div style={{ marginLeft: "10px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                            {PREDEFINED_COLORS.map((color) => (
                                                <div
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    style={{
                                                        width: "20px",
                                                        height: "20px",
                                                        backgroundColor: color,
                                                        cursor: "pointer",
                                                        border: selectedColor === color ? "2px solid black" : "none",
                                                        borderRadius: "4px"
                                                    }}
                                                />
                                            ))}
                                        </div>

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
                </>
            }
        </div>
    );
};

export default Status; 