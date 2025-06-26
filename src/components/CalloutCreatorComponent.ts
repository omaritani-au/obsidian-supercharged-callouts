// src/components/CalloutCreatorComponent.ts

import { Setting, TextComponent, Notice, setIcon } from "obsidian";
import SuperchargedCalloutsPlugin from "../main";
import { IconPickerModal } from "../icon-picker";
import { CustomColorPicker } from "../ui/CustomColorPicker";
import { CustomCalloutDefinition } from "../types";
import { BaseCreatorComponent } from "./base/BaseCreatorComponent";

export class CreatorComponent extends BaseCreatorComponent<CustomCalloutDefinition> {
    protected entityName = "callout";
    protected settingsKey = "customCallouts" as const;

    getInitialData(): CustomCalloutDefinition {
        return { name: 'new-callout', icon: 'star', color: '#7f8c8d' };
    }

    validate(data: Partial<CustomCalloutDefinition>): boolean {
        if (!data.name || !data.icon || !data.color) {
            new Notice("Callout name, icon, and color cannot be empty.");
            return false;
        }
        return true;
    }

    renderForm(container: HTMLElement): void {
        const iconPreview = container.createDiv({ cls: 'icon-preview' });
        const updateIconPreview = (iconName: string, color: string) => {
            iconPreview.empty(); setIcon(iconPreview, iconName); iconPreview.style.color = color;
        };
        
        const s = new Setting(container).setName("Icon name");
        s.descEl.createEl('a', { text: "Find icons at lucide.dev", href: "https://lucide.dev/", attr: { target: "_blank" } });
        s.controlEl.prepend(iconPreview);
        
        let iconInput: TextComponent;
        s.addText(text => {
            iconInput = text;
            // FIX: Provide fallback for potentially undefined values
            text.setPlaceholder("e.g., rocket").setValue(this.data.icon || '').onChange(val => { this.data.icon = val.trim(); updateIconPreview(this.data.icon || '', this.data.color || ''); });
        }).addButton(button => {
            button.setButtonText("Browse").setTooltip("Browse icons").onClick(() => {
                new IconPickerModal(this.plugin.app, (chosenIcon) => {
                    this.data.icon = chosenIcon;
                    if (iconInput) iconInput.setValue(chosenIcon);
                    // FIX: Provide fallback for potentially undefined values
                    updateIconPreview(this.data.icon || '', this.data.color || '');
                }, this.data.color).open();
            });
        });

        // FIX: Provide fallback for potentially undefined values
        new Setting(container).setName("Callout name").addText(text => text.setPlaceholder("e.g., my-project-note").setValue(this.data.name || '').onChange(val => { this.data.name = val.toLowerCase().replace(/\s+/g, '-'); }));
        
        const colorSetting = new Setting(container)
            .setName("Accent color")
            .setDesc("Type a hex code or click the swatch to pick a color.");
            
        const customPicker = new CustomColorPicker(colorSetting.controlEl);
        // FIX: Provide fallback for potentially undefined values
        customPicker.build(this.data.color || '', (newColor) => {
            this.data.color = newColor;
            updateIconPreview(this.data.icon || '', this.data.color || '');
        });

        // FIX: Provide fallback for potentially undefined values
        updateIconPreview(this.data.icon || '', this.data.color || '');
    }

    // Override edit to handle the different data structure for callouts
    public edit(calloutData: { name: string, icon: string, color: string }, index: number): void {
        super.edit(calloutData, index);
    }
}