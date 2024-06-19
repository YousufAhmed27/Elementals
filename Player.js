import { Arm, GlowArm, Laser, Arrow, Crystal, Hand, Bubble } from "./effects.js"

class Player {
    constructor(canvas, input) {
        this.canvas = canvas
        this.input = input
        this.spritew = 288
        this.spriteh = 128
        this.width = this.spritew * 1.3
        this.height = this.spriteh * 1.3
        this.X = -209
        this.Y = canvas.height - 10 - this.height
        this.Lives = 10
        this.percent = 20
        this.Power = 0
        this.boundary = true
        this.resis = false // control the ability of taking damage
        this.damage = false  // control the ability of dealing damage

        // Control Animation
        this.frameX = 0
        this.frameY = 0
        this.fraemintervale = 150
        this.framecount = 0
        this.stay = false // control if freeze at end
        this.myframe = 0
        this.one = true   // control if after done return to idle
        this.sact = ""
        this.framePresent = true

        // Control Projectile
        this.project = []
        this.projectAct = []

        // Boundary
        this.ground = canvas.height - 10

        // Timing
        this.timer = 600
        this.start = true

        //control movement
        this.dy = 0 // control the moving up and down in jump
        this.weight = 0 // to reduce the dy value
        this.speed = 0
        this.spee = 4
        this.speeroll = 5
        this.attack = false
        this.d = 0
        this.move = true
        this.dead = false
        this.poisoned = false
        this.poisonfraction = 0.01
        this.branched = false

        this.boss = ""

        // collision
        this.recX = 0
        this.recY = 0
        this.g = 0
    }
    update(delta) {
        this.framecount += delta
        if (this.framecount > this.fraemintervale) {
            this.framecount = 0
            if (this.stay) this.frameX >= this.myframe ? this.frameX = this.myframe : this.frameX++
            else if (!this.stay) {
                if (this.frameX > this.max[this.frameY]) {
                    this.frameX = 0
                    this.one = false
                } else this.frameX++
            }
        }

        if (this.start) {
            this.frameY = this.State["Walk"]
            this.X += 2
            if (this.recX - 50 > 0) {
                this.start = false
                this.frameY = this.State["Idle"]
            }
        }
        else {
            this.dy -= this.weight
            this.Y -= this.dy
            this.X += this.speed

            if (this.onGround()) {
                this.Y = this.ground - this.height
                this.dy = 0
                this.weight = 0
            }
            if (this.Lives > 0) {

                if (this.move) {
                    if (this.input.includes("ArrowRight")) this.Right()
                    else if (this.input.includes("ArrowLeft")) this.Left()
                    else if (this.input.includes("ArrowDown")) this.Defence()
                    else this.Idle()

                    if (this.input.includes("ArrowUp") && this.onGround()) this.Jump()

                    if (this.input.includes("x") && !this.attack) this.Attack()
                    else if (this.sact === "Hit" && !this.attack && this.framePresent) this.GetHit()
                }

                if (this.boundary) {
                    if (this.recX < 3) this.X = this.X - this.recX + 5
                    if (this.recX + this.recW > this.canvas.width - 5) this.X = this.canvas.width - this.recW - 190
                }
            }
            else {
                this.Die()
                this.speed = 0
            }
        }

        this.g += delta
        if (this.g > 1000) {
            this.g = 0
            this.Power += 0.5
        }

        if (this.poisoned) this.Poison()
        if (this.branched) this.Branch()
        if (this.Lives < 0) this.Lives = 0
        if (this.Power < 0) this.Power = 0
        if (this.Power > 40) this.Power = 40

        this.project.forEach(e => e.update(delta))
        this.project = this.project.filter(e => !e.delete)
        this.projectAct.forEach(e => e.update(delta))
        this.projectAct = this.projectAct.filter(e => !e.delete)
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.frameX * this.spritew, this.frameY * this.spriteh, this.spritew, this.spriteh,
            this.X, this.Y, this.width, this.height
        )

        // Card and Health
        ctx.fillRect(7, 7, 46, 46)
        ctx.drawImage(this.imcard, 10, 10, 40, 40)

        ctx.save()

