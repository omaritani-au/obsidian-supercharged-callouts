// src/components/CalloutListComponent.ts

import { Notice, setIcon } from "obsidian";
import MultiColumnPlugin from "../main";
import { CreatorComponent } from "./CreatorComponent"; // We need to know about the CreatorComponent

export class CalloutListComponent {
    private container: HTMLElement;
    private plugin: MultiColumnPlugin;
    private onUpdate: () => void;
    
    // It will hold a reference to the creator component to call its public methods
    private creatorComponent: CreatorComponent;

    constructor(container: HTMLElement, plugin: MultiColumnPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
    }

    // A public method so the settings tab can link it to the creator
    public setCreatorComponent(creator: CreatorComponent): void {
        this.creatorComponent = creator;
    }

    public display(): void {
        this.container.empty();
        this.container.createEl('h3', { 
            text: 'Your Custom Callouts',
            cls: "callout-manager-section-header"
        });
        
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

            // --- Edit Button ---
            const editBtn = itemEl.createEl('button', { cls: 'edit-btn' });
            setIcon(editBtn, 'pencil');
            editBtn.onclick = () => {
                if (this.creatorComponent) {
                    // Call the public 'edit' method on the creator component
                    this.creatorComponent.edit(callout, index);
                }
            };
            
            // --- Delete Button ---
            const deleteBtn = itemEl.createEl('button', { cls: 'delete-btn' });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.onclick = async () => { 
                this.plugin.settings.customCallouts.splice(index, 1); 
                await this.plugin.saveAndApplyStyles(); 
                this.onUpdate(); // Tell the settings tab to refresh everything
                new Notice(`Deleted callout [!${callout.name}].`); 
            };
        });
    }
}