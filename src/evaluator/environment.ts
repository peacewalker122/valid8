export interface Environment {
	map: Map<string, string | undefined>; // Store the environment variables from the parser.
}

export const environment = {
	map: Map<string, string | undefined>, // Store the environment variables from the parser.
};
