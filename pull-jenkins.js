/**
 * Created by dgavigan on 8/28/2014.
 */
var gpio = require('pi-gpio');
var jenkinsapi = require('jenkins-api');
var colors = require('./node_modules/colors');

var jenkins = jenkinsapi.init("http://54.245.226.108:8080//");

function readPin(pinNum){
    try{
        gpio.read(pinNum, function(err, value){
            console.log('READIN PIN '+ pinNum);
            console.log(value);
            if(value == 0){ //if the pin is on
                return 'ON';
            }else{
                return 'OFF';
            }
        })        
    }catch(err){
        console.log(err);
    }
}

function yellowON(){
    var status = '';
    
    if(status != 'ON'){
        gpio.open(7, "output", function(err){
            console.log(err);
            gpio.write(7,0, function(){ //set pin to low
                gpio.close(7);
    
            });
        });        
    }else{
        console.log('yellow light already on');
    }
}

function yellowOFF(){
    gpio.open(7, "output", function(err){
        console.log(err);
        gpio.write(7,1, function(){ //set pin to high
            gpio.close(7);

        });

    });
}

function greenON(){
    gpio.open(11, "output", function(err){
        console.log(err);
        gpio.write(11,0, function(){
            gpio.close(11);

        });
    });
}


function greenOFF(){
    gpio.open(11, "output", function(err){
        console.log(err);
        gpio.write(11,1, function(){
            gpio.close(11);

        });
    });
}


function redON(){
    gpio.open(12, "output", function(err){
        console.log(err);
        gpio.write(12,0, function(){
            gpio.close(12);

        });
    });
}

function redOFF(){
    gpio.open(12, "output", function(err){
        console.log(err);
        gpio.write(12,1, function(){
            gpio.close(12);

        });
    });
}


function fetchBuilds(){
    jenkins.all_jobs(function(err, data) {
        if (err){ return console.log(err); }
        console.log(data)

        var failedBuilds = [], unstableBuilds = [], passedBuilds = [];

        data.map(function(build){

           if(build.color == 'blue'){
               console.log(build.name + ' is Good'.green);
               passedBuilds.push(build);

           }else if(build.color == 'yellow'){
               console.log(build.name+' is Unstable'.yellow);
               unstableBuilds.push(build);

           }else if(build.color == 'red'){
               console.log('FAILED BUILD!');
               console.log(build.name+' is broken'.red);
               failedBuilds.push(build);
           }
        });

        if(failedBuilds.length == 0){ //no build has failed
            if(unstableBuilds.length == 0){ //no unstable builds, all builds are good
                console.log('ALL BUILDS GOOD!'.green);
                redOFF();
                yellowOFF();
                greenON();
            }else{ //there is an unstable build in the chain
                console.log('Unstable builds'.yellow);
                redOFF();
                greenOFF();
                yellowON();
            }
        }else{//a build has failed
            console.log('BUILD HAS FAILED!'.red);
            greenOFF();
            yellowOFF();
            redON();
        }

        failedBuilds = [];
        unstableBuilds = [];
        passedBuilds = [];

        console.log('Cleared arrays');
        console.log(failedBuilds, unstableBuilds, passedBuilds);

    });
}


setInterval(fetchBuilds,300000); //fetches build info every 5 minutes
