
import { writable } from "svelte/store";
import type { ICharacter } from "../../../lib/network/characters";

export const character = writable<ICharacter | undefined>();