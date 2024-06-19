import { ArmBoss, GlowArmBoss, LaserBoss, CrystalBoss, HandBoss, BubbleBoss, ArrowBoss } from "./effects.js"

class Boss {
    constructor(canvas, play, n = 0) {
        this.canvas = canvas
        this.player = play
        this.sub = n
        this.input = []
        this.project = []
        this.projectAct = []

        this.spritew = 288
        this.spriteh = 128
        this.width = this.spritew * 2
        this.height = this.spriteh * 2
        this.X = this.canvas.width
        this.Y = canvas.height - 10 - this.height
        this.Lives = 100
        this.maxLives = 100
        this.meditatefraction = 0.1
        this.percent = 2
        this.Power = 40
        this.droll = 1 // control damage of rolls

        // Animation
        this.frameX = 0
        this.frameY = 0
        this.fraemintervale = 150
        this.framecount = 0
        this.stay = false
        this.myframe = 0
        this.one = true   // control if after done return to idle

        // Timing
        this.timer = 800
        this.timetoatt = 2000
        this.start = true

        //control movement
        this.dy = 1
        this.ground = this.canvas.height - 35
        this.speed = 0
        this.spee = 1
        this.speer = 10
        this.move = true
        this.dead = false
        this.end = false
        this.done = true
        this.attack = false
        this.action = -1 // used as index
        this.actions = ["Walk", "Attack", "Defend", "Super"] // normal actions
        this.superactions = ["Attack2", "Roll", "AttackAll"] // Super Actions
        this.act = "" //  the action now
        this.sact = ""
        this.presentframe = true // control if the get hit frame is there
        this.walk = 0 // direction of Walk [L - R]
        this.roll = 0 // direction of Roll [L - R]
        this.walkend = this.canvas.width * 0.5  // border of walk
        this.delay = true // control whether it can select another action

        this.at2 = 5 // price for the 2nd attack
        this.at3 = 15 // price for the 3rd attack
        this.at4 = 20 // price for the 4th attack
        this.atr = 10 // price for the roll
        this.atall = 30 // price for the biggest attack
        this.resis = false
        this.damage = false
        this.d = 0
        this.rolling = false
        this.poisoned = 0
        this.branched = 0

        this.recX = this.X
        this.recY = this.Y

        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = 5
        this.recDH = 5

        this.g = 0
        this.own = true // control selecting actions [random - recodeed]
    }
    update(delta) {
        // Control animation
        this.framecount += delta
        if (this.framecount > this.fraemintervale && this.branched === 0) {
            this.framecount = 0
            if (this.stay) this.frameX >= this.myframe ? this.frameX = this.myframe : this.frameX++
            else {
                if (this.frameX > this.max[this.frameY]) {
                    this.frameX = 0
                    this.one = false
                } else this.frameX++
            }
        }

        if (this.start) {
            this.frameY = this.State["Walk"]
            this.X -= this.spee * 0.5
            if (this.recX + this.recW < this.canvas.width - 3) {
                this.start = false
                this.frameY = this.State["Idle"]
            }
        }
        else {
            this.X += this.speed
            if (this.Lives > 0) {
                if (this.done && this.Lives > 0 && !this.attack && this.branched === 0 && this.own) {
                    this.action = Math.floor(Math.random() * this.actions.length)
                    if (this.actions[this.action] === "Super") this.act = this.superactions[Math.floor(Math.random() * this.superactions.length)]
                    else this.act = this.actions[this.action]
                    this.done = false
                }
                if (this.act === "Walk") this.Walk()
                else if (this.act === "Slide") this.Slide()
                else if ((this.act === "Roll" && this.Power >= this.atr) || this.rolling) this.Roll()
                else if (this.act === "Attack" && !this.attack) this.Attack()
                else if (this.act === "Meditate" && !this.attack) this.Meditate()
                else if (this.act === "Defend") this.Defend()
                else if (this.act === "Attack2" && this.Power >= this.at2 && !this.attack) this.Attack2()
                else if (this.act === "Attack3" && this.Power >= this.at3 && !this.attack) this.Attack3()
                else if (this.act === "Attack4" && this.Power >= this.at4 && !this.attack) this.Attack4()
                else if (this.act === "Attack5" && this.Power >= this.at4 && !this.attack) this.Attack5()
                else if (this.act === "AttackAll" && this.Power >= this.atall && !this.attack) this.AttackAll()
                else if (this.sact === "Hit" && this.presentframe) this.GetHit()
                else if (!this.attack) { this.Idle() }

                if (this.branched > 0) {
                    this.branched -= delta
                } else this.branched = 0
                if (this.poisoned > 0) {
                    this.poisoned -= delta
                    this.Lives -= 0.1
                } else this.poisoned = 0

                this.g += delta
                if (this.g > 3000) {
                    this.g = 0
                    this.Power >= 40 ? this.Power = 40 : this.Power += 5
                }
            }
            else this.Die()
        }
        if (this.Lives < 0) this.Lives = 0

        // Control Boundaries
        if (this.onGround()) this.Y = this.ground - this.height
        else this.Y += this.dy
        if (this.recX < 3) this.X = this.X - this.recX + 5
        if (this.recX + this.recW > this.canvas.width - 3 && !this.start) this.X = this.canvas.width - 5 - this.width + ((this.X + this.width) - (this.recX + this.recW))

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
        ctx.fillRect(this.canvas.width - 53, 7 + (this.sub * 48), 46, 46)
        ctx.drawImage(this.imcard, this.canvas.width - 50, 10 + (this.sub * 48), 40, 40)

        ctx.fillRect(this.canvas.width - 55 - 100 * 2, 15 + (this.sub * 48), 100 * 2, 10)
        ctx.fillRect(this.canvas.width - 55 - 100 * 2, 30 + (this.sub * 48), 100 * 2, 10)

        ctx.save()
        ctx.fillStyle = this.poisoned > 0 ? "Purple" : "rgb(220, 0, 0)"
        ctx.fillRect(this.canvas.width - 55 - this.Lives * this.percent, 15 + (this.sub * 48), this.Lives * this.percent, 10)

        ctx.fillStyle = "rgb(0, 220, 220)"
        ctx.fillRect(this.canvas.width - 55 - this.Power * 5, 30 + (this.sub * 48), this.Power * 5, 10)
        ctx.restore()

        // ctx.strokeRect(this.recX, this.recY, this.recW, this.recH)
        // ctx.strokeRect(this.X, this.Y, this.width, this.height)

        // ctx.save()
        // ctx.strokeStyle = "Blue"
        // ctx.strokeRect(this.recDX, this.recDY, this.recDW, this.recDH)
        // ctx.restore()
    }
    onGround() {
        if (this.Y + this.height >= this.ground) return true
        return false
    }
    Idle() {
        this.act = ""
        this.attack = false
        this.resis = false
        this.damage = false
        this.d = 0
        if (!this.one) {
            this.frameY = this.State["Idle"]
            this.stay = false
            this.fraemintervale = 150
        }
        this.speed = 0
        if (this.delay) setTimeout(_ => { this.done = true; this.delay = true }, this.timetoatt)
        this.delay = false
    }
    Walk() {
        this.stay = false
        if (!this.one) this.frameY = this.State["Walk"]
        if (this.walk === 0) {
            this.speed = -this.spee
            if (this.recX <= this.walkend) {
                this.speed = 0
                this.walk = 1
                this.Idle()
            }
        }
        else {
            this.speed = +this.spee
            if (this.recX + this.recW > this.canvas.width - 5) {
                this.speed = 0
                this.walk = 0
                this.Idle()
            }
        }
    }
    Attacking() {
        this.frameX = 0
        this.attack = true
        this.damage = true
        this.fraemintervale = 70
        this.one = true
        this.stay = false
        setTimeout(_ => { this.attack = false; this.Idle() }, this.timer)
    }
    Attack() {
        this.timer = 1000
        this.Attacking()
        this.frameY = this.State["Attack"]
    }
    Attack2() {
        this.timer = 1200
        this.Attacking()
        this.frameY = this.State["Attack2"]
        this.Power -= this.at2
    }
    Attack3() {
        this.timer = 1500
        this.Attacking()
        this.frameY = this.State["Attack3"]
        this.Power -= this.at3
    }
    Attack4() {
        this.Attacking()
        this.frameY = this.State["Attack4"]
        this.Power -= this.at4
    }
    Attack5() {
        this.Attacking()
        this.frameY = this.State["Attack5"]
        this.Power -= this.at4
    }
    AttackAll() {
        this.Attacking()
        this.frameY = this.State["AttackAll"]
        this.Power -= this.atall
    }
    Defend() {
        if (!this.stay) this.frameX = 0
        this.resis = true
        this.stay = true
        this.one = true
        this.frameY = this.State["Defend"]
        this.myframe = this.max[this.frameY] - 2
        setTimeout(_ => { this.Idle(); this.stay = false }, 2000)
    }
    Roll() {
        this.resis = true
        this.damage = true
        this.rolling = true
        if (!this.attack) {
            this.frameX = 0
            this.attack = true
            this.fraemintervale = 70
            this.one = true
            this.stay = true
            this.frameY = this.State["Roll"]
        }

        if (this.roll === 0) {
            this.speed = -this.speer
            if (this.recX <= this.player.recW) this.roll = 1
        }
        else {
            this.speed = +this.speer
            if (this.recX + this.recW > this.canvas.width - 3) {
                this.speed = 0
                this.roll = 0
                this.rolling = false
                this.Idle()
                this.stay = false
                this.Power -= this.atr
            }
        }
    }
    Die() {
        this.stay = true
        this.one = true
        this.speed = 0
        if (!this.dead) {
            this.frameX = 0
            this.frameY = this.State["Die"]
            this.myframe = this.max[this.frameY] + 1
        }
        this.dead = true
        setTimeout(_ => { this.end = true }, 3000)
    }
    Meditate() {
        if (!this.stay) this.frameX = 0
        this.resis = false
        this.stay = true
        this.one = true
        this.frameY = this.State["Meditate"]
        this.myframe = this.max[this.frameY] - 2
        this.Lives > this.maxLives ? this.Lives = this.maxLives : this.Lives += this.meditatefraction * 2
        setTimeout(_ => { this.Idle(); this.stay = false }, 4000)
    }
    Slide() {
        this.resis = true
        this.damage = true
        this.stay = false
        if (!this.one) this.frameY = this.State["Slide"]
        if (this.walk === 0) {
            this.speed = -this.spees
            if (this.recX <= this.walkend) {
                this.speed = 0
                this.walk = 1
                this.Idle()
            }
        }
        else {
            this.speed = +this.spees
            if (this.recX + this.recW > this.canvas.width - 5) {
                this.speed = 0
                this.walk = 0
                this.Idle()
            }
        }
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

export class StoneGolemBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.image = StoneGolemBossSheet
        this.imcard = StoneGolemCard
        this.spritew = 100
        this.spriteh = 100
        this.width = this.spritew * 1.5
        this.height = this.spriteh * 1.5

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 0,
            Glow: 1,
            Attack: 2,
            Attack2: 2, // Glow Arm
            Roll: 3,
            AttackAll: 5, // Laser
            Defend: 6,
            Die1: 7,
            Die2: 8
        }
        this.max = [2, 6, 7, 6, 5, 5, 8, 8, 2]

