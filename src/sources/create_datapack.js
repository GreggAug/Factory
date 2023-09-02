    //%nbt_interpreter
    
    // Creates Datapack directory
    create_directory(datapackSettings.output, `data`)
    create_directory(`${datapackSettings.output}`, `data/${datapackSettings.project_ID}/functions`)

    // Sets variables for function Generation
    // Project Namespace (IE: tcc, oa, pdd)
    project_ID = datapackSettings.functions_path.substr(0,datapackSettings.functions_path.search('/'))

    // Tags
    let tags = []
    tags[0] = datapackSettings.primary_tag
    if(datapackSettings.use_smithed_tags) tags[1] = "smithed.entity"
    tags.push("factory.entity")
    if(summonAnimation != null){
        tags.push(`factory.${datapackSettings.primary_tag}.unprocessed`)
    }
    if(datapackSettings.tags != "") tags = tags.concat((datapackSettings.tags.replace(/ /gi, "")).split(","));
    let tagsArray = []
    if(tags != "") {
        tags.forEach(tag => {
            tagsArray.push(`\"${tag}\"`)
        });
    }

    // Summon Command
    displaySlot = datapackSettings.display_slot.split(".")
    let summonNBT = parseNBT(datapackSettings.nbt)
    summonNBT[displaySlot[0]] = createLibFromPath(displaySlot)[displaySlot[0]]
    summonNBT["Tags"] = tagsArray
    summonNBT["CustomName"] = `\'{"translate":"${datapackSettings.name}","font":"${datapackSettings.name_font}","italic":false}\'`
    

    /// Creates Files if they do not already exist
    // Load.json
    if(!(fs.existsSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`))){
        create_directory(datapackSettings.output, `data/minecraft/tags/functions`)
        fs.writeFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`, 
            `{\n` +
            `   "values": [\n` +
            `      ${datapackSettings.project_ID}:factory/load\n`+
            `   ]\n` +
            `}`,
            function (err, result) {
                if (err) console.log('', err);
            }
        )
    }
    else{
        var file = autoParseJSON(fs.readFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`, 'utf8'))
        if(!file.values.includes(`${datapackSettings.project_ID}:factory/load`)){
            file.values.push(`${datapackSettings.project_ID}:factory/load`)
            fs.writeFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`, compileJSON(file))
        }
    }

    // Tick.json
    if(!(fs.existsSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`))){
        create_directory(datapackSettings.output, `data/minecraft/tags/functions`)
        fs.writeFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`, 
            `{\n` +
            `   "values": [\n` +
            `      ${datapackSettings.project_ID}:factory/tick\n` +
            `   ]\n` +
            `}`,
            function (err, result) {
                if (err) console.log('', err);
            }
        )
    }
    else{
        var file = autoParseJSON(fs.readFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`, 'utf8'))
        if(!file.values.includes(`${datapackSettings.project_ID}:factory/tick`)){
            file.values.push(`${datapackSettings.project_ID}:factory/tick`)
            fs.writeFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`, compileJSON(file))
        }
    }

    // Tick function
    create_function(datapackSettings, `factory/tick`, 
    [`execute as @e[tag=factory.entity] at @s run function ${datapackSettings.project_ID}:factory/tick_filter`])

    // Tick Filter Function
    if(!(fs.existsSync(`${datapackSettings.output}\\data\\${datapackSettings.project_ID}\\functions\\factory\\tick_filter.mcfunction`))){
        create_function(datapackSettings, `factory/tick_filter`, 
        [`execute if entity @s[tag=${datapackSettings.primary_tag}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick`])
    }
    else {
        file = fs.readFileSync(`${datapackSettings.output}\\data\\${datapackSettings.project_ID}\\functions\\factory\\tick_filter.mcfunction`, 'utf8')
        if(!(file.includes(`execute if entity @s[tag=${datapackSettings.primary_tag}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick`))){
            fs.writeFileSync(`${datapackSettings.output}\\data\\${datapackSettings.project_ID}\\functions\\factory\\tick_filter.mcfunction`, file += `\nexecute if entity @s[tag=${datapackSettings.primary_tag}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick`)
        }
    }

    /// Generates Functions
    // Load function
    create_function(datapackSettings, `factory/load`, 
    [
    `scoreboard objectives add factory.frame dummy`,
    `scoreboard objectives add factory.animation dummy`,
    `scoreboard objectives add factory.dummy dummy`,
    `scoreboard objectives add factory.color dummy`,
    `scoreboard objectives add factory.timer dummy`,
    `scoreboard players set #factory.value.24000 factory.dummy 24000`,
    `scoreboard players set #factory.value.256 factory.dummy 256`])

    // Frame Set Function
    create_function(datapackSettings, `factory/set_frame`, 
    [
    `execute store result score #factory.color_offset factory.dummy run time query gametime`,
    `scoreboard players operation #factory.color_offset factory.dummy %= #factory.value.24000 factory.dummy`,
    `scoreboard players operation #factory.color_offset factory.dummy -= #factory.starting_frame factory.dummy`,
    `scoreboard players operation #factory.color_offset factory.dummy -= #factory.duration factory.dummy`,
    `scoreboard players operation #factory.color_offset factory.dummy *= #factory.value.256 factory.dummy`,
    `scoreboard players operation @s factory.color = #factory.color_offset factory.dummy`,
    `scoreboard players set #factory.duration factory.dummy 0`,
    `scoreboard players set #factory.starting_frame factory.dummy 0`])

    // Start Animation Functions
    function generateStartAnimationFuncts (animation, index){
        create_function(datapackSettings, `${datapackSettings.functions_path}/${animation.name}.start`, (removeAnimationTags.concat([
        `data modify entity @s ${datapackSettings.display_slot}.tag.CustomModelData set value ${resourcepackSettings.custom_model_data_start + index}`,
        `scoreboard players set #factory.starting_frame factory.dummy 0`,
        `scoreboard players set #factory.duration factory.dummy ${parseInt(animation.length * 20) - 1}`,
        `function ${datapackSettings.project_ID}:factory/set_frame`,
        `execute store result entity @s ${datapackSettings.display_slot}.tag.display.color int 1 run scoreboard players get #factory.color_offset factory.dummy`,
        `tag @s add ${datapackSettings.primary_tag}.animating.${animation.name}`,
        `tag @s remove factory.${datapackSettings.primary_tag}.unprocessed`,
        `scoreboard players set @s factory.frame 0`])))
    }
    Project.animations.forEach((animation, index) => generateStartAnimationFuncts(animation, index))

    // Animation Tick Functions Generator
    toWrite_entity_tick = [
        `execute store result storage pdd:storage temp.entity.frame int 1 run scoreboard players get @s factory.frame`
    ]
    if (Project.animations.length != 0){
        Project.animations.forEach(element => {
            toWrite_entity_animation_tick = []
            toWrite_entity_tick.push(`execute if entity @s[tag=${datapackSettings.primary_tag}.animating.${element.name}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick/${element.name} with storage factory:storage temp.entity`)
            let ticks = []
            for (const bone in element.animators) {
                if(!(element.animators[bone]["factory.commands"] === undefined)) {
                    element.animators[bone]["factory.commands"].forEach(keyframe => {
                        if(!(keyframe === undefined) && !(keyframe["time"] === undefined))
                        
                        if(keyframe["interpolation"] == "linear") {
                        }

                        // Animation Keyframe Functions
                        create_function(datapackSettings, `${datapackSettings.functions_path}/factory_tick/${element.name}/${Math.floor(keyframe['time']*20)}`, [keyframe["data_points"][0]['factory.commands']])
                        ticks.push(Math.floor(keyframe['time']*20))
                    })
                }
            }
            ticks = ticks.sort(function(a, b) {
                return a - b;
              });
            if(ticks[ticks.length - 1] != Math.floor(element.length * 20)){
                ticks.push(Math.floor(element.length * 20))

                // End Of Animation Function
                create_function(datapackSettings, `${datapackSettings.functions_path}/factory_tick/${element.name}/${Math.floor(element.length * 20)}`, [`scoreboard players set @s factory.frame 0`, `tag @s remove ${datapackSettings.primary_tag}.animating.${element.name}`]) 
            }
            toWrite_entity_animation_tick.push(`$execute if score @s factory.frame matches ${ticks[0]}..${ticks[ticks.length - 1]} run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick/${element.name}/$(frame)`)
            
            // Animation Tick Function
            create_function(datapackSettings, `${datapackSettings.functions_path}/factory_tick/${element.name}`, toWrite_entity_animation_tick)
        });
        toWrite_entity_tick.push(`function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/tick`)
        toWrite_entity_tick.push(`scoreboard players add @s factory.frame 1`)
    }

    // Entity Tick Functions
    create_function(datapackSettings, `${datapackSettings.functions_path}/factory_tick`, 
        toWrite_entity_tick)  
        
    // Entity Summon Function
    if(summonAnimation != null){
        create_function(datapackSettings, `${datapackSettings.functions_path}/summon`, [
            `summon ${datapackSettings.entity_type} ~ ~ ~ ${compileNBT(summonNBT)}`,
            `execute as @e[tag=factory.${datapackSettings.primary_tag}.unprocessed,limit=1,sort=nearest] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/${summonAnimation}.start`])
    }
    else{
        create_function(datapackSettings, `${datapackSettings.functions_path}/summon`, [
            `summon ${datapackSettings.entity_type} ~ ~ ~ ${compileNBT(summonNBT)}`])
    }