// src/components/CalloutCreatorComponent.ts

import { Setting, setIcon, TextComponent, Notice } from "obsidian";
import SuperchargedCalloutsPlugin from "../main";
import { IconPickerModal } from "../icon-picker";
import { CustomColorPicker } from "../ui/CustomColorPicker";

interface CustomCreatorData {
    name: string;
    icon: string;
    color: string;
}

export class CreatorComponent {
    private container: HTMLElement;
    private plugin: SuperchargedCalloutsPlugin;
    private data: CustomCreatorData;
    private onUpdate: () => void;
    private editingIndex: number | null = null;

    constructor(container: HTMLElement, plugin: SuperchargedCalloutsPlugin, onUpdate: () => void) {
        this.container = container;
        this.plugin = plugin;
        this.onUpdate = onUpdate;
        this.resetData();
    }

    private resetData(): void {
        this.data = { name: 'new-callout', icon: 'star', color: '#7f8c8d' };
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
        new Setting(this.container)
            .setHeading()
            .setName(this.editingIndex !== null ? "Edit custom callout" : "Create new custom callout");

        const iconPreview = this.container.createDiv({ cls: 'icon-preview' });
        const updateIconPreview = (iconName: string, color: string) => {
            iconPreview.empty(); setIcon(iconPreview, iconName); iconPreview.style.color = color;
        };
        
        const s = new Setting(this.container).setName("Icon name");
        s.descEl.createEl('a', { text: "Find icons at lucide.dev", href: "https://lucide.dev/", attr: { target: "_blank" } });
        s.controlEl.prepend(iconPreview);
        
        let iconInput: TextComponent;
        s.addText(text => {
            iconInput = text;
            text.setPlaceholder("e.g., rocket").setValue(this.data.icon).onChange(val => { this.data.icon = val.trim(); updateIconPreview(this.data.icon, this.data.color); });
        }).addButton(button => {
            button.setButtonText("Browse").setTooltip("Browse icons").onClick(() => {
                new IconPickerModal(this.plugin.app, (chosenIcon) => {
                    this.data.icon = chosenIcon;
                    if (iconInput) iconInput.setValue(chosenIcon);
                    updateIconPreview(this.data.icon, this.data.color);
                }, this.data.color).open();
            });
        });

        new Setting(this.container).setName("Callout name").addText(text => text.setPlaceholder("e.g., my-project-note").setValue(this.data.name).onChange(val => { this.data.name = val.toLowerCase().replace(/\s+/g, '-'); }));
        
        const colorSetting = new Setting(this.container)
            .setName("Accent color")
            .setDesc("Type a hex code or click the swatch to pick a color.");
            
        // FIX: The 'app' argument is no longer needed.
        const customPicker = new CustomColorPicker(colorSetting.controlEl);
        customPicker.build(this.data.color, (newColor) => {
            this.data.color = newColor;
            updateIconPreview(this.data.icon, this.data.color);
        });

        updateIconPreview(this.data.icon, this.data.color);

        const actionSetting = new Setting(this.container);
        if (this.editingIndex !== null) {
            actionSetting.addButton(btn => btn.setButtonText("Save changes").setCta().onClick(async () => {
                if (this.editingIndex === null) return;
                this.plugin.settings.customCallouts[this.editingIndex] = { ...this.data };
                await this.plugin.saveAndApplyStyles();
                new Notice(`Updated callout: ${this.data.name}`);
                this.resetData();
                this.onUpdate();
            }));
            actionSetting.addButton(btn => btn.setButtonText("Cancel").onClick(() => { this.resetData(); this.onUpdate(); }));
        } else {
            actionSetting.addButton(btn => btn.setButtonText("Add callout").setCta().onClick(async () => {
                if (!this.data.name || !this.data.icon) { new Notice("Callout name and icon name cannot be empty."); return; }
                if (this.plugin.settings.customCallouts.some(c => c.name === this.data.name)) { new Notice("A custom callout with this name already exists."); return; }
                this.plugin.settings.customCallouts.push({ ...this.data });
                await this.plugin.saveAndApplyStyles();
                new Notice(`New callout created: ${this.data.name}`);
                this.resetData();
                this.onUpdate();
            }));
        }
    }
}