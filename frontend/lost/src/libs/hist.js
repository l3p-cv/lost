class UndoRedo {
    constructor(maxElements = 100) {
        this.hist = []
        this.pointer = 0
        this.maxElements = maxElements
    }

    push(entry, description = 'No description') {
        const histEl = {
            entry,
            description,
        }
        if (this.pointer !== 0) {
            while (this.pointer !== 0) {
                this.pointer--
                this.hist.shift()
            }
        }
        this.hist.unshift(histEl)
        if (this.hist.length > this.maxElements) {
            this.hist.pop()
        }
    }

    undo() {
        if (this.pointer + 1 < this.hist.length) {
            // const element =
            this.pointer++
            return this.hist[this.pointer]
        } else {
            return this.hist[this.hist.length - 1]
        }
    }

    undoMia() {
        if (this.pointer + 1 < this.hist.length) {
            this.pointer++
            return this.hist[this.pointer - 1]
        } else {
            return this.hist[this.hist.length - 1]
        }
    }

    redo() {
        if (this.pointer - 1 >= 0) {
            this.pointer--
            return this.hist[this.pointer]
        } else {
            return this.hist[0]
        }
    }

    getHist() {
        return this.hist
    }

    clearHist() {
        this.hist = []
    }

    isEmpty() {
        return this.hist.length === 0
    }
}

export default UndoRedo
