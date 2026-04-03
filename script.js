document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const costSheetPreview = document.getElementById('costSheetPreview');
    const emptyState = document.getElementById('emptyState');

    // Tax Type Toggles
    const setupTaxToggle = (name, percentFieldsId, amountFieldsId) => {
        const radios = document.getElementsByName(name);
        const percentFields = document.getElementById(percentFieldsId);
        const amountFields = document.getElementById(amountFieldsId);

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'percentage') {
                    percentFields.classList.remove('hidden');
                    amountFields.classList.add('hidden');
                } else {
                    percentFields.classList.add('hidden');
                    amountFields.classList.remove('hidden');
                }
            });
        });
    };

    setupTaxToggle('stampDutyType', 'stampDutyPercentFields', 'stampDutyAmountFields');
    setupTaxToggle('regType', 'regPercentFields', 'regAmountFields');
    setupTaxToggle('gstType', 'gstPercentFields', 'gstAmountFields');

    generateBtn.addEventListener('click', generateCostSheet);

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount).replace('₹', 'Rs. ');
    }

    function generateCostSheet() {
        const data = {
            customerName: document.getElementById('customerName').value,
            config: document.getElementById('config').value,
            area: parseFloat(document.getElementById('area').value) || 0,
            basicRate: parseFloat(document.getElementById('basicRate').value) || 0,
            devCharges: parseFloat(document.getElementById('devCharges').value) || 0,
            floorRiseRate: parseFloat(document.getElementById('floorRiseRate').value) || 0,
            numFloors: parseFloat(document.getElementById('numFloors').value) || 0,
            societyCharge: parseFloat(document.getElementById('societyCharge').value) || 0,
            amenitiesCharge: parseFloat(document.getElementById('amenitiesCharge').value) || 0,
            parkingCharge: parseFloat(document.getElementById('parkingCharge').value) || 0,
            legalCharge: parseFloat(document.getElementById('legalCharge').value) || 0,
        };

        // Calculations
        const basicCost = data.area * data.basicRate;
        const devCost = data.area * data.devCharges;
        const floorRiseCost = data.area * data.floorRiseRate * data.numFloors;
        
        let agreementValue = basicCost + devCost + floorRiseCost + data.societyCharge + 
                             data.amenitiesCharge + data.parkingCharge + data.legalCharge;

        // Statutory Calculations
        const getTaxAmount = (typePrefix) => {
            const type = document.querySelector(`input[name="${typePrefix}Type"]:checked`).value;
            if (type === 'percentage') {
                const avInput = document.getElementById(`${typePrefix}AgreementValue`).value;
                const av = avInput ? parseFloat(avInput) : agreementValue;
                const pct = parseFloat(document.getElementById(`${typePrefix}Percent`).value) || 0;
                return (av * pct) / 100;
            } else {
                return parseFloat(document.getElementById(`${typePrefix}Amount`).value) || 0;
            }
        };

        const stampDuty = getTaxAmount('stampDuty');
        const registration = getTaxAmount('reg');
        const gst = getTaxAmount('gst');

        const grandTotal = agreementValue + stampDuty + registration + gst;

        // Update UI
        document.getElementById('previewCustomerName').textContent = data.customerName ? `Customer: ${data.customerName}` : 'Customer: Valued Client';
        document.getElementById('previewConfig').textContent = `Configuration: ${data.config}`;
        document.getElementById('previewArea').textContent = `Area: ${data.area} sqft`;
        document.getElementById('previewDate').textContent = `Date: ${new Date().toLocaleDateString('en-IN')}`;

        const tableBody = document.getElementById('costTableBody');
        tableBody.innerHTML = '';

        const addRow = (label, amount, isSubtotal = false) => {
            if (amount > 0 || label === 'Basic Cost' || isSubtotal) {
                const row = document.createElement('tr');
                if (isSubtotal) row.style.fontWeight = 'bold';
                row.innerHTML = `<td>${label}</td><td class="text-right">${formatCurrency(amount)}</td>`;
                tableBody.appendChild(row);
            }
        };

        addRow('Basic Cost', basicCost);
        if (devCost > 0) addRow('Development Charges', devCost);
        if (floorRiseCost > 0) addRow(`Floor Rise (${data.numFloors} floors)`, floorRiseCost);
        if (data.societyCharge > 0) addRow('Society Formation Charges', data.societyCharge);
        if (data.amenitiesCharge > 0) addRow('Club Membership / Amenities', data.amenitiesCharge);
        if (data.parkingCharge > 0) addRow('Paid Parking Charges', data.parkingCharge);
        if (data.legalCharge > 0) addRow('Legal Charges', data.legalCharge);
        
        addRow('Agreement Value (Sub-total)', agreementValue, true);
        addRow('Stamp Duty', stampDuty);
        addRow('Registration Charges', registration);
        addRow('GST', gst);

        document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);

        // Show Preview
        costSheetPreview.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Scroll to preview
        costSheetPreview.scrollIntoView({ behavior: 'smooth' });
    }
});

