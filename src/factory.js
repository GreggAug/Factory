function create_directory(start, directory) {
  const folders = directory.split("/");
  var i = 0;
  var checkedPath = "";
  do {
    checkedPath += `/${folders[i]}`;
    if (!fs.existsSync(`${start}/${checkedPath}`)) {
      // Does not generate a folder if the folder already exists
      fs.mkdirSync(`${start}/${checkedPath}`, function (err, result) {
        if (err) console.log("", err);
      });
    }
    i += 1;
  } while (checkedPath != `/${directory}`);
}


function defineFactoryPlugin() {
  var factoryData = {};
  let datapackDialog;
  let resourcepackDialog;
  let actionResourcepackDialog;
  let actionDatapackDialog;
  let actionExportFactoryProject;
  const exec = require("child_process");
  const barMenu = new BarMenu(
    "exportFactoryProject",
    [
      "actionResourcepackDialog",
      "actionDatapackDialog",
      "actionTiedFunctionsDialog",
      "actionExportFactoryProject",
    ],
    { condition: () => Format.id == "factory_project" }
  );
  Plugin.register("factory", {
    name: "factory",
    title: "Factory",
    author: "Gregg.",
    icon: "icon-player",
    version: "1.0.0-alpha.1",
    tags: ["Minecraft: Java Edition", "Animation", "Shader"],
    variant: "desktop",

    oninstall() {},
    onload() {
      function import_objmc_location() {
        {
          Blockbench.import(
            {
              resource_id: "objmc_location",
              extensions: ["py"],
              type: "OBJMC Location",
            },
            function (files) {
              resourcepackDialog.onConfirm();
              if (factoryData[`${Project.uuid}`] != undefined)
                if (
                  factoryData[`${Project.uuid}`]["resourcepack"] != undefined
                ) {
                  factoryData[`${Project.uuid}`]["resourcepack"][
                    "current_objmc_path"
                  ] = files[0].path;
                  resourcepackDialog.setFormValues(
                    factoryData[`${Project.uuid}`]["resourcepack"]
                  );
                }
              resourcepackDialog.show();
            }
          );
        }
      }

      resourcepackDialog = null;
// For some reason completely restating a dialog box is the only way to get the values to update, this is done so the user can see
if (resourcepackDialog != null) resourcepackDialog.delete; // what the path for OBJMC is since BB dialogue doesn't normally support file inputs for form object types
resourcepackDialog = new Dialog("resourcepackDialog", {
  title: "Resource Pack Output Settings",
  form: {
    change_objmc_location: {
      type: "buttons",
      buttons: ["Change OBJMC Path"],
      click() {
        import_objmc_location();
      },
      label: "",
      value: null,
      description: "Select your installation of OBJMC here (objmc.py)",
    },
    current_objmc_path: {
      type: "text",
      label: "Current OBJMC Path",
      readonly: true,
    },
    output: {
      type: "folder",
      label: "Resource Pack Output",
      value: this.path,
      description:
        'Select the Resource Pack Folder containing your "pack.mcmeta" file',
    },
    project_ID: {
      type: "text",
      label: "Project Namespace",
      value: null,
      description:
        "What namespace textures and models are generated under (ie: mypack:models/entity/somemodel.json)",
    },
    item_json: {
      type: "text",
      label: "JSON",
      value: null,
      description: "Input what JSON file to store the model as",
    },
    custom_model_data_start: {
      type: "number",
      label: "Custom Model Data Start",
      value: 0,
      min: 0,
      max: 2147483647,
      step: 1,
      description:
        "Input what number you want the rig item to start Custom Model Data at (ie: at 100 your model will overwrite custom model data 100, 101, ect)",
    },
    use_hurt_tint: {
      type: "checkbox",
      label: "Use Hurt Tint texture",
      value: false,
      description: "Toggle to use the second texture as a hurt tint texture",
    },
  },
  onConfirm: function resourcepackDialogOnConfirm() {
    if (factoryData[`${Project.uuid}`] == undefined)
      factoryData[`${Project.uuid}`] = {};
    factoryData[`${Project.uuid}`]["resourcepack"] =
      resourcepackDialog.getFormResult();
  },
});
resourcepackDialog.show();
resourcepackDialog.hide();

      datapackDialog = null;
if (datapackDialog != null) datapackDialog.delete();
datapackDialog = new Dialog("datapackDialog", {
  title: "Factory Datapack Settings",
  form: {
    create_datapack: {
      type: "checkbox",
      label: "Create Datapack",
      value: `True`,
      description:
        "Creates a datapack that has functions to spawn a model & start animation functions.",
    },
    output: {
      type: "folder",
      label: "Data Pack Output",
      value: this.path,
      description:
        'Select the Data Pack Folder containing your "pack.mcmeta" file',
    },
    use_smithed_tags: {
      type: "checkbox",
      label: "Use Smithed Tags",
      value: "True",
      description:
        "Entities summoned from functions will have standard smithed tags",
    },
    project_ID: {
      type: "text",
      label: "Project Namespace",
      value: null,
      description:
        "What namespace functions are generated under (ie: mypack:somefunction)",
    },
    entity_type: {
      type: "input",
      label: "Entity Type",
      value: `minecraft:item_display`,
      placeholder: `minecraft:item_display`,
      description: "What mob to summon and run functions as",
    },
    display_slot: {
      type: "input",
      label: "Display Slot",
      value: `item`,
      placeholder: `item`,
      description:
        "What nbt path to use to display item, ie: {item} for Item Displays, {ArmorItems[3]} for Armorstands and Zombies",
    },
    primary_tag: {
      type: "input",
      label: "Primary Targeting Tag",
      value: `mypack.${Project.name}`,
      placeholder: `mypack.${Project.name}`,
      description: "Primary tag used to target the mob, use only a single tag",
    },
    tags: {
      type: "input",
      label: "Other Tags",
      placeholder: "mypack.mobtype_a, mypack.passive",
      description:
        "Other tags that the mob will be given, seperate different tags with a comma (,), do not include primary tag",
    },
    name: {
      type: "input",
      label: "Name",
      value: `${Project.name}`,
      placeholder: `${Project.name}`,
      description: "Translation string for the display entity name",
    },
    name_font: {
      type: "input",
      label: "Name font",
      value: `minecraft:default`,
      placeholder: "mypack:myfont",
      description: "Font for the display enity name, do not change if you do not know how to use fonts",
    },
    nbt: {
      type: "input",
      label: "Additional NBT",
      value: `{transformation:{left_rotation:[0f,0f,0f,1f],right_rotation:[0f,0f,0f,1f],translation:[0f,0f,-.5f],scale:[1f,1f,1f]},width:0.0f,height:0.0f, item_display: "ground"}`,
      placeholder: `{value:1b}`,
      description: "Additional NBT, not what is already defined above",
    },
    functions_path: {
      type: "input",
      label: "Functions Path",
      value: `/entity/${Project.name}`,
      placeholder: "entity/myMob",
      description:
        "What path the functions for the entity will be created under, from the data/namespace/functions folder",
    },
    summon_animation: {
      type: "input",
      label: "Summon Animation",
      description:
        "Summon animation, leave empty for no summon animation. Ran on creation of model",
    },
    use_aec: {
      type: "checkbox",
      label: "Use Area Effect Cloud",
      value: "True",
      description: `Set True to make the display entity ride an Area Effect Cloud, causes position changes to be interpolated but to teleport the entity must target the area effect cloud with the tag [primary tag].aec`,
    },
  },
  onConfirm: function () {
    if (factoryData[`${Project.uuid}`] == undefined)
      factoryData[`${Project.uuid}`] = {};
    factoryData[`${Project.uuid}`]["datapack"] = datapackDialog.getFormResult();
  },
});
datapackDialog.show();
datapackDialog.hide();

      class myDialog extends Dialog{  // My own version of Dialog class since the original doesn't run onOpen until after the dialog box is shown, also rebuild every time it is shown
    constructor(id, options) {
      super(id, options)
      this.previousAnimation = -1;
      this.previousBone = -1;
      this.updating = false;
  }

	show() {

		// Hide previous
		if (window.open_interface && open_interface instanceof Dialog == false && typeof open_interface.hide == 'function') {
			open_interface.hide();
		}

		if (typeof this.onOpen == 'function') {
			this.onOpen();
		}

    if(!this.object){
      this.build();
    }
    else{
      let oldValues = this.getFormResult()
      this.build();
      this.setFormValues(oldValues)

    }
		

		let jq_dialog = $(this.object);

		document.getElementById('dialog_wrapper').append(this.object);
		
		if (this instanceof ShapelessDialog === false) {
			this.object.style.display = 'flex';
			this.object.style.top = limitNumber(window.innerHeight/2-this.object.clientHeight/2, 0, 100)+'px';
			if (this.width) {
				this.object.style.width = this.width+'px';
			}
			if (this.draggable !== false) {
				let x = Math.clamp((window.innerWidth-this.object.clientWidth)/2, 0, 2000)
				this.object.style.left = x+'px';
			}
		}

		if (!Blockbench.isTouch) {
			let first_focus = jq_dialog.find('.focusable_input').first();
			if (first_focus) first_focus.trigger('focus');
		}
		this.focus();

		return this;
	}
}

if (typeof tiedFunctionsDialog == 'undefined'){
  tiedFunctionsDialog = new myDialog("tiedFunctionsDialog", {
    title: "Tied Functions Menu",
    form: {
      animation: {
        type: "select",
        label: "Animation",
        options: {},
        description:
          "Select which animation to edit tied functions for.",
      },
      bone: {
        type: "select",
        label: "Bone",
        options: {},
        description:
          "Select which animation to edit tied functions for.",
      },
      balls: {
        type: "string",
        label: "cock",
        value: "",
        description:
          "Select which animation to edit tied functions for.",
      }
    },
    onConfirm: function () {
    },
    onOpen: function(){
      let animationNames = {}
      Project.animations.forEach((animation, i) => animationNames[i] = `${animation.name}`)
      tiedFunctionsDialog.form.animation.options = animationNames

      let boneNames = {
        0: 'Entity Position'
      }
      Project.groups.forEach((bone, i) => boneNames[i + 1] = `${bone.name}`)
      tiedFunctionsDialog.form.bone.options = boneNames


      
      if( typeof factoryData[`${Project.uuid}`]["tiedFunctions"] != 'undefined'){
        console.log("test")
        if( typeof factoryData[`${Project.uuid}`]["tiedFunctions"][this.getFormResult().animation] != 'undefined'){
          console.log("test")
          if( typeof factoryData[`${Project.uuid}`]["tiedFunctions"][this.getFormResult().animation][this.getFormResult().bone] != 'undefined'){
            console.log("test")
            tiedFunctionsDialog.form.balls.value = factoryData[`${Project.uuid}`]["tiedFunctions"][this.getFormResult().animation][this.getFormResult().bone]
            return
          }
        }
      }
      tiedFunctionsDialog.form.balls.value = ""
    },
    onFormChange: function(){
      if(!this.updating){ // So the method can't recursively call itself
        this.updating = true;
        if(this.previousAnimation == this.getFormResult().animation && this.previousBone == this.getFormResult().bone){
          console.log("unchanged")
          if (factoryData[`${Project.uuid}`]["tiedFunctions"] == undefined){
            factoryData[`${Project.uuid}`]["tiedFunctions"] = {}
          }
          if (factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation] == undefined){
            factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation] = {}
          }
          if (factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation][this.previousBone] == undefined){
            factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation][this.previousBone] = {};
          }
          factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation][this.previousBone] = tiedFunctionsDialog.getFormResult().balls;
          console.log(factoryData[`${Project.uuid}`]["tiedFunctions"])
        }

        else {
          console.log("changed")
          this.previousAnimation = this.getFormResult().animation;
          this.previousBone = this.getFormResult().bone;
          let set = false
          if( typeof factoryData[`${Project.uuid}`]["tiedFunctions"] != 'undefined'){
            if( typeof factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation] != 'undefined'){
              if( typeof factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation][this.previousBone] != 'undefined'){
                set = true
                this.setFormValues({
                  animation: this.previousAnimation,
                  bone: this.previousBone,
                  balls: factoryData[`${Project.uuid}`]["tiedFunctions"][this.previousAnimation][this.previousBone]
                })
              }
            }
          }
          if(!set){
            this.setFormValues({
              animation: this.previousAnimation,
              bone: this.previousBone,
              balls: ""
            })
          }
        }
        this.show()
        this.updating = false;
      }
    }
  });
}

      

      // Saves Entity Settings and Project Settings
      Codecs.project.on("compile", (context) => {
        if (Project != 0 && Format.id == "factory_project") {
          if (factoryData[`${Project.uuid}`] != undefined) {
            context.model.factorydata = factoryData[`${Project.uuid}`];
          } else {
            context.model.factorydata = {};
          }
        }
      });

      // Saves Entity Settings and Project Settings
      Codecs.project.on("parse", (context) => {
        if (Project != 0 && Format.id == "factory_project") {
          if (context.model.factorydata != undefined) {
            factoryData[`${Project.uuid}`] = context.model.factorydata;
          }
        }
      });

      // Model Format
      (factory_format = new ModelFormat({
        id: "factory_project",
        name: "Factory Project",
        category: "minecraft",
        description:
          "Output to Minecraft: Java Edition as a fully fledged custom mob with a Datapack and Resourcepack",
        target: ["Minecraft: Java Edition"],
        format_page: {
          content: [
            { type: "h3", text: tl("mode.start.format.informations") },
            {
              text: `* ${tl(
                "Factory Outputs directly to a pre-existing resourcepack and pre-existing datapack."
              )}`,
            },
            {
              text: `* ${tl(
                "In order for Factory models to render correctly on a client with Optifine, a seperate resourcepack/shader must be used"
              )}`,
            },
          ],
        },
        show_on_start_screen: true,
        box_uv: true,
        optional_box_uv: true,
        bone_rig: true,
        rotate_cubes: true,
        canvas_limit: true,
        locators: true,
        animation_mode: true,
        display_mode: false,
        integer_size: false,
        centered_grid: true,
        icon: "icon-player",
      })),
        (actionResourcepackDialog = new Action("actionResourcepackDialog", {
          condition: () => Format.id == "factory_project",
          name: "Resource Pack Settings",
          description: "Set settings for the exported Resource Pack",
          icon: "settings",
          click: function () {
            if (factoryData[`${Project.uuid}`] != undefined)
              if (factoryData[`${Project.uuid}`]["resourcepack"] != undefined) {
                resourcepackDialog.setFormValues(
                  factoryData[`${Project.uuid}`]["resourcepack"]
                );
              }
            resourcepackDialog.show();
          },
        })),
        (actionDatapackDialog = new Action("actionDatapackDialog", {
          condition: () => Format.id == "factory_project",
          name: "Data Pack Settings",
          description: "Set properties for the exported Data Pack",
          icon: "settings",
          click: function () {
            if (factoryData[`${Project.uuid}`] != undefined)
              if (factoryData[`${Project.uuid}`]["datapack"] != undefined) {
                datapackDialog.setFormValues(
                  factoryData[`${Project.uuid}`]["datapack"]
                );
              }
            datapackDialog.show();
          },
        }));
        (actionTiedFunctionsDialog = new Action("actionTiedFunctionsDialog", {
          condition: () => Format.id == "factory_project",
          name: "Tied Functions",
          description: "Set Tied Functions",
          icon: "settings",
          click: function () {
            if (factoryData[`${Project.uuid}`] != undefined)
              if (factoryData[`${Project.uuid}`]["tiedFunctions"] != undefined) {
                tiedFunctionsDialog.setFormValues(
                  factoryData[`${Project.uuid}`]["tiedFunctions"]
                );
              }
              tiedFunctionsDialog.show();
          },
        }));

      function create_function(datapackSettings, functionName, strings) {
  let tempArray = functionName.split("/");
  fileName = tempArray[tempArray.length - 1];
  tempArray.pop();
  let folderPath = ``;
  let data = "";
  tempArray.forEach((folder) => {
    folderPath += folder + "/";
  });

  create_directory(
    `${datapackSettings.output}/data/${datapackSettings.project_ID}/functions`,
    folderPath
  );

  data = "";
  strings.forEach((command) => {
    data += command + "\n";
  });

  fs.writeFileSync(
    `${datapackSettings.output}/data/${datapackSettings.project_ID}/functions/${folderPath}${fileName}.mcfunction`,
    data,
    function (err, result) {
      if (err) console.log("", err);
    }
  );
}

