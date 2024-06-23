package lahtinen.games.retro_crawl.events

import lahtinen.games.retro_crawl.CharacterAttributes
import lahtinen.games.retro_crawl.monster.Monster


data class PlayerEscaped(val successful: Boolean)
data class PlayerHit(val damage: Int)
data class MonsterHit(val damage: Int, val monster: Monster)
data class MonsterEncountered(val monster: Monster)
data class StoryExposition(val text: String)
data class MonsterDied(val monster: Monster)
data class PlayerLeveledUp(val level: Int, val attributes: CharacterAttributes)
class Move
class Fight
class PlayerDied