// Export Functions
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const customerName = document.getElementById('customerName').value || 'Valued Client';
    const config = document.getElementById('config').value;
    const area = document.getElementById('area').value || '0';
    const date = new Date().toLocaleDateString('en-IN');
    
    // Header Styling
    doc.setFillColor(37, 99, 235); // Primary Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('COST SHEET', 105, 25, { align: 'center' });
    
    // Property Info Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left Column
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Name:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(customerName, 55, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Configuration:', 20, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(config, 55, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('Area:', 20, 69);
    doc.setFont('helvetica', 'normal');
    doc.text(`${area} sqft`, 55, 69);
    
    // Right Column
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 140, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(date, 155, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Currency:', 140, 62);
    doc.setFont('helvetica', 'normal');
    doc.text('INR (Rs.)', 160, 62);

    // Table
    doc.autoTable({
        html: '.cost-table',
        startY: 80,
        theme: 'striped',
        headStyles: { 
            fillColor: [37, 99, 235], 
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [51, 65, 85]
        },
        columnStyles: {
            1: { halign: 'right' }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        footStyles: {
            fillColor: [30, 41, 59],
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
        },
        margin: { left: 20, right: 20 },
        didParseCell: function(data) {
            // Style the subtotal row specifically if needed
            if (data.row.raw && data.row.raw.classList && data.row.raw.classList.contains('subtotal-row')) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [241, 245, 249];
            }
        }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('This is a computer generated cost sheet and does not require a signature.', 105, 285, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`Cost_Sheet_${customerName.replace(/\s+/g, '_')}.pdf`);
}

function exportExcel() {
    const table = document.querySelector('.cost-table');
    const customerName = document.getElementById('customerName').value || 'Valued Client';
    const config = document.getElementById('config').value;
    const area = document.getElementById('area').value || '0';
    const date = new Date().toLocaleDateString('en-IN');

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create header info rows
    const headerInfo = [
        ["REAL ESTATE COST SHEET"],
        [""],
        ["Customer Name:", customerName],
        ["Configuration:", config],
        ["Area:", `${area} sqft`],
        ["Date:", date],
        ["Currency:", "INR (Rs.)"],
        [""]
    ];

    // Convert table to sheet
    const ws = XLSX.utils.table_to_sheet(table);

    // Prepend header info
    XLSX.utils.sheet_add_aoa(ws, headerInfo, { origin: "A1" });

    // Shift table data down by the number of header rows
    // Wait, sheet_add_aoa with origin A1 will overwrite the table data if it starts at A1.
    // Let's do it differently: create sheet from headerInfo, then add table data.
    const ws_final = XLSX.utils.aoa_to_sheet(headerInfo);
    XLSX.utils.sheet_add_dom(ws_final, table, { origin: -1 }); // -1 appends to the end

    XLSX.utils.book_append_sheet(wb, ws_final, "Cost Sheet");
    XLSX.writeFile(wb, `Cost_Sheet_${customerName.replace(/\s+/g, '_')}.xlsx`);
}

function exportWord() {
    const content = document.getElementById('sheetContent').innerHTML;
    const customerName = document.getElementById('customerName').value || 'Valued Client';
    const config = document.getElementById('config').value;
    const area = document.getElementById('area').value || '0';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Cost Sheet</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; }
                .sheet-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                .sheet-header h2 { color: #2563eb; margin: 0; font-size: 24pt; }
                .sheet-header p { margin: 5px 0; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #2563eb; color: #ffffff; padding: 12px; text-align: left; font-size: 10pt; text-transform: uppercase; }
                td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 10pt; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; background-color: #1e293b; color: #ffffff; }
                .total-row td { border: none; padding: 12px; }
                .subtotal-row { font-weight: bold; background-color: #f1f5f9; }
                .footer { margin-top: 50px; text-align: center; font-size: 8pt; color: #94a6b8; }
            </style>
        </head>
        <body>
            <div class="sheet-header">
                <h2>COST SHEET</h2>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Configuration:</strong> ${config}</p>
                <p><strong>Area:</strong> ${area} sqft</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            ${content}
            <div class="footer">
                <p>This is a computer generated cost sheet and does not require a signature.</p>
            </div>
        </body>
        </html>
    `;
    
    const converted = htmlDocx.asBlob(html);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = `Cost_Sheet_${customerName.replace(/\s+/g, '_')}.docx`;
    link.click();
}
