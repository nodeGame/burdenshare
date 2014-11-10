
// Included Questionnaire from the old version !!!
// Not working any more! Was replaced by qualtrix survey in an iframe.


    // // Questionaire Page 2 - Data Processing
    // function questionnaire2(timeout){
	// var url = '/burdenRAHR/html/questionnaire2.html';
	// W.loadFrame(url, function(){
	    // node.game.timeQuest1 = Date.now();
	    // var options = {
		// milliseconds: 30000, // 30000 ms is equivalent to 30 seconds
		// timeup: function() {
		    // if(W.getElementById("q21").checked ){
			// node.game.VALUE = W.getElementById("q21").value;
		    // }
		    // else {
			// node.game.VALUE = 'Time out - No answer';
		    // }
		    // node.game.timeQuest1 = Math.round(Math.abs(node.game.timeQuest1 - Date.now())/1000);
		    // var timeResultProp = {
			// playerID : {Player_ID: node.game.ownID,},
			// add: {timeQuest1: node.game.timeQuest1, Question1: node.game.VALUE,}
		    // };
		    // node.set('bsc_questTime',timeResultProp);
		    // questionnaire3(1);
		// }
	    // };
	    // node.game.timer.init(options);
	    // node.game.timer.updateDisplay();
	    // node.game.timer.start(options);
//
	    // var quest3 = W.getElementById('continue');
	    // quest3.onclick = function() {
			// node.game.timeQuest1 = Math.round(Math.abs(node.game.timeQuest1 - Date.now())/1000);
			// var doneOtherExp = -1;
			// if(W.getElementById("q21").checked ){
			    // doneOtherExp = 1;
			    // node.game.VALUE = W.getElementById("q21").value;
			// }
			// else if(W.getElementById("q22").checked ){
			    // doneOtherExp = 0;
			    // node.game.VALUE = W.getElementById("q22").value;
			// }
			// else{
				// var msg = 'You have not yet answered the question. Please take a decision and continue.';
				// checkID(msg)
			// }
			// if(doneOtherExp >= 0){
			    // node.game.timer.stop();
			    // var timeResultProp = {
				// playerID : {Player_ID: node.game.ownID},
				// add: {timeQuest1: node.game.timeQuest1, Question1: node.game.VALUE},
			    // };
			    // node.set('bsc_questTime',timeResultProp);
			    // questionnaire3(0);
			// }
	    // };
	// });
	// return;
    // };
//
    // // Questionaire Page 3 - Data Processing
    // function questionnaire3(timeout){
	// var url = '/burdenRAHR/html/questionnaire3.html';
	// W.loadFrame(url, function(){
	    // W.getElementById("offer").selectedIndex = -1;
	    // node.game.timeQuest2 = Date.now();
	    // var options = {
		// milliseconds: 360000, // 1200000 ms is equivalent to 20 minutes
		// timeup: function() {
		    // node.game.node.game.timeQuest2 = Math.round(Math.abs(node.game.timeQuest2 - Date.now())/1000);
		    // var fairestOffer1 = W.getElementById('offer').value;
		    // var fairestOffer = parseInt(fairestOffer1);
		    // node.game.question21 = W.getElementById('q31').value;
		    // node.game.question22 = W.getElementById('q32').value;
		    // node.game.question23 = W.getElementById('q33').value;
		    // if(!isNaN(fairestOffer) && isFinite(fairestOffer) && fairestOffer >= 0 && fairestOffer <= 10 && fairestOffer1 % 1 == 0){
			// node.game.fairestOfferGood = fairestOffer1;
		    // }
		    // else {
			// fairestOfferGood = 'Time out - No answer';
		    // }
		    // var timeResultProp = {
			// playerID : {Player_ID: node.game.ownID},
			// add: {timeQuest2: node.game.timeQuest2,Question2: node.game.fairestOfferGood,
				  // Question21: node.game.question21, Question22: node.game.question22, Question23: node.game.question23},
		    // };
		    // node.set('bsc_questTime',timeResultProp);
		    // questionnaire4(1);
		// },
	    // };
	    // node.game.timer.init(options);
	    // node.game.timer.updateDisplay();
	    // node.game.timer.start(options);
//
	    // var quest4 = W.getElementById('continue');
	    // quest4.onclick = function() {
			// node.game.timeQuest2 = Math.round(Math.abs(node.game.timeQuest2 - Date.now())/1000);
