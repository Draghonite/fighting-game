
class Sprite {
  constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 } }) {
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 25;
    this.offset = offset;
  }

  draw() {
    c.drawImage(
      this.image,
      this.framesCurrent * (this.image.width / this.framesMax),
      0,
      this.image.width / this.framesMax,
      this.image.height,
      this.position.x - this.offset.x, 
      this.position.y - this.offset.y, 
      this.image.width / this.framesMax * this.scale, 
      this.image.height * this.scale
    );
  }

  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update() {
    this.draw();
    this.animateFrames();
  }
}

class Fighter extends Sprite {
  constructor({ 
    position, 
    velocity, 
    color = 'red', 
    imageSrc, 
    scale = 1, 
    framesMax = 1, 
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined }
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    });
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey = null;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    };
    this.color = color;
    this.isAttacking = false;
    this.health = 100;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 18;
    this.sprites = sprites;
    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image();
      sprites[sprite].image.src = sprites[sprite].imageSrc;
    }
    this.isDead = false;
    this.isJumping = false;
  }

  update() {
    this.draw();
    if (!this.isDead) {
      this.animateFrames();
    }

    // attack boxes
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // draw attack boxes -- dev/troubleshoting
    // c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height);

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // gravity function
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
      this.velocity.y = 0;
      this.position.y = 330;
      this.isJumping = false;
    } else {
      this.velocity.y += GRAVITY;
      this.isJumping = true;
    }
  }

  attack() {
    this.switchSprite(CHARACTER_STATE.ATTACK_1);
    this.isAttacking = true;
  }

  switchSprite(sprite) {
    // override all other animations when dead
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1) {
        this.isDead = true;
      }
      return; 
    }
    // override all other animations when attacking
    if (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) { return; }
    // override all other animations when taking hit
    if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) { return; }
    switch(sprite) {
      case CHARACTER_STATE.IDLE:
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.framesMax = this.sprites.idle.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case CHARACTER_STATE.RUN:
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case CHARACTER_STATE.JUMP: 
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.framesMax = this.sprites.jump.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case CHARACTER_STATE.FALL: 
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image;
          this.framesMax = this.sprites.fall.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case CHARACTER_STATE.ATTACK_1: 
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image;
          this.framesMax = this.sprites.attack1.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case CHARACTER_STATE.TAKE_HIT: 
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image;
          this.framesMax = this.sprites.takeHit.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case CHARACTER_STATE.DEATH: 
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image;
          this.framesMax = this.sprites.death.framesMax;
          this.framesCurrent = 0;
        }
        break;
    }
  }

  takeHit(healthHit, updateHealth) {
    this.health -= healthHit;
    if (updateHealth) { updateHealth(); }
    if (this.health <= 0) {
      this.switchSprite(CHARACTER_STATE.DEATH);
    } else {
      this.switchSprite(CHARACTER_STATE.TAKE_HIT);
    }
  }
}