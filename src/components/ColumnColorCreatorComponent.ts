// src/components/ColumnColorCreatorComponent.ts

import { Setting, Notice } from "obsidian";
import { CustomColorPicker } from "../ui/CustomColorPicker";
import { ColumnColorDefinition } from "../types";
import { BaseCreatorComponent } from "./base/BaseCreatorComponent";
import SuperchargedCalloutsPlugin from "../main";

export class ColumnColorCreatorComponent extends BaseCreatorComponent<ColumnColorDefinition> {
    protected entityName = "column color";
    protected settingsKey = "customColumnColors" as const;

    getInitialData(): ColumnColorDefinition {
        return { name: 'new-color', color: '#3498db' };
    }

    renderForm(container: HTMLElement): void {
        new Setting(container)
            .setName("Color name")
            .setDesc("A short name, like 'brand' or 'urgent'. The 'col-' prefix is added automatically.")
            .addText(text => {
                text.setPlaceholder("brand-color")
                    // FIX: Provide fallback for potentially undefined values
                    .setValue(this.data.name || '')
                    .onChange(val => {
                        this.data.name = val.toLowerCase().replace(/\s+/g, '-');
                    });
            });

        const colorSetting = new Setting(container)
            .setName("Color")
            .setDesc("Type a hex code or click the swatch to pick a color.");
            
        const customPicker = new CustomColorPicker(colorSetting.controlEl);
        // FIX: Provide fallback for potentially undefined values
        customPicker.build(this.data.color || '', (newColor) => {
            this.data.color = newColor;
        });
    }

    // Override edit to handle the 'col-' prefix
    public edit(colorData: ColumnColorDefinition, index: number): void {
        const editableData = { ...colorData, name: colorData.name.replace(/^col-/, '') };
        super.edit(editableData, index);
    }
    
    // Override validation to add the 'col-' prefix back on
    validate(data: Partial<ColumnColorDefinition>): boolean {
        // FIX: Remove invalid 'super' call and perform validation directly.
        if (!data.name || !data.color) {
            new Notice("Color name and value cannot be empty.");
            return false;
        }

        this.data.name = `col-${data.name}`;
        return true;
    }
}