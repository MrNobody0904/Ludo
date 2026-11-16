#ifndef LUDO_H
#define LUDO_H

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define KEEPALIVE EMSCRIPTEN_KEEPALIVE
#else
#define KEEPALIVE
#endif

#define MAX_PLAYERS 4
#define TOKENS_PER_PLAYER 4
#define TRACK_LENGTH 52
#define HOME_STRETCH_LENGTH 5
#define FINISH_STEP 56
#define BASE_STEP -1

/* Player colors */
#define PLAYER_RED 0
#define PLAYER_GREEN 1
#define PLAYER_YELLOW 2
#define PLAYER_BLUE 3

/* Bot Difficulties */
#define BOT_EASY 0
#define BOT_MEDIUM 1
#define BOT_HARD 2

/* Game Phase */
#define PHASE_WAITING_FOR_ROLL 0
#define PHASE_WAITING_FOR_MOVE 1
#define PHASE_GAME_OVER 2

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int step; /* -1 = base, 0..50 = main track, 51..55 = home stretch, 56 = finished */
} Token;

typedef struct {
    int id;
    int is_active;
    int is_bot;
    int bot_difficulty;
    Token tokens[TOKENS_PER_PLAYER];
    int tokens_home;
} Player;

typedef struct {
    int num_players;
    int current_player;
    int phase;              /* 0 = waiting roll, 1 = waiting move, 2 = game over */
    int current_dice;
    int consecutive_sixes;
    int extra_turn;         /* 1 if current player gets another turn */
    int winner;             /* -1 = none, 0..3 = player id */
    Player players[MAX_PLAYERS];
    char json_buffer[4096]; /* reusable buffer for get_state_json */
} GameState;

/* Core Engine API */
KEEPALIVE void init_game(int num_players);
KEEPALIVE void set_player_bot(int player, int is_bot, int difficulty);
KEEPALIVE int roll_dice(unsigned int seed);
KEEPALIVE int get_valid_moves(int player, int dice, int* out_valid_tokens);
KEEPALIVE int move_token(int player, int token_idx, int dice);
KEEPALIVE int check_winner(void);
KEEPALIVE const char* get_state_json(void);
KEEPALIVE int bot_choose_move(int player, int dice, int difficulty);

/* Helper queries & debug/testing */
KEEPALIVE void set_dice_for_test(int dice);
KEEPALIVE int get_token_global_cell(int player, int token_idx);
KEEPALIVE int is_safe_cell(int global_cell);
KEEPALIVE int get_current_player(void);
KEEPALIVE int get_game_phase(void);
KEEPALIVE int get_current_dice(void);

#ifdef __cplusplus
}
#endif

#endif /* LUDO_H */
