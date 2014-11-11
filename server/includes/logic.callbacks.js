module.exports = {

    decorateMongoObj: decorateMongoObj

};

function decorateMongoObj(mongo) {

    mongo.update = function(msg) {
	
	if(msg.playerID == null || msg.add == null){
	    console.log("ERROR: playerID is not available !!!")
	}
        else if(this.activeCollection) {
    	    
    	    var playerID = msg.playerID;
	    var add = msg.add;
            //        this.activeCollection.update(msg);
            this.activeCollection.update(playerID, {$set: add,});
        }
        else {
            this.node.err('MongoLayer: no active connection!');
        }
        return true;
    };

    mongo.updateEndow = function(msg) {
	var playerID = msg.playerID;
	var addEndow = msg.addEndow;
        if (this.activeCollection) {
            this.activeCollection.update(playerID, {$set: addEndow,});
        }
        else {
            this.node.err('MongoLayer: no active connection!');
        }
        return true;
    };

    mongo.deleting = function(player, round){
	if(this.activeCollection){
	    this.activeCollection.remove({Player_ID: player, Current_Round: round});
	}
        else {
            this.node.err('MongoLayer: no active connection!');
        }
    };

    // TODO: test this method
    mongo.on = function(eventType, callback) {
        var that = this;
        
        this.node.events.ng.on(eventType, function(msg) {
            var data = callback(msg);

            if ('object' !== typeof data) {
                that.node.err("MongoLayer.on callback didn't return data object");
                return;
            }

            /*
              if (data.hasOwnProperty('eventType')) {
              that.node.err(
              "MongoLayer.on callback returned data with 'eventType' field");
              return;
              }
            */
            
            // raise error?
            data.eventType = data.eventType || eventType;
            if (msg.from) {
                data.senderID = data.senderID || msg.from;
            }

            that.store(data);
        });
    };

    mongo.getDbObj = function() {
        return this.activeDb;
    };

    mongo.getCollectionObj = function(playerID, callback) {
	if(this.activeCollection){
	    this.activeCollection.find({"Player_ID": playerID}, {"Profit": 1, "_id": 0}).toArray(function(err, items){
		if(err) callback(err);
		else callback(null, items);
	    });
	}
        else {
            this.node.err('MongoLayer: no active connection!');
        }	
    };

    mongo.getInitEndow = function(playerID, callback){
	if(this.activeCollection){
	    this.activeCollection.find({"Player_ID": playerID}, {"Initial_Endowment": 1, "Climate_Risk": 1, "_id": 0}).toArray(function(err, items){
		if(err) callback(err);
		else { callback(null, items); }
	    });
	}
        else {
            this.node.err('MongoLayer: no active connection!');
        }
    };

    mongo.checkData = function(msg, callback) {
	if(this.activeCollection){
	    this.activeCollection.find({"Player_ID": msg.Player_ID, "Current_Round": msg.Current_Round }, {"Current_Round": 1, "_id": 0}).toArray(function(err, items){
		if(err) callback(err);
		else {
		    callback(null, items);
		}
	    });
	}
        else {
            this.node.err('MongoLayer: no active connection!');
        }
    };

    mongo.checkProfit = function(playerID, callback) {
	if(this.activeCollection){
	    this.activeCollection.find({"Player_ID": playerID}, {"Payout_Round": 1,"Amount_UCE": 1,  "_id": 0}).toArray(function(err, items){
		if(err) callback(err);
		else {
		    callback(null, items);
		}
	    });
	}
        else {
            this.node.err('MongoLayer: no active connection!');
        }		
    };
    
}