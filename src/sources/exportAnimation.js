
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
        `${parseInt(animation.length * 20)}`,
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
          `${parseInt(animation.length * 20)}`,
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