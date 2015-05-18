module.exports = function(waitRoom, treatments) {

    waitRoom.POOL_SIZE = 4; // if omitted = groupSize.
    
    waitRoom.GROUP_SIZE = 4;

    waitRoom.MAX_WAIT_TIME = 600000; // default wait forever

    waitRoom.onMaxWaitTime = function(player) {       
        // redirect. Msg.
    };
    
    waitRoom.assignTreatment = function(nth, clients) {
        return 'mytreatment';
    };

    
   
}