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
    //%create_datapack
  }
}
