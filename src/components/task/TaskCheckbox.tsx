/**
 * TaskCheckbox — Custom toggle for task completion (Design: Checkboxes)
 *
 * Square checkbox with 3px corner radius.
 * Unchecked: 1.5px border in #656d4a, translucent canvas fill.
 * Checked: Background fill #a4ac86, stroke checkmark in #333d29.
 */

interface TaskCheckboxProps {
	checked: boolean;
	onChange: () => void;
	disabled?: boolean;
}

export function TaskCheckbox({
	checked,
	onChange,
	disabled = false,
}: TaskCheckboxProps) {
	return (
		<button
			type="button"
			onClick={onChange}
			disabled={disabled}
			className={`mt-0.5 size-4 rounded-[3px] flex-shrink-0 flex items-center justify-center transition-all duration-150 ${
				checked
					? "bg-primary border border-primary"
					: "border-[1.5px] border-card-border hover:border-primary hover:bg-primary/20 bg-surface-muted"
			}`}
			title={checked ? "Batalkan selesai" : "Tandai selesai"}
		>
			{checked && (
				<span className="material-symbols-outlined text-[12px] text-on-primary-container">
					check
				</span>
			)}
		</button>
	);
}
