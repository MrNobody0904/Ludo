#include "ludo.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static GameState g_game;

static const int START_CELLS[MAX_PLAYERS] = {0, 13, 26, 39};
static const int SAFE_CELLS[] = {0, 8, 13, 21, 26, 34, 39, 47};
#define NUM_SAFE_CELLS (sizeof(SAFE_CELLS) / sizeof(SAFE_CELLS[0]))

int is_safe_cell(int global_cell) {
    if (global_cell < 0 || global_cell >= TRACK_LENGTH) return 1; /* home stretch & base are safe */
    for (size_t i = 0; i < NUM_SAFE_CELLS; i++) {
        if (SAFE_CELLS[i] == global_cell) {
            return 1;
        }
    }
    return 0;
}

int get_token_global_cell(int player, int token_idx) {
    if (player < 0 || player >= MAX_PLAYERS || token_idx < 0 || token_idx >= TOKENS_PER_PLAYER) {
        return -2;
    }
    int step = g_game.players[player].tokens[token_idx].step;
    if (step == BASE_STEP) {
        return -1; /* In base */
    }
    if (step >= 0 && step <= 50) {
        return (START_CELLS[player] + step) % TRACK_LENGTH;
    }
    if (step >= 51 && step <= 55) {
        return 100 + player * 10 + (step - 51); /* Home corridor */
    }
    if (step == FINISH_STEP) {
        return 999; /* Finished */
    }
    return -2;
}

static void next_player_turn(void) {
    g_game.consecutive_sixes = 0;
    g_game.extra_turn = 0;
    g_game.current_dice = 0;
    g_game.phase = PHASE_WAITING_FOR_ROLL;

    int next = g_game.current_player;
    for (int i = 0; i < g_game.num_players; i++) {
        next = (next + 1) % g_game.num_players;
        if (g_game.players[next].is_active && g_game.players[next].tokens_home < TOKENS_PER_PLAYER) {
            g_game.current_player = next;
            return;
        }
    }
}

void init_game(int num_players) {
    if (num_players < 2) num_players = 2;
    if (num_players > 4) num_players = 4;

    memset(&g_game, 0, sizeof(GameState));
    g_game.num_players = num_players;
    g_game.current_player = 0;
    g_game.phase = PHASE_WAITING_FOR_ROLL;
    g_game.current_dice = 0;
    g_game.consecutive_sixes = 0;
    g_game.extra_turn = 0;
    g_game.winner = -1;

    for (int p = 0; p < MAX_PLAYERS; p++) {
        g_game.players[p].id = p;
        g_game.players[p].is_active = (p < num_players);
        g_game.players[p].is_bot = 0;
        g_game.players[p].bot_difficulty = BOT_MEDIUM;
        g_game.players[p].tokens_home = 0;
        for (int t = 0; t < TOKENS_PER_PLAYER; t++) {
            g_game.players[p].tokens[t].step = BASE_STEP;
        }
    }
}

void set_player_bot(int player, int is_bot, int difficulty) {
    if (player >= 0 && player < MAX_PLAYERS) {
        g_game.players[player].is_bot = is_bot;
        g_game.players[player].bot_difficulty = difficulty;
    }
}

int roll_dice(unsigned int seed) {
    if (g_game.phase != PHASE_WAITING_FOR_ROLL || g_game.winner != -1) {
        return g_game.current_dice;
    }

    if (seed != 0) {
        srand(seed);
    }
    int dice = (rand() % 6) + 1;
    g_game.current_dice = dice;

    if (dice == 6) {
        g_game.consecutive_sixes++;
        if (g_game.consecutive_sixes == 3) {
            /* Penalty: Three consecutive sixes forfeits the turn! */
            next_player_turn();
            return dice;
        }
    } else {
        g_game.consecutive_sixes = 0;
    }

    /* Check if current player has any valid moves with this dice */
    int valid_tokens[TOKENS_PER_PLAYER];
    int count = get_valid_moves(g_game.current_player, dice, valid_tokens);

    if (count == 0) {
        /* No valid moves available: pass turn to next player */
        next_player_turn();
    } else {
        g_game.phase = PHASE_WAITING_FOR_MOVE;
    }

    return dice;
}

