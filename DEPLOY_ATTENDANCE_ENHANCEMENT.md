# Deploy Attendance & Hours Enhancement to Production

This guide will help you deploy the enhanced Attendance & Hours section with improved logic and detailed display.

## Changes Included

### Frontend Changes
- **dasboard/src/pages/EmployeeManagement.jsx**: 
  - **Fixed Attendance Logic**:
    - ✅ **8+ hours** → **Present** (Full Day Present)
    - ✅ **4-8 hours** → **Half Day** (Half Day)
    - ✅ **<4 hours but >0** → **Partial** (with total hours displayed)
    - ✅ **0 hours** → **Absent** (No attendance recorded)
  
  - **Enhanced UI Features**:
    - Added summary cards showing Total Days, Present Days, Half Days, and Total Hours
    - Improved table layout with better formatting and readability
    - Added status descriptions for each attendance status
    - Separated completed vs open sessions for better tracking
    - Enhanced detailed logs view with open/closed session indicators
    - Better date formatting with weekday and full date
    - Color-coded status badges (Green: Present, Yellow: Half Day, Orange: Partial, Red: Absent)
    - Added session count (completed vs open)
    - Improved visual hierarchy and spacing

## Server Deployment Steps

### 1. Connect to Server

```bash
ssh root@139.84.211.200
```

### 2. Navigate to Project Directory

```bash
cd /var/www/resort/Resort_first
```

### 3. Pull Latest Changes from GitHub

```bash
git pull origin main
```

If you encounter local changes conflicts:
```bash
git reset --hard HEAD
git pull origin main
```

### 4. Build Frontend Dashboard

```bash
cd dasboard
npm install --legacy-peer-deps
npm run build
```

### 5. Copy Build Files

```bash
# Ensure directory exists
sudo mkdir -p /var/www/resort/dashboard/

# Copy build files
sudo cp -r build/* /var/www/resort/dashboard/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

### 6. Verify Deployment

Test the Attendance & Hours feature:
1. Navigate to Employee Management → Attendance & Hours
2. Select an employee
3. Verify the new attendance logic and UI enhancements
4. Check summary cards display correctly
5. Verify detailed logs show properly

```bash
# Check frontend build
ls -la /var/www/resort/dashboard/

# Check backend is still running
sudo systemctl status resort.service
```

## New Features

### Summary Cards
- **Total Days**: Shows the total number of days with attendance records
- **Present Days**: Count of days with 8+ hours (Full Day Present)
- **Half Days**: Count of days with 4-8 hours (Half Day)
- **Total Hours**: Sum of all working hours across all days

### Enhanced Attendance Status

1. **Present (Green)**:
   - Criteria: Total hours >= 8 hours
   - Description: "Full Day Present (8+ hours)"
   - Color: Green background with green text

2. **Half Day (Yellow)**:
   - Criteria: Total hours >= 4 hours but < 8 hours
   - Description: "Half Day (4-8 hours)"
   - Color: Yellow background with yellow text

3. **Partial (Orange)**:
   - Criteria: Total hours > 0 but < 4 hours
   - Description: "Partial Day (X.XX hours)" with actual hours displayed
   - Color: Orange background with orange text
   - Shows total working hours calculated

4. **Absent (Red)**:
   - Criteria: Total hours = 0
   - Description: "No attendance recorded"
   - Color: Red background with red text

### Detailed Logs View

- **Session Status**: Shows if a session is "Open" (in progress) or "Completed"
- **Duration Display**: Shows hours in X.XX format
- **Location Badges**: Color-coded location tags
- **Summary Stats**: Total hours, completed hours, and open session count

## Testing

### Test Case 1: Full Day Present
1. Select an employee with attendance records
2. Find a day with 8+ hours worked
3. **Expected**: Status should show "Present" with green badge
4. **Expected**: Description should say "Full Day Present (8+ hours)"

### Test Case 2: Half Day
1. Find a day with 4-8 hours worked
2. **Expected**: Status should show "Half Day" with yellow badge
3. **Expected**: Description should say "Half Day (4-8 hours)"

### Test Case 3: Partial Day
1. Find a day with less than 4 hours but greater than 0
2. **Expected**: Status should show "Partial" with orange badge
3. **Expected**: Description should show actual hours (e.g., "Partial Day (2.50 hours)")

### Test Case 4: Absent
1. Find a day with 0 hours
2. **Expected**: Status should show "Absent" with red badge
3. **Expected**: Description should say "No attendance recorded"

### Test Case 5: Summary Cards
1. Select an employee
2. Check the summary cards at the top
3. **Expected**: Should display correct counts for Total Days, Present Days, Half Days, and Total Hours

### Test Case 6: Open Sessions
1. Clock in an employee (don't clock out)
2. View the attendance report
3. **Expected**: Open session should be highlighted in orange
4. **Expected**: Should show "In Progress..." for check-out time
5. **Expected**: Session count should show open sessions separately

## Troubleshooting

### If Build Fails

```bash
# Check for dependency issues
cd /var/www/resort/Resort_first/dasboard
npm install --legacy-peer-deps --force

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### If Attendance Status Not Calculating Correctly

1. Check browser console for JavaScript errors
2. Verify work logs have `duration_hours` property
3. Check that dates are formatted correctly
4. Verify the `dailyAttendance` useMemo is running correctly

### If Summary Cards Not Showing

1. Verify work logs are being loaded
2. Check that `dailyAttendance` is calculated correctly
3. Verify the summary card calculations match the attendance data

### If Detailed Logs Not Displaying

1. Check that `selectedDay` state is being set correctly
2. Verify the expandable row logic is working
3. Check that logs array is populated correctly

## Rollback (if needed)

If you need to rollback:

```bash
cd /var/www/resort/Resort_first
git log --oneline -5  # Find the commit before this enhancement
git checkout <previous-commit-hash>
cd dasboard
npm run build
sudo cp -r build/* /var/www/resort/dashboard/
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

---

**Status**: Ready for production deployment
**Date**: After Attendance & Hours enhancement implementation

