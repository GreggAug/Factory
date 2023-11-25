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