int get_valid_moves(int player, int dice, int* out_valid_tokens) {
    if (player < 0 || player >= g_game.num_players || dice < 1 || dice > 6) {
        return 0;
    }

    int count = 0;
    for (int t = 0; t < TOKENS_PER_PLAYER; t++) {
        int step = g_game.players[player].tokens[t].step;

        /* If token is in base, needs a 6 to enter track */
        if (step == BASE_STEP) {
            if (dice == 6) {
                if (out_valid_tokens) out_valid_tokens[count] = t;
                count++;
            }
        }
        /* If token is already finished, cannot move */
        else if (step == FINISH_STEP) {
            continue;
        }
        /* If token is on track or home corridor, can move if not overshooting finish */
        else {
            if (step + dice <= FINISH_STEP) {
                if (out_valid_tokens) out_valid_tokens[count] = t;
                count++;
            }
        }
    }

    return count;
}

int move_token(int player, int token_idx, int dice) {
    if (g_game.phase != PHASE_WAITING_FOR_MOVE || g_game.winner != -1) {
        return 0;
    }
    if (player != g_game.current_player) {
        return 0;
    }
    if (token_idx < 0 || token_idx >= TOKENS_PER_PLAYER) {
        return 0;
    }
    if (dice != g_game.current_dice) {
        return 0;
    }

    int valid_tokens[TOKENS_PER_PLAYER];
    int valid_count = get_valid_moves(player, dice, valid_tokens);
    int is_valid = 0;
    for (int i = 0; i < valid_count; i++) {
        if (valid_tokens[i] == token_idx) {
            is_valid = 1;
            break;
        }
    }
    if (!is_valid) {
        return 0;
    }

    int grant_extra_turn = 0;
    int current_step = g_game.players[player].tokens[token_idx].step;

    if (current_step == BASE_STEP && dice == 6) {
        /* Bringing token out of base to starting cell */
        g_game.players[player].tokens[token_idx].step = 0;
        grant_extra_turn = 1; /* Rolling 6 gave extra turn */
    } else {
        int new_step = current_step + dice;
        g_game.players[player].tokens[token_idx].step = new_step;

        if (new_step == FINISH_STEP) {
            g_game.players[player].tokens_home++;
            grant_extra_turn = 1; /* Reaching home grants bonus turn */

            if (g_game.players[player].tokens_home >= TOKENS_PER_PLAYER) {
                g_game.winner = player;
                g_game.phase = PHASE_GAME_OVER;
                return 1;
            }
        } else if (new_step <= 50) {
            /* Token on main track: check capture */
            int global_cell = (START_CELLS[player] + new_step) % TRACK_LENGTH;

            if (!is_safe_cell(global_cell)) {
                /* Check if any opponent token occupies this cell */
                for (int opp = 0; opp < g_game.num_players; opp++) {
                    if (opp == player || !g_game.players[opp].is_active) continue;
                    for (int ot = 0; ot < TOKENS_PER_PLAYER; ot++) {
                        int opp_step = g_game.players[opp].tokens[ot].step;
                        if (opp_step >= 0 && opp_step <= 50) {
                            int opp_cell = (START_CELLS[opp] + opp_step) % TRACK_LENGTH;
                            if (opp_cell == global_cell) {
                                /* CAPTURE! Send opponent back to base */
                                g_game.players[opp].tokens[ot].step = BASE_STEP;
                                grant_extra_turn = 1; /* Capturing grants bonus turn */
                            }
                        }
                    }
                }
            }
        }

        if (dice == 6) {
            grant_extra_turn = 1;
        }
    }

    if (grant_extra_turn) {
        g_game.extra_turn = 1;
        g_game.phase = PHASE_WAITING_FOR_ROLL;
        g_game.current_dice = 0;
    } else {
        next_player_turn();
    }

    return 1;
}

int check_winner(void) {
    if (g_game.winner != -1) return g_game.winner;
    for (int p = 0; p < g_game.num_players; p++) {
        if (g_game.players[p].is_active && g_game.players[p].tokens_home >= TOKENS_PER_PLAYER) {
            g_game.winner = p;
            g_game.phase = PHASE_GAME_OVER;
            return p;
        }
    }
    return -1;
}

