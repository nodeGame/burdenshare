// NodeGame INIT

// The interval for countdown. Global variable.
var timeCheck;

// TimeUp expired already. 
// Useful to synchronize server and local countdown.
var alreadyTimeUp;

// Number of players currently connected.
var nbrPlayerConnected;

// Number of milliseconds to wait.
var waitTime = 10000;

// Human readable time variables;
var minutes = 10, seconds = 0;

// Number of seconds passed already.
var secCount = 0;

window.onload = function() {

    // NodeGame Listeners.
    node.on.data('PLAYERSCONNECTED', function(msg) {
        var pConn;
        nbrPlayerConnected = msg.data;
        pConn = document.getElementById("nbrPlayers");
        
        // Might not exists, when switching across pages.
        if (pConn) {
            pConn.innerHTML = "Number of participants already in the group:  " + msg.data + " of 4";
        }
    });
    node.on.data('TIME', function(msg) {
        console.log(msg.data);
        timeIsUp(msg.data);
    });

    function timeIsUp(data) {
        var timeOut;

        if (alreadyTimeUp) return;
        alreadyTimeUp = true;

        clearInterval(timeCheck);

        // All players have connected. Game starts.
        if (data && data.over) return;

        if (data && data.exit) {

            timeOut = "<h3 align='center'>Thank you for your patience.<br>";
            timeOut += "Unfortunately, there are not enough participants in your group to start the experiment.<br>";
            timeOut += "You will be payed out a fix amount for your participation up to this point.<br><br>";
            timeOut += "Please go back to Amazon Mechanical Turk web site and submit the hit.<br>";
            timeOut += "We usually pay within 24 hours. <br>For any problems, please look for a HIT called <strong>ETH Descil Trouble Ticket</strong> and file a new trouble ticket reporting the exit code as written below.<br><br>";
            timeOut += "Exit Code: " + data.exit + "<br> </h3>";
        }
        else {
            timeOut = "An error has occurred. You seem to be waiting for too long. ";
            timeOut += "Please look for a HIT called <strong>ETH Descil Trouble Ticket</strong> and file a new trouble ticket reporting your experience."
        }
        
        document.getElementById("startPage").innerHTML = timeOut;
    }

    function Countdown() {
        var PrevMin = (minutes < 10) ? "0" : ":";
        var PrevSec = (seconds < 10) ? ":0" : ":";
        var TimeNow = PrevMin + minutes + PrevSec + seconds;

        if (DHTML) {
            if (NS4) {
                setContent("id", "Uhr", null, '<span class="Uhr">' + TimeNow + "<\/span>");
            }
            else {
                setContent("id", "Uhr", null, TimeNow);
            }
            if (minutes > 0 && seconds == 0) {
                minutes--;
                seconds = 59;
            }
            else seconds--;
        }
    }

    // Configuring nodegame
    node.setup('nodegame', {
        verbosity: 100,
        debug : true,
        window : {
            promptOnleave : false
        },
        env : {
            auto : false,
            debug : false
        },
        events : {
            dumpEvents : true
        },
        socket : {
            type : 'SocketIo',
            reconnect : false
        }
    });

    // Connecting to waiting room.
    //            if (location.search) {
    //                // Pass query arguments on.
    //                node.connect("/burdenshare", { query: location.search.substr(1) });
    //            }
    //            else {
    //                node.connect("/burdenshare");
    //            }

    // Connect.
    node.connect("/burdenshare");

    // Start waiting time timer.
    node.on.data('WAITTIME', function(msg) {
        
        // Update the number of minutes to wait and start timer.
        waitTime = msg.data;

        minutes = Math.floor(waitTime / ( 60 * 1000));
        seconds = 0;

        Countdown();
        timeCheck = setInterval(function() {
            secCount += 1000;

            // If server is unresponsive.
            if (secCount >= waitTime) {                
                clearInterval(timeCheck);
                setTimeout(function() {
                    // Should receive TIME msg from server in the meantime.
                    timeIsUp();
                }, 8000);
            }
            else {
                Countdown();
            }

        }, 1000);
    });
    
};