//
			// var fairestOffer1 = W.getElementById('offer').value;
			// var fairestOffer = parseInt(fairestOffer1);
			// node.game.question21 = W.getElementById('q31').value;
			// node.game.question22 = W.getElementById('q32').value;
			// node.game.question23 = W.getElementById('q33').value;
			// if(!isNaN(fairestOffer) && isFinite(fairestOffer) && fairestOffer >= 0 && fairestOffer <= 10 && fairestOffer1 % 1 == 0){
			    // node.game.fairestOfferGood = fairestOffer1;
			    // node.game.timer.stop();
			    // var timeResultProp = {
				// playerID : {Player_ID: node.game.ownID},
				// add: {timeQuest2: node.game.timeQuest2,Question2: node.game.fairestOfferGood,
					  // Question21: node.game.question21,
					  // Question22: node.game.question22,
					  // Question23: node.game.question23}
			    // };
			    // node.set('bsc_questTime',timeResultProp);
			    // questionnaire4(0);
			// }
			// else{
				// var msg = 'Please enter a non-fractional number between 0 and 10 in the field: "What would be, in your view, the fairest offer a proposer can make in this experiment?" ';
				// checkID(msg);
			// }
	    // };
	// });
	// return;
    // };
//
    // // Questionaire Page 4 - Data Processing
    // function questionnaire4(timeout){
	// var url = '/burdenRAHR/html/questionnaire4.html';
	// W.loadFrame(url, function(){
	    // node.game.timeQuest3 = Date.now();
	    // var options = {
		// milliseconds: 240000, // 1200000 ms is equivalent to 20 minutes
		// timeup: function() {
		    // node.game.timeQuest3 = Math.round(Math.abs(node.game.timeQuest3 - Date.now())/1000);
		    // for(var j = 1; j <= 2; j++){
				// if(W.getElementById("q41" + j).checked ){
				    // node.game.question31 = W.getElementById("q41" + j).value;
				    // break;
				// }
		    // };
		    // for(var j = 1; j <= 3; j++){
				// if(W.getElementById("q42" + j).checked ){
				    // node.game.question32 = W.getElementById("q42" + j).value;
				    // break;
				// }
		    // };
		    // for(var j = 1; j <= 5; j++){
				// if(W.getElementById("q43" + j).checked ){
				    // node.game.question33 = W.getElementById("q43" + j).value;
				    // break;
				// }
		    // };
		    // for(var j = 1; j <= 3; j++){
				// if(W.getElementById("q44" + j).checked ){
				    // node.game.question34 = W.getElementById("q44" + j).value;
				    // break;
				// }
		    // };
		    // var timeResultProp = {
			// playerID : {Player_ID: node.game.ownID},
			// add: {timeQuest3: node.game.timeQuest3, question31: node.game.question31,
				  // question32: node.game.question32, question33: node.game.question33, question34: node.game.question34}
		    // };
		    // node.set('bsc_questTime',timeResultProp);
		    // questionnaire5(1);
		// },
	    // };
	    // node.game.timer.init(options);
	    // node.game.timer.updateDisplay();
	    // node.game.timer.start(options);
//
	    // var quest4 = W.getElementById('continue');
	    // quest4.onclick = function() {
		// node.game.timeQuest3 = Math.round(Math.abs(node.game.timeQuest3 - Date.now())/1000);
		// for(var j = 1; j <= 2; j++){
		    // if(W.getElementById("q41" + j).checked ){
			// node.game.question31 = W.getElementById("q41" + j).value;
			// break;
		    // }
		// };
		// for(var j = 1; j <= 3; j++){
		    // if(W.getElementById("q42" + j).checked ){
			// node.game.question32 = W.getElementById("q42" + j).value;
			// break;
		    // }
		// };
		// for(var j = 1; j <= 5; j++){
		    // if(W.getElementById("q43" + j).checked ){
			// node.game.question33 = W.getElementById("q43" + j).value;
			// break;
		    // }
		// };
		// for(var j = 1; j <= 3; j++){
		    // if(W.getElementById("q44" + j).checked ){
			// node.game.question34 = W.getElementById("q44" + j).value;
			// break;
		    // }
		// };
		// node.game.timer.stop();
		// var timeResultProp = {
		    // playerID : {Player_ID: node.game.ownID},
		    // add: {timeQuest3: node.game.timeQuest3, question31: node.game.question31,
			      // question32: node.game.question32, question33: node.game.question33, question34: node.game.question34}
		// };
		// node.set('bsc_questTime',timeResultProp);
		// questionnaire5(0);
	    // };
	// });
	// return;
    // };
