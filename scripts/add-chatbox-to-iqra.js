/**
 * Script to add Ustaz Radhi AI Chatbox to all Iqra pages
 * This script will update all page-*.html files in the iqra modules
 */

const fs = require('fs');
const path = require('path');

// Define the directories containing Iqra modules
const iqraModules = ['iqra-1', 'iqra-2', 'iqra-3', 'iqra-4', 'iqra-5', 'iqra-6'];
const baseDir = './assets/iqra';

// Module information for better context
const moduleInfo = {
    'iqra-1': { title: 'Huruf Hijaiyyah', focus: 'Basic Arabic Letters', totalPages: 35 },
    'iqra-2': { title: 'Baris dan Fathah', focus: 'Fathah and Baris', totalPages: 32 },
    'iqra-3': { title: 'Kasrah dan Dhammah', focus: 'Kasrah and Dhammah', totalPages: 32 },
    'iqra-4': { title: 'Tanwin dan Sukun', focus: 'Tanwin and Sukun', totalPages: 15 },
    'iqra-5': { title: 'Mad dan Waqaf', focus: 'Mad and Waqaf', totalPages: 28 },
    'iqra-6': { title: 'Tajwid Asas', focus: 'Basic Tajwid Rules', totalPages: 30 }
};

function updateHtmlFile(filePath, moduleKey) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const module = moduleInfo[moduleKey];
        
        // Update title to include context
        const titleRegex = /<title>(.*?)<\/title>/;
        const currentTitle = content.match(titleRegex);
        if (currentTitle && !currentTitle[1].includes(module.title)) {
            const newTitle = currentTitle[1].replace(
                /Iqra (\d+) - Halaman (\d+)/,
                `Iqra $1 - Halaman $2 - ${module.title}`
            );
            content = content.replace(titleRegex, `<title>${newTitle}</title>`);
        }
        
        // Add Sora font import if not exists
        if (!content.includes('Sora:wght')) {
            content = content.replace(
                /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=([^']+)'\);/,
                `@import url('https://fonts.googleapis.com/css2?family=$1&family=Sora:wght@400;600;700&display=swap');`
            );
        }
        
        // Add chatbox script before closing body tag if not exists
        if (!content.includes('ustaz-radhi-chatbox.js')) {
            const scriptTag = `
    <!-- Load Ustaz Radhi AI Chatbox -->
    <script src="../ustaz-radhi-chatbox.js"></script>`;
            
            content = content.replace('</body>', `${scriptTag}\n</body>`);
        }
        
        // Write the updated content back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to update ${filePath}:`, error.message);
        return false;
    }
}

function processModule(moduleKey) {
    const modulePath = path.join(baseDir, moduleKey);
    console.log(`\n🔄 Processing ${moduleKey}...`);
    
    if (!fs.existsSync(modulePath)) {
        console.log(`⚠️ Module directory not found: ${modulePath}`);
        return;
    }
    
    const files = fs.readdirSync(modulePath);
    const pageFiles = files.filter(file => file.match(/^page-\d+\.html$/));
    
    console.log(`📄 Found ${pageFiles.length} page files`);
    
    let successCount = 0;
    pageFiles.forEach(file => {
        const filePath = path.join(modulePath, file);
        if (updateHtmlFile(filePath, moduleKey)) {
            successCount++;
        }
    });
    
    console.log(`✨ Successfully updated ${successCount}/${pageFiles.length} files in ${moduleKey}`);
}

function main() {
    console.log('🚀 Starting Ustaz Radhi AI Chatbox integration...');
    console.log('📚 This will add the AI chatbox to all Iqra learning pages\n');
    
    let totalSuccess = 0;
    let totalFiles = 0;
    
    iqraModules.forEach(moduleKey => {
        const modulePath = path.join(baseDir, moduleKey);
        if (fs.existsSync(modulePath)) {
            const files = fs.readdirSync(modulePath);
            const pageFiles = files.filter(file => file.match(/^page-\d+\.html$/));
            totalFiles += pageFiles.length;
            
            processModule(moduleKey);
            
            // Count successful updates (simplified)
            const successFiles = files.filter(file => {
                if (file.match(/^page-\d+\.html$/)) {
                    const filePath = path.join(modulePath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    return content.includes('ustaz-radhi-chatbox.js');
                }
                return false;
            });
            totalSuccess += successFiles.length;
        }
    });
    
    console.log(`\n🎉 Integration Complete!`);
    console.log(`📊 Summary: ${totalSuccess}/${totalFiles} files updated`);
    console.log(`\n🤖 Ustaz Radhi AI Chatbox Features:`);
    console.log(`   • Context-aware responses for each Iqra module`);
    console.log(`   • Page-specific learning tips and guidance`);
    console.log(`   • Quick action buttons for common questions`);
    console.log(`   • Interactive chat with Gemini AI integration`);
    console.log(`   • Mobile-responsive design`);
    console.log(`   • Islamic learning focus with proper Malay language`);
    console.log(`\n💡 Users can now chat with Ustaz Radhi on every Iqra page!`);
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { updateHtmlFile, processModule, main };
