// const colors30 = ["#dc9769",
// "#5c69d6",
// "#51a630",
// "#9a59cc",
// "#a1bb37",
// "#c043a6",
// "#5fc666",
// "#de4282",
// "#58c699",
// "#d2404e",
// "#42c0c7",
// "#d95130",
// "#598cdd",
// "#df8830",
// "#50a2d1",
// "#c8a73f",
// "#d87ed5",
// "#3e7f38",
// "#af94d8",
// "#7b8b2d",
// "#635ea2",
// "#a1b56d",
// "#a93e62",
// "#3e8d68",
// "#df82ab",
// "#616c2c",
// "#955282",
// "#91692d",
// "#d47776",
// "#a94e2c"]

const colors20 = ["#46aed7",
"#e28f81",
"#50b897",
"#88712f",
"#9cb067",
"#a4527d",
"#a55046",
"#6e90da",
"#487b3b",
"#6360a7",
"#cd8fd3",
"#d5a442",
"#cf7635",
"#da4971",
"#a4b137",
"#d44da4",
"#aa54be",
"#5ab74d",
"#7166d9",
"#d14734"]

const colors = colors20
const nColors = 20

export function getColor(n){
    if (n){
        return colors[n%nColors]
    }
    else{
        return getDefaultColor()    
    }
}

export function getDefaultColor(){
    return colors[0]
}