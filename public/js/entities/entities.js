let speed = -5;
game.CharacterEntity = me.Entity.extend({
    init: function(x, y) {

        // call the super constructor
        this._super(me.Entity, "init", [200, 140, {width : 77, height : 58}]);

        // create an animation using the cap guy sprites, and add as renderable
        this.renderable = game.characterTexture.createAnimationFromName([
            "1", "2", "3", "4", "5", "6", "7", "8"
        ]);
        this.renderable.addAnimation("flying", [0, 1],200);
        this.renderable.setCurrentAnimation("flying");

        this.alwaysUpdate = true;
        this.body.gravity = 0.2;
        this.maxAngleRotation = me.Math.degToRad(-30);
        this.maxAngleRotationDown = me.Math.degToRad(35);
        //this.renderable.anchorPoint = new me.Vector2d(0.1, 0.5);
        this.renderable.anchorPoint = {"x" : 0, "y" : 0};
        this.anchorPoint = {"x" : 0, "y" : 0};
        this.body.addShape(new me.Ellipse(0, 0, 74, 58));
        this.body.removeShapeAt(0);

        this.type = "character";
        //this.body.addShape(new me.Ellipse(5, 5, 99, 59));


        // a tween object for the flying physic effect
       // this.flyTween = new me.Tween(this.pos);
        //this.flyTween.easing(me.Tween.Easing.Exponential.InOut);

        this.currentAngle = 0;
        this.angleTween = new me.Tween(this);
        this.angleTween.easing(me.Tween.Easing.Exponential.InOut);

        // end animation tween
        this.endTween = null;

        // collision shape
        this.collided = false;

        this.gravityForce = 0.3;

        this.velY = 0;
        this.jumpForce = 5;
    },

    update: function(dt) {
        var that = this;
        this.pos.x = 60;
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.renderable.currentTransform.identity();
        if (me.input.isKeyPressed('fly')) {
            me.audio.play('wing');
            var currentPos = this.pos.y;
            this.velY = -this.jumpForce;
        } else {
            this.pos.y += this.velY;
            this.velY += this.gravityForce;
        }
        // This is not the best solution, should be changed ...
        this.currentAngle = this.velY * 0.01;

        this.renderable.currentTransform.rotate(this.currentAngle);
        me.Rect.prototype.updateBounds.apply(this);

        var hitSky = -80; // bird height + 20px
		var hitGround = 600; // heightof the background img
        if (this.pos.y <= hitSky || this.pos.y >= hitGround || this.collided) {
            game.data.start = false;
            me.audio.play("lose");
            this.endAnimation();
            return false;
        }
        me.collision.check(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    },

    onCollision: function(response) {
        var obj = response.b;
        if (obj.type === 'pipe') {
            if (Math.random () > 0.9){
                // Vibromasseur mode
                me.device.vibrate(50000);
            }
            else
                me.device.vibrate(500);
            this.collided = true;
            if (Math.random() > 0.5)
                me.audio.play("tesdanslaxe", false, null, 1);
            else
                me.audio.play("fatchdefitch", false, null, 1);
        }
        // remove the hit box
        if (obj.type === 'hit') {
            me.game.world.removeChildNow(obj);
            game.data.steps++;
            if (game.data.steps % 40 < 15 && game.data.steps >= 40 && game.data.steps < 100)
                speed = speed - 0.5;
			else if (game.data.steps % 40 < 15 && game.data.steps >= 100)
				speed = speed - 0.7;
			else
				speed = -5;
            me.audio.play('hit',0.2);
            var random = Math.random();
			if (random > 0.99)
				me.audio.play('balledeboulepremium', false, null, 1);
            else if (random > 0.9)
                me.audio.play('cest du bon', false, null, 1);
            else if (random > 0.8)
                me.audio.play('onestbienla', false, null, 1);
            else if (random > 0.75)
                me.audio.play('balle de boule', false, null, 1);
        }
    },

    endAnimation: function() {
        me.game.viewport.fadeOut("#fff", 100);
        let currentPos = this.pos.y;
        this.endTween = new me.Tween(this.pos);
        this.endTween.easing(me.Tween.Easing.Exponential.InOut);
        this.renderable.anchorPoint = {"x" : 0.5, "y" : 0.5};
        this.anchorPoint = {"x" : 0.5, "y" : 0.5};
        //this.flyTween.stop();
        this.renderable.currentTransform.identity();
        this.renderable.currentTransform.rotate(me.Math.degToRad(90));
        let finalPos = me.game.viewport.height - this.renderable.width/2 - 96;
        this.endTween
            .to({y: currentPos}, 1000)
            .to({y: finalPos}, 1000)
            .onComplete(function() {
                me.state.change(me.state.GAME_OVER);
            });
        this.endTween.start();
    }

});


game.PipeEntity = me.Entity.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = this.image = me.loader.getImage('pipe');
        settings.width = 128;
        settings.height= 1664;
        settings.framewidth = 128;
        settings.frameheight = 1664;

        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.body.vel.set(speed, 0);
        this.type = 'pipe';
        //this.body.removeShapeAt(0);
        //this.body.addShape(new me.Rect(x, y, settings.width, settings.height));
        //this.body.removeShapeAt(0);
    },

    update: function(dt) {
        // mechanics
		
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.image.width) {
            me.game.world.removeChild(this);
        }
		this.body.vel.set(speed, 0);
		
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    },

});

