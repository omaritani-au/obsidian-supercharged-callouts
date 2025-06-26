// src/components/CalloutListComponent.ts

import { setIcon } from "obsidian";
import { CustomCalloutDefinition } from "../types";
import { CreatorComponent } from "./CalloutCreatorComponent";
import { BaseListComponent } from "./base/BaseListComponent";

export class CalloutListComponent extends BaseListComponent<CustomCalloutDefinition, CreatorComponent> {
    protected entityNamePlural = "callouts";
    protected settingsKey = "customCallouts" as const;

    renderItem(itemEl: HTMLElement, callout: CustomCalloutDefinition): void {
        const iconEl = itemEl.createDiv({ cls: 'custom-callout-icon' });
        setIcon(iconEl, callout.icon);
        iconEl.style.color = callout.color;
        
        itemEl.createSpan({ text: callout.name });
    }
}