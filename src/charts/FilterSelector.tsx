import { SyntheticEvent, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

interface FilterSelectorProps {
    values: string[];
    initialSelected?: string;
    onSelect: (selected: string) => void;
}

export function FilterSelector({values, initialSelected, onSelect}: FilterSelectorProps){
    const handleChange = (selectedValue: string) => {
        onSelect(selectedValue);
    }
    const buttons = values.map((value) => (
        <ToggleButton id={"filter-select" + value} 
            key={"filter-select" + value} 
            value={value} >
            {value}
        </ToggleButton>
    ));

    return (
        <>
            <ToggleButtonGroup name="filter-selector" type={"radio"} defaultValue={[initialSelected]} onChange={handleChange}>
                {buttons}
            </ToggleButtonGroup>
        </>
    )
}