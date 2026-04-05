const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('client/src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Regex replacements
        // Replace bg-black/XX or bg-black with bg-background/XX or bg-background
        content = content.replace(/bg-black\/(\d+)/g, 'bg-background/$1');
        content = content.replace(/\bbg-black\b(?![\/\w])/g, 'bg-background');
        
        // Replace bg-zinc-950 with bg-background
        content = content.replace(/\bbg-zinc-950\b/g, 'bg-background');
        content = content.replace(/bg-zinc-950\/(\d+)/g, 'bg-background/$1');
        
        // Replace text-white/80 with text-foreground/80
        content = content.replace(/text-white\/80/g, 'text-foreground/80');
        // Replace text-white/50 with text-foreground/50
        content = content.replace(/text-white\/50/g, 'text-foreground/50');
        // Replace text-white with text-foreground (sometimes text-white is used directly)
        content = content.replace(/\btext-white\b(?![\/\w])/g, 'text-foreground');
        
        // Replace border-white/5 with border-border/50
        content = content.replace(/border-white\/5\b/g, 'border-border/50');
        // Replace border-white/10 with border-border
        content = content.replace(/border-white\/10\b/g, 'border-border');
        
        // Replace bg-white/5 with bg-foreground/5
        content = content.replace(/bg-white\/5\b/g, 'bg-foreground/5');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated: ' + filePath);
        }
    }
});
