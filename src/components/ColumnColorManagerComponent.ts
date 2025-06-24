// src/components/ColumnColorManagerComponent.ts

import { Notice, Setting, TextComponent, setIcon, ColorComponent } from "obsidian";
import MultiColumnPlugin, { ColumnColorDefinition } from "../main";

export class ColumnColorManagerComponent {
    private container: HTMLElement;
    private plugin: MultiColumnPlugin;
    private onUpdate: () => void;
    
    constructor(container: HTMLElement, plugin: MultiColumnPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
    }

    public display(): void {
        this.container.empty();
        this.container.createEl('h3', { 
            text: 'Custom Column Colors',
            cls: "callout-manager-section-header"
        });

        // --- Form to Add a New Custom Color ---
        let colorInput: TextComponent;
        let colorPicker: ColorComponent;
        let newColorData: ColumnColorDefinition = { name: 'brand-color', color: '#4479F1' };

        new Setting(this.container)
            .setName("New Color Name")
            .setDesc("A short name, like 'brand' or 'urgent'. The 'col-' prefix will be added automatically.")
            .addText(text => {
                text.setPlaceholder("brand-color")
                    .setValue(newColorData.name)
                    .onChange(val => {
                        newColorData.name = val.toLowerCase().replace(/\s+/g, '-');
                    });
            });

        // === FIX: Two-Way Binding for Color Picker ===
        new Setting(this.container)
            .setName("Color")
            .addText(text => {
                colorInput = text;
                text.inputEl.style.marginRight = "10px";
                text.setValue(newColorData.color)
                    .onChange(val => {
                        newColorData.color = val;
                        // When text changes, update the color picker's value
                        if (colorPicker) colorPicker.setValue(val);
                    });
            })
            .addColorPicker(picker => {
                colorPicker = picker;
                picker.setValue(newColorData.color)
                      .onChange(val => {
                          newColorData.color = val;
                          // When picker changes, update the text input's value
                          if (colorInput) colorInput.setValue(val);
                      });
            });
        
        new Setting(this.container)
            .addButton(button => {
                button.setButtonText("Add Color")
                      .setCta()
                      .onClick(async () => {
                          if (!newColorData.name || !newColorData.color) { new Notice("Color name and value cannot be empty."); return; }
                          const fullName = `col-${newColorData.name}`;
                          if (this.plugin.settings.customColumnColors.some(c => c.name === fullName)) { new Notice("A custom column color with this name already exists."); return; }
                          this.plugin.settings.customColumnColors.push({ name: fullName, color: newColorData.color });
                          await this.plugin.saveAndApplyStyles();
                          new Notice(`Added new column color: [!${fullName}]`);
                          this.onUpdate();
                      });
            });
            
        this.container.createEl('hr');

        // --- List of Existing Custom Colors ---
        const listEl = this.container.createEl('div', { cls: 'custom-callout-list' });
        
        if (this.plugin.settings.customColumnColors.length === 0) {
            listEl.createEl('p', { text: 'No custom column colors created yet.', cls: 'text-muted' });
            return;
        }

        this.plugin.settings.customColumnColors.forEach((colorDef, index) => {
            const itemEl = listEl.createDiv({ cls: 'custom-callout-item' });
            
            const colorSwatch = itemEl.createDiv();
            colorSwatch.style.width = '20px';
            colorSwatch.style.height = '20px';
            colorSwatch.style.borderRadius = '50%';
            colorSwatch.style.backgroundColor = colorDef.color;
            colorSwatch.style.border = '1px solid var(--background-modifier-border)';

            itemEl.createSpan({ text: colorDef.name });
            
            const deleteBtn = itemEl.createEl('button', { cls: 'delete-btn', attr: {'style': 'margin-left: auto;'} });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.onclick = async () => { 
                this.plugin.settings.customColumnColors.splice(index, 1); 
                await this.plugin.saveAndApplyStyles(); 
                this.onUpdate();
                new Notice(`Deleted column color [!${colorDef.name}].`); 
            };
        });
    }
}