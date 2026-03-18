function doGet() {
  var spreadsheetId = "REEMPLAZAR_CON_TU_SPREADSHEET_ID";
  var sheetName = "Lotes";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var values = sheet.getDataRange().getValues();
  var headers = values.shift();

  var data = values
    .filter(function (row) {
      return row.join("") !== "";
    })
    .map(function (row) {
      var item = {};
      headers.forEach(function (header, index) {
        item[header] = row[index];
      });
      return item;
    });

  return ContentService
    .createTextOutput(JSON.stringify({ data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}
