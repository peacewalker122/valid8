export const isLetter = (ch: string): boolean => {
	if (ch.length !== 1) {
		return false;
	}
	return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
};

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
