    //%create_dir
    function defineFactoryPlugin() {
        var factoryData = {}
        let datapackDialog;
        let resourcepackDialog;
        let actionResourcepackDialog;
        let actionDatapackDialog;
        let actionExportFactoryProject;
        const exec = require('child_process');
        const barMenu = new BarMenu('exportFactoryProject', ['actionResourcepackDialog', 'actionDatapackDialog', 'actionExportFactoryProject'], { condition: () => Format.id == 'factory_project' })
        Plugin.register('factory', {
            name: 'factory',
            title: 'Factory',
            author: 'Gregg.',
            icon: 'icon-player',
            version: '1.0.0-alpha.1',
            tags: ['Minecraft: Java Edition', "Animation", "Shader"],
            variant: 'desktop',

            oninstall() {

            },
            onload() {
                function import_objmc_location() {
                    {
                        Blockbench.import({
                            resource_id: 'objmc_location',
                            extensions: ['py'],
                            type: 'OBJMC Location'
                        }, function (files) {
                            resourcepackDialog.onConfirm();
                            if (factoryData[`${Project.uuid}`] != undefined) if(factoryData[`${Project.uuid}`]["resourcepack"] != undefined){
                                factoryData[`${Project.uuid}`]["resourcepack"]["current_objmc_path"] = files[0].path
                                resourcepackDialog.setFormValues(factoryData[`${Project.uuid}`]["resourcepack"])
                            }
                            resourcepackDialog.show()
                        })
                    }
                }

                //%resourcepackDialog
                //%datapackDialog
                //%debug

                // Saves Entity Settings and Project Settings
                Codecs.project.on('compile', (context) => {
                    if (Project != 0 && Format.id == 'factory_project') {
                        if (factoryData[`${Project.uuid}`] != undefined) {
                            context.model.factorydata = factoryData[`${Project.uuid}`]
                        }
                        else{
                            context.model.factorydata = {}
                        }
                    }
                });

                // Saves Entity Settings and Project Settings
                Codecs.project.on('parse', (context) => {
                    if (Project != 0 && Format.id == 'factory_project') {
                        if (context.model.factorydata != undefined) {
                            factoryData[`${Project.uuid}`] = context.model.factorydata
                        }
                    }
                });

                // Model Format
                factory_format = new ModelFormat({
                    id: 'factory_project',
                    name: 'Factory Project',
                    category: 'minecraft',
                    description: 'Output to Minecraft: Java Edition as a fully fledged custom mob with a Datapack and Resourcepack',
                    target: ['Minecraft: Java Edition'],
                    format_page: {
                        content: [
                            { type: 'h3', text: tl('mode.start.format.informations') },
                            { text: `* ${tl('Factory Outputs directly to a pre-existing resourcepack and pre-existing datapack.')}` },
                            { text: `* ${tl('In order for Factory models to render correctly on a client with Optifine, a seperate resourcepack/shader must be used')}` }
                        ]
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
                    icon: 'icon-player'
                }),
                    actionResourcepackDialog = new Action('actionResourcepackDialog', {
                        condition: () => Format.id == 'factory_project',
                        name: 'Resource Pack Settings',
                        description: 'Set settings for the exported Resource Pack',
                        icon: 'settings',
                        click: function () {
                            if (factoryData[`${Project.uuid}`] != undefined) if(factoryData[`${Project.uuid}`]["resourcepack"] != undefined){
                                resourcepackDialog.setFormValues(factoryData[`${Project.uuid}`]["resourcepack"])
                            }
                            resourcepackDialog.show()
                        }
                    }),
                    actionDatapackDialog = new Action('actionDatapackDialog', {
                        condition: () => Format.id == 'factory_project',
                        name: 'Data Pack Settings',
                        description: 'Set properties for the exported Data Pack',
                        icon: 'settings',
                        click: function () {
                            if (factoryData[`${Project.uuid}`] != undefined) if(factoryData[`${Project.uuid}`]["datapack"] != undefined){
                                datapackDialog.setFormValues(factoryData[`${Project.uuid}`]["datapack"])
                            }
                            datapackDialog.show()
                        }
                    })
                    
                //%export

                BoneAnimator.addChannel('factory.commands', {
                    condition: () => Format.id == 'factory_project',
                    name: 'Functions',
                    mutable: false,
                    max_data_points: 1000
                })

                new Property(KeyframeDataPoint, 'string', 'factory.commands', {
                    label: 'Function name',
                    condition: point => {
                        return point.keyframe.channel === 'factory.commands'
                    },
                    exposed: true,
                })

                actionExportFactoryProject = new Action('actionExportFactoryProject', {
                    condition: () => Format.id == 'factory_project',
                    name: 'Export',
                    description: 'Export Factory Project as a datapack and Resourcepack',
                    icon: 'fa-file-export',
                    click: function () {
                        exportFactoryProject(factoryData[`${Project.uuid}`]["resourcepack"], factoryData[`${Project.uuid}`]["datapack"])
                    }
                })

            },

            onunload() {

                if (actionDatapackDialog != undefined) actionDatapackDialog.delete();
                if (actionResourcepackDialog != undefined) actionResourcepackDialog.delete();
                if (actionExportFactoryProject != undefined) actionExportFactoryProject.delete();
                if (factory_format != undefined) factory_format.delete();
                if (resourcepackDialog != undefined) resourcepackDialog.delete();
                if (datapackDialog != undefined) datapackDialog.delete();
            }
        }
        )
    };

    defineFactoryPlugin()