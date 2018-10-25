game.TitleScreen = me.ScreenObject.extend({
    init: function(){
        this._super(me.ScreenObject, 'init');
        this.font = null;

        this.logo = null;
    },

    onResetEvent: function() {
        me.audio.stop("theme");
        game.data.newHiScore = false;
		me.game.world.addChild(new BackgroundLayer('bg', 1));

		me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		me.input.bindKey(me.input.KEY.SPACE, "enter", true);
		me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);

        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "enter") {
                me.state.change(me.state.PLAY);
                socket.emit("start");
                if (Math.random() > 0.5)
                    me.audio.play("cabiche", false, null, 1);
            }
        });
		

        //logo
        this.logo = new me.Sprite(
            me.game.viewport.width/2,
            me.game.viewport.height/2 - 20,
            {image: 'logo'}
        );
        me.game.world.addChild(this.logo, 10);

        var that = this;
        var logoTween = me.pool.pull("me.Tween", this.logo.pos)
            .to({y: me.game.viewport.height/2 - 100}, 1000)
            .easing(me.Tween.Easing.Exponential.InOut).start();


        me.game.world.addChild(new (me.Renderable.extend ({
            // constructor
            init: function() {
                // size does not matter, it's just to avoid having a zero size
                // renderable
                this._super(me.Renderable, 'init', [0, 0, 100, 100]);
				this.text = me.device.touch ? 'Tap to start' : 'APPUYEZ SUR ESPACE OU CLIQUE GAUCHE POUR DEMARRER' ;
                this.font = new me.Font('gamefont', 20, '#000');
            },
            draw: function (renderer) {
                var measure = this.font.measureText(renderer, this.text);
                var xpos = me.game.viewport.width/2 - measure.width/2;
                var ypos = me.game.viewport.height/2 + 50;
                this.font.draw(renderer, this.text, xpos, ypos-50);
				this.font.draw(renderer, "CREDITS          VOICE EFFECTS \n STEVEN           LOLO\n MAXIME", xpos+100, ypos+25);
            }
        })), 12);
    },

    onDestroyEvent: function() {
        // unregister the event
        me.event.unsubscribe(this.handler);
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindPointer(me.input.pointer.LEFT);

        me.game.world.removeChild(this.logo);
        this.logo = null;
    }
});