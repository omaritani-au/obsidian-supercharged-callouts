// src/components/base/BaseCreatorComponent.ts

import { Setting, Notice } from "obsidian";
import SuperchargedCalloutsPlugin from "../../main";

export abstract class BaseCreatorComponent<T extends { name: string }> {
    protected container: HTMLElement;
    protected plugin: SuperchargedCalloutsPlugin;
    protected onUpdate: () => void;
    protected data: Partial<T> = {};
    protected editingIndex: number | null = null;
    
    // Abstract properties to be defined by subclasses
    protected abstract entityName: string;
    protected abstract settingsKey: keyof SuperchargedCalloutsPlugin['settings'];
    
    constructor(container: HTMLElement, plugin: SuperchargedCalloutsPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
        this.resetData();
    }

    // Abstract methods for subclasses to implement
    protected abstract renderForm(container: HTMLElement): void;
    protected abstract getInitialData(): T;
    protected abstract validate(data: Partial<T>): boolean;

    public edit(data: T, index: number): void {
        this.data = { ...data };
        this.editingIndex = index;
        this.display();
        this.container.scrollIntoView({ behavior: 'smooth' });
    }

    protected resetData(): void {
        this.data = this.getInitialData();
        this.editingIndex = null;
    }

    public display(): void {
        this.container.empty();
        new Setting(this.container)
            .setHeading()
            .setName(this.editingIndex !== null ? `Edit ${this.entityName}` : `Create new ${this.entityName}`);

        this.renderForm(this.container);

        const actionSetting = new Setting(this.container);
        if (this.editingIndex !== null) {
            actionSetting.addButton(btn => btn.setButtonText("Save changes").setCta().onClick(() => this.handleSave()));
            actionSetting.addButton(btn => btn.setButtonText("Cancel").onClick(() => {
                this.resetData();
                this.onUpdate();
            }));
        } else {
            actionSetting.addButton(btn => btn.setButtonText(`Add ${this.entityName}`).setCta().onClick(() => this.handleAdd()));
        }
    }

    private async handleSave(): Promise<void> {
        if (this.editingIndex === null || !this.validate(this.data)) return;
        
        // FIX: Use 'as unknown as T[]' to satisfy TypeScript's strict generic checking.
        const settingsArray = this.plugin.settings[this.settingsKey] as unknown as T[];
        settingsArray[this.editingIndex] = this.data as T;
        
        await this.plugin.saveAndApplyStyles();
        new Notice(`Updated ${this.entityName}: ${this.data.name}`);
        this.resetData();
        this.onUpdate();
    }

    private async handleAdd(): Promise<void> {
        if (!this.validate(this.data)) return;

        // FIX: Use 'as unknown as T[]' to satisfy TypeScript's strict generic checking.
        const settingsArray = this.plugin.settings[this.settingsKey] as unknown as T[];
        if (settingsArray.some(item => item.name === this.data.name)) {
            new Notice(`A ${this.entityName} with this name already exists.`);
            return;
        }

        settingsArray.push(this.data as T);
        await this.plugin.saveAndApplyStyles();
        new Notice(`Added new ${this.entityName}: ${this.data.name}`);
        this.resetData();
        this.onUpdate();
    }
}