# Walkthrough - Teacher Resource Uploads

## Changes
I have updated the teacher resource upload functionality to store files in the file system (`uploads/teacher-resources`) instead of the database.

### Files Modified
- `backend/server.js`: Updated the upload endpoint to save files to disk.
- Created `uploads/teacher-resources` folder.

## Debugging & Error Handling
- **Issue**: User reported "Forbidden" error.
- **Fix**: 
    - Updated backend to return detailed JSON errors for 403 Forbidden (Permission/Token issues).
    - Updated frontend to display these specific error messages.
    - Added `scripts/test-permission.js` to verify that unauthorized users get the correct error message.

## Verification Results

### Automated Test
I ran a test script that:
1.  Logged in as a teacher.
2.  Uploaded a test file.
3.  Verified the server response contained a correct file URL path.

**Result**: ✅ PASS

### Permission Test
I ran `scripts/test-permission.js`:
1. Registered a 'kid' user.
2. Attempted upload.
3. Verified server returned specific "Permission denied" error.

**Result**: ✅ PASS

### Isolation Test
I ran `scripts/test-isolation.js`:
1. Registered Teacher A and Teacher B.
2. Uploaded distinct files for each.
3. Verified Teacher A only sees A's files, and B only sees B's files.

**Result**: ✅ PASS

### Schema Test (ClassEvent)
I ran `scripts/test-schema.js`:
1. Created a user and a class.
2. Created an event for that class (Succeeded).
3. Attempted to create a second event for the same class (Failed).

**Result**: ✅ PASS (Pk constraint ensures 1 event per class)
```
✅ Upload Test Passed: File URL is correct.
```

### Manual Verification Steps
1.  Go to **Teacher Portal > Resources**.
2.  Click **Upload New**.
3.  Upload a file (PDF, Image, etc.).
4.  Verify the file appears in the list.
5.  Click **Download** to ensure the link works.
