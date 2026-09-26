/**
 * Fotomu — Phase 4A Google Drive Upload Backend
 *
 * Deploy this Apps Script as a Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Security for Phase 4A test: shared UPLOAD_PIN stored in Script Properties.
 * Before production, replace the shared PIN with a stronger uploader-auth flow.
 */

const CONFIG_KEYS = {
  ROOT_FOLDER_ID: 'FOTOMU_ROOT_FOLDER_ID',
  SHEET_ID: 'FOTOMU_SHEET_ID',
  UPLOAD_PIN: 'FOTOMU_UPLOAD_PIN',
  SHEET_NAME: 'FOTOMU_SHEET_NAME'
};

const HEADERS = [
  'photoId',
  'eventId',
  'eventName',
  'rakId',
  'rakName',
  'fileName',
  'driveFileId',
  'sizeBytes',
  'originalSizeBytes',
  'mimeType',
  'uploader',
  'createdAt'
];

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('Upload');
  t.config = {
    eventId: String(e?.parameter?.eventId || ''),
    eventName: String(e?.parameter?.eventName || ''),
    rakId: String(e?.parameter?.rakId || ''),
    rakName: String(e?.parameter?.rakName || '')
  };

  return t.evaluate()
    .setTitle('Fotomu — Upload Foto')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Receives exactly one file through an HTML form.
 * Google Apps Script converts the file input to an Apps Script Blob.
 */
function processForm(formObject) {
  const props = PropertiesService.getScriptProperties();

  const pin = String(formObject.uploadPin || '');
  const expectedPin = String(props.getProperty(CONFIG_KEYS.UPLOAD_PIN) || '');
  if (!expectedPin || pin !== expectedPin) {
    throw new Error('PIN upload salah atau belum dikonfigurasi.');
  }

  const blob = formObject.photo;
  if (!blob || typeof blob.getBytes !== 'function') {
    throw new Error('File foto tidak diterima.');
  }

  const eventId = required_(formObject.eventId, 'eventId');
  const eventName = cleanName_(formObject.eventName || 'Kegiatan');
  const rakId = required_(formObject.rakId, 'rakId');
  const rakName = cleanName_(formObject.rakName || 'Rak Foto');
  const photoId = required_(formObject.photoId, 'photoId');
  const originalSize = Number(formObject.originalSize || blob.getBytes().length);

  const root = getRootFolder_();
  const eventFolder = getOrCreateFolder_(root, eventFolderName_(eventId, eventName));
  const rakFolder = getOrCreateFolder_(eventFolder, rackFolderName_(rakId, rakName));

  // Use photoId in the Drive description so a future retry/deduplication
  // mechanism can identify the exact upload without changing the visible filename.
  blob.setName(cleanFileName_(blob.getName() || ('foto-' + photoId + '.jpg')));
  const file = rakFolder.createFile(blob);
  file.setDescription('Fotomu photoId: ' + photoId);

  const uploader = Session.getActiveUser().getEmail() || 'tim-fotomu';
  appendMetadata_([
    photoId,
    eventId,
    eventName,
    rakId,
    rakName,
    file.getName(),
    file.getId(),
    file.getSize(),
    originalSize,
    file.getMimeType(),
    uploader,
    new Date()
  ]);

  return {
    ok: true,
    photoId: photoId,
    driveFileId: file.getId(),
    fileName: file.getName(),
    sizeBytes: file.getSize()
  };
}

function setupFotomu() {
  const props = PropertiesService.getScriptProperties();

  if (!props.getProperty(CONFIG_KEYS.UPLOAD_PIN)) {
    props.setProperty(CONFIG_KEYS.UPLOAD_PIN, 'GANTI-PIN-FOTOMU');
  }

  if (!props.getProperty(CONFIG_KEYS.SHEET_NAME)) {
    props.setProperty(CONFIG_KEYS.SHEET_NAME, 'Photos');
  }

  if (!props.getProperty(CONFIG_KEYS.ROOT_FOLDER_ID)) {
    throw new Error(
      'Isi FOTOMU_ROOT_FOLDER_ID di Script Properties terlebih dahulu.'
    );
  }

  const sheet = getMetadataSheet_();
  ensureHeaders_(sheet);

  return {
    ok: true,
    message: 'Konfigurasi Fotomu siap.',
    sheetName: sheet.getName()
  };
}

function getRootFolder_() {
  const id = PropertiesService.getScriptProperties()
    .getProperty(CONFIG_KEYS.ROOT_FOLDER_ID);

  if (!id) {
    throw new Error('FOTOMU_ROOT_FOLDER_ID belum diisi.');
  }

  return DriveApp.getFolderById(id);
}

function getMetadataSheet_() {
  const id = PropertiesService.getScriptProperties()
    .getProperty(CONFIG_KEYS.SHEET_ID);

  if (!id) {
    throw new Error('FOTOMU_SHEET_ID belum diisi.');
  }

  const ss = SpreadsheetApp.openById(id);
  const name = PropertiesService.getScriptProperties()
    .getProperty(CONFIG_KEYS.SHEET_NAME) || 'Photos';

  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function appendMetadata_(row) {
  const sheet = getMetadataSheet_();
  ensureHeaders_(sheet);
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

function getOrCreateFolder_(parent, name) {
  const existing = parent.getFoldersByName(name);
  return existing.hasNext() ? existing.next() : parent.createFolder(name);
}

function eventFolderName_(id, name) {
  return cleanName_(id + ' — ' + name);
}

function rackFolderName_(id, name) {
  return cleanName_(id + ' — ' + name);
}

function cleanName_(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150) || 'Tanpa Nama';
}

function cleanFileName_(value) {
  return String(value || 'foto.jpg')
    .replace(/[\\/:*?"<>|]/g, '-')
    .trim()
    .slice(0, 180) || 'foto.jpg';
}

function required_(value, field) {
  const v = String(value || '').trim();
  if (!v) throw new Error(field + ' wajib diisi.');
  return v;
}
