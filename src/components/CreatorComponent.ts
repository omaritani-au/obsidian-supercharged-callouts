// src/components/CreatorComponent.ts

import { Setting, setIcon, TextComponent, Notice, ColorComponent } from "obsidian";
import MultiColumnPlugin from "../main";
import { IconPickerModal } from "../icon-picker";

interface CustomCreatorData {
    name: string;
    icon: string;
    color: string;
}

export class CreatorComponent {
    private container: HTMLElement;
    private plugin: MultiColumnPlugin;
    private data: CustomCreatorData;
    private onUpdate: () => void;
    private editingIndex: number | null = null;

    constructor(container: HTMLElement, plugin: MultiColumnPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
        this.resetData();
    }

    private resetData(): void {
        this.data = { name: 'new-callout', icon: 'lucide-star', color: '#ffffff' };
        this.editingIndex = null;
    }

    public edit(calloutData: { name: string, icon: string, color: string }, index: number): void {
        this.data = { ...calloutData };
        this.editingIndex = index;
        this.display();
        this.container.scrollIntoView({ behavior: 'smooth' });
    }

    public display(): void {
        this.container.empty();
        this.container.createEl('h3', { text: this.editingIndex !== null ? "Edit Custom Callout" : "Create New Custom Callout", cls: "callout-manager-section-header" });

        const iconPreview = this.container.createDiv({ cls: 'icon-preview' });
        const updateIconPreview = (iconName: string, color: string) => {
            iconPreview.empty(); setIcon(iconPreview, iconName); iconPreview.style.color = color;
        };
        
        const s = new Setting(this.container).setName("Icon Name");
        s.descEl.createEl('a', { text: "Find icons at lucide.dev", href: "https://lucide.dev/", attr: { target: "_blank" } });
        s.controlEl.prepend(iconPreview);
        
        let iconInput: TextComponent;
        s.addText(text => {
            iconInput = text;
            text.setPlaceholder("e.g., rocket").setValue(this.data.icon).onChange(val => { this.data.icon = val.trim(); updateIconPreview(this.data.icon, this.data.color); });
        }).addButton(button => {
            button.setButtonText("Browse").setTooltip("Browse Icons").onClick(() => {
                new IconPickerModal(this.plugin.app, (chosenIcon) => {
                    this.data.icon = chosenIcon;
                    if (iconInput) iconInput.setValue(chosenIcon);
                    updateIconPreview(this.data.icon, this.data.color);
                }, this.data.color).open();
            });
        });

        new Setting(this.container).setName("Callout Name").addText(text => text.setPlaceholder("e.g., my-project-note").setValue(this.data.name).onChange(val => { this.data.name = val.toLowerCase().replace(/\s+/g, '-'); }));
        
        // === FIX: Two-Way Binding for Color Picker ===
        let colorInput: TextComponent;
        let colorPicker: ColorComponent;
        new Setting(this.container)
            .setName("Accent Color")
            .setDesc("Type a hex code or click the swatch to pick a color.")
            .addText(text => {
                colorInput = text;
                text.setValue(this.data.color)
                    .onChange(val => {
                        this.data.color = val;
                        // When text changes, update the color picker's value
                        if (colorPicker) colorPicker.setValue(val);
                        updateIconPreview(this.data.icon, this.data.color);
                    });
            })
            .addColorPicker(picker => {
                colorPicker = picker;
                picker.setValue(this.data.color)
                    .onChange(val => {
                        this.data.color = val;
                        // When picker changes, update the text input's value
                        if (colorInput) colorInput.setValue(val);
                        updateIconPreview(this.data.icon, this.data.color);
                    });
            });

        updateIconPreview(this.data.icon, this.data.color);

        const actionSetting = new Setting(this.container);
        if (this.editingIndex !== null) {
            actionSetting.addButton(btn => btn.setButtonText("Save Changes").setCta().onClick(async () => {
                if (this.editingIndex === null) return;
                this.plugin.settings.customCallouts[this.editingIndex] = { ...this.data };
                await this.plugin.saveAndApplyStyles();
                new Notice(`Updated callout [!${this.data.name}].`);
                this.resetData();
                this.onUpdate();
            }));
            actionSetting.addButton(btn => btn.setButtonText("Cancel").onClick(() => { this.resetData(); this.onUpdate(); }));
        } else {
            actionSetting.addButton(btn => btn.setButtonText("Add Callout").setCta().onClick(async () => {
                if (!this.data.name || !this.data.icon) { new Notice("Callout Name and Icon Name cannot be empty."); return; }
                if (this.plugin.settings.customCallouts.some(c => c.name === this.data.name)) { new Notice("A custom callout with this name already exists."); return; }
                this.plugin.settings.customCallouts.push({ ...this.data });
                await this.plugin.saveAndApplyStyles();
                new Notice(`New callout [!${this.data.name}] created.`);
                this.resetData();
                this.onUpdate();
            }));
        }
    }
}