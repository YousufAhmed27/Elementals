import {
    StoneGolemBoss, WindHashashinBoss, CrystalMaulerBoss,
    GroundMonkBoss, FireKnightBoss, WaterPriestessBoss,
    LeafRangerBoss, FrostGuardian
} from "./boss.js";

import {
    FireKnight, LeafRanger, CrystalMauler, StoneGolem,
    GroundMonk, WaterPriestess, WindHashashin
} from "./Player.js";


function ColRect(X, X2) {
    if (X.recX + X.recW > X2.recX &&
        X.recX < X2.recX + X2.recW &&
        X.recY + X.recH > X2.recY &&
        X.recY < X2.recY + X2.recH
    ) return true
    else return false
}
function ColRectD(X, XD2) {
    if (X.recX + X.recW > XD2.recDX &&
        X.recX < XD2.recDX + XD2.recDW &&
        X.recY + X.recH > XD2.recDY &&
        X.recY < XD2.recDY + XD2.recDH
    ) return true
    else return false
}

class Level {
    constructor(play, canvas) {
        this.canvas = canvas
        this.player = play
        this.gameover = false
        this.win = false
        this.dam = true // Control if the player takes damage {because resis property resets to false in idle state}
        this.damb = true // Control if the boss takes damage
        this.delay = true // control switching to bosses
    }
    update(delta) {
        this.player.update(delta)

        this.boss.forEach(e => e.update(delta))
        this.boss.forEach(e => {
            e.project.forEach(x => {
                if (ColRect(x, this.player)) {
                    x.delete = true
                    if (!this.player.resis && this.dam) {
                        this.player.Lives -= x.damage
                        this.player.sact = "Hit"
                        this.player.Power += 3
                        this.dam = false
                        setTimeout(_ => this.dam = true, 1000)
                    }
                }

                this.player.project.forEach(n => {
                    if (ColRect(x, n)) {
                        n.delete = true
                        x.delete = true
                    }
                })
                this.player.projectAct.forEach(n => {
                    if (ColRect(x, n)) {
                        n.delete = true
                        x.delete = true
                    }
                })
            })

            e.projectAct.forEach(x => {
                if (ColRect(x, this.player)) {
                    if (!this.player.resis && this.dam) {
                        this.player.Lives -= x.damage
                        this.player.sact = "Hit"
                        this.player.Power += 3
                        this.dam = false
                        setTimeout(_ => this.dam = true, 3000)
                    }
                }
            })

            this.player.project.forEach(n => {
                if (ColRect(n, e)) {
                    n.delete = true
                    e.sact = "Hit"
                    if (!e.resis) e.Lives -= n.damage
                    this.player.Power += 5
                }
            })

            this.player.projectAct.forEach(n => {
                if (ColRect(n, e) && this.damb && !e.resis) {
                    e.sact = "Hit"
                    e.Lives -= n.damage
                    this.player.Power += 5
                    this.damb = false
                    setTimeout(_ => this.damb = true, 2000)
                }
            })

            if (!this.player.dead && !e.dead) {
                if (ColRect(this.player, e)) {
                    this.player.X -= 40
                    if (!e.resis && this.damb && this.player.damage) {
                        e.sact = "Hit"
                        e.Lives -= 3
                        this.player.Power += 5
                        this.damb = false
                        setTimeout(_ => this.damb = true, 2000)
                    }

                    if (!this.player.resis && this.dam && e.damage) {
                        this.player.Lives -= e.droll
                        this.player.Power += 2
                        this.player.sact = "Hit"
                        this.dam = false
                        setTimeout(_ => this.dam = true, 1000)
                    }
                }

                if (ColRectD(this.player, e) && this.dam && !this.player.resis && e.d > 0) {
                    this.player.sact = "Hit"
                    this.player.Lives -= e.d
                    this.player.Power += 2
                    this.dam = false
                    setTimeout(_ => this.dam = true, 2000)
                }

                if (ColRectD(e, this.player) && this.damb && !e.resis && this.player.d > 0) {
                    e.sact = "Hit"
                    e.Lives -= this.player.d
                    // e.Lives -= 10
                    this.player.Power += 5
                    this.damb = false
                    setTimeout(_ => this.damb = true, 1000)
                }
            }


            if (this.player.laser &&
                ColRect(e, this.player.shooting) &&
                !e.resis &&
                this.damb
            ) {
                e.sact = "Hit"
                e.Lives -= this.player.shooting.damage
                this.player.Power += 5
                this.damb = false
                setTimeout(_ => this.damb = true, 2000)
            }

            if (e.laser &&
                !this.player.resis &&
                this.player.recX > e.shooting.recX + e.shooting.recW &&
                this.dam) {
                this.dam = false
                this.player.Lives -= e.shooting.damage
                this.player.Power += 2
                this.player.sact = "Hit"
                this.player.X += e.shooting.recW * 0.5
                setTimeout(_ => this.dam = true, 2000)
            }

        })

        if (this.player.Lives <= 0) setTimeout(_ => { this.gameover = true }, 5000)
        else if (this.boss.length > 0 && this.delay) {
            if (this.boss[0].end) {
                this.delay = false
                this.boss.splice(0, 1)

                if (this.boss.length > 0) this.player.boss = this.boss[0]
                else if (this.bosses.length > 0) {
                    this.boss.push(this.bosses[0])
                    this.bosses.splice(0, 1)
                    this.player.boss = this.boss[0]
                }
                else this.win = true
                setTimeout(_ => { this.delay = true }, 5000)
            }
        }
    }
    draw(ctx) {
        ctx.drawImage(this.back, 0, 0, this.canvas.width, this.canvas.height)

        // ctx.save()
        // ctx.fillStyle = "Red"
        // ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 10)
        // ctx.restore()

        this.player.draw(ctx)
        this.boss.forEach(e => {
            e.draw(ctx)
            e.project.forEach(x => x.draw(ctx))
            e.projectAct.forEach(x => x.draw(ctx))
        })
        this.player.project.forEach(e => e.draw(ctx))
        this.player.projectAct.forEach(e => e.draw(ctx))
    }
}

