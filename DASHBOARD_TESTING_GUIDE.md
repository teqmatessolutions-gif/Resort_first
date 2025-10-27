# Dashboard Functionality Testing Guide

## 📋 Testing Checklist

### 1. Authentication & Login (`Login.jsx`)
- [ ] **Login with valid credentials**
  - Navigate to `/admin` 
  - Enter valid email and password
  - Click "Login"
  - Should redirect to dashboard
  - Token should be stored in localStorage
  
- [ ] **Login with invalid credentials**
  - Enter wrong email/password
  - Should show error message
  - Should NOT redirect to dashboard
  
- [ ] **Password visibility toggle**
  - Click eye icon
  - Password should toggle between visible/hidden
  
- [ ] **Session persistence**
  - Login successfully
  - Refresh page
  - Should remain logged in
  
- [ ] **Logout**
  - Click logout button
  - Should clear token
  - Should redirect to login page

---

### 2. Dashboard Overview (`Dashboard.jsx`)
- [ ] **Load Dashboard Stats**
  - Check total bookings count
  - Check total revenue
  - Check available rooms
  - Check pending checkouts
  - Verify all numbers are accurate
  
- [ ] **Charts Display**
  - Revenue chart loads properly
  - Booking trend chart works
  - Room occupancy pie chart displays
  - All charts are responsive
  
- [ ] **Recent Bookings Table**
  - Shows latest bookings
  - Data is properly formatted
  - Clicking a booking shows details
  
- [ ] **Quick Actions**
  - All buttons are clickable
  - Quick add room works
  - Quick add booking works

---

### 3. Rooms Management (`CreateRooms.jsx`)
- [ ] **View All Rooms**
  - Table shows all rooms
  - Rooms are properly categorized
  - Images load properly
  - Room status is displayed correctly
  
- [ ] **Add New Room**
  - Click "Add Room" button
  - Fill in all fields (number, type, price, capacity)
  - Upload room image
  - Submit form
  - New room appears in list
  
- [ ] **Edit Room**
  - Click edit on any room
  - Modify room details
  - Save changes
  - Changes reflect in the list
  
- [ ] **Delete Room**
  - Click delete on a room
  - Confirm deletion
  - Room removed from list
  
- [ ] **Filter Rooms**
  - Filter by room type
  - Filter by status (Available/Occupied/Maintenance)
  - Search by room number
  - Filters work correctly
  
- [ ] **Room Image Upload**
  - Select image file
  - Image preview shows
  - Upload completes successfully
  - Image displays in room card

---

### 4. Bookings Management (`Bookings.jsx`)
- [ ] **View All Bookings**
  - Table loads all bookings
  - Booking details are complete
  - Status badges display correctly
  - Sorting works (by date, status)
  
- [ ] **Create New Booking**
  - Click "New Booking"
  - Fill guest details (name, email, phone)
  - Select check-in/check-out dates
  - Select room
  - Enter number of adults/children
  - Submit booking
  - Booking appears in list
  
- [ ] **Edit Booking**
  - Open booking details
  - Modify guest information
  - Change dates
  - Save changes
  
- [ ] **Cancel Booking**
  - Open booking details
  - Click "Cancel"
  - Confirm cancellation
  - Booking status changes
  
- [ ] **Check-in Process**
  - Select a booking
  - Click "Check-in"
  - Booking status updates
  - Room status changes to Occupied
  
- [ ] **Booking Search**
  - Search by guest name
  - Search by booking ID
  - Search by room number
  - Results filter correctly

---

### 5. Employees Management (`Employ.jsx`, `EmployeeManagement.jsx`)
- [ ] **View All Employees**
  - Employee list loads
  - Employee details display
  - Roles are shown correctly
  
- [ ] **Add New Employee**
  - Click "Add Employee"
  - Fill in personal details
  - Assign role/permissions
  - Set password
  - Submit form
  
- [ ] **Edit Employee**
  - Select an employee
  - Update information
  - Change role if needed
  - Save changes
  
