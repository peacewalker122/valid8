export const isLetter = (ch: string): boolean => {
	if (ch.length !== 1) {
		return false;
	}
	return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
};
