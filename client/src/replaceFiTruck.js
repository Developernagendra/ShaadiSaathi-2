import fs from 'fs';
import path from 'path';

const files = [
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/BundleDetailPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/CabBookingPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/vendor/VendorDashboard.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/vendor/VendorBookingsPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/vendor/VendorCabPricingPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/BaraatCabsPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/CabDetailPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/vendor/VendorManageCabsPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/user/BookingsPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/user/CabBookingDetailPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/admin/AdminRevenuePage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/admin/AdminManageCabsPage.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/pages/admin/AdminDashboard.jsx",
    "/Users/nagendrakumarsharma/Desktop/Ravi/client/src/components/layout/Sidebar.jsx"
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('FiTruck')) {
            content = content.replace(/<FiTruck([\s>])/g, '<FaTruck$1');
            content = content.replace(/import\s*\{\s*FiTruck\s*\}\s*from\s*['"]react-icons\/fi['"];?\n?/g, '');
            content = content.replace(/FiTruck,\s*/g, '');
            content = content.replace(/,\s*FiTruck\b/g, '');
            
            if (!content.includes("import { FaTruck } from 'react-icons/fa';
import { FiTruck } from 'react-icons/fi';")) {
                const importMatch = content.match(/(import\s*\{[^}]*\}\s*from\s*['"]react-icons\/fi['"];?\n)/);
                if (importMatch) {
                    content = content.replace(importMatch[1], importMatch[1] + "import { FaTruck } from 'react-icons/fa';\n");
                } else {
                    content = "import { FaTruck } from 'react-icons/fa';\n" + content;
                }
            }
            
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    } catch (err) {
        console.error(`Error updating ${file}:`, err.message);
    }
});
