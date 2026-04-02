var SHEET_SCHEMAS = {
  mares: {
    sheetName: "mares",
    idPrefix: "mare",
    headers: [
      "id",
      "harasId",
      "centreId",
      "season",
      "name",
      "farasNumber",
      "transponderNumber",
      "breed",
      "birthDate",
      "coat",
      "stallionPrimary",
      "stallionSecondary",
      "owner",
      "phone",
      "commune",
      "breedingAddress",
      "history",
      "weightKg",
      "physiologicalStatus",
      "bcs",
      "vulvaConformation",
      "admissionStatus",
      "refusalReason",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ],
    numberFields: [],
    booleanFields: [],
  },
  reproductions: {
    sheetName: "reproductions",
    idPrefix: "repr",
    headers: [
      "id",
      "mareId",
      "harasId",
      "centreId",
      "season",
      "stallion",
      "stallionFarasNumber",
      "stallionBirthDate",
      "stallionBreed",
      "stallionCategory",
      "matingType",
      "firstCycleDate",
      "secondCycleDate",
      "thirdCycleDate",
      "fourthCycleDate",
      "totalCycles",
      "fertileCycles",
      "nonFertileCycles",
      "cycleResult",
      "diagnosis",
      "dpsNumber",
      "farasEntryStatus",
      "farasEntryReason",
      "previousProductSirema",
      "previousProductBirthDate",
      "previousProductSex",
      "previousProductBreed",
      "previousProductDeclaration",
      "previousProductIdentification",
      "heatReturn",
      "abortion",
      "embryoResorption",
      "nonOvulation",
      "uterineInfection",
      "twinPregnancy",
      "traumaticAccident",
      "followUpDate",
      "bValue",
      "leftOvary",
      "rightOvary",
      "uterus",
      "fluid",
      "followUpComment",
      "latestFinding",
      "observations",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ],
    numberFields: ["totalCycles", "fertileCycles", "nonFertileCycles"],
    booleanFields: [
      "heatReturn",
      "abortion",
      "embryoResorption",
      "nonOvulation",
      "uterineInfection",
      "twinPregnancy",
      "traumaticAccident",
    ],
  },
  products: {
    sheetName: "products",
    idPrefix: "prod",
    headers: [
      "id",
      "mareId",
      "harasId",
      "centreId",
      "season",
      "previousProduct",
      "siremaProduct",
      "birthDate",
      "sex",
      "breed",
      "declaration",
      "identification",
      "productStatus",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ],
    numberFields: [],
    booleanFields: [],
  },
};

var METADATA_SHEET_NAME = "metadata";
var SCRIPT_PROPERTY_SPREADSHEET_ID = "APP_SPREADSHEET_ID";
var SCRIPT_PROPERTY_SHARED_SECRET = "APP_SHARED_SECRET";

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "Use POST with actions: list, upsert, configure.",
  });
}

function doPost(e) {
  try {
    var payload = parseRequestBody_(e);
    var config = getRuntimeConfig_();
    assertAuthorized_(payload, config.secret);

    var spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
    var action = String(payload.action || "list");

    if (action === "configure") {
      ensureWorkbook_(spreadsheet);
      return jsonResponse_({
        ok: true,
        message: "Workbook configured.",
        lastSyncedAt: new Date().toISOString(),
      });
    }

    if (action === "list") {
      ensureWorkbook_(spreadsheet);
      return jsonResponse_({
        ok: true,
        snapshot: readSnapshot_(spreadsheet),
        lastSyncedAt: new Date().toISOString(),
      });
    }

    if (action === "upsert") {
      ensureWorkbook_(spreadsheet);

      var entity = String(payload.entity || "");
      var actor = sanitizeString_(payload.actor) || "React App";
      var record = payload.record || {};

      var savedRecord = upsertEntityRecord_(spreadsheet, entity, record, actor);

      return jsonResponse_({
        ok: true,
        entity: entity,
        record: savedRecord,
        lastSyncedAt: new Date().toISOString(),
      });
    }

    throw new Error("Unsupported action: " + action);
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : String(error),
    });
  }
}

