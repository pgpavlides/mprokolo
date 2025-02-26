// File: chrome-extension/content.js

/*
Green Coder v0.5

######%                                                             
                               %%                                                                   
                                                                                                    
                                               ........                                             
                                           ....-*#####+....                                         
                                        ..:*##*+======++##+..                                       
                                      ..=##===============+#*..                                     
                            ..       ..##===================##..      ...                           
                      ....:=**+-.....:#+=====================*#.....-+***=:....                     
                   ...+##*=-::-=+##*=#+======================+#####*+====+**##*:...                 
                 ...##-::::::-====--*##========================================##*..                
                ..+#=:::-=============+##========================================*#=..              
               ..+#:::=============================================================#*..             
               ..#=:-===============================================================#*..            
               .=#:-================================================================+#..            
               .=#:==================================================================#..            
               .-#=======================#+=+##======================================#..            
             ....#*=======================##*=======================================+#..            
          ..=##*+++=================================================================##:.....        
        ..-#*:-====================================================================+########=..     
       ..=#-:======================================================================*********##*..   
       .-#=:=======================================================================***********##..  
      ..**:-============#*=========================================================************#+.. 
      ..#+:-============#+=================================================#+======************#*.. 
      ..**:-============+#####=============================================##======************#:.. 
       .:#+:=====================================*#+========================###====+********#*##..  
        .:##:======================================####*============================*********##+..  
         ..:###+====================================================================+**********##:. 
            ...=#*===================*#==============================================***********##..
               ..*#+================*##+=============================================************#:.
                ..:##+=============#####=======================#*====================************#:.
                  ...-###*++=+**#####..##===========================================************##..
                      ....:#*+-::-*#   .*#*==============+##+======================+***********##...
                         ..#+:::==##    ..*###*+===+**###+#=======================+***********##... 
                          .#*::===*#      ##===+*###*#+..=#======================+**********###...  
                          .**:=====##     #*=======**##  -#====================+*******#####-...    
##                        .+*:=====*#%   ##========**##  .#==================+*********###*..       
%##                       .**-======*#%##*========**########==============+***************#-.       
 %#%                      .#*-=======##==========**##======##==========+******************#:.       
 ##%                      .#+========#*=========*##+========*##+==++####*****************#+..       
                         .-#-=======+#=========+##=======****##++*=...*#****************##..        
                         .+#-=======+*=========+#=====*****##:.....   -##**************##..         
#%                       .#+========================+****##...         -##***********##=..          
                        .+#-=======================****##+..            .=####*#####*....           
                        .#========================****##..               .............              
                       .*#-===*##+=====####+=====****##..                                           
                       .#+===*+==*#+======+#+===****##..                                            
                      .*#=========#========#*===****#-.                                             
                      .#*======================+***##.                                              
                     ..#+======================****#:.              %###%                           
                     .:#===========#**#*======+***##.              %#                               
                     .:#+=============+*======****#..                                      ==       
                     ..#+====================+***#*.            ##                       ======     
                     ..##====================***##..                                     ======     
                      ..#*==================***##..                                      ======     
                       ..##===============****##..                                                  
                       ...=##==========+****##=..                                  =====            
                         ...:###+==+*****###-..                                    =====            
                           .....-*#####*+:....                                                      
                              .............
*/

// Listen for messages from webpage
window.addEventListener('message', async (event) => {
  // Only process messages from our window
  if (event.source !== window) return;

  // Handle extension check request
  if (event.data.type === 'CHECK_EXTENSION') {
    window.postMessage({ type: 'BROCCOLI_EXTENSION_RESPONSE', timestamp: Date.now() }, '*');
  }

  // Handle bookmark sync request
  if (event.data.type === 'REQUEST_BOOKMARKS_SYNC') {
    try {
      // Request bookmarks from background script
      const response = await chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS' });
      
      if (!response || !response.bookmarks) {
        throw new Error('Failed to get bookmarks from Chrome API');
      }

      // Process the bookmarks
      const processedBookmarks = [];
      const categories = new Set();

      const processNode = (node, parentFolders = []) => {
        if (node.url) {
          // Get the immediate parent folder name (excluding "Other Bookmarks")
          const relevantFolders = parentFolders.filter(folder => folder !== 'Other Bookmarks');
          const category = relevantFolders.length > 0 ? relevantFolders[relevantFolders.length - 1] : 'Uncategorized';

          // Add category to the set if not Uncategorized
          if (category !== 'Uncategorized') {
            categories.add(category);
          }

          // Generate tags from title and folders
          const titleWords = node.title.toLowerCase()
            .split(/[\s\-_,\|\[\]\(\)]+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'for', 'with', 'www', 'com', 'org', 'net'].includes(word));

          const folderTags = relevantFolders.map(folder => 
            folder.toLowerCase().replace(/[^a-z0-9]/g, '')
          );

          const tags = [
            ...new Set([
              ...titleWords,
              ...folderTags,
              'chrome',
              'imported'
            ])
          ];

          processedBookmarks.push({
            id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2)}`,
            name: node.title || 'Untitled',
            link: node.url,
            category: category,
            path: relevantFolders.join('/'),
            tags: tags,
            dateAdded: node.dateAdded
          });
        }

        // Process children if they exist
        if (node.children) {
          const newParentFolders = node.title ? [...parentFolders, node.title] : parentFolders;
          node.children.forEach(child => processNode(child, newParentFolders));
        }
      };

      // Process each root node
      response.bookmarks.forEach(root => processNode(root));

      // Create category objects
      const categoryObjects = Array.from(categories).map(name => ({
        id: `category_${Date.now()}_${Math.random().toString(36).substr(2)}`,
        name: name,
        icon: 'folder' // Default icon
      }));

      // Send the processed bookmarks and categories back to the webpage
      window.postMessage({
        type: 'CHROME_BOOKMARKS_SYNC',
        bookmarks: processedBookmarks,
        categories: categoryObjects
      }, '*');

    } catch (error) {
      window.postMessage({
        type: 'CHROME_BOOKMARKS_ERROR',
        error: error.message
      }, '*');
    }
  }
});

// Delay the initial notification to allow the webpage's listener to attach
setTimeout(() => {
  window.postMessage({ 
    type: 'BROCCOLI_EXTENSION_LOADED',
    timestamp: Date.now()
  }, '*');
}, 1000);
