// Logging utility for VALID8
// Usage: log.debug(), log.error(), log.info()
import * as fs from "fs";
import * as path from "path";

const debugEnabled = process.env.VALID8_DEBUG === "1";
const logFilePath = path.join("/tmp", "valid8.log");

// Write session header
const header = `--- New log session on ${new Date().toISOString()} ---\n`;
try {
	fs.appendFileSync(logFilePath, header);
} catch (err) {
	console.error("Failed to write session header:", err);
}

export const log = {
	debug: (...args: any[]) => {
		if (debugEnabled) {
			const message = `[DEBUG] ${new Date().toISOString()} ${args.join(" ")}\n`;
			try {
				fs.appendFileSync(logFilePath, message);
			} catch (err) {
				console.error("Failed to write debug log:", err);
			}
		}
	},
	info: (...args: any[]) => {
		if (debugEnabled) {
			const message = `[INFO] ${new Date().toISOString()} ${args.join(" ")}\n`;
			try {
				fs.appendFileSync(logFilePath, message);
			} catch (err) {
				console.error("Failed to write info log:", err);
			}
		}
	},
	error: (...args: any[]) => {
		let message = `[ERROR] ${new Date().toISOString()} ${args.join(" ")}\n`;
		// print the stack trace if available
		if (args[0] instanceof Error) {
			message += `${args[0].stack}\n`;
		}
		try {
			fs.appendFileSync(logFilePath, message);
		} catch (err) {
			console.error("Failed to write error log:", err);
		}
	},
};