- [ ] **Delete Employee**
  - Click delete on employee
  - Confirm deletion
  - Employee removed
  
- [ ] **Employee Roles**
  - View role assignments
  - Admin vs Employee permissions
  - Role permissions work correctly

---

### 6. Food Management
#### Food Categories (`FoodCategory.jsx`)
- [ ] **View Categories**
  - All food categories display
  - Icons/images load
  
- [ ] **Add Category**
  - Create new category
  - Add name and description
  - Upload category image
  - Category appears in list
  
- [ ] **Edit Category**
  - Modify category details
  - Update image
  - Save changes

#### Food Items (`Fooditem.jsx`)
- [ ] **View All Items**
  - Food items load in table
  - Items grouped by category
  - Prices display correctly
  
- [ ] **Add Food Item**
  - Click "Add Item"
  - Fill item details (name, description, price)
  - Select category
  - Upload item image
  - Submit successfully
  
- [ ] **Edit Food Item**
  - Update item details
  - Change price
  - Modify description
  - Save changes
  
- [ ] **Delete Food Item**
  - Remove item
  - Item disappears from list
  
- [ ] **Stock Management**
  - Update item availability
  - Mark out of stock
  - Stock status reflects correctly

#### Food Orders (`FoodOrders.jsx`)
- [ ] **View All Orders**
  - Orders load in table
  - Order status displays
  - Guest information shows
  
- [ ] **Create Order**
  - Select guest/room
  - Add items to order
  - Set quantity
  - Submit order
  
- [ ] **Update Order Status**
  - Mark as preparing
  - Mark as ready
  - Mark as delivered
  - Status updates correctly
  
- [ ] **Order Details**
  - View full order information
  - See ordered items
  - Total cost calculated correctly

---

### 7. Payments & Billing (`Billing.jsx`, `Payments.jsx`)
- [ ] **View All Payments**
  - Payment history loads
  - Payment status shows
  - Amounts are correct
  
- [ ] **Process Payment**
  - Select a booking
  - Calculate bill
  - Add services/charges
  - Process payment
  - Payment recorded
  
- [ ] **View Payment Details**
  - Display full breakdown
  - Show room charges
  - Show service charges
  - Show tax calculations
  - Show total amount
  
- [ ] **Print Receipt**
  - Generate receipt
  - Receipt is formatted correctly
  - All charges visible
  - Print/download works

---

### 8. Checkouts (`checkout.py`)
- [ ] **View Pending Checkouts**
  - Upcoming checkouts list
  - Checkout dates visible
  
- [ ] **Process Checkout**
  - Select checkout
  - Calculate final bill
  - Process payment
  - Update room status
  - Complete checkout
  
- [ ] **Extend Stay**
  - Modify checkout date
  - Recalculate charges
  - Update booking

---

### 9. Services Management (`Services.jsx`)
- [ ] **View All Services**
  - Services list loads
  - Service descriptions show
  - Prices display correctly
  
- [ ] **Add Service**
  - Create new service
  - Set service name
  - Set description
  - Set price
  - Submit successfully
  
- [ ] **Edit Service**
  - Update service details
  - Change price
  - Modify description
  
- [ ] **Delete Service**
  - Remove service
  - Service no longer available

---

### 10. Packages (`Package.jsx`)
- [ ] **View All Packages**
  - Packages display
  - Package details visible
  - Pricing shows correctly
  
- [ ] **Add Package**
  - Create new package
  - Set package name
  - Add inclusions
  - Set package price
  - Submit successfully
  
- [ ] **Edit Package**
  - Modify package details
  - Update inclusions
  - Change price
  
- [ ] **Delete Package**
  - Remove package
  - Package no longer available

---

### 11. Guest Profiles (`GuestProfile.jsx`)
- [ ] **View Guest List**
  - All guests display
  - Guest information shows
  - Booking history visible
  
- [ ] **View Guest Details**
  - Open guest profile
  - See all bookings
  - View payment history
  - See preferences
  
