# Obsidian Line Ending CopyFix

An Obsidian plugin that ensures content copied from your notes uses platform-appropriate line endings. Currently, it targets **Windows users**, replacing Unix-style line feeds (`\n`) with Windows-style carriage return + line feed (`\r\n`) **only when copying text**. Your markdown files remain untouched.

---

## ✨ Features

-   🔁 Automatically replaces `\n` with `\r\n` **on copy** if your OS is Windows
-   🧠 Works with:
    -   Manual text selections (`Ctrl + C`)
    -   Code block “copy” buttons
    -   Retains obsidian's behaviour where copying without text selected copies the current line
    -   Pop-out windows
-   🔒 Does **not** modify your stored `.md` files
-   💻 Windows-only by default (future support for more platforms is planned)

---

## 📦 Installation

### From Obsidian: Community Plugins (Recommended)

Not yet available, I still need to submit it to the Obsidian community plugin directory.

### From GitHub: Manual Installation

1. Download the latest release from the [Releases page](https://github.com/KiwiJanus/obsidian-line-ending-copyfix/releases)
2. Extract the archive into your vault’s plugins folder `<your-vault>/.obsidian/plugins`. The folder structure should look like this:
    ```
    <your-vault>/.obsidian/plugins/obsidian-line-ending-copyfix/
    ├── main.js
    └── manifest.json
    ```
3. Restart Obsidian or reload plugins from **Settings → Community Plugins**
4. In Obsidian, open **Settings → Community Plugins**
5. In the list of installed plugins, find **Fix Line Endings on Copy** and enable it.

---

## 🧠 Why?

Obsidian uses LF (`\n`) line endings across all platforms, which is great for consistency.  
However, many older Windows applications expect CRLF (`\r\n`) line endings. Without this, copied content may appear "squished" into a single line.

This plugin solves that by converting line endings **only at the time of copying**, so your notes stay clean and portable.

---

## ⚙️ Future Plans

-   Submit to Obsidian's community plugin directory (approval pending)
-   Add command palette support for manual line-ending conversion
-   Make line-ending style configurable (LF, CRLF, CR)
-   Toggle plugin behavior with a settings UI
-   Add support for various platforms and their line-ending conventions if someone needs it

---

## 💬 Feedback / Contributing

Bug reports, feature requests, and pull requests are welcome on the [GitHub Repository](https://github.com/KiwiJanus/obsidian-line-ending-copyfix)
