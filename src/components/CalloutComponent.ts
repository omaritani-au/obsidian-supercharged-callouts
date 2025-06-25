// src/components/CalloutListComponent.ts

import { Notice, setIcon, Setting } from "obsidian";
import SuperchargedCalloutsPlugin from "../main";
import { CreatorComponent } from "./CalloutCreatorComponent";

export class CalloutListComponent {
    private container: HTMLElement;
    private plugin: SuperchargedCalloutsPlugin;
    private onUpdate: () => void;
    private creatorComponent: CreatorComponent;

    constructor(container: HTMLElement, plugin: SuperchargedCalloutsPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
    }

    public setCreatorComponent(creator: CreatorComponent): void {
        this.creatorComponent = creator;
    }

    public display(): void {
        this.container.empty();
        
        new Setting(this.container)
            .setHeading()
            .setName('Your custom callouts');
        
        const listEl = this.container.createEl('div', { cls: 'custom-callout-list' });
        
        if (this.plugin.settings.customCallouts.length === 0) {
            listEl.createEl('p', { text: 'No custom callouts created yet.', cls: 'text-muted' });
            return;
        }

        this.plugin.settings.customCallouts.forEach((callout, index) => {
            const itemEl = listEl.createDiv({ cls: 'custom-callout-item' });
            
            const iconEl = itemEl.createDiv({ cls: 'custom-callout-icon' });
            setIcon(iconEl, callout.icon);
            iconEl.style.color = callout.color;
            
            itemEl.createSpan({ text: callout.name });

            const editBtn = itemEl.createEl('button', { cls: 'edit-btn' });
            setIcon(editBtn, 'pencil');
            editBtn.onclick = () => {
                if (this.creatorComponent) {
                    this.creatorComponent.edit(callout, index);
                } else {
                    new Notice("Error: Creator component not linked.");
                }
            };
            
            const deleteBtn = itemEl.createEl('button', { cls: 'delete-btn' });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.onclick = async () => { 
                this.plugin.settings.customCallouts.splice(index, 1); 
                await this.plugin.saveAndApplyStyles(); 
                this.onUpdate();
                new Notice(`Deleted callout [!${callout.name}].`); 
            };
        });
    }
}