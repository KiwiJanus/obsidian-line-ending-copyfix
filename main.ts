import { Plugin, Platform, WorkspaceWindow } from "obsidian";

export default class LineEndingCopyFixPlugin extends Plugin {
	private isWindows = Platform.isWin;
	private originalWriteText?: (text: string) => Promise<void>;

	async onload() {
		if (!this.isWindows) {
			console.log("LineEndingCopyFixPlugin: Not on Windows, plugin functions disabled.");
			return;
		}

		// Add copy event listener on main window.
		this.registerDomEvent(document, "copy", this.onCopy);

		// TODO: Register copy event listener on all existing pop-out windows should plugin be enabled while they are open.

		// Add copy event listener on pop-out windows.
		this.registerEvent(
			this.app.workspace.on("window-open", (win: WorkspaceWindow, window: Window) => {
				this.registerDomEvent(window.document, "copy", this.onCopy);
			})
		);

		// Overwrite Obsidian clipboard write function
		this.patchClipboardWrite();
		console.log("LineEndingCopyFixPlugin: Loaded and active on Windows.");
	}

	onunload() {
		if (!this.isWindows) return;
		this.restoreClipboardWrite();
		console.log("LineEndingCopyFixPlugin: Unloaded and cleaned up.");
	}

	private onCopy = (event: ClipboardEvent) => {
		const selection = activeDocument.getSelection();

		if (!selection || selection.isCollapsed) {
			return;
		}

		const text = selection.toString();
		const modified = this.convertLineEndings(text);

		if (event.clipboardData) {
			event.clipboardData.setData("text/plain", modified);
		}
		else {
			console.warn("LineEndingCopyFixPlugin: Clipboard API not available.");
		}
	};

	private patchClipboardWrite() {
		if (this.originalWriteText) {
			// Already patched
			return;
		}

		this.originalWriteText = navigator.clipboard.writeText;

		const plugin = this;
		navigator.clipboard.writeText = async function (text: string): Promise<void> {
			const modified = plugin.convertLineEndings(text);
			return plugin.originalWriteText!.call(this, modified);
		};
	}

	private restoreClipboardWrite() {
		if (this.originalWriteText) {
			navigator.clipboard.writeText = this.originalWriteText;
			this.originalWriteText = undefined;
		}
	}

	private convertLineEndings(text: string): string {
		// Replace LF with CRLF for Windows
		return text.replace(/\n/g, "\r\n");
	}
}