function roundOutSN(n){ // rounds out scientific notation
  if(n * 10000 < 1 && n * 10000 > -1 ){
    return 0
  }
  return n

}

function exportFactoryProject(resourcepackSettings, datapackSettings) {
  let entityName;
  if (Project._name == (null || "")) {
    // Uses unnamed_project in space of project name if the project is unnamed
    entityName = "unnamed_project";
  } else {
    entityName = Project._name.toLowerCase();
  }

  create_directory(resourcepackSettings.output, `objstemp`);
  // Generates paths for the resourcepack
  create_directory(resourcepackSettings.output, `assets/minecraft/models/item`);

  create_directory(
    resourcepackSettings.output,
    `assets/${resourcepackSettings.project_ID}/models/entity/${entityName}`
  );
  create_directory(
    resourcepackSettings.output,
    `assets/${resourcepackSettings.project_ID}/textures/entity/${entityName}`
  );

  // Creates the atlas
  create_directory(resourcepackSettings.output, `assets/minecraft/atlases`);
  if (!fs.existsSync(`${resourcepackSettings.output}\\assets\\minecraft\\atlases\\blocks.json`)) 
  {
    fs.writeFileSync(
      `${resourcepackSettings.output}\\assets\\minecraft\\atlases\\blocks.json`,
      `{\n` +
        `   "sources": [\n` +
        `      	{\n` +
        `           "type": "directory",\n` +
        `           "source": "entity",\n` +
        `           "prefix": "entity/"\n` +
        `   }\n` +
        `   ]\n` +
        `}`,
      function (err, result) {
        if (err) console.log("", err);
      }
    );
  } 
  else {
    var file = autoParseJSON(fs.readFileSync(`${resourcepackSettings.output}\\assets\\minecraft\\atlases\\blocks.json`, "utf8"));
    console.log(file.sources[1]);
    var entity_atlas = {
      type: "directory",
      source: "entity",
      prefix: "entity/",
    };
    console.log(entity_atlas == file.sources[1]);
    if (!file.sources.includes(entity_atlas)) {
      file.sources.push(entity_atlas);
      fs.writeFileSync(
        `${resourcepackSettings.output}\\assets\\minecraft\\atlases\\blocks.json`,
        compileJSON(file)
      );
    }
  }

  let y = 0;
  let animCount = 0;
  let overrides = [];
  let removeAnimationTags = [];
  let summonAnimation = null;
  let animDict = {
    // Dictionary so the datapack can acess animations via CMD
  };

  Project.animations.forEach(ExportAnimation);
  //$exportAnimation
  
  fs.rmdirSync(`${resourcepackSettings.output}\\objstemp`, { recursive: true }); // Deletes the temporary OBJs folder
  let itemJsonFile = fs.readFileSync(
    `${resourcepackSettings.output}\\assets\\minecraft\\models\\item\\${resourcepackSettings.item_json}.json`,
    "utf8"
  );
  let parsedItemJson = autoParseJSON(itemJsonFile);

  if (parsedItemJson["overrides"] != undefined) {
    overrides.forEach((newOverride) => {
      parsedItemJson["overrides"].forEach((oldOverride) => {
        if (
          oldOverride.predicate.custom_model_data ==
          newOverride.predicate.custom_model_data
        ) {
          parsedItemJson["overrides"].remove(oldOverride);
        }
      });
    });
    parsedItemJson["overrides"] = parsedItemJson["overrides"].concat(overrides);
  } else {
    parsedItemJson["overrides"] = overrides;
  }

  parsedItemJson.overrides.sort(
    (a, b) =>
      a["predicate"]["custom_model_data"] - b["predicate"]["custom_model_data"]
  );

  itemJsonFile = compileJSON(parsedItemJson);
  fs.writeFileSync(
    `${resourcepackSettings.output}\\assets\\minecraft\\models\\item\\${resourcepackSettings.item_json}.json`,
    itemJsonFile,
    function (err, result) {
      if (err) console.log("", err);
    }
  );

  if (datapackSettings.create_datapack) {
    // Creates the Datapack
    function removeWhiteSpace(input) {
  // Removes spaces in string input, aside from spaces included in quotes or encased in apostrophese
  let returnString = "";
  let inQuotes = false;
  let inApostrophe = false;
  for (let i = 0; i < input.length; i++) {
    if (isValidNBTChar(input[i]) || inQuotes || inApostrophe) {
      returnString += input[i];
      if (inQuotes && input[i] == '"') {
        if (input[i - 1] != "\\") {
          inQuotes = false;
        }
      } else if (inApostrophe && input[i] == "'") {
        if (input[i - 1] != "\\") {
          inApostrophe = false;
        }
      }
    } else {
      switch (input[i]) {
        case " ": {
          break;
        }
        case '"': {
          inQuotes = true;
          returnString += '"';
          break;
        }
        case "'": {
          inApostrophe = true;
          returnString += "'";
          break;
        }
        default: {
          returnString += input[i];
          break;
        }
      }
    }
  }
  return returnString;
}

function isValidNBTChar(charIn) {
  const specialChars = [",", "[", "]", "{", "}", ":", '"', "'", " "];
  if (specialChars.indexOf(charIn) == -1) {
    return true;
  }
}

// Probably the longest NBT parser I've written but also the most legible one and most functional one
function parseNBT(input) {
  // Main function for NBT parsing
  const NBT = removeWhiteSpace(input);
  let reader = 0;

  function parseString() {
    // Parses String values in key-value pairs and key names
    let stringSet = false;
    let returnString = "";
    let inQuotes = false;
    let inApostrophe = false;
    while (!stringSet) {
      if (isValidNBTChar(NBT[reader]) || inQuotes || inApostrophe) {
        returnString += NBT[reader];
        if (inQuotes && NBT[reader] == '"') {
          if (NBT[reader - 1] != "\\") {
            inQuotes = false;
          }
        } else if (inApostrophe && NBT[reader] == "'") {
          if (NBT[reader - 1] != "\\") {
            inApostrophe = false;
          }
        }
      } else {
        switch (NBT[reader]) {
          case '"': {
            inQuotes = true;
            returnString += '"';
            break;
          }
          case "'": {
            inApostrophe = true;
            returnString += "'";
            break;
          }
          default: {
            stringSet = true;
            break;
          }
        }
      }
      if (!stringSet) reader += 1;
    }
    return returnString;
  }

  function parseArray() {
    // Parses Array values in Key-Value pairs
    let returnArray = [];
    reader += 1;
    while (NBT[reader] != "]") {
      let currentValue = parseValue();
      returnArray.push(currentValue);
      if (NBT[reader] == ",") reader++;
    }
    reader++;
    return returnArray;
  }

  function parseDict() {
    // Parses dictionary values in key-value pairs & first parser for the NBT input
    let returnDict = {};
    if (NBT[reader] == "{") {
      reader++;
      while (NBT[reader] != "}") {
        let currentKey = parseString(); // Gets the Current Key using the String Parser
        reader++;
        let currentValue = parseValue(); // Gets the currennt value using the value parse
        if (NBT[reader] == ",") reader++;
        returnDict[currentKey] = currentValue;
      }
    }
    reader++;
    return returnDict;
  }

  function parseValue() {
    // Parses all Values in key-value pairs
    let currentValue = undefined;
    while (currentValue == undefined) {
      switch (NBT[reader]) {
        case "{": {
          currentValue = parseDict();
          break;
        }
        case "[": {
          currentValue = parseArray();
          break;
        }
        default: {
          currentValue = parseString();
          break;
        }
      }
    }
    return currentValue;
  }

  return parseDict();
}

// Compiles a dictionary into a NBT String, I actually know how this one works
function compileNBT(input) {
  returnValue = compileJSON(input);
  returnValue = returnValue.replaceAll("\n", "");
  returnValue = returnValue.replaceAll("\t", "");
  returnValue = returnValue.replaceAll(
    '\\"',
    "つREALMANSSTRING,つNOTTHATSTUPIDJSONAUTOGENERATEDONEつ"
  ); // Praying nobody has this string in their nbt,
  returnValue = returnValue.replaceAll('"', ""); // threw in some つs to make sure
  returnValue = returnValue.replaceAll(
    "つREALMANSSTRING,つNOTTHATSTUPIDJSONAUTOGENERATEDONEつ",
    '"'
  );
  return returnValue;
}

function AcessObjectFromString(o, s, value) { // took this from https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
          o = o[k];
      } else {
          return;
      }
  }
  o = value;
}