        // Collision Detection Rectangle
        this.recW = this.width - 80
        this.recH = this.height - 60

        this.ground = canvas.height + 5

        this.launch = false
        this.launchspeed = 50
        this.presentframe = false
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 40
        this.recY = this.Y + 35
    }
    Idle() {
        super.Idle()
        if (!this.one) this.Power === 40 ? this.frameY = this.State["Glow"] : this.frameY = this.State["Idle"]
    }
    Walk() {
        super.Walk()
        if (!this.one) this.Power === 40 ? this.frameY = this.State["Glow"] : this.frameY = this.State["Idle"]
    }
    Attack() {
        super.Attack()
        setTimeout(_ => this.project.push(new ArmBoss(this.canvas, this.X, this.Y)), 500)
    }
    Attack2() {
        super.Attack2()
        setTimeout(_ => this.project.push(new GlowArmBoss(this.canvas, this.X, this.Y, this.player)), 500)
    }
    AttackAll() {
        this.projectAct.push(new LaserBoss(this.X + 50, this.Y))
        this.timer = 2000
        this.stay = true
        this.myframe = 5
        super.AttackAll()
        setTimeout(_ => {
            this.stay = false
        }, this.timer)
    }
    Defend() {
        super.Defend()
        this.myframe = 6
    }
    Roll() {
        this.stay = true
        this.frameY = this.State["Roll"]
        this.myframe = 7
        if (this.frameX >= this.myframe) super.Roll()
    }
    Die() {
        this.speed = 0
        this.stay = false
        this.one = true
        if (!this.dead) this.frameY = this.State["Die1"]
        this.dead = true
        if (this.frameX > this.max[this.frameY]) {
            if (this.frameY !== this.State["Die2"]) this.frameX = 0
            this.frameY = this.State["Die2"]
            this.stay = true
            this.myframe = this.max[this.frameY]
            setTimeout(_ => { this.end = true }, 3000)
        }
    }
}

