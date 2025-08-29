import { printTable } from "./table";

describe("TestTable", () => {
	it("should print the table from the given value and result", () => {
		const headers = ["P", "Q", "P -> Q", "P -> Q ∧ Q"];
		const rows = [
			true,
			true,
			true,
			true,
			//
			true,
			false,
			false,
			false,
			//
			false,
			true,
			true,
			true,
			//
			false,
			false,
			true,
			true,
		];

		printTable(headers, rows);
	});
});
