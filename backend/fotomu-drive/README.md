# Fotomu Phase 4A — Google Drive Upload Backend

Phase 4A introduces the online storage path:

**Fotomu → browser compression → Apps Script HTML Service → Google Drive + Google Sheets**

The browser never sends the original photo. The selected photo is compressed locally first.

## Why HTML Service?

A GitHub Pages PWA cannot safely rely on a normal cross-origin `fetch()` upload to an Apps Script web app because the Apps Script web-app response/CORS behavior is not a reliable API boundary for this use case.

Apps Script HTML Service provides `google.script.run`, and a `form` containing a file input is converted server-side to an Apps Script Blob. That is the supported Google pattern for sending files to Drive.

## Files

- `Code.gs` — server-side Drive/Sheets logic.
- `Upload.html` — uploader UI and browser-side compression.

## Required Script Properties

Create these Script Properties:

- `FOTOMU_ROOT_FOLDER_ID` = ID of the root Drive folder, e.g. `FOTOMU`
- `FOTOMU_SHEET_ID` = ID of the Google Sheet used for metadata
- `FOTOMU_SHEET_NAME` = `Photos`
- `FOTOMU_UPLOAD_PIN` = temporary shared upload PIN for the 4-person team

Do not commit these values to GitHub.

## Drive structure

The script creates:

```
FOTOMU/
  <eventId> — <eventName>/
    <rakId> — <rakName>/
      compressed-photo-001.jpg
      compressed-photo-002.jpg
```

## Metadata columns

```
photoId
eventId
eventName
rakId
rakName
fileName
driveFileId
sizeBytes
originalSizeBytes
mimeType
uploader
createdAt
```

## Deployment

Deploy the Apps Script as a Web App:

- Execute as: **Me**
- Who has access: **Anyone**

The web app is intentionally embeddable because Phase 4A will later place this uploader inside Fotomu.

For the first field test, use the shared upload PIN. This is a **test-stage access control**, not the final production authentication model.

## Test order

1. Create the Drive root folder.
2. Create the metadata Google Sheet.
3. Add Script Properties.
4. Run `setupFotomu()` once and authorize Drive + Sheets.
5. Deploy the web app.
6. Open the web-app URL with:
   `?eventId=TEST001&eventName=Uji+Fotomu&rakId=RAK01&rakName=Rak+Uji`
7. Upload 1–3 photos.
8. Confirm only compressed JPG files appear in Drive.
9. Confirm metadata rows appear in Sheets.
10. Then integrate the uploader into the Fotomu Rak page.

## Important

Do not delete the existing ~1,003-photo IndexedDB benchmark dataset. Phase 4A is being built beside the local storage system until online upload is proven stable.
