// src/main.ts

import { Plugin, Menu, MenuItem, Editor } from 'obsidian';
import { AdvancedCalloutModal } from './modal/AdvancedCalloutModal';
import { CalloutManagerSettingTab } from './settings';
import { SuperchargedCalloutsSettings, CustomCalloutDefinition, ColumnColorDefinition, CalloutStyle } from './types';
import { SuperchargedCalloutPostProcessor } from './rendering/PostProcessor';

export const DEFAULT_SETTINGS: SuperchargedCalloutsSettings = { customCallouts: [], calloutStyle: 'clean-inbox', customColumnColors: [] };
const STYLE_ID = 'supercharged-callout-styles';

function hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export default class SuperchargedCalloutsPlugin extends Plugin {
    settings: SuperchargedCalloutsSettings;
    private temporaryStyles: Map<string, string> = new Map();

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new CalloutManagerSettingTab(this.app, this));
        this.applyPluginStyles();

        this.registerEvent(this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor) => {
            menu.addItem((item: MenuItem) => {
                item.setTitle("Insert supercharged callout...")
                    .setIcon("layout-template")
                    .onClick(() => new AdvancedCalloutModal(this.app, editor, this).open());
            });
        }));

        this.registerMarkdownPostProcessor(SuperchargedCalloutPostProcessor);
    }

    onunload() {
        this.removePluginStyles();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    public applyPluginStyles() {
        document.getElementById(STYLE_ID)?.remove(); // Always remove old styles first
        if (this.settings.calloutStyle !== 'default') {
            document.body.classList.add(`callouts-style-${this.settings.calloutStyle}`);
        }
        this.injectAllCustomStyles();
    }
    
    public addTemporaryCalloutStyle(name: string, color: string) {
        this.temporaryStyles.set(name, color);
    }
    
    public clearTemporaryStyles() {
        this.temporaryStyles.clear();
    }

    private removePluginStyles() {
        document.body.classList.remove('callouts-style-clean-inbox', 'callouts-style-borderless');
        this.clearTemporaryStyles();
        document.getElementById(STYLE_ID)?.remove();
    }

    private injectAllCustomStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.innerHTML = this.generateCssFromSettings();
        document.head.appendChild(styleEl);
    }

    async saveAndApplyStyles() {
        await this.saveSettings();
        this.applyPluginStyles();
    }

    private generateCssFromSettings(): string {
        let cssContent = '';
        this.settings.customCallouts.forEach(callout => {
            const rgbColor = hexToRgb(callout.color);
            if (rgbColor) {
                const iconName = callout.icon.startsWith('lucide-') ? callout.icon.substring(7) : callout.icon;
                cssContent += `.callout[data-callout="${callout.name}"] { --callout-color: ${rgbColor}; --callout-icon: lucide-${iconName}; }\n`;
            }
        });
        this.settings.customColumnColors.forEach(columnColor => {
            cssContent += `.mcm-container .callout[data-callout="${columnColor.name}"] h3 { border-bottom-color: ${columnColor.color} !important; }\n`;
        });
        this.temporaryStyles.forEach((color, name) => {
            const rgbColor = hexToRgb(color);
            if (rgbColor) {
                cssContent += `.callout[data-callout="${name}"] { --callout-color: ${rgbColor}; }\n`;
            }
        });
        return cssContent;
    }
}