- [ ] **Update Guest Info**
  - Edit guest details
  - Update contact info
  - Save changes

---

### 12. Expenses (`Expenses.jsx`)
- [ ] **View Expenses**
  - Expense list loads
  - Expenses categorized
  - Amounts display
  
- [ ] **Add Expense**
  - Create new expense entry
  - Fill expense details
  - Add receipt/image
  - Submit expense
  
- [ ] **Edit Expense**
  - Update expense details
  - Modify amount
  - Change category
  
- [ ] **Expense Reports**
  - View by category
  - View by date range
  - Export reports

---

### 13. Reports (`ComprehensiveReport.jsx`)
- [ ] **Generate Reports**
  - Revenue reports
  - Booking reports
  - Occupancy reports
  - Expense reports
  
- [ ] **Filter Reports**
  - Filter by date range
  - Filter by room type
  - Filter by service
  
- [ ] **Export Reports**
  - Export to PDF
  - Export to Excel
  - Print reports
  
- [ ] **Report Accuracy**
  - Numbers are correct
  - Calculations are right
  - Data matches database

---

### 14. Users Management (`Users.jsx`, `Roleform.jsx`)
- [ ] **View All Users**
  - User list loads
  - User roles display
  - Status shows
  
- [ ] **Add User**
  - Create new user
  - Assign role
  - Set permissions
  - Submit user
  
- [ ] **Edit User**
  - Update user details
  - Change role
  - Update permissions
  
- [ ] **Delete User**
  - Remove user
  - User removed from system
  
- [ ] **Role Management**
  - Create new role
  - Set permissions
  - Assign role to users

---

### 15. Account & Profile (`Account.jsx`, `Profile.jsx`)
- [ ] **View Profile**
  - Profile information displays
  - Avatar shows
  - Contact info visible
  
- [ ] **Edit Profile**
  - Update name
  - Update email
  - Update phone
  - Change password
  - Update avatar
  - Save changes

---

### 16. Vouchers (`Vouchers.jsx`)
- [ ] **View All Vouchers**
  - Voucher list loads
  - Voucher codes display
  - Discount amounts show
  
- [ ] **Add Voucher**
  - Create new voucher
  - Set voucher code
  - Set discount percentage
  - Set expiry date
  - Submit voucher
  
- [ ] **Apply Voucher**
  - Enter voucher code
  - Apply to booking
  - Discount calculates correctly
  
- [ ] **Expire Voucher**
  - Set expiry date
  - Voucher expires automatically

---

## 🔍 Cross-Cutting Concerns

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] All features work on mobile
- [ ] Navigation works on all devices

### Performance
- [ ] Page load time < 3 seconds
- [ ] No lag when loading data
- [ ] Smooth scrolling
- [ ] Quick search/filter responses

### Error Handling
- [ ] Invalid data shows error messages
- [ ] Network errors handled gracefully
- [ ] 404 errors show proper pages
- [ ] Form validation works

### Security
- [ ] Unauthorized access blocked
- [ ] Token expiry handled
- [ ] Input sanitization works
- [ ] XSS prevention works

---

## 🎯 Testing Priority

### Critical (Must Test)
1. Authentication & Login
2. Bookings Management
3. Rooms Management
4. Payments
5. Dashboard Overview

### High Priority
6. Food Orders
7. Checkouts
8. Employees
9. Reports
10. Account Management

### Medium Priority
11. Services
12. Packages
13. Vouchers
14. Guest Profiles
15. Expenses

---

## 📊 Test Results Template

```
Test Date: ___________
Tester Name: ___________
Environment: [Production/Staging/Local]

[ ] All tests passed
[ ] Some tests failed
[ ] Details:


Known Issues:


Recommendations:


```

---

## ✅ Sign-off

After completing all tests, sign below to confirm:

Tester: ___________
Date: ___________
All functionality verified: [YES/NO]

---

**Note:** This is a comprehensive manual testing guide. For automated testing, use the test_automation framework with Playwright.

