// src/settings.ts

import { App, PluginSettingTab, Setting, Notice } from "obsidian";
// FIX: Removed 'ReorderStyle' from the import as it's no longer used.
import MultiColumnPlugin, { CalloutStyle } from "./main";
import { CreatorComponent } from "./components/CreatorComponent";
import { CalloutListComponent } from "./components/CalloutListComponent";
import { ImportExportComponent } from "./components/ImportExportComponent";
import { ColumnColorManagerComponent } from "./components/ColumnColorManagerComponent";

export class CalloutManagerSettingTab extends PluginSettingTab {
    plugin: MultiColumnPlugin;

    constructor(app: App, plugin: MultiColumnPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        
        containerEl.createEl("div", { text: "Advanced Callouts Manager", cls: "setting-item-name", attr: { "style": "font-size: 1.5em; margin-bottom: 10px;"} });
        containerEl.createEl("p", { text: "Create, edit, and manage your custom callout styles.", cls: "setting-item-description" });
        containerEl.createEl('hr');

        containerEl.createEl('h3', { text: 'Appearance', cls: 'callout-manager-section-header'});
        new Setting(containerEl)
            .setName("Global Callout Style")
            .setDesc("Choose the visual style for all callouts in your vault. This will apply to both standard and multi-column callouts.")
            .addDropdown(dropdown => {
                dropdown
                    .addOption('default', 'Obsidian Default')
                    .addOption('clean-inbox', 'Clean Box')
                    .addOption('borderless', 'Borderless')
                    .setValue(this.plugin.settings.calloutStyle)
                    .onChange(async (value: CalloutStyle) => {
                        this.plugin.settings.calloutStyle = value;
                        await this.plugin.saveSettings();
                        this.plugin.applyPluginStyles(); 
                        new Notice(`Callout style set to: ${value}`);
                    });
            });

        // The reordering style setting that was commented out is what caused the error.
        // It's safe to keep it commented out or remove it entirely.

        containerEl.createEl('hr');
        const columnColorContainer = containerEl.createDiv();
        new ColumnColorManagerComponent(columnColorContainer, this.plugin, this.display.bind(this)).display();

        const creatorContainer = containerEl.createDiv();
        const creatorComponent = new CreatorComponent(creatorContainer, this.plugin, this.display.bind(this));

        const listContainer = containerEl.createDiv();
        const listComponent = new CalloutListComponent(listContainer, this.plugin, this.display.bind(this));
        
        listComponent.setCreatorComponent(creatorComponent);

        creatorComponent.display();
        listComponent.display();
        
        const importExportContainer = containerEl.createDiv();
        new ImportExportComponent(importExportContainer, this.plugin, this.display.bind(this)).display();
    }
}