int bot_choose_move(int player, int dice, int difficulty) {
    int valid_tokens[TOKENS_PER_PLAYER];
    int count = get_valid_moves(player, dice, valid_tokens);
    if (count == 0) return -1;
    if (count == 1) return valid_tokens[0];

    /* EASY: Random move */
    if (difficulty == BOT_EASY) {
        return valid_tokens[rand() % count];
    }

    /* MEDIUM: Rule-based priority */
    if (difficulty == BOT_MEDIUM) {
        /* 1. Can we reach finish? */
        for (int i = 0; i < count; i++) {
            int t = valid_tokens[i];
            int step = g_game.players[player].tokens[t].step;
            if (step != BASE_STEP && step + dice == FINISH_STEP) {
                return t;
            }
        }

        /* 2. Can we capture an opponent? */
        for (int i = 0; i < count; i++) {
            int t = valid_tokens[i];
            int step = g_game.players[player].tokens[t].step;
            int new_step = (step == BASE_STEP) ? 0 : step + dice;
            if (new_step <= 50) {
                int target_cell = (START_CELLS[player] + new_step) % TRACK_LENGTH;
                if (!is_safe_cell(target_cell)) {
                    for (int opp = 0; opp < g_game.num_players; opp++) {
                        if (opp == player || !g_game.players[opp].is_active) continue;
                        for (int ot = 0; ot < TOKENS_PER_PLAYER; ot++) {
                            int opp_step = g_game.players[opp].tokens[ot].step;
                            if (opp_step >= 0 && opp_step <= 50) {
                                int opp_cell = (START_CELLS[opp] + opp_step) % TRACK_LENGTH;
                                if (opp_cell == target_cell) return t;
                            }
                        }
                    }
                }
            }
        }

        /* 3. Can we leave base? */
        if (dice == 6) {
            for (int i = 0; i < count; i++) {
                if (g_game.players[player].tokens[valid_tokens[i]].step == BASE_STEP) {
                    return valid_tokens[i];
                }
            }
        }

        /* 4. Can we enter home stretch or safe cell? */
        for (int i = 0; i < count; i++) {
            int t = valid_tokens[i];
            int step = g_game.players[player].tokens[t].step;
            if (step != BASE_STEP) {
                int new_step = step + dice;
                if (new_step > 50) return t; /* Entered home stretch */
                int cell = (START_CELLS[player] + new_step) % TRACK_LENGTH;
                if (is_safe_cell(cell)) return t;
            }
        }

        /* 5. Advance furthest token */
        int best_token = valid_tokens[0];
        int max_step = -2;
        for (int i = 0; i < count; i++) {
            int t = valid_tokens[i];
            int step = g_game.players[player].tokens[t].step;
            if (step > max_step) {
                max_step = step;
                best_token = t;
            }
        }
        return best_token;
    }

    /* HARD: Heuristic scoring */
    int best_token = valid_tokens[0];
    int highest_score = -999999;

    for (int i = 0; i < count; i++) {
        int t = valid_tokens[i];
        int step = g_game.players[player].tokens[t].step;
        int new_step = (step == BASE_STEP) ? 0 : step + dice;
        int score = 0;

        /* Base exit score */
        if (step == BASE_STEP) {
            score += 400;
        }

        /* Reaching finish */
        if (new_step == FINISH_STEP) {
            score += 1000;
        }

        /* Moving into home stretch */
        if (step <= 50 && new_step > 50) {
            score += 250;
        }

        /* Track interactions */
        if (new_step <= 50) {
            int target_cell = (START_CELLS[player] + new_step) % TRACK_LENGTH;

            /* Safe cell bonus */
            if (is_safe_cell(target_cell)) {
                score += 150;
            } else {
                /* Check capture */
                for (int opp = 0; opp < g_game.num_players; opp++) {
                    if (opp == player || !g_game.players[opp].is_active) continue;
                    for (int ot = 0; ot < TOKENS_PER_PLAYER; ot++) {
                        int opp_step = g_game.players[opp].tokens[ot].step;
                        if (opp_step >= 0 && opp_step <= 50) {
                            int opp_cell = (START_CELLS[opp] + opp_step) % TRACK_LENGTH;
                            if (opp_cell == target_cell) {
                                score += 600; /* Big bonus for capture */
                            }
                        }
                    }
                }

                /* Check vulnerability at destination: are opponents 1..6 steps behind target_cell? */
                for (int opp = 0; opp < g_game.num_players; opp++) {
                    if (opp == player || !g_game.players[opp].is_active) continue;
                    for (int ot = 0; ot < TOKENS_PER_PLAYER; ot++) {
                        int opp_step = g_game.players[opp].tokens[ot].step;
                        if (opp_step >= 0 && opp_step <= 50) {
                            int opp_cell = (START_CELLS[opp] + opp_step) % TRACK_LENGTH;
                            int dist = (target_cell - opp_cell + TRACK_LENGTH) % TRACK_LENGTH;
                            if (dist >= 1 && dist <= 6) {
                                score -= 250; /* Vulnerable to opponent */
                            }
                        }
                    }
                }
            }

            /* Did this move escape danger from previous cell? */
            if (step >= 0 && step <= 50) {
                int old_cell = (START_CELLS[player] + step) % TRACK_LENGTH;
                if (!is_safe_cell(old_cell)) {
                    for (int opp = 0; opp < g_game.num_players; opp++) {
                        if (opp == player || !g_game.players[opp].is_active) continue;
                        for (int ot = 0; ot < TOKENS_PER_PLAYER; ot++) {
                            int opp_step = g_game.players[opp].tokens[ot].step;
                            if (opp_step >= 0 && opp_step <= 50) {
                                int opp_cell = (START_CELLS[opp] + opp_step) % TRACK_LENGTH;
                                int dist = (old_cell - opp_cell + TRACK_LENGTH) % TRACK_LENGTH;
                                if (dist >= 1 && dist <= 6) {
                                    score += 100; /* Escaped danger */
                                }
                            }
                        }
                    }
                }
            }
        }

        /* General progress bonus */
        score += new_step * 3;

        if (score > highest_score) {
            highest_score = score;
            best_token = t;
        }
    }

    return best_token;
}