export class WindHashashinBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.actions.push("Attack3", "Attack2", "Super", "Super", "Attack2", "Super", "Attack3", "Super")
        this.superactions.push("Attack4", "Attack4", "Attack4")
        this.image = WindHashashinBossSheet
        this.imcard = WindHashashinCard
        this.spee = 3
        this.timetoatt = 2000

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 2,
            Attack3: 4, // AttackX
            Roll: 5,
            Attack: 6,
            Attack2: 7,
            Attack4: 8,
            AttackAll: 9,
            Defend: 10,
            GetHit: 11,
            Die: 12
        }
        this.max = [6, 6, 16, 0, 5, 4, 6, 16, 24, 29, 6, 4, 17]

        // Collision Detection Rectangle
        this.recW = this.width - 535
        this.recH = this.height - 180

        // Collision Detection for damage
        this.recDX = this.recX
        this.recDY = this.recY
        this.recDW = this.recW
        this.recDH = this.recH

        this.walkend = this.player.recW * 1.5
    }
    update(delta) {
        super.update(delta)

        this.recX = this.X + 270
        this.recY = this.Y + 180
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack && this.act !== "Roll") {
            if (this.frameY === this.State["Attack"]) {
                this.recDX = this.recX - 40
                this.recDW = this.recW + 40
            }
            else if (this.frameY === this.State["Attack2"]) {
                this.recDX = this.recX - 80
                this.recDW = this.recW + 80
            }
            else if (this.frameY === this.State["Attack3"] || this.frameY === this.State["Attack4"]) {
                this.recDX = this.recX - 100
                this.recDW = this.recW + 100
                this.recDY = this.recY - 50
                this.recDH = this.recH + 50
            }
            else if (this.frameY === this.State["AttackAll"]) {
                this.recDX = this.recX - 180
                this.recDW = this.recW + 180
                this.recDY = this.recY - 100
                this.recDH = this.recH + 100
            }
        }
    }
    Attack() {
        this.d = 1
        super.Attack()
    }
    Attack2() {
        this.d = 2
        super.Attack2()
    }
    Attack3() {
        this.d = 3
        super.Attack3()
    }
    Attack4() {
        this.d = 4
        this.timer = 2000
        super.Attack4()
    }
    AttackAll() {
        this.d = 5
        this.timer = 2500
        super.AttackAll()
    }
    Roll() {
        super.Roll()
        this.stay = false
    }
}

