/**
 * MALU LIVE FINANCE APP - BACKEND
 * Deploy as a Google Web App (Execute as: Me, Access: Anyone)
 */

const CONFIG = {
  // Replace with the ID of your FORCE Gym spreadsheet
  FORCE_GYM_SHEET_ID: 'REPLACE_WITH_YOUR_GYM_SHEET_ID',
  
  // Map your existing Gym columns (0-indexed based on columns A to J)
  GYM_COL_MEMBER: 0,   // Column A (Nombre y Apellido)
  GYM_COL_DATE: 1,     // Column B (Fecha)
  GYM_COL_AMOUNT: 5,   // Column F (Monto)
  GYM_COL_PLATFORM: 6, // Column G (Medio)
  GYM_COL_RETIRO: 9,   // Column J (Retiro)
  
  // Target values to filter by
  GYM_RETIRO_FILTER: ['Mati', 'mati', 'Matias', 'matias', 'mati ', 'matias '],
};

// --- HTTP Handlers ---

function doOptions(e) {
  return buildCORSResponse(ContentService.createTextOutput(""));
}

function doGet(e) {
  try {
    const data = fetchAllData();
    return buildCORSResponse(ContentService.createTextOutput(JSON.stringify({ status: 'success', data })));
  } catch (error) {
    return buildCORSResponse(ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })));
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // wait up to 10 seconds for others to finish
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;
    
    let result = {};
    
    switch (action) {
      case 'add_expense':
        result = addRow('Expenses', data);
        break;
      case 'delete_expense':
        result = deleteRow('Expenses', data.id);
        break;
      case 'add_income':
        result = addRow('Incomes', data);
        break;
      case 'delete_income':
        result = deleteRow('Incomes', data.id);
        break;
      case 'webhook_transfer':
        result = handleWebhookTransfer(data);
        break;
      case 'toggle_recurring':
        result = handleRecurringToggle(data);
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    return buildCORSResponse(ContentService.createTextOutput(JSON.stringify({ status: 'success', result })));
  } catch (error) {
    return buildCORSResponse(ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })));
  } finally {
    lock.releaseLock();
  }
}

function buildCORSResponse(output) {
  return output.setMimeType(ContentService.MimeType.JSON);
}

// --- Core Logic ---

const SCHEMA = {
  Expenses: ['id', 'date', 'amount', 'categoryId', 'note', 'loggedBy', 'paymentMethod', 'isRecurring', 'cardBatchId', 'createdAt'],
  Incomes: ['id', 'date', 'amount', 'source', 'platform', 'forceDetails', 'notes', 'createdBy', 'createdAt'],
  Recurring: ['id', 'recurringId', 'monthKey', 'createdAt'],
};

function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  const schema = SCHEMA[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (schema) sheet.appendRow(schema);
    return sheet;
  }

  /* Bring an already-created sheet up to the current schema.
     `addRow` writes by header name, so a field the sheet has never heard of
     is silently dropped on write and comes back missing on the next fetch --
     which is how a new column would quietly fail rather than error. Missing
     headers are appended on the end; existing columns are never moved, so
     nothing that is already in the sheet shifts underneath its data. */
  if (schema && sheet.getLastColumn() > 0) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const missing = schema.filter(function (h) { return headers.indexOf(h) === -1; });
    if (missing.length > 0) {
      sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    }
  }

  return sheet;
}

function fetchAllData() {
  const expenses = getObjectsFromSheet('Expenses');
  let incomes = getObjectsFromSheet('Incomes');
  const recurringLog = getObjectsFromSheet('Recurring');
  
  const gymIncomes = fetchForceGymIncomes();
  incomes = incomes.concat(gymIncomes);
  
  return { expenses, incomes, recurringLog };
}

function getObjectsFromSheet(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; 
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      let val = row[i];
      if (val instanceof Date) {
        val = val.toISOString(); // Fix JS Date formatting issue
      }
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[header] = val;
    });
    return obj;
  });
}