game.PipeGenerator = me.Renderable.extend({
    init: function() {
        this._super(me.Renderable, 'init', [0, me.game.viewport.width, me.game.viewport.height, 92]);
        this.alwaysUpdate = true;
        this.generate = 0;
        this.pipeFrequency = 92;
        this.pipeHoleSize = 1310;
        this.posX = me.game.viewport.width;
        this.previousPipe = undefined;
    },

    update: function(dt) {
        if (this.generate++ % this.pipeFrequency == 0) {
            var posY = me.Math.random(
                    me.video.renderer.getHeight() - 20,
                    200
            );
            // plus facile au debut
			if (game.data.steps >= 10 && game.data.steps % 10 == 0 && this.pipeHoleSize > 1210) {
				this.pipeHoleSize = this.pipeHoleSize - 10;
			}
            var posY2 = posY - me.game.viewport.height - this.pipeHoleSize;
            var pipe1 = new me.pool.pull('pipe', this.posX, posY);
            var pipe2 = new me.pool.pull('pipe', this.posX, posY2);
            var hit = new me.pool.pull("hit", this.posX + (pipe1.width/2), 0);
            if(game.data.steps == 0 && this.generate==1) {
                me.game.world.addChild(me.pool.pull("bonus", this.posX + (pipe1.width / 2) - 37/2, posY-150, 5), 9);
            } else if(Math.random() > 0.9) {
                let bonusX = me.Math.random(this.posX, this.posX + pipe1.width + this.previousPipe.pos.x);
                let bonusY = 0;
                if(bonusX <= this.posX + pipe1.width)
                    bonusY = me.Math.random(posY, posY + (posY2 + this.pipeHoleSize));
                else
                    bonusY = me.Math.random(150, 451);
                me.game.world.addChild(me.pool.pull("bonus", bonusX, bonusY, 5 + Math.round(game.data.steps / 10)), 9);
            }
            //pipe1.renderable.currentTransform.scaleY(-1);
            me.game.world.addChild(pipe1, 10);
            me.game.world.addChild(pipe2, 10);
            me.game.world.addChild(hit, 11);
            this.previousPipe = pipe1;
        }
        this._super(me.Entity, "update", [dt]);
    },

});

game.HitEntity = me.Entity.extend({
    init: function(x, y) {
        this._super(me.Entity, 'init', [x, y, {width : 1, height : me.game.viewport.height}]);
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.updateTime = false;
        this.body.vel.set(speed, 0);
        //this.body.removeShapeAt(0);
        //this.body.addShape(new me.Rect(0, 0, this.width - 30, this.height - 30));
        this.type = 'hit';
    },

    update: function(dt) {
        // mechanics
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.width) {
            me.game.world.removeChild(this);
        }
        this.body.vel.set(speed, 0);
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    }
});

/**
 * BonusEntity : basic enemies stats
 */
game.BonusEntity = me.Entity.extend({
    init: function(x, y, points) {
        // Default params values
        if (typeof points === 'undefined') { this.points = 20; } else {this.points = points * 2;}

        var settings = {};
        settings.image = this.image = me.loader.getImage('bonus');
        settings.width = 37;
        settings.height= 49;
        settings.framewidth = 37;
        settings.frameheight = 49;
        // call the super constructor
        this._super(me.Entity, "init", [x, y, settings]);
        this.type = 'bonus';
        this.alwaysUpdate = true;
        this.pos.add(this.body.vel);
        this.body.vel.set(0, 0);
        this.body.addShape(new me.Ellipse(0, 0, 37, 49));
        this.body.removeShapeAt(0);
        this.pickedup = false;
    },

    update: function(dt) {
        // mechanics
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.width) {
            me.game.world.removeChild(this);
        }
        this.body.vel.set(speed, 0);
        me.Rect.prototype.updateBounds.apply(this);
        me.collision.check(this);
        this._super(me.Entity, "update", [dt]);
        return true;
    },

    onCollision: function(response) {
        let obj = response.b;
        if (obj.type === 'character' && !this.pickedup){
            this.pickedup = true;
            game.data.steps += this.points;
            me.game.world.removeChild(this);
            me.audio.play("hit");
        }

        return false;
    }
});

