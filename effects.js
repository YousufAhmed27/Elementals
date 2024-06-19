class Project {
    constructor(canvas, X, Y) {
        this.canvas = canvas
        this.spritew = 100
        this.spriteh = 100
        this.width = this.spritew
        this.height = this.spriteh
        this.X = X
        this.Y = Y
        this.speed = 5

        // Frames and animation
        this.frameX = 0
        this.frameY = 0
        this.maxframe = -1
        this.frames = 0
        this.frameinterval = 100
        this.stay = false
        this.myframe = 0
        this.delete = false

        // Collision detection rectangle
        this.recX = this.X + 55
        this.recY = this.Y + 30
        this.recW = 40
        this.recH = 15
    }
    update(delta) {
        this.frames += delta
        if (this.frames > this.frameinterval) {
            this.frames = 0
            if (this.stay) this.frameX > this.maxframe ? this.frame = this.myframe : this.frameX++
            else this.frameX > this.maxframe ? this.frameX = 0 : this.frameX++
        }

        this.X += this.speed
        if (this.Y + this.height < 0 || this.Y > this.canvas.height || this.X + this.width < 0 || this.X > this.canvas.width) this.delete = true
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.frameX * this.spritew, this.frameY * this.spriteh, this.spritew, this.spriteh, this.X, this.Y, this.width, this.height)
        // ctx.strokeRect(this.X, this.Y, this.width, this.height)
        // ctx.strokeRect(this.recX, this.recY, this.recW, this.recH)
    }
    ColRect(X, X2) {
        if (X.recX + X.recW > X2.recX &&
            X.recX < X2.recX + X2.recW &&
            X.recY + X.recH > X2.recY &&
            X.recY < X2.recY + X2.recH
        ) return true
        else return false
    }
}

class Target {
    constructor() {
        this.X = 500
        this.Y = 400
        this.width = 30
        this.height = 100
    }
    draw(ctx) {
        ctx.strokeRect(this.X, this.Y, this.width, this.height)
    }
}

///////////////////////STONEGOLEM///////////////////////

export class GlowArm extends Project {
    constructor(canvas, X, Y, target) {
        super(canvas, X, Y)
        this.target = target
        this.image = ArmGlow
        this.angle = Math.atan2(this.recY - this.target.recY, this.recX - this.target.recX + 15)
        this.speed = 0
        this.maxframe = 4
        this.damage = 5
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 30
        this.recY = this.Y + 42
        this.X -= Math.cos(this.angle) * 5
        this.Y -= Math.sin(this.angle) * 5
    }
}

export class Arm extends Project {
    constructor(canvas, X, Y) {
        super(canvas, X, Y)
        this.image = ArmProject
        this.damage = 2
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 55
    }
}

export class Laser {
    constructor(X, Y) {
        this.image = LaserSheet
        this.spritew = 300
        this.spriteh = 100
        this.width = this.spritew
        this.height = this.spriteh
        this.X = X + 50
        this.Y = Y
        this.damage = 10

        this.frameY = 0
        this.frame = 0

        this.recX = this.X + 50
        this.recY = this.Y + 24
        this.recW = 0
        this.recH = 20
    }
    update(delta) {
        this.frame += delta

        if (this.frame > 100) {
            this.frame = 0
            if (this.frameY > 9) this.recW = 250
            this.frameY > 13 ? this.frameY = 14 : this.frameY++
        }
    }
    draw(ctx) {
        ctx.drawImage(this.image, 0, this.frameY * this.spriteh, this.spritew, this.spriteh, this.X, this.Y, this.width, this.height)
    }
}

/////////////////////CRYSTALMAULER//////////////////////

export class Crystal extends Project {
    constructor(canvas, X, Y, target) {
        super(canvas, X, Y)
        this.image = Crystals
        this.spritew = 288
        this.spriteh = 105
        this.width = this.spritew
        this.height = this.spriteh
        this.X2 = target.recX - this.width
        this.speed = 4

        this.damage = 30

        this.stay = true
        this.maxframe = 5
        this.myframe = 5
        this.frameinterval = 100

        this.recX = this.X + 205
        this.recY = this.Y + 50
        this.recW = this.width - 215
        this.recH = this.height - 50

        setTimeout(_ => this.delete = true, 5000)
    }
    update(delta) {
        super.update(delta)
        if (this.X - 30 > this.X2) {
            this.speed = 0
            this.myframe = 10
            this.maxframe = 10
        }
        this.recX = this.X + 205
        this.recY = this.Y + 50
    }
}

//////////////////////LEAFRANGER////////////////////////