        ctx.fillStyle = "rgb(0, 0, 0)"
        ctx.fillRect(55, 15, 10 * 20, 10)
        ctx.fillRect(55, 30, 10 * 20, 10)
        ctx.fillStyle = this.poisoned ? "Purple" : "rgb(220, 0, 0)"
        ctx.fillRect(55, 15, this.Lives * this.percent, 10)

        ctx.fillStyle = "rgb(0, 220, 220)"
        ctx.fillRect(55, 30, this.Power * 5, 10)
        ctx.fillStyle = "rgb(0, 220, 220)"
        ctx.fillRect(55, 30, this.Power * 5, 10)

        if (this.branched) {
            ctx.strokeStyle = "rgb(255, 150, 0)"
            ctx.strokeRect(this.recX - 10, this.recY - 10, this.recW + 20, this.recH + 20)
        }

        ctx.restore()

        // ctx.strokeRect(this.recX, this.recY, this.recW, this.recH)
        // ctx.save()
        // ctx.strokeStyle = "green"
        // ctx.strokeRect(this.recDX, this.recDY, this.recDW, this.recDH)
        // ctx.restore()
        // ctx.fillRect(0, this.ground, 20, 5)
        // ctx.strokeRect(this.X, this.Y, this.width, this.height)
    }
    onGround() {
        if (this.Y + this.height >= this.ground) return true
        return false
    }
    Jump() {
        this.stay = false
        this.one = true
        this.frameY = this.State["FullJump"]
        this.frameX = 0
        this.fraemintervale = 35
        this.dy = 20
        this.weight = 0.8
        this.resis = false
        this.damage = false
    }
    Idle() {
        if (!this.one) {
            this.frameY = this.State["Idle"]
            this.stay = false
            this.fraemintervale = 150
        }
        this.speed = 0
        this.resis = false
        this.damage = false
        this.d = 0
    }
    Right() {
        this.stay = false
        if (!this.one) this.frameY = this.State["Walk"]
        this.speed = this.spee
        this.resis = false
        this.damage = false
    }
    Left() {
        this.stay = false
        if (!this.one) this.frameY = this.State["Walk"]
        this.speed = -this.spee
        this.resis = false
        this.damage = false
    }
    Defence() {
        this.resis = true
        this.damage = false
        if (this.move) {
            this.frameX = 0
            this.frameY = this.State["Defend"]
            setTimeout(_ => { this.move = true; this.stay = false }, 3000)
        }
        this.move = false
        this.speed = 0
        this.stay = true
        this.myframe = 7
        this.one = true
    }
    Attacking() {
        if (!this.attack) {
            this.frameX = 0
            setTimeout(_ => { this.attack = false; this.move = true }, this.timer)
        }
        this.speed = 0
        this.fraemintervale = 70
        this.attack = true
        this.move = false
        this.one = true
        this.stay = false
        this.resis = false
        this.damage = true
    }
    Attack() {
        this.timer = 600
        this.Attacking()
        this.frameY = this.State["Attack"]
        this.resis = false
    }
    Die() {
        this.stay = true
        this.one = true
        if (!this.dead) {
            this.frameX = 0
            this.frameY = this.State["Die"]
            this.myframe = 11
        }
        this.dead = true
    }
    Roll() {
        this.resis = true
        this.damage = true
        this.fraemintervale = 50
        if (this.move) {
            this.frameX = 0
            this.frameY = this.State["Roll"]
            setTimeout(_ => { this.move = true; }, 800)
        }
        this.speed = this.speeroll
        this.move = false
        this.stay = false
        this.one = true
    }
    Poison() {
        this.Lives -= this.poisonfraction
        setTimeout(_ => { this.poisoned = false }, 4000)
    }
    Branch() {
        this.frameY = this.State["Idle"]
        this.frameX = 0
        this.move = false
        this.speed = 0
        setTimeout(_ => { this.branched = false; this.move = true }, 4000)
    }
    GetHit() {
        this.frameX = 0
        this.attack = false
        this.damage = false
        this.fraemintervale = 70
        this.one = true
        this.stay = false
        this.frameY = this.State["GetHit"]
        this.sact = ""
    }
}

