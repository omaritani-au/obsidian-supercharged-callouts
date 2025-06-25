// src/components/ColumnColorCreatorComponent.ts

import { Setting, TextComponent, Notice } from "obsidian";
import SuperchargedCalloutsPlugin, { ColumnColorDefinition } from "../main";
import { CustomColorPicker } from "../ui/CustomColorPicker";

export class ColumnColorCreatorComponent {
    private container: HTMLElement;
    private plugin: SuperchargedCalloutsPlugin;
    private data: ColumnColorDefinition;
    private onUpdate: () => void;
    private editingIndex: number | null = null;

    constructor(container: HTMLElement, plugin: SuperchargedCalloutsPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
        this.resetData();
    }

    private resetData(): void {
        this.data = { name: 'new-color', color: '#3498db' };
        this.editingIndex = null;
    }

    public edit(colorData: ColumnColorDefinition, index: number): void {
        this.data = { ...colorData, name: colorData.name.replace(/^col-/, '') };
        this.editingIndex = index;
        this.display();
        this.container.scrollIntoView({ behavior: 'smooth' });
    }

    public display(): void {
        this.container.empty();
        new Setting(this.container)
            .setHeading()
            .setName(this.editingIndex !== null ? "Edit column color" : "Create new column color");

        new Setting(this.container)
            .setName("Color name")
            .setDesc("A short name, like 'brand' or 'urgent'. The 'col-' prefix is added automatically.")
            .addText(text => {
                text.setPlaceholder("brand-color")
                    .setValue(this.data.name)
                    .onChange(val => {
                        this.data.name = val.toLowerCase().replace(/\s+/g, '-');
                    });
            });

        const colorSetting = new Setting(this.container)
            .setName("Color")
            .setDesc("Type a hex code or click the swatch to pick a color.");
            
        // FIX: The 'app' argument is no longer needed.
        const customPicker = new CustomColorPicker(colorSetting.controlEl);
        customPicker.build(this.data.color, (newColor) => {
            this.data.color = newColor;
        });

        const actionSetting = new Setting(this.container);
        if (this.editingIndex !== null) {
            actionSetting.addButton(btn => btn.setButtonText("Save changes").setCta().onClick(async () => {
                if (this.editingIndex === null) return;
                const fullName = `col-${this.data.name}`;
                this.plugin.settings.customColumnColors[this.editingIndex] = { name: fullName, color: this.data.color };
                await this.plugin.saveAndApplyStyles();
                new Notice(`Updated column color: ${fullName}`);
                this.resetData();
                this.onUpdate();
            }));
            actionSetting.addButton(btn => btn.setButtonText("Cancel").onClick(() => {
                this.resetData();
                this.onUpdate();
            }));
        } else {
            actionSetting.addButton(button => {
                button.setButtonText("Add color")
                      .setCta()
                      .onClick(async () => {
                          if (!this.data.name || !this.data.color) { new Notice("Color name and value cannot be empty."); return; }
                          const fullName = `col-${this.data.name}`;
                          if (this.plugin.settings.customColumnColors.some(c => c.name === fullName)) { new Notice("A custom column color with this name already exists."); return; }
                          
                          this.plugin.settings.customColumnColors.push({ name: fullName, color: this.data.color });
                          await this.plugin.saveAndApplyStyles();
                          new Notice(`Added new column color: ${fullName}`);
                          this.resetData();
                          this.onUpdate();
                      });
            });
        }
    }
}