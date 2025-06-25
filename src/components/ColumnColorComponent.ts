// src/components/ColumnColorListComponent.ts

import { Notice, Setting, setIcon } from "obsidian";
import SuperchargedCalloutsPlugin from "../main";
import { ColumnColorCreatorComponent } from "./ColumnColorCreatorComponent";

export class ColumnColorListComponent {
    private container: HTMLElement;
    private plugin: SuperchargedCalloutsPlugin;
    private onUpdate: () => void;
    private creatorComponent: ColumnColorCreatorComponent;

    constructor(container: HTMLElement, plugin: SuperchargedCalloutsPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
    }

    public setCreatorComponent(creator: ColumnColorCreatorComponent): void {
        this.creatorComponent = creator;
    }

    public display(): void {
        this.container.empty();
        
        if (this.plugin.settings.customColumnColors.length === 0) {
            return; // Don't show the heading if there are no colors
        }

        new Setting(this.container)
            .setHeading()
            .setName("Your custom colors");

        const listEl = this.container.createEl('div', { cls: 'custom-callout-list' });

        this.plugin.settings.customColumnColors.forEach((colorDef, index) => {
            const itemEl = listEl.createDiv({ cls: 'custom-callout-item' });
            
            // Color Swatch
            itemEl.createDiv({ 
                attr: { 
                    style: `width: 20px; height: 20px; border-radius: 50%; background-color: ${colorDef.color}; border: 1px solid var(--background-modifier-border); margin-right: 10px;` 
                }
            });

            itemEl.createSpan({ text: colorDef.name });

            // Edit Button
            const editBtn = itemEl.createEl('button', { cls: 'edit-btn' });
            setIcon(editBtn, 'pencil');
            editBtn.onclick = () => {
                if (this.creatorComponent) {
                    this.creatorComponent.edit(colorDef, index);
                }
            };
            
            // Delete Button
            const deleteBtn = itemEl.createEl('button', { cls: 'delete-btn' });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.onclick = async () => { 
                this.plugin.settings.customColumnColors.splice(index, 1); 
                await this.plugin.saveAndApplyStyles(); 
                this.onUpdate();
                new Notice(`Deleted column color ${colorDef.name}.`);
            };
        });
    }
}