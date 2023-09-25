datapackDialog = null
if (datapackDialog != null) datapackDialog.delete()
datapackDialog = new Dialog('datapackDialog', {
    title: 'Factory Datapack Settings',
    form:
    {
        create_datapack: { type: 'checkbox', label: 'Create Datapack', value: `True`, description: 'Creates a datapack that has functions to spawn a model & start animation functions.' },
        output: { type: 'folder', label: 'Data Pack Output', value: this.path, description: 'Select the Data Pack Folder containing your \"pack.mcmeta\" file' },
        use_smithed_tags: { type: 'checkbox', label: 'Use Smithed Tags', value: 'True', description: 'Entities summoned from functions will have standard smithed tags' },
        project_ID: { type: 'text', label: 'Project Namespace', value: null, description: 'What namespace functions are generated under (ie: mypack:somefunction)' },
        entity_type: { type: 'input', label: 'Entity Type', value: `minecraft:item_display`, placeholder: `minecraft:item_display`, description: 'What mob to summon and run functions as' },
        display_slot: { type: 'input', label: 'Display Slot', value: `item`, placeholder: `item`, description: 'What nbt path to use to display item, ie: {item} for Item Displays, {ArmorItems[3]} for Armorstands and Zombies' },
        primary_tag: { type: 'input', label: 'Primary Targeting Tag', value: `mypack.${Project.name}`, placeholder: `mypack.${Project.name}`, description: 'Primary tag used to target the mob, use only a single tag' },
        tags: { type: 'input', label: 'Other Tags', placeholder: 'mypack.mobtype_a, mypack.passive', description: 'Other tags that the mob will be given, seperate different tags with a comma (,), do not include primary tag' },
        name: { type: 'input', label: 'Name', value: `${Project.name}`, placeholder: `${Project.name}`, description: 'Translation string for the display entity name' },
        name_font: { type: 'input', label: 'Name font', value: `minecraft:default`, placeholder: 'mypack:myfont', description: 'Font for the display enity name, do not change if you do not know how to use fonts' },
        nbt: { type: 'input', label: 'Additional NBT', value: `{transformation:{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,-.5f],scale:[1f,1f,1f]},width:0.0f,height:0.0f, item_display: "ground"}`, placeholder: `{value:1b}`, description: 'Adidtional NBT, not what is already defined above' },
        functions_path: { type: 'input', label: 'Functions Path', value: `/entity/${Project.name}`, placeholder: 'entity/myMob', description: 'What path the functions for the entity will be created under, from the data/namespace/functions folder' },
        summon_animation: { type: 'input', label: 'Summon Animation', description: 'Summon animation, leave empty for no summon animation. Ran on creation of model' },
        use_aec: { type: 'checkbox', label: 'Use Area Effect Cloud', value: 'True', description: `Set True to make the display entity ride an Area Effect Cloud, causes position changes to be interpolated but to teleport the entity must target the area effect cloud with the tag [primary tag].aec` }
    },
    onConfirm: function() {
        if(factoryData[`${Project.uuid}`] == undefined) factoryData[`${Project.uuid}`] = {};
        factoryData[`${Project.uuid}`]["datapack"] = datapackDialog.getFormResult()
    }

})
datapackDialog.show()
datapackDialog.hide()