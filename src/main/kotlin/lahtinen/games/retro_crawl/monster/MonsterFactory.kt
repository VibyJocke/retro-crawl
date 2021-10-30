package lahtinen.games.retro_crawl.monster

import lahtinen.games.retro_crawl.util.Utils

class MonsterFactory {
    private val lvl1Monsters = listOf(Monster.BIRD, Monster.SNAKE)
    private val lvl2Monsters = listOf(Monster.SNAKE, Monster.WOLF)
    private val lvl3Monsters = listOf(Monster.GOBLIN, Monster.SKELETON)
    private val lvl4Monsters = listOf(Monster.GOBLIN, Monster.SKELETON, Monster.DEMON)
    private val monsterLevels = listOf(lvl1Monsters, lvl2Monsters, lvl3Monsters, lvl4Monsters)

    fun createRandomMonster(level: Int): Monster {
        return getMonsterForLevel(level)
    }

    private fun getMonsterForLevel(level: Int): Monster {
        val monsters = monsterLevels[level-1]
        return monsters[Utils.RANDOM.nextInt(monsters.size)]
    }
}
