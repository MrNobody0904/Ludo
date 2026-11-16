#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include "ludo.h"

/* Helper to advance player 0's token while respecting turn rotations */
static void advance_p0_token(int token_idx, int steps) {
    while (steps > 0) {
        int roll = (steps > 5) ? 5 : steps;
        set_dice_for_test(roll);
        int ok = move_token(0, token_idx, roll);
        assert(ok == 1);
        steps -= roll;

        /* If turn passed to player 1, have player 1 roll 2 (no tokens out of base) to pass turn back */
        if (get_current_player() == 1 && get_game_phase() == PHASE_WAITING_FOR_ROLL) {
            set_dice_for_test(2);
            assert(get_current_player() == 0);
        }
    }
}

static void test_initialization(void) {
    printf("[TEST 1] Initialization...\n");
    init_game(4);
    assert(get_current_player() == 0);
    assert(get_game_phase() == PHASE_WAITING_FOR_ROLL);
    assert(check_winner() == -1);

    for (int p = 0; p < 4; p++) {
        for (int t = 0; t < 4; t++) {
            assert(get_token_global_cell(p, t) == -1); /* in base */
        }
    }
    printf("  -> PASSED: All 4 players initialized with 4 tokens in base.\n");
}

static void test_roll_and_base_exit(void) {
    printf("[TEST 2] Roll dice & Base exit with 6...\n");
    init_game(2);

    int valid_tokens[4];
    assert(get_valid_moves(0, 3, valid_tokens) == 0);

    /* Player 0 rolls 6 */
    set_dice_for_test(6);
    assert(get_game_phase() == PHASE_WAITING_FOR_MOVE);
    assert(get_valid_moves(0, 6, valid_tokens) == 4);

    /* Move token 0 out of base */
    int ok = move_token(0, 0, 6);
    assert(ok == 1);
    assert(get_token_global_cell(0, 0) == 0); /* Red start cell is 0 */
    /* Rolling 6 grants extra turn */
    assert(get_current_player() == 0);
    assert(get_game_phase() == PHASE_WAITING_FOR_ROLL);

    printf("  -> PASSED: Token moved to starting cell and extra turn granted.\n");
}

static void test_safe_cells_and_capture(void) {
    printf("[TEST 3] Safe cells & Capture mechanics...\n");

    /* Verify safe cells */
    assert(is_safe_cell(0) == 1);   /* Red start */
    assert(is_safe_cell(8) == 1);   /* Red safe star */
    assert(is_safe_cell(13) == 1);  /* Green start */
    assert(is_safe_cell(21) == 1);  /* Green safe star */
    assert(is_safe_cell(26) == 1);  /* Yellow start */
    assert(is_safe_cell(34) == 1);  /* Yellow safe star */
    assert(is_safe_cell(39) == 1);  /* Blue start */
    assert(is_safe_cell(47) == 1);  /* Blue safe star */
    assert(is_safe_cell(1) == 0);
    assert(is_safe_cell(14) == 0);

    init_game(2);

    /* Player 0: roll 6 -> bring token 0 to cell 0 */
    set_dice_for_test(6);
    move_token(0, 0, 6);
    assert(get_token_global_cell(0, 0) == 0);

    /* Player 0 rolls 5 -> cell 5 */
    set_dice_for_test(5);
    move_token(0, 0, 5);
    assert(get_token_global_cell(0, 0) == 5);
    assert(get_current_player() == 1);

    /* Player 1 rolls 2 -> passes back to Player 0 */
    set_dice_for_test(2);
    assert(get_current_player() == 0);

    /* Player 0 rolls 5 -> cell 10 */
    set_dice_for_test(5);
    move_token(0, 0, 5);
    assert(get_token_global_cell(0, 0) == 10);
    assert(get_current_player() == 1);

    /* Player 1 rolls 2 -> passes back to Player 0 */
    set_dice_for_test(2);
    assert(get_current_player() == 0);

    /* Player 0 rolls 4 -> cell 14 */
    set_dice_for_test(4);
    move_token(0, 0, 4);
    assert(get_token_global_cell(0, 0) == 14);
    assert(get_current_player() == 1);

    /* Player 1 rolls 6 -> brings token 0 out to Green start (cell 13) */
    set_dice_for_test(6);
    move_token(1, 0, 6);
    assert(get_token_global_cell(1, 0) == 13);
    assert(get_current_player() == 1);

    /* Player 1 rolls 1 -> moves to cell 14 (NOT safe) -> CAPTURE! */
    set_dice_for_test(1);
    move_token(1, 0, 1);
    assert(get_token_global_cell(1, 0) == 14);

    /* Player 0's token at cell 14 captured and reset to base (-1) */
    assert(get_token_global_cell(0, 0) == -1);

    /* Extra turn granted on capture */
    assert(get_current_player() == 1);
    assert(get_game_phase() == PHASE_WAITING_FOR_ROLL);

    printf("  -> PASSED: Opponent captured on unsafe cell and sent back to base with extra turn.\n");
}

