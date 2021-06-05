package lahtinen.games.retro_crawl.monster

import lahtinen.games.retro_crawl.util.Utils

// TODO: Customizable chances for individual monsters
class MonsterFactory {
    private val lvl1Monsters = listOf(Monster.BIRD, Monster.SNAKE, Monster.WOLF)
    private val lvl2Monsters = listOf(Monster.GOBLIN, Monster.SKELETON, Monster.DEMON)
    private val monsterLevels = listOf(lvl1Monsters, lvl2Monsters)

    fun createRandomMonster(level: Int): Monster {
        return getMonsterForLevel(level)
    }

    private fun getMonsterForLevel(level: Int): Monster {
        val monsters = monsterLevels[level-1]
        return monsters[Utils.RANDOM.nextInt(monsters.size)]
    }
}
