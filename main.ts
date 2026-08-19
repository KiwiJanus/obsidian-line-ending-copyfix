import { Plugin, Platform, WorkspaceWindow } from "obsidian";
import { EditorView } from "@codemirror/view";

type ClipboardPatch = {
	original: (text: string) => Promise<void>;
	replacement: (text: string) => Promise<void>;
};

export default class LineEndingCopyFixPlugin extends Plugin {
	private isWindows = Platform.isWin;
	private clipboardPatches = new Map<Clipboard, ClipboardPatch>();
	private handledDocuments = new Set<Document>();

	async onload() {
		if (!this.isWindows) return;

		// CodeMirror owns the real editor state, including lines that are not
		// currently rendered in the virtualized editor DOM.
		this.registerEditorExtension(
			EditorView.clipboardOutputFilter.of((text) => this.convertLineEndings(text))
		);

		this.setupWindow(window);
		this.app.workspace.iterateAllLeaves((leaf) => {
			const viewWindow = leaf.view?.containerEl.ownerDocument.defaultView;
			if (viewWindow) this.setupWindow(viewWindow);
		});

		this.registerEvent(
			this.app.workspace.on("window-open", (_win: WorkspaceWindow, popoutWindow: Window) => {
				this.setupWindow(popoutWindow);
			})
		);
	}

	onunload() {
		if (!this.isWindows) return;
		this.restoreClipboardWrites();
	}

	private setupWindow(targetWindow: Window) {
		if (!this.handledDocuments.has(targetWindow.document)) {
			this.handledDocuments.add(targetWindow.document);
			this.registerDomEvent(targetWindow.document, "copy", this.onReadingCopy);
		}

		this.patchClipboardWrite(targetWindow);
	}

	private onReadingCopy = (event: ClipboardEvent) => {
		const target = event.target as Node | null;
		const eventWindow = (event as ClipboardEvent & { view?: Window }).view;
		const currentDocument = event.currentTarget as Document | null;
		const document = target?.ownerDocument ?? currentDocument ?? eventWindow?.document ?? window.document;
		const selection = document?.getSelection();

		// Leave collapsed selections to Obsidian/CodeMirror, which copies the
		// current line using its native behavior.
		if (!selection || selection.isCollapsed || !this.isReadingSelection(selection)) return;
		if (!event.clipboardData || selection.rangeCount === 0) return;

		const text = selection.toString();
		const range = selection.getRangeAt(0);
		const ownerDocument = range.commonAncestorContainer.ownerDocument;
		if (!ownerDocument) return;
		const container = ownerDocument.createElement("div");
		container.appendChild(range.cloneContents());

		try {
			event.clipboardData.clearData();
			event.clipboardData.setData("text/plain", this.convertLineEndings(text));
			event.clipboardData.setData("text/html", container.innerHTML);
			event.preventDefault();
		} catch {
			// If the host refuses clipboard writes, leave native copy untouched.
		}
	};

	private isReadingSelection(selection: Selection): boolean {
		return this.isReadingNode(selection.anchorNode) && this.isReadingNode(selection.focusNode);
	}

	private isReadingNode(node: Node | null): boolean {
		let element = node instanceof Element ? node : node?.parentElement;
		while (element) {
			if (element.classList.contains("markdown-reading-view")) return true;
			element = element.parentElement;
		}
		return false;
	}

	private patchClipboardWrite(targetWindow: Window) {
		const clipboard = targetWindow.navigator.clipboard;
		if (!clipboard || this.clipboardPatches.has(clipboard)) return;

		const original = clipboard.writeText;
		if (typeof original !== "function") return;

		const plugin = this;
		const replacement = function (this: Clipboard, text: string): Promise<void> {
			return original.call(this, plugin.convertLineEndings(text));
		};

		clipboard.writeText = replacement;
		this.clipboardPatches.set(clipboard, { original, replacement });
	}

	private restoreClipboardWrites() {
		for (const [clipboard, patch] of this.clipboardPatches) {
			if (clipboard.writeText === patch.replacement) clipboard.writeText = patch.original;
		}
		this.clipboardPatches.clear();
		this.handledDocuments.clear();
	}

	private convertLineEndings(text: string): string {
		return text.replace(/\r\n|\r|\n/g, "\r\n");
	}
}
