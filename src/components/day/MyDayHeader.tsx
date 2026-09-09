/**
 * MyDayHeader — Daily greeting and date display (Design: My Day)
 *
 * Shows a warm Bahasa Indonesia greeting based on time of day,
 * current date, and motivational context.
 */

export function MyDayHeader() {
	const now = new Date();
	const hour = now.getHours();

	let greeting: string;
	if (hour < 11) greeting = "Selamat Pagi";
	else if (hour < 15) greeting = "Selamat Siang";
	else if (hour < 18) greeting = "Selamat Sore";
	else greeting = "Selamat Malam";

	const dateStr = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	return (
		<div className="mb-6">
			<h1 className="text-2xl font-semibold text-[#e8ecd4] tracking-tight">
				{greeting} ☀️
			</h1>
			<p className="text-sm text-text-muted mt-1 font-mono">{dateStr}</p>
		</div>
	);
}