export class CrystalMaulerBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.image = CrystalMaulerSheetBoss
        this.imcard = CrystalMaulerCard
        this.spritew = 209
        this.spriteh = 128
        this.width = this.spritew * 2
        this.height = this.spriteh * 2
        this.spee = 3
        this.speer = 7
        this.timetoatt = 1000
        this.actions.push("Attack3", "Super", "Super",
            "Attack", "Attack3", "Super", "Super", "Attack3", "Attack2", "Attack2")
        this.superactions.push("Attack4", "Attack4", "AttackAll", "AttackAll")
        this.timetoatt = 2500

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            Jump: 2,
            Fall: 3,
            FullJump: 4,
            Attack: 5,
            Roll: 6,
            Attack2: 7,
            Attack3: 8,
            AttackAll: 9,  // Send Crystal
            Attack4: 10,   // Crystal Wall
            Defend: 11,
            GetHit: 12,     //not
            Die: 13
        }
        this.max = [6, 6, 1, 1, 19, 6, 6, 5, 5, 15, 13, 7, 4, 13]


        this.at2 = 0
        this.at3 = 0

        this.crystal = false

        // Collision Detection Rectangle
        this.recW = this.width - 335
        this.recH = this.height - 180
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 220
        this.recY = this.Y + 180
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack && this.act !== "Roll") {
            if (this.frameY === this.State["Attack"] ||
                this.frameY === this.State["Attack2"] ||
                this.frameY === this.State["Attack3"] ||
                this.frameY === this.State["AttackAll"]
            ) {
                this.recDX -= 50
                this.recDW += 50
                this.recDY -= 50
                this.recDH += 50
            }
            else if (this.frameY === this.State["Attack4"]
            ) {
                this.recDX -= 230
                this.recDW += 230
                this.recDY -= 80
                this.recDH += 80
            }
        }
    }
    Walk() {
        this.walkend = this.player.recX + this.player.recW
        super.Walk()
    }
    Attack() {
        this.d = 3
        super.Attack()
    }
    Attack2() {
        this.d = 4
        super.Attack2()
    }
    Attack3() {
        this.d = 5
        super.Attack3()
    }
    Attack4() {
        this.d = 6
        super.Attack4()
    }
    AttackAll() {
        super.AttackAll()
        setTimeout(_ => { this.crystal = false }, 4000)
        this.project.push(new CrystalBoss(this.canvas, this.X + 180, this.Y + 130, this.player))
        // this.crystal = true
    }
    Defend() {
        super.Defend()
        this.myframe = 3
    }
    Roll() {
        super.Roll()
        this.stay = false
    }
}

