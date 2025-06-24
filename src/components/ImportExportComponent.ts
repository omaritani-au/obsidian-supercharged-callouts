// src/components/ImportExportComponent.ts

import { Notice, Setting } from "obsidian";
import MultiColumnPlugin from "../main";

export class ImportExportComponent {
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
            text: 'Import / Export',
            cls: "callout-manager-section-header"
        });

        const importExportSetting = new Setting(this.container)
            .setName("Manage Your Callouts")
            .setDesc("Save your custom callout list to a file or load one from a backup or a friend!");

        // --- EXPORT Button Logic ---
        importExportSetting.addButton(button => {
            button.setButtonText("Export").onClick(() => {
                const dataStr = JSON.stringify(this.plugin.settings.customCallouts, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'obsidian-advanced-callouts.json';
                a.click();
                URL.revokeObjectURL(url);
                new Notice("Custom callouts exported!");
            });
        });

        // --- IMPORT Button Logic ---
        importExportSetting.addButton(button => {
            const input = createEl('input', { type: 'file', attr: { accept: '.json', style: 'display: none;' }});
            this.container.appendChild(input); // Add the hidden input to the DOM

            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                try {
                    const content = await file.text();
                    const importedCallouts = JSON.parse(content);

                    if (!Array.isArray(importedCallouts) || !importedCallouts.every(item => item.name && item.icon && item.color)) {
                        new Notice("Error: Invalid or malformed JSON file.");
                        return;
                    }

                    const existingCallouts = this.plugin.settings.customCallouts;
                    let addedCount = 0;
                    let updatedCount = 0;

                    importedCallouts.forEach(imported => {
                        const existingIndex = existingCallouts.findIndex(c => c.name === imported.name);

                        if (existingIndex !== -1) {
                            existingCallouts[existingIndex] = imported;
                            updatedCount++;
                        } else {
                            existingCallouts.push(imported);
                            addedCount++;
                        }
                    });

                    this.plugin.settings.customCallouts = existingCallouts;
                    await this.plugin.saveAndApplyStyles();
                    
                    new Notice(`Import complete: ${addedCount} added, ${updatedCount} updated.`);
                    this.onUpdate(); // Refresh the settings page to show the new list
                } catch (error) {
                    new Notice("Error reading or parsing file. See console for details.");
                    console.error("Callout import error:", error);
                }
            };
            button.setButtonText("Import").onClick(() => {
                input.click();
            });
        });
    }
}