export class StoneGolem extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = StoneGolemSheet
        this.imcard = StoneGolemCard
        this.spritew = 100
        this.spriteh = 100
        this.width = this.spritew
        this.height = this.spriteh
        this.Y = canvas.height - 5 - this.height
        this.ground = canvas.height - 5
        this.boundary = false
        this.spee = 2
        this.speeroll = 20
        this.framePresent = false

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 0,
            FullJump: 0,
            Glow: 1,
            Attack: 2,
            Launch: 3,
            Throw2: 4,
            Laser: 5,
            Defend: 6, // need more visual
            Die1: 7,
            Die2: 8
        }
        this.max = [2, 6, 7, 6, 5, 5, 8, 8, 2]

        this.done = true
        this.launch = false
        this.launchspeed = 50
        this.laser = false
        this.shooting = new Laser(this.X, this.Y)

        // Collision Detection Rectangle
        this.recX = this.X + 25
        this.recY = this.Y + 25
        this.recW = 47
        this.recH = 45
    }
    update(delta) {
        super.update(delta)

        if ((this.input.includes("c") && this.Lives > 0 && this.Power >= 40 && !this.attack) || this.launch) this.Launch()
        if (this.Lives > 0 && !this.start && !this.attack) {
            if (this.input.includes("v") && this.frameY !== this.State["Laser"] && this.Power >= 20 && this.speed === 0) this.Laser()
            else if (this.input.includes("z") && this.frameY !== this.State["Throw"] && this.Power >= 10) this.ShootSuper()

            if (this.recX + this.recW > this.canvas.width) this.X = this.canvas.width - this.recW - 25
            if (this.recX - 3 < 0) this.X = -21
        }
        this.project.forEach(e => e.update(delta))
        this.project = this.project.filter(e => !e.delete)

        if (this.laser) this.shooting.update(delta)

        this.recX = this.X + 25
        this.recY = this.Y + 25
    }
    draw(ctx) {
        super.draw(ctx)

        this.project.forEach(e => e.draw(ctx))
        if (this.laser) { this.shooting.draw(ctx) }
    }
    Jump() {
        super.Jump()
        this.dy = 35
        this.weight = 5
    }
    Idle() {
        super.Idle()
        if (!this.one) this.Power === 40 ? this.frameY = this.State["Glow"] : this.frameY = this.State["Idle"]
    }
    Right() {
        super.Right()
        if (!this.one) this.Power === 40 ? this.frameY = this.State["Glow"] : this.frameY = this.State["Idle"]
    }
    Left() {
        super.Left()
        if (!this.one) this.Power === 40 ? this.frameY = this.State["Glow"] : this.frameY = this.State["Idle"]
    }
    Defende() {
        super.Defend()
        this.myframe = 6
    }
    Attack() {
        super.Attack()
        setTimeout(_ => this.project.push(new Arm(this.canvas, this.X, this.Y)), 500)
    }
    Die() {
        if (this.recX < 0) this.X = -30
        this.stay = false
        this.one = true
        if (!this.dead) this.frameY = this.State["Die1"]
        this.dead = true
        if (this.frameX > this.max[this.frameY]) {
            if (this.frameY !== this.State["Die2"]) this.frameX = 0
            this.frameY = this.State["Die2"]
            this.stay = true
            this.myframe = this.max[this.frameY]
        }
    }
    ShootSuper() {
        super.Attack()
        setTimeout(_ => this.project.push(new GlowArm(this.canvas, this.X, this.Y, this.boss)), 500)
        this.Power -= 10
    }
    Launch() {
        this.resis = true
        this.damage = true
        if (!this.launch) this.frameX = 0
        this.launch = true
        this.stay = true
        this.myframe = 7
        this.one = true
        this.frameY = this.State["Launch"]
        if (this.frameX >= this.max[this.frameY]) {
            this.X += this.launchspeed
            if (this.X < 0 || this.X + this.width > this.canvas.width) this.launchspeed *= -1
        }
        if (!this.attack) {
            this.Power -= 40
            setTimeout(_ => {
                this.launch = false
                this.stay = false
                this.attack = false
                this.move = true
            }, 3000)
        }
        this.move = false
        this.attack = true
    }
    Laser() {
        this.frameX = 0
        this.frameY = this.State["Laser"]
        this.stay = true
        this.myframe = 5
        this.Power -= 20
        this.move = false
        this.laser = true
        this.shooting = new Laser(this.X + 50, this.Y)
        this.one = true
        this.attack = true
        setTimeout(_ => {
            this.laser = false
            this.move = true
            this.stay = false
            this.attack = false
        }, 1500)
    }
}