export class GroundMonkBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.image = GroundMonkSheetBoss
        this.imcard = GroundMonkCard
        this.ground += 15
        this.Y += 5
        this.spee = 3
        this.actions.push("Attack2", "Attack3", "Meditate", "Super", "Defend",
            "Super", "Attack2", "Meditate", "Defend", "Attack3", "Meditate", "Super", "Defend", "Meditate")
        this.superactions.push("Attack4", "Attack4", "AttackAll", "Roll", "AttackAll", "Attack4", "AttackAll", "Roll")
        this.at2 = 0
        this.at3 = 0
        this.timetoatt = 2000

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 3,
            Attack4: 4,
            Attack: 5,
            Attack2: 6,
            Attack3: 7,
            AttackAll: 8, // Smash
            Meditate: 9,
            Roll: 10,
            Defend: 11,
            GetHit: 12,         // not
            Die: 13
        }
        this.max = [4, 6, 4, 23, 5, 4, 10, 21, 23, 14, 4, 11, 4, 13]

        // Collision Detection Rectangle
        this.recW = this.width - 530
        this.recH = this.height - 170
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 260
        this.recY = this.Y + 170
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack && this.act !== "Roll") {
            if (this.frameY === this.State["Attack"] ||
                this.frameY === this.State["Attack2"] ||
                this.frameY === this.State["Attack4"]
            ) {
                this.recDX -= 50
                this.recDW += 50
            }
            else if (this.frameY === this.State["Attack3"]) {
                this.recDX -= 150
                this.recDW += 150
                this.recDY -= 50
                this.recDH += 50
            }
        }
    }
    Attack() {
        this.d = 1
        super.Attack()
    }
    Attack2() {
        this.d = 2
        super.Attack2()
    }
    Attack3() {
        this.d = 3
        super.Attack3()
    }
    Attack4() {
        this.d = 5
        super.Attack4()
    }
    AttackAll() {
        this.Power -= this.at4
        if (this.player.onGround()) {
            this.timer = 2300
            super.AttackAll()
            this.projectAct.push(new HandBoss(this.canvas, 0, 0, this.player))
        }
    }
    Roll() {
        super.Roll()
        this.stay = false
    }
    Die() {
        super.Die()
        this.myframe += 1
    }
}

