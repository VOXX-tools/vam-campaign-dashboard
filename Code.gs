/**
 * Google Apps Script for VAM Campaign Monitoring Dashboard
 * 
 * This script reads campaign data from the "進捗率タブ" tab in the spreadsheet
 * and returns it as JSON via HTTP GET request.
 * 
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA/edit?gid=1187048610#gid=1187048610
 */

/**
 * doGet - Handles HTTP GET requests
 * Returns campaign data in JSON format with CORS headers
 */
function doGet(e) {
  try {
    // Get the spreadsheet by ID
    const spreadsheetId = '1IwAuWxaQq2joBxNsGyCMnlvLN29ADqconyqXWoSepmA';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Get the "進捗率タブ" sheet
    const sheet = spreadsheet.getSheetByName('進捗率タブ');
    
    if (!sheet) {
      return createErrorResponse('Sheet "進捗率タブ" not found');
    }
    
    // Get all data from the sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length < 2) {
      return createErrorResponse('No data found in sheet');
    }
    
    // First row contains headers
    const headers = values[0];
    
    // Convert data to JSON array
    const campaigns = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      // Create campaign object with all 20 fields
      const campaign = {
        CAMPAIGN_URL: row[headers.indexOf('CAMPAIGN_URL')] || '',
        ORDER_NAME: row[headers.indexOf('ORDER_NAME')] || '',
        ADVERTISER_NAME: row[headers.indexOf('ADVERTISER_NAME')] || '',
        AGENCY_NAME: row[headers.indexOf('AGENCY_NAME')] || '',
        CAMPAIGN_ID: String(row[headers.indexOf('CAMPAIGN_ID')] || ''),
        CAMPAIGN_NAME: row[headers.indexOf('CAMPAIGN_NAME')] || '',
        priority: Number(row[headers.indexOf('優先度')] || 0),
        START_TIME: formatDateTime(row[headers.indexOf('START_TIME')]),
        END_TIME: formatDateTime(row[headers.indexOf('END_TIME')]),
        deliveryDays: Number(row[headers.indexOf('配信日数')] || 0),
        targetImp: Number(row[headers.indexOf('目標Imp')] || 0),
        cumulativeImp: Number(row[headers.indexOf('累積実績Imp')] || 0),
        dailyImp: Number(row[headers.indexOf('日割りImp')] || 0),
        deliveryCap: Number(row[headers.indexOf('配信キャップ')] || 0),
        todayImp: Number(row[headers.indexOf('当日Imp')] || 0),
        totalHours: Number(row[headers.indexOf('全体時間')] || 0),
        elapsedHours: Number(row[headers.indexOf('経過時間')] || 0),
        timeProgressRate: Number(row[headers.indexOf('時間進捗率')] || 0),
        impProgress: Number(row[headers.indexOf('imp進捗')] || 0),
        progressRate: Number(row[headers.indexOf('進捗率')] || 0)
      };
      
      campaigns.push(campaign);
    }
    
    // Create success response with CORS headers
    return createSuccessResponse({
      success: true,
      timestamp: new Date().toISOString(),
      count: campaigns.length,
      data: campaigns
    });
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createErrorResponse('Internal server error: ' + error.toString());
  }
}

/**
 * Format date/time value to ISO 8601 string
 */
function formatDateTime(value) {
  if (!value) return '';
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // If it's already a string, return as is
  if (typeof value === 'string') {
    return value;
  }
  
  return String(value);
}

/**
 * Create success response with CORS headers
 */
function createSuccessResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers to allow frontend access
  return output;
}

/**
 * Create error response with CORS headers
 */
function createErrorResponse(message) {
  const output = ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output;
}
