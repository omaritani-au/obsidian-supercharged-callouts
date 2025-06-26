// src/types.ts

export type ComponentType = 'callout' | 'color-block';
export type MultiColumnStyle = 'colored-underline' | 'simple-box' | 'component-in-column';

export interface CalloutData {
    componentType: ComponentType;
    type: string;
    title: string;
    collapse: string;
    noTitle: boolean;
    noIcon: boolean;
    color: string;
    content: string;
    titleAlign: 'left' | 'center' | 'right';
    contentAlign: 'left' | 'center' | 'right';
    width?: string; // For future use with multi-column
}

export interface ColumnData {
    type: string;
    title: string;
    content: string;
    titleAlign: 'left' | 'center' | 'right';
    contentAlign: 'left' | 'center' | 'right';
    noTitle: boolean;
    width?: string; // For future use with multi-column
}

export interface CustomCalloutDefinition {
    name: string;
    icon: string;
    color: string;
}

export interface ColumnColorDefinition {
    name: string;
    color: string;
}

export type CalloutStyle = 'default' | 'clean-inbox' | 'borderless';

export interface SuperchargedCalloutsSettings {
    customCallouts: CustomCalloutDefinition[];
    calloutStyle: CalloutStyle;
    customColumnColors: ColumnColorDefinition[];
}

export const standardCalloutTypes: Record<string, { icon: string, colorVar: string }> = {
    "note": { icon: "pencil", colorVar: "var(--callout-note)" }, "abstract": { icon: "clipboard-list", colorVar: "var(--callout-abstract)" },
    "info": { icon: "info", colorVar: "var(--callout-info)" }, "todo": { icon: "check-circle-2", colorVar: "var(--callout-todo)" },
    "tip": { icon: "flame", colorVar: "var(--callout-tip)" }, "success": { icon: "check", colorVar: "var(--callout-success)" },
    "question": { icon: "help-circle", colorVar: "var(--callout-question)" }, "warning": { icon: "alert-triangle", colorVar: "var(--callout-warning)" },
    "failure": { icon: "x", colorVar: "var(--callout-failure)" }, "danger": { icon: "zap", colorVar: "var(--callout-danger)" },
    "bug": { icon: "bug", colorVar: "var(--callout-bug)" }, "example": { icon: "list", colorVar: "var(--callout-example)" }, "quote": { icon: "quote", colorVar: "var(--callout-quote)" }
};