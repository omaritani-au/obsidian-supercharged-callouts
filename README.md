# Supercharged Callouts

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/omaritani)

A powerful layout and styling engine for Obsidian. Go beyond simple admonitions and structure your notes with multi-column layouts, custom-designed callouts, and vault-wide visual themes.

![Supercharged Callouts Main Showcase GIF](https://github.com/user-attachments/assets/125a3c7d-4dcd-4898-ae4d-7de7f39baf2b)

---

## Features

Supercharged Callouts takes Obsidian's core callout feature and transforms it into a flexible tool for creating beautiful and functional page layouts.

- **Multi-Column Layouts:** Arrange content side-by-side using a simple and intuitive modal.
- **Custom Callout Creator:** Design your own callout types with custom icons and colors.
- **Global Theming Engine:** Instantly change the look of all callouts in your vault.
- **Live Preview:** See exactly what your callout will look like as you type.
- **Dynamic Editors:** Easily add, remove, and reorder content with the click of a button.
- **Built-in Icon Browser:** Search the entire Lucide icon set from within Obsidian.
- **Import & Export:** Share your custom callout definitions with others.

---

## Showcase

See what's possible with Supercharged Callouts. From simple aesthetic tweaks to complex, functional dashboards, you have the tools to build notes that work for you.

### 1. Design Your Own Callouts

Stop searching for the perfect callout and start creating it. The settings panel gives you full control to design callouts that match your exact workflow, complete with custom colors and any of the 800+ icons from the Lucide set.

![A screenshot of the plugin's settings page, showing the list of custom callouts and the creator interface.](https://github.com/user-attachments/assets/6a09c8e5-1f13-4803-a416-8e5b25cbc8c0)

### 2. Apply Beautiful Vault-Wide Themes

Instantly change the feel of your entire vault. The selected style applies to all callouts—standard, custom, and multi-column—for a beautiful, consistent appearance.

**`Clean Box` Theme:**
![A screenshot of three custom callouts using the 'Clean Box' theme.](https://github.com/user-attachments/assets/e3e3a7f6-4685-4f81-9034-099beb19f84a)

**`Borderless` Theme:**
![A screenshot of the same three callouts using the 'Borderless' theme.](https://github.com/user-attachments/assets/40b8574f-28d5-403d-8698-9a50e8c7872a)

### 3. Create Versatile Multi-Column Layouts

Break free from the single-column limit. The plugin supports standard columns, or you can elevate your layouts by using your own personally-designed callouts as columns.

**Standard Columns:**
![A screenshot showing a standard multi-column layout.](https://github.com/user-attachments/assets/891642dd-d52b-4a0b-9fde-9c28e6afc8c2)

**Custom Callouts as Columns (`Clean Box` Theme):**
![A screenshot showing custom callouts as columns in the 'Clean Box' theme.](https://github.com/user-attachments/assets/107691fb-c368-4f5c-aba4-720d7fba755a)

**Custom Callouts as Columns (`Borderless` Theme):**
![A screenshot showing custom callouts as columns in the 'Borderless' theme.](https://github.com/user-attachments/assets/44c8043e-9084-4c33-bb6f-ede9ff69c039)

### 4. Build Powerful Dashboards

The real power of Supercharged Callouts is unleashed when you combine all of its features. Create project hubs, course dashboards, daily planners, and anything else you can imagine. Notice how the entire dashboard below adapts to the global theme with a single click.

**Dashboard in `Clean Box` Theme:**
![A screenshot of a detailed course dashboard in the 'Clean Box' theme.](https://github.com/user-attachments/assets/daceda42-5ca8-4248-a710-f7cc43af7ecd)

**The Same Dashboard in `Borderless` Theme:**
![A screenshot of the same course dashboard in the 'Borderless' theme.](https://github.com/user-attachments/assets/d87f6be9-dd69-46e0-90d9-bb0d2f688861)

---

## How to Use

1.  In the editor, right-click and select **"Insert Supercharged Callout..."** from the context menu.
2.  Use the **Standard** or **Multi-Column** tab to build your content.
3.  Customize types, colors, and content using the intuitive controls.
4.  Watch the **Live Preview** at the bottom to see your changes in real-time.
5.  Click **"Insert"** to add the generated markdown to your note.

To manage your custom callouts, colors, and themes, go to `Settings` -> `Supercharged Callouts`.

## Roadmap & Future Vision

This plugin has a solid foundation, but the journey is just beginning. Here are some of the features planned for the future:

-   [ ] **Advanced Column Widths:** Individual width controls for each column to create asymmetric layouts (e.g., sidebar + main content).
-   [ ] **Inline "Badges" or "Pills":** A third content type for creating small, colorful inline tags like `[!!icon|label|color]`.
-   [ ] **Advanced Layout Engine:** Evolve beyond simple columns to include options for Grid, Masonry, and more.
-   [ ] **Drag-and-Drop Reordering:** An alternative to the arrow buttons for reordering columns and nested callouts.
-   [ ] **Settings Page UI Overhaul:** Redesign the settings page for an even cleaner and more searchable management experience.

## About the Development

This plugin was born from a simple idea and grew into a truly ambitious project. Its development has been a unique collaboration between myself and an AI assistant.

-   **My Role:** As the project architect, I drove the vision, designed the user experience, and performed the critical debugging. I identified the core features, directed the refactoring of the codebase, and rigorously tested each component to find subtle bugs in the UI and rendering logic. My role was to guide, refine, and validate, ensuring the final result was stable, functional, and polished.
-   **AI Collaboration:** The AI served as a powerful pair programmer. I tasked it with generating initial code blocks, implementing well-defined functions, and handling the often tedious process of writing boilerplate code. This provided a rapid first draft, which I then iterated upon, corrected, and integrated into the larger project structure.

This partnership allowed for an incredibly fast development cycle, turning a complex concept into a feature-rich plugin. It's a testament to how human vision and AI execution can work together effectively.

### Acknowledgements

This project was heavily inspired by the creativity and functionality of the following amazing community plugins:
- **Multi-column Markdown plugin by `ckRobinson`:** The original inspiration for integrating multi-column functionality.
- **Editing Toolbar plugin by `cmenu`:** Its clean UI for custom callouts provided a fantastic reference for building an intuitive user experience.

---

## Manual Installation

1.  Download the `main.js`, `styles.css`, and `manifest.json` files from the latest [release](https://github.com/omaritani-au/obsidian-supercharged-callouts/releases).
2.  In your Obsidian vault, navigate to the `.obsidian/plugins/` directory.
3.  Create a new folder named `supercharged-callouts`.
4.  Copy the three downloaded files into this new folder.
5.  Restart Obsidian.
6.  Go to `Settings` -> `Community plugins`, find "Supercharged Callouts", and enable it.

## Support

If you find this plugin helpful and want to show your appreciation, you can support my work by buying me a coffee! It helps me cover my student expenses and dedicate more time to building useful tools for the Obsidian community.

<a href="https://ko-fi.com/omaritani" target="_blank">
  <img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi2.png?v=3" border="0" alt="Buy Me a Coffee at ko-fi.com" />
</a>