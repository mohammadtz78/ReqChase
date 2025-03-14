import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Input, Button, List } from "rsuite";

const PREDEFINED_COLORS = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Sage Green
    "#FFEEAD", // Cream Yellow
    "#D4A5A5", // Dusty Rose
    "#9B59B6", // Purple
    "#3498DB", // Blue
    "#E67E22", // Orange
    "#2ECC71"  // Green
];

const Types = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);

    useEffect(() => {
        // Fetch initial types from storage
        invoke("getTypes").then(setItems);
    }, []);

    const addItem = async () => {
        if (newItem.trim()) {
            const newTypeItem = await invoke("addType", { 
                name: newItem.trim(),
                color: selectedColor
            });
            setItems([...items, newTypeItem]);
            setNewItem("");
            // Randomly select next color
            setSelectedColor(PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)]);
        }
    };

    const removeItem = async (id) => {
        const response = await invoke("removeType", { id });
        setItems(response);
    };

    const startEditing = (index) => {
        setEditIndex(index);
        setEditValue(items[index].name);
        setSelectedColor(items[index].color);
    };

    const saveEdit = async (index) => {
        if (editValue.trim()) {
            const updatedItems = [...items];
            updatedItems[index].name = editValue.trim();
            updatedItems[index].color = selectedColor;
            setItems(updatedItems);
            setEditIndex(null);
            await invoke("updateType", { 
                id: updatedItems[index].id, 
                name: editValue.trim(),
                color: selectedColor
            });
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h2>Types</h2>
            <div style={{ marginBottom: "20px" }}>
                <Input
                    value={newItem}
                    onChange={(value) => setNewItem(value)}
                    placeholder="Enter a type name"
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
                <Button onClick={addItem} appearance="primary" style={{ marginTop: "10px" }}>
                    Add Type
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
                                <Button style={{margin:"6px"}} onClick={() => saveEdit(index)} color="blue" appearance="primary">
                                    Save
                                </Button>
                            </>
                        ) : (
                            <span onClick={() => startEditing(index)} style={{ flex: 1 }}>{item.name}</span>
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

export default Types; 