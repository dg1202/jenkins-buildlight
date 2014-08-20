var express = require('express');
var gpio = require('pi-gpio');
var colors = require('./node_modules/colors');
var app = express();

app.use(express.bodyParser());

var jobs = [];

var currentJobs = {};
function setJobLog(jobList){
	console.log('setting joblist');
	console.log(jobList);
	currentJobs = jobList;
}

function getJobLog(){
	console.log(currentJobs);
	return currentJobs;
}


function trackAllJobs(buildStatus){
 console.log('job finished building ..logging now');	
 jobs[buildStatus.name] = buildStatus;

 setJobLog(jobs);

 //console.log(jobs[buildStatus.name]);

 //checks if current build passed
 if(jobs[buildStatus.name].build.status != 'SUCCESS'){
   console.log(buildStatus.name+ ' failed'.red);
 }else{
    console.log(String(buildStatus.name) +' built Successfully'.green);
 	var allBuildsStable = true;

 	//checks if there is still a job that has failed
 	for(n in jobs){
 		if(jobs[n].build.status != 'SUCCESS'){
 			allBuildsStable = false;
 			console.log(String(jobs[n].name) + ' is still broken'.red);
 		}
 	}

 	//all builds in array are 
 	if(allBuildsStable){
 		console.log('All Builds Stable'.green);
 	}
 }
}

app.post('/buildstatus', function(req, res){
 console.log('Received Jenkins build notification');

  var job = req.body;
  if(job.build.phase == 'STARTED'){
	  console.log('STARTING JOB '.yellow + job.name);

		gpio.open(7, "output", function(err){
			  	gpio.write(7,1) //set pin 7 to high
		});
	

	 

  }else if(job.build.phase == 'COMPLETED'){
  	console.log('JOB COMPLETE '.cyan + job.name);
  }else if(job.build.phase == 'FINISHED'){
  	 trackAllJobs(job);
  	 gpio.close(7);
  }
   

  res.send('Build notification processed.');
});

var server = app.listen(3000, function(){
	console.log('listening on port %d', server.address().port);
});


app.get('/jobStatus', function(req, res){
	var jbs = getJobLog();
	console.log('jobStatus was called');
	console.log(jbs);
	res.json(jbs);
});
