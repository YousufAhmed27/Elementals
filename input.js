export default class Inputs {
    constructor() {
        this.key = []
        window.addEventListener("keydown", e => {
            if (!this.key.includes(e.key)) {
                if (e.key === "ArrowUp" ||
                    e.key === "ArrowDown" ||
                    e.key === "ArrowRight" ||
                    e.key === "ArrowLeft" ||
                    e.key === "x" ||
                    e.key === "z" ||
                    e.key === "c" ||
                    e.key === "v" ||
                    e.key === "d" ||
                    e.key === "f"
                ) {
                    this.key.push(e.key)
                }
            }
        })
        window.addEventListener("keyup", e => { this.key.splice(this.key.indexOf(e.key), 1) })
    }
}