// Logging utility for VALID8
// Usage: log.debug(), log.error(), log.info()
const debugEnabled = process.env.VALID8_DEBUG !== "1";
export const log = {
	debug: (...args: any[]) => {
		if (debugEnabled) {
			console.debug("[DEBUG]", ...args);
		}
	},
	info: (...args: any[]) => {
		if (debugEnabled) {
			console.info("[INFO]", ...args);
		}
	},
	error: (...args: any[]) => {
		console.error("[ERROR]", ...args);
	},
};
