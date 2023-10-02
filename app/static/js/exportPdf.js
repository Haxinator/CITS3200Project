function exportToPDF() {
    // Get the table element
    var element = document.getElementById("table").outerHTML;

    // Open a new window
    var printWindow = window.open('', '_blank');

    // Write the element and link to the external stylesheet to the new window's document
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <link rel="stylesheet" type="text/css" href="{{ url_for('static', filename='css/planner.css') }}">
            </head>
            <body>
                ${element}
            </body>
        </html>
    `);

    // Call the print method
    printWindow.document.close();
    printWindow.print();

    // Attempt to close the window after printing
    printWindow.onafterprint = function() {
        printWindow.close();
    };
}