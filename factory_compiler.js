(function () {
    var exec = require('child_process');
    Plugin.register('factory_compiler', {
        name: 'factory_compiler',
        title: 'Factory Compiler',
        author: 'Gregg.',
        icon: 'icon-player',
        version: '1.0.0-alpha.1',
        tags: ['Minecraft: Java Edition', "Animation", "Shader"],
        variant: 'desktop',
        oninstall() {

        },
        onload() {
            const fs = require("fs");
            const localPath = this.path.replace("factory_compiler.js", "")
            let kk_base = fs.readFileSync(`${localPath}main.js`, { encoding: "utf8" }, 'r')
            let fileInsert = ""
            for(textReader = 0; textReader < kk_base.length; textReader++){
                
                if(fileInsert == ""){
                    textReader = kk_base.search("//%") + 3
                    if(textReader == -1){
                        break;
                    }
                }
                fileInsert += kk_base[textReader]
                if(kk_base[textReader + 2] == "\n"){
                    if(fs.existsSync(`${localPath}src/sources/${fileInsert}.js`, 'r')){
                        
                        kk_base = kk_base.replace(`//%${fileInsert}`, fs.readFileSync(`${localPath}src/sources/${fileInsert}.js`))
                        textReader = 0
                        fileInsert = ""
                    }
                }
            }
            fs.writeFileSync(`${localPath}src/factory.js`, kk_base,
                            function (err, result) {
                                if (err) console.log('', err);
            })
        },

        onunload() {

        }
    }
    )
})();