export class FireKnightBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.superactions.push("Roll", "Attack4", "AttackAll", "Roll", "Attack4", "AttackAll", "Roll", "Attack4", "AttackAll")
        this.actions.push("Attack", "Attack2", "Attack", "Attack2", "Attack", "Attack2", "Attack3", "Attack2", "Super", "Attack3", "Attack2", "Super", "Attack3", "Attack2", "Super")
        this.image = FireKnightSheetBoss
        this.imcard = FireKnightCard
        this.spee = 5
        this.speer = 10
        this.at2 = 0
        this.at3 = 0
        this.timetoatt = 1500

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 4,
            Attack: 5, // Slice
            Roll: 6,
            Attack2: 7,
            Attack3: 8,
            Attack4: 9,
            AttackAll: 10,
            Defend: 11,
            GetHit: 12,         // not
            Die: 13
        }
        this.max = [6, 6, 0, 0, 18, 6, 6, 9, 17, 26, 16, 8, 4, 11]

        // Collision Detection Rectangle
        this.recW = this.width - 490
        this.recH = this.height - 160
    }
    update(delta) {
        super.update(delta)

        if (this.player.recX > this.recX) this.Walk()

        this.recX = this.X + 260
        this.recY = this.Y + 170
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack && this.act !== "Roll") {
            if (this.frameY === this.State["Attack"]) {
                this.recDX -= 170
                this.recDW += 170
                this.recDY -= 30
                this.recDH += 30
            }
            else if (this.frameY === this.State["Attack2"] ||
                this.frameY === this.State["Attack3"] ||
                this.frameY === this.State["Attack4"]
            ) {
                this.recDX -= 130
                this.recDW += 180
                this.recDY -= 80
                this.recDH += 80
            }
            else if (this.frameY === this.State["AttackAll"]) {
                this.recDX = this.recX - 180
                this.recDW = this.recW + 180
                this.recDY = this.recY - 100
                this.recDH = this.recH + 100
            }
        }
    }
    Attack() {
        this.d = 1
        super.Attack()
    }
    Attack2() {
        this.d = 3
        super.Attack2()
    }
    Attack3() {
        this.d = 5
        super.Attack3()
    }
    Attack4() {
        this.timer = 2000
        this.d = 6
        super.Attack4()
    }
    AttackAll() {
        this.timer = 2500
        this.d = 6
        super.AttackAll()
    }
    Roll() {
        super.Roll()
        this.stay = false
    }
}

