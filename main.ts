import { Plugin } from "obsidian";

export default class LineEndingCopyFixPlugin extends Plugin {
	private isWindows = process.platform === "win32";
	private originalWriteText?: (text: string) => Promise<void>;

	async onload() {
		if (!this.isWindows) {
			console.log("LineEndingCopyFixPlugin: Not on Windows, plugin disabled.");
			return;
		}

		document.addEventListener("copy", this.onCopy);
		this.patchClipboardWrite();

		console.log("LineEndingCopyFixPlugin: Loaded and active on Windows.");
	}

	onunload() {
		if (!this.isWindows) return;

		document.removeEventListener("copy", this.onCopy);
		this.restoreClipboardWrite();

		console.log("LineEndingCopyFixPlugin: Unloaded and cleaned up.");
	}

	private onCopy = (event: ClipboardEvent) => {
		const selection = document.getSelection();
		if (!selection) return;

		const text = selection.toString();
		const modified = this.convertLineEndings(text);

		event.preventDefault();

		if (event.clipboardData) {
			event.clipboardData.setData("text/plain", modified);
		}

		console.log("LineEndingCopyFixPlugin: Modified clipboard contents via copy event.");
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

		console.log("LineEndingCopyFixPlugin: Patched navigator.clipboard.writeText.");
	}

	private restoreClipboardWrite() {
		if (this.originalWriteText) {
			navigator.clipboard.writeText = this.originalWriteText;
			this.originalWriteText = undefined;
			console.log("LineEndingCopyFixPlugin: Restored original clipboard.writeText.");
		}
	}

	private convertLineEndings(text: string): string {
		// Replace LF with CRLF for Windows
		return text.replace(/\n/g, "\r\n");
	}
}
