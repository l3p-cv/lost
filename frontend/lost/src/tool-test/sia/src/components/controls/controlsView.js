import "./controls.styles.scss"
import { NodeTemplate } from "l3p-core"

const data = {
    mouse: [
        {
            text: `select drawable`,
            entrys: [{
                button: "left",
                description: "Click on a drawable."
            }],
        },
        {
            text: `unselect drawable`,
            entrys: [{
                button: "left",
                description: "Click on a free area."
            }],
        },
        {
            text: `move drawable`,
            entrys: [{
                button: "left",
                description: "Drag on drawable's center or menubar."
            }],
        },
        {
            text: `change drawable`,
            entrys: [{
                button: "left",
                description: "Drag on drawable's corner, edge or point."
            }],
        },
        {
            text: `add drawable`,
            entrys: [{
                button: "right",
                description: "Drag or Click on any position."
            }],
        },
        {
            text: `delete drawable`,
            entrys: [{
                button: "left",
                description: "Click on a drawables close icon in it's menu bar."
            }],
        },
        {
            text: `zoom in`,
            entrys: [{
                button: "wheel down",
                description: "Point at the image and scroll the mousewheel down to zoom in."
            }],
        },
        {
            text: `zoom out`,
            entrys: [{
                button: "wheel up",
                description: "Point at the image and scroll the mousewheel up to zoom out."
            }],
        },
        {
            text: `pan the image while zoomed-in`,
            entrys: [{
                button: "left",
                description: "Click on a free area to pan the image, or hold spacebar and click wherever you want."
            }],
        },
    ],
    keyboard: [
        {
            text: "go to next image",
            entrys: [{
                    keystrokes: ["Ctrl", "+", "Alt", "+", "Right"],
                    description: "Load and display the next image.",
                    precondition: "none",
                },
            ]
        },
        {
            text: "go to previous image",
            entrys: [{
                    keystrokes: ["Ctrl", "+", "Alt", "+", "Left"],
                    description: "Load and display the previous image.",
                    precondition: "none",
                },
            ]
        },
        {
            text: "select next drawable",
            entrys: [{
                    keystrokes: ["Tab"],
                    description: "Select cylce forward.",
                    precondition: "none",
                },
            ]
        },
        {
            text: "select previous drawable",
            entrys: [{
                    keystrokes: ["Shift", "+", "Tab"],
                    description: "Select cycle backward.",
                    precondition: "none",
                }
            ]
        },
        {
            text: "unselect drawable",
            entrys: [{
                    keystrokes: ["Esc"],
                    description: "Unselect the currently selected drawable.",
                    precondition: "A drawable must be selected.",
                },
            ]
        },
        {
            text: "change drawable label",
            entrys: [{
                keystrokes: ["Ctrl", "+", "L"],
                description: "Open and close label menu.",
                precondition: "A drawable must be selected.",
            }]
        },
        {
            text: "move drawable",
            entrys: [{
                keystrokes: ["Arrows", ",", "WASD"],
                description: "Move the drawable in the targeted direction.",
                precondition: "A drawable must be selected.",
            }],
        },
        {
            text: "delete drawable",
            entrys: [{
                keystrokes: ["Del"],
                description: "Delete the currently selected drawable.",
                precondition: "A drawable must be selected.",
            }]
        },

        // BOX SPECIFIC
        {
            text: "select box edge (enter edit mode)",
            entrys: [{
                    keystrokes: ["Alt", "+", "Arrows", ",", "WASD"],
                    description: "Select box's edge.",
                    precondition: "A box must be selected.",
                },
            ]
        },
        {
            text: "scale box edge (in edit mode)",
            entrys: [{
                keystrokes: ["Arrows", ",", "WASD"],
                description: "Scale box's edge.",
                precondition: "In edit mode.",
            }]
        },
        {
            text: "finish box edge scaling (leave edit mode)",
            entrys: [{
                keystrokes: ["Space", ",", "Enter"],
                description: "Unselect the currently selected edge.",
                precondition: "In edit mode.",
            }]
        },

        // REDO UNDEO
        {
            text: "undo changes",
            entrys: [{
                keystrokes: ["Ctrl", "+", "Z", ",", "Y"],
                description: "undo latest change.",
                precondition: "change done.",
            }]
        },
        {
            text: "redo changes",
            entrys: [{
                keystrokes: ["Ctrl", "+", "Shift", "+", "Z", ",", "Y"],
                description: "redo latest change.",
                precondition: "change undone.",
            }]
        },
    ]
}
function createShortcutHTML(keys: array) {
    let result = `<div class="sia-shortcut">`
    let size = keys.length
    for (let i = 0; i < size; i++) {
        switch(keys[i]){
            case "+":
                result += `<span class="sia-plus">+</span>`
                break
            case ",":
                result += `<span class="sia-separator">or</span>`
                break
            default:
                result += `<div class="sia-key">${keys[i]}</div>`
        }
    }
    result += `</div>`
    return result
}


export const html = new NodeTemplate(`
    <div class="container sia-user-manual">
        <div class="row">
            <h2>
                <i class="fa fa-keyboard-o" aria-hidden="true"></i>
                <div style="display:inline-block; padding-left: 1rem">User Manual</div>
            </h2>
            // @disabled: lost integration
            // <ul class="nav navbar-right panel_toolbox">
            //     <li><a class="collapse-link"><i id="sia-collapse-manual" class="fa fa-chevron-up"></i></a></li>
            // </ul>
            <div class="clearfix"></div>
        </div>
        <div class="row">
            <div>
                <div class="sia-user-manual">
                    <h2>Mouse</h2>
                    ${
                        data.mouse.map(x => `
                            <div class="sia-table-wrapper">
                                <h4>${x.text}</h4>
                                <table class="table table-striped table-responsive">
                                    ${
                                        x.entrys.map((entry, index) =>
                                            `
                                            <tr><th>button:</th><td><div class="sia-key">${entry.button}</div></td></tr>
                                            <tr><th>description:</th><td><div>${entry.description}</div></td></tr>
                                            `
                                        ).join("")
                                    }
                                </table>
                            </div>`
                        ).join("")
                    }
                </div>
                <hr/>
                <div class="sia-user-manual">
                    <h2>Keyboard</h2>
                    ${
                        data.keyboard.map(x => `
                            <div class="sia-table-wrapper">
                                <h4>${x.text}</h4>
                                <table class="table table-striped table-responsive">
                                    ${
                                        x.entrys.map((entry, index) =>
                                            `
                                            <tr><th>shortcut:</th><td>${createShortcutHTML(entry.keystrokes)}</td></tr>
                                            <tr><th>description:</th><td><div>${entry.description}</div></td></tr>
                                            <tr><th>precondition:</th><td><div>${entry.precondition}</div></td></tr>
                                            `
                                        ).join("")
                                    }
                                </table>
                            </div>`
                        ).join("")
                    }
                    <div class="clearfix"></div>
                </div>
            </div>
        </div>
    </div>
`)
export function hide(){
    html.root.style.display = "none"
}
export function show(){
    html.root.style.display = "block"
}
