// src/settings.ts

import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import SuperchargedCalloutsPlugin, { CalloutStyle } from "./main";
import { CreatorComponent } from "./components/CalloutCreatorComponent";
import { CalloutListComponent } from "./components/CalloutComponent";
import { ImportExportComponent } from "./components/ImportExportComponent";
import { ColumnColorCreatorComponent } from "./components/ColumnColorCreatorComponent";
import { ColumnColorListComponent } from "./components/ColumnColorComponent";

export class CalloutManagerSettingTab extends PluginSettingTab {
    plugin: SuperchargedCalloutsPlugin;

    constructor(app: App, plugin: SuperchargedCalloutsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        
        // --- APPEARANCE SECTION ---
        new Setting(containerEl)
            .setName("Global callout style")
            .setDesc("Choose the visual style for all callouts in your vault. This applies to standard, custom, and multi-column callouts.")
            .addDropdown(dropdown => {
                dropdown
                    .addOption('default', 'Obsidian default')
                    .addOption('clean-inbox', 'Clean box')
                    .addOption('borderless', 'Borderless')
                    .setValue(this.plugin.settings.calloutStyle)
                    .onChange(async (value: CalloutStyle) => {
                        this.plugin.settings.calloutStyle = value;
                        await this.plugin.saveSettings();
                        this.plugin.applyPluginStyles();
                        new Notice(`Callout style set to: ${value}`);
                    });
            });

        // ADDED: The first spacer div.
        containerEl.createDiv({ cls: 'sc-settings-spacer' });

        // --- Custom Column Colors Section ---
        const colorCreatorContainer = containerEl.createDiv();
        const colorListContainer = containerEl.createDiv();

        const colorCreatorComponent = new ColumnColorCreatorComponent(colorCreatorContainer, this.plugin, this.display.bind(this));
        const colorListComponent = new ColumnColorListComponent(colorListContainer, this.plugin, this.display.bind(this));
        colorListComponent.setCreatorComponent(colorCreatorComponent);

        colorCreatorComponent.display();
        colorListComponent.display();

        // --- CUSTOM CALLOUTS SECTION ---
        const calloutCreatorContainer = containerEl.createDiv();
        const calloutListContainer = containerEl.createDiv();
        
        const calloutCreatorComponent = new CreatorComponent(calloutCreatorContainer, this.plugin, this.display.bind(this));
        const calloutListComponent = new CalloutListComponent(calloutListContainer, this.plugin, this.display.bind(this));
        calloutListComponent.setCreatorComponent(calloutCreatorComponent);

        calloutCreatorComponent.display();
        calloutListComponent.display();
        
        // ADDED: The second spacer div.
        containerEl.createDiv({ cls: 'sc-settings-spacer' });

        // --- IMPORT/EXPORT SECTION ---
        const importExportContainer = containerEl.createDiv();
        new ImportExportComponent(importExportContainer, this.plugin, this.display.bind(this)).display();
    }
}