function setupWorkbookFromEditor() {
  var config = getRuntimeConfig_();
  var spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  ensureWorkbook_(spreadsheet);
}

function repairWorkbookProtectionsFromEditor() {
  var config = getRuntimeConfig_();
  var spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  applyWorkbookProtection_(spreadsheet);
}

function inspectSnapshotFromEditor() {
  var config = getRuntimeConfig_();
  var spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
  ensureWorkbook_(spreadsheet);
  Logger.log(JSON.stringify(readSnapshot_(spreadsheet)));
}

function getRuntimeConfig_() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var spreadsheetId = scriptProperties.getProperty(SCRIPT_PROPERTY_SPREADSHEET_ID);
  var sharedSecret = scriptProperties.getProperty(SCRIPT_PROPERTY_SHARED_SECRET);

  if (!spreadsheetId) {
    throw new Error(
      "Missing script property APP_SPREADSHEET_ID. Add the Google Sheet ID first.",
    );
  }

  if (!sharedSecret) {
    throw new Error(
      "Missing script property APP_SHARED_SECRET. Add the shared secret first.",
    );
  }

  return {
    spreadsheetId: spreadsheetId,
    secret: sharedSecret,
  };
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error("Invalid JSON payload.");
  }
}

function assertAuthorized_(payload, expectedSecret) {
  if (!payload || String(payload.secret || "") !== expectedSecret) {
    throw new Error("Unauthorized request.");
  }
}

function ensureWorkbook_(spreadsheet) {
  var entityKeys = Object.keys(SHEET_SCHEMAS);

  entityKeys.forEach(function (entityKey) {
    ensureEntitySheet_(spreadsheet, SHEET_SCHEMAS[entityKey]);
  });

  ensureMetadataSheet_(spreadsheet);
  applyWorkbookProtection_(spreadsheet);
}

function ensureEntitySheet_(spreadsheet, schema) {
  var sheet = spreadsheet.getSheetByName(schema.sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(schema.sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, schema.headers.length).setValues([schema.headers]);
  } else {
    assertHeaders_(sheet, schema);
  }

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, schema.headers.length);
}

function ensureMetadataSheet_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(METADATA_SHEET_NAME);
  var rows = [
    ["key", "value"],
    ["managed_by", "React app + Apps Script"],
    ["write_policy", "Write through API only"],
    ["share_policy", "Viewer or commenter access only"],
    ["last_configured_at", new Date().toISOString()],
  ];

  if (!sheet) {
    sheet = spreadsheet.insertSheet(METADATA_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  }

  sheet.hideSheet();
  sheet.setFrozenRows(1);
}

function applyWorkbookProtection_(spreadsheet) {
  spreadsheet.getSheets().forEach(function (sheet) {
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    var protection = protections.length > 0 ? protections[0] : sheet.protect();

    protection.setDescription(
      "Protected by Apps Script. Use the React application to write data.",
    );
    protection.setWarningOnly(false);

    try {
      var editors = protection.getEditors();
      if (editors.length > 0) {
        protection.removeEditors(editors);
      }
    } catch (error) {
      // Editors may already be locked by ownership rules.
    }

    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  });
}

function assertHeaders_(sheet, schema) {
  if (sheet.getLastColumn() < schema.headers.length) {
    throw new Error(
      "Sheet " +
        schema.sheetName +
        " does not contain the expected number of columns. Restore the structure first.",
    );
  }

  var actualHeaders = sheet
    .getRange(1, 1, 1, schema.headers.length)
    .getDisplayValues()[0];

  for (var i = 0; i < schema.headers.length; i += 1) {
    if (String(actualHeaders[i] || "").trim() !== schema.headers[i]) {
      throw new Error(
        "Header mismatch on sheet " +
          schema.sheetName +
          " at column " +
          (i + 1) +
          ". Manual structure changes are blocked.",
      );
    }
  }
}

function readSnapshot_(spreadsheet) {
  return {
    mares: readEntityRecords_(spreadsheet, "mares"),
    reproductions: readEntityRecords_(spreadsheet, "reproductions"),
    products: readEntityRecords_(spreadsheet, "products"),
  };
}

