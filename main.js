class Machine {
    constructor() {
        this.rows = [];
        this.lever = 0;
        this.MEM = false;
        this.instructions = [];
        this.instruction = 0;
        this.speed = 500;
        this.running = false;
        this.stateStack = [];
        this.animate = true;
    }

    // LOWER_LEVER | move lever to row below
    LOWER_LEVER() {
        this.lever++;
        if (this.rows.length < this.lever + 1) {
            addRow();
        }
    }

    // RAISE_LEVER | move lever to row above
    RAISE_LEVER() {
        if (this.lever > 0) {
            this.lever--;
        }
    }

    // CHECK_EMPTY | check whether the row that the lever points to is empty, if so set MEM = true, else set MEM - false
    CHECK_EMPTY() {
        this.MEM = this.rows[this.lever] === 0;
    }

    // RESET_BALLS | put all balls in first row
    RESET_BALLS() {
        this.rows[0] = this.rows.reduce((a, b) => a + b, 0);

        for (var i = 1; i < this.rows.length; i++) {
            this.rows[i] = 0;
        }
    }

    // SCRAMBLE_DOWN | move balls in longest row down 1 row until all rows above lever <= row at lever. when done, MEM = if any balls moved
    SCRAMBLE_DOWN() {
        this.MEM = false;

        while (true) {
            // check to see if the scramble down condition is satisfied
            var leverCount = this.rows[this.lever];
            var satisfied = true;
            for (var i = 0; i < this.lever; i++) {
                if (this.rows[i] > leverCount) {
                    satisfied = false;
                    break;
                }
            }

            if (satisfied) {
                break;
            } else {
                // scramble a ball down
                var toMove = this.getMaxRow(0, this.lever - 1, true);
                this.rows[toMove]--;
                this.rows[toMove + 1]++;

                if(machine.animate) {
                    this.stateStack.push([...machine.rows]);
                }

                this.MEM = true;
            }
        }
    }

    // SCRAMBLE_UP | move balls in longest row up 1 row until all rows above lever <= their row above. when done, MEM = if any balls moved
    SCRAMBLE_UP() {
        this.MEM = false;

        while (true) {
            // check to see if the scramble down condition is satisfied
            var satisfied = true;
            var satisfiedEnd = 0;
            for (var i = 0; i < this.lever; i++) {
                if (this.rows[i] < this.rows[i + 1]) {
                    satisfied = false;
                    break;
                }
                satisfiedEnd++;
            }

            if (satisfied) {
                break;
            } else {
                // scramble a ball up
                var toMove = this.getMaxRow(satisfiedEnd + 1, this.lever, false);
                this.rows[toMove]--;
                this.rows[toMove - 1]++;

                if(machine.animate) {
                    this.stateStack.push([...machine.rows]);
                }

                this.MEM = true;
            }
        }
    }

    // RETURN_FALSE_IF_MEM_FALSE | terminate the program if the condition holds
    RETURN_FALSE_IF_MEM_FALSE() {
        if (!this.MEM) {
            this.running = false;
            document.getElementById("res").innerText = "res > false";
        }
    }

    // RETURN_TRUE_IF_MEM_FALSE | terminate the program if the condition holds
    RETURN_TRUE_IF_MEM_FALSE() {
        if (!this.MEM) {
            this.running = false;
            document.getElementById("res").innerText = "res > true";
        }
    }

    // RETURN_FALSE_IF_MEM_TRUE | terminate the program if the condition holds
    RETURN_FALSE_IF_MEM_TRUE() {
        if (this.MEM) {
            this.running = false;
            document.getElementById("res").innerText = "res > false";
        }
    }

    // RETURN_TRUE_IF_MEM_TRUE | terminate the program if the condition holds
    RETURN_TRUE_IF_MEM_TRUE() {
        if (this.MEM) {
            this.running = false;
            document.getElementById("res").innerText = "res > true";
        }
    }

    // start and end inclusive
    getMaxRow(start, end, down) {
        var m = 0;
        for (var i = start; i < end + 1; i++) {
            if (this.rows[i] >= this.rows[m]) {
                m = i;
            }
            if (!down) {
                if (i === 0) {
                    m = 1;
                }
            }
        }
        return m;
    }
}