//
    // // Questionaire Page 5 - Data Processing
    // function questionnaire5(timeout){
	// var url = '/burdenRAHR/html/questionnaire5.html';
//
	// W.loadFrame(url, function(){
	    // node.game.timeQuest4 = Date.now();
	    // var options = {
		// milliseconds: 180000, // 1200000 ms is equivalent to 20 minutes
		// timeup: function() {
		    // node.game.timeQuest4 = Math.round(Math.abs(node.game.timeQuest4 - Date.now())/1000);
			// if(W.getElementById("q511").checked){
				// node.game.quest411 = 1;
			// }
			// else{ node.game.quest411 = 0; }
			// if(W.getElementById("q512").checked){
				// node.game.quest412 = 1;
			// }
			// else{ node.game.quest412 = 0; }
			// if(W.getElementById("q513").checked){
				// node.game.quest413 = 1;
			// }
			// else{ node.game.quest413 = 0; }
			// if(W.getElementById("q514").checked){
				// node.game.quest414 = 1;
			// }
			// else{ node.game.quest414 = 0; }
			// if(W.getElementById("q515").checked){
				// node.game.quest415 = 1;
			// }
			// else{ node.game.quest415 = 0; }
			// if(W.getElementById("q516").checked){
				// node.game.quest416 = 1;
			// }
			// else{ node.game.quest416 = 0; }
			// if(W.getElementById("q517").checked){
				// node.game.quest417 = 1;
			// }
			// else{ node.game.quest417 = 0; }
//
			// // Question q521 ...q526
			// if(W.getElementById("q521").checked){
				// node.game.quest421 = 1;
			// }
			// else{ node.game.quest421 = 0; }
			// if(W.getElementById("q522").checked){
				// node.game.quest422 = 1;
			// }
			// else{ node.game.quest422 = 0; }
			// if(W.getElementById("q523").checked){
				// node.game.quest423 = 1;
			// }
			// else{ node.game.quest423 = 0; }
			// if(W.getElementById("q524").checked){
				// node.game.quest424 = 1;
			// }
			// else{ node.game.quest424 = 0; }
			// if(W.getElementById("q525").checked){
				// node.game.quest425 = 1;
			// }
			// else{ node.game.quest425 = 0; }
			// if(W.getElementById("q526").checked){
				// node.game.quest426 = 1;
			// }
			// else{ node.game.quest426 = 0; }
//
//
// //
			// // var qu51 = 0;
		    // // var qu52 = 0;
		    // // var question41 = new Array();
		    // // node.game.question41Good = '';
		    // // for(var j = 1; j <= 7; j++){
			// // if(W.getElementById("q51" + j).checked){
			    // // question41[qu51] = W.getElementById("q51" + j).value;
			    // // node.game.question41Good = node.game.question41Good + question41[qu51].toString();
			    // // qu51++;
			// // }
		    // // };
		    // // var question42 = new Array();
		    // // question42Good = '';
		    // // for(var j = 1; j <= 6; j++){
			// // if(W.getElementById("q52" + j).checked ){
			    // // question42[qu52] = W.getElementById("q52" + j).value;
			    // // node.game.question42Good = node.game.question42Good + question42[qu52].toString();
			    // // qu52++;
			// // }
		    // // };
//
		    // var timeResultProp = {
			// playerID : {Player_ID: node.game.ownID},
			// add: {
				// timeQuest4: node.game.timeQuest4,
				// question411: node.game.quest411,
				// question412: node.game.quest412,
				// question413: node.game.quest413,
				// question414: node.game.quest414,
				// question415: node.game.quest415,
				// question416: node.game.quest416,
				// question417: node.game.quest417,
				// question421: node.game.quest421,
				// question422: node.game.quest422,
				// question423: node.game.quest423,
				// question424: node.game.quest424,
				// question425: node.game.quest425,
				// question426: node.game.quest426
		    // }
		    // };
		    // node.set('bsc_questTime',timeResultProp);
		    // questionnaire6(1);
		// },
	    // };
	    // node.game.timer.init(options);
	    // node.game.timer.updateDisplay();
	    // node.game.timer.start(options);
