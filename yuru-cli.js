#!/usr/bin/env node

const config = require('./config.json');

const readline = require('node:readline');
const { stdin: input, stdout: output, send } = require('node:process');
const rl = readline.createInterface({ input, output });

const args = process.argv.slice(2); //passes through the arguments the user makes :3
const endpoint = 'http://api.yuru.ca'

let command;

let helpCommand = 
`\x1b[45myuru-cli\x1b[0m | version 0.0.1

setadd [set url] [description] - adds the provided set to the yuru.ca database
    -d --description | specifies the description for the set
    -c --completed-date | specifies the completion date of the set
    -p --person | person the set is attributed to (sydney, lilac, may, or hazel)
    -m --mapper | username of the person the set is attributed to (sydnmc, yuiyamu, mayniaria, or kyatarii)

diffadd [diff url] - adds the provided diff to the yuru.ca database, depending on the person given
    -c --completed-date | specifies the completion date of the gd
    -a --amount-mapped | sets the amount that you mapped of a given gd

setedit - lists all available sets and gives you an option to select one to edit

diffedit [person] - lists all available gds for the given person and lets you select one to edit

help - displays this command`;

//considered using a switch statement, but i wanna catch all cases possible (else)
command = args[0];
if (command === 'setadd') {
    setadd(args[1]);
} else if (command === 'diffadd') {
    diffadd(args[1]);
} else if (command === 'setedit') {
    setedit();
} else if (command === 'diffedit') {
    diffedit(args[2], args[1]);
} else if (command === 'help') {
    console.log(helpCommand);
} else {
    console.log('unknown command >_<;; type help to see all commands');
}

function sendNewValue(property, dataType, newData, person) {
    let question = `is ${property} okay? `;
    if (dataType === "setadd" || dataType === "diffadd") {
        question = `does this look okay?\n${JSON.stringify(newData)} `;
    }
    rl.question(question, async(confirmation) => {
        if (confirmation === 'y') {
            let fetchUrl = `${endpoint}/changeInfo?type=${dataType}`;
            if (person) {
                fetchUrl = `${endpoint}/changeInfo?type=${dataType}&person=${person}`;
            }

            let confirm = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    'Authorization': config['yuru-key'],
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            });
            console.log(confirm);
            rl.close();
        } else {
            rl.close();
        }
    });
}

async function setadd(beatmapsetId) {
    let setInfo = await fetch(`${endpoint}/newMapData?beatmapsetId=${beatmapsetId}`);
    setInfo = await setInfo.json();

    console.log(`found set ${setInfo.artist} - ${setInfo.title}!`);
    rl.question(`\nplease type in the map description~ (note: this currently doesn't support profile hovers, so just keep that in mind~)\n`, (description) => {
        setInfo.description = description;
        rl.question('what is the username of the map creator?\n', (creatorUsername) => {
            setInfo.creator = creatorUsername;
            rl.question(`what is the creator's name? (eg. lilac as opposed to yuiyamu)?\n`, (creatorName) => {
                setInfo.personCreator = creatorName;
                rl.question(`finally, what is the date of completion for this set?\n`, (dateFinished) => {
                    setInfo.dateFinished = dateFinished;
                    sendNewValue(null, setInfo, "setadd", null);
                });
            });
        })
    });
}

async function diffadd(beatmapId, person) {
    let diffInfo = await fetch(`${endpoint}/newMapData?beatmapId=${beatmapId}`);
    diffInfo = await diffInfo.json();

    console.log(`found diff ${diffInfo.artist} - ${diffInfo.title} [${diffInfo.maps[0].diffname}]!`);
    rl.question(`\nis this map for rank? (y/n)\n`, (selection) => {
        if (selection === 'y') {
            diffInfo.isForRank = true;
        } else if (selection === 'n') {
            diffInfo.isForRank = false;
        } else {
            console.log('unrecognized option. aborting...');
            rl.close();
        }
        rl.question(`what is the amount that you mapped in this diff?\n`, (amountMapped) => {
            diffInfo.maps[0].amountMapped = amountMapped;
            rl.question(`what is the date of completion for ths diff?\n`, (dateFinished) => {
                diffInfo.maps[0].dateFinished = dateFinished;
                sendNewChunk(null, diffInfo, 'diffadd', person);
            });
        });
    });
}

