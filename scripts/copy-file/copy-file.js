const fs = require("fs");
const path = require("path");

const configPath = path.resolve(
	"C:\\Users\\Pawan\\Desktop\\FullStackProject\\warranty-management\\scripts\\config.json"
);

let config;

try {
	const configRaw = fs.readFileSync(configPath, "utf-8");
	config = JSON.parse(configRaw);
} catch (err) {
	console.error("Error reading or parsing config.json:", err.message);
	process.exit(1);
}

const { folderPath, outputPath } = config["copy-file"] || {};

if (!folderPath || !outputPath) {
	console.error("folderPath and outputPath must be set in config.json");
	process.exit(1);
}

/**
 * Recursively get all file paths under a directory, skipping outputPath folder if inside.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function getAllFiles(dir) {
	const entries = await fs.promises.readdir(dir, { withFileTypes: true });
	let files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		// Skip outputPath folder to avoid infinite recursion
		if (
			entry.isDirectory() &&
			path.resolve(fullPath) === path.resolve(outputPath)
		) {
			continue;
		}

		if (entry.isDirectory()) {
			const nestedFiles = await getAllFiles(fullPath);
			files = files.concat(nestedFiles);
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}
	return files;
}

(async () => {
	try {
		const absSource = path.resolve(folderPath);
		const absOutputDir = path.resolve(outputPath);
		const outputFilePath = path.join(absOutputDir, "outputFile.txt");

		// Ensure output directory exists
		await fs.promises.mkdir(absOutputDir, { recursive: true });

		const files = await getAllFiles(absSource);
		console.log(`Found ${files.length} files to process.`);

		// Open the output file in write mode (overwrites existing)
		const writableStream = fs.createWriteStream(outputFilePath, {
			encoding: "utf-8",
		});

		for (const file of files) {
			try {
				const content = await fs.promises.readFile(file, "utf-8");

				// Write file path as header
				writableStream.write(`\n===== File: ${file} =====\n`);
				// Write file content
				writableStream.write(content);
				writableStream.write("\n"); // Add newline after content

				console.log(`Appended: ${file}`);
			} catch (err) {
				console.error(`Failed to read file "${file}": ${err.message}`);
			}
		}

		writableStream.end(() => {
			console.log(
				`All files have been combined into:\n${outputFilePath}`
			);
		});
	} catch (err) {
		console.error("Unexpected error:", err);
	}
})();