export class WindHashashin extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = WindHashashinSheet
        this.imcard = WindHashashinCard
        this.speeroll = 5

        this.ground -= 25
        this.Y = this.ground - this.height

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 2,
            AttackX: 4,
            Roll: 5,
            Attack: 6,
            Attack2: 7,
            Attackalot: 8,
            Defend: 10,
            GetHit: 11,
            Die: 12
        }
        this.max = [6, 6, 16, 0, 5, 4, 6, 16, 24, 29, 6, 4, 17]

        // Collision Detection Rectangle
        this.recX = this.X + 72
        this.recY = this.Y + 108
        this.recW = this.width - 340
        this.recH = this.height - 108

        // Collision Detection Damage
        this.recDX = this.recX
        this.recDY = this.recY
        this.recDW = this.recW
        this.recDH = this.recH
    }
    update(delta) {
        super.update(delta)
        if (!this.attack && this.move && this.Lives > 0 && !this.Start) {
            if (this.input.includes("z")) this.Slice()
            else if (this.input.includes("c") && this.Power >= 20) this.Alot()
            else if (this.input.includes("v") && this.Power >= 40) this.AttX()
            else if (this.input.includes("f") && this.Power >= 10 && this.move && this.onGround()) this.Roll()
        }
        this.recX = this.X + 172
        this.recY = this.Y + 108
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack"]) this.recDW = this.recW + 30
            else if (this.frameY === this.State["Attack2"]) this.recDW = this.recW + 50
            else if (this.frameY === this.State["AttackX"]) {
                this.recDW = this.recW + 50
                this.recDY = this.recY - 30
                this.recDH = this.recH + 30
            }
            else if (this.frameY === this.State["Attackalot"]) {
                this.recDW = this.recW + 100
                this.recDY = this.recY - 30
                this.recDH = this.recH + 30
            }
        }
    }
    Defence() {
        super.Defence()
        this.myframe = 4
    }
    Attack() {
        super.Attack()
        this.d = 7
    }
    Slice() {
        this.d = 10
        this.timer = 1200
        this.Attacking()
        this.frameY = this.State["Attack2"]
    }
    AttX() {
        this.timer = 1200
        this.Attacking()
        this.frameY = this.State["AttackX"]
        this.Power -= 40
        this.d = 30
    }
    Alot() {
        this.timer = 1200
        this.d = 15
        this.Attacking()
        this.frameY = this.State["Attackalot"]
        this.Power -= 20
    }
    Roll() {
        super.Roll()
        this.Power -= 10
    }
    Die() {
        super.Die()
        this.myframe = 18
    }
}