export class WaterPriestessBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.image = WaterPriestessSheetBoss
        this.imcard = WaterPriestessCard
        this.Lives = 200
        this.maxLives = 200
        this.percent = 1
        this.spee = 3
        this.spees = 10
        this.meditatefraction = 0.08
        this.actions.push("Defend", "Slide", "Super", "Attack2", "Attack3", "Meditate", "Defend",
            "Defend", "Slide", "Super", "Attack2", "Slide", "Attack3", "Slide", "Meditate", "Defend",
            "Defend", "Super", "Slide", "Attack2", "Attack3", "Meditate", "Defend", "Slide",
        )
        this.superactions.push("Attack4", "Roll", "AttackAll", "Attack4", "Roll", "AttackAll", "Attack4", "Roll", "AttackAll")
        this.at2 = 0
        this.at3 = 0
        this.timetoatt = 1500
        this.droll = 3

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            Slide: 2,
            FullJump: 4,
            Attack4: 5,
            Roll: 6,
            Attack: 7,
            Attack2: 8,
            Attack3: 9,
            AttackAll: 10, // Flood
            Meditate: 11,
            Defend: 12,
            GetHit: 13,     // not
            Die: 14
        }
        this.max = [6, 8, 6, 10, 16, 6, 4, 5, 19, 25, 30, 10, 10, 5, 14]

        // Collision Detection Rectangle
        this.recW = this.width - 520
        this.recH = this.height - 180
    }
    update(delta) {
        super.update(delta)

        this.recX = this.X + 253
        this.recY = this.Y + 180
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack && this.act !== "Roll") {
            if (this.frameY === this.State["Attack"] || this.frameY === this.State["Attack2"] ||
                this.frameY === this.State["Attack3"] || this.frameY === this.State["Attack4"]
            ) {
                this.recDX = this.recX - 100
                this.recDW = this.recW + 100
                this.recDY = this.recY - 50
                this.recDH = this.recH + 50
            }
        }
    }
    Idle() {
        this.act = ""
        this.resis = false
        this.damage = false
        this.d = 0
        this.speed = 0
        this.walkend = Math.random() * this.canvas.width
        if (this.Lives <= 20 && Math.random() > 0.5) this.act = "Meditate"
        else {
            if (!this.one) {
                this.frameY = this.State["Idle"]
                this.stay = false
                this.fraemintervale = 150
            }
            if (this.delay) setTimeout(_ => { this.done = true; this.delay = true }, this.timetoatt)
            this.delay = false
        }
    }
    Attack() {
        this.d = 4
        super.Attack()
    }
    Attack2() {
        this.d = 4
        super.Attack2()
    }
    Attack3() {
        this.d = 6
        super.Attack3()
    }
    Attack4() {
        this.d = 6
        super.Attack4()
    }
    AttackAll() {
        this.timer = 2550
        super.AttackAll()
        this.projectAct.push(new BubbleBoss(this.canvas, 0, 0, this.player))
    }
    Defend() {
        super.Defend()
        this.myframe = 4
    }
    Roll() {
        super.Roll()
        this.stay = false
    }
    Die() {
        super.Die()
        this.myframe = 15
    }
}

export class LeafRangerBoss extends Boss {
    constructor(canvas, play, n) {
        super(canvas, play, n)
        this.ground += 10
        this.image = LeafRangerSheetBoss
        this.imcard = LeafRangerCard
        this.spee = 7
        this.actions = ["Walk", "Attack", "Attack2", "Defend", "Super"] // normal actions
        this.superactions = ["Attack3", "Attack4", "Attack5", "Roll", "AttackAll"] // Super Actions
        this.Lives = 400
        this.maxLives = 400
        this.percent = 0.5
        this.timetoatt = 900

        this.at2 = 0
        this.at3 = 5

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            FullJump: 2,
            Roll: 9,                        //NOT
            Attack: 10,
            Attack2: 11, // Shoot           //NOT
            Attack3: 11, // Shoot Poison    //NOT
            Attack4: 11, // Shoot Branch    //NOT
            AttackAll: 12, // Multishoot    //NOT
            Attack5: 13, // Laser
            Defend: 14,
            GetHit: 15,
            Die: 16,
        }
        this.max = [10, 8, 20, 0, 0, 0, 0, 0, 0, 11, 8, 13, 10, 15, 17, 4, 17]

        // Collision Detection Rectangle
        this.recW = this.width - 500
        this.recH = this.height - 155

