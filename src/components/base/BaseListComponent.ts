// src/components/base/BaseListComponent.ts

import { Notice, Setting, setIcon } from "obsidian";
import SuperchargedCalloutsPlugin from "../../main";
import { BaseCreatorComponent } from "./BaseCreatorComponent";

export abstract class BaseListComponent<T extends { name: string }, C extends BaseCreatorComponent<T>> {
    protected container: HTMLElement;
    protected plugin: SuperchargedCalloutsPlugin;
    protected onUpdate: () => void;
    protected creatorComponent: C;
    
    // Abstract properties to be defined by subclasses
    protected abstract entityNamePlural: string;
    protected abstract settingsKey: keyof SuperchargedCalloutsPlugin['settings'];

    constructor(container: HTMLElement, plugin: SuperchargedCalloutsPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
    }
    
    public setCreatorComponent(creator: C): void {
        this.creatorComponent = creator;
    }
    
    // Abstract method for subclasses to implement
    protected abstract renderItem(itemEl: HTMLElement, item: T): void;

    public display(): void {
        this.container.empty();
        // FIX: Use 'as unknown as T[]' to satisfy TypeScript's strict generic checking.
        const settingsArray = this.plugin.settings[this.settingsKey] as unknown as T[];

        if (settingsArray.length === 0) {
            // Don't show the heading if the list is empty, except for callouts.
            if (this.settingsKey !== 'customCallouts') return;
        }
        
        new Setting(this.container)
            .setHeading()
            .setName(`Your custom ${this.entityNamePlural}`);

        const listEl = this.container.createEl('div', { cls: 'custom-callout-list' });

        if (settingsArray.length === 0) {
            listEl.createEl('p', { text: `No custom ${this.entityNamePlural} created yet.`, cls: 'text-muted' });
            return;
        }

        settingsArray.forEach((item, index) => {
            const itemEl = listEl.createDiv({ cls: 'custom-callout-item' });
            
            this.renderItem(itemEl, item);

            const editBtn = itemEl.createEl('button', { cls: 'edit-btn' });
            setIcon(editBtn, 'pencil');
            editBtn.onclick = () => {
                if (this.creatorComponent) {
                    this.creatorComponent.edit(item, index);
                } else {
                    new Notice("Error: Creator component not linked.");
                }
            };
            
            const deleteBtn = itemEl.createEl('button', { cls: 'delete-btn' });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.onclick = async () => {
                // FIX: Use 'as unknown as T[]' to satisfy TypeScript's strict generic checking.
                (this.plugin.settings[this.settingsKey] as unknown as T[]).splice(index, 1);
                await this.plugin.saveAndApplyStyles();
                this.onUpdate();
                new Notice(`Deleted ${item.name}.`);
            };
        });
    }
}