export class CrystalMauler extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = CrystalMaulerSheet
        this.imcard = CrystalMaulerCard
        this.spritew = 209
        this.spriteh = 128
        this.width = this.spritew * 1.7
        this.height = this.spriteh * 1.7
        this.Y -= 72
        this.ground -= 27
        this.Lives = 15
        this.percent = 40 / 3
        this.spee = 3
        this.speeroll = 7

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            Jump: 2,
            Fall: 3,
            FullJump: 4,
            Attack1: 5,
            Roll: 6,
            Attack2: 7,
            Attack3: 8,
            Crystal1: 9,
            Crystal2: 10,
            Defend: 11,
            GetHit: 12,     //not
            Die: 13
        }
        this.max = [6, 6, 1, 1, 19, 6, 6, 5, 5, 15, 13, 7, 4, 13]
        this.att = [this.State["Attack1"], this.State["Attack2"], this.State["Attack3"]]

        // Collision Detection Rectangle
        this.recW = this.width - 310
        this.recH = this.height - 150
        this.recDX = 0
        this.recDY = 0
        this.recDW = 0
        this.recDH = 0
    }
    update(delta) {
        super.update(delta)

        if (this.onGround() && !this.start && this.Lives > 0) {
            if (this.input.includes("c") && this.frameY !== this.State["Crystal2"] && this.Power === 40 && !this.crystal) this.CrystalBig()
            else if (this.input.includes("z") && this.Power >= 30 && !this.crystal && this.frameY !== this.State["Crystal2"]) this.CrystalSmall()
            else if (this.input.includes("v") && this.frameY !== this.State["Roll"] && this.Power >= 20) this.Roll()
        }
        this.recX = this.X + 100
        this.recY = this.Y + 155
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack1"] ||
                this.frameY === this.State["Attack2"] ||
                this.frameY === this.State["Attack3"]
            ) {
                this.recDW += 50
                this.recDY -= 30
                this.recDH += 30
            }
            else if (this.frameY === this.State["Crystal2"]) {
                this.recDW += 200
                this.recDY -= 100
                this.recDH += 100
            }
        }
    }
    Defence() {
        super.Defence()
        this.myframe = 3
    }
    Attack() {
        super.Attacking()
        this.d = 10
        this.frameY = this.att[Math.floor(Math.random() * this.att.length)]
    }
    Die() {
        super.Die()
        this.myframe = 14
    }
    CrystalSmall() {
        this.one = true
        this.stay = false
        this.fraemintervale = 50
        if (this.move) {
            this.Power -= 30
            this.frameX = 0
            setTimeout(_ => { this.move = true }, 500)
        }
        this.projectAct.push(new Crystal(this.canvas, this.X - 80, this.recY - 40, this.boss))
        this.move = false
        this.frameY = this.State["Crystal1"]
    }
    CrystalBig() {
        this.one = true
        this.stay = false
        this.fraemintervale = 50
        this.speed = 0
        this.attack = true
        if (this.move) {
            this.Power -= 40
            this.frameX = 0
            setTimeout(_ => { this.move = true; this.attack = false }, 2000)
        }
        this.move = false
        this.frameY = this.State["Crystal2"]
        this.d = 20
    }
    Roll() {
        super.Roll()
        this.Power -= 20
    }
}

export class GroundMonk extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = GroundMonkSheet
        this.imcard = GroundMonkCard
        this.ground -= 20
        this.Y -= 10
        this.Lives = 40
        this.percent = 5

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 3,
            Attack: 5,
            AttackDouble: 6,
            AttackAlot: 7,      // not
            Smash: 8,           // not
            Roll: 10,
            Defend: 11,
            GetHit: 12,         // not
            Die: 13
        }
        this.max = [4, 6, 4, 23, 5, 4, 10, 21, 23, 14, 4, 11, 4, 13]

        // Collision Detection Rectangle
        this.recX = this.X + 180
        this.recY = this.Y + 110
        this.recW = this.width - 360
        this.recH = this.height - 120
    }
    update(delta) {
        super.update(delta)
        if (!this.attack && this.move && this.Lives > 0 && !this.Start) {
            if (this.input.includes("z")) this.Attack2()
            else if (this.input.includes("c") && this.Power >= 40 && !this.smach && this.onGround()) this.Hand()
            else if (this.input.includes("v") && this.Power >= 20 && this.onGround()) this.Storming()
            else if (this.input.includes("f") && this.Power >= 10 && this.move && this.onGround()) this.Roll()
        }
        this.recX = this.X + 180
        this.recY = this.Y + 110
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack"] || this.frameY === this.State["AttackDouble"]) {
                this.recDW += 50
            }
            else if (this.frameY === this.State["AttackAlot"]) {
                this.recDW += 130
            }
        }

    }
    Jump() {
        super.Jump()
        this.fraemintervale = 17
    }
    Attack() {
        this.timer = 400
        super.Attacking()
        this.frameY = this.State["Attack"]
        this.d = 5
    }
    Attack2() {
        this.timer = 700
        super.Attacking()
        this.frameY = this.State["AttackDouble"]
        this.d = 7
    }
    Storming() {
        this.timer = 1700
        super.Attacking()
        this.frameY = this.State["AttackAlot"]
        this.Power -= 20
        this.d = 20
    }
    Die() {
        super.Die()
        this.myframe = 16
    }
    Roll() {
        super.Roll()
        this.Power -= 10
    }
    Hand() {
        this.timer = 2300
        super.Attacking()
        this.frameY = this.State["Smash"]
        this.projectAct.push(new Hand(this.canvas, 0, 0, this.boss))
        this.Power -= 40
    }

}