        this.own = false
    }
    update(delta) {
        super.update(delta)

        if (this.done && this.Lives > 0 && !this.start) {
            if (this.player.recX < 50 && Math.random() > 0.5) this.act = "Roll"
            else if (this.player.recX > this.recX && this.walk === 1) this.act = "Walk"
            else if (this.player.recX < 50 && this.walk === 0 && Math.random() > 0.8) this.act = "Walk"
            else if (this.player.recX + this.player.recW + 80 > this.recX && Math.random() > 0.99) this.act = "Attack"
            else if (this.player.recX + this.player.recW + 80 > this.recX && Math.random() > 0.95) this.act = "Attack5"
            else if (this.player.recX + this.player.recW + 80 > this.recX && Math.random() > 0.97) this.act = "Defend"
            else if (this.player.branched && this.Power >= this.at3) this.act = "Attack3"
            else {
                if (this.Power >= this.at4 && Math.random() > 0.9) this.act = "Attack4"
                else this.act = "Attack2"
            }
            this.done = false
        }

        this.recX = this.X + 260
        this.recY = this.Y + 160
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            if (this.frameY === this.State["Attack"]) {
                this.recDX = this.recX - 130
                this.recDW = this.recW + 130
            }
            else if (this.frameY === this.State["Attack5"]) {
                this.recDX = this.recX - 260
                this.recDW = this.recW + 260
            }
        }
    }
    Attack() {
        this.d = 5
        super.Attack()
    }
    Attack2() {
        super.Attack2()
        this.project.push(new ArrowBoss(this.X, this.Y, 0, this.canvas, this.player))
    }
    Attack3() {
        super.Attack3()
        this.projectAct.push(new ArrowBoss(this.X, this.Y, 3, this.canvas, this.player))
    }
    Attack4() {
        super.Attack4()
        this.projectAct.push(new ArrowBoss(this.X, this.Y, 2, this.canvas, this.player))
    }
    Attack5() {
        super.Attack5()
        this.projectAct.push(new ArrowBoss(this.recX, this.Y, 8, this.canvas, this.player))
    }
    AttackAll() {
        super.AttackAll()
        this.projectAct.push(new ArrowBoss(this.X, this.Y, 7, this.canvas, this.player))
    }
    Defend() {
        super.Defend()
        this.myframe = 10
    }
    Roll() {
        super.Roll()
        this.myframe = 8
    }
}

export class FrostGuardian extends Boss {
    constructor(canvas, play) {
        super(canvas, play)
        this.image = FrostGuardianSheet
        this.imcard = FrostGuardianCard
        this.spritew = 192
        this.spriteh = 128

        this.Lives = 1000
        this.maxLives = 1000
        this.percent = 0.2

        this.actions = ["Attack", "Walk", "Attack", "Attack"]

        // Control Animation
        this.State = {
            Idle: 0,
            Walk: 1,
            Attack: 2,
            GetHit: 3,
            Die: 4,
        }
        this.max = [4, 8, 12, 5, 14]

        // Collision Detection Rectangle
        this.recW = this.width - 420
        this.recH = this.height - 100

        this.first = true
        this.second = true
        this.third = true
        this.fourth = true
        this.fifth = true
        this.sixth = true

        this.walkend = this.canvas.width * 0.3

        this.spee = 3

        this.spawn = []
        this.nomore = true
    }
    update(delta) {
        super.update(delta)
        this.recX = this.X + 230
        this.recY = this.Y + 70
        this.recDX = this.recX + 5
        this.recDY = this.recY + 5
        this.recDW = this.recW - 10
        this.recDH = this.recH - 10
        if (this.attack) {
            this.recDX -= 230
            this.recDW += 230
        }

        if (this.nomore) {
            if (this.Lives <= 800 && this.first) { this.spawn = ["Stone"]; this.first = false }
            else if (this.Lives <= 600 && this.second) { this.spawn = ["Stone", "Wind"]; this.second = false }
            else if (this.Lives <= 400 && this.third) { this.spawn = ["Stone", "Wind", "Crystal"]; this.third = false }
            if (this.Lives <= 200 && this.fourth) { this.spawn = ["Stone", "Fire", "Stone"]; this.fourth = false }
            if (this.Lives <= 100 && this.fifth) { this.spawn = ["Stone", "Water", "Stone"]; this.fifth = false }
            if (this.Lives <= 30 && this.sixth) { this.spawn = ["Stone", "Water", "Fire", "Stone"]; this.sixth = false }
        }
    }
    Attack() {
        super.Attack()
        this.d = 7
    }
}