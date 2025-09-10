// Logging utility for VALID8
// Usage: log.debug(), log.error(), log.info()

const isVerbose = () => process.env.VALID8_DEBUG === "1" || process.env.VALID8_VERBOSE === "1";

export const log = {
	debug: (...args: any[]) => {
		if (isVerbose()) {
			const message = `[DEBUG] ${new Date().toISOString()} ${args.join(" ")}`;
			console.log(message);
		}
	},
	info: (...args: any[]) => {
		if (isVerbose()) {
			const message = `[INFO] ${new Date().toISOString()} ${args.join(" ")}`;
			console.log(message);
		}
	},
	error: (...args: any[]) => {
		let message = `[ERROR] ${new Date().toISOString()} ${args.join(" ")}`;
		// print the stack trace if available
		if (args[0] instanceof Error) {
			message += `\n${args[0].stack}`;
		}
		console.error(message);
	},
};