export class FireKnight extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = FireKnightSheet
        this.imcard = FireKnightCard
        this.Lives = 60
        this.percent = 10 / 3
        this.speeroll = 10
        this.ground -= 65
        this.Y -= 60

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 4,
            Slice: 5,
            Roll: 6,
            Attack: 7,
            SmashRoll: 8,
            FireSword: 10,
            Defend: 11,
            GetHit: 12,         // not
            Die: 13
        }
        this.max = [6, 6, 0, 0, 18, 6, 6, 9, 17, 26, 16, 8, 4, 11]

        // Collision Detection Rectangle
        this.recW = this.width - 340
        this.recH = this.height - 108
    }
    update(delta) {
        super.update(delta)
        if (!this.attack && this.move && this.Lives > 0 && !this.Start) {
            if (this.input.includes("z")) this.Spin()
            else if (this.input.includes("c") && this.Power >= 20) this.Smasher()
            else if (this.input.includes("v") && this.Power >= 40) this.Sword()
            else if (this.input.includes("f") && this.Power >= 10 && this.move && this.onGround()) this.Roll()
        }
        this.recX = this.X + 172
        this.recY = this.Y + 108
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack"]) {
                this.recDW += 70
                this.recDY -= 30
                this.recDH += 30
            }
            else if (this.frameY === this.State["Slice"]) {
                this.recDW += 100
                this.recDY -= 30
                this.recDH += 30
            }
            else if (this.frameY === this.State["SmashRoll"]) {
                this.recDW += 100
                this.recDY -= 30
                this.recDH += 30
            }
            else if (this.frameY === this.State["FireSword"]) {
                this.recDW += 100
                this.recDY -= 100
                this.recDH += 100
            }
        }
    }
    Attack() {
        super.Attack()
        this.d = 10
    }
    Spin() {
        this.timer = 600
        this.Attacking()
        this.frameY = this.State["Slice"]
        this.d = 10
    }
    Smasher() {
        this.timer = 1000
        this.Attacking()
        this.frameY = this.State["SmashRoll"]
        this.Power -= 20
        this.d = 15
    }
    Sword() {
        this.timer = 1000
        this.Attacking()
        this.frameY = this.State["FireSword"]
        this.Power -= 40
        this.d = 30
    }
    Roll() {
        super.Roll()
        this.Power -= 10
    }
}

