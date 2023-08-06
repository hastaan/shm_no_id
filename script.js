// Insert your CSV URL here
var csvUrl = 'https://raw.githubusercontent.com/hastaan/shm/main/sahmiyeh_44_47_no_ID.csv';

// Declare data variable at a higher scope
var data;

// Declare variable to store displayed data
var displayedData;

// Parse the CSV data
Papa.parse(csvUrl, {
    download: true,
    encoding: "utf-8",
    header: true,
    complete: function(results) {
        // Assign the parsed data to the higher-scoped data variable
        data = results.data;
        console.log(data);

        // Clear the advanced search fields and then generate new ones
        $('#advanced-search').empty();
        Object.keys(data[0]).forEach(key => {
            var sanitizedKey = key.replace(/\s+/g, '-');
            $('#advanced-search').append(`<input class="input-field" id="search-${sanitizedKey}" placeholder="${key}">`);
        });
    }
});



// Function to display data on the page
function displayData(data) {
    var container = $('#data-container');
    container.empty(); // Remove existing data

    // Assign displayed data
    displayedData = data;

    // Create table
    var table = $('<table></table>');
    var thead = $('<thead></thead>');
    var tbody = $('<tbody></tbody>');

    // Create header row
    var headerRow = $('<tr></tr>');
    Object.keys(data[0]).forEach(key => {
        headerRow.append(`<th>${key}</th>`);
    });
    thead.append(headerRow);
    table.append(thead);

    // Create data rows
    data.forEach(row => {
        var rowTr = $('<tr></tr>');
        Object.values(row).forEach(value => {
            rowTr.append(`<td>${value}</td>`);
        });
        tbody.append(rowTr);
    });
    table.append(tbody);

    container.append(table);
}

function arabicToEnglishNumbers(str) {
    var arabicNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    var englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    var convertedString = str.split('').map(function(c) {
        var arabicIndex = arabicNumerals.indexOf(c);
        if(arabicIndex !== -1) {
            return englishNumerals[arabicIndex];
        }
        return c;
    }).join('');

    return convertedString;
}


// Switch between Simple and Advanced modes
$(document).ready(function() {
    // Hide advanced search fields and button on initial page load
    $('#advanced-search').hide();
    $('#advanced-search-controls').hide();

    // Switch between Simple and Advanced modes
    $('input[name="search-mode"]').on('change', function() {
        if ($(this).attr('id') === 'simple-search-mode') {
            $('#simple-search').show();
            $('#advanced-search').hide();
            $('#advanced-search-controls').hide();
        } else {
            $('#simple-search').hide();
            $('#advanced-search').show();
            $('#advanced-search-controls').show();
        }
    });
});


$('#simple-search-btn').click(function() {
    var value = $('#search').val();
    if(!value.trim()){
        alert("لظفا برای جستجو نخست عبارت مورد نظر را وارد کنید");
        return;  // Stop here
    }

    var englishValue = arabicToEnglishNumbers(value);
    var searchTerms = englishValue.split(' ');
    var filteredData = data.filter(row => 
        searchTerms.every(term => 
            Object.values(row).some(val => String(val).includes(term))
        )
    );
    displayData(filteredData);
});



function isNumeric(str) {
    var arabicNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return !isNaN(parseFloat(str)) || str.split('').every(char => arabicNumerals.includes(char));
}


$('#advanced-search-btn').click(function() {
    var anyValueEntered = Object.keys(data[0]).some(key => {
        var sanitizedKey = key.replace(/\s+/g, '-');
        var searchVal = $('#search-' + sanitizedKey).val();
        return searchVal && searchVal.trim().length > 0;
    });

    if (!anyValueEntered) {
        alert("Please fill at least one search field.");
        return;  // Stop here
    }

    var filteredData = data.filter(row =>
        Object.keys(row).every(key => {
            var sanitizedKey = key.replace(/\s+/g, '-');
            var searchVal = $('#search-' + sanitizedKey).val();
            var englishSearchVal = isNumeric(searchVal) ? arabicToEnglishNumbers(searchVal) : searchVal;
            var rowValue = String(row[key]);
            var rowValueEnglish = isNumeric(rowValue) ? arabicToEnglishNumbers(rowValue) : rowValue;
            return !englishSearchVal || rowValueEnglish.includes(englishSearchVal);
        })
    );
    displayData(filteredData);
});


$('#download-btn').click(function() {
    var downloadData;
    if ($('#download-result').prop('checked')) {
        downloadData = displayedData;
    } else {
        downloadData = data;
    }

    if (!downloadData) {
        downloadData = [];
    }
    
    var csv = Papa.unparse(downloadData);
    var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var csvURL = null;
    if (navigator.msSaveBlob) {
        csvURL = navigator.msSaveBlob(csvData, 'download.csv');
    } else {
        csvURL = window.URL.createObjectURL(csvData);
    }

    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'data.csv');
    tempLink.click();
});
