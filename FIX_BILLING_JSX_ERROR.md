# Fix Billing.jsx JSX Error and Deployment Path

## ✅ Fixed Issues

1. **JSX Syntax Error**: Removed extra closing `</div>` tag in Billing.jsx (line 742)
2. **Deployment Path Issue**: Corrected copy command path

## Fixed Code

**Before (Error):**
```jsx
            </table>
          </div>
            {hasMoreCheckouts && (
              <div ref={loadMoreRef} className="text-center p-4">
                {isFetchingMore && <span className="text-indigo-600">Loading more checkouts...</span>}
              </div>
            )}
          </div>
        </div>

        <CheckoutDetailModal checkout={selectedCheckout} onClose={() => setSelectedCheckout(null)} />
      </div>  <!-- EXTRA DIV HERE -->
    </DashboardLayout>
```

**After (Fixed):**
```jsx
            </table>
          </div>
          {hasMoreCheckouts && (
            <div ref={loadMoreRef} className="text-center p-4">
              {isFetchingMore && <span className="text-indigo-600">Loading more checkouts...</span>}
            </div>
          )}
        </div>

        <CheckoutDetailModal checkout={selectedCheckout} onClose={() => setSelectedCheckout(null)} />
      </div>
    </DashboardLayout>
```

## Correct Deployment Commands

```bash
# 1. SSH to server or use Web Console
cd /var/www/resort/Resort_first

# 2. Pull latest changes
git pull origin main

# 3. Build frontend dashboard
cd dasboard
npm install --legacy-peer-deps
npm run build

# 4. Copy build files (CORRECT PATH)
sudo cp -r build/* /var/www/resort/dashboard/

# If /var/www/resort/dashboard/ doesn't exist, create it first:
# sudo mkdir -p /var/www/resort/dashboard/

# 5. Set correct permissions
sudo chown -R www-data:www-data /var/www/resort/dashboard/

# 6. Restart backend (if needed)
cd ../ResortApp
sudo systemctl restart resort.service
```

## Verify Deployment

1. **Check build succeeded:**
   ```bash
   ls -la /var/www/resort/dashboard/
   # Should see index.html and static/ directory
   ```

2. **Check backend is running:**
   ```bash
   sudo systemctl status resort.service
   curl http://localhost:8000/api/bill/active-rooms
   # Should return: {"detail":"Not authenticated"} (which means backend is running)
   ```

3. **Test in browser:**
   - Visit: `https://teqmates.com/admin/`
   - Navigate to Billing page
   - Verify page loads without JSX errors
   - Test checkout functionality

## Troubleshooting

### If Copy Command Fails:
```bash
# Check if directory exists
ls -la /var/www/resort/dashboard/

# If it doesn't exist, create it:
sudo mkdir -p /var/www/resort/dashboard/

# Then copy files:
sudo cp -r /var/www/resort/Resort_first/dasboard/build/* /var/www/resort/dashboard/

# Set permissions:
sudo chown -R www-data:www-data /var/www/resort/dashboard/
sudo chmod -R 755 /var/www/resort/dashboard/
```

### If Build Still Fails:
```bash
cd /var/www/resort/Resort_first/dasboard
rm -rf node_modules package-lock.json build
npm install --legacy-peer-deps
npm run build
```

### If Backend Doesn't Restart:
```bash
# Find service name
sudo systemctl list-units | grep resort

# Check status
sudo systemctl status resort.service

# View logs for errors
sudo journalctl -u resort.service -n 50 --no-pager

# Restart manually if needed
sudo systemctl restart resort.service
```

## Notes
- ✅ JSX syntax error fixed
- ✅ Build should now succeed
- ✅ Correct deployment path documented
- ✅ All responsive design changes preserved