// Creates Datapack directory
create_directory(datapackSettings.output, `data`);
create_directory(`${datapackSettings.output}`, `data/${datapackSettings.project_ID}/functions`);

// Sets variables for function Generation
// Project Namespace (IE: tcc, oa, pdd)
project_ID = datapackSettings.functions_path.substr(0, datapackSettings.functions_path.search("/"));

// Tags
let tags = [];
tags[0] = datapackSettings.primary_tag;
if (datapackSettings.use_smithed_tags) tags[1] = "smithed.entity";
tags.push("factory.entity");
if (summonAnimation != null) tags.push(`factory.${datapackSettings.primary_tag}.unprocessed`);
if (datapackSettings.tags != "") tags = tags.concat(datapackSettings.tags.replace(/ /gi, "").split(","));
let tagsArray = [];
if (tags != "") {
  tags.forEach((tag) => {
    tagsArray.push(`\"${tag}\"`);
  });
}

// Summon Command
displaySlot = datapackSettings.display_slot.split(".");
let summonNBT = parseNBT(datapackSettings.nbt);

const itemNbt = {
  id: `\"minecraft:${resourcepackSettings.item_json}\"`,
  Count: "1b",
  tag: {
    CustomModelData: `${resourcepackSettings.custom_model_data_start}`,
    display: {
      color: "0",
    },
  },
};

