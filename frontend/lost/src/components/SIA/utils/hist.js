class History{
    constructor(maxElements=100){
        this.hist = []
        this.pointer = 0
        this.maxElements = maxElements
    }

    push(element){
        if (this.pointer !== 0){
            while (this.pointer !== 0){
                this.pointer--
                this.hist.shift()
            }
        }
        this.hist.unshift(element)
        if (this.hist.length > this.maxElements){
            this.hist.pop()
        }
    }

    undo(){
        if (this.pointer+1 < this.hist.length){
            // const element = 
            this.pointer++
            return this.hist[this.pointer]
        } else {
            return this.hist[this.hist.length-1]
        }
    }

    redo(){
        if (this.pointer-1 >= 0){
            this.pointer--
            return this.hist[this.pointer]
        } else {
            return this.hist[0]
        }
    }

    getHist(){
        return this.hist
    }

}

export default History