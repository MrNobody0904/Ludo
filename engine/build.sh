#!/usr/bin/env bash
set -e

echo "Compiling Ludo C engine to WebAssembly with Emscripten..."

emcc ludo.c -O3 \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]' \
  -s EXPORTED_FUNCTIONS='["_init_game","_set_player_bot","_roll_dice","_get_valid_moves","_move_token","_check_winner","_get_state_json","_bot_choose_move","_get_token_global_cell","_is_safe_cell","_get_current_player","_get_game_phase","_get_current_dice","_set_dice_for_test","_malloc","_free"]' \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='createLudoModule' \
  -o ludo.js

echo "Build complete: ludo.js and ludo.wasm generated successfully!"
