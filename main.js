import Inputs from "./input.js"
import { FireKnight, LeafRanger, CrystalMauler, StoneGolem, GroundMonk, WaterPriestess, WindHashashin } from "./Player.js";
import { Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8 } from "./level.js";

let choosingplayer = document.querySelector(".con.choose"),
    cards = document.querySelectorAll(".con.choose .card"),
    button = document.querySelector(".movement"),
    title = document.querySelector(".title"),
    overview = document.querySelector(".overview"),
    playerchoice = "",
    Pause = false;

function AddRule(Key, Action, Super = false) {
    let div = document.createElement("div")
    div.classList.add("rule")

    let div2 = document.createElement("div")
    div2.classList.add("key")
    div2.innerHTML = Key

    let span = document.createElement("span")
    span.innerHTML = Action

    div.appendChild(div2)
    div.appendChild(span)

    if (!Super) document.querySelector(".overview .in.mainmove").appendChild(div)
    else document.querySelector(".overview .in.addi").appendChild(div)
}

function RemoveAllRules() {
    let mainn = document.querySelectorAll(".overview .move .rulesmove .mainmove div.rule")
    let addi = document.querySelectorAll(".overview .move .rulesmove .addi div.rule")
    if (mainn.length > 4) {
        mainn[4].remove()
        RemoveAllRules()
    }
    if (addi.length > 1) {
        addi[1].remove()
        RemoveAllRules()
    }
}

window.addEventListener("load", _ => {
    document.querySelector(".con.load").classList.add("hideit")
    choosingplayer.classList.remove("hideit")

    function init() {
        did = false
        document.querySelector(".con.load").classList.add("hideit")
        choosingplayer.classList.remove("hideit")

        deltatime = 0
        lastframe = 0
        interval = 2000
        frames = 0

        inputs = new Inputs()
        player = ""
        level = ""
        did = false
    }

    // Variables About The Canvas
    let canvas = can,
        ctx = canvas.getContext("2d")
    canvas.width = 900
    canvas.height = 500

    // Variables Of Time
    let deltatime = 0,
        lastframe = 0,
        interval = 2000,
        frames = 0


    // variables of classes
    let inputs = new Inputs()
    let player = ""
    let level = ""
    let did = false
    function SetPlayer() {
        RemoveAllRules()
        switch (playerchoice) {
            case "StoneGolem":
                player = new StoneGolem(canvas, inputs.key)
                level = new Level1(player, canvas)
                AddRule("Z", "Target Attack", true)
                AddRule("C", "Launch", true)
                AddRule("V", "Laser", true)
                AddRule("X", "Attack")
                break;
            case "WindHashashin":
                player = new WindHashashin(canvas, inputs.key)
                level = new Level2(player, canvas)
                AddRule("X", "Slice")
                AddRule("Z", "Cut")
                AddRule("F", "Roll", true)
                AddRule("C", "Storm", true)
                AddRule("V", "X-Kill", true)
                break;
            case "CrystalMauler":
                player = new CrystalMauler(canvas, inputs.key)
                level = new Level3(player, canvas)
                AddRule("Z", "Target Crystal", true)
                AddRule("C", "Crystal Wall", true)
                AddRule("V", "Roll", true)
                AddRule("X", "Attack")
                break;
            case "GroundMonk":
                player = new GroundMonk(canvas, inputs.key)
                level = new Level4(player, canvas)
                AddRule("X", "Hit")
                AddRule("Z", "Punch")
                AddRule("F", "Roll", true)
                AddRule("C", "Hand", true)
                AddRule("V", "Storming", true)
                break;
            case "FireKnight":
                player = new FireKnight(canvas, inputs.key)
                level = new Level5(player, canvas)
                AddRule("X", "Smash")
                AddRule("Z", "Slice")
                AddRule("C", "Slicer", true)
                AddRule("V", "Fire Sword", true)
                AddRule("F", "Roll", true)
                break;
            case "WaterPriestess":
                player = new WaterPriestess(canvas, inputs.key)
                level = new Level6(player, canvas)
                AddRule("X", "Hit")
                AddRule("Z", "Slice")
                AddRule("F", "Roll", true)
                AddRule("C", "Bubble", true)
                AddRule("V", "Flooding", true)
                break;
            case "LeafRanger":
                player = new LeafRanger(canvas, inputs.key)
                level = new Level7(player, canvas)
                AddRule("X", "Attack")
                AddRule("Z", "Shoot")
                AddRule("C", "Branch Arrow", true)
                AddRule("V", "Poison Arrow", true)
                AddRule("D", "Arrow Shower", true)
                AddRule("F", "Slide", true)
                break;
            case "FrostGuardian":
                level = new Level8(canvas)
        }
        did = true
    }

    function Animate(time) {
        deltatime = time - lastframe
        lastframe = time
        frames += deltatime

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        level.update(deltatime)
        level.draw(ctx)

        if (level.win && did) {
            document.querySelectorAll(".con.choose .card")[level.open].classList.remove("disabled")
            init()
        }
        if (!Pause && !level.gameover) requestAnimationFrame(Animate)
        else if (level.gameover) {
            ctx.save()
            ctx.font = "30px Arial"
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            ctx.fillText("GameOver!", canvas.width * 0.5, canvas.height * 0.5)
            ctx.fillText("Press Enter To Restart.", canvas.width * 0.5, canvas.height * 0.5 + 50)
            ctx.restore()
        }
    }
    window.addEventListener("keydown", e => { if (level.gameover && e.key === "Enter") init() })

    cards.forEach(e => {
        e.addEventListener("click", _ => {
            if (!e.classList.contains("disabled")) {
                playerchoice = e.attributes[1].value
                title.innerHTML = playerchoice
                choosingplayer.classList.add("hideit")
                button.classList.remove("hideit")
                SetPlayer()
                Animate(0)
            }
        })
    })
    button.addEventListener("click", _ => { overview.classList.remove("hideit"); Pause = true })
    document.querySelector(".overview .close").addEventListener("click", _ => { overview.classList.add("hideit"); Pause = false; Animate(0) })
})