export class Arrow extends Project {
    constructor(X, Y, frame, canvas, target) {
        super(canvas, X, Y)
        this.image = LeafProject
        this.spritew = 256
        this.spriteh = 128
        this.width = this.spritew
        this.height = this.spriteh
        this.Y = Y + 58
        this.Yt = Y
        this.Xt = X

        this.target = target

        this.frameY = frame
        this.X = frame === 7 ? this.target.recX - 200 : X + 80
        this.max = [-1, 4, 6, 6, 0, 0, 0, 8, 3]
        this.maxframe = this.max[this.frameY]

        this.reach = false // If reached target
        this.go = true     // to control shooting after the animation is done
        this.int = 20      // Interval before the start of shooting
        this.speed = 10
        this.damage = 0

        this.delete = false

        this.recX = this.X
        this.recY = this.Y
        this.recW = 35
        this.recH = 5

    }
    update(delta) {
        this.go += 1
        if (this.go > this.int) {
            super.update(delta)

            this.recX = this.X + 110
            this.recY = this.Y + 62

            if (this.recX + this.recW > this.target.X && this.frameY <= 1) { this.damage = 5 }
            else if (this.frameY === 3 || this.frameY === 2) {
                if (this.ColRect(this, this.target)) {
                    this.stay = false
                    this.speed = 0
                    this.maxframe = this.max[this.frameY]
                    this.damage = 7
                    if (this.frameY === 3) this.target.poisoned += 100
                    if (this.frameY === 2) this.target.branched += 100
                    setTimeout(_ => this.delete = true, 600)
                }
                else {
                    this.stay = true
                    this.myframe = 0
                    this.maxframe = 0
                }
            }
            else if (this.frameY === 7) {
                this.height = this.spriteh * 4
                this.width = this.spritew * 2
                this.speed = 0
                this.damage = 50
                this.Y = -(this.canvas.height - (this.target.recY + this.target.recH))

                setTimeout(_ => this.delete = true, 3000)
                this.recX = this.X + 180
                this.recY = this.Y
                this.recW = 180
                this.recH = 530
            }
        }
    }
    draw(ctx) {
        if (this.go > this.int) {
            super.draw(ctx)
            if (this.frameY < 7) {
                ctx.save()
                ctx.fillStyle = "Yellow"
                ctx.fillRect(this.recX, this.recY, this.recW - 10, 2)
                ctx.restore()
            }
        }
    }
}

////////////////////////////////////////////////////////

export class Hand extends Project {
    constructor(canvas, X, Y, boss) {
        super(canvas, X, Y)
        this.image = Smach
        this.spritew = 288
        this.spriteh = 128
        this.width = this.spritew * 2
        this.height = this.spriteh * 2
        this.target = boss
        this.X = this.target.X - 70
        this.Y = this.target.recY - 110
        this.damage = 15

        this.frameinterval = 70
        this.maxframe = 28

        this.speed = 0

        this.recX = this.X + 330
        this.recY = this.Y + 80
        this.recW = 100
        this.recH = 100

        setTimeout(_ => this.delete = true, 2500)
    }
}
export class Bubble extends Project {
    constructor(canvas, X, Y, boss) {
        super(canvas, X, Y)
        this.image = WaterAttack
        this.spritew = 288
        this.spriteh = 128
        this.width = this.spritew * 2
        this.height = this.spriteh * 2
        this.target = boss
        this.X = this.target.recX - (this.target.recW * 0.5) - 245
        this.Y = canvas.height - 260
        this.damage = 10

        this.frameinterval = 70
        this.maxframe = 28

        this.speed = 0

        this.recX = this.X + 245
        this.recY = this.Y + 100
        this.recW = 170
        this.recH = 130

        setTimeout(_ => this.delete = true, 2500)
    }
}

///////////////////////BOSS////////////////////////////
export class ArmBoss extends Project {
    constructor(canvas, X, Y) {
        super(canvas, X, Y)
        this.image = ArmProjectBoss
        this.speed = -7
        this.Y += 10

        this.width = this.spritew * 1.5
        this.height = this.spriteh * 1.5

        this.recY = this.Y + 50

        this.damage = 1
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 5
    }
}

export class GlowArmBoss extends Project {
    constructor(canvas, X, Y, target) {
        super(canvas, X, Y)
        this.target = target
        this.image = ArmGlowBoss
        this.width = this.spritew * 1.5
        this.height = this.spriteh * 1.5
        this.angle = Math.atan2(this.recY - this.target.recY, this.recX - this.target.recX + 15)
        this.speed = 0
        this.maxframe = 4
        this.damage = 2
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 50
        this.recY = this.Y + 70
        this.X -= Math.cos(this.angle) * 5
        this.Y -= Math.sin(this.angle) * 5
    }
}

