// Logging utility for VALID8
// Usage: log.debug(), log.error(), log.info()
const debugEnabled = !!process.env.VALID8_DEBUG;
export const log = {
	debug: (...args: any[]) => {
		if (debugEnabled) {
			console.debug("[DEBUG]", ...args);
		}
	},
	info: (...args: any[]) => {
		console.info("[INFO]", ...args);
	},
	error: (...args: any[]) => {
		console.error("[ERROR]", ...args);
	},
};