//
	    // var quest5 = W.getElementById('continue');
	    // quest5.onclick = function() {
		// node.game.timeQuest4 = Math.round(Math.abs(node.game.timeQuest4 - Date.now())/1000);
			// if(W.getElementById("q511").checked){
				// node.game.quest411 = 1;
			// }
			// else{ node.game.quest411 = 0; }
			// if(W.getElementById("q512").checked){
				// node.game.quest412 = 1;
			// }
			// else{ node.game.quest412 = 0; }
			// if(W.getElementById("q513").checked){
				// node.game.quest413 = 1;
			// }
			// else{ node.game.quest413 = 0; }
			// if(W.getElementById("q514").checked){
				// node.game.quest414 = 1;
			// }
			// else{ node.game.quest414 = 0; }
			// if(W.getElementById("q515").checked){
				// node.game.quest415 = 1;
			// }
			// else{ node.game.quest415 = 0; }
			// if(W.getElementById("q516").checked){
				// node.game.quest416 = 1;
			// }
			// else{ node.game.quest416 = 0; }
			// if(W.getElementById("q517").checked){
				// node.game.quest417 = 1;
			// }
			// else{ node.game.quest417 = 0; }
//
			// // Question q521 ...q526
			// if(W.getElementById("q521").checked){
				// node.game.quest421 = 1;
			// }
			// else{ node.game.quest421 = 0; }
			// if(W.getElementById("q522").checked){
				// node.game.quest422 = 1;
			// }
			// else{ node.game.quest422 = 0; }
			// if(W.getElementById("q523").checked){
				// node.game.quest423 = 1;
			// }
			// else{ node.game.quest423 = 0; }
			// if(W.getElementById("q524").checked){
				// node.game.quest424 = 1;
			// }
			// else{ node.game.quest424 = 0; }
			// if(W.getElementById("q525").checked){
				// node.game.quest425 = 1;
			// }
			// else{ node.game.quest425 = 0; }
			// if(W.getElementById("q526").checked){
				// node.game.quest426 = 1;
			// }
			// else{ node.game.quest426 = 0; }
//
// //
		// // var qu51 = 0;
		// // var qu52 = 0;
		// // var question41 = new Array();
		// // node.game.question41Good = '';
		// // for(var j = 1; j <= 7; j++){
		    // // if(W.getElementById("q51" + j).checked){
			// // question41[qu51] = W.getElementById("q51" + j).value;
			// // node.game.question41Good = node.game.question41Good + question41[qu51].toString();
			// // qu51++;
		    // // }
		// // };
		// // var question42 = new Array();
		// // question42Good = '';
		// // for(var j = 1; j <= 6; j++){
		    // // if(W.getElementById("q52" + j).checked ){
			// // question42[qu52] = W.getElementById("q52" + j).value;
			// // node.game.question42Good = node.game.question42Good + question42[qu52].toString();
			// // qu52++;
		    // // }
		// // };
		// node.game.timer.stop();
		// var timeResultProp = {
		    // playerID : {Player_ID: node.game.ownID,},
			// add: {
				// timeQuest4: node.game.timeQuest4,
				// question411: node.game.quest411,
				// question412: node.game.quest412,
				// question413: node.game.quest413,
				// question414: node.game.quest414,
				// question415: node.game.quest415,
				// question416: node.game.quest416,
				// question417: node.game.quest417,
				// question421: node.game.quest421,
				// question422: node.game.quest422,
				// question423: node.game.quest423,
				// question424: node.game.quest424,
				// question425: node.game.quest425,
				// question426: node.game.quest426
		    // }
		// };
		// node.set('bsc_questTime',timeResultProp);
		// questionnaire6(0);
	    // };
	// });
	// return;
    // };
//
    // // Questionaire Page 6 - Data Processing
    // function questionnaire6(timeout){
	// var url = '/burdenRAHR/html/questionnaire6.html';
