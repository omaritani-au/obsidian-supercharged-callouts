// src/components/ColumnColorListComponent.ts

import { ColumnColorDefinition } from "../types";
import { ColumnColorCreatorComponent } from "./ColumnColorCreatorComponent";
import { BaseListComponent } from "./base/BaseListComponent";

export class ColumnColorListComponent extends BaseListComponent<ColumnColorDefinition, ColumnColorCreatorComponent> {
    protected entityNamePlural = "colors";
    protected settingsKey = "customColumnColors" as const;

    renderItem(itemEl: HTMLElement, colorDef: ColumnColorDefinition): void {
        itemEl.createDiv({ 
            attr: { 
                style: `width: 20px; height: 20px; border-radius: 50%; background-color: ${colorDef.color}; border: 1px solid var(--background-modifier-border); margin-right: 10px;` 
            }
        });

        itemEl.createSpan({ text: colorDef.name });
    }
}