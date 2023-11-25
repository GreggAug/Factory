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
  function ExportAnimation(animation, index) {
    if (datapackSettings.summon_animation == animation.name)
      summonAnimation = animation.name;
    removeAnimationTags.push(
      `tag @s remove ${datapackSettings.primary_tag}.animating.${animation.name}`
    );
    let OBJdirs = [];
    animation.select();
    for (let x = 0.0; x <= animation.length; x += 0.1) {
      Timeline.time = x;
      let tempOBJDirectory = `${
        resourcepackSettings.output
      }\\objstemp\\${y.toString(36)}`; // Exports frames as individual OBJ files, naming scheme is in base-36
      Animator.preview();
      OBJdirs.push(tempOBJDirectory);
      fs.writeFileSync(
        tempOBJDirectory,
        Codecs.obj.compile(),
        function (err, result) {
          if (err) console.log("", err);
        }
      );
      y += 1;
    }
    let args = [`${resourcepackSettings.current_objmc_path}`, `--objs`].concat(
      OBJdirs.concat([
        `--texs`,
        `${Project.textures[0].path}`,
        `--autoplay`,
        `--duration`,
        `${parseInt(animation.length * 20) + 2}`,
        `--colorbehavior`,
        `yaw`,
        `time`,
        `time`,
        `--out`,
        `${resourcepackSettings.output}\\assets\\${resourcepackSettings.project_ID}\\models\\entity\\${entityName}\\${animation.name}.json`,
        `${resourcepackSettings.output}\\assets\\${resourcepackSettings.project_ID}\\textures\\entity\\${entityName}\\${animation.name}.png`,
      ])
    );
    exec.execFileSync(`py`, args, { maxBuffer: Infinity });
    if (resourcepackSettings.use_hurt_tint) {
      args = [`${resourcepackSettings.current_objmc_path}`, `--objs`].concat(
        OBJdirs.concat([
          `--texs`,
          `${Project.textures[1].path}`,
          `--autoplay`,
          `--duration`,
          `${parseInt(animation.length * 20) + 2}`,
          `--colorbehavior`,
          `yaw`,
          `time`,
          `time`,
          `--out`,
          `${resourcepackSettings.output}\\deleteme.factory_asset`,
          `${resourcepackSettings.output}\\assets\\${resourcepackSettings.project_ID}\\textures\\entity\\${entityName}\\${animation.name}.hurt.png`,
        ])
      );
      exec.execFileSync(`py`, args, { maxBuffer: Infinity });
      let hurtModelJson = {
        parent: `${resourcepackSettings.project_ID}:entity/${entityName}/${animation.name}`,
        textures: {
          0: `${resourcepackSettings.project_ID}:entity/${entityName}/${animation.name}.hurt`,
        },
      };
      fs.writeFileSync(
        `${resourcepackSettings.output}\\assets\\${resourcepackSettings.project_ID}\\models\\entity\\${entityName}\\${animation.name}.hurt.json`,
        compileJSON(hurtModelJson),
        function (err, result) {
          if (err) console.log("", err);
        }
      );
    }

    let modelJson = fs.readFileSync(
      `${resourcepackSettings.output}\\assets\\${resourcepackSettings.project_ID}\\models\\entity\\${entityName}\\${animation.name}.json`,
      "utf8"
    );
    let parsedModelJson = autoParseJSON(modelJson);
    parsedModelJson.textures = {
      0: `${resourcepackSettings.project_ID}:entity/${entityName}/${animation.name}`,
    };
    parsedModelJson.display.ground = {
      rotation: [85, 0, 0],
      translation: [0, -16.91, -1],
      scale: [1, 1, 1],
    };
    parsedModelJson.display.head = {
      rotation: [85, 0, 0],
      translation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    modelJson = compileJSON(parsedModelJson);
    fs.writeFileSync(
      `${resourcepackSettings.output}\\assets\\${resourcepackSettings.project_ID}\\models\\entity\\${entityName}\\${animation.name}.json`,
      modelJson,
      function (err, result) {
        if (err) console.log("", err);
      }
    );
    let override = {
      model: `${resourcepackSettings.project_ID}:entity/${entityName}/${animation.name}`,
      predicate: {
        custom_model_data:
          resourcepackSettings.custom_model_data_start + animCount,
      },
    };
    overrides.push(override);
    animDict[animation.name] = {
      CMD: resourcepackSettings.custom_model_data_start + animCount,
    };
    animCount += 1;
    if (resourcepackSettings.use_hurt_tint) {
      let override = {
        model: `${resourcepackSettings.project_ID}:entity/${entityName}/${animation.name}.hurt`,
        predicate: {
          custom_model_data:
            resourcepackSettings.custom_model_data_start + animCount,
        },
      };
      overrides.push(override);
      animDict[animation.name]["CMDhurt"] =
        resourcepackSettings.custom_model_data_start + animCount; // Will probably be an unused value but eh
      animCount += 1;
    }
  }
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
