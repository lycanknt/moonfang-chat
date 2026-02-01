# Moonfang Chat

Moonfang Chat is a personal Foundry VTT module targeting chat identity and speaker handling for Foundry VTT v13.
It is designed primarily for **drop-in / drop-out Adventurers League (D&D 5e)** style games, where a single Foundry World may be used by many different players over time.

To avoid creating a new Foundry user account per player — and to prevent excessive user and permission bloat — this module supports a shared **P1–P6 slot-based login model**, while keeping chat logs readable and consistent.


## Features  
*(Applies only to accounts named **P1, P2, P3, P4, P5, and P6**)*

- Snapshots player display names per chat message  
  *(so historical chat logs remain accurate even if players change later)*
- Always displays **Character Name** as the chat title, with **Player Display Name** as the subtitle  
  *(even when no token is present on the map)*
- Works without requiring tokens to be placed on the scene
- Designed to support frequent player rotation without reconfiguring users or permissions

## Requirements

- Foundry VTT **v13 or later**  
  *(v14 untested at the time of writing — looking forward to it since at this point of time, it seems like it has a fair bit of good features)*

## Installation

Install using the module manifest URL via Foundry’s **Install Module** interface.

## Intended Use

This module assumes a table setup where:
- Players log in using shared slot accounts (**P1–P6**)
- In the User Configuration
    - Each player sets their own display name (using the pronoun portion)
    - Each player chooses their active character
- Alternatively, a macro can be used for player to set the display name and active character (would be a better option if players are new to Foundry, from testing)

It is **not intended** as a general-purpose chat overhaul module.

## Support

This is a **personal project**, built primarily for my own Foundry VTT games.

It is shared in the spirit of open source, but **no ongoing support or troubleshooting is guaranteed**.  
Issues and pull requests may be reviewed at my discretion.

Use it, adapt it, and break it at your own risk.

## License

This project is released under the **MIT License**.

You are free to use, modify, and redistribute it, with attribution, in accordance with the license terms.
