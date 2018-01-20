let votes = {};
let tie = false;
let win_check = false;
let win_check_2 = true;
let number_of_winners = 0;
let full_winners = [];

function display_votes(winners) {
    let help_text = "";
    if (number_of_winners == 1) {
        help_text = "Winner: ";
    } else {
        help_text = "Winners: ";
    }
    for (i = 0; i < winners.length; i++) {
        help_text = help_text + winners[i];
        if (i < winners.length - 1) {
            help_text = help_text + ", ";
        } else {
            help_text = help_text + ".";
        }
    }
    document.getElementById("help_text").innerHTML = help_text;
}

function count_votes(ignored_candidates) {
    // set up empty ignored_candidates array if not given
    if (!ignored_candidates) {
        ignored_candidates = [];
    }

    let candidates = {};
    for (vote in votes) {
        // iterate over each choice, since they should be sorted
        for (i = 0; i < votes[vote].voter_choices.length; i++) {
            let candidate = votes[vote].voter_choices[i];
            // skip candidates on ignored list
            if (!ignored_candidates.includes(candidate)) {
                // add candidate to candidate list if not there already
                if (!candidates.hasOwnProperty(candidate)) {
                    candidates[candidate] = 0;
                }
                // add a vote
                candidates[candidate]++;
                // break the loop if a vote is counted
                i = votes[vote].voter_choices.length;
            }
        }
    }

    // determine losers
    let losers = [];
    let least_votes = 4294967295;
    for (candidate in candidates) {
        if (least_votes > candidates[candidate]) {
            least_votes = candidates[candidate];
        }
    }
    for (candidate in candidates) {
        if (least_votes == candidates[candidate]) {
            losers.push(candidate);
        }
    }

    // determine winners
    let winners = []
    let most_votes = 0;
    for (candidate in candidates) {
        if (most_votes < candidates[candidate]) {
            most_votes = candidates[candidate];
        }
    }
    for (candidate in candidates) {
        if (most_votes == candidates[candidate]) {
            winners.push(candidate);
        }
    }

    // recursive algorithm that stops removing candidates when a tie is reached or only one candidate is left
    while (!tie) {
        if (Object.keys(candidates).length == winners.length && winners.length == losers.length) {
            tie = true;
        } else {
            // add losers to ignored list
            ignored_candidates = ignored_candidates.concat(losers);
            // recount votes
            count_votes(ignored_candidates);
        }
        // add "winning" candidates to a larger list if looking for more than one winner
        for (candidate in candidates) {
            if (!full_winners.includes(candidate)) {
                full_winners.push(candidate);
            }
        }
        // as algorithm works backwards, determine winner when tie is broken
        win_check = true;
        if (win_check && win_check_2) {
            if (winners.length == number_of_winners) {
                display_votes(winners);
                win_check_2 = false;
            } else if (full_winners.length == number_of_winners) {
                display_votes(full_winners);
                win_check_2 = false;
            }
        }

    }
}

function parse_file(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        const data = event.target.result.split("\n");
        data.shift();
        // fill votes object
        for (i = 0; i < data.length; i++) {
            let line = data[i].split(",");
            let name = line[1];
            let choices = line.splice(2);
            votes[name] = {
                voter_name: name,
                voter_choices: choices
            }
        }
        count_votes();
    };
}

function load_file() {
    let help_text = "Please select a valid .csv file and number of winners.";
    let loaded_files = document.getElementById("uploaded_files");
    let file = loaded_files.files[0];
    if (file) {
        if (file.type.match("text/csv")) {
            // reset vote data if new file uploaded
            votes = {}
            tie = false;
            win_check = false;
            win_check_2 = true;
            full_winners = [];
            // set number of winners
            number_of_winners = document.getElementById("number_of_winners_input").value;
            if (number_of_winners > 0) {
                parse_file(file);
            } else {
                help_text = "Please select a number of winners (greater than zero)."
            }
        }
    }
    document.getElementById("help_text").innerHTML = help_text;
}