static void test_exact_finish(void) {
    printf("[TEST 4] Exact finish rule...\n");
    init_game(2);

    /* Bring token 0 out to step 0 */
    set_dice_for_test(6);
    move_token(0, 0, 6);
    assert(get_token_global_cell(0, 0) == 0);

    /* Advance token 0 by 54 steps -> reaches step 54 */
    advance_p0_token(0, 54);

    /* At step 54:
       Total finish is at 56.
       Roll 3 -> 54 + 3 = 57 > 56 -> Overshoot! 0 valid moves!
    */
    int valid[4];
    assert(get_valid_moves(0, 3, valid) == 0);

    /* Roll 2 -> 54 + 2 = 56 -> Exact finish! Valid! */
    assert(get_valid_moves(0, 2, valid) == 1);
    assert(valid[0] == 0);

    /* Execute the finish move */
    set_dice_for_test(2);
    int ok = move_token(0, 0, 2);
    assert(ok == 1);
    assert(get_token_global_cell(0, 0) == 999); /* Finished */
    assert(get_current_player() == 0); /* Extra turn on finishing token */

    printf("  -> PASSED: Overshoot prevented; exact roll of 2 finished token.\n");
}

static void test_triple_six(void) {
    printf("[TEST 5] Triple six penalty...\n");
    init_game(2);

    /* Roll 1: six -> bring token 0 to step 0 */
    set_dice_for_test(6);
    move_token(0, 0, 6);
    assert(get_current_player() == 0);

    /* Roll 2: six -> advance token 0 to step 6 */
    set_dice_for_test(6);
    move_token(0, 0, 6);
    assert(get_current_player() == 0);

    /* Roll 3: six in a row! Must forfeit turn immediately to player 1 */
    set_dice_for_test(6);
    assert(get_current_player() == 1);
    assert(get_game_phase() == PHASE_WAITING_FOR_ROLL);

    printf("  -> PASSED: Triple six forfeited turn to next player.\n");
}

static void test_win_condition(void) {
    printf("[TEST 6] Win condition...\n");
    init_game(2);
    assert(check_winner() == -1);

    /* Finish all 4 tokens for player 0 */
    for (int t = 0; t < 4; t++) {
        set_dice_for_test(6);
        move_token(0, t, 6); /* out of base to step 0 */
        advance_p0_token(t, 54);
        set_dice_for_test(2); /* 54 + 2 = 56 finish */
        move_token(0, t, 2);
    }

    assert(check_winner() == 0);
    assert(get_game_phase() == PHASE_GAME_OVER);

    const char* json = get_state_json();
    assert(strstr(json, "\"winner\":0") != NULL);
    assert(strstr(json, "\"tokens_home\":4") != NULL);

    printf("  -> PASSED: Player with 4 tokens home declared winner and phase set to GAME_OVER.\n");
}

static void test_bot_ai(void) {
    printf("[TEST 7] Bot AI decision engine (Easy, Medium, Hard)...\n");
    init_game(2);
    set_player_bot(1, 1, BOT_HARD);

    int move = bot_choose_move(1, 6, BOT_HARD);
    assert(move >= 0 && move < 4);

    move = bot_choose_move(1, 6, BOT_MEDIUM);
    assert(move >= 0 && move < 4);

    move = bot_choose_move(1, 6, BOT_EASY);
    assert(move >= 0 && move < 4);

    printf("  -> PASSED: Bot AI successfully selects valid moves across all difficulties.\n");
}

int main(void) {
    printf("=====================================================\n");
    printf("         LUDO C ENGINE UNIT TEST SUITE               \n");
    printf("=====================================================\n");

    test_initialization();
    test_roll_and_base_exit();
    test_safe_cells_and_capture();
    test_exact_finish();
    test_triple_six();
    test_win_condition();
    test_bot_ai();

    printf("=====================================================\n");
    printf("   SUCCESS: ALL 7 TEST SUITES PASSED FLAWLESSLY!    \n");
    printf("=====================================================\n");
    return 0;
}
