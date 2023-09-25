document.getElementById('saveAsPdfButton').addEventListener('click', function() {
    var doc = new jsPDF('p', 'mm', 'a4');
    var yearDivs = document.querySelectorAll('div[id^="Y"]');
    var pageHeight = 297; // A4 height in mm
    var currentPageHeight = 0;
    var imgWidth = 190; // Setting the image width to fit within the A4 dimensions

    var captureNextDiv = function(index) {
        if (index >= yearDivs.length) {
            doc.save('plan.pdf');
            return;
        }

        html2canvas(yearDivs[index], {scale: 2}).then(canvas => {
            var imgData = canvas.toDataURL('image/png');
            var imgHeight = canvas.height * imgWidth / canvas.width;

            if (currentPageHeight + imgHeight > pageHeight) {
                doc.addPage();
                currentPageHeight = 0;
            }

            doc.addImage(imgData, 'PNG', 10, currentPageHeight, imgWidth, imgHeight);
            currentPageHeight += imgHeight + 10; // Adding a 10mm margin between images

            if (index % 2 === 1) {
                doc.addPage();
                currentPageHeight = 0;
            }

            captureNextDiv(index + 1);
        });
    };

    captureNextDiv(0);
});
