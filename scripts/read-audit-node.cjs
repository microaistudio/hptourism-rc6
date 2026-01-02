const xlsx = require('xlsx');

const filePath = '/home/subhash.thakur.india/Projects/hptourism-rc5dev1/A.PMD/Security Audit/HPSDC_Pre-Hosting_Homestay_WASA_Report_V1.0_24th_December_2025.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    console.log("Sheet Names:", workbook.SheetNames);

    // Iterate all sheets
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        // Look for rows with "High", "Medium", "Low" or "Risk"
        data.forEach((row, i) => {
            const str = JSON.stringify(row).toLowerCase();
            if (str.includes("high") || str.includes("medium") || str.includes("low") || str.includes("vulnerability") || str.includes("issue")) {
                console.log(`Row ${i}:`, JSON.stringify(row));
            }
        });
    });

} catch (error) {
    console.error("Error reading Excel file:", error.message);
}