var machine = new Machine();

function addRow() {
    var div = createElement("div", { class: "row" });
    div.appendChild(createElementWithText("span", { class: "row-label" }, "Row " + machine.rows.length + ": "));
    div.appendChild(createElement("input", { type: "number", id: "row" + machine.rows.length, value: 0, min: 0, max: 100 }));
    div.appendChild(createElement("span", { class: "row-balls", id: "row" + machine.rows.length + "balls" }));
    document.getElementById("rows").appendChild(div);
    document.getElementById("row" + machine.rows.length).addEventListener("input", function () {
        readRows();
        writeRows();
    });

    machine.rows.push(0);
}

function subtractRow() {
    if (machine.rows.length > 1) {
        document.getElementById("rows").removeChild(document.getElementById("rows").lastChild);
        machine.rows.pop();
    }
}

function readRows() {
    for (var i = 0; i < machine.rows.length; i++) {
        machine.rows[i] = parseInt(document.getElementById("row" + i).value);
    }
}

function writeRows() {
    var rows = machine.rows;
    if (machine.stateStack.length > 0) {
        rows = machine.stateStack.shift();
    }
    for (var i = 0; i < rows.length; i++) {
        document.getElementById("row" + i).value = rows[i];
        document.getElementById("row" + i + "balls").innerText = "o".repeat(rows[i]) + (machine.lever === i ? "  <<<" : "");
    }

    document.getElementById("MEM").innerText = "MEM > "+ (machine.MEM ? "true" : "false");
}

function createElement(tag, attributes) {
    var element = document.createElement(tag);
    for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

function createElementWithText(tag, attributes, text) {
    var e = createElement(tag, attributes);
    e.innerText = text;
    return e;
}

function undo() {
    lines = document.getElementById("instructions").value.split("\n");
    lines.splice(lines.length - 2, 1);
    document.getElementById("instructions").value = lines.join("\n");
}

function addInstruction(i) {
    document.getElementById("instructions").value = document.getElementById("instructions").value + i + "\n";
}

function LOOP() {
    machine.running = true;
    loopLoop();
}

function loopLoop() {
    if (!machine.running) {
        return;
    }

    if (iterate()) {
        machine.running = false;
        machine.instruction = 0;
    }
    setTimeout(loopLoop, machine.speed);
}

function pause() {
    machine.running = false;
}

function iterate() {
    if (machine.stateStack.length > 0) {
        writeRows();
        return false;
    }

    // read instructions from textarea
    var lines = document.getElementById("instructions").value.split("\n");
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
            lines[i] = lines[i].replace(" <", "");
            machine.instructions[i] = machine[lines[i]];
        }
    }

    // stop if at end of instructions
    if (machine.instruction > machine.instructions.length - 1) {
        machine.running = false;
        return true;
    }

    // execute instruction
    machine.instructions[machine.instruction].call(machine);
    // update visuals
    document.getElementById("running").innerText = "ins > " + lines[machine.instruction];
    lines[machine.instruction] += " <";
    // move to next instructions
    machine.instruction++;
    
    // update visuals
    document.getElementById("instructions").value = lines.join("\n");
    writeRows();

    return false;
}

function setSpeed(val) {
    machine.speed = 1000-parseInt(val);
    document.getElementById("speed").innerText = `speed: ${(1000/machine.speed).toFixed(2)} ins/sec`;
}

function resetAll() {
    machine = new Machine();
    document.getElementById("instructions").value = "";
    document.getElementById("rows").innerHTML = "";
    document.getElementById("running").innerText = "ins > ";
    document.getElementById("res").innerText = "res > ";
    addRow();
    writeRows();
}

function toggleAnimation() {
    machine.animate = !machine.animate;
    document.getElementById("animateButton").innerText = machine.animate ? "disable animation" : "enable animation";
}

addRow();
