app.controller('mainController', function($scope, apiService, moment, messageService, $document, $timeout, $mdDialog, $mdSidenav){
	
	$scope.projects = undefined;
	$scope.selected_project = undefined;
	$scope.selected_subproject = undefined;
	$scope.checked_subproject = [];
//	$scope.selected_step = undefined;
	
	$scope.keep_sidenav_open = true;
	
	var project_template = {
			"id": "",
			"img" : "imgs/project.png",
			"title": "",
			"subtitle": "",
	        "description": "",
	        "creator": "",
	        "creation_date": "",
	        "projects": [
            ]
	    };
	
	var subproject_template = {
    	"steps": [],
    	"disabled": false,
    	"dataset": {
    		"id": "",
    		"cluster": "",
    		"genome": "",
            "basedir": "",
            "create_per_sample_directory": true,
            "pairedend": false,
            "sample_ids": "",
            "variables": [
	            {
	            	"key": "sample_variable",
	            	"key_disabled": true,
	            	"value": "SAMPLE",
	            	"description": "Variable to use across scripts to refer to a sample in this project"
	            },
	            {
	            	"key": "all_samples_variable",
	            	"key_disabled": true,
	            	"value": "ALL_SAMPLES",
	            	"description": "Variable to use across scripts to refer to ALL samples in this project"
	            },
	            {
	            	"key": "project_variable",
	            	"key_disabled": true,
	            	"value": "PROJECT",
	            	"description": "Variable to use across scripts to refer to this project ID"	            	
	            },
	            {
	            	"key": "project_index_variable",
	            	"key_disabled": true,
	            	"value": "PROJECT_INDEX",
	            	"description": "Variable to use across scripts to refer to the index of this project"
	            },
	            {
	            	"key": "cpu_variable",
	            	"key_disabled": true,
	            	"value": "CPU",
	            	"description": "Variable to use across scripts to refer to the number of CPU defined in a step"
	            },
	            {
	            	"key": "step_name_variable",
	            	"key_disabled": true,
	            	"value": "STEP_NAME",
	            	"description": "Variable to use across scripts to refer to the name of the step"
	            }
        	]
        }
	};
	
	var step_template = {
			"type": "",
			"title": "",
	        "description": "",
	        "description_short": "",
	        "commandline": "",
	        "hpc_directives_text": "",
	        "hpc_directives": {
	        	"job_name": "",
                "walltime": "",
                "account": "",
                "nodes": 1,
                "cpu": 1,
                "mpi_procs": 0,
                "memory": {
                    "quantity": 1,
                    "size": 'GB'
                },
                "error": "",
                "output": "",
                "dependencies": []
            },
	        "modules": [],
	        "skip": false,
	        "iterate": true,
	        "sequential": true,
	        "write_stdout_log": true,
	        "write_stderr_log": true,
	        "conditions": [],
	    };
	
	var condition_template = {
		"command": ""
	};
	
	var variable_template = {
    	"key": "variable_key",
    	"value": "value",
    	"description": "Variable to use across scripts to refer to XXXXX"	            	
    };
	
	$scope.genomes = [];
	
	$scope.load_genomes = function(clusterId){
		console.log("LOADING GENOMES", clusterId);
		
		return $timeout(function() {
			$scope.genomes = [];
			apiService.get_genomes(clusterId, function(result){
				console.log("GENOMES", result);
				$scope.genomes = result.data;
			});
		}, 1000);
	};
	
	$scope.cluster_changed = function(clusterId){
		console.log("CHANGED CLUSTER", clusterId, $scope);
		$scope.module_url = apiService.get_module_url(clusterId);
		console.log("MODULE URL", $scope.module_url);
	};
	
	$scope.clusters = [
		{
			"name": "Galileo",
			"id": "galileo",
			"info": "360 nodes (36 cores, 128GB) + 40 nodes (16 cores, 128GB)"
		},
		{
			"name": "Marconi",
			"id": "marconi",
			"info": "A1/BDW: 720 nodes (36 cores, 128GB) + A2/KNL: 3600 nodes (68 cores, 93GB)"
		},
		{
			"name": "Pico",
			"id": "pico",
			"info": "51 nodes (20 cores, 128GB) + 1 BigMem (32 cores, 520GB) + 2 BigMem (20 cores, 510GB)"
		}		
	];
	
//	var condition_template = {
//			"conditions": [],
//			"condition": {},
//			"op": ""
//	    };
//	
//	var ops = ["OR", "AND", "NOT"];
	
	$scope.sending = false;
	
	$scope.xls_loaded = function(data){
		console.log("MAIN CONTROLLER XLS", data, $scope);
		messageService.showMessage("Loaded " + data.length + " samples.", "success");
		$scope.selected_subproject.dataset.sample_ids = data.join("\n");
	};
	
	$scope.refresh = function(){
		apiService.get_projects(function(result){
			console.log("[REFRESH] AJAX RESULT", result);
			$scope.projects = result.data;
		});
	};
	
	$scope.toggle = function(){
		$mdSidenav('sidenav').toggle();
	};
	
// $scope.get_module_data = function(){
// return {
// "label": "Modules",
// "url": apiService.get_module_url()
// }
// };
	
	// $scope.module_url = apiService.get_module_url();
	
	$scope.select_project = function(item){
		console.log("SELECTING PROJECT", item, $scope);
		$scope.selected_project = item;
		$mdSidenav('sidenav').close();
	};
	
	$scope.select_subproject = function(item){
		var subproject = $scope.selected_project.projects[item];
		console.log("SELECTING SUBPROJECT", subproject,  $scope);
		$scope.selected_subproject = subproject;
		
		$scope.module_url = apiService.get_module_url($scope.selected_subproject.dataset.cluster);
		console.log("MODULE URL", $scope.module_url);
	};
	
	$scope.cloneSubproject = function(index, $event){
		$event.stopPropagation();
		console.log("[CLONE SUBPROJECT]", index, $scope.selected_project.projects[index]);
		
		copy = angular.copy($scope.selected_project.projects[index]);
		copy.dataset.id = "Copy of " + copy.dataset.id;
		
		$scope.selected_project.projects.push(copy);
	};
	
	$scope.cloneStep = function(step, $event){
		$event.stopPropagation();
		console.log("[CLONE STEP]", step);
		copy = angular.copy(step)
		copy.title = "Copy of " + copy.title;
		$scope.selected_subproject.steps.push(copy);
	};
	
	$scope.copy_steps = function(subproject){
		for(var i=0; i<$scope.selected_project.projects.length; i++){
			var subproj = $scope.selected_project.projects[i];
			if (subproj == subproject) continue;
			
			subproj.steps = angular.copy(subproject.steps);
		}
	};
	
	$scope.add_module = function(item, list){
		if(item != undefined){
			console.log("ADDED MODULE", item, list, $scope);
			list.push(item.label);
		}
	};
	
	$scope.remove_module = function(step, index){
		console.log("REMOVING MODULE", step, step.modules[index]);
		step.modules.splice(index, 1);
	};
	
	$scope.showAddProjectDialog = function(ev) {
	    var confirm = {
	    	controller: DialogController,
			templateUrl: 'templates/dialogs/add_project_dialog.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen,
			resolve: {
				item: function(){
					return angular.copy(project_template);
				}
			}
	    };

	    $mdDialog.show(confirm).then(function(project) {
	    	if (project != undefined){
	    		
	    		project.creation_date = moment();
	    		
		    	console.log("NEW PROJECT", project);
		    	$scope.projects.push(project);
		    	$scope.save(project);
		    	$scope.select_project(project);
	    	}
	    }, function() {
	    });
	};
	
	$scope.toggleStep = function(step, $event){
		step.skip = !step.skip;
		$event.stopPropagation();
	};
	
	$scope.get_total_samples = function(selected_project){
		var total = 0;
		
		for(var k=0; k<selected_project.projects.length; k++)
			total += selected_project.projects[k].dataset.sample_ids.split('\n').length;
		
		return total;
	};
	
	$scope.get_total_samples_pe = function(selected_project){
		var total = 0;
		
		for(var k=0; k<selected_project.projects.length; k++)
			if(selected_project.projects[k].dataset.pairedend)
				total += selected_project.projects[k].dataset.sample_ids.split('\n').length;
		
		return total;
	};
	
	$scope.get_total_samples_se = function(selected_project){
		var total = 0;
		
		for(var k=0; k<selected_project.projects.length; k++)
			if(!selected_project.projects[k].dataset.pairedend)
				total += selected_project.projects[k].dataset.sample_ids.split('\n').length;
		
		return total;
	};
	
	$scope.get_total_bioprojects = function(selected_project){
		var bioproject_ids = {};
		
		for(var k=0; k<selected_project.projects.length; k++)
		{
			var bioproject_id = selected_project.projects[k].dataset.bioproject_id;
			bioproject_ids[bioproject_id] = 1;
		}
		
		return Object.keys(bioproject_ids).length;
	};
	
	$scope.get_total_genomes = function(selected_project){
		var genomes = {};
		
		for(var k=0; k<selected_project.projects.length; k++)
		{
			var genome = selected_project.projects[k].dataset.genome;
			genomes[genome] = 1;
		}
		
		return Object.keys(genomes).length;
	};
	
	$scope.get_genomes = function(selected_project){
		var genomes = {};
		
		for(var k=0; k<selected_project.projects.length; k++)
		{
			var genome = selected_project.projects[k].dataset.genome;
			genomes[genome] = 1;
		}
		
		return Object.keys(genomes);
	};
	
	$scope.toggle = function (item, list, $event) {
	    var idx = list.indexOf(item);
	    if (idx > -1) {
	      list.splice(idx, 1);
	    }
	    else {
	      list.push(item);
	    }
	    
	    $event.stopPropagation();
	};

	$scope.exists = function (item, list) {
		return list.indexOf(item) > -1;
	};
	
	$scope.isIndeterminate = function() {
		return ($scope.checked_subproject.length !== 0 &&
				$scope.checked_subproject.length !== $scope.selected_project.projects.length);
	};

	$scope.isChecked = function() {
		return $scope.checked_subproject.length === $scope.selected_project.projects.length;
	};
	
	$scope.isSEChecked = false;
	$scope.isPEChecked = false;

	$scope.toggleAll = function() {
		if ($scope.checked_subproject.length === $scope.selected_project.projects.length) {
	      $scope.checked_subproject = [];
	    } else if ($scope.checked_subproject.length === 0 || $scope.checked_subproject.length > 0) {
	      $scope.checked_subproject = $scope.checked_subproject.concat($scope.selected_project.projects.slice(0));
	    }
		
		$scope.isSEChecked = $scope.isPEChecked = $scope.isChecked();
	};
	
	$scope.toggleAllSE = function() {
		if ($scope.isSEChecked) {
			$scope.checked_subproject = $scope.checked_subproject.slice(0).filter(function(p){return p.dataset.pairedend == true;});
	    } else {
	    	$scope.checked_subproject = $scope.checked_subproject.concat($scope.selected_project.projects.slice(0).filter(function(p){return p.dataset.pairedend == false;}));
	    }
		
		$scope.isSEChecked = !$scope.isSEChecked;
//		if($scope.isSEChecked) $scope.isPEChecked = false;
	};
	
	$scope.toggleAllPE = function() {
		if ($scope.isPEChecked) {
			$scope.checked_subproject = $scope.checked_subproject.slice(0).filter(function(p){return p.dataset.pairedend == false;});
	    } else {
	    	$scope.checked_subproject = $scope.selected_project.projects.slice(0).filter(function(p){return p.dataset.pairedend == true});
	    }
		
		$scope.isPEChecked = !$scope.isPEChecked;
//		if($scope.isPEChecked) $scope.isSEChecked = false;
	};
	  
	$scope.showDeleteProjectDialog = function(i, $event) {
	    var confirm = {
	    	controller: DialogController,
			templateUrl: 'templates/dialogs/delete_project_dialog.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen,
			resolve: {
		      item: function () {
		        return $scope.projects[i];
		      }
		    }
	    };

	    $mdDialog.show(confirm).then(function(answer) {
	    	console.log("DIALOG ANSWER", answer);
	    	
	    	if (answer == "OK") {
	    		var project = $scope.projects[i];
	    		
	    		apiService.delete_project(project, function(result){
	    			console.log("[DELETE PROJECT] AJAX RESULT", result);
	    			messageService.showMessage(result.data, "success");
	    			
	    			$scope.projects.splice(i, 1);
		    		if($scope.selected_project == project)
		    			$scope.selected_project = undefined;
		    		
	    		}, function(result){
	    			console.log("[DELETE PROJECT] AJAX RESULT ERROR", result);
	    			messageService.showMessage("Server error: " + result.status, "error");
	    		});
	    	}
	    }, function() {
	    });
	    
	    $event.stopPropagation();
	};
	
	$scope.showDeleteSubprojectDialog = function(i, $event) {
		$scope.select_subproject(i);
		
	    var confirm = {
	    	controller: DialogController,
			templateUrl: 'templates/dialogs/delete_subproject_dialog.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen,
			resolve: {
		      item: function () {
		    	  console.log("[DIALOG DELETE SUBPROJECT]", $scope.selected_subproject);
		        return $scope.selected_subproject;
		      }
		    }
	    };

	    $mdDialog.show(confirm).then(function(answer) {
	    	console.log("DIALOG ANSWER", answer);
	    	
	    	if (answer == "OK") $scope.remove_subproject($scope.selected_project, i);
	    }, function() {
	    });
	    
	    $event.stopPropagation();
	};
	
	$scope.uploadFiles = function(files){
		if (files && files.length) {
			$scope.file_sending = true;
			apiService.upload_samples(files, function(resp){
				console.log('Success', resp);
				for(var i in resp.data)
				{
					var subproject_data = resp.data[i];
					$scope.add_subproject($scope.selected_project);
					var subproject = $scope.selected_project.projects[$scope.selected_project.projects.length -1]
					for(var key in subproject_data.dataset)
						subproject.dataset[key] = subproject_data.dataset[key];
					
					$scope.file_sending = false;
				}
			}, function(resp){
				console.log('Error status: ' + resp);
				
				$scope.file_sending = false;
			});
		}
	};
	
	$scope.remove_subproject = function(project, index){
		project.projects.splice(index, 1);
	};
	
	$scope.showDeleteStepDialog = function(step, $event) {
		
	    var confirm = {
	    	controller: DialogController,
			templateUrl: 'templates/dialogs/delete_step_dialog.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen,
			resolve: {
		      item: function () {
		        // return $scope.selected_subproject.steps[i];
		    	  return step;
		      }
		    }
	    };

	    $mdDialog.show(confirm).then(function(answer) {
	    	console.log("DIALOG ANSWER", answer);
	    	// if (answer == "OK") $scope.remove_step($scope.selected_subproject, i);
	    	if (answer == "OK") $scope.remove_step($scope.selected_subproject, $scope.selected_subproject.steps.indexOf(step));
	    }, function() {
	    });
	    
	    $event.stopPropagation();
	};
	
	$scope.add_subproject = function(project){
		console.log("[ADD SUBPROJECT]", project, subproject_template);
		project.projects.push(angular.copy(subproject_template));
	};
	
	$scope.delete_subprojects = function(project){
		console.log("[DELETE SUBPROJECTs]", project);
		for(var i in $scope.checked_subproject)
		{
			var subproject = $scope.checked_subproject[i];
			var index = project.projects.indexOf(subproject);
			project.projects.splice(index, 1);
		}
		
		$scope.checked_subproject = [];
	};
	
	$scope.add_step = function(project){
		project.steps.push(angular.copy(step_template));
	};
	
	$scope.add_variable = function(project){
		project.dataset.variables.push(angular.copy(variable_template));
	};
	
	$scope.delete_variable = function(project, index){
		project.dataset.variables.splice(index, 1);
	};
	
	
	$scope.remove_step = function(project, index){
		project.steps.splice(index, 1);
	};
	
	$scope.create_condition = function(list){
		list.push(angular.copy(condition_template));
	};
	
	$scope.delete_condition = function(list, $index){
		list.splice($index, 1);
	};
	
	$scope.move_item = function(list, index, offset, $event){
		var element = list.splice(index, 1)[0];
		
		var finalIndex = undefined;
		if (offset < 0) finalIndex = Math.max(0, index + offset);
		else finalIndex = Math.min(list.length, index + offset);

		list.splice(finalIndex, 0, element);
		$event.stopPropagation();
	};
	
	$scope.save = function(project){
		apiService.save_project(project, function(result){
			console.log("[SAVE PROJECT] AJAX RESULT", result);
			messageService.showMessage(result.data, "success");
		}, function(result){
			console.log("[SAVE PROJECT] AJAX RESULT ERROR", result);
			messageService.showMessage("Server error: " + result.status, "error");
		});
	};
	
	$scope.copy_hpc_directives = function(step){
		var copyFrom = undefined;
		for(var index in $scope.selected_subproject.steps)
		{
			var s = $scope.selected_subproject.steps[index];
			if (s.hpc_directives.account != "") {copyFrom = s; break;}
		}
		
		if(copyFrom != undefined)
			step.hpc_directives = angular.copy(copyFrom.hpc_directives);
	};
	
//	$scope.select_step = function(index){
//		console.log("STEP SELECTED", index, $scope);
//		$scope.selected_step = $scope.selected_subproject.steps[index];
//	};
	
	$scope.produce_scripts = function(project){
		apiService.produce_scripts(project, function(result){
			console.log("[PRODUCE SCRIPTS] AJAX RESULT", result);
			messageService.showMessage(result.data, "success");
		}, function(result){
			console.log("[PRODUCE SCRIPTS] AJAX RESULT ERROR", result);
			messageService.showMessage("Server error: " + result.status, "error");
		});
	};
	
	$scope.download_scripts = function(project){
		apiService.download_scripts(project, function(result){
			console.log("[DOWNLOAD SCRIPTS] AJAX RESULT", result);
			
			var url = result.data.url;
			var filename = result.data.filename;
			
			var downloadLink = angular.element('<a target="_self"></a>');
            downloadLink.attr('href', url);
            downloadLink.attr('download', filename);
            
            console.log(downloadLink, url, filename);
            
            var body = $document.find('body').eq(0);
            body.append(downloadLink)
            
			downloadLink[0].click();
		}, function(result){
			console.log("[DOWNLOAD SCRIPTS] AJAX RESULT ERROR", result);
			messageService.showMessage("Server error: " + result.status, "error");
		});
	};
	
	$scope.refresh();
});