// Removed since the method doesn't support arrays, and would have to be completely rewritten since none the
// input nbt shouldn't be overwritten, since this can happen if it and the displaySlot path overlap
//summonNBT[displaySlot[0]] = createLibFromPath(displaySlot, itemNbt)[displaySlot[0]];
AcessObjectFromString(summonNBT, datapackSettings.display_slot, itemNbt)
console.log(summonNBT)

summonNBT["Tags"] = tagsArray;
summonNBT["CustomName"] = `\'{"translate":"${datapackSettings.name}","font":"${datapackSettings.name_font}","italic":false}\'`;

/// Creates Files if they do not already exist
// Load.json
if (!fs.existsSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`)) {
  create_directory(datapackSettings.output, `data/minecraft/tags/functions`);
  fs.writeFileSync(
    `${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`,
    `{\n` +
      `   "values": [\n` +
      `      ${datapackSettings.project_ID}:factory/load\n` +
      `   ]\n` +
      `}`,
    function (err, result) {
      if (err) console.log("", err);
    }
  );
} else {
  var file = autoParseJSON(fs.readFileSync(`${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`, "utf8"));
  if (!file.values.includes(`${datapackSettings.project_ID}:factory/load`)) {
    file.values.push(`${datapackSettings.project_ID}:factory/load`);
    fs.writeFileSync(
      `${datapackSettings.output}\\data\\minecraft\\tags\\functions\\load.json`,
      compileJSON(file)
    );
  }
}

// Tick.json
if (
  !fs.existsSync(
    `${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`
  )
) {
  create_directory(datapackSettings.output, `data/minecraft/tags/functions`);
  fs.writeFileSync(
    `${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`,
    `{\n` +
      `   "values": [\n` +
      `      ${datapackSettings.project_ID}:factory/tick\n` +
      `   ]\n` +
      `}`,
    function (err, result) {
      if (err) console.log("", err);
    }
  );
} else {
  var file = autoParseJSON(
    fs.readFileSync(
      `${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`,
      "utf8"
    )
  );
  if (!file.values.includes(`${datapackSettings.project_ID}:factory/tick`)) {
    file.values.push(`${datapackSettings.project_ID}:factory/tick`);
    fs.writeFileSync(
      `${datapackSettings.output}\\data\\minecraft\\tags\\functions\\tick.json`,
      compileJSON(file)
    );
  }
}

// Tick function
create_function(datapackSettings, `factory/tick`, [
  `execute as @e[tag=factory.entity] at @s run function ${datapackSettings.project_ID}:factory/tick_filter`,
]);

// Tick Filter Function
if (
  !fs.existsSync(
    `${datapackSettings.output}\\data\\${datapackSettings.project_ID}\\functions\\factory\\tick_filter.mcfunction`
  )
) {
  create_function(datapackSettings, `factory/tick_filter`, [
    `execute if entity @s[tag=${datapackSettings.primary_tag}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick`,
  ]);
} else {
  file = fs.readFileSync(
    `${datapackSettings.output}\\data\\${datapackSettings.project_ID}\\functions\\factory\\tick_filter.mcfunction`,
    "utf8"
  );
  if (
    !file.includes(
      `execute if entity @s[tag=${datapackSettings.primary_tag}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick`
    )
  ) {
    fs.writeFileSync(
      `${datapackSettings.output}\\data\\${datapackSettings.project_ID}\\functions\\factory\\tick_filter.mcfunction`,
      (file += `\nexecute if entity @s[tag=${datapackSettings.primary_tag}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick`)
    );
  }
}

/// Generates Functions
// Load function
create_function(datapackSettings, `factory/load`, [
  `scoreboard objectives add factory.frame dummy`,
  `scoreboard objectives add factory.animation dummy`,
  `scoreboard objectives add factory.dummy dummy`,
  `scoreboard objectives add factory.color dummy`,
  `scoreboard objectives add factory.hurt_timer dummy`,
  `scoreboard players set #factory.value.24000 factory.dummy 24000`,
  `scoreboard players set #factory.value.256 factory.dummy 256`,
]);

// Frame Set Function
create_function(datapackSettings, `factory/set_frame`, [
  `execute store result score #factory.color_offset factory.dummy run time query gametime`,
  `scoreboard players operation #factory.color_offset factory.dummy %= #factory.value.24000 factory.dummy`,
  `scoreboard players operation #factory.color_offset factory.dummy -= #factory.starting_frame factory.dummy`,
  `scoreboard players operation #factory.color_offset factory.dummy -= #factory.duration factory.dummy`,
  `scoreboard players operation @s factory.color = #factory.color_offset factory.dummy`,
  `scoreboard players set #factory.duration factory.dummy 0`,
  `scoreboard players set #factory.starting_frame factory.dummy 0`,
]);

if (resourcepackSettings.use_hurt_tint) {
  // Apply Hurt CMD Function
  create_function(
    datapackSettings,
    `${datapackSettings.functions_path}/apply_hurt`,
    [
      `execute store result entity @s ${datapackSettings.display_slot}.tag.CustomModelData int -1 run data get entity @s ${datapackSettings.display_slot}.tag.CustomModelData -1.0000000001`,
      `tag @s add factory.entity.hurt`,
      `scoreboard players set @s factory.hurt_timer 10`,
    ]
  );
}

// Un-Apply Hurt CMD Function
create_function(
  datapackSettings,
  `${datapackSettings.functions_path}/factory_tick/hurt`,
  [
    `scoreboard players remove @s factory.hurt_timer 1`,
    `execute if score @s factory.hurt_timer matches 0 run execute store result entity @s ${datapackSettings.display_slot}.tag.CustomModelData int 1 run data get entity @s ${datapackSettings.display_slot}.tag.CustomModelData 0.9999999999`,
    `execute if score @s factory.hurt_timer matches 0 run tag @s remove factory.entity.hurt`,
  ]
);

// Start Animation Functions
function generateStartAnimationFuncts(animation, index) {
  create_function(
    datapackSettings,
    `${datapackSettings.functions_path}/${animation.name}.start`,
    removeAnimationTags.concat([
      `data modify entity @s ${
        datapackSettings.display_slot
      }.tag.CustomModelData set value ${animDict[animation.name]["CMD"]}`,
      `execute if entity @s[tag=factory.entity.hurt] run data modify entity @s ${
        datapackSettings.display_slot
      }.tag.CustomModelData set value ${animDict[animation.name]["CMDhurt"]}`,
      `scoreboard players set #factory.starting_frame factory.dummy -3`, // Starting the animation at -3 frames behind makes it actually start on the first frame, don't know why
      `scoreboard players set #factory.duration factory.dummy ${
        parseInt(animation.length * 20)
      }`,
      `function ${datapackSettings.project_ID}:factory/set_frame`,
      `execute store result entity @s ${datapackSettings.display_slot}.tag.display.color int 1 run scoreboard players get #factory.color_offset factory.dummy`,
      `tag @s add ${datapackSettings.primary_tag}.animating.${animation.name}`,
      `tag @s remove factory.${datapackSettings.primary_tag}.unprocessed`,
      `scoreboard players set @s factory.frame 0`,
    ])
  );
}
Project.animations.forEach((animation, index) =>
  generateStartAnimationFuncts(animation, index)
);

// Animation Tick Functions Generator
toWrite_entity_tick = [
  `execute store result storage factory:storage temp.entity.frame int 1 run scoreboard players get @s factory.frame`,
];
if (Project.animations.length != 0) {
  let functions = {}
  Project.animations.forEach((element) => {
    element.select();
    toWrite_entity_animation_tick = [];
    toWrite_entity_tick.push(
      `execute if entity @s[tag=${datapackSettings.primary_tag}.animating.${element.name}] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick/${element.name} with storage factory:storage temp.entity`
    );
    let ticks = [];
    for (const bone in element.animators) {
      if (!(element.animators[bone]["factory.commands"] === undefined)) {
        element.animators[bone]["factory.commands"].forEach((keyframe) => {
          let bonePos = {'x': 0.0, 'y': 0.0, 'z': 0.0}
          let boneRot = {'x': 0.0, 'y': 0.0, 'z': 0.0}
          for (let i = 0; i < Project.groups.length; i++)
          {
            if (Project.groups[i].name == element.animators[bone]["name"]) {
                Timeline.setTime(keyframe['time'])
                Animator.preview() // Updates the animator view
                let temp = Project.groups[i].getMesh().getWorldPosition()
                bonePos['x'] = roundOutSN(-temp['x'] / 16)
                bonePos['y'] = roundOutSN(temp['y'] / 16)
                bonePos['z'] = roundOutSN(-temp['z'] / 16)
                temp = new THREE.Euler
                temp.setFromQuaternion(Project.groups[i].getMesh().getWorldQuaternion())
                boneRot['x'] = roundOutSN(temp['x'] * 57.2957795)
                boneRot['y'] = roundOutSN(temp['y'] * 57.2957795)
                boneRot['z'] = roundOutSN(temp['z'] * 57.2957795)
            }
          }
          //Project.groups[BONEINDEX].getMesh().getWorldPosition() // Gets GLOBAL position
          if (!(keyframe === undefined) && !(keyframe["time"] === undefined))
            if (keyframe["interpolation"] == "linear") {

            }

          // Animation Keyframe Functions
          if(functions[`${Math.floor(keyframe["time"] * 20)}`] == undefined){
            functions[`${Math.floor(keyframe["time"] * 20)}`] = {}
          }
          functions[`${Math.floor(keyframe["time"] * 20)}`][element.animators[bone]["name"].toLowerCase()] = {
            "commands": [keyframe["data_points"][0]["factory.commands"]],
            "pos": bonePos,
            "rot": boneRot
          }
          ticks.push(Math.floor(keyframe["time"] * 20));
        });
      }
    }
    let keyFrames = []
    for(tick in functions){
      keyFrames.push(tick)
    }
    keyFrames.sort()
    for(i = 0; i < keyFrames.length; i++){
      let frame = keyFrames[i]
      let toWrite = []
      for(bone in functions[`${frame}`]){
        create_function(datapackSettings, `${datapackSettings.functions_path}/factory_tick/${element.name}/${frame}/${bone}`, [functions[`${frame}`][bone]['commands']]);
        toWrite.push(`execute positioned ^${functions[`${frame}`][bone]['pos']['x']} ^${functions[`${frame}`][bone]['pos']['y']} ^${functions[`${frame}`][bone]['pos']['z']} run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick/${element.name}/${frame}/${bone}`)
      }
      create_function(datapackSettings, `${datapackSettings.functions_path}/factory_tick/${element.name}/${frame}`, toWrite);
    }


    ticks = ticks.sort(function (a, b) {
      return a - b;
    });
    if (ticks[ticks.length - 1] != Math.floor(element.length * 20)) {
      ticks.push(Math.floor(element.length * 20));

      // End Of Animation Function
      create_function(
        datapackSettings,
        `${datapackSettings.functions_path}/factory_tick/${
          element.name
        }/${Math.floor(element.length * 20)}`,
        [
          `scoreboard players set @s factory.frame 0`,
          `tag @s remove ${datapackSettings.primary_tag}.animating.${element.name}`,
        ]
      );
    }
    toWrite_entity_animation_tick.push(
      `$execute if score @s factory.frame matches ${ticks[0]}..${
        ticks[ticks.length - 1]
      } run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick/${element.name}/$(frame)`
    );

    // Animation Tick Function
    create_function(
      datapackSettings,
      `${datapackSettings.functions_path}/factory_tick/${element.name}`,
      toWrite_entity_animation_tick
    );
  });
  if (resourcepackSettings.use_hurt_tint) {
    toWrite_entity_tick.push(
      `execute if entity @s[tag=factory.entity.hurt] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/factory_tick/hurt`
    );
  }
  toWrite_entity_tick.push(
    `function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/tick`
  );
  toWrite_entity_tick.push(`scoreboard players add @s factory.frame 1`);
}

// Entity Tick Functions
create_function(
  datapackSettings,
  `${datapackSettings.functions_path}/factory_tick`,
  toWrite_entity_tick
);

// Entity Summon Function
if (summonAnimation != null) {
  create_function(
    datapackSettings,
    `${datapackSettings.functions_path}/summon`,
    [
      `summon ${datapackSettings.entity_type} ~ ~ ~ ${compileNBT(summonNBT)}`,
      `execute as @e[tag=factory.${datapackSettings.primary_tag}.unprocessed,limit=1,sort=nearest] run function ${datapackSettings.project_ID}:${datapackSettings.functions_path}/${summonAnimation}.start`,
    ]
  );
} else {
  create_function(
    datapackSettings,
    `${datapackSettings.functions_path}/summon`,
    [`summon ${datapackSettings.entity_type} ~ ~ ~ ${compileNBT(summonNBT)}`]
  );
}

  }
}


      // Commenting out the keyframes for adding functions
      /*
      BoneAnimator.addChannel("factory.commands", {
        condition: () => Format.id == "factory_project",
        name: "Functions",
        mutable: false,
        max_data_points: 1000
      });

      new Property(KeyframeDataPoint, "string", "factory.commands", {
        label: "Function name",
        condition: (point) => {
          return point.keyframe.channel === "factory.commands";
        },
        exposed: true,
        default: '',
        factoryCommand: true
      });

      
      new BarSelect('function_interpolation', {
        category: 'animation',
        condition: () => Animator.open && Timeline.selected.length && Timeline.selected[0]["channel"] == 'factory.commands',
        options: {
          step: true,
          span: true
        },
        onChange: function(sel, event) {
          Undo.initEdit({keyframes: Timeline.selected})
          Timeline.selected.forEach((kf) => {
            if (kf.transform) {
              kf.interpolation = sel.value;
            }
          })
          Undo.finishEdit('Change keyframes interpolation')
          updateKeyframeSelection();
        }
      })
      */

      actionExportFactoryProject = new Action("actionExportFactoryProject", {
        condition: () => Format.id == "factory_project",
        name: "Export",
        description: "Export Factory Project as a datapack and Resourcepack",
        icon: "fa-file-export",
        click: function actionExportFactoryProjectOnClick() {
          exportFactoryProject(
            factoryData[`${Project.uuid}`]["resourcepack"],
            factoryData[`${Project.uuid}`]["datapack"]
          );
        },
      });
    },

    onunload() {
      if (actionDatapackDialog != undefined) actionDatapackDialog.delete();
      if (actionResourcepackDialog != undefined)
        actionResourcepackDialog.delete();
      if (actionExportFactoryProject != undefined)
        actionExportFactoryProject.delete();
      if (factory_format != undefined) factory_format.delete();
      if (resourcepackDialog != undefined) resourcepackDialog.delete();
      if (datapackDialog != undefined) datapackDialog.delete();
    },
  });
}

defineFactoryPlugin();