function readEntityRecords_(spreadsheet, entity) {
  var schema = getSchema_(entity);
  var sheet = spreadsheet.getSheetByName(schema.sheetName);

  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  assertHeaders_(sheet, schema);

  var values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, schema.headers.length)
    .getValues();

  return values
    .map(function (row) {
      return rowToRecord_(schema, row);
    })
    .filter(function (record) {
      return sanitizeString_(record.id) !== "";
    });
}

function upsertEntityRecord_(spreadsheet, entity, input, actor) {
  var schema = getSchema_(entity);
  var sheet = spreadsheet.getSheetByName(schema.sheetName);
  var records = readEntityRecords_(spreadsheet, entity);
  var inputId = sanitizeString_(input.id);
  var existingIndex = records.findIndex(function (record) {
    return record.id === inputId;
  });
  var existingRecord = existingIndex >= 0 ? records[existingIndex] : null;
  var savedRecord = buildSavedRecord_(schema, input, existingRecord, actor);
  var row = recordToRow_(schema, savedRecord);

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return savedRecord;
}

function buildSavedRecord_(schema, input, existingRecord, actor) {
  var now = new Date().toISOString();
  var savedRecord = {};

  schema.headers.forEach(function (header) {
    var hasIncomingValue = Object.prototype.hasOwnProperty.call(input, header);
    var incomingValue = hasIncomingValue ? input[header] : undefined;

    if (header === "id") {
      savedRecord.id =
        sanitizeString_(incomingValue) ||
        (existingRecord ? existingRecord.id : buildId_(schema.idPrefix));
      return;
    }

    if (header === "createdAt") {
      savedRecord.createdAt = existingRecord ? existingRecord.createdAt : now;
      return;
    }

    if (header === "updatedAt") {
      savedRecord.updatedAt = now;
      return;
    }

    if (header === "createdBy") {
      savedRecord.createdBy = existingRecord ? existingRecord.createdBy : actor;
      return;
    }

    if (header === "updatedBy") {
      savedRecord.updatedBy = actor;
      return;
    }

    if (incomingValue === undefined) {
      savedRecord[header] = existingRecord
        ? existingRecord[header]
        : defaultFieldValue_(schema, header);
      return;
    }

    savedRecord[header] = coerceFieldValue_(schema, header, incomingValue);
  });

  return savedRecord;
}

function rowToRecord_(schema, row) {
  var record = {};

  schema.headers.forEach(function (header, index) {
    record[header] = coerceFieldValue_(schema, header, row[index]);
  });

  return record;
}

function recordToRow_(schema, record) {
  return schema.headers.map(function (header) {
    var value = record[header];
    if (schema.booleanFields.indexOf(header) !== -1) {
      return Boolean(value);
    }
    if (schema.numberFields.indexOf(header) !== -1) {
      return coerceNumber_(value);
    }
    return value === undefined || value === null ? "" : String(value);
  });
}

function coerceFieldValue_(schema, header, value) {
  if (schema.booleanFields.indexOf(header) !== -1) {
    return coerceBoolean_(value);
  }

  if (schema.numberFields.indexOf(header) !== -1) {
    return coerceNumber_(value);
  }

  return value === undefined || value === null ? "" : String(value);
}

function defaultFieldValue_(schema, header) {
  if (schema.booleanFields.indexOf(header) !== -1) {
    return false;
  }

  if (schema.numberFields.indexOf(header) !== -1) {
    return 0;
  }

  return "";
}

function coerceNumber_(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  var numberValue = Number(value);
  return isNaN(numberValue) ? 0 : numberValue;
}

function coerceBoolean_(value) {
  if (value === true || value === false) {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  var normalized = String(value || "")
    .trim()
    .toLowerCase();

  return normalized === "true" || normalized === "1" || normalized === "oui";
}

function sanitizeString_(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function buildId_(prefix) {
  return (
    prefix +
    "-" +
    new Date().getTime() +
    "-" +
    Math.floor(Math.random() * 1000)
  );
}

function getSchema_(entity) {
  var schema = SHEET_SCHEMAS[entity];

  if (!schema) {
    throw new Error("Unsupported entity: " + entity);
  }

  return schema;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