async function setedit() {
    let sets = await fetch(`${endpoint}/sets`);
    sets = await sets.json();
    
    for (let i = 0; i < sets.length; i++) {
        console.log(`   ${i} | ${sets[i].artist} - ${sets[i].title} by ${sets[i].creator}`);
    }

    rl.question('\nwhich set would you like to edit? ', (number) => {
        try {
            let setNum = parseInt(number);
            console.log(`   ${sets[setNum].artist} - ${sets[setNum].title}:`);
            console.log(`       0 | isIncomplete   ${sets[setNum].isIncomplete}`);
            console.log(`       1 | bgLink   ${sets[setNum].bgLink}`);
            console.log(`       2 | title   ${sets[setNum].title}`);
            console.log(`       3 | artist   ${sets[setNum].artist}`);
            console.log(`       4 | url   ${sets[setNum].url}`);
            console.log(`       5 | mapId   ${sets[setNum].mapId}`);
            console.log(`       6 | description`);
            console.log(`       7 | creator     ${sets[setNum].creator}`);
            console.log(`       8 | dateFinished     ${sets[setNum].dateFinished}`);
            console.log(`       9 | creatorPerson     ${sets[setNum].creatorPerson}`);
            console.log(`       10 | status     ${sets[setNum].status}`);
            rl.question('\nwhich option would you like to edit? ', (option) => {
                try {
                    let optNum = parseInt(option);
                    let setProperties = Object.keys(sets[setNum]);
                    let currentProperty = sets[setNum][setProperties[optNum]];
                    if (optNum === 6) {
                        console.log('editing the first property of set descriptions (any sets without osu hovers) is only supported currently.');
                        rl.question(`change description from "${currentProperty[0].content}" to...?\n`, (newProperty) => {
                            sets[setsNum][setProperties[optNum]][0].content = newProperty;
                            sendNewValue(newProperty, "setedit", sets, null);
                        });
                    } else {
                        rl.question(`\nchange ${setProperties[optNum]} from ${currentProperty} to...? `, (newProperty) => {
                            sets[setsNum][setProperties[optNum]] = newProperty;
                            sendNewValue(newProperty, "setedit", sets, null);
                        });
                    }
                } catch {
                    console.log(`${option} was not recognized >_<;;`);
                }
            });
        } catch {
            console.log(`${number} was not recognized >_<;;`);
        }
    });
}

async function diffedit(person) {
    let diffs = await fetch(`${endpoint}/gds?person=${person}`);
    diffs = await diffs.json();
    let diffAssign = new Map();
    
    let selectNum = 0;
    for (let i = 0; i < diffs.length; i++) {
        for (let j = 0; j < diffs[i].maps.length; j++) {
            console.log(`   ${selectNum} | ${diffs[i].artist} - ${diffs[i].title} [${diffs[i].maps[j].diffname}]`);
            diffAssign.set(selectNum, {set: i, diff: j});
            selectNum++;
        }
    }


    rl.question('\nwhich map would you like to edit? ', (number) => {
        try {
            let diffNum = parseInt(number);
            let curInfo = diffAssign.get(diffNum);
            console.log(`   ${diffs[curInfo.set].artist} - ${diffs[curInfo.set].title}:`);
            console.log(`       0 | bgLink   ${diffs[curInfo.set].bgLink}`);
            console.log(`       1 | title   ${diffs[curInfo.set].title}`);
            console.log(`       2 | artist   ${diffs[curInfo.set].artist}`);
            console.log(`       3 | creator     ${diffs[curInfo.set].creator}`);
            console.log(`       4 | mapId   ${diffs[curInfo.set].mapId}`);
            console.log(`       5 | status     ${diffs[curInfo.set].status}`);
            console.log(`       6 | isForRank   ${diffs[curInfo.set].isForRank}`);
            console.log(`       7 | bns   ${diffs[curInfo.set].bns}`);
            console.log('       -');
            console.log(`       8 | url     ${diffs[curInfo.set].maps[curInfo.diff].url}`);
            console.log(`       9 | id     ${diffs[curInfo.set].maps[curInfo.diff].id}`);
            console.log(`       10 | diffname     ${diffs[curInfo.set].maps[curInfo.diff].diffname}`);
            console.log(`       11 | amountMapped     ${diffs[curInfo.set].maps[curInfo.diff].amountMapped}`);
            console.log(`       12 | sr     ${diffs[curInfo.set].maps[curInfo.diff].sr}`);
            console.log(`       13 | dateFinished     ${diffs[curInfo.set].maps[curInfo.diff].dateFinished}`);
            rl.question('\nwhich option would you like to edit? ', (option) => {
                try {
                    let optNum = parseInt(option);
                    let setProperties = Object.keys(diffs[curInfo.set]);
                    let diffProperties = Object.keys(diffs[curInfo.set].maps[curInfo.diff]);
                    let property;
                    let isDiffProperty = false;

                    let currentProperty;
                    if (optNum < 8) { //set properties
                        property = setProperties[optNum];
                        currentProperty = diffs[curInfo.set][property];
                    } else { //diff properties
                        isDiffProperty = true;
                        property = diffProperties[optNum-8]
                        currentProperty = diffs[curInfo.set].maps[curInfo.diff][property];
                    }

                    rl.question(`\nchange ${property} from ${currentProperty} to...? `, (newProperty) => {
                        if (isDiffProperty) {
                            diffs[curInfo.set].maps[curInfo.diff][property] = newProperty;
                        } else {
                            diffs[curInfo.set][property] = newProperty;
                        }
                        sendNewValue(newProperty, "setedit", diffs, person);
                    });
                } catch {
                    console.log(`${option} was not recognized >_<;;`);
                }
            });
        } catch {
            console.log(`${number} was not recognized >_<;;`);
        }
    });
}