//
	// W.loadFrame(url, function(){
	    // node.game.timeQuest5 = Date.now();
	    // var options = {
		// milliseconds: 120000, // 1200000 ms is equivalent to 20 minutes
		// timeup: function() {
		    // node.game.timeQuest5 = Math.round(Math.abs(node.game.timeQuest5 - Date.now())/1000);
		    // var age1 = W.getElementById('age').value;
		    // age = parseInt(age1);
		    // node.game.question5 ='';
		    // for(var j = 1; j <= 2; j++){
			// if(W.getElementById("q6" + j).checked){
			    // node.game.question5 = W.getElementById("q6" + j).value;
			    // break;
			// }
		    // };
		    // node.game.comment51 = W.getElementById('comment61').value;
		    // node.game.comment52 = W.getElementById('comment62').value;
		    // if(!isNaN(age) && isFinite(age) && age >= 0 && age <= 100 && age1 % 1 == 0){
			// ageGood = age1;
		    // }
		    // else{
			// ageGood = 'Time out - No answer';
		    // }
		    // var timeResultProp = {
			// playerID : {Player_ID: node.game.ownID,},
			// add: {timeQuest5: node.game.timeQuest5, Age: node.game.ageGood, Gender: node.game.question5,
				  // question51: node.game.comment51, question52: node.game.comment52}
		    // };
		    // node.set('bsc_questTime',timeResultProp);
		    // questionnaire7(1);
		// },
	    // };
	    // node.game.timer.init(options);
	    // node.game.timer.updateDisplay();
	    // node.game.timer.start(options);
//
	    // var quest6 = W.getElementById('continue');
	    // quest6.onclick = function() {
		// node.game.timeQuest5 = Math.round(Math.abs(node.game.timeQuest5 - Date.now())/1000);
		// var age1 = W.getElementById('age').value;
		// age = parseInt(age1);
		// node.game.question5 ='';
		// for(var j = 1; j <= 2; j++){
		    // if(W.getElementById("q6" + j).checked){
			// node.game.question5 = W.getElementById("q6" + j).value;
			// break;
		    // }
		// };
		// node.game.comment51 = W.getElementById('comment61').value;
		// node.game.comment52 = W.getElementById('comment62').value;
		// if(!isNaN(age) && isFinite(age) && age >= 0 && age <= 100 && age1 % 1 == 0){
		    // node.game.ageGood = age1;
		    // node.game.timer.stop();
		    // var timeResultProp = {
			// playerID : {Player_ID: node.game.ownID,},
			// add: {timeQuest5: node.game.timeQuest5, Age: node.game.ageGood, Gender: node.game.question5,
				  // question51: node.game.comment51, question52: node.game.comment52}
		    // };
		    // node.set('bsc_questTime',timeResultProp);
		    // questionnaire7(0);
		// }
		// else{
			// var msg = 'Please enter a non-fractional number between 1 and 100 in the field: "How old are you?"';
			// checkID(msg);
		// }
	    // };
	// });
	// return;
    // };
//
    // // Questionaire Page 7 - Data Processing
    // function questionnaire7(timeout){
		// var url = '/burdenRAHR/html/questionnaire7.html';
		// console.log("Bonus: " + bonus);
		// W.loadFrame(url, function(){
		    // node.game.timeQuest6 = Date.now();
		    // var options = {
			// milliseconds: 240000, // 1200000 ms is equivalent to 20 minutes
			// timeup: function() {
			    // node.game.timeQuest6 = Math.round(Math.abs(node.game.timeQuest6 - Date.now())/1000);
			    // node.game.comment6 = W.getElementById('comment7').value;
			    // var timeResultProp = {
				// playerID : {Player_ID: node.game.ownID},
				// add: {timeQuest6: node.game.timeQuest6, Question6: node.game.comment6}
			    // };
			    // node.set('bsc_questTime',timeResultProp);
			    // node.say("QUEST_DONE", "SERVER", bonus);
			    // // node.emit('DONE');
			// },
		    // };
		    // node.game.timer.init(options);
		    // node.game.timer.updateDisplay();
		    // node.game.timer.start(options);
//
		    // var quest7 = W.getElementById('continue');
		    // quest7.onclick = function() {
			// node.game.timeQuest6 = Math.round(Math.abs(node.game.timeQuest6 - Date.now())/1000);
			// node.game.timer.stop();
			// node.game.comment6 = W.getElementById('comment7').value;
			// var timeResultProp = {
			    // playerID : {Player_ID: node.game.ownID},
			    // add: {timeQuest6: node.game.timeQuest6, Question6: node.game.comment6}
			// };
			// node.set('bsc_questTime',timeResultProp);
			// // debugger;
			// node.say("QUEST_DONE", "SERVER", bonus);
//
			// //node.say("questionnaire_done", "SERVER");
			// // node.emit('DONE');
		    // };
		// });
	// return;
    // };

