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