export class LaserBoss {
    constructor(X, Y) {
        this.image = LaserSheetBoss
        this.spritew = 300
        this.spriteh = 100
        this.width = this.spritew * 1.5
        this.height = this.spriteh * 1.5
        this.X = X - 50 - this.width
        this.Y = Y + 30

        this.frameY = 0
        this.frame = 0

        this.recX = this.X + this.width - 70
        this.recY = this.Y + 30
        this.recW = 0
        this.recH = 40
        this.damage = 3

        this.delete = false
        setTimeout(_ => this.delete = true, 1500)
    }
    update(delta) {
        this.frame += delta

        if (this.frame > 100) {
            this.frame = 0
            if (this.frameY > 9) this.recW = -380
            this.frameY > 13 ? this.frameY = 14 : this.frameY++
        }
    }
    draw(ctx) {
        ctx.drawImage(this.image, 0, this.frameY * this.spriteh, this.spritew, this.spriteh, this.X, this.Y, this.width, this.height)
    }
}

export class CrystalBoss extends Project {
    constructor(canvas, X, Y, target) {
        super(canvas, X, Y + 23)
        this.image = CrystalsBoss
        this.spritew = 288
        this.spriteh = 105
        this.width = this.spritew
        this.height = this.spriteh
        this.target = target
        this.X2 = this.target.recX
        this.speed = -5

        this.stay = true
        this.maxframe = 5
        this.myframe = 5
        this.frameinterval = 100

        this.recX = this.X + 205
        this.recY = this.Y + 50
        this.recW = this.width - 215
        this.recH = this.height - 50

        this.damage = 2

        this.delete = false

    }
    update(delta) {
        super.update(delta)
        if (this.X < this.X2) {
            this.speed = 0
            this.myframe = 10
            this.maxframe = 10
        }
        this.recX = this.X + 30
        this.recY = this.Y + 50
        if (this.frameX >= 11) this.delete = true
    }
}

export class HandBoss extends Project {
    constructor(canvas, X, Y, play) {
        super(canvas, X, Y)
        this.image = SmachBoss
        this.spritew = 288
        this.spriteh = 128
        this.width = this.spritew * 3
        this.height = this.spriteh * 3
        this.target = play
        this.X = this.target.recX - this.width * 0.5 + 150
        this.Y = this.target.recY - this.height + 160

        this.frameinterval = 70
        this.maxframe = 28

        this.speed = 0

        this.recX = this.X + 210
        this.recY = this.Y + 100
        this.recW = 200
        this.recH = 200

        this.damage = 5
        setTimeout(_ => this.delete = true, 2500)
    }
}

export class BubbleBoss extends HandBoss {
    constructor(canvas, X, Y, play) {
        super(canvas, X, Y, play)
        this.image = WaterAttackBoss
        this.X -= 30
        this.Y = this.target.ground - this.height + 50
        this.recW += 50
        this.damage = 5
    }
}

export class ArrowBoss extends Project {
    constructor(X, Y, frame, canvas, target) {
        super(canvas, X, Y)
        this.image = LeafProjectBoss
        this.spritew = 256
        this.spriteh = 128
        this.width = this.spritew * 2
        this.height = this.spriteh * 2
        this.X = X + 80
        this.Y = Y + 65
        this.Yt = Y
        this.Xt = X
        this.damage = 0

        this.frameY = frame
        this.max = [-1, 4, 6, 6, 0, 0, 0, 8, 3]
        this.maxframe = this.max[this.frameY]

        this.reach = false // If reached target
        this.go = true     // to control shooting after the animation is done
        this.int = this.frameY !== 8 ? 20 : 40      // Interval before the start of shooting
        this.speed = -10

        this.delete = false

        this.target = target

        this.recX = this.X + 100
        this.recY = this.Y
        this.recW = 35
        this.recH = 5
    }
    update(delta) {
        this.go += 1
        if (this.go > this.int) {
            super.update(delta)

            this.recX = this.X + 230
            this.recY = this.Y + 125
            if (this.frameY <= 1) { this.damage = 3 }
            else if (this.frameY === 3 || this.frameY === 2) {
                if (this.ColRect(this.target, this)) {
                    this.damage = 4
                    this.speed = 0
                    this.stay = false
                    this.maxframe = this.max[this.frameY]
                    if (this.frameY === 3) this.target.poisoned = true
                    else this.target.branched = true
                    setTimeout(_ => this.delete = true, 600)
                }
                else {
                    this.stay = true
                    this.myframe = 0
                    this.maxframe = 0
                }
            }
            else if (this.frameY === 7) {
                this.height = this.spriteh * 4
                this.speed = 0
                this.X = this.target.recX - this.width * 0.5 + 20
                this.Y = -40
                this.damage = 10

                setTimeout(_ => this.delete = true, 3000)
                this.recX = this.X + 190
                this.recY = this.Y
                this.recW = 150
                this.recH = 530
            }
            else if (this.frameY === 8) {
                this.speed = 0
                this.damage = 5
                this.width = this.Xt
                this.X = 0
                this.Y = this.Yt + 70

                setTimeout(_ => this.delete = true, 500)
                this.recX = 0
                this.recY = this.Y + 110
                this.recW = this.Xt
                this.recH = 30
            }
        }
    }
    draw(ctx) {
        if (this.go > this.int) super.draw(ctx)
    }
}