export class Level1 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 1
        this.back = Desert
        this.boss = [new StoneGolemBoss(canvas, play)]
        this.bosses = [new WindHashashinBoss(canvas, play)]
        this.player.boss = this.boss[0]
    }
}
export class Level2 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 2
        this.back = Desert
        this.boss = [new StoneGolemBoss(canvas, play)]
        this.boss[0].actions.push("Attack", "Attack", "Super", "Super", "Attack", "Attack")
        this.bosses = [new WindHashashinBoss(canvas, play), new CrystalMaulerBoss(canvas, play)]
        this.player.boss = this.boss[0]
    }
}
export class Level3 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 3
        this.back = Desert
        this.boss = [new StoneGolemBoss(canvas, play)]
        this.boss[0].actions.push("Attack", "Attack", "Super", "Super", "Attack", "Attack")
        this.bosses = [new WindHashashinBoss(canvas, play), new CrystalMaulerBoss(canvas, play), new GroundMonkBoss(canvas, play)]
        this.player.boss = this.boss[0]
    }
}
export class Level4 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 4
        this.back = Desert
        this.boss = [new StoneGolemBoss(canvas, play)]
        this.boss[0].actions.push("Attack", "Attack", "Super", "Super", "Attack", "Attack")
        this.bosses = [
            new WindHashashinBoss(canvas, play),
            new CrystalMaulerBoss(canvas, play),
            new GroundMonkBoss(canvas, play),
            new FireKnightBoss(canvas, play)]
        this.player.boss = this.boss[0]
    }
}
export class Level5 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 5
        this.back = Marz
        this.boss = [new StoneGolemBoss(canvas, play)]
        this.boss[0].actions.push("Attack", "Attack", "Super", "Super", "Attack", "Attack")
        this.boss[0].ground -= 50
        this.bosses = [
            new WindHashashinBoss(canvas, play),
            new CrystalMaulerBoss(canvas, play),
            new GroundMonkBoss(canvas, play),
            new FireKnightBoss(canvas, play),
            new WaterPriestessBoss(canvas, play)]
        this.bosses.forEach(e => e.ground -= 40)
        this.player.boss = this.boss[0]
    }
}
export class Level6 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 6
        this.back = Field
        this.boss = [new StoneGolemBoss(canvas, play)]
        this.boss[0].actions.push("Attack", "Attack", "Super", "Super", "Attack", "Attack")
        this.boss[0].ground -= 20
        this.bosses = [
            new WindHashashinBoss(canvas, play),
            new CrystalMaulerBoss(canvas, play),
            new GroundMonkBoss(canvas, play),
            new FireKnightBoss(canvas, play),
            new WaterPriestessBoss(canvas, play),
            new LeafRangerBoss(canvas, play)]
        this.bosses.forEach(e => e.ground -= 10)
        this.player.boss = this.boss[0]
    }
}
export class Level7 extends Level {
    constructor(play, canvas) {
        super(play, canvas)
        this.open = 7
        this.back = FieldIce
        this.back2 = IceRock
        this.boss = [new FrostGuardian(canvas, play)]
        this.boss[0].ground -= 10
        this.player.boss = this.boss[0]
        this.bosses = []
    }
    draw(ctx) {
        super.draw(ctx)
        ctx.drawImage(this.back2, 50, this.canvas.height - 120, this.canvas.width - 60, 120)
    }
    update(delta) {
        super.update(delta)

        if (this.boss.length >= 1 && this.boss[0].Lives <= 0) {
            this.boss.forEach(e => {
                e.Lives = 0
            })
        }

        this.boss.forEach((e, i) => {
            if (e.Lives <= 0) { e.ground = this.canvas.height - 60; e.dy = 5 }
            if (e.end) { this.boss.splice(i, 1) }
        })

        if (this.boss.length === 1) this.boss[0].nomore = true


        if (this.boss.length >= 1 && this.boss[0].image === FrostGuardianSheet && this.boss[0].spawn.length > 0) {
            this.boss[0].nomore = false
            switch (this.boss[0].spawn[0]) {
                case "Stone":
                    this.boss[0].spawn.splice(0, 1)
                    let st = new StoneGolemBoss(this.canvas, this.player, this.boss.length)
                    st.Y -= 200
                    st.ground -= 200
                    this.boss.push(st)
                    break;
                case "Wind":
                    this.boss[0].spawn.splice(0, 1)
                    let wi = new WindHashashinBoss(this.canvas, this.player, this.boss.length)
                    wi.ground = this.canvas.height - 80
                    wi.Y = this.canvas.height - 80
                    wi.actions.push("Walk", "Attack2", "Walk")
                    this.boss.push(wi)
                    break;
                case "Crystal":
                    this.boss[0].spawn.splice(0, 1)
                    let cr = new CrystalMaulerBoss(this.canvas, this.player, this.boss.length)
                    cr.ground = this.canvas.height - 80
                    cr.Y = this.canvas.height - 80
                    this.boss.push(cr)
                    break;
                case "Fire":
                    this.boss[0].spawn.splice(0, 1)
                    let fi = new FireKnightBoss(this.canvas, this.player, this.boss.length)
                    fi.ground = this.canvas.height - 80
                    fi.Y = this.canvas.height - 80
                    this.boss.push(fi)
                    break;
                case "Water":
                    this.boss[0].spawn.splice(0, 1)
                    let wa = new WaterPriestessBoss(this.canvas, this.player, this.boss.length)
                    wa.ground = this.canvas.height - 80
                    wa.Y = this.canvas.height - 80
                    this.boss.push(wa)
                    break;
            }
        }

        if (this.boss.length === 0) this.win = true
    }
}
export class Level8 {
    constructor(canvas) {
        this.canvas = canvas
        this.in = []

        this.back = Field

        this.players = [
            new LeafRanger(canvas, this.in),
            new WaterPriestess(canvas, this.in),
            new FireKnight(canvas, this.in),
            new GroundMonk(canvas, this.in),
            new CrystalMauler(canvas, this.in),
            new WindHashashin(canvas, this.in),
            new StoneGolem(canvas, this.in)
        ]

        this.players.forEach(e => {
            e.start = false
            e.Y = 3
            e.dy = -10
            e.ground = this.canvas.height - 50
            e.spee = 0
        })

        this.players[0].X = 500
        this.players[1].X = 470
        this.players[2].X = 350
        this.players[3].X = 160
        this.players[4].X = 130
        this.players[5].X = -200
        this.players[6].X = 10

        this.once = true
    }
    update(delta) {
        this.players.forEach(e => {
            e.update(delta)
            e.input = this.in
            e.Power = 40
        })

        if (this.once) {
            setTimeout(_ => this.in = ["ArrowDown"], 3000)
            setTimeout(_ => this.in = [], 4000)
            setTimeout(_ => this.in = ["ArrowRight"], 7000)
            setTimeout(_ => this.in = ["ArrowUp"], 15000)
            setTimeout(_ => this.in = ["x"], 18000)
            setTimeout(_ => this.in = ["z"], 21000)
            setTimeout(_ => { this.in = []; this.once = true }, 24000)
            this.once = false
        }
    }
    draw(ctx) {
        ctx.drawImage(this.back, 0, 0, this.canvas.width, this.canvas.height)

        this.players.forEach(e => {
            ctx.drawImage(e.image, e.frameX * e.spritew, e.frameY * e.spriteh, e.spritew, e.spriteh,
                e.X, e.Y, e.width, e.height
            )
        })

        ctx.save()
        ctx.font = "50px Arial"
        ctx.textAlign = "center"

        ctx.fillStyle = "black"
        ctx.fillText("You Have Won!", this.canvas.width * 0.5 + 3, this.canvas.height * 0.5 + 3)
        ctx.fillText("Thanks For Playing", this.canvas.width * 0.5 + 3 + 50, this.canvas.height * 0.5 + 3 + 50)

        ctx.fillStyle = "White"
        ctx.fillText("You Have Won!", this.canvas.width * 0.5, this.canvas.height * 0.5)
        ctx.fillText("Thanks For Playing", this.canvas.width * 0.5 + 50, this.canvas.height * 0.5 + 50)

        ctx.restore()
    }
}