/**
 * QuickCapture — Natural language input + live parsed preview (FR-1.1)
 *
 * Single input field that parses text in real-time using chrono-node,
 * showing preview chips for detected deadline, priority, and category.
 */
import { useCallback, useState } from "react";
import { type ParsedTask, parseQuickInput } from "#/lib/quick-parser";

interface QuickCaptureProps {
	onSubmit: (parsed: ParsedTask) => void;
}

export function QuickCapture({ onSubmit }: QuickCaptureProps) {
	const [value, setValue] = useState("");
	const [parsed, setParsed] = useState<ParsedTask | null>(null);
	const [isFocused, setIsFocused] = useState(false);

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setValue(text);
		if (text.trim().length > 2) {
			setParsed(parseQuickInput(text));
		} else {
			setParsed(null);
		}
	}, []);

	const handleSubmit = useCallback(() => {
		if (!value.trim()) return;
		const result = parsed ?? parseQuickInput(value);
		onSubmit(result);
		setValue("");
		setParsed(null);
	}, [value, parsed, onSubmit]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleSubmit();
			}
		},
		[handleSubmit],
	);

	return (
		<div className="relative">
			<div
				className={`flex items-center gap-2 rounded-lg border transition-colors ${
					isFocused
						? "border-primary shadow-[0_0_0_1px_#a4ac86]"
						: "border-card-border"
				} bg-surface-muted px-4 py-3`}
			>
				<span className="material-symbols-outlined text-text-muted text-[20px]">
					add_task
				</span>
				<input
					type="text"
					value={value}
					onChange={handleChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					onKeyDown={handleKeyDown}
					placeholder="Tambah tugas... (misal: 'Skripsi besok jam 12 @Kuliah')"
					className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-muted/60 outline-none font-sans"
				/>
				{value.trim() && (
					<button
						type="button"
						onClick={handleSubmit}
						className="text-primary hover:text-primary-hover transition-colors"
					>
						<span className="material-symbols-outlined text-[20px]">
							submit
						</span>
					</button>
				)}
			</div>

			{/* Live parsed preview chips */}
			{parsed && isFocused && (
				<div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
					{parsed.title !== value.trim() && (
						<span className="px-2 py-0.5 rounded bg-card text-text-main font-medium border border-card-border/40 text-[11px]">
							📝 {parsed.title}
						</span>
					)}
					{parsed.deadline && (
						<span className="px-2 py-0.5 rounded bg-safe-bg text-safe-text font-mono text-[11px] border border-safe-border/40">
							⏰{" "}
							{parsed.rawDateText ??
								parsed.deadline.toLocaleDateString("id-ID", {
									weekday: "short",
									day: "numeric",
									month: "short",
								})}
						</span>
					)}
					<span
						className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase ${
							parsed.priority === "high"
								? "bg-urgent-bg text-urgent-text"
								: parsed.priority === "low"
									? "bg-safe-bg text-safe-text"
									: "bg-warning-bg text-warning-text"
						}`}
					>
						{parsed.priority === "high"
							? "▲ Tinggi"
							: parsed.priority === "low"
								? "▼ Rendah"
								: "● Sedang"}
					</span>
					{parsed.categoryName && (
						<span className="px-2 py-0.5 rounded bg-surface-muted text-text-muted font-mono text-[11px] border border-card-border/40">
							🏷️ #{parsed.categoryName}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