function fetchForceGymIncomes() {
  if (CONFIG.FORCE_GYM_SHEET_ID === 'REPLACE_WITH_YOUR_GYM_SHEET_ID') return [];
  
  try {
    const gymSs = SpreadsheetApp.openById(CONFIG.FORCE_GYM_SHEET_ID);
    const sheets = gymSs.getSheets();
    const results = [];
    
    const validMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName().toLowerCase();
      // Check if tab looks like "Septiembre 2026"
      const isMonthTab = validMonths.some(m => sheetName.includes(m)) && sheetName.match(/20\d{2}/);
      
      if (isMonthTab) {
        const data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          const rows = data.slice(1);
          
          rows.forEach((row, index) => {
            // Safety check: skip if row doesn't have enough columns
            if (row.length <= Math.max(CONFIG.GYM_COL_RETIRO, CONFIG.GYM_COL_AMOUNT)) return;
            
            const retiroStr = String(row[CONFIG.GYM_COL_RETIRO]).trim().toLowerCase();
            
            // If Mati withdrew it, pull it into the live app
            if (CONFIG.GYM_RETIRO_FILTER.includes(retiroStr)) {
              const rawDate = row[CONFIG.GYM_COL_DATE];
              let dateStr = new Date().toISOString().split('T')[0];
              if (rawDate instanceof Date) {
                // Adjust timezone roughly
                dateStr = new Date(rawDate.getTime() - rawDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
              } else if (rawDate) {
                dateStr = String(rawDate);
              }
              
              let amountVal = 0;
              const rawAmount = row[CONFIG.GYM_COL_AMOUNT];
              if (typeof rawAmount === 'number') {
                amountVal = rawAmount;
              } else if (typeof rawAmount === 'string') {
                amountVal = parseFloat(rawAmount.replace(/[^0-9.-]+/g, "")) || 0;
              }

              results.push({
                id: `gym-import-${sheet.getName().replace(/\s+/g, '')}-${index}`,
                date: dateStr,
                amount: amountVal,
                source: 'force_gym',
                platform: String(row[CONFIG.GYM_COL_PLATFORM] || 'mercadopago').toLowerCase().replace(' ', '_'),
                forceDetails: {
                  type: 'cuota',
                  memberName: String(row[CONFIG.GYM_COL_MEMBER]),
                },
                notes: `Imported from Force Gym (${sheet.getName()})`,
                createdBy: 'mati',
                createdAt: new Date().toISOString()
              });
            }
          });
        }
      }
    });
    
    return results;
  } catch (e) {
    console.error("Error fetching Gym Sheet: " + e.toString());
    return []; // Return empty if we fail to open sheet
  }
}

function addRow(sheetName, obj) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getDataRange().getValues()[0];
  
  const rowData = headers.map(header => {
    let val = obj[header];
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val === undefined ? '' : val;
  });
  
  sheet.appendRow(rowData);
  return { id: obj.id };
}

function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i > 0; i--) { 
    if (data[i][0] === id) { 
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Not found' };
}

function handleWebhookTransfer(data) {
  const newIncome = {
    id: `inc-wbhk-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    amount: data.amount,
    source: 'force_gym',
    platform: data.platform || 'mercadopago',
    forceDetails: {
      type: data.amount >= 45000 ? 'cuota' : 'suplemento',
      memberName: data.senderName || 'Auto Webhook',
    },
    notes: data.notes || 'Automated Bank Transfer',
    createdBy: 'mati',
    createdAt: new Date().toISOString(),
  };
  
  return addRow('Incomes', newIncome);
}

function handleRecurringToggle(data) {
  const sheet = getSheet('Recurring');
  const values = sheet.getDataRange().getValues();
  
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i][1] === data.recurringId && values[i][2] === data.monthKey) {
      sheet.deleteRow(i + 1);
      return { status: 'unpaid' };
    }
  }
  
  const id = `rec-log-${Date.now()}`;
  sheet.appendRow([id, data.recurringId, data.monthKey, new Date().toISOString()]);
  return { status: 'paid' };
}
