//Added by Florian Schmidt
//new widget

(function (node) {

    var Table = node.window.Table,
    GameState = node.GameState;
    
    node.widgets.register('StateOfGame', StateOfGame);	
    
    //## Meta-data

    StateOfGame.version = '0.4.2';
    StateOfGame.description = 'Display basic information about player\'s status.';

    
    StateOfGame.title = 'State Display';
    StateOfGame.className = 'statedisplay';
    
    function StateOfGame(options) {
	
	this.id = options.id;
	
    }

    
})(node);