const char* get_state_json(void) {
    char* buf = g_game.json_buffer;
    int offset = 0;

    offset += sprintf(buf + offset,
        "{"
        "\"num_players\":%d,"
        "\"current_player\":%d,"
        "\"phase\":%d,"
        "\"current_dice\":%d,"
        "\"consecutive_sixes\":%d,"
        "\"extra_turn\":%d,"
        "\"winner\":%d,"
        "\"players\":[",
        g_game.num_players,
        g_game.current_player,
        g_game.phase,
        g_game.current_dice,
        g_game.consecutive_sixes,
        g_game.extra_turn,
        g_game.winner
    );

    for (int p = 0; p < g_game.num_players; p++) {
        Player* pl = &g_game.players[p];
        offset += sprintf(buf + offset,
            "%s{"
            "\"id\":%d,"
            "\"is_active\":%d,"
            "\"is_bot\":%d,"
            "\"bot_difficulty\":%d,"
            "\"tokens_home\":%d,"
            "\"tokens\":[",
            (p > 0 ? "," : ""),
            pl->id,
            pl->is_active,
            pl->is_bot,
            pl->bot_difficulty,
            pl->tokens_home
        );

        for (int t = 0; t < TOKENS_PER_PLAYER; t++) {
            int step = pl->tokens[t].step;
            int global_cell = get_token_global_cell(p, t);
            offset += sprintf(buf + offset,
                "%s{\"step\":%d,\"global_cell\":%d}",
                (t > 0 ? "," : ""),
                step,
                global_cell
            );
        }

        offset += sprintf(buf + offset, "]}");
    }

    offset += sprintf(buf + offset, "]}");
    return buf;
}

int get_current_player(void) { return g_game.current_player; }
int get_game_phase(void) { return g_game.phase; }
int get_current_dice(void) { return g_game.current_dice; }

void set_dice_for_test(int dice) {
    if (dice >= 1 && dice <= 6) {
        g_game.current_dice = dice;
        if (dice == 6) {
            g_game.consecutive_sixes++;
            if (g_game.consecutive_sixes == 3) {
                next_player_turn();
                return;
            }
        } else {
            g_game.consecutive_sixes = 0;
        }

        int valid_tokens[TOKENS_PER_PLAYER];
        int count = get_valid_moves(g_game.current_player, dice, valid_tokens);
        if (count == 0) {
            next_player_turn();
        } else {
            g_game.phase = PHASE_WAITING_FOR_MOVE;
        }
    }
}

