var Table = require("cli-table3");

export const printTable = (headers: string[], rows: boolean[]): void => {
	// if (rows.length % headers.length !== 0) {
	// 	throw new Error(
	// 		"Rows length must be a multiple of headers length minus one.",
	// 	);
	// }

	var table = new Table({
		head: headers,
		style: { head: ["cyan"] },
	});

	for (let i = 0; i < rows.length; i++) {
		const tableRows: string[] = [];

		for (let j = 0; j < headers.length; j++) {
			const index = i + j;
			tableRows.push(rows[index] ? "T" : "F");
		}

		i += headers.length - 1;
		table.push(tableRows);
	}

	console.log(table.toString());
};