export class WaterPriestess extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = WaterPriestessSheet
        this.imcard = WaterPriestessCard
        this.Lives = 80
        this.percent = 2.5
        this.ground -= 35
        this.Y -= 30
        this.spee = 2

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 4,
            Roll: 6,
            Attack: 7,
            Attack2: 8,
            Attackalot: 9,
            Flood: 10,
            Defend: 12,
            GetHit: 13,     // not
            Die: 14
        }
        this.max = [6, 8, 6, 10, 16, 6, 4, 5, 19, 25, 5, 10, 10, 5, 14]

        // Collision Detection Rectangle
        this.recW = this.width - 360
        this.recH = this.height - 120
    }
    update(delta) {
        super.update(delta)
        if (!this.attack && this.move && this.Lives > 0 && !this.Start) {
            if (this.input.includes("z")) this.Attack2()
            else if (this.input.includes("c") && this.Power >= 40 && !this.smach && this.onGround()) this.Hand()
            else if (this.input.includes("v") && this.Power >= 20 && this.onGround()) this.Flooding()
            else if (this.input.includes("f") && this.Power >= 10 && this.move && this.onGround()) this.Roll()
        }
        this.recX = this.X + 180
        this.recY = this.Y + 110
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack"]) {
                this.recDW += 80
            }
            else if (this.frameY === this.State["Attack2"]) {
                this.recDW += 70
                this.recDY -= 20
                this.recDH += 20
            }
            else if (this.frameY === this.State["AttackAlot"]) {
                this.recDW += 100
                this.recDY -= 30
                this.recDH += 30
            }
        }
    }
    Jump() {
        super.Jump()
        this.fraemintervale = 40
    }
    Defence() {
        super.Defence()
        this.myframe = 4
    }
    Attack() {
        this.timer = 400
        this.d = 7
        super.Attacking()
        this.frameY = this.State["Attack"]
    }
    Attack2() {
        this.d = 10
        this.timer = 1000
        super.Attacking()
        this.frameY = this.State["Attack2"]
    }
    Flooding() {
        this.timer = 2000
        this.d = 20
        super.Attacking()
        this.frameY = this.State["Attackalot"]
        this.Power -= 20
    }
    Die() {
        super.Die()
        this.myframe = 15
    }
    Roll() {
        super.Roll()
        this.Power -= 10
    }
    Hand() {
        this.timer = 2300
        super.Attacking()
        this.frameY = this.State["Flood"]
        this.projectAct.push(new Bubble(this.canvas, 0, 0, this.boss))
        this.Power -= 40
    }
}

export class LeafRanger extends Player {
    constructor(canvas, input) {
        super(canvas, input)
        this.image = LeafRangerSheet
        this.imcard = LeafRangerCard
        this.Lives = 80
        this.percent = 2.5
        this.ground -= 70
        this.Y -= 70

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 2,
            Roll: 9,
            Attack: 10,
            Shoot: 11,
            Multishoot: 12,
            Defend: 14,
            GetHit: 15,     //not
            Die: 16,
        }
        this.max = [10, 8, 20, 0, 0, 0, 0, 0, 0, 11, 8, 13, 10, 0, 17, 4, 17]

        // Collision Detection Rectangle
        this.recX = this.X + 72
        this.recY = this.Y + 118
        this.recW = this.width - 350
        this.recH = this.height - 108
    }
    update(delta) {
        super.update(delta)

        if (!this.attack && this.move && this.Lives > 0 && !this.Start) {
            if (this.input.includes("z")) this.Shoot()
            else if (this.input.includes("c") && this.Power >= 10) this.Poison()
            else if (this.input.includes("v") && this.Power >= 20) this.Branch()
            else if (this.input.includes("d") && this.Power >= 40) this.Shower()
            else if (this.input.includes("f") && this.Power >= 30 && this.onGround()) this.Slide()
        }

        this.recX = this.X + 172
        this.recY = this.Y + 108
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack"]) {
                this.recDW += 100
                this.d = 20
            }
        }
    }
    Jump() {
        super.Jump()
        this.dy = 28
        this.weight = 1.1
    }
    Defence() {
        super.Defence()
        this.myframe = 10
    }
    Shoot() {
        this.ArrowShoot()
        this.project.push(new Arrow(this.X, this.Y, 0, this.canvas, this.boss))
    }
    Poison() {
        this.ArrowShoot()
        this.projectAct.push(new Arrow(this.X, this.Y, 2, this.canvas, this.boss))
        this.Power -= 10
    }
    Branch() {
        this.ArrowShoot()
        this.projectAct.push(new Arrow(this.X, this.Y, 3, this.canvas, this.boss))
        this.Power -= 20
    }
    Shower() {
        this.ArrowShoot()
        this.frameY = this.State["Multishoot"]
        this.projectAct.push(new Arrow(this.X, this.Y, 7, this.canvas, this.boss))
        this.Power -= 40
    }
    ArrowShoot() {
        if (!this.attack) {
            this.frameX = 0
            setTimeout(_ => { this.attack = false; this.move = true }, 900)
        }
        this.speed = 0
        this.fraemintervale = 50
        this.attack = true
        this.move = false
        this.one = true
        this.stay = false
        this.frameY = this.State["Shoot"]
    }
    Die() {
        super.Die()
        this.myframe = 18
    }
    Slide() {
        super.Roll()
        this.